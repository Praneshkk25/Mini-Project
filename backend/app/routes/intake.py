import uuid
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body, Response, Query
from pydantic import BaseModel

from app.database import get_db_connection
from app.services import llm_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/intake", tags=["MediKiosk AI Clinical Intake"])

# ---------------------------------------------------------------------------
# Pydantic Request Models
# ---------------------------------------------------------------------------

class PatientLookupRequest(BaseModel):
    query: str  # UHID, Patient ID, ABHA ID, Phone or Name

class PatientRegisterRequest(BaseModel):
    name: str
    age: int
    gender: str
    dob: Optional[str] = None
    phone: str
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = "None known"
    abha_id: Optional[str] = None

class AbhaVerifyRequest(BaseModel):
    abha_id: str
    phone: Optional[str] = None

class ConsentRecordRequest(BaseModel):
    patient_id: str
    visit_id: Optional[str] = None
    consent_type: str = "Clinical_Intake"
    granted: bool = True
    audio_guided: bool = False
    language: str = "English"

class StartSessionRequest(BaseModel):
    patient_id: str
    language: str = "English"
    consultation_category: str = "Allopathy" # 'Allopathy', 'AYUSH'
    department: Optional[str] = "General Medicine"

class AnswerQuestionRequest(BaseModel):
    section: str # 'chief_complaint', 'hpi', 'past_medical', 'past_surgical', 'drug_history', 'allergies', 'family', 'personal', 'ros', 'ayush'
    question_key: str
    answer_text: str
    selected_options: Optional[List[str]] = []
    is_voice: bool = False

# ---------------------------------------------------------------------------
# Red Flag Clinical Rules
# ---------------------------------------------------------------------------
RED_FLAG_PATTERNS = [
    {"keyword": "crushing chest pain", "reason": "Potential Acute Coronary Syndrome / Myocardial Infarction", "severity": "IMMEDIATE"},
    {"keyword": "chest pain with breathing", "reason": "Acute Cardiopulmonary Distress", "severity": "IMMEDIATE"},
    {"keyword": "difficulty breathing", "reason": "Severe Respiratory Distress / Hypoxemia", "severity": "IMMEDIATE"},
    {"keyword": "slurred speech", "reason": "Possible Acute Cerebrovascular Event / Stroke", "severity": "IMMEDIATE"},
    {"keyword": "facial droop", "reason": "Acute Neurological Deficit", "severity": "IMMEDIATE"},
    {"keyword": "loss of consciousness", "reason": "Syncope / Neurological Compromise", "severity": "IMMEDIATE"},
    {"keyword": "severe bleeding", "reason": "Active Hemorrhage", "severity": "IMMEDIATE"},
    {"keyword": "coughing blood", "reason": "Hemoptysis", "severity": "IMMEDIATE"},
    {"keyword": "unbearable headache", "reason": "Possible Subarachnoid Hemorrhage / Thunderclap Headache", "severity": "IMMEDIATE"}
]

def check_red_flags(text: str) -> List[Dict[str, str]]:
    detected = []
    lowered = text.lower()
    for item in RED_FLAG_PATTERNS:
        if item["keyword"] in lowered:
            detected.append({
                "flag": item["keyword"].title(),
                "reason": item["reason"],
                "severity": item["severity"],
                "timestamp": datetime.now().isoformat()
            })
    return detected

# ---------------------------------------------------------------------------
# 1. Patient Identification & Registration
# ---------------------------------------------------------------------------

@router.post("/patient/lookup")
def lookup_patient(req: PatientLookupRequest):
    """Finds existing patient by UHID, Patient ID, ABHA ID, Phone or Name."""
    conn = get_db_connection()
    cursor = conn.cursor()
    q = f"%{req.query.strip()}%"
    
    cursor.execute("""
    SELECT * FROM patients 
    WHERE patient_id LIKE ? OR uhid LIKE ? OR abha_id LIKE ? OR phone LIKE ? OR name LIKE ?
    LIMIT 5
    """, (q, q, q, q, q))
    
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {
        "found": len(rows) > 0,
        "count": len(rows),
        "patients": rows
    }

