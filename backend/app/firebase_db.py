import os
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

KEY_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "hospital-management-c0ec1-firebase-adminsdk-fbsvc-f8916a8277.json"
)

_db = None

def init_firebase():
    global _db
    if _db is not None:
        return _db

    try:
        if not firebase_admin._apps:
            if not os.path.exists(KEY_PATH):
                raise FileNotFoundError(f"Firebase Service Account JSON not found at: {KEY_PATH}")
            cred = credentials.Certificate(KEY_PATH)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin initialized successfully with Service Account.")
        
        _db = firestore.client()
        logger.info("Firestore Client connected successfully.")
        init_default_collections(_db)
        return _db
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise e

def get_firestore_db():
    global _db
    if _db is None:
        return init_firebase()
    return _db

def init_default_collections(db):
    """Seed base system accounts, bed layout, hospital directory and formulary if empty."""
    try:
        # 1. Users
        users_ref = db.collection("users")
        user_docs = list(users_ref.limit(1).stream())
        if not user_docs:
            logger.info("Initializing default role accounts in Firestore...")
            default_users = [
                {"username": "doctor", "password": "doctor123", "name": "Dr. Sarah Jenkins", "role": "doctor", "specialty_or_info": "Chief of Cardiology"},
                {"username": "doctor2", "password": "doctor123", "name": "Dr. Aris Thalia", "role": "doctor", "specialty_or_info": "Senior Neurologist"},
                {"username": "doctor3", "password": "doctor123", "name": "Dr. Michael Chen", "role": "doctor", "specialty_or_info": "Senior Orthopedic Surgeon"},
                {"username": "doctor4", "password": "doctor123", "name": "Dr. Priya Sundaram", "role": "doctor", "specialty_or_info": "Lead Pediatrician"},
                {"username": "patient", "password": "patient123", "name": "New Patient", "role": "patient", "specialty_or_info": "MRN-PENDING"},
                {"username": "receptionist", "password": "staff123", "name": "Elena Rostova", "role": "receptionist", "specialty_or_info": "Chief Desk Admin"},
                {"username": "nurse", "password": "nurse123", "name": "Claire Dupont", "role": "nurse", "specialty_or_info": "ICU Charge Nurse"},
                {"username": "pharmacist", "password": "pharma123", "name": "David Kim", "role": "pharmacist", "specialty_or_info": "Chief Clinical Pharmacist"},
                {"username": "admin", "password": "admin123", "name": "System Administrator", "role": "admin", "specialty_or_info": "Hospital Director"},
                {"username": "city_operator", "password": "city123", "name": "Central Metro Dispatch", "role": "city_operator", "specialty_or_info": "Regional Health Grid"}
            ]
            for u in default_users:
                users_ref.document(u["username"]).set(u)

        # 2. Beds (all Available for fresh usage)
        beds_ref = db.collection("beds")
        bed_docs = list(beds_ref.limit(1).stream())
        if not bed_docs:
            logger.info("Initializing available bed inventory in Firestore...")
            default_beds = [
                {"bed_number": "ICU-101", "ward_type": "ICU", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "ICU-102", "ward_type": "ICU", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "ICU-103", "ward_type": "ICU", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "GW-201", "ward_type": "General Ward", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "GW-202", "ward_type": "General Ward", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "GW-203", "ward_type": "General Ward", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "GW-204", "ward_type": "General Ward", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "ER-301", "ward_type": "Emergency", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "ER-302", "ward_type": "Emergency", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None},
                {"bed_number": "PED-401", "ward_type": "Pediatric", "status": "Available", "patient_id": None, "patient_name": None, "patient_age": None, "patient_gender": None, "admission_date": None}
            ]
            for b in default_beds:
                beds_ref.document(b["bed_number"]).set(b)

        # 3. City Hospitals Directory
        hosp_ref = db.collection("city_hospitals")
        hosp_docs = list(hosp_ref.limit(1).stream())
        if not hosp_docs:
            logger.info("Initializing city hospital directory in Firestore...")
            default_hospitals = [
                {"name": "AuraHealth Central Hospital", "city": "Delhi NCR", "distance_km": 1.2, "address": "72 Medical Square, Connaught Place, New Delhi", "phone": "+91 11 4059 8800", "icu_available": 14, "icu_total": 20, "oxygen_available": 18, "oxygen_total": 25, "general_available": 65, "general_total": 80, "specialty_available": 20, "specialty_total": 30},
                {"name": "AIIMS Hospital & Research", "city": "Delhi NCR", "distance_km": 4.5, "address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi", "phone": "+91 11 2658 8500", "icu_available": 3, "icu_total": 45, "oxygen_available": 12, "oxygen_total": 50, "general_available": 15, "general_total": 200, "specialty_available": 8, "specialty_total": 50},
                {"name": "Max Super Speciality Hospital", "city": "Delhi NCR", "distance_km": 6.8, "address": "1 Press Enclave Road, Saket, New Delhi", "phone": "+91 11 2651 5050", "icu_available": 9, "icu_total": 15, "oxygen_available": 15, "oxygen_total": 20, "general_available": 48, "general_total": 60, "specialty_available": 14, "specialty_total": 25},
                {"name": "Fortis Heart Institute", "city": "Delhi NCR", "distance_km": 8.1, "address": "Okhla Road, Sukhdev Vihar, New Delhi", "phone": "+91 11 4713 5000", "icu_available": 18, "icu_total": 30, "oxygen_available": 22, "oxygen_total": 30, "general_available": 70, "general_total": 90, "specialty_available": 25, "specialty_total": 40},
                {"name": "Apollo Multi-Specialty Hospital", "city": "Mumbai", "distance_km": 3.2, "address": "Plot 13, Off Thane Belapur Rd, Navi Mumbai", "phone": "+91 22 3350 3350", "icu_available": 11, "icu_total": 25, "oxygen_available": 19, "oxygen_total": 30, "general_available": 55, "general_total": 75, "specialty_available": 16, "specialty_total": 30},
                {"name": "Lilavati Hospital & Research", "city": "Mumbai", "distance_km": 5.0, "address": "A-791, Bandra Reclamation, Bandra West, Mumbai", "phone": "+91 22 2675 1000", "icu_available": 5, "icu_total": 20, "oxygen_available": 10, "oxygen_total": 20, "general_available": 30, "general_total": 50, "specialty_available": 9, "specialty_total": 20},
                {"name": "Manipal Hospital Old Airport Rd", "city": "Bengaluru", "distance_km": 2.8, "address": "98 HAL Old Airport Rd, Kodihalli, Bengaluru", "phone": "+91 80 2502 4444", "icu_available": 16, "icu_total": 25, "oxygen_available": 24, "oxygen_total": 30, "general_available": 80, "general_total": 100, "specialty_available": 22, "specialty_total": 30},
                {"name": "Apollo Hospitals Greams Rd", "city": "Chennai", "distance_km": 3.7, "address": "21 Greams Lane, Thousand Lights, Chennai", "phone": "+91 44 2829 0200", "icu_available": 12, "icu_total": 20, "oxygen_available": 20, "oxygen_total": 25, "general_available": 60, "general_total": 80, "specialty_available": 18, "specialty_total": 25}
            ]
            for h in default_hospitals:
                doc_id = h["name"].replace(" ", "_").replace("&", "and")
                hosp_ref.document(doc_id).set(h)

        # 4. Formulary Inventory Catalog
        inv_ref = db.collection("inventory")
        inv_docs = list(inv_ref.limit(1).stream())
        if not inv_docs:
            logger.info("Initializing pharmacy inventory in Firestore...")
            default_inventory = [
                {"medicine_name": "Paracetamol 650mg", "batch_number": "B-PCM202", "stock_level": 450, "expiry_date": "2027-12-31", "reorder_level": 100, "purpose_simple": "For fever & pain relief", "price": 15.5},
                {"medicine_name": "Amoxicillin 500mg", "batch_number": "B-AMX304", "stock_level": 80, "expiry_date": "2026-10-30", "reorder_level": 50, "purpose_simple": "Antibiotic for bacterial infections", "price": 45.0},
                {"medicine_name": "Pantocid 40mg", "batch_number": "B-PAN501", "stock_level": 120, "expiry_date": "2027-05-15", "reorder_level": 30, "purpose_simple": "For stomach acidity & reflux", "price": 22.0},
                {"medicine_name": "Metformin 500mg", "batch_number": "B-MET982", "stock_level": 30, "expiry_date": "2026-09-20", "reorder_level": 40, "purpose_simple": "For blood sugar / diabetes control", "price": 12.0},
                {"medicine_name": "Amlodipine 5mg", "batch_number": "B-AML441", "stock_level": 150, "expiry_date": "2026-08-10", "reorder_level": 20, "purpose_simple": "To control blood pressure", "price": 8.5},
                {"medicine_name": "Atorvastatin 20mg", "batch_number": "B-ATV902", "stock_level": 95, "expiry_date": "2027-03-25", "reorder_level": 25, "purpose_simple": "Cholesterol & cardiac plaque stabilizer", "price": 38.0},
                {"medicine_name": "Azithromycin 500mg", "batch_number": "B-AZM119", "stock_level": 65, "expiry_date": "2026-11-15", "reorder_level": 25, "purpose_simple": "Broad spectrum macrolide antibiotic", "price": 52.0},
                {"medicine_name": "Salbutamol Inhaler 100mcg", "batch_number": "B-SBT881", "stock_level": 40, "expiry_date": "2027-06-30", "reorder_level": 15, "purpose_simple": "Bronchodilator for asthma & acute COPD", "price": 110.0}
            ]
            for item in default_inventory:
                doc_id = item["medicine_name"].replace(" ", "_")
                inv_ref.document(doc_id).set(item)

    except Exception as e:
        logger.error(f"Error during Firestore default initialization: {e}")

# Initialize on import
init_firebase()
