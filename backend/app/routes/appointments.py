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

    patient_age: Optional[int] = 45

    doctor_id: Optional[int] = 1

    doctor_name: str

    department: str

    hospital_name: Optional[str] = "AuraHealth Central Hospital"

    date_time: Optional[str] = None

    appointment_date: Optional[str] = None

    slot_time: Optional[str] = None

    fee_inr: Optional[float] = None

    reason: Optional[str] = "Consultation & Clinical Review"

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



        fee_int = int(r["consultation_fee"]) if r["consultation_fee"] else 600
        hosp_info = {
            "affiliation_id": r["affiliation_id"],
            "hospital_name": r["hospital_name"],
            "city": r["hospital_city"],
            "hospital_city": r["hospital_city"],
            "distance_km": r["distance_km"],
            "address": r["address"],
            "room_number": r["room_number"],
            "consultation_fee": f"₹{fee_int}",
            "consultation_fee_inr": fee_int,
            "fee_num": r["consultation_fee"],
            "schedule_days": r["day_of_week"] or "Daily",
            "timings": f"{r['start_time']} - {r['end_time']}" if r["start_time"] else "09:00 AM - 01:00 PM",
            "available_slots": slots,
            "next_available": "Today 11:15 AM" if "AuraHealth" in r["hospital_name"] else "Tomorrow 10:00 AM"
        }
        doctors_map[d_id]["hospitals"].append(hosp_info)

    # Also build flat list for backward compatibility with both list and object formats
    flat_list = []
    for d in doctors_map.values():
        for h in d["hospitals"]:
            flat_list.append({
                "id": d["id"],
                "doctor_id": str(d["id"]),
                "name": d["name"],
                "specialty": d["specialty"],
                "hospital_name": h["hospital_name"],
                "hospital_city": h["city"],
                "distance_km": h["distance_km"],
                "address": h["address"],
                "room_number": h["room_number"],
                "experience": d["experience"],
                "experience_years": 16,
                "rating": d["rating"],
                "fee": h["consultation_fee"],
                "consultation_fee_inr": h["consultation_fee_inr"],
                "fee_num": h["fee_num"],
                "available_slots": h["available_slots"],
                "hospitals": d["hospitals"],
                "affiliations": d["hospitals"]
            })

    return flat_list



# ─────────────────────────────────────────────────────────────

# 2. Slot Availability with Conflict & Booking Subtraction

# ─────────────────────────────────────────────────────────────

@router.get("/availability")

