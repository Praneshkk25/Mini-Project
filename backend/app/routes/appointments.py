import random
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db_connection

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

class DoctorSlot(BaseModel):
    id: int
    name: str
    specialty: str
    hospital_name: str
    room_number: str
    experience: str
    rating: float
    fee: str
    available_slots: List[str]

class BookAppointmentRequest(BaseModel):
    patient_name: str
    patient_age: int
    doctor_name: str
    department: str
    hospital_name: Optional[str] = "AuraHealth Central Hospital"
    date_time: str
    room_number: str

ALL_DOCTORS = [
    # AuraHealth Central Hospital (Delhi NCR)
    {
        "id": 1,
        "name": "Dr. Sarah Jenkins",
        "specialty": "Cardiology",
        "hospital_name": "AuraHealth Central Hospital",
        "room_number": "Room 302",
        "experience": "16+ yrs exp",
        "rating": 4.9,
        "fee": "$60",
        "available_slots": ["09:00 AM - 09:30 AM", "11:15 AM - 12:30 PM", "02:00 PM - 02:30 PM", "04:00 PM - 04:30 PM"]
    },
    {
        "id": 2,
        "name": "Dr. Aris Thalia",
        "specialty": "Neurology",
        "hospital_name": "AuraHealth Central Hospital",
        "room_number": "Room 108",
        "experience": "12+ yrs exp",
        "rating": 4.8,
        "fee": "$75",
        "available_slots": ["09:45 AM - 10:45 AM", "01:30 PM - 02:30 PM", "03:15 PM - 04:15 PM"]
    },
    {
        "id": 3,
        "name": "Dr. Michael Chen",
        "specialty": "Orthopedics",
        "hospital_name": "AuraHealth Central Hospital",
        "room_number": "Room 204",
        "experience": "14+ yrs exp",
        "rating": 4.9,
        "fee": "$65",
        "available_slots": ["10:30 AM - 11:00 AM", "12:00 PM - 12:30 PM", "03:00 PM - 03:30 PM"]
    },
    {
        "id": 4,
        "name": "Dr. Priya Sundaram",
        "specialty": "Pediatrics",
        "hospital_name": "AuraHealth Central Hospital",
        "room_number": "Room 401",
        "experience": "10+ yrs exp",
        "rating": 4.7,
        "fee": "$50",
        "available_slots": ["10:00 AM - 10:30 AM", "11:30 AM - 12:00 PM", "02:30 PM - 03:00 PM"]
    },
    # AIIMS Hospital & Research (Delhi NCR)
    {
        "id": 5,
        "name": "Dr. Harshavardhan Rao",
        "specialty": "Cardiology",
        "hospital_name": "AIIMS Hospital & Research",
        "room_number": "Room 101",
        "experience": "22+ yrs exp",
        "rating": 5.0,
        "fee": "$80",
        "available_slots": ["09:00 AM - 10:00 AM", "11:00 AM - 12:00 PM", "02:00 PM - 03:00 PM"]
    },
    {
        "id": 6,
        "name": "Dr. Nidhi Agrawal",
        "specialty": "Neurology",
        "hospital_name": "AIIMS Hospital & Research",
        "room_number": "Room 215",
        "experience": "15+ yrs exp",
        "rating": 4.9,
        "fee": "$70",
        "available_slots": ["10:00 AM - 11:00 AM", "01:00 PM - 02:00 PM", "03:30 PM - 04:30 PM"]
    },
    {
        "id": 7,
        "name": "Dr. Vikramaditya Sen",
        "specialty": "General Medicine",
        "hospital_name": "AIIMS Hospital & Research",
        "room_number": "Room 305",
        "experience": "18+ yrs exp",
        "rating": 4.8,
        "fee": "$55",
        "available_slots": ["08:30 AM - 09:30 AM", "11:30 AM - 12:30 PM", "04:00 PM - 05:00 PM"]
    },
    # Max Super Speciality Hospital (Delhi NCR)
    {
        "id": 8,
        "name": "Dr. Rajesh K. Sharma",
        "specialty": "Cardiology",
        "hospital_name": "Max Super Speciality Hospital",
        "room_number": "Suite A1",
        "experience": "17+ yrs exp",
        "rating": 4.9,
        "fee": "$70",
        "available_slots": ["09:30 AM - 10:15 AM", "12:00 PM - 12:45 PM", "03:00 PM - 03:45 PM"]
    },
    {
        "id": 9,
        "name": "Dr. Shalini Kapoor",
        "specialty": "Pulmonology",
        "hospital_name": "Max Super Speciality Hospital",
        "room_number": "Suite B4",
        "experience": "11+ yrs exp",
        "rating": 4.8,
        "fee": "$60",
        "available_slots": ["10:00 AM - 10:45 AM", "02:00 PM - 02:45 PM", "04:15 PM - 05:00 PM"]
    },
    {
        "id": 10,
        "name": "Dr. Amitava Ghosh",
        "specialty": "Orthopedics",
        "hospital_name": "Max Super Speciality Hospital",
        "room_number": "Suite C2",
        "experience": "19+ yrs exp",
        "rating": 4.9,
        "fee": "$75",
        "available_slots": ["09:00 AM - 09:45 AM", "11:00 AM - 11:45 AM", "01:30 PM - 02:15 PM"]
    },
    # Fortis Heart Institute (Delhi NCR)
    {
        "id": 11,
        "name": "Dr. Vivek Mehra",
        "specialty": "Cardiology",
        "hospital_name": "Fortis Heart Institute",
        "room_number": "Floor 2, Cabin 201",
        "experience": "20+ yrs exp",
        "rating": 5.0,
        "fee": "$85",
        "available_slots": ["09:00 AM - 09:30 AM", "10:30 AM - 11:00 AM", "02:00 PM - 02:30 PM", "04:30 PM - 05:00 PM"]
    },
    {
        "id": 12,
        "name": "Dr. Ananya Banerjee",
        "specialty": "Cardiology",
        "hospital_name": "Fortis Heart Institute",
        "room_number": "Floor 3, Cabin 304",
        "experience": "13+ yrs exp",
        "rating": 4.9,
        "fee": "$75",
        "available_slots": ["10:00 AM - 10:30 AM", "01:00 PM - 01:30 PM", "03:30 PM - 04:00 PM"]
    },
    # Apollo Multi-Specialty Hospital (Mumbai)
    {
        "id": 13,
        "name": "Dr. Cyrus Mehta",
        "specialty": "Cardiology",
        "hospital_name": "Apollo Multi-Specialty Hospital",
        "room_number": "Wing A, Room 102",
        "experience": "18+ yrs exp",
        "rating": 4.9,
        "fee": "$75",
        "available_slots": ["09:15 AM - 10:00 AM", "11:30 AM - 12:15 PM", "02:45 PM - 03:30 PM"]
    },
    {
        "id": 14,
        "name": "Dr. Tanya Merchant",
        "specialty": "Pediatrics",
        "hospital_name": "Apollo Multi-Specialty Hospital",
        "room_number": "Wing B, Room 204",
        "experience": "12+ yrs exp",
        "rating": 4.8,
        "fee": "$65",
        "available_slots": ["10:00 AM - 10:30 AM", "01:00 PM - 01:30 PM", "04:00 PM - 04:30 PM"]
    },
    # Lilavati Hospital & Research (Mumbai)
    {
        "id": 15,
        "name": "Dr. Farhan Merchant",
        "specialty": "Neurology",
        "hospital_name": "Lilavati Hospital & Research",
        "room_number": "OPD 4, Floor 1",
        "experience": "16+ yrs exp",
        "rating": 4.9,
        "fee": "$80",
        "available_slots": ["09:30 AM - 10:30 AM", "01:30 PM - 02:30 PM", "03:45 PM - 04:45 PM"]
    },
    {
        "id": 16,
        "name": "Dr. Sunita Deshmukh",
        "specialty": "General Medicine",
        "hospital_name": "Lilavati Hospital & Research",
        "room_number": "OPD 2, Floor 1",
        "experience": "15+ yrs exp",
        "rating": 4.8,
        "fee": "$60",
        "available_slots": ["10:00 AM - 10:45 AM", "12:00 PM - 12:45 PM", "03:00 PM - 03:45 PM"]
    },
    # Manipal Hospital Old Airport Rd (Bengaluru)
    {
        "id": 17,
        "name": "Dr. Sandeep Kulkarni",
        "specialty": "Cardiology",
        "hospital_name": "Manipal Hospital Old Airport Rd",
        "room_number": "Block 1, Room 105",
        "experience": "14+ yrs exp",
        "rating": 4.8,
        "fee": "$70",
        "available_slots": ["09:00 AM - 09:45 AM", "11:15 AM - 12:00 PM", "02:30 PM - 03:15 PM"]
    },
    {
        "id": 18,
        "name": "Dr. Deepa Ramanathan",
        "specialty": "Orthopedics",
        "hospital_name": "Manipal Hospital Old Airport Rd",
        "room_number": "Block 2, Room 208",
        "experience": "16+ yrs exp",
        "rating": 4.9,
        "fee": "$75",
        "available_slots": ["10:00 AM - 10:30 AM", "01:30 PM - 02:00 PM", "04:00 PM - 04:30 PM"]
    },
    # Apollo Hospitals Greams Rd (Chennai)
    {
        "id": 19,
        "name": "Dr. K. Venkataraman",
        "specialty": "Cardiology",
        "hospital_name": "Apollo Hospitals Greams Rd",
        "room_number": "Tower 1, Suite 301",
        "experience": "21+ yrs exp",
        "rating": 5.0,
        "fee": "$85",
        "available_slots": ["09:00 AM - 09:45 AM", "11:00 AM - 11:45 AM", "02:00 PM - 02:45 PM", "04:15 PM - 05:00 PM"]
    },
    {
        "id": 20,
        "name": "Dr. Shweta Subramanian",
        "specialty": "Neurology",
        "hospital_name": "Apollo Hospitals Greams Rd",
        "room_number": "Tower 2, Suite 104",
        "experience": "11+ yrs exp",
        "rating": 4.8,
        "fee": "$65",
        "available_slots": ["10:15 AM - 11:00 AM", "01:15 PM - 02:00 PM", "03:30 PM - 04:15 PM"]
    }
]

