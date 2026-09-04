import sqlite3
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "hospital.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Master Patients Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        patient_id TEXT PRIMARY KEY,
        uhid TEXT UNIQUE NOT NULL,
        abha_id TEXT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        dob TEXT,
        phone TEXT NOT NULL,
        address TEXT,
        emergency_contact TEXT,
        blood_group TEXT,
        allergies TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 2. Patient Encounters / Visits Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS visits (
        visit_id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        visit_date TEXT NOT NULL,
        visit_type TEXT NOT NULL, -- 'OPD', 'Emergency', 'AYUSH', 'Inpatient'
        department TEXT NOT NULL,
        doctor_name TEXT,
        queue_ticket TEXT,
        triage_priority TEXT DEFAULT 'Routine', -- 'Routine', 'Urgent', 'Immediate'
        status TEXT NOT NULL, -- 'Intake', 'Waiting', 'In-Consultation', 'Admitted', 'Discharged', 'Completed'
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 3. Patient Consents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consents (
        consent_id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        visit_id TEXT,
        consent_type TEXT NOT NULL, -- 'Clinical_Intake', 'Digital_Health_Record', 'AI_Assistance'
        granted INTEGER NOT NULL, -- 1: Yes, 0: No
        audio_guided INTEGER DEFAULT 0,
        language TEXT DEFAULT 'English',
        timestamp TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 4. MediKiosk Intake Sessions & Clinical History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS intake_sessions (
        session_id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        visit_id TEXT,
        language TEXT DEFAULT 'English',
        consultation_category TEXT DEFAULT 'Allopathy', -- 'Allopathy', 'AYUSH'
        chief_complaint TEXT,
        hpi_data TEXT, -- JSON structure of Present Illness
        past_medical TEXT,
        past_surgical TEXT,
        drug_history TEXT,
        allergies TEXT,
        family_history TEXT,
        personal_history TEXT,
        ros_data TEXT, -- JSON Review of Systems
        ayush_data TEXT, -- JSON Dashavidha Pariksha & Prakriti
        red_flags TEXT, -- JSON array of detected emergency indicators
        is_emergency INTEGER DEFAULT 0,
        ai_summary_draft TEXT,
        doctor_edited_summary TEXT,
        confirmed_by_doctor TEXT,
        confirmed_at TEXT,
        status TEXT DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'TRIAGED', 'CONFIRMED'
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 5. Patient Documents & Extracted Clinical Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patient_documents (
        document_id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        visit_id TEXT,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        document_type TEXT NOT NULL, -- 'Prescription', 'Lab_Report', 'Discharge_Summary', 'Imaging', 'Referral'
        timeline_year INTEGER NOT NULL,
        extracted_data_json TEXT, -- JSON with diagnosis, meds, lab values, confidence
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 6. Consultations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consultations (
        consultation_id TEXT PRIMARY KEY,
        visit_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        department TEXT NOT NULL,
        clinical_impression TEXT,
        physical_examination TEXT,
        ai_summary_confirmed TEXT,
        outcome TEXT DEFAULT 'Outpatient_Prescription', -- 'Outpatient_Prescription', 'Admit_Inpatient', 'Referral', 'Emergency_Transfer'
        created_at TEXT NOT NULL,
        FOREIGN KEY (visit_id) REFERENCES visits (visit_id),
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 7. Electronic Prescriptions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prescriptions (
        prescription_id TEXT PRIMARY KEY,
        consultation_id TEXT,
        visit_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        instructions TEXT,
        status TEXT DEFAULT 'Pending_Dispensation', -- 'Pending_Dispensation', 'Dispensed', 'Partially_Dispensed', 'Cancelled'
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 8. Prescription Line Items Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prescription_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescription_id TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration_days INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        dispensed_quantity INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Pending',
        FOREIGN KEY (prescription_id) REFERENCES prescriptions (prescription_id)
    )
    """)

    # 9. Diagnostic Investigation Orders Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS investigations (
        investigation_id TEXT PRIMARY KEY,
        visit_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        test_name TEXT NOT NULL,
        priority TEXT DEFAULT 'Routine', -- 'Routine', 'STAT_Urgent'
        notes TEXT,
        status TEXT DEFAULT 'ORDERED', -- 'ORDERED', 'COLLECTED', 'PROCESSING', 'COMPLETED'
        result_value TEXT,
        reference_range TEXT,
        result_status TEXT, -- 'NORMAL', 'HIGH', 'LOW', 'CRITICAL'
        completed_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 10. Inpatient Beds Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS beds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bed_number TEXT UNIQUE NOT NULL,
        ward_type TEXT NOT NULL,
        status TEXT NOT NULL, -- 'Available', 'Occupied', 'Cleaning', 'Maintenance'
        patient_id TEXT,
        patient_name TEXT,
        patient_age INTEGER,
        patient_gender TEXT,
        admission_date TEXT
    )
    """)

    # 11. Inpatient Admissions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admissions (
        admission_id TEXT PRIMARY KEY,
        visit_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        bed_number TEXT NOT NULL,
        ward_type TEXT NOT NULL,
        attending_doctor TEXT NOT NULL,
        admitted_at TEXT NOT NULL,
        discharged_at TEXT,
        discharge_reason TEXT,
        status TEXT DEFAULT 'Active', -- 'Active', 'Discharged', 'Transferred'
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 12. OPD Queue Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS opd_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_number TEXT UNIQUE NOT NULL,
        visit_id TEXT,
        patient_id TEXT,
        patient_name TEXT NOT NULL,
        patient_age INTEGER,
        patient_gender TEXT,
        symptoms TEXT,
        department TEXT NOT NULL,
        priority TEXT NOT NULL, -- 'Routine', 'Urgent', 'Immediate'
        status TEXT NOT NULL, -- 'Waiting', 'In-Consultation', 'Completed', 'Cancelled'
        check_in_time TEXT NOT NULL,
        check_out_time TEXT
    )
    """)
    
    # 13. Pharmacy Inventory Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine_name TEXT UNIQUE NOT NULL,
        batch_number TEXT NOT NULL,
        stock_level INTEGER NOT NULL,
        expiry_date TEXT NOT NULL, -- YYYY-MM-DD
        reorder_level INTEGER NOT NULL,
        purpose_simple TEXT,
        price REAL NOT NULL
    )
    """)
    
    # 14. Dispensations & Transactions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispensations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescription_id TEXT,
        patient_id TEXT,
        patient_name TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        dispense_date TEXT NOT NULL
    )
    """)

    # 15. Follow-Up Appointments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS followups (
        followup_id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        visit_id TEXT,
        doctor_name TEXT NOT NULL,
        department TEXT NOT NULL,
        followup_date TEXT NOT NULL,
        followup_time TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'Scheduled', -- 'Scheduled', 'Completed', 'Rescheduled', 'Cancelled'
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 16. Billing & Accounts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bills (
        bill_id TEXT PRIMARY KEY,
        visit_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        consultation_fee REAL DEFAULT 0.0,
        bed_fee REAL DEFAULT 0.0,
        pharmacy_fee REAL DEFAULT 0.0,
        investigation_fee REAL DEFAULT 0.0,
        discount REAL DEFAULT 0.0,
        total_amount REAL NOT NULL,
        payment_status TEXT DEFAULT 'UNPAID', -- 'UNPAID', 'PARTIAL', 'PAID'
        insurance_provider TEXT,
        policy_number TEXT,
        claim_status TEXT DEFAULT 'Not_Claimed',
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    )
    """)

    # 17. System Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id TEXT PRIMARY KEY,
        user_name TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL, -- 'REGISTER', 'CONSENT', 'INTAKE_SUBMIT', 'AI_SUMMARY_GENERATE', 'DOCTOR_EDIT', 'PRESCRIBE', 'DISPENSE', 'ADMIT', 'DISCHARGE', 'BILL_PAY'
        entity TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
    )
    """)
    
    # 18. Users Table for Role Auth
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL, -- 'doctor', 'patient', 'receptionist', 'nurse', 'pharmacist', 'admin', 'city_operator'
        specialty_or_info TEXT
    )
    """)

    # 19. City Hospitals Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS city_hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        city TEXT NOT NULL,
        distance_km REAL NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        icu_available INTEGER NOT NULL,
        icu_total INTEGER NOT NULL,
        oxygen_available INTEGER NOT NULL,
        oxygen_total INTEGER NOT NULL,
        general_available INTEGER NOT NULL,
        general_total INTEGER NOT NULL,
        specialty_available INTEGER NOT NULL,
        specialty_total INTEGER NOT NULL
    )
    """)

    # 20. General Appointments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_token TEXT UNIQUE NOT NULL,
        patient_name TEXT NOT NULL,
        patient_age INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        department TEXT NOT NULL,
        hospital_name TEXT,
        date_time TEXT NOT NULL,
        room_number TEXT NOT NULL,
        status TEXT NOT NULL
    )
    """)

    # Column Migration Safeguards for previously created tables
    migrations = [
        ("opd_queue", "visit_id", "TEXT"),
        ("opd_queue", "patient_id", "TEXT"),
        ("beds", "patient_id", "TEXT"),
        ("dispensations", "prescription_id", "TEXT"),
        ("dispensations", "patient_id", "TEXT"),
        ("appointments", "hospital_name", "TEXT")
    ]
    for table, col, col_type in migrations:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        except Exception:
            pass

    conn.commit()

    # Seed Mock Users if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        logger.info("Seeding default role accounts...")
        mock_users = [
            ("doctor", "doctor123", "Dr. Sarah Jenkins", "doctor", "Chief of Cardiology"),
            ("doctor2", "doctor123", "Dr. Aris Thalia", "doctor", "Senior Neurologist"),
            ("doctor3", "doctor123", "Dr. Michael Chen", "doctor", "Senior Orthopedic Surgeon"),
            ("doctor4", "doctor123", "Dr. Priya Sundaram", "doctor", "Lead Pediatrician"),
            ("patient", "patient123", "New Patient", "patient", "MRN-PENDING"),
            ("receptionist", "staff123", "Elena Rostova", "receptionist", "Chief Desk Admin"),
            ("nurse", "nurse123", "Claire Dupont", "nurse", "ICU Charge Nurse"),
            ("pharmacist", "pharma123", "David Kim", "pharmacist", "Chief Clinical Pharmacist"),
            ("admin", "admin123", "System Administrator", "admin", "Hospital Director"),
            ("city_operator", "city123", "Central Metro Dispatch", "city_operator", "Regional Health Grid")
        ]
        cursor.executemany("""
        INSERT INTO users (username, password, name, role, specialty_or_info)
        VALUES (?, ?, ?, ?, ?)
        """, mock_users)
        conn.commit()

    # Seed City Hospitals facility list if empty
    cursor.execute("SELECT COUNT(*) FROM city_hospitals")
    if cursor.fetchone()[0] == 0:
        logger.info("Seeding city hospitals directory...")
        mock_hospitals = [
            ("AuraHealth Central Hospital", "Delhi NCR", 1.2, "72 Medical Square, Connaught Place, New Delhi", "+91 11 4059 8800", 14, 20, 18, 25, 65, 80, 20, 30),
            ("AIIMS Hospital & Research", "Delhi NCR", 4.5, "Sri Aurobindo Marg, Ansari Nagar, New Delhi", "+91 11 2658 8500", 3, 45, 12, 50, 15, 200, 8, 50),
            ("Max Super Speciality Hospital", "Delhi NCR", 6.8, "1 Press Enclave Road, Saket, New Delhi", "+91 11 2651 5050", 9, 15, 15, 20, 48, 60, 14, 25),
            ("Fortis Heart Institute", "Delhi NCR", 8.1, "Okhla Road, Sukhdev Vihar, New Delhi", "+91 11 4713 5000", 18, 30, 22, 30, 70, 90, 25, 40),
            ("Apollo Multi-Specialty Hospital", "Mumbai", 3.2, "Plot 13, Off Thane Belapur Rd, Navi Mumbai", "+91 22 3350 3350", 11, 25, 19, 30, 55, 75, 16, 30),
            ("Lilavati Hospital & Research", "Mumbai", 5.0, "A-791, Bandra Reclamation, Bandra West, Mumbai", "+91 22 2675 1000", 5, 20, 10, 20, 30, 50, 9, 20),
            ("Manipal Hospital Old Airport Rd", "Bengaluru", 2.8, "98 HAL Old Airport Rd, Kodihalli, Bengaluru", "+91 80 2502 4444", 16, 25, 24, 30, 80, 100, 22, 30),
            ("Apollo Hospitals Greams Rd", "Chennai", 3.7, "21 Greams Lane, Thousand Lights, Chennai", "+91 44 2829 0200", 12, 20, 20, 25, 60, 80, 18, 25)
        ]
        cursor.executemany("""
        INSERT INTO city_hospitals (name, city, distance_km, address, phone, icu_available, icu_total, oxygen_available, oxygen_total, general_available, general_total, specialty_available, specialty_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_hospitals)
        conn.commit()

    # Seed Bed Configurations if empty (all Available for new users)
    cursor.execute("SELECT COUNT(*) FROM beds")
    if cursor.fetchone()[0] == 0:
        logger.info("Initializing available bed inventory...")
        mock_beds = [
            ("ICU-101", "ICU", "Available", None, None, None, None, None),
            ("ICU-102", "ICU", "Available", None, None, None, None, None),
            ("ICU-103", "ICU", "Available", None, None, None, None, None),
            ("GW-201", "General Ward", "Available", None, None, None, None, None),
            ("GW-202", "General Ward", "Available", None, None, None, None, None),
            ("GW-203", "General Ward", "Available", None, None, None, None, None),
            ("GW-204", "General Ward", "Available", None, None, None, None, None),
            ("ER-301", "Emergency", "Available", None, None, None, None, None),
            ("ER-302", "Emergency", "Available", None, None, None, None, None),
            ("PED-401", "Pediatric", "Available", None, None, None, None, None)
        ]
        cursor.executemany("""
        INSERT INTO beds (bed_number, ward_type, status, patient_id, patient_name, patient_age, patient_gender, admission_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_beds)
        conn.commit()
        
    # Seed Pharmacy Inventory Formulary Catalog if empty
    cursor.execute("SELECT COUNT(*) FROM inventory")
    if cursor.fetchone()[0] == 0:
        logger.info("Initializing pharmacy inventory formulary...")
        mock_inventory = [
            ("Paracetamol 650mg", "B-PCM202", 450, "2027-12-31", 100, "For fever & pain relief", 15.5),
            ("Amoxicillin 500mg", "B-AMX304", 80, "2026-10-30", 50, "Antibiotic for bacterial infections", 45.0),
            ("Pantocid 40mg", "B-PAN501", 120, "2027-05-15", 30, "For stomach acidity & reflux", 22.0),
            ("Metformin 500mg", "B-MET982", 30, "2026-09-20", 40, "For blood sugar / diabetes control", 12.0),
            ("Amlodipine 5mg", "B-AML441", 150, "2026-08-10", 20, "To control blood pressure", 8.5),
            ("Atorvastatin 20mg", "B-ATV902", 95, "2027-03-25", 25, "Cholesterol & cardiac plaque stabilizer", 38.0),
            ("Azithromycin 500mg", "B-AZM119", 65, "2026-11-15", 25, "Broad spectrum macrolide antibiotic", 52.0),
            ("Salbutamol Inhaler 100mcg", "B-SBT881", 40, "2027-06-30", 15, "Bronchodilator for asthma & acute COPD", 110.0)
        ]
        cursor.executemany("""
        INSERT INTO inventory (medicine_name, batch_number, stock_level, expiry_date, reorder_level, purpose_simple, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, mock_inventory)
        conn.commit()

    conn.close()
    logger.info("CareEase Database initialized successfully with clean state.")

# Run initialization
init_db()