def get_doctor_availability(

    doctor_name: Optional[str] = Query(None),

    doctor_id: Optional[str] = Query(None),

    hospital_name: Optional[str] = Query(None),

    date_str: Optional[str] = Query(None),

    date: Optional[str] = Query(None)

):

    target_date = date_str or date or datetime.now().strftime("%Y-%m-%d")

    hosp = hospital_name or "AuraHealth Central Hospital"



    conn = get_db_connection()

    cursor = conn.cursor()



    # Find schedule for doctor + hospital (support lookup by doctor_id or doctor_name)

    row = None

    if doctor_id:

        cursor.execute("""

        SELECT a.id, a.doctor_name, a.consultation_fee, a.room_number, s.slots_json

        FROM doctor_hospital_affiliations a

        LEFT JOIN doctor_schedules s ON a.id = s.affiliation_id

        WHERE (a.doctor_id = ? OR a.id = ?) AND a.hospital_name = ? AND a.active = 1

        LIMIT 1

        """, (doctor_id, doctor_id, hosp.strip()))

        row = cursor.fetchone()



    if not row and doctor_name:

        cursor.execute("""

        SELECT a.id, a.doctor_name, a.consultation_fee, a.room_number, s.slots_json

        FROM doctor_hospital_affiliations a

        LEFT JOIN doctor_schedules s ON a.id = s.affiliation_id

        WHERE a.doctor_name LIKE ? AND a.hospital_name = ? AND a.active = 1

        LIMIT 1

        """, (f"%{doctor_name.strip()}%", hosp.strip()))

        row = cursor.fetchone()



    # If still not found, check any active affiliation for this doctor

    if not row and doctor_id:

        cursor.execute("""

        SELECT a.id, a.doctor_name, a.consultation_fee, a.room_number, s.slots_json

        FROM doctor_hospital_affiliations a

        LEFT JOIN doctor_schedules s ON a.id = s.affiliation_id

        WHERE a.doctor_id = ? AND a.active = 1

        LIMIT 1

        """, (doctor_id,))

        row = cursor.fetchone()



    resolved_doc_name = (row["doctor_name"] if row else None) or doctor_name or "Dr. Sarah Jenkins"

    room_num = (row["room_number"] if row else None) or "Room 302"

    fee_val = (row["consultation_fee"] if row else None) or 600.0



    all_slots = []

    if row and row["slots_json"]:

        try:

            all_slots = json.loads(row["slots_json"])

        except Exception:

            pass



    if not all_slots:

        all_slots = [

            "09:30 AM - 10:00 AM",

            "10:00 AM - 10:30 AM",

            "10:30 AM - 11:00 AM",

            "11:30 AM - 12:00 PM",

            "02:00 PM - 02:30 PM",

            "02:30 PM - 03:00 PM",

            "03:30 PM - 04:00 PM",

            "04:30 PM - 05:00 PM"

        ]



    # Check booked appointments for this doctor, hospital, and date

    cursor.execute("""

    SELECT date_time FROM appointments

    WHERE (doctor_name = ? OR doctor_name LIKE ?) AND date_time LIKE ? AND status != 'Cancelled'

    """, (resolved_doc_name, f"%{resolved_doc_name}%", f"%{target_date}%"))

    booked_rows = cursor.fetchall()

    conn.close()



    booked_times = [r["date_time"] for r in booked_rows]



    # Filter out slots that match any booked appointment

    free_slots = []

    for s in all_slots:

        is_taken = any(s in b_time for b_time in booked_times)

        if not is_taken:

            free_slots.append(s)



    # Ensure at least standard morning/afternoon slots if all are consumed or empty

    if not free_slots and not booked_times:

        free_slots = ["09:30 AM - 10:00 AM", "11:00 AM - 11:30 AM", "03:00 PM - 03:30 PM"]



    return {

        "doctor_name": resolved_doc_name,

        "hospital_name": hosp,

        "date": target_date,

        "room_number": room_num,

        "fee": f"₹{int(fee_val)}",

        "fee_num": fee_val,

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

    if req.date_time and req.date_time.strip():

        dt_clean = req.date_time.strip()

    elif req.appointment_date and req.slot_time:

        dt_clean = f"{req.appointment_date} • {req.slot_time}"

    elif req.appointment_date:

        dt_clean = req.appointment_date

    else:

        dt_clean = datetime.now().strftime("%Y-%m-%d • 10:00 AM")



    fee = req.fee_inr if req.fee_inr is not None else (req.consultation_fee or 600.0)

    patient_id = req.patient_id or "PT-1001"

    age = req.patient_age or 45

    reason_str = req.reason or "Consultation & Clinical Review"



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

        department, hospital_name, date_time, room_number, status, consultation_fee, reason

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, ?)

    """, (

        appointment_token,

        patient_id,

        req.patient_name.strip(),

        age,

        req.doctor_id,

        req.doctor_name.strip(),

        req.department.strip(),

        hosp,

        dt_clean,

        room,

        fee,

        reason_str

    ))



    # 4. Insert notification for patient

    cursor.execute("""

    INSERT INTO notifications (patient_id, title, desc, type, time_str, unread, created_at)

    VALUES (?, ?, ?, 'appointment', 'Just now', 1, ?)

    """, (

        patient_id,

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