@router.get("/doctors", response_model=List[DoctorSlot])
def get_available_doctors(hospital_name: Optional[str] = None):
    if hospital_name and hospital_name != "All":
        filtered = [d for d in ALL_DOCTORS if hospital_name.lower() in d["hospital_name"].lower()]
        return filtered if filtered else ALL_DOCTORS
    return ALL_DOCTORS

@router.get("/list")
def list_appointments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@router.post("/book")
def book_appointment(req: BookAppointmentRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    token_num = random.randint(1000, 9999)
    appointment_token = f"APT-2026-{token_num}"
    hosp = req.hospital_name or "AuraHealth Central Hospital"
    
    cursor.execute("""
    INSERT INTO appointments (appointment_token, patient_name, patient_age, doctor_name, department, hospital_name, date_time, room_number, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (appointment_token, req.patient_name, req.patient_age, req.doctor_name, req.department, hosp, req.date_time, req.room_number, "Confirmed"))
    
    conn.commit()
    conn.close()

    return {
        "message": "Appointment booked successfully",
        "appointment_token": appointment_token,
        "patient_name": req.patient_name,
        "doctor_name": req.doctor_name,
        "hospital_name": hosp,
        "department": req.department,
        "date_time": req.date_time,
        "room_number": req.room_number,
        "status": "Confirmed"
    }
