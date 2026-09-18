import json
import random
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

class BookAppointmentRequest(BaseModel):
    patient_id: Optional[str] = "PT-1001"
    patient_name: str
    patient_age: int
    doctor_id: Optional[int] = 1
    doctor_name: str
    department: str
    hospital_name: Optional[str] = "AuraHealth Central Hospital"
    date_time: str
    room_number: Optional[str] = "Room 302"
    consultation_fee: Optional[float] = 600.0

# ─────────────────────────────────────────────────────────────
# 1. Doctors List with Multi-Hospital Affiliations
# ─────────────────────────────────────────────────────────────
@router.get("/doctors")
def get_available_doctors(
    hospital_name: Optional[str] = None,
    specialty: Optional[str] = None
):
    """
    Returns doctors with their active hospital affiliations, schedules,
    distance, and fees in INR (₹).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT 
        a.id as affiliation_id,
        a.doctor_id,
        a.doctor_name,
        a.specialty,
        a.hospital_name,
        a.hospital_city,
        a.distance_km,
        a.address,
        a.room_number,
        a.experience,
        a.rating,
        a.consultation_fee,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.slots_json
    FROM doctor_hospital_affiliations a
    LEFT JOIN doctor_schedules s ON a.id = s.affiliation_id
    WHERE a.active = 1
    """
    params = []
    if hospital_name and hospital_name != "All":
        query += " AND a.hospital_name LIKE ?"
        params.append(f"%{hospital_name}%")
    if specialty and specialty != "All":
        query += " AND a.specialty = ?"
        params.append(specialty)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    # Group by doctor_id
    doctors_map: Dict[int, Dict[str, Any]] = {}
    for r in rows:
        d_id = r["doctor_id"]
        if d_id not in doctors_map:
            doctors_map[d_id] = {
                "id": d_id,
                "name": r["doctor_name"],
                "specialty": r["specialty"],
                "experience": r["experience"],
                "rating": r["rating"],
                "hospitals": []
            }
        
        slots = []
        if r["slots_json"]:
            try:
                slots = json.loads(r["slots_json"])
            except Exception:
                slots = ["09:00 AM - 09:30 AM", "11:00 AM - 11:30 AM"]

        hosp_info = {
            "affiliation_id": r["affiliation_id"],
            "hospital_name": r["hospital_name"],
            "city": r["hospital_city"],
            "distance_km": r["distance_km"],
            "address": r["address"],
            "room_number": r["room_number"],
            "consultation_fee": f"₹{int(r['consultation_fee'])}",
            "fee_num": r["consultation_fee"],
            "schedule_days": r["day_of_week"] or "Daily",
            "timings": f"{r['start_time']} - {r['end_time']}" if r["start_time"] else "09:00 AM - 01:00 PM",
            "available_slots": slots,
            "next_available": "Today 11:15 AM" if "AuraHealth" in r["hospital_name"] else "Tomorrow 10:00 AM"
        }
        doctors_map[d_id]["hospitals"].append(hosp_info)

    # Also build flat list for backward compatibility
    flat_list = []
    for d in doctors_map.values():
        for h in d["hospitals"]:
            flat_list.append({
                "id": d["id"],
                "doctor_id": d["id"],
                "name": d["name"],
                "specialty": d["specialty"],
                "hospital_name": h["hospital_name"],
                "hospital_city": h["city"],
                "distance_km": h["distance_km"],
                "address": h["address"],
                "room_number": h["room_number"],
                "experience": d["experience"],
                "rating": d["rating"],
                "fee": h["consultation_fee"],
                "fee_num": h["fee_num"],
                "available_slots": h["available_slots"],
                "hospitals": d["hospitals"]
            })

    return flat_list

# ─────────────────────────────────────────────────────────────
# 2. Slot Availability with Conflict & Booking Subtraction
# ─────────────────────────────────────────────────────────────
@router.get("/availability")
def get_doctor_availability(
    doctor_name: str = Query(...),
    hospital_name: str = Query(...),
    date_str: str = Query(..., description="YYYY-MM-DD or date label")
):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Find schedule for doctor + hospital
    cursor.execute("""
    SELECT a.id, a.consultation_fee, a.room_number, s.slots_json
    FROM doctor_hospital_affiliations a
    LEFT JOIN doctor_schedules s ON a.id = s.affiliation_id
    WHERE a.doctor_name = ? AND a.hospital_name = ? AND a.active = 1
    LIMIT 1
    """, (doctor_name.strip(), hospital_name.strip()))
    row = cursor.fetchone()

    if not row:
        conn.close()
        # Fallback reasonable default slots
        return {
            "doctor_name": doctor_name,
            "hospital_name": hospital_name,
            "date": date_str,
            "room_number": "Room 201",
            "fee": "₹600",
            "available_slots": ["09:30 AM - 10:00 AM", "11:00 AM - 11:30 AM", "02:30 PM - 03:00 PM"],
            "booked_slots": []
        }

    all_slots = []
    if row["slots_json"]:
        try:
            all_slots = json.loads(row["slots_json"])
        except Exception:
            all_slots = ["09:00 AM - 09:30 AM", "10:00 AM - 10:30 AM", "11:15 AM - 11:45 AM"]

    # Check booked appointments for this doctor, hospital, and date
    cursor.execute("""
    SELECT date_time FROM appointments
    WHERE doctor_name = ? AND hospital_name = ? AND date_time LIKE ? AND status != 'Cancelled'
    """, (doctor_name.strip(), hospital_name.strip(), f"%{date_str}%"))
    booked_rows = cursor.fetchall()
    conn.close()

    booked_times = [r["date_time"] for r in booked_rows]

    # Filter out slots that match any booked appointment
    free_slots = []
    for s in all_slots:
        is_taken = any(s in b_time for b_time in booked_times)
        if not is_taken:
            free_slots.append(s)

    return {
        "doctor_name": doctor_name,
        "hospital_name": hospital_name,
        "date": date_str,
        "room_number": row["room_number"],
        "fee": f"₹{int(row['consultation_fee'])}",
        "fee_num": row["consultation_fee"],
        "available_slots": free_slots,
        "booked_slots": [s for s in all_slots if s not in free_slots]
    }

