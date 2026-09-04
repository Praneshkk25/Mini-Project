import uuid
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

from app.database import get_db_connection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/consultations", tags=["Doctor Consultation & Clinical Decision"])

# ---------------------------------------------------------------------------
# Pydantic Request Models
# ---------------------------------------------------------------------------

class ConfirmSummaryRequest(BaseModel):
    session_id: str
    doctor_name: str
    edited_summary: Dict[str, Any]

class CreateConsultationRequest(BaseModel):
    visit_id: str
    patient_id: str
    doctor_name: str
    department: str
    clinical_impression: str
    physical_examination: Optional[str] = "Normal S1/S2, Chest clear bilaterally"
    outcome: str = "Outpatient_Prescription" # 'Outpatient_Prescription', 'Admit_Inpatient', 'Referral'

class PrescriptionItemInput(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration_days: int
    quantity: int

class CreatePrescriptionRequest(BaseModel):
    consultation_id: Optional[str] = None
    visit_id: str
    patient_id: str
    doctor_name: str
    instructions: Optional[str] = "Take after meals. Follow up if symptoms persist."
    items: List[PrescriptionItemInput]

class OrderInvestigationRequest(BaseModel):
    visit_id: str
    patient_id: str
    doctor_name: str
    test_name: str
    priority: str = "Routine" # 'Routine', 'STAT_Urgent'
    notes: Optional[str] = None

class AdmitPatientRequest(BaseModel):
    visit_id: str
    patient_id: str
    bed_number: str
    ward_type: str
    attending_doctor: str
    admission_notes: Optional[str] = None

# ---------------------------------------------------------------------------
# Consultation Routes
# ---------------------------------------------------------------------------

@router.get("/queue")
def get_doctor_opd_queue(doctor_name: Optional[str] = None, department: Optional[str] = None):
    """Returns today's active patient consultation queue with MediKiosk intake summary status."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT q.*, s.session_id, s.chief_complaint, s.is_emergency, s.red_flags, s.status as intake_status, s.consultation_category
    FROM opd_queue q
    LEFT JOIN visits v ON q.visit_id = v.visit_id
    LEFT JOIN intake_sessions s ON q.visit_id = s.visit_id
    WHERE q.status IN ('Waiting', 'In-Consultation')
    """
    params = []
    if department:
        query += " AND q.department = ?"
        params.append(department)
        
    query += " ORDER BY CASE q.priority WHEN 'Immediate' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, q.check_in_time ASC"
    cursor.execute(query, params)
    
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {
        "total_waiting": len(rows),
        "queue": rows
    }

@router.get("/patient/{patient_id}")
def get_patient_clinical_chart(patient_id: str):
    """Retrieves full centralized patient chart: demographics, active intake draft, timeline, vitals, prescriptions, and history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Master Demographics
    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Patient with ID {patient_id} not found.")
        
    # 2. Latest / Active MediKiosk Intake Session
    cursor.execute("""
    SELECT * FROM intake_sessions WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
    """, (patient_id,))
    intake = cursor.fetchone()
    intake_data = dict(intake) if intake else None
    if intake_data and intake_data.get("ai_summary_draft"):
        try:
            intake_data["ai_summary_draft"] = json.loads(intake_data["ai_summary_draft"])
        except Exception:
            pass
            
    # 3. Medical Documents & Timeline
    cursor.execute("""
    SELECT * FROM patient_documents WHERE patient_id = ? ORDER BY timeline_year ASC, uploaded_at ASC
    """, (patient_id,))
    docs = []
    for d in cursor.fetchall():
        d_dict = dict(d)
        if d_dict.get("extracted_data_json"):
            try:
                d_dict["extracted_data_json"] = json.loads(d_dict["extracted_data_json"])
            except Exception:
                pass
        docs.append(d_dict)
        
    # 4. Past Consultations
    cursor.execute("""
    SELECT * FROM consultations WHERE patient_id = ? ORDER BY created_at DESC
    """, (patient_id,))
    consultations_list = [dict(c) for c in cursor.fetchall()]
    
    # 5. Active & Past Prescriptions
    cursor.execute("""
    SELECT p.*, GROUP_CONCAT(i.medicine_name || ' (' || i.dosage || ' - ' || i.frequency || ')', ', ') as items_summary
    FROM prescriptions p
    LEFT JOIN prescription_items i ON p.prescription_id = i.prescription_id
    WHERE p.patient_id = ?
    GROUP BY p.prescription_id
    ORDER BY p.created_at DESC
    """, (patient_id,))
    prescriptions_list = [dict(p) for p in cursor.fetchall()]
    
    # 6. Ordered Investigations
    cursor.execute("""
    SELECT * FROM investigations WHERE patient_id = ? ORDER BY created_at DESC
    """, (patient_id,))
    investigations_list = [dict(i) for i in cursor.fetchall()]
    
    # 7. Bed Admission Status
    cursor.execute("""
    SELECT * FROM admissions WHERE patient_id = ? AND status = 'Active' LIMIT 1
    """, (patient_id,))
    active_admission = cursor.fetchone()
    
    conn.close()
    
    return {
        "patient": dict(patient),
        "active_intake_session": intake_data,
        "document_timeline": docs,
        "consultations": consultations_list,
        "prescriptions": prescriptions_list,
        "investigations": investigations_list,
        "active_admission": dict(active_admission) if active_admission else None
    }

@router.post("/summary/confirm")
def confirm_ai_summary(req: ConfirmSummaryRequest):
    """Allows attending doctor to review, edit, and confirm the AI-generated clinical summary."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now_str = datetime.now().isoformat()
    edited_json = json.dumps(req.edited_summary)
    
    cursor.execute("""
    UPDATE intake_sessions 
    SET doctor_edited_summary = ?, confirmed_by_doctor = ?, confirmed_at = ?, status = 'CONFIRMED'
    WHERE session_id = ?
    """, (edited_json, req.doctor_name, now_str, req.session_id))
    
    # Audit log
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, req.doctor_name, "DOCTOR", "DOCTOR_EDIT", "INTAKE_SESSION", req.session_id, f"Dr. {req.doctor_name} reviewed and confirmed clinical summary", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "message": "AI summary confirmed by physician successfully",
        "session_id": req.session_id,
        "confirmed_by_doctor": req.doctor_name,
        "confirmed_at": now_str
    }

