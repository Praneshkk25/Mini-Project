import re
import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# ─────────────────────────────────────────────────────────────
# Request / Response Schemas
# ─────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str
    hospital: Optional[str] = "AuraHealth Central Hospital"

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    role: str
    specialty_or_info: Optional[str] = None
    token: str

class PatientRegisterRequest(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: str
    gender: str
    phone: str
    email: Optional[str] = None
    password: Optional[str] = None
    pin: Optional[str] = None
    address: Optional[str] = ""
    city: Optional[str] = "Bengaluru"
    state: Optional[str] = "Karnataka"
    pincode: Optional[str] = ""
    hospital: Optional[str] = "AuraHealth Central Hospital"
    primary_hospital_name: Optional[str] = None
    blood_group: Optional[str] = "Unknown"
    allergies: Optional[str] = "None known"
    emergency_name: Optional[str] = ""
    emergency_relation: Optional[str] = "Relative"
    emergency_phone: Optional[str] = ""
    emergency_contact: Optional[str] = None
    uhid: Optional[str] = None  # Strictly OPTIONAL
    abha_id: Optional[str] = None
    consent_terms: Optional[bool] = None
    consent_storage: Optional[bool] = None
    consent_ai: Optional[bool] = None
    terms_accepted: Optional[bool] = None
    data_consent: Optional[bool] = None
    ai_consent: Optional[bool] = None

class PatientLoginRequest(BaseModel):
    identifier: Optional[str] = None  # Phone, email, MRN or username
    phone: Optional[str] = None
    password: Optional[str] = None
    pin: Optional[str] = None
    hospital: Optional[str] = "AuraHealth Central Hospital"

class ProfileUpdateRequest(BaseModel):
    patient_id: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    emergency_name: Optional[str] = None
    emergency_relation: Optional[str] = None
    emergency_phone: Optional[str] = None
    preferred_language: Optional[str] = None
    primary_hospital_name: Optional[str] = None

# ─────────────────────────────────────────────────────────────
# Helper Validation Functions
# ─────────────────────────────────────────────────────────────
def calculate_age_from_dob(dob_str: str) -> int:
    try:
        birth = datetime.strptime(dob_str.strip(), "%Y-%m-%d").date()
        today = date.today()
        if birth > today:
            raise ValueError("Date of birth cannot be in the future.")
        age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
        return max(0, age)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid date of birth format: {e}")

def validate_phone(phone_str: str) -> str:
    cleaned = re.sub(r'[\s\-\(\)]', '', phone_str)
    if cleaned.startswith('+91'):
        cleaned = cleaned[3:]
    elif cleaned.startswith('91') and len(cleaned) == 12:
        cleaned = cleaned[2:]
    
    if not (len(cleaned) == 10 and cleaned.isdigit() and cleaned[0] in '6789'):
        raise HTTPException(
            status_code=400, 
            detail="Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
        )
    return f"+91 {cleaned[:5]} {cleaned[5:]}"

def validate_email(email_str: Optional[str]) -> Optional[str]:
    if not email_str or not email_str.strip():
        return None
    email_clean = email_str.strip().lower()
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email_clean):
        raise HTTPException(status_code=400, detail="Please enter a valid email address format.")
    return email_clean

def validate_pincode(pin_str: Optional[str]) -> Optional[str]:
    if not pin_str or not pin_str.strip():
        return None
    cleaned = pin_str.strip()
    if not (len(cleaned) == 6 and cleaned.isdigit()):
        raise HTTPException(status_code=400, detail="PIN code must be a 6-digit number.")
    return cleaned

# ─────────────────────────────────────────────────────────────
# 1. Staff & General User Login
# ─────────────────────────────────────────────────────────────
@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (req.username.strip(), req.password.strip()))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password.")

    role_token = f"TOKEN_{user['role'].upper()}_{user['id']}_2026"

    return UserResponse(
        id=user["id"],
        username=user["username"],
        name=user["name"],
        role=user["role"],
        specialty_or_info=user["specialty_or_info"],
        token=role_token
    )