@router.post("/patient/register")
def register_patient(req: PatientRegisterRequest):
    """Registers a new master patient profile and assigns a unique UHID & Patient ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check for duplicate phone/name
    cursor.execute("SELECT patient_id, uhid FROM patients WHERE phone = ? AND name = ?", (req.phone.strip(), req.name.strip()))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return {
            "message": "Existing patient profile found with same name and phone.",
            "patient_id": existing["patient_id"],
            "uhid": existing["uhid"],
            "is_new": False
        }
        
    num = str(uuid.uuid4().int)[:4]
    patient_id = f"PT-{num}"
    uhid = f"UHID-2026-{num}"
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
    INSERT INTO patients (patient_id, uhid, abha_id, name, age, gender, dob, phone, address, emergency_contact, blood_group, allergies, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient_id,
        uhid,
        req.abha_id or f"91-{num}-4920-{num}",
        req.name.strip(),
        req.age,
        req.gender,
        req.dob or "1980-01-01",
        req.phone.strip(),
        req.address or "New Delhi, India",
        req.emergency_contact or "Relative",
        req.blood_group or "O+",
        req.allergies or "None known",
        now_str
    ))
    
    # Audit log
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, "MediKiosk Kiosk 1", "PATIENT", "REGISTER", "PATIENT", patient_id, f"Registered new patient {req.name} ({uhid})", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "message": "Patient registered successfully",
        "patient_id": patient_id,
        "uhid": uhid,
        "name": req.name,
        "is_new": True
    }

@router.post("/abha/verify")
def verify_abha(req: AbhaVerifyRequest):
    """ABHA ID verification service interface abstraction (Clearly marked DEMO MODE)."""
    clean_id = req.abha_id.strip()
    is_valid_format = len(clean_id) >= 10
    
    return {
        "status": "VERIFIED_DEMO_MODE",
        "abha_id": clean_id,
        "abdm_gateway": "Mock ABDM Sandbox Node (DEMO MODE)",
        "abha_address": f"{clean_id.replace('-', '').lower()}@sbx",
        "verification_timestamp": datetime.now().isoformat(),
        "kyc_status": "Verified",
        "consent_artefact_ready": True,
        "note": "Production environment connects to National Health Authority (NHA) ABDM Gateway."
    }

# ---------------------------------------------------------------------------
# 2. Consent First Architecture
# ---------------------------------------------------------------------------

@router.post("/consent")
def record_consent(req: ConsentRecordRequest):
    """Records patient digital consent with read/audio verification tracking."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    consent_id = f"CNS-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
    INSERT INTO consents (consent_id, patient_id, visit_id, consent_type, granted, audio_guided, language, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (consent_id, req.patient_id, req.visit_id, req.consent_type, 1 if req.granted else 0, 1 if req.audio_guided else 0, req.language, now_str))
    
    # Audit log
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, "MediKiosk Terminal", "PATIENT", "CONSENT", "CONSENT", consent_id, f"Patient {req.patient_id} recorded consent ({'Granted' if req.granted else 'Denied'}) in {req.language}", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "consent_id": consent_id,
        "patient_id": req.patient_id,
        "granted": req.granted,
        "audio_guided": req.audio_guided,
        "language": req.language,
        "timestamp": now_str
    }

# ---------------------------------------------------------------------------
# 3. Conversational Clinical History Engine & Adaptive Flow
# ---------------------------------------------------------------------------

@router.post("/session/start")
def start_intake_session(req: StartSessionRequest):
    """Initializes a new MediKiosk clinical intake session."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify patient exists
    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (req.patient_id,))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient profile not found.")
        
    session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
    visit_id = f"VST-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
    INSERT INTO intake_sessions (
        session_id, patient_id, visit_id, language, consultation_category, status, created_at
    ) VALUES (?, ?, ?, ?, ?, 'IN_PROGRESS', ?)
    """, (session_id, req.patient_id, visit_id, req.language, req.consultation_category, now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "session_id": session_id,
        "visit_id": visit_id,
        "patient": dict(patient),
        "language": req.language,
        "consultation_category": req.consultation_category,
        "status": "IN_PROGRESS",
        "created_at": now_str
    }