@router.post("/create")
def create_consultation(req: CreateConsultationRequest):
    """Records doctor's clinical findings, physical examination, and outcome decision."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    consultation_id = f"CON-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
    INSERT INTO consultations (consultation_id, visit_id, patient_id, doctor_name, department, clinical_impression, physical_examination, outcome, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (consultation_id, req.visit_id, req.patient_id, req.doctor_name, req.department, req.clinical_impression, req.physical_examination, req.outcome, now_str))
    
    # Update visit status
    cursor.execute("UPDATE visits SET status = 'Completed' WHERE visit_id = ?", (req.visit_id,))
    cursor.execute("UPDATE opd_queue SET status = 'Completed', check_out_time = ? WHERE visit_id = ?", (now_str, req.visit_id))
    
    # Audit log
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, req.doctor_name, "DOCTOR", "CONSULTATION", "CONSULTATION", consultation_id, f"Completed consultation for patient {req.patient_id} (Outcome: {req.outcome})", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "consultation_id": consultation_id,
        "visit_id": req.visit_id,
        "patient_id": req.patient_id,
        "doctor_name": req.doctor_name,
        "outcome": req.outcome,
        "created_at": now_str
    }

@router.post("/prescribe")
def create_prescription(req: CreatePrescriptionRequest):
    """Generates electronic prescription and sends directly to Pharmacy queue."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    prescription_id = f"RX-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
    INSERT INTO prescriptions (prescription_id, consultation_id, visit_id, patient_id, doctor_name, instructions, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending_Dispensation', ?)
    """, (prescription_id, req.consultation_id, req.visit_id, req.patient_id, req.doctor_name, req.instructions, now_str))
    
    for item in req.items:
        cursor.execute("""
        INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration_days, quantity, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        """, (prescription_id, item.medicine_name, item.dosage, item.frequency, item.duration_days, item.quantity))
        
    # Audit log
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, req.doctor_name, "DOCTOR", "PRESCRIBE", "PRESCRIPTION", prescription_id, f"Prescribed {len(req.items)} medications for patient {req.patient_id}", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "message": "Prescription generated and sent to pharmacy successfully",
        "prescription_id": prescription_id,
        "items_count": len(req.items),
        "status": "Pending_Dispensation",
        "created_at": now_str
    }

@router.post("/order-investigation")
def order_investigation(req: OrderInvestigationRequest):
    """Orders diagnostic laboratory / radiology test for the patient."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    inv_id = f"LAB-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
    INSERT INTO investigations (investigation_id, visit_id, patient_id, doctor_name, test_name, priority, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ORDERED', ?)
    """, (inv_id, req.visit_id, req.patient_id, req.doctor_name, req.test_name, req.priority, req.notes, now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "investigation_id": inv_id,
        "test_name": req.test_name,
        "priority": req.priority,
        "status": "ORDERED",
        "created_at": now_str
    }

@router.post("/admit")
def admit_inpatient(req: AdmitPatientRequest):
    """Admits patient to an inpatient bed and updates occupancy status."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check bed availability
    cursor.execute("SELECT status FROM beds WHERE bed_number = ?", (req.bed_number,))
    bed = cursor.fetchone()
    if not bed:
        conn.close()
        raise HTTPException(status_code=404, detail="Bed number not found.")
    if bed["status"] == "Occupied":
        conn.close()
        raise HTTPException(status_code=400, detail=f"Bed {req.bed_number} is already occupied.")
        
    admission_id = f"ADM-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now().isoformat()
    
    # 1. Create Admission Record
    cursor.execute("""
    INSERT INTO admissions (admission_id, visit_id, patient_id, bed_number, ward_type, attending_doctor, admitted_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')
    """, (admission_id, req.visit_id, req.patient_id, req.bed_number, req.ward_type, req.attending_doctor, now_str))
    
    # 2. Update Bed status to Occupied
    cursor.execute("""
    SELECT name, age, gender FROM patients WHERE patient_id = ?
    """, (req.patient_id,))
    pt = cursor.fetchone()
    
    cursor.execute("""
    UPDATE beds 
    SET status = 'Occupied', patient_id = ?, patient_name = ?, patient_age = ?, patient_gender = ?, admission_date = ?
    WHERE bed_number = ?
    """, (req.patient_id, pt["name"] if pt else "Patient", pt["age"] if pt else 50, pt["gender"] if pt else "Other", now_str, req.bed_number))
    
    # 3. Update Visit status
    cursor.execute("UPDATE visits SET status = 'Admitted' WHERE visit_id = ?", (req.visit_id,))
    
    # 4. Audit Log
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, req.attending_doctor, "DOCTOR", "ADMIT", "BED", req.bed_number, f"Admitted patient {req.patient_id} to {req.ward_type} Bed {req.bed_number}", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "message": "Patient admitted successfully",
        "admission_id": admission_id,
        "bed_number": req.bed_number,
        "ward_type": req.ward_type,
        "status": "Occupied",
        "admitted_at": now_str
    }