# ─────────────────────────────────────────────────────────────
# 2. Patient Registration with Strict Validation (UHID Optional)
# ─────────────────────────────────────────────────────────────
@router.post("/patient/register")
def register_patient(req: PatientRegisterRequest):
    # 1. Full name validation
    raw_name = req.name or f"{req.first_name or ''} {req.last_name or ''}".strip()
    name_clean = raw_name.strip()
    if not name_clean or len(name_clean) < 2 or re.match(r'^[\d\W]+$', name_clean):
        raise HTTPException(status_code=400, detail="Please enter a valid full name (letters and spaces only).")

    # 2. DOB and Age Calculation
    if not req.dob:
        raise HTTPException(status_code=400, detail="Date of birth is required.")
    age = calculate_age_from_dob(req.dob)

    # 3. Phone validation
    phone_clean = validate_phone(req.phone)

    # 4. Email validation
    email_clean = validate_email(req.email)
    if not email_clean:
        email_clean = f"{name_clean.lower().replace(' ', '.')}@aurahealth.org"

    # 5. PIN code validation
    pincode_clean = validate_pincode(req.pincode)

    # 6. Password / PIN check
    password_val = req.password or req.pin or ""
    if not password_val or len(password_val) < 6:
        raise HTTPException(status_code=400, detail="Password or 6-digit PIN must be at least 6 characters long.")

    # 7. Consents check
    terms_ok = (req.consent_terms is True) or (req.terms_accepted is True) or (req.consent_terms is None and req.terms_accepted is None)
    storage_ok = (req.consent_storage is True) or (req.data_consent is True) or (req.consent_storage is None and req.data_consent is None)
    if not terms_ok or not storage_ok:
        raise HTTPException(status_code=400, detail="Acceptance of terms of service and health data storage is required.")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check for existing account by phone
    cursor.execute("SELECT patient_id, mrn, uhid, name FROM patients WHERE phone = ?", (phone_clean,))
    existing_phone = cursor.fetchone()
    if existing_phone:
        conn.close()
        raise HTTPException(
            status_code=409,
            detail="An account is already registered with this phone number. Please sign in instead."
        )

    # Generate immutable Patient ID and required MRN
    unique_suffix = str(uuid.uuid4().int)[:6]
    patient_id = f"PT-{unique_suffix}"
    mrn = f"MRN-{unique_suffix}"
    now_str = datetime.now().isoformat()

    # UHID is strictly optional. If user entered one, sanitize it; otherwise None
    uhid_clean = req.uhid.strip() if req.uhid and req.uhid.strip() else None

    # Format full address
    addr_parts = [p for p in [req.address, req.city, req.state, pincode_clean] if p]
    full_address = ", ".join(addr_parts) if addr_parts else "Bengaluru, Karnataka, India"

    # Format emergency contact
    emerg_contact = ""
    if req.emergency_name and req.emergency_name.strip():
        emerg_contact = f"{req.emergency_name.strip()} ({req.emergency_relation}) - {req.emergency_phone.strip()}"

    # Insert into master patients table
    cursor.execute("""
    INSERT INTO patients (
        patient_id, mrn, uhid, abha_id, name, age, gender, dob, phone, email, password,
        address, emergency_contact, blood_group, allergies, primary_hospital_name,
        onboarding_completed, intake_step, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'IDENTIFY', ?)
    """, (
        patient_id,
        mrn,
        uhid_clean,
        req.abha_id.strip() if req.abha_id else None,
        name_clean,
        age,
        req.gender,
        req.dob.strip(),
        phone_clean,
        email_clean,
        password_val.strip(),
        full_address,
        emerg_contact,
        req.blood_group or "Unknown",
        req.allergies or "None known",
        req.hospital or "AuraHealth Central Hospital",
        now_str
    ))

    # Also register in users table for universal auth
    cursor.execute("""
    INSERT INTO users (username, password, name, role, specialty_or_info)
    VALUES (?, ?, ?, 'patient', ?)
    """, (phone_clean.replace(" ", ""), password_val.strip(), name_clean, mrn))

    # Record consents
    for c_type in ["Terms_Of_Service", "Health_Data_Processing", "AI_Clinical_Intake"]:
        consent_id = f"CNS-{uuid.uuid4().hex[:8].upper()}"
        cursor.execute("""
        INSERT INTO consents (consent_id, patient_id, visit_id, consent_type, granted, audio_guided, language, timestamp)
        VALUES (?, ?, NULL, ?, 1, 0, 'English', ?)
        """, (consent_id, patient_id, c_type, now_str))

    # Audit log
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, 'patient', 'REGISTER', 'PATIENT', ?, ?, ?)
    """, (f"LOG-{uuid.uuid4().hex[:6].upper()}", name_clean, patient_id, f"Patient registered. MRN: {mrn}, UHID: {uhid_clean or 'Not linked'}", now_str))

    conn.commit()
    conn.close()

    patient_payload = {
        "patient_id": patient_id,
        "mrn": mrn,
        "uhid": uhid_clean,
        "name": name_clean,
        "dob": req.dob.strip(),
        "age": age,
        "gender": req.gender,
        "phone": phone_clean,
        "email": email_clean,
        "address": req.address or "",
        "city": req.city or "Bengaluru",
        "state": req.state or "Karnataka",
        "pincode": pincode_clean or "",
        "blood_group": req.blood_group or "Unknown",
        "allergies": req.allergies or "None known",
        "hospital": req.hospital or "AuraHealth Central Hospital",
        "emergency_name": req.emergency_name or "",
        "emergency_relation": req.emergency_relation or "",
        "emergency_phone": req.emergency_phone or "",
        "onboarding_completed": False,
        "intake_step": "IDENTIFY",
        "role": "patient",
        "token": f"TOKEN_PATIENT_{patient_id}_2026"
    }

    return {
        "status": "success",
        "message": "Patient account created successfully.",
        "patient": patient_payload,
        "token": patient_payload["token"]
    }

# ─────────────────────────────────────────────────────────────
# 3. Patient Login (Generic non-enumerating security errors)
# ─────────────────────────────────────────────────────────────
@router.post("/patient/login")
def login_patient(req: PatientLoginRequest):
    raw_id = (req.identifier or req.phone or "").strip()
    raw_pwd = (req.password or req.pin or "").strip()

    if not raw_id or not raw_pwd:
        raise HTTPException(status_code=400, detail="Invalid phone number or 6-digit PIN. Both fields are required.")

    # Normalize phone if query looks like phone
    norm_phone = re.sub(r'[\s\-\(\)]', '', raw_id)
    if norm_phone.startswith('+91'):
        norm_phone = norm_phone[3:]
    formatted_phone = f"+91 {norm_phone[:5]} {norm_phone[5:]}" if (len(norm_phone) == 10 and norm_phone.isdigit()) else None

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM patients 
    WHERE (
        phone = ? OR phone = ? OR email = ? OR mrn = ? OR uhid = ? OR patient_id = ?
    ) AND password = ?
    """, (
        raw_id,
        formatted_phone or raw_id,
        raw_id.lower(),
        raw_id.upper(),
        raw_id.upper(),
        raw_id.upper(),
        raw_pwd
    ))
    patient = cursor.fetchone()

    # Fallback check against users table for demo accounts (e.g. username 'patient')
    if not patient and raw_id.lower() in ["patient", "eleanor"]:
        cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (raw_id.lower(), raw_pwd))
        demo_user = cursor.fetchone()
        if demo_user:
            # Map to seeded PT-1001 or PT-1002
            target_pt = "PT-1002" if raw_id.lower() == "eleanor" else "PT-1001"
            cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (target_pt,))
            patient = cursor.fetchone()

    conn.close()

    if not patient:
        # Prevent account enumeration: identical generic message regardless of whether ID exists or PIN/password is wrong
        raise HTTPException(
            status_code=401, 
            detail="Invalid phone number or 6-digit PIN. Please check your credentials."
        )

    patient_dict = dict(patient)
    # Don't return password in payload
    patient_dict.pop("password", None)
    patient_dict["hospital"] = req.hospital or patient_dict.get("primary_hospital_name") or "AuraHealth Central Hospital"
    patient_dict["role"] = "patient"
    patient_dict["token"] = f"TOKEN_PATIENT_{patient_dict['patient_id']}_2026"

    return {
        "message": "Login successful",
        "patient": patient_dict,
        "token": patient_dict["token"]
    }

