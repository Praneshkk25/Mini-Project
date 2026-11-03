import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
from app.database import get_db_connection
from app.services.discharge_readiness_service import DischargeReadinessService

router = APIRouter(prefix="/api/discharge", tags=["Intelligent Discharge Readiness & Summary Workflow"])

class PillarUpdateRequest(BaseModel):
    pillar: str  # 'clinical_stability', 'lab_clearance', 'pharmacy_prep', 'billing_clearance', 'doctor_decision'
    value: str

class DischargeApprovalRequest(BaseModel):
    patient_id: str
    doctor_name: str
    primary_diagnosis: str
    discharge_meds: Optional[str] = ""
    home_instructions: Optional[str] = ""

class DraftDischargeSummaryRequest(BaseModel):
    patient_id: str
    patient_name: str
    uhid: Optional[str] = ""
    age: Optional[int] = 45
    gender: Optional[str] = "Female"
    bed_number: Optional[str] = "ICU-02"
    department: Optional[str] = "Cardiology"
    doctor_id: Optional[str] = "DOC-CAR-101"
    doctor_name: str
    admission_date: Optional[str] = ""
    discharge_date: Optional[str] = ""
    chief_complaint: Optional[str] = ""
    primary_diagnosis: Optional[str] = ""
    secondary_diagnosis: Optional[str] = ""
    hospital_course: Optional[str] = ""
    condition_at_discharge: Optional[str] = "Stable"
    vitals: Optional[Dict[str, Any]] = None
    investigations: Optional[List[Dict[str, Any]]] = None
    procedures: Optional[List[str]] = None
    medications: Optional[List[Dict[str, Any]]] = None
    diet_lifestyle_instructions: Optional[str] = ""
    follow_up_date: Optional[str] = ""
    follow_up_dept: Optional[str] = ""
    receptionist_notes: Optional[str] = ""
    created_by_name: Optional[str] = "Elena Rostova"

class DoctorEditDischargeSummaryRequest(BaseModel):
    primary_diagnosis: Optional[str] = None
    secondary_diagnosis: Optional[str] = None
    hospital_course: Optional[str] = None
    condition_at_discharge: Optional[str] = None
    medications: Optional[List[Dict[str, Any]]] = None  # Doctor adds prescribing
    diet_lifestyle_instructions: Optional[str] = None
    follow_up_date: Optional[str] = None
    follow_up_dept: Optional[str] = None
    doctor_notes: Optional[str] = None

class DoctorApproveSummaryRequest(BaseModel):
    doctor_name: str
    doctor_notes: Optional[str] = ""

@router.get("/readiness")
def get_all_readiness():
    """Returns discharge readiness summary for all inpatients."""
    return DischargeReadinessService.list_all_inpatient_readiness()