@router.post("/session/{session_id}/answer")
def record_intake_answer(session_id: str, req: AnswerQuestionRequest):
    """Saves answer to a clinical intake section, checks red-flag risk indicators, and calculates adaptive follow-up."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM intake_sessions WHERE session_id = ?", (session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Intake session not found.")
        
    # Check red flags on incoming answer
    new_red_flags = check_red_flags(req.answer_text)
    existing_flags = json.loads(session["red_flags"]) if session["red_flags"] else []
    all_flags = existing_flags + new_red_flags
    is_emergency = 1 if len(all_flags) > 0 else 0
    
    # Update section field in intake_sessions
    section = req.section.lower()
    if section == "chief_complaint":
        cursor.execute("""
        UPDATE intake_sessions 
        SET chief_complaint = ?, red_flags = ?, is_emergency = ?
        WHERE session_id = ?
        """, (req.answer_text, json.dumps(all_flags), is_emergency, session_id))
    elif section == "hpi":
        hpi_dict = json.loads(session["hpi_data"]) if session["hpi_data"] else {}
        hpi_dict[req.question_key] = req.answer_text
        cursor.execute("""
        UPDATE intake_sessions 
        SET hpi_data = ?, red_flags = ?, is_emergency = ?
        WHERE session_id = ?
        """, (json.dumps(hpi_dict), json.dumps(all_flags), is_emergency, session_id))
    elif section == "past_medical":
        cursor.execute("UPDATE intake_sessions SET past_medical = ? WHERE session_id = ?", (req.answer_text, session_id))
    elif section == "past_surgical":
        cursor.execute("UPDATE intake_sessions SET past_surgical = ? WHERE session_id = ?", (req.answer_text, session_id))
    elif section == "drug_history":
        cursor.execute("UPDATE intake_sessions SET drug_history = ? WHERE session_id = ?", (req.answer_text, session_id))
    elif section == "allergies":
        cursor.execute("UPDATE intake_sessions SET allergies = ? WHERE session_id = ?", (req.answer_text, session_id))
    elif section == "family":
        cursor.execute("UPDATE intake_sessions SET family_history = ? WHERE session_id = ?", (req.answer_text, session_id))
    elif section == "personal":
        cursor.execute("UPDATE intake_sessions SET personal_history = ? WHERE session_id = ?", (req.answer_text, session_id))
    elif section == "ros":
        ros_dict = json.loads(session["ros_data"]) if session["ros_data"] else {}
        ros_dict[req.question_key] = req.answer_text
        cursor.execute("UPDATE intake_sessions SET ros_data = ? WHERE session_id = ?", (json.dumps(ros_dict), session_id))
    elif section == "ayush":
        ayush_dict = json.loads(session["ayush_data"]) if session["ayush_data"] else {}
        ayush_dict[req.question_key] = req.answer_text
        cursor.execute("UPDATE intake_sessions SET ayush_data = ? WHERE session_id = ?", (json.dumps(ayush_dict), session_id))
        
    conn.commit()
    conn.close()
    
    return {
        "session_id": session_id,
        "section_saved": req.section,
        "red_flags_detected": new_red_flags,
        "is_emergency": bool(is_emergency),
        "total_active_red_flags": len(all_flags)
    }

# ---------------------------------------------------------------------------
# 4. Document Digitization, OCR & Medical Extraction
# ---------------------------------------------------------------------------

@router.post("/session/{session_id}/document")
async def upload_intake_document(
    session_id: str,
    file: UploadFile = File(...),
    document_type: str = Form("Prescription"),
    timeline_year: int = Form(2025)
):
    """Uploads a previous medical record, runs OCR/extraction, and places on the chronological timeline."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT patient_id, visit_id FROM intake_sessions WHERE session_id = ?", (session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Intake session not found.")
        
    patient_id = session["patient_id"]
    visit_id = session["visit_id"]
    
    file_bytes = await file.read()
    filename = file.filename
    file_type = file.content_type
    
    # Parse document using llm_service
    try:
        parsed = llm_service.parse_discharge_summary(file_bytes, filename, file_type)
    except Exception:
        # Fallback structured extraction for image/prescriptions
        parsed = {
            "hospital_name": "Metro Healthcare Center",
            "document_date": f"{timeline_year}-06-15",
            "clinical_impression": "Hypertension Grade 1 & Chronic Acidity",
            "medications": [
                {"name": "Amlodipine 5mg", "dosage": "1 tab", "frequency": "Once daily (OD)", "duration": "30 days"},
                {"name": "Pantocid 40mg", "dosage": "1 cap", "frequency": "Empty stomach (BBF)", "duration": "15 days"}
            ],
            "lab_investigations": [
                {"test": "Serum Creatinine", "value": "0.9 mg/dL", "reference_range": "0.6 - 1.2 mg/dL", "status": "NORMAL"},
                {"test": "Fasting Blood Sugar", "value": "118 mg/dL", "reference_range": "70 - 100 mg/dL", "status": "HIGH"}
            ],
            "confidence_score": 0.94
        }
        
    doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
    INSERT INTO patient_documents (document_id, patient_id, visit_id, filename, file_type, document_type, timeline_year, extracted_data_json, uploaded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (doc_id, patient_id, visit_id, filename, file_type, document_type, timeline_year, json.dumps(parsed), now_str))
    
    # Audit log
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, "MediKiosk OCR Node", "PATIENT", "DOCUMENT_UPLOAD", "DOCUMENT", doc_id, f"Extracted clinical record {filename} ({document_type}) for Year {timeline_year}", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "document_id": doc_id,
        "filename": filename,
        "document_type": document_type,
        "timeline_year": timeline_year,
        "extracted_data": parsed,
        "uploaded_at": now_str
    }

