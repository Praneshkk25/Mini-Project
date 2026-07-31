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
    
    # 1. Beds Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS beds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bed_number TEXT UNIQUE NOT NULL,
        ward_type TEXT NOT NULL,
        status TEXT NOT NULL, -- 'Available', 'Occupied', 'Cleaning', 'Maintenance'
        patient_name TEXT,
        patient_age INTEGER,
        patient_gender TEXT,
        admission_date TEXT
    )
    """)
    
    # 2. OPD Queue Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS opd_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_number TEXT UNIQUE NOT NULL,
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
    
    # 3. Inventory Table
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
    
    # 4. Dispensations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispensations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        dispense_date TEXT NOT NULL
    )
    """)
    
    conn.commit()
    
    # Seed Mock Beds if empty
    cursor.execute("SELECT COUNT(*) FROM beds")
    if cursor.fetchone()[0] == 0:
        logger.info("Seeding initial bed configurations...")
        mock_beds = [
            ("ICU-101", "ICU", "Available", None, None, None, None),
            ("ICU-102", "ICU", "Occupied", "Rohan Mehta", 62, "Male", "2026-07-10T10:30:00"),
            ("ICU-103", "ICU", "Cleaning", None, None, None, None),
            ("GW-201", "General Ward", "Occupied", "Aarav Sharma", 34, "Male", "2026-07-11T14:20:00"),
            ("GW-202", "General Ward", "Available", None, None, None, None),
            ("GW-203", "General Ward", "Available", None, None, None, None),
            ("GW-204", "General Ward", "Maintenance", None, None, None, None),
            ("ER-301", "Emergency", "Occupied", "Priya Singh", 28, "Female", "2026-07-13T17:45:00"),
            ("ER-302", "Emergency", "Available", None, None, None, None),
            ("PFD-401", "Pediatric", "Available", None, None, None, None)
        ]
        cursor.executemany("""
        INSERT INTO beds (bed_number, ward_type, status, patient_name, patient_age, patient_gender, admission_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, mock_beds)
        conn.commit()
        
    # Seed Mock Inventory if empty
    cursor.execute("SELECT COUNT(*) FROM inventory")
    if cursor.fetchone()[0] == 0:
        logger.info("Seeding initial inventory items...")
        mock_inventory = [
            ("Paracetamol 650mg", "B-PCM202", 450, "2027-12-31", 100, "For fever & pain relief", 15.5),
            ("Amoxicillin 500mg", "B-AMX304", 80, "2026-10-30", 50, "Antibiotic for bacterial infections", 45.0),
            ("Pantocid 40mg", "B-PAN501", 120, "2027-05-15", 30, "For stomach acidity & reflux", 22.0),
            ("Metformin 500mg", "B-MET982", 30, "2026-09-20", 40, "For blood sugar / diabetes control", 12.0),
            ("Amlodipine 5mg", "B-AML441", 150, "2026-08-10", 20, "To control blood pressure", 8.5)
        ]
        cursor.executemany("""
        INSERT INTO inventory (medicine_name, batch_number, stock_level, expiry_date, reorder_level, purpose_simple, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, mock_inventory)
        conn.commit()
        
    # Seed Mock Queue if empty
    cursor.execute("SELECT COUNT(*) FROM opd_queue")
    if cursor.fetchone()[0] == 0:
        logger.info("Seeding initial queue entries...")
        now_str = datetime.now().isoformat()
        mock_queue = [
            ("OPD-1001", "Karan Malhotra", 45, "Male", "Chronic knee joint pain", "Orthopedics", "Routine", "Waiting", now_str),
            ("OPD-1002", "Sita Devi", 70, "Female", "Breathlessness and chest pain", "Cardiology", "Immediate", "In-Consultation", now_str),
            ("OPD-1003", "Ananya Verma", 8, "Female", "High fever with chills since 3 days", "Pediatrics", "Urgent", "Waiting", now_str)
        ]
        cursor.executemany("""
        INSERT INTO opd_queue (ticket_number, patient_name, patient_age, patient_gender, symptoms, department, priority, status, check_in_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, mock_queue)
        conn.commit()

    conn.close()
    logger.info("Database initialized successfully.")

# Run initialization
init_db()