@router.get("/readiness/{patient_id}")
def get_patient_readiness(patient_id: str):
    """Calculates live discharge readiness score, stability, and preparation ETA for a patient."""
    res = DischargeReadinessService.get_readiness(patient_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("/readiness/{patient_id}/update-pillar")
def update_readiness_pillar(patient_id: str, req: PillarUpdateRequest):
    """Updates one of the operational clearance pillars (lab, pharmacy, billing, stability)."""
    try:
        updated = DischargeReadinessService.update_pillar(patient_id, req.pillar, req.value)
        return {"message": f"Pillar '{req.pillar}' updated to '{req.value}' successfully.", "readiness": updated}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/approve-signoff")
def approve_discharge_signoff(req: DischargeApprovalRequest):
    """
    Physician electronic discharge sign-off.
    Verifies readiness score and auto-enrolls patient into Module 3 (Post-Discharge Remote RPM).
    """
    readiness = DischargeReadinessService.get_readiness(req.patient_id)
    DischargeReadinessService.update_pillar(req.patient_id, "doctor_decision", "Clinically_Approved")

    from app.services.post_discharge_service import PostDischargeService
    schedule = PostDischargeService.enroll_patient(req.patient_id, doctor_name=req.doctor_name)

    return {
        "message": f"Patient {req.patient_id} electronically approved for discharge.",
        "readiness_score": readiness.get("readiness_score"),
        "doctor_decision": "Clinically_Approved",
        "remote_rpm_enrolled": True,
        "remote_milestones": schedule
    }

# ─────────────────────────────────────────────────────────────
# TWO-WAY RECEPTIONIST & DOCTOR DISCHARGE SUMMARY WORKFLOW
# ─────────────────────────────────────────────────────────────

@router.post("/summary/draft")
def draft_discharge_summary(req: DraftDischargeSummaryRequest):
    """
    Step 1: Receptionist drafts initial discharge summary, selects/types patient,
    and forwards to the designated attending doctor.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    summary_id = f"DS-2026-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now().isoformat()

    # Fallback default dates if omitted
    adm_date = req.admission_date or datetime.now().strftime("%Y-%m-%d")
    dis_date = req.discharge_date or datetime.now().strftime("%Y-%m-%d")

    vitals_str = json.dumps(req.vitals or {
        "pulse": 72, "bp": "120/80", "spo2": 98, "temp": 36.8, "respRate": 16
    })
    inv_str = json.dumps(req.investigations or [])
    proc_str = json.dumps(req.procedures or [])
    meds_str = json.dumps(req.medications or [])

    cursor.execute("""
    INSERT INTO discharge_summaries (
        summary_id, patient_id, patient_name, uhid, age, gender, bed_number, department,
        doctor_id, doctor_name, admission_date, discharge_date, chief_complaint,
        primary_diagnosis, secondary_diagnosis, hospital_course, condition_at_discharge,
        vitals_json, investigations_json, procedures_json, medications_json,
        diet_lifestyle_instructions, follow_up_date, follow_up_dept, receptionist_notes,
        doctor_notes, status, created_by_role, created_by_name, created_at, updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, 'PENDING_DOCTOR_REVIEW', 'RECEPTIONIST', ?, ?, ?
    )
    """, (
        summary_id, req.patient_id, req.patient_name, req.uhid, req.age, req.gender,
        req.bed_number, req.department, req.doctor_id, req.doctor_name,
        adm_date, dis_date, req.chief_complaint,
        req.primary_diagnosis, req.secondary_diagnosis, req.hospital_course, req.condition_at_discharge,
        vitals_str, inv_str, proc_str, meds_str,
        req.diet_lifestyle_instructions, req.follow_up_date, req.follow_up_dept,
        req.receptionist_notes or "Drafted by Reception Desk. Sent for Attending Doctor Review.",
        "", req.created_by_name or "Reception Desk", now_str, now_str
    ))

    # Create audit log & notification
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, 'receptionist', 'DRAFT_DISCHARGE_SUMMARY', 'DISCHARGE', ?, ?, ?)
    """, (
        f"LOG-{uuid.uuid4().hex[:6].upper()}",
        req.created_by_name or "Elena Rostova",
        summary_id,
        f"Forwarded discharge summary for {req.patient_name} to {req.doctor_name}",
        now_str
    ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "summary_id": summary_id,
        "patient_name": req.patient_name,
        "doctor_name": req.doctor_name,
        "status": "PENDING_DOCTOR_REVIEW",
        "message": f"Discharge summary forwarded successfully to {req.doctor_name} for clinical review and prescriptions."
    }

@router.get("/summary/list")
def list_discharge_summaries(
    doctor_name: Optional[str] = None,
    patient_id: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Returns list of discharge summaries, supporting filter by attending doctor or status.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM discharge_summaries WHERE 1=1"
    params = []

    if doctor_name:
        query += " AND doctor_name LIKE ?"
        params.append(f"%{doctor_name}%")
    if patient_id:
        query += " AND patient_id = ?"
        params.append(patient_id)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        d = dict(r)
        # Parse JSON fields safely
        try:
            d["vitals"] = json.loads(d.get("vitals_json") or "{}")
        except Exception:
            d["vitals"] = {}
        try:
            d["investigations"] = json.loads(d.get("investigations_json") or "[]")
        except Exception:
            d["investigations"] = []
        try:
            d["procedures"] = json.loads(d.get("procedures_json") or "[]")
        except Exception:
            d["procedures"] = []
        try:
            d["medications"] = json.loads(d.get("medications_json") or "[]")
        except Exception:
            d["medications"] = []
        results.append(d)

    return results

@router.get("/summary/{summary_id}")
def get_discharge_summary(summary_id: str):
    """Retrieves full details of a specific discharge summary."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM discharge_summaries WHERE summary_id = ?", (summary_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Discharge summary not found")

    d = dict(row)
    for field, default in [("vitals_json", {}), ("investigations_json", []), ("procedures_json", []), ("medications_json", [])]:
        try:
            d[field.replace("_json", "")] = json.loads(d.get(field) or "null") or default
        except Exception:
            d[field.replace("_json", "")] = default

    return d

@router.put("/summary/{summary_id}/doctor-edit")
def doctor_edit_discharge_summary(summary_id: str, req: DoctorEditDischargeSummaryRequest):
    """
    Step 2: Attending Doctor opens summary, edits clinical diagnoses,
    and adds/edits prescriptions & discharge medication instructions.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()

    cursor.execute("SELECT * FROM discharge_summaries WHERE summary_id = ?", (summary_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Discharge summary not found")

    updates = []
    params = []

    if req.primary_diagnosis is not None:
        updates.append("primary_diagnosis = ?")
        params.append(req.primary_diagnosis)
    if req.secondary_diagnosis is not None:
        updates.append("secondary_diagnosis = ?")
        params.append(req.secondary_diagnosis)
    if req.hospital_course is not None:
        updates.append("hospital_course = ?")
        params.append(req.hospital_course)
    if req.condition_at_discharge is not None:
        updates.append("condition_at_discharge = ?")
        params.append(req.condition_at_discharge)
    if req.medications is not None:
        updates.append("medications_json = ?")
        params.append(json.dumps(req.medications))
    if req.diet_lifestyle_instructions is not None:
        updates.append("diet_lifestyle_instructions = ?")
        params.append(req.diet_lifestyle_instructions)
    if req.follow_up_date is not None:
        updates.append("follow_up_date = ?")
        params.append(req.follow_up_date)
    if req.follow_up_dept is not None:
        updates.append("follow_up_dept = ?")
        params.append(req.follow_up_dept)
    if req.doctor_notes is not None:
        updates.append("doctor_notes = ?")
        params.append(req.doctor_notes)

    updates.append("updated_at = ?")
    params.append(now_str)
    params.append(summary_id)

    cursor.execute(f"UPDATE discharge_summaries SET {', '.join(updates)} WHERE summary_id = ?", params)
    conn.commit()
    conn.close()

    return {"success": True, "medications_count": len(req.medications) if req.medications is not None else 0, "message": "Discharge summary and prescriptions updated by physician."}

@router.post("/summary/{summary_id}/doctor-approve")
def doctor_approve_discharge_summary(summary_id: str, req: DoctorApproveSummaryRequest):
    """
    Step 3: Attending Doctor signs and clinically authorizes the discharge summary.
    Status transitions to APPROVED_BY_DOCTOR, updates bed inventory to CLEANING,
    and automatically enrolls patient into Module 3 AI Remote RPM.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()

    cursor.execute("SELECT * FROM discharge_summaries WHERE summary_id = ?", (summary_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Discharge summary not found")

    pt_id = row["patient_id"]
    bed_num = row["bed_number"]

    cursor.execute("""
    UPDATE discharge_summaries
    SET status = 'APPROVED_BY_DOCTOR',
        signed_by_doctor = ?,
        signed_at = ?,
        doctor_notes = COALESCE(?, doctor_notes),
        updated_at = ?
    WHERE summary_id = ?
    """, (req.doctor_name, now_str, req.doctor_notes, now_str, summary_id))

    # Transition bed to Cleaning
    if bed_num:
        cursor.execute("UPDATE beds SET status = 'Cleaning', patient_id = NULL WHERE bed_number = ?", (bed_num,))

    # Update admission status
    cursor.execute("""
    UPDATE admissions
    SET status = 'Discharged', discharged_at = ?
    WHERE patient_id = ? AND status = 'Active'
    """, (now_str, pt_id))

    conn.commit()
    conn.close()

    # Auto-enroll in Module 3 Post-Discharge Remote RPM
    from app.services.post_discharge_service import PostDischargeService
    schedule = PostDischargeService.enroll_patient(pt_id, doctor_name=req.doctor_name)

    return {
        "success": True,
        "summary_id": summary_id,
        "patient_id": pt_id,
        "status": "APPROVED_BY_DOCTOR",
        "signed_by": req.doctor_name,
        "signed_at": now_str,
        "remote_care_enrolled": True,
        "milestones_count": len(schedule),
        "message": f"Discharge summary approved and electronically signed by {req.doctor_name}."
    }
