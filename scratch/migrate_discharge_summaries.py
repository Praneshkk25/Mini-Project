import sqlite3
from datetime import datetime

db_path = r"c:\Users\student.CSELAB\Documents\MINI PROJECT TEAM 1\Mini-Project\backend\hospital.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Create discharge_summaries table
cursor.execute("""
CREATE TABLE IF NOT EXISTS discharge_summaries (
    summary_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    uhid TEXT,
    age INTEGER,
    gender TEXT,
    bed_number TEXT,
    department TEXT,
    doctor_id TEXT,
    doctor_name TEXT NOT NULL,
    admission_date TEXT,
    discharge_date TEXT,
    chief_complaint TEXT,
    primary_diagnosis TEXT,
    secondary_diagnosis TEXT,
    hospital_course TEXT,
    condition_at_discharge TEXT DEFAULT 'Stable',
    vitals_json TEXT,
    investigations_json TEXT,
    procedures_json TEXT,
    medications_json TEXT,
    diet_lifestyle_instructions TEXT,
    follow_up_date TEXT,
    follow_up_dept TEXT,
    receptionist_notes TEXT,
    doctor_notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_DOCTOR_REVIEW',
    created_by_role TEXT DEFAULT 'RECEPTIONIST',
    created_by_name TEXT,
    signed_by_doctor TEXT,
    signed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
""")

# 2. Add reason column to appointments if not exists
try:
    cursor.execute("ALTER TABLE appointments ADD COLUMN reason TEXT")
except Exception:
    pass

try:
    cursor.execute("ALTER TABLE appointments ADD COLUMN patient_id TEXT")
except Exception:
    pass

now_str = datetime.now().isoformat()
cursor.execute("SELECT COUNT(*) FROM discharge_summaries")
if cursor.fetchone()[0] == 0:
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
        ?, ?, ?, ?, ?, ?
    )
    """, (
        'DS-2026-1002', 'PT-1002', 'Eleanor Vance', 'UHID-2026-99201', 52, 'Female', 'ICU-02', 'Cardiology',
        'DOC-CAR-101', 'Dr. Sarah Jenkins', '2026-10-28', '2026-11-03',
        'Retrosternal chest tightness radiating to left jaw, diaphoresis on moderate exertion.',
        'Acute Coronary Syndrome - Non-STEMI (Resolved)', 'Essential Hypertension (Stage 2), Dyslipidemia',
        'Patient presented with acute retrosternal chest pain. Bedside ECG showed ST depressions in leads V4-V6. Cardiac enzymes elevated (Troponin-I 0.85 ng/mL). Emergent coronary angiogram performed on Day 2. Patient was initiated on dual antiplatelet therapy (DAPT), high-intensity statin, and beta-blockers. Vitals remained stable over last 48 hours without anginal recurrence.',
        'Stable',
        '{"pulse": 72, "bp": "122/78", "spo2": 98, "temp": 36.7, "respRate": 16}',
        '[{"test": "Serum Troponin-I", "result": "0.02 ng/mL (Normalized)", "normal": "< 0.04"}, {"test": "12-Lead ECG", "result": "Normal Sinus Rhythm, resolved ST depression", "normal": "Normal"}, {"test": "2D Echocardiogram", "result": "LVEF 55%, Mild anterior hypokinesia", "normal": "> 50%"}]',
        '["Coronary Angiography", "Femoral Artery Hemostasis"]',
        '[{"drug": "Tab. Aspirin", "dose": "75mg", "frequency": "Once daily (OD)", "duration": "30 days", "instructions": "Take after breakfast with water"}, {"drug": "Tab. Clopidogrel", "dose": "75mg", "frequency": "Once daily (OD)", "duration": "30 days", "instructions": "Take with breakfast"}, {"drug": "Tab. Atorvastatin", "dose": "40mg", "frequency": "At bedtime (HS)", "duration": "60 days", "instructions": "Cholesterol control"}, {"drug": "Tab. Metoprolol Tartrate", "dose": "25mg", "frequency": "Twice daily (BD)", "duration": "30 days", "instructions": "Blood pressure and heart rate control"}]',
        'Low-sodium cardiac diet (<3g salt/day). Avoid heavy lifting (>5 kg) for 2 weeks. Daily brisk walking for 20 minutes.',
        '2026-11-17', 'Cardiology OPD Suite 204',
        'Discharge summary drafted and compiled by Reception Ops Desk (Elena Rostova). Forwarded to attending consultant Dr. Sarah Jenkins for final clinical verification, prescription review, and electronic authorization.',
        'Reviewed angiogram and laboratory trajectory. Patient hemodynamically stable for discharge to home care.',
        'PENDING_DOCTOR_REVIEW', 'RECEPTIONIST', 'Elena Rostova', now_str, now_str
    ))

conn.commit()
print("Discharge summaries table created and seeded successfully!")
conn.close()
