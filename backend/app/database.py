import sqlite3
import os
import logging
import json
import uuid
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
    
    # 1. Master Patients Table (UHID is OPTIONAL; MRN is required system identifier)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        patient_id TEXT PRIMARY KEY,
        mrn TEXT UNIQUE NOT NULL,
        uhid TEXT UNIQUE,
        abha_id TEXT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        dob TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        password TEXT,
        address TEXT,
        emergency_contact TEXT,
        blood_group TEXT,
        allergies TEXT,
        primary_hospital_name TEXT,
        onboarding_completed INTEGER DEFAULT 0,
        intake_step TEXT DEFAULT 'IDENTIFY',
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

    # 21. Doctor-Hospital Affiliations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doctor_hospital_affiliations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doctor_id INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        hospital_name TEXT NOT NULL,
        hospital_city TEXT NOT NULL,
        distance_km REAL NOT NULL,
        address TEXT NOT NULL,
        room_number TEXT NOT NULL,
        experience TEXT NOT NULL,
        rating REAL NOT NULL,
        consultation_fee REAL NOT NULL, -- in INR (₹)
        active INTEGER DEFAULT 1
    )
    """)

    # 22. Doctor Schedules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doctor_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        affiliation_id INTEGER NOT NULL,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        slots_json TEXT NOT NULL,
        FOREIGN KEY (affiliation_id) REFERENCES doctor_hospital_affiliations(id)
    )
    """)

    # 23. Patient Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        title TEXT NOT NULL,
        desc TEXT NOT NULL,
        type TEXT NOT NULL,
        time_str TEXT NOT NULL,
        unread INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    """)

    # 24. Ambulance Dispatches Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ambulance_dispatches (
        dispatch_id TEXT PRIMARY KEY,
        patient_id TEXT,
        patient_name TEXT NOT NULL,
        patient_phone TEXT NOT NULL,
        pickup_address TEXT NOT NULL,
        pickup_lat REAL,
        pickup_lng REAL,
        destination_hospital TEXT NOT NULL,
        emergency_type TEXT NOT NULL,
        ambulance_type TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        driver_phone TEXT NOT NULL,
        vehicle_number TEXT NOT NULL,
        eta_minutes INTEGER NOT NULL,
        status TEXT NOT NULL,
        is_simulated INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    """)

    # Column Migration Safeguards for previously created tables
    migrations = [
        ("opd_queue", "visit_id", "TEXT"),
        ("opd_queue", "patient_id", "TEXT"),
        ("opd_queue", "appointment_id", "TEXT"),
        ("opd_queue", "doctor_id", "INTEGER"),
        ("opd_queue", "hospital_id", "INTEGER"),
        ("opd_queue", "room_number", "TEXT"),
        ("opd_queue", "estimated_wait", "INTEGER DEFAULT 10"),
        ("beds", "patient_id", "TEXT"),
        ("dispensations", "prescription_id", "TEXT"),
        ("dispensations", "patient_id", "TEXT"),
        ("appointments", "hospital_name", "TEXT"),
        ("appointments", "patient_id", "TEXT"),
        ("appointments", "doctor_id", "INTEGER"),
        ("appointments", "hospital_id", "INTEGER"),
        ("appointments", "consultation_fee", "REAL")
    ]
    for table, col, col_type in migrations:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        except Exception:
            pass

    # Check patients table columns and constraints for optional UHID & MRN
    cursor.execute("PRAGMA table_info(patients)")
    pt_cols = {row["name"]: dict(row) for row in cursor.fetchall()}
    if "mrn" not in pt_cols or pt_cols.get("uhid", {}).get("notnull") == 1:
        try:
            cursor.execute("""
            CREATE TABLE patients_new (
                patient_id TEXT PRIMARY KEY,
                mrn TEXT UNIQUE NOT NULL,
                uhid TEXT UNIQUE,
                abha_id TEXT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                dob TEXT,
                phone TEXT NOT NULL,
                email TEXT,
                password TEXT,
                address TEXT,
                emergency_contact TEXT,
                blood_group TEXT,
                allergies TEXT,
                primary_hospital_name TEXT,
                onboarding_completed INTEGER DEFAULT 0,
                intake_step TEXT DEFAULT 'IDENTIFY',
                created_at TEXT NOT NULL
            )
            """)
            cursor.execute("""
            INSERT OR IGNORE INTO patients_new (
                patient_id, mrn, uhid, abha_id, name, age, gender, dob, phone, email, password,
                address, emergency_contact, blood_group, allergies, primary_hospital_name,
                onboarding_completed, intake_step, created_at
            )
            SELECT 
                patient_id, 
                CASE WHEN patient_id = 'PT-1001' THEN 'MRN-884920' ELSE 'MRN-' || substr(patient_id, 4) END,
                uhid, 
                abha_id, 
                name, 
                age, 
                gender, 
                dob, 
                phone, 
                lower(replace(name, ' ', '.')) || '@aurahealth.org',
                'patient123',
                address, 
                emergency_contact, 
                blood_group, 
                allergies, 
                'AuraHealth Central Hospital',
                1,
                'SUMMARY_TOKEN',
                created_at 
            FROM patients
            """)
            cursor.execute("DROP TABLE patients")
            cursor.execute("ALTER TABLE patients_new RENAME TO patients")
            conn.commit()
            logger.info("Patients table migrated successfully for optional UHID and MRN.")
        except Exception as e:
            logger.warning(f"Patients table migration note: {e}")

    # Seed Doctor-Hospital Affiliations if empty
    cursor.execute("SELECT COUNT(*) FROM doctor_hospital_affiliations")
    if cursor.fetchone()[0] == 0:
        logger.info("Seeding doctor-hospital affiliations directory...")
        mock_affiliations = [
            # Dr. Sarah Jenkins (Cardiology) - practices across 3 hospitals
            (1, "Dr. Sarah Jenkins", "Cardiology", "AuraHealth Central Hospital", "Delhi NCR", 1.2, "72 Medical Square, Connaught Place, New Delhi", "Room 302", "16+ yrs exp", 4.9, 600.0, 1),
            (1, "Dr. Sarah Jenkins", "Cardiology", "AIIMS Hospital & Research", "Delhi NCR", 4.5, "Sri Aurobindo Marg, Ansari Nagar, New Delhi", "Room 104", "16+ yrs exp", 4.9, 800.0, 1),
            (1, "Dr. Sarah Jenkins", "Cardiology", "Max Super Speciality Hospital", "Delhi NCR", 6.8, "1 Press Enclave Road, Saket, New Delhi", "Room 201", "16+ yrs exp", 4.9, 750.0, 1),
            # Dr. Aris Thalia (Neurology) - practices across 2 hospitals
            (2, "Dr. Aris Thalia", "Neurology", "AuraHealth Central Hospital", "Delhi NCR", 1.2, "72 Medical Square, Connaught Place, New Delhi", "Room 108", "12+ yrs exp", 4.8, 750.0, 1),
            (2, "Dr. Aris Thalia", "Neurology", "Lilavati Hospital & Research", "Mumbai", 5.0, "A-791, Bandra Reclamation, Bandra West, Mumbai", "Room 215", "12+ yrs exp", 4.8, 850.0, 1),
            # Dr. Michael Chen (Orthopedics) - practices across 2 hospitals
            (3, "Dr. Michael Chen", "Orthopedics", "AuraHealth Central Hospital", "Delhi NCR", 1.2, "72 Medical Square, Connaught Place, New Delhi", "Room 204", "14+ yrs exp", 4.9, 650.0, 1),
            (3, "Dr. Michael Chen", "Orthopedics", "Fortis Heart Institute", "Delhi NCR", 8.1, "Okhla Road, Sukhdev Vihar, New Delhi", "Suite B2", "14+ yrs exp", 4.9, 700.0, 1),
            # Dr. Priya Sundaram (Pediatrics) - practices across 2 hospitals
            (4, "Dr. Priya Sundaram", "Pediatrics", "AuraHealth Central Hospital", "Delhi NCR", 1.2, "72 Medical Square, Connaught Place, New Delhi", "Room 401", "10+ yrs exp", 4.7, 500.0, 1),
            (4, "Dr. Priya Sundaram", "Pediatrics", "Apollo Multi-Specialty Hospital", "Mumbai", 3.2, "Plot 13, Off Thane Belapur Rd, Navi Mumbai", "Room 102", "10+ yrs exp", 4.7, 600.0, 1),
            # Dr. Priya Sharma (General Medicine) - practices across 2 hospitals
            (5, "Dr. Priya Sharma", "General Medicine", "AuraHealth Central Hospital", "Delhi NCR", 1.2, "72 Medical Square, Connaught Place, New Delhi", "Room 201", "11+ yrs exp", 4.8, 500.0, 1),
            (5, "Dr. Priya Sharma", "General Medicine", "AIIMS Hospital & Research", "Delhi NCR", 4.5, "Sri Aurobindo Marg, Ansari Nagar, New Delhi", "Room 305", "11+ yrs exp", 4.8, 550.0, 1),
            # Dr. Vikram Malhotra (Emergency)
            (6, "Dr. Vikram Malhotra", "Emergency", "AuraHealth Central Hospital", "Delhi NCR", 1.2, "72 Medical Square, Connaught Place, New Delhi", "ER Bay 1", "15+ yrs exp", 4.9, 900.0, 1)
        ]
        cursor.executemany("""
        INSERT INTO doctor_hospital_affiliations (doctor_id, doctor_name, specialty, hospital_name, hospital_city, distance_km, address, room_number, experience, rating, consultation_fee, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_affiliations)
        conn.commit()

        # Seed Schedules for these affiliations
        mock_schedules = [
            (1, "Daily", "09:00 AM", "01:00 PM", json.dumps(["09:00 AM - 09:30 AM", "10:00 AM - 10:30 AM", "11:15 AM - 11:45 AM", "12:30 PM - 01:00 PM"])),
            (2, "Tue/Thu", "02:00 PM", "06:00 PM", json.dumps(["02:00 PM - 02:30 PM", "03:30 PM - 04:00 PM", "05:00 PM - 05:30 PM"])),
            (3, "Saturday", "10:00 AM", "02:00 PM", json.dumps(["10:00 AM - 10:30 AM", "11:30 AM - 12:00 PM", "01:00 PM - 01:30 PM"])),
            (4, "Mon/Wed/Fri", "09:30 AM", "01:30 PM", json.dumps(["09:30 AM - 10:00 AM", "11:00 AM - 11:30 AM", "12:30 PM - 01:00 PM"])),
            (5, "Tue/Thu", "11:00 AM", "03:00 PM", json.dumps(["11:00 AM - 11:30 AM", "01:00 PM - 01:30 PM", "02:30 PM - 03:00 PM"])),
            (6, "Daily", "10:00 AM", "02:00 PM", json.dumps(["10:00 AM - 10:30 AM", "11:30 AM - 12:00 PM", "01:00 PM - 01:30 PM"])),
            (7, "Fri/Sat", "01:00 PM", "05:00 PM", json.dumps(["01:00 PM - 01:30 PM", "03:00 PM - 03:30 PM", "04:30 PM - 05:00 PM"])),
            (8, "Daily", "09:00 AM", "01:00 PM", json.dumps(["09:00 AM - 09:30 AM", "10:30 AM - 11:00 AM", "12:00 PM - 12:30 PM"])),
            (9, "Fri/Sat", "02:00 PM", "06:00 PM", json.dumps(["02:00 PM - 02:30 PM", "03:30 PM - 04:00 PM", "05:00 PM - 05:30 PM"])),
            (10, "Daily", "08:30 AM", "01:30 PM", json.dumps(["08:30 AM - 09:00 AM", "10:00 AM - 10:30 AM", "11:30 AM - 12:00 PM"])),
            (11, "Mon/Wed/Fri", "02:00 PM", "06:00 PM", json.dumps(["02:00 PM - 02:30 PM", "04:00 PM - 04:30 PM", "05:30 PM - 06:00 PM"])),
            (12, "Daily", "24 Hours (ER)", "STAT", json.dumps(["Immediate / STAT Triage", "09:00 AM - 09:30 AM", "02:00 PM - 02:30 PM"]))
        ]
        cursor.executemany("""
        INSERT INTO doctor_schedules (affiliation_id, day_of_week, start_time, end_time, slots_json)
        VALUES (?, ?, ?, ?, ?)
        """, mock_schedules)
        conn.commit()

    # Seed default notifications for PT-1001 if empty
    cursor.execute("SELECT COUNT(*) FROM notifications")
    if cursor.fetchone()[0] == 0:
        t_now = datetime.now().isoformat()
        mock_notifs = [
            ("PT-1001", "Prescription Ready", "Atorvastatin 20mg & Amlodipine 5mg ready at Central Pharmacy.", "pharmacy", "10m ago", 1, t_now),
            ("PT-1001", "OPD Queue Update", "Your Token #OPD-4501 is now In-Consultation with Dr. Sarah Jenkins.", "queue", "25m ago", 1, t_now),
            ("PT-1001", "Follow-Up Scheduled", "Cardiology follow-up booked with Dr. Sarah Jenkins for next week.", "appointment", "2h ago", 0, t_now),
            ("PT-1001", "Hospital Bill Generated", "Invoice BIL-001001 of ₹1,200 is available for review.", "billing", "1d ago", 0, t_now)
        ]
        cursor.executemany("""
        INSERT INTO notifications (patient_id, title, desc, type, time_str, unread, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, mock_notifs)
        conn.commit()

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

    # ─────────────────────────────────────────────────────────────────
    # COMPREHENSIVE MOCK DATA — patients, visits, prescriptions,
    # investigations, admissions, bills, OPD queue, followups,
    # appointments
    # Only seeded once (checked via patient count guard).
    # ─────────────────────────────────────────────────────────────────
    cursor.execute("SELECT COUNT(*) FROM patients")
    if cursor.fetchone()[0] == 0:
        logger.info("Seeding comprehensive mock patient data...")
        from datetime import date, timedelta
        today     = date.today()
        yesterday = (today - timedelta(days=1)).isoformat()
        two_days  = (today - timedelta(days=2)).isoformat()
        next_week = (today + timedelta(days=7)).isoformat()
        next_2w   = (today + timedelta(days=14)).isoformat()
        t_now     = datetime.now().isoformat()

        # ── 1. PATIENTS ──────────────────────────────────────────────
        mock_patients = [
            ("PT-1001", "UHID-2026-001001", "91-4920-1948-2811", "James Robertson",     58, "Male",   "1968-05-14",
             "+91 98765 43210", "42 Residency Road, Indiranagar, Bengaluru 560038",
             "Sarah Robertson (Spouse) - +91 98765 43211", "A+", "None", t_now),
            ("PT-1002", "UHID-2026-001002", "91-3821-0091-4720", "Eleanor Vance",        42, "Female", "1984-03-22",
             "+91 98765 43212", "14 Lavelle Road, Bengaluru 560001",
             "Michael Vance (Spouse) - +91 98765 43213", "B+", "Penicillin", t_now),
            ("PT-1003", "UHID-2026-001003", "91-7710-3390-5512", "Meera Nambiar",        64, "Female", "1962-11-08",
             "+91 98765 43213", "22 MG Road, Kochi 682011",
             "Suresh Nambiar (Son) - +91 98765 43214", "O+", "Sulfa drugs", t_now),
            ("PT-1004", "UHID-2026-001004", "91-5540-2281-8803", "Ramesh Patel",         47, "Male",   "1979-07-15",
             "+91 98400 55210", "9 Sardar Patel Marg, Ahmedabad 380001",
             "Kavita Patel (Spouse) - +91 98400 55211", "B−", "None", t_now),
            ("PT-1005", "UHID-2026-001005", "91-6630-4492-7714", "Amitabh Sen",          35, "Male",   "1991-01-30",
             "+91 91234 56789", "77 Park Street, Kolkata 700016",
             "Priya Sen (Spouse) - +91 91234 56790", "AB+", "None", t_now),
            ("PT-1006", "UHID-2026-001006", "91-2210-8830-6601", "Fatima Shaikh",        29, "Female", "1997-06-12",
             "+91 80123 45678", "15 Mohammed Ali Road, Mumbai 400003",
             "Zara Shaikh (Mother) - +91 80123 45679", "O−", "None", t_now),
            ("PT-1007", "UHID-2026-001007", "91-9900-1123-3347", "Arjun Mehta",          52, "Male",   "1974-09-03",
             "+91 77001 23456", "33 Connaught Place, New Delhi 110001",
             "Sunita Mehta (Spouse) - +91 77001 23457", "A−", "Aspirin", t_now),
            ("PT-1008", "UHID-2026-001008", "91-4480-7721-9905", "Lakshmi Devi",         71, "Female", "1955-04-20",
             "+91 94801 11223", "5 Anna Salai, Chennai 600002",
             "Karthik Kumar (Son) - +91 94801 11224", "A+", "None", t_now),
            ("PT-1009", "UHID-2026-001009", "91-3310-6640-2281", "Rohan Desai",          14, "Male",   "2012-02-14",
             "+91 98901 33445", "88 FC Road, Pune 411004",
             "Vijay Desai (Father) - +91 98901 33446", "B+", "None", t_now),
            ("PT-1010", "UHID-2026-001010", "91-8820-5501-4437", "Shalini Krishnamurthy",38, "Female", "1988-12-25",
             "+91 99001 55667", "44 Brigade Road, Bengaluru 560025",
             "Arun Krishnamurthy (Spouse) - +91 99001 55668", "AB−", "Ibuprofen", t_now),
        ]
        cursor.executemany("""
        INSERT INTO patients (patient_id, uhid, abha_id, name, age, gender, dob, phone, address, emergency_contact, blood_group, allergies, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_patients)

        # ── 2. VISITS ────────────────────────────────────────────────
        mock_visits = [
            ("VST-001001", "PT-1001", t_now, "OPD", "Cardiology",       "Dr. Sarah Jenkins", "OPD-4501", "Routine",   "In-Consultation", t_now),
            ("VST-001002", "PT-1002", t_now, "OPD", "Cardiology",       "Dr. Sarah Jenkins", "OPD-4502", "Routine",   "Waiting",         t_now),
            ("VST-001003", "PT-1003", t_now, "Emergency", "Emergency",  "Dr. Vikram Malhotra","ER-101",  "Immediate", "Admitted",        t_now),
            ("VST-001004", "PT-1004", yesterday, "OPD", "General Medicine","Dr. Priya Sharma","OPD-4490","Routine",   "Completed",       yesterday),
            ("VST-001005", "PT-1005", yesterday, "Emergency","Emergency","Dr. Vikram Malhotra","ER-099",  "Urgent",    "Discharged",      yesterday),
            ("VST-001006", "PT-1006", two_days,  "OPD", "General Medicine","Dr. Priya Sharma","OPD-4478","Routine",   "Completed",       two_days),
            ("VST-001007", "PT-1007", two_days,  "OPD", "Neurology",    "Dr. Arun Kumar",   "OPD-4479", "Urgent",    "Completed",       two_days),
            ("VST-001008", "PT-1008", yesterday, "Inpatient","Neurology","Dr. Arun Kumar",   "IPD-221",  "Routine",   "Admitted",        yesterday),
            ("VST-001009", "PT-1009", t_now, "OPD", "Pediatrics",       "Dr. Priya Sundaram","OPD-4503","Routine",   "Waiting",         t_now),
            ("VST-001010", "PT-1010", t_now, "OPD", "General Medicine", "Dr. Priya Sharma", "OPD-4504", "Routine",   "Waiting",         t_now),
        ]
        cursor.executemany("""
        INSERT INTO visits (visit_id, patient_id, visit_date, visit_type, department, doctor_name, queue_ticket, triage_priority, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_visits)

        # ── 3. OPD QUEUE ─────────────────────────────────────────────
        mock_queue = [
            ("OPD-4501", "VST-001001", "PT-1001", "James Robertson",     58, "Male",   "Chest discomfort & shortness of breath",  "Cardiology",       "Routine",   "In-Consultation", t_now, None),
            ("OPD-4502", "VST-001002", "PT-1002", "Eleanor Vance",        42, "Female", "Palpitations & mild dizziness",            "Cardiology",       "Routine",   "Waiting",         t_now, None),
            ("ER-101",   "VST-001003", "PT-1003", "Meera Nambiar",        64, "Female", "Severe headache, vomiting, confusion",     "Emergency",        "Immediate", "Waiting",         t_now, None),
            ("OPD-4503", "VST-001009", "PT-1009", "Rohan Desai",          14, "Male",   "High fever 103°F, sore throat",            "Pediatrics",       "Urgent",    "Waiting",         t_now, None),
            ("OPD-4504", "VST-001010", "PT-1010", "Shalini Krishnamurthy",38, "Female", "Persistent lower back pain",               "General Medicine", "Routine",   "Waiting",         t_now, None),
        ]
        cursor.executemany("""
        INSERT INTO opd_queue (ticket_number, visit_id, patient_id, patient_name, patient_age, patient_gender, symptoms, department, priority, status, check_in_time, check_out_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_queue)

        # ── 4. CONSULTATIONS ─────────────────────────────────────────
        mock_consultations = [
            ("CST-001004", "VST-001004", "PT-1004", "Dr. Priya Sharma",  "General Medicine",
             "Hypertension Grade 1. BP 142/92 mmHg. Started Amlodipine 5mg.",
             "BP: 142/92, HR: 78, Temp: 36.9. Mild peripheral oedema.",
             '{"chief_complaint":"Headache & dizziness","ai_confirmed":true}',
             "Outpatient_Prescription", yesterday),
            ("CST-001005", "VST-001005", "PT-1005", "Dr. Vikram Malhotra","Emergency",
             "Acute gastroenteritis. IV fluids administered. Discharged stable.",
             "Abdomen soft, mild tenderness LIF. BP: 100/68, HR: 98.",
             '{"chief_complaint":"Vomiting & diarrhoea","ai_confirmed":true}',
             "Outpatient_Prescription", yesterday),
            ("CST-001006", "VST-001006", "PT-1006", "Dr. Priya Sharma",  "General Medicine",
             "Viral URTI. Symptomatic management. Rest advised.",
             "Throat congested, no exudates. Mild cervical lymphadenopathy.",
             '{"chief_complaint":"Cold, cough & sore throat","ai_confirmed":true}',
             "Outpatient_Prescription", two_days),
            ("CST-001007", "VST-001007", "PT-1007", "Dr. Arun Kumar",    "Neurology",
             "Migraine with aura. Sumatriptan prescribed. MRI Brain normal.",
             "Cranial nerves intact. No focal deficits. Fundus normal.",
             '{"chief_complaint":"Severe unilateral headache with photophobia","ai_confirmed":true}',
             "Outpatient_Prescription", two_days),
        ]
        cursor.executemany("""
        INSERT INTO consultations (consultation_id, visit_id, patient_id, doctor_name, department, clinical_impression, physical_examination, ai_summary_confirmed, outcome, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_consultations)

        # ── 5. PRESCRIPTIONS ─────────────────────────────────────────
        mock_prescriptions = [
            ("RX-001004-A", "CST-001004", "VST-001004", "PT-1004", "Dr. Priya Sharma",
             "Take with water. Avoid excess salt. Follow up in 4 weeks.", "Pending_Dispensation", yesterday),
            ("RX-001005-A", "CST-001005", "VST-001005", "PT-1005", "Dr. Vikram Malhotra",
             "Oral rehydration. Light diet for 3 days.", "Dispensed", yesterday),
            ("RX-001006-A", "CST-001006", "VST-001006", "PT-1006", "Dr. Priya Sharma",
             "Rest. Warm fluids. Paracetamol as needed.", "Dispensed", two_days),
            ("RX-001007-A", "CST-001007", "VST-001007", "PT-1007", "Dr. Arun Kumar",
             "Take Sumatriptan at onset of headache. Avoid triggers.", "Pending_Dispensation", two_days),
            ("RX-001001-A", None, "VST-001001", "PT-1001", "Dr. Sarah Jenkins",
             "Daily medication. Do not skip. Monitor BP at home.", "Pending_Dispensation", t_now),
        ]
        cursor.executemany("""
        INSERT INTO prescriptions (prescription_id, consultation_id, visit_id, patient_id, doctor_name, instructions, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_prescriptions)

        # ── 6. PRESCRIPTION ITEMS ────────────────────────────────────
        mock_rx_items = [
            # Ramesh Patel — Hypertension
            ("RX-001004-A", "Amlodipine 5mg",      "1 tab",   "Once daily (OD)",       30, 30, 30, "Dispensed"),
            ("RX-001004-A", "Pantocid 40mg",        "1 cap",   "Before breakfast (BBF)",15, 15,  0, "Pending"),
            # Amitabh Sen — Gastroenteritis
            ("RX-001005-A", "Paracetamol 650mg",   "1 tab",   "SOS (as needed)",        5,  5,  5, "Dispensed"),
            ("RX-001005-A", "Metronidazole 400mg", "1 tab",   "Thrice daily (TDS)",     15, 15, 15, "Dispensed"),
            # Fatima Shaikh — URTI
            ("RX-001006-A", "Paracetamol 650mg",   "1 tab",   "Thrice daily (TDS)",     10, 10, 10, "Dispensed"),
            ("RX-001006-A", "Azithromycin 500mg",  "1 tab",   "Once daily (OD)",         5,  5,  5, "Dispensed"),
            # Arjun Mehta — Migraine
            ("RX-001007-A", "Sumatriptan 50mg",    "1 tab",   "At onset",                6,  6,  0, "Pending"),
            ("RX-001007-A", "Paracetamol 650mg",   "1 tab",   "SOS (as needed)",        10, 10,  0, "Pending"),
            # James Robertson — Cardiology
            ("RX-001001-A", "Atorvastatin 20mg",   "1 tab",   "Once at night (HS)",     30, 30,  0, "Pending"),
            ("RX-001001-A", "Amlodipine 5mg",       "1 tab",   "Once daily (OD)",        30, 30,  0, "Pending"),
        ]
        cursor.executemany("""
        INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration_days, quantity, dispensed_quantity, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_rx_items)

        # ── 7. INVESTIGATIONS ────────────────────────────────────────
        mock_investigations = [
            ("INV-001001-A", "VST-001001", "PT-1001", "Dr. Sarah Jenkins", "12-Lead ECG",          "Routine",     "Cardiac rhythm analysis",     "ORDERED",   None,            None,       None,     None, t_now),
            ("INV-001001-B", "VST-001001", "PT-1001", "Dr. Sarah Jenkins", "Lipid Profile",        "Routine",     "Check cholesterol levels",    "COMPLETED", "LDL 148 mg/dL", "< 100",   "HIGH",   t_now, t_now),
            ("INV-001002-A", "VST-001002", "PT-1002", "Dr. Sarah Jenkins", "Echocardiogram",       "Routine",     "Evaluate palpitations",       "ORDERED",   None,            None,       None,     None, t_now),
            ("INV-001003-A", "VST-001003", "PT-1003", "Dr. Vikram Malhotra","CT Brain (Non-Contrast)","STAT_Urgent","Rule out haemorrhage",      "PROCESSING",None,            None,       None,     None, t_now),
            ("INV-001004-A", "VST-001004", "PT-1004", "Dr. Priya Sharma",  "Renal Function Tests", "Routine",     "Creatinine & eGFR",           "COMPLETED", "Creatinine 0.9","0.6-1.2", "NORMAL", yesterday, yesterday),
            ("INV-001004-B", "VST-001004", "PT-1004", "Dr. Priya Sharma",  "Fasting Blood Sugar",  "Routine",     "Diabetes screening",          "COMPLETED", "118 mg/dL",     "70-100",  "HIGH",   yesterday, yesterday),
            ("INV-001007-A", "VST-001007", "PT-1007", "Dr. Arun Kumar",    "MRI Brain",            "Routine",     "Migraine workup",             "COMPLETED", "No abnormality","Normal",  "NORMAL", two_days, two_days),
            ("INV-001008-A", "VST-001008", "PT-1008", "Dr. Arun Kumar",    "EEG",                  "Routine",     "Epilepsy evaluation",         "ORDERED",   None,            None,       None,     None, yesterday),
            ("INV-001009-A", "VST-001009", "PT-1009", "Dr. Priya Sundaram","Rapid Strep Test",     "STAT_Urgent", "Streptococcal pharyngitis",   "ORDERED",   None,            None,       None,     None, t_now),
            ("INV-001010-A", "VST-001010", "PT-1010", "Dr. Priya Sharma",  "X-Ray Lumbar Spine",   "Routine",     "Lower back pain workup",      "ORDERED",   None,            None,       None,     None, t_now),
        ]
        cursor.executemany("""
        INSERT INTO investigations (investigation_id, visit_id, patient_id, doctor_name, test_name, priority, notes, status, result_value, reference_range, result_status, completed_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_investigations)

        # ── 8. ADMISSIONS ────────────────────────────────────────────
        mock_admissions = [
            ("ADM-001003", "VST-001003", "PT-1003", "ICU-102",  "ICU",          "Dr. Arun Kumar",      t_now,     None, None, "Active"),
            ("ADM-001008", "VST-001008", "PT-1008", "GW-201",   "General Ward", "Dr. Arun Kumar",      yesterday, None, None, "Active"),
        ]
        cursor.executemany("""
        INSERT INTO admissions (admission_id, visit_id, patient_id, bed_number, ward_type, attending_doctor, admitted_at, discharged_at, discharge_reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_admissions)

        # Update beds to reflect admissions
        cursor.execute("UPDATE beds SET status='Occupied', patient_id='PT-1003', patient_name='Meera Nambiar',   patient_age=64, patient_gender='Female', admission_date=? WHERE bed_number='ICU-102'", (t_now,))
        cursor.execute("UPDATE beds SET status='Occupied', patient_id='PT-1008', patient_name='Lakshmi Devi',    patient_age=71, patient_gender='Female', admission_date=? WHERE bed_number='GW-201'",  (yesterday,))

        # ── 9. BILLS ─────────────────────────────────────────────────
        mock_bills = [
            ("BIL-001004", "VST-001004", "PT-1004", 800.0, 0.0,   350.0,  250.0, 100.0, 1300.0, "PAID",   "Star Health Insurance", "POL-SH-44921", "Claimed",     yesterday),
            ("BIL-001005", "VST-001005", "PT-1005", 900.0, 0.0,   200.0,  0.0,   0.0,   1100.0, "PAID",   None,                    None,           "Not_Claimed", yesterday),
            ("BIL-001006", "VST-001006", "PT-1006", 700.0, 0.0,   150.0,  0.0,   50.0,  800.0,  "PAID",   None,                    None,           "Not_Claimed", two_days),
            ("BIL-001007", "VST-001007", "PT-1007", 900.0, 0.0,   0.0,    800.0, 0.0,   1700.0, "UNPAID", "HDFC Ergo Health",      "POL-HE-88120", "Pending",     two_days),
            ("BIL-001001", "VST-001001", "PT-1001", 800.0, 0.0,   0.0,    400.0, 0.0,   1200.0, "UNPAID", "United India Insurance", "POL-UI-22891","Not_Claimed", t_now),
            ("BIL-001003", "VST-001003", "PT-1003", 900.0, 3500.0,0.0,    1200.0,0.0,   5600.0, "UNPAID", "National Insurance",     "POL-NI-55390","Not_Claimed", t_now),
            ("BIL-001008", "VST-001008", "PT-1008", 800.0, 1500.0,0.0,    500.0, 0.0,   2800.0, "PARTIAL","ICICI Lombard Health",  "POL-IL-77223", "Claimed",     yesterday),
        ]
        cursor.executemany("""
        INSERT INTO bills (bill_id, visit_id, patient_id, consultation_fee, bed_fee, pharmacy_fee, investigation_fee, discount, total_amount, payment_status, insurance_provider, policy_number, claim_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_bills)

        # ── 10. FOLLOW-UP APPOINTMENTS ───────────────────────────────
        mock_followups = [
            ("FU-001004", "PT-1004", "VST-001004", "Dr. Priya Sharma",  "General Medicine", next_week,  "10:00 AM", "BP review and medication adjustment",  "Scheduled", yesterday),
            ("FU-001005", "PT-1005", "VST-001005", "Dr. Vikram Malhotra","Emergency",        next_week,  "11:30 AM", "Post-gastroenteritis review",           "Scheduled", yesterday),
            ("FU-001007", "PT-1007", "VST-001007", "Dr. Arun Kumar",    "Neurology",         next_2w,    "09:30 AM", "Migraine diary review and trigger analysis","Scheduled", two_days),
            ("FU-001001", "PT-1001", "VST-001001", "Dr. Sarah Jenkins", "Cardiology",        next_2w,    "10:30 AM", "Cardiac follow-up, lipid panel repeat",  "Scheduled", t_now),
            ("FU-001006", "PT-1006", "VST-001006", "Dr. Priya Sharma",  "General Medicine",  next_week,  "02:00 PM", "URTI resolution check",                 "Scheduled", two_days),
        ]
        cursor.executemany("""
        INSERT INTO followups (followup_id, patient_id, visit_id, doctor_name, department, followup_date, followup_time, reason, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_followups)

        # ── 11. GENERAL APPOINTMENTS ─────────────────────────────────
        mock_appointments = [
            ("APT-4501", "James Robertson",      58, "Dr. Sarah Jenkins",  "Cardiology",       "AuraHealth Central",  f"{today.isoformat()} 10:30",  "Room 104", "In Consultation"),
            ("APT-4502", "Eleanor Vance",         42, "Dr. Sarah Jenkins",  "Cardiology",       "AuraHealth Central",  f"{today.isoformat()} 11:00",  "Room 104", "Checked-In"),
            ("APT-4503", "Meera Nambiar",         64, "Dr. Vikram Malhotra","Emergency",        "AuraHealth Central",  f"{today.isoformat()} 09:45",  "ER Bay 1", "Admitted"),
            ("APT-4504", "Rohan Desai",           14, "Dr. Priya Sundaram", "Pediatrics",       "AuraHealth Central",  f"{today.isoformat()} 11:30",  "Room 302", "Waiting"),
            ("APT-4505", "Shalini Krishnamurthy", 38, "Dr. Priya Sharma",   "General Medicine", "AuraHealth Central",  f"{today.isoformat()} 12:00",  "Room 201", "Waiting"),
            ("APT-4490", "Ramesh Patel",          47, "Dr. Priya Sharma",   "General Medicine", "AuraHealth Central",  f"{yesterday} 10:00",          "Room 201", "Completed"),
            ("APT-4491", "Fatima Shaikh",         29, "Dr. Priya Sharma",   "General Medicine", "AuraHealth Central",  f"{two_days} 14:30",           "Room 201", "Completed"),
            ("APT-4492", "Arjun Mehta",           52, "Dr. Arun Kumar",     "Neurology",        "AuraHealth Central",  f"{two_days} 09:00",           "Room 303", "Completed"),
            ("APT-4510", "Lakshmi Devi",          71, "Dr. Arun Kumar",     "Neurology",        "AuraHealth Central",  f"{yesterday} 08:00",          "Room 303", "Admitted"),
            ("APT-4511", "Amitabh Sen",           35, "Dr. Vikram Malhotra","Emergency",        "AuraHealth Central",  f"{yesterday} 22:00",          "ER Bay 2", "Discharged"),
        ]
        cursor.executemany("""
        INSERT INTO appointments (appointment_token, patient_name, patient_age, doctor_name, department, hospital_name, date_time, room_number, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_appointments)

        # ── 12. DISPENSATION RECORDS ─────────────────────────────────
        mock_dispensations = [
            ("RX-001005-A", "PT-1005", "Amitabh Sen",   "Paracetamol 650mg",   5,  yesterday),
            ("RX-001005-A", "PT-1005", "Amitabh Sen",   "Metronidazole 400mg", 15, yesterday),
            ("RX-001006-A", "PT-1006", "Fatima Shaikh", "Paracetamol 650mg",   10, two_days),
            ("RX-001006-A", "PT-1006", "Fatima Shaikh", "Azithromycin 500mg",   5, two_days),
            ("RX-001004-A", "PT-1004", "Ramesh Patel",  "Amlodipine 5mg",      30, yesterday),
        ]
        cursor.executemany("""
        INSERT INTO dispensations (prescription_id, patient_id, patient_name, medicine_name, quantity, dispense_date)
        VALUES (?, ?, ?, ?, ?, ?)
        """, mock_dispensations)

        # ── 13. AUDIT LOG SEED ───────────────────────────────────────
        mock_audit = [
            ("LOG-A001", "Elena Rostova",    "receptionist", "REGISTER",        "PATIENT",  "PT-1001", "Walk-in registration: James Robertson (UHID-2026-001001)", t_now),
            ("LOG-A002", "Elena Rostova",    "receptionist", "REGISTER",        "PATIENT",  "PT-1002", "Walk-in registration: Eleanor Vance (UHID-2026-001002)",   t_now),
            ("LOG-A003", "MediKiosk",        "patient",      "CONSENT",         "CONSENT",  "PT-1001", "Clinical Intake consent granted (Hindi)",                  t_now),
            ("LOG-A004", "Dr. Sarah Jenkins","doctor",       "PRESCRIBE",       "PRESCRIPTION","RX-001001-A","Atorvastatin 20mg + Amlodipine 5mg for PT-1001",     t_now),
            ("LOG-A005", "Dr. Priya Sharma", "doctor",       "PRESCRIBE",       "PRESCRIPTION","RX-001004-A","Amlodipine 5mg for PT-1004 — HTN Grade 1",          yesterday),
            ("LOG-A006", "David Kim",        "pharmacist",   "DISPENSE",        "DISPENSATION","RX-001005-A","Dispensed gastroenteritis meds to PT-1005",          yesterday),
            ("LOG-A007", "Dr. Vikram Malhotra","doctor",     "ADMIT",           "ADMISSION","ADM-001003","Meera Nambiar admitted ICU-102 for acute neurological event", t_now),
            ("LOG-A008", "Elena Rostova",    "receptionist", "BILL_PAY",        "BILL",     "BIL-001005","Payment ₹1100 received (Cash) for PT-1005",             yesterday),
            ("LOG-A009", "System",           "admin",        "AI_SUMMARY_GENERATE","SESSION","SES-DEMO-1","AI summary generated for PT-1001 intake session",      t_now),
            ("LOG-A010", "Dr. Arun Kumar",   "doctor",       "INVESTIGATION_ORDER","INVESTIGATION","INV-001003-A","CT Brain STAT ordered for PT-1003",             t_now),
        ]
        cursor.executemany("""
        INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_audit)

        conn.commit()
        logger.info("Comprehensive mock data seeded successfully (10 patients, visits, Rx, bills, queue, followups).")

    conn.close()
    logger.info("CareEase Database initialized successfully with clean state.")

# Run initialization
init_db()