# ─────────────────────────────────────────────────────────────
# 4. Authenticated Patient Profile & Settings Management
# ─────────────────────────────────────────────────────────────
@router.get("/patients/me")
def get_patient_profile(token: str):
    if not token or not token.startswith("TOKEN_PATIENT_"):
        raise HTTPException(status_code=401, detail="Unauthorized access: valid patient token required.")

    patient_id = token.split("_")[2]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,))
    patient = cursor.fetchone()
    conn.close()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    p_dict = dict(patient)
    p_dict.pop("password", None)
    return p_dict

@router.put("/patients/me/profile")
def update_patient_profile(req: ProfileUpdateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (req.patient_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient record not found.")

    # Validate phone if updated
    phone_val = existing["phone"]
    if req.phone and req.phone.strip() != existing["phone"]:
        phone_val = validate_phone(req.phone)

    # Validate email if updated
    email_val = existing["email"]
    if req.email and req.email.strip():
        email_val = validate_email(req.email)

    # Update permitted demographic / contact fields
    address_val = req.address if req.address is not None else existing["address"]
    blood_val = req.blood_group if req.blood_group is not None else existing["blood_group"]
    allergies_val = req.allergies if req.allergies is not None else existing["allergies"]
    hospital_val = req.primary_hospital_name if req.primary_hospital_name is not None else existing["primary_hospital_name"]

    emerg_val = existing["emergency_contact"]
    if req.emergency_name:
        emerg_val = f"{req.emergency_name.strip()} ({req.emergency_relation or 'Contact'}) - {req.emergency_phone or ''}"

    cursor.execute("""
    UPDATE patients SET 
        phone = ?, 
        email = ?, 
        address = ?, 
        blood_group = ?, 
        allergies = ?, 
        emergency_contact = ?,
        primary_hospital_name = ?
    WHERE patient_id = ?
    """, (
        phone_val,
        email_val,
        address_val,
        blood_val,
        allergies_val,
        emerg_val,
        hospital_val,
        req.patient_id
    ))

    # Audit log
    now_str = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, 'patient', 'PROFILE_UPDATE', 'PATIENT', ?, ?, ?)
    """, (f"LOG-{uuid.uuid4().hex[:6].upper()}", existing["name"], req.patient_id, f"Patient updated profile contact/preference details", now_str))

    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (req.patient_id,))
    updated = cursor.fetchone()
    conn.commit()
    conn.close()

    up_dict = dict(updated)
    up_dict.pop("password", None)
    return {
        "message": "Profile updated successfully.",
        "patient": up_dict
    }

# Token verification route for frontend session validation
@router.get("/me")
def get_current_user(token: str):
    if not token or not token.startswith("TOKEN_"):
        raise HTTPException(status_code=401, detail="Invalid auth token")

    parts = token.split("_")
    if len(parts) < 3:
        raise HTTPException(status_code=401, detail="Malformed auth token")

    role = parts[1].lower()
    user_id = parts[2]

    conn = get_db_connection()
    cursor = conn.cursor()

    if role == "patient":
        cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (user_id,))
        patient = cursor.fetchone()
        conn.close()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient account not found")
        p = dict(patient)
        p.pop("password", None)
        p["role"] = "patient"
        return p
    else:
        cursor.execute("SELECT id, username, name, role, specialty_or_info FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(user)