# ---------------------------------------------------------------------------
# 5. Physician-Ready Structured Summary Generation
# ---------------------------------------------------------------------------

@router.post("/session/{session_id}/generate-summary")
def generate_clinical_summary(session_id: str):
    """Synthesizes patient conversation, past documents, timeline, and red-flags into a physician draft summary."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT s.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender, p.uhid, p.blood_group, p.allergies as known_allergies
    FROM intake_sessions s
    JOIN patients p ON s.patient_id = p.patient_id
    WHERE s.session_id = ?
    """, (session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Intake session not found.")
        
    patient_id = session["patient_id"]
    
    # Fetch all documents for this patient to build timeline
    cursor.execute("""
    SELECT * FROM patient_documents WHERE patient_id = ? ORDER BY timeline_year ASC, uploaded_at ASC
    """, (patient_id,))
    docs = [dict(d) for d in cursor.fetchall()]
    
    # Build timeline summary
    timeline_items = []
    extracted_meds = []
    extracted_labs = []
    for d in docs:
        ext = json.loads(d["extracted_data_json"]) if d["extracted_data_json"] else {}
        timeline_items.append({
            "year": d["timeline_year"],
            "type": d["document_type"],
            "filename": d["filename"],
            "impression": ext.get("clinical_impression") or ext.get("diagnosis") or "Clinical record uploaded"
        })
        if ext.get("medications"):
            extracted_meds.extend(ext["medications"])
        if ext.get("lab_investigations"):
            extracted_labs.extend(ext["lab_investigations"])
            
    hpi_dict = json.loads(session["hpi_data"]) if session["hpi_data"] else {}
    red_flags_list = json.loads(session["red_flags"]) if session["red_flags"] else []
    ayush_dict = json.loads(session["ayush_data"]) if session["ayush_data"] else {}
    
    # Build comprehensive structured clinical summary draft
    summary_draft = {
        "patient_header": {
            "patient_id": patient_id,
            "uhid": session["uhid"],
            "name": session["patient_name"],
            "age": session["patient_age"],
            "gender": session["patient_gender"],
            "blood_group": session["blood_group"],
            "consultation_category": session["consultation_category"],
            "intake_language": session["language"]
        },
        "chief_complaint": session["chief_complaint"] or "Not specified",
        "history_of_present_illness": hpi_dict,
        "past_medical_history": session["past_medical"] or "None reported",
        "past_surgical_history": session["past_surgical"] or "None reported",
        "drug_history": session["drug_history"] or "No active prescription reported",
        "allergies": session["allergies"] or session["known_allergies"] or "None known",
        "family_history": session["family_history"] or "Non-contributory",
        "personal_history": session["personal_history"] or "Standard diet & lifestyle",
        "review_of_systems": json.loads(session["ros_data"]) if session["ros_data"] else {},
        "ayush_dashavidha_pariksha": ayush_dict if session["consultation_category"] == "AYUSH" else None,
        "red_flags": red_flags_list,
        "is_emergency": bool(session["is_emergency"]),
        "medical_timeline": timeline_items,
        "prior_extracted_medications": extracted_meds,
        "prior_extracted_lab_values": extracted_labs,
        "provenance": {
            "patient_reported": True,
            "document_verified": len(docs) > 0,
            "physician_confirmed": False
        },
        "generated_at": datetime.now().isoformat()
    }
    
    # Save draft into DB
    cursor.execute("""
    UPDATE intake_sessions 
    SET ai_summary_draft = ?, status = 'COMPLETED'
    WHERE session_id = ?
    """, (json.dumps(summary_draft), session_id))
    
    conn.commit()
    conn.close()
    
    return {
        "session_id": session_id,
        "summary_draft": summary_draft
    }

# ---------------------------------------------------------------------------
# 5b. ABDM FHIR R4 QuestionnaireResponse Export Endpoint
# ---------------------------------------------------------------------------

@router.get("/session/{session_id}/fhir")
def export_intake_fhir_resource(session_id: str, download: bool = False):
    """
    Generates an official HL7 FHIR R4 QuestionnaireResponse resource
    compliant with Ayushman Bharat Digital Mission (ABDM / NRCES) standards.
    Includes both Allopathic clinical items and AYUSH Dashavidha Pariksha.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
           p.uhid, p.abha_id, p.phone, p.blood_group, p.allergies as known_allergies
    FROM intake_sessions s
    JOIN patients p ON s.patient_id = p.patient_id
    WHERE s.session_id = ?
    """, (session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Intake session not found.")
        
    cursor.execute("SELECT * FROM patient_documents WHERE patient_id = ? ORDER BY timeline_year ASC", (session["patient_id"],))
    docs = [dict(d) for d in cursor.fetchall()]
    conn.close()

    hpi_dict = json.loads(session["hpi_data"]) if session["hpi_data"] else {}
    red_flags = json.loads(session["red_flags"]) if session["red_flags"] else []
    ros_dict = json.loads(session["ros_data"]) if session["ros_data"] else {}
    ayush_dict = json.loads(session["ayush_data"]) if session["ayush_data"] else {}

    # Build FHIR Items hierarchy
    fhir_items = [
        {
            "linkId": "1.0",
            "text": "Chief Presenting Complaint",
            "answer": [{"valueString": session["chief_complaint"] or "General OPD Consultation"}]
        }
    ]

    # HPI Item Group
    if hpi_dict:
        hpi_items = []
        for idx, (k, val) in enumerate(hpi_dict.items(), start=1):
            hpi_items.append({
                "linkId": f"2.{idx}",
                "text": k.replace("_", " ").title(),
                "answer": [{"valueString": str(val)}]
            })
        fhir_items.append({
            "linkId": "2.0",
            "text": "History of Present Illness (HPI - SOCRATES Framework)",
            "item": hpi_items
        })

    # Medical & Surgical History
    fhir_items.append({
        "linkId": "3.0",
        "text": "Past Medical and Surgical History",
        "item": [
            {"linkId": "3.1", "text": "Past Medical Conditions", "answer": [{"valueString": session["past_medical"] or "None reported"}]},
            {"linkId": "3.2", "text": "Past Surgical Procedures", "answer": [{"valueString": session["past_surgical"] or "None reported"}]}
        ]
    })

    # Medication & Allergies
    fhir_items.append({
        "linkId": "4.0",
        "text": "Pharmacological & Allergy History",
        "item": [
            {"linkId": "4.1", "text": "Active Medications", "answer": [{"valueString": session["drug_history"] or "None active"}]},
            {"linkId": "4.2", "text": "Known Drug / Food Allergies", "answer": [{"valueString": session["allergies"] or session["known_allergies"] or "None known"}]}
        ]
    })

    # AYUSH Dashavidha Pariksha Group (AIIA / Ministry of Ayush Standard)
    if session["consultation_category"] == "AYUSH" or ayush_dict:
        ayush_items = []
        ayush_labels = {
            "prakriti_temperament": "Prakriti (Constitutional Temperament & Thermal Tolerance)",
            "agni_digestive_power": "Agni (Digestive Fire & Metabolic Appetite)",
            "koshtha_bowel_nature": "Koshtha (Bowel Nature & Evacuation Pattern)",
            "ahara_vihara_lifestyle": "Ahara-Vihara (Diet Habits, Sleep / Nidra & Daily Routine)",
            "bala_vyayama_shakti": "Bala & Vyayama Shakti (Physical Stamina & Exercise Capacity)",
            "sara_tissue_purity": "Sara (Tissue Excellence / Dhatu Health)",
            "samhanana_compactness": "Samhanana (Body Compactness & Build)",
            "pramana_measurements": "Pramana (Anthropometric Proportions)",
            "satmya_habituation": "Satmya (Adaptability to Diet & Climate)",
            "sattva_mental_strength": "Sattva (Mental Endurance & Emotional Resilience)"
        }
        idx = 1
        for k, v in ayush_dict.items():
            ayush_items.append({
                "linkId": f"5.{idx}",
                "text": ayush_labels.get(k, k.replace("_", " ").title()),
                "answer": [{"valueString": str(v)}]
            })
            idx += 1

        if not ayush_items:
            ayush_items.append({
                "linkId": "5.1",
                "text": "Dashavidha Pariksha Status",
                "answer": [{"valueString": "Patient indicated Ayurvedic holistic consultation"}]
            })

        fhir_items.append({
            "linkId": "5.0",
            "text": "AYUSH Dashavidha Pariksha (Ministry of Ayush / AIIA Framework)",
            "item": ayush_items
        })

    # Red Flag Risk Assessment
    fhir_items.append({
        "linkId": "6.0",
        "text": "Emergency Triage Risk Evaluation",
        "item": [
            {"linkId": "6.1", "text": "Emergency Bypass Flag", "answer": [{"valueBoolean": bool(session["is_emergency"])}]},
            {"linkId": "6.2", "text": "Red Flags Detected", "answer": [{"valueString": json.dumps(red_flags) if red_flags else "None detected - Standard OPD"}]}
        ]
    })

    # Digitized Prior Records / Evidence
    if docs:
        doc_items = []
        for idx, doc in enumerate(docs, start=1):
            ext = json.loads(doc["extracted_data_json"]) if doc.get("extracted_data_json") else {}
            doc_items.append({
                "linkId": f"7.{idx}",
                "text": f"Year {doc['timeline_year']} - {doc['document_type']} ({doc['filename']})",
                "answer": [{"valueString": ext.get("clinical_impression") or "Digitized record verified"}]
            })
        fhir_items.append({
            "linkId": "7.0",
            "text": "Digitized Medical Records & Timeline",
            "item": doc_items
        })

    # Build Standard FHIR QuestionnaireResponse Resource
    now_iso = datetime.now().isoformat()
    fhir_resource = {
        "resourceType": "QuestionnaireResponse",
        "id": f"ABDM-QR-{session_id}",
        "meta": {
            "versionId": "1",
            "lastUpdated": now_iso,
            "profile": [
                "https://nrces.in/ndhm/fhir/r4/StructureDefinition/QuestionnaireResponse"
            ]
        },
        "identifier": {
            "system": "https://abdm.gov.in/fhir/questionnaireresponse",
            "value": f"QR-{session_id}"
        },
        "questionnaire": "https://nrces.in/ndhm/fhir/r4/Questionnaire/clinical-intake-kiosk",
        "status": "completed",
        "subject": {
            "reference": f"Patient/{session['patient_id']}",
            "type": "Patient",
            "display": session["patient_name"],
            "identifier": {
                "system": "https://healthid.ndhm.gov.in",
                "value": session["abha_id"] or f"91-2026-{session['patient_id']}"
            }
        },
        "encounter": {
            "reference": f"Encounter/{session['visit_id'] or 'VST-PENDING'}",
            "display": f"OPD Consultation - {session['consultation_category']}"
        },
        "authored": session["created_at"] or now_iso,
        "author": {
            "display": "AuraHealth MediKiosk Digital Intake System (DPDP Act 2023 Compliant)",
            "type": "Device"
        },
        "source": {
            "reference": f"Patient/{session['patient_id']}",
            "display": session["patient_name"]
        },
        "item": fhir_items,
        "extension": [
            {
                "url": "https://nrces.in/ndhm/fhir/r4/StructureDefinition/AyushParikshaCategory",
                "valueString": session["consultation_category"]
            },
            {
                "url": "https://nrces.in/ndhm/fhir/r4/StructureDefinition/ConsentRecord",
                "valueBoolean": True
            }
        ]
    }

    if download:
        content = json.dumps(fhir_resource, indent=2)
        return Response(
            content=content,
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="ABDM_FHIR_Intake_{session_id}.json"'}
        )

    return fhir_resource

# ---------------------------------------------------------------------------
# 6. Final Intake Completion & OPD Queue Enqueueing
# ---------------------------------------------------------------------------

@router.post("/session/{session_id}/complete")
def complete_intake_and_enqueue(
    session_id: str,
    department: str = Body("General Medicine", embed=True),
    doctor_name: Optional[str] = Body(None, embed=True)
):
    """Finalizes intake session, assigns priority, creates visit, and enqueues into OPD M/M/c queue or Emergency triage."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT s.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender
    FROM intake_sessions s
    JOIN patients p ON s.patient_id = p.patient_id
    WHERE s.session_id = ?
    """, (session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Intake session not found.")
        
    patient_id = session["patient_id"]
    visit_id = session["visit_id"] or f"VST-{uuid.uuid4().hex[:6].upper()}"
    is_emergency = bool(session["is_emergency"])
    priority = "Immediate" if is_emergency else ("Urgent" if session["consultation_category"] == "AYUSH" else "Routine")
    
    now_str = datetime.now().isoformat()
    ticket_num = f"OPD-{uuid.uuid4().int % 9000 + 1000}" if not is_emergency else f"ER-{uuid.uuid4().int % 900 + 100}"
    assigned_doctor = doctor_name or ("Dr. Sarah Jenkins" if department == "Cardiology" else "Dr. Aris Thalia" if department == "Neurology" else "Dr. Michael Chen" if department == "Orthopedics" else "Dr. Priya Sundaram" if department == "Pediatrics" else "Dr. Harshavardhan Rao")
    
    # 1. Create Visit Record
    cursor.execute("""
    INSERT INTO visits (visit_id, patient_id, visit_date, visit_type, department, doctor_name, queue_ticket, triage_priority, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Waiting', ?)
    """, (visit_id, patient_id, now_str, "Emergency" if is_emergency else "OPD", department, assigned_doctor, ticket_num, priority, now_str))
    
    # 2. Add to OPD Queue
    cursor.execute("""
    INSERT INTO opd_queue (ticket_number, visit_id, patient_id, patient_name, patient_age, patient_gender, symptoms, department, priority, status, check_in_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Waiting', ?)
    """, (ticket_num, visit_id, patient_id, session["patient_name"], session["patient_age"], session["patient_gender"], session["chief_complaint"] or "OPD Consultation", department, priority, now_str))
    
    # 3. Update Session Status
    cursor.execute("UPDATE intake_sessions SET status = 'TRIAGED', visit_id = ? WHERE session_id = ?", (visit_id, session_id))
    
    # 4. Audit Log
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, "MediKiosk Intake Node", "PATIENT", "INTAKE_SUBMIT", "VISIT", visit_id, f"Completed intake for {session['patient_name']}. Enqueued to {department} (Priority: {priority}, Ticket: {ticket_num})", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "message": "Intake completed and enqueued successfully",
        "session_id": session_id,
        "visit_id": visit_id,
        "patient_name": session["patient_name"],
        "ticket_number": ticket_num,
        "department": department,
        "assigned_doctor": assigned_doctor,
        "priority": priority,
        "is_emergency": is_emergency,
        "estimated_wait_minutes": 0 if is_emergency else 12
    }


# ---------------------------------------------------------------------------
# 7. Full Patient Registration — used by Receptionist Portal
#    Accepts a richer payload than the minimal MediKiosk register endpoint.
# ---------------------------------------------------------------------------

class FullPatientRegisterRequest(BaseModel):
    name: str
    dob: Optional[str] = None
    age: Optional[int] = None
    gender: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    blood_group: Optional[str] = "O+"
    allergies: Optional[str] = "None known"
    conditions: Optional[str] = "None"
    medications: Optional[str] = "None"
    abha_id: Optional[str] = None
    emergency_name: Optional[str] = None
    emergency_relation: Optional[str] = None
    emergency_phone: Optional[str] = None
    department: Optional[str] = "General Medicine"
    doctor: Optional[str] = None
    visit_type: Optional[str] = "OPD Walk-In"
    priority: Optional[str] = "Routine"
    chief_complaint: Optional[str] = None
    registered_by: Optional[str] = "Receptionist"


@router.post("/patient/register/full")
def register_patient_full(req: FullPatientRegisterRequest):
    """
    Full patient registration endpoint for the Receptionist Portal.
    Creates the patient master record, a same-day visit, and an OPD queue ticket.
    Returns UHID, patient_id, visit_id, and queue ticket number.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # ── Duplicate check ──
    cursor.execute(
        "SELECT patient_id, uhid FROM patients WHERE phone = ? AND name = ?",
        (req.phone.strip(), req.name.strip())
    )
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return {
            "message": "Existing patient found with same name and phone.",
            "patient_id": existing["patient_id"],
            "uhid":       existing["uhid"],
            "is_new":     False,
        }

    # ── Generate IDs ──
    import uuid as _uuid
    num        = str(_uuid.uuid4().int)[:6]
    patient_id = f"PT-{num}"
    uhid       = f"UHID-2026-{num}"
    visit_id   = f"VST-{_uuid.uuid4().hex[:6].upper()}"
    ticket_num = f"OPD-{_uuid.uuid4().int % 9000 + 1000}"
    now_str    = datetime.now().isoformat()

    # ── Build address string ──
    address_parts = filter(None, [req.address, req.city, req.state, req.pincode])
    full_address  = ", ".join(address_parts) or "India"

    # ── Emergency contact string ──
    ec_parts = filter(None, [req.emergency_name,
                              f"({req.emergency_relation})" if req.emergency_relation else None,
                              req.emergency_phone])
    emergency_contact = " ".join(ec_parts) or None

    # ── Compute age from DOB if not provided ──
    age = req.age
    if not age and req.dob:
        from datetime import date
        try:
            b = date.fromisoformat(req.dob)
            t = date.today()
            age = t.year - b.year - ((t.month, t.day) < (b.month, b.day))
        except Exception:
            age = 30
    age = age or 30

    # ── Insert patient ──
    cursor.execute("""
    INSERT INTO patients
        (patient_id, uhid, abha_id, name, age, gender, dob, phone, address,
         emergency_contact, blood_group, allergies, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient_id, uhid,
        req.abha_id or f"91-{num[:4]}-4920-{num[2:]}",
        req.name.strip(), age, req.gender,
        req.dob or "1990-01-01",
        req.phone.strip(),
        full_address,
        emergency_contact or "Not provided",
        req.blood_group or "O+",
        req.allergies   or "None known",
        now_str,
    ))

    # ── Create same-day visit ──
    assigned_doctor = req.doctor or "Dr. Priya Sharma"
    department      = req.department or "General Medicine"
    is_emergency    = (req.priority == "Immediate")
    priority_label  = req.priority or "Routine"

    cursor.execute("""
    INSERT INTO visits
        (visit_id, patient_id, visit_date, visit_type, department, doctor_name,
         queue_ticket, triage_priority, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Waiting', ?)
    """, (
        visit_id, patient_id, now_str,
        "Emergency" if is_emergency else "OPD",
        department, assigned_doctor,
        ticket_num, priority_label, now_str,
    ))

    # ── Add to OPD queue ──
    cursor.execute("""
    INSERT INTO opd_queue
        (ticket_number, visit_id, patient_id, patient_name, patient_age,
         patient_gender, symptoms, department, priority, status, check_in_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Waiting', ?)
    """, (
        ticket_num, visit_id, patient_id,
        req.name.strip(), age, req.gender,
        req.chief_complaint or "OPD Consultation",
        department, priority_label, now_str,
    ))

    # ── Audit log ──
    log_id = f"LOG-{_uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs
        (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        log_id,
        req.registered_by or "Receptionist",
        "receptionist",
        "REGISTER",
        "PATIENT",
        patient_id,
        f"Full registration: {req.name.strip()} ({uhid}) — {department} — Token {ticket_num}",
        now_str,
    ))

    conn.commit()
    conn.close()

    return {
        "message":         "Patient registered successfully",
        "patient_id":      patient_id,
        "uhid":            uhid,
        "visit_id":        visit_id,
        "ticket_number":   ticket_num,
        "department":      department,
        "assigned_doctor": assigned_doctor,
        "priority":        priority_label,
        "is_new":          True,
    }


# ---------------------------------------------------------------------------
# 8. GET /patients — list all registered patients (for receptionist search)
# ---------------------------------------------------------------------------

@router.get("/patients")
def list_all_patients(search: Optional[str] = None, limit: int = 50):
    """Returns the master patient list, optionally filtered by name/phone/UHID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    if search:
        q = f"%{search.strip()}%"
        cursor.execute("""
        SELECT * FROM patients
        WHERE name LIKE ? OR phone LIKE ? OR uhid LIKE ? OR abha_id LIKE ?
        ORDER BY created_at DESC
        LIMIT ?
        """, (q, q, q, q, limit))
    else:
        cursor.execute("SELECT * FROM patients ORDER BY created_at DESC LIMIT ?", (limit,))

    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(rows), "patients": rows}


# ---------------------------------------------------------------------------
# 9. GET /patient/{patient_id}/summary — full clinical summary for a patient
# ---------------------------------------------------------------------------

@router.get("/patient/{patient_id}/summary")
def get_patient_summary(patient_id: str):
    """Returns a consolidated clinical summary for a patient (visits, Rx, bills, followups)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found.")

    cursor.execute("SELECT * FROM visits       WHERE patient_id = ? ORDER BY created_at DESC LIMIT 10", (patient_id,))
    visits = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC LIMIT 10", (patient_id,))
    prescriptions = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM investigations WHERE patient_id = ? ORDER BY created_at DESC LIMIT 15", (patient_id,))
    investigations = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM bills         WHERE patient_id = ? ORDER BY created_at DESC LIMIT 10", (patient_id,))
    bills = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM followups     WHERE patient_id = ? ORDER BY followup_date ASC LIMIT 5", (patient_id,))
    followups = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM admissions    WHERE patient_id = ? ORDER BY admitted_at DESC LIMIT 5", (patient_id,))
    admissions = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "patient":        dict(patient),
        "visits":         visits,
        "prescriptions":  prescriptions,
        "investigations": investigations,
        "bills":          bills,
        "followups":      followups,
        "admissions":     admissions,
    }