# ─────────────────────────────────────────────────────────────
# 3. Transactional Appointment Booking with Conflict Protection
# ─────────────────────────────────────────────────────────────
@router.post("/book")
def book_appointment(req: BookAppointmentRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    hosp = req.hospital_name or "AuraHealth Central Hospital"
    dt_clean = req.date_time.strip()

    # 1. Conflict Check: Is the doctor already booked at this hospital and time?
    cursor.execute("""
    SELECT id, appointment_token FROM appointments 
    WHERE doctor_name = ? AND hospital_name = ? AND date_time = ? AND status != 'Cancelled'
    """, (req.doctor_name.strip(), hosp, dt_clean))
    conflict = cursor.fetchone()
    if conflict:
        conn.close()
        raise HTTPException(
            status_code=409,
            detail="That appointment slot is no longer available. Please choose another time."
        )

    # 2. Overlap Check: Does this patient already have another appointment at this exact time?
    cursor.execute("""
    SELECT id FROM appointments 
    WHERE (patient_id = ? OR patient_name = ?) AND date_time = ? AND status != 'Cancelled'
    """, (req.patient_id, req.patient_name.strip(), dt_clean))
    patient_conflict = cursor.fetchone()
    if patient_conflict:
        conn.close()
        raise HTTPException(
            status_code=409,
            detail="You already have another clinical appointment scheduled for this date and time."
        )

    # 3. Generate unique appointment token
    token_num = random.randint(1000, 9999)
    appointment_token = f"APT-2026-{token_num}"
    room = req.room_number or "Room 302"
    now_str = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO appointments (
        appointment_token, patient_id, patient_name, patient_age, doctor_id, doctor_name, 
        department, hospital_name, date_time, room_number, status, consultation_fee
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)
    """, (
        appointment_token,
        req.patient_id,
        req.patient_name.strip(),
        req.patient_age,
        req.doctor_id,
        req.doctor_name.strip(),
        req.department.strip(),
        hosp,
        dt_clean,
        room,
        req.consultation_fee or 600.0
    ))

    # 4. Insert notification for patient
    cursor.execute("""
    INSERT INTO notifications (patient_id, title, desc, type, time_str, unread, created_at)
    VALUES (?, ?, ?, 'appointment', 'Just now', 1, ?)
    """, (
        req.patient_id,
        "Appointment Confirmed",
        f"Consultation booked with {req.doctor_name} at {hosp} for {dt_clean}.",
        now_str
    ))

    # 5. Insert audit log
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, 'patient', 'BOOK_APPOINTMENT', 'APPOINTMENT', ?, ?, ?)
    """, (
        f"LOG-{random.randint(1000, 9999)}",
        req.patient_name,
        appointment_token,
        f"Booked {req.doctor_name} ({req.department}) at {hosp} on {dt_clean}",
        now_str
    ))

    conn.commit()
    conn.close()

    return {
        "message": "Appointment booked successfully",
        "appointment_token": appointment_token,
        "patient_id": req.patient_id,
        "patient_name": req.patient_name,
        "doctor_name": req.doctor_name,
        "hospital_name": hosp,
        "department": req.department,
        "date_time": dt_clean,
        "room_number": room,
        "consultation_fee": f"₹{int(req.consultation_fee or 600)}",
        "status": "Confirmed"
    }

# ─────────────────────────────────────────────────────────────
# 4. Patient-Specific Appointments
# ─────────────────────────────────────────────────────────────
@router.get("/patient/{patient_id}")
def get_patient_appointments(patient_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Look up patient name to also catch records matching name
    cursor.execute("SELECT name FROM patients WHERE patient_id = ?", (patient_id,))
    pt_row = cursor.fetchone()
    pt_name = pt_row["name"] if pt_row else None

    if pt_name:
        cursor.execute("""
        SELECT * FROM appointments 
        WHERE patient_id = ? OR patient_name = ?
        ORDER BY id DESC
        """, (patient_id, pt_name))
    else:
        cursor.execute("""
        SELECT * FROM appointments 
        WHERE patient_id = ?
        ORDER BY id DESC
        """, (patient_id,))

    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@router.post("/{token}/cancel")
def cancel_appointment(token: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM appointments WHERE appointment_token = ?", (token,))
    apt = cursor.fetchone()
    if not apt:
        conn.close()
        raise HTTPException(status_code=404, detail="Appointment not found.")

    cursor.execute("UPDATE appointments SET status = 'Cancelled' WHERE appointment_token = ?", (token,))

    if apt["patient_id"]:
        cursor.execute("""
        INSERT INTO notifications (patient_id, title, desc, type, time_str, unread, created_at)
        VALUES (?, 'Appointment Cancelled', ?, 'appointment', 'Just now', 1, ?)
        """, (
            apt["patient_id"],
            f"Your appointment ({token}) with {apt['doctor_name']} has been cancelled.",
            datetime.now().isoformat()
        ))

    conn.commit()
    conn.close()

    return {"message": "Appointment cancelled successfully", "token": token}

@router.get("/list")
def list_appointments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows
