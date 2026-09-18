import random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db_connection

router = APIRouter(prefix="/api/ambulance", tags=["Ambulance & Emergency Dispatch"])

class DispatchRequest(BaseModel):
    patient_id: Optional[str] = "PT-1001"
    patient_name: str
    patient_phone: str
    pickup_address: str
    pickup_lat: Optional[float] = 28.6139
    pickup_lng: Optional[float] = 77.2090
    destination_hospital: Optional[str] = "AuraHealth Central Hospital"
    emergency_type: Optional[str] = "Cardiac / Critical Chest Pain"
    ambulance_type: Optional[str] = "Advanced Life Support (ALS ICU)"

DRIVER_ROSTER = [
    {"driver": "Vikram Rathore", "phone": "+91 98101 55210", "vehicle": "KA-01-AM-8842", "base": "Central ER Station"},
    {"driver": "Suresh Nair", "phone": "+91 98402 11980", "vehicle": "KA-02-AM-4419", "base": "South Zone Depot"},
    {"driver": "Ramesh Yadav", "phone": "+91 98711 77320", "vehicle": "KA-04-AM-9901", "base": "Metro Trauma Hub"}
]

@router.post("/dispatch")
def request_ambulance(req: DispatchRequest):
    dispatch_num = random.randint(1000, 9999)
    dispatch_id = f"AMB-2026-{dispatch_num}"
    driver_info = random.choice(DRIVER_ROSTER)
    eta_mins = random.randint(5, 8)
    now_str = datetime.now().isoformat()

    pickup_lat = req.pickup_lat or 28.6139
    pickup_lng = req.pickup_lng or 77.2090

    # Save to SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO ambulance_dispatches (
        dispatch_id, patient_id, patient_name, patient_phone, pickup_address, pickup_lat, pickup_lng,
        destination_hospital, emergency_type, ambulance_type, driver_name, driver_phone,
        vehicle_number, eta_minutes, status, is_simulated, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DISPATCHED_EN_ROUTE', 1, ?)
    """, (
        dispatch_id,
        req.patient_id,
        req.patient_name,
        req.patient_phone,
        req.pickup_address,
        pickup_lat,
        pickup_lng,
        req.destination_hospital or "AuraHealth Central Hospital",
        req.emergency_type or "Cardiac / Acute",
        req.ambulance_type or "Advanced Life Support (ALS)",
        driver_info["driver"],
        driver_info["phone"],
        driver_info["vehicle"],
        eta_mins,
        now_str
    ))

    # Add notification for patient
    cursor.execute("""
    INSERT INTO notifications (patient_id, title, desc, type, time_str, unread, created_at)
    VALUES (?, 'Emergency Ambulance Dispatched', ?, 'emergency', 'Just now', 1, ?)
    """, (
        req.patient_id,
        f"Ambulance {driver_info['vehicle']} dispatched to {req.pickup_address}. ETA: ~{eta_mins} mins.",
        now_str
    ))

    conn.commit()
    conn.close()

    dispatch_doc = {
        "dispatch_id": dispatch_id,
        "patient_id": req.patient_id,
        "patient_name": req.patient_name,
        "patient_phone": req.patient_phone,
        "pickup_address": req.pickup_address,
        "pickup_lat": pickup_lat,
        "pickup_lng": pickup_lng,
        "destination_hospital": req.destination_hospital or "AuraHealth Central Hospital",
        "emergency_type": req.emergency_type,
        "ambulance_type": req.ambulance_type,
        "driver_name": driver_info["driver"],
        "driver_phone": driver_info["phone"],
        "vehicle_number": driver_info["vehicle"],
        "eta_minutes": eta_mins,
        "status": "DISPATCHED_EN_ROUTE",
        "status_label": "Ambulance En Route",
        "is_simulated": True,
        "created_at": now_str,
        "telemetry": {
            "speed_kmh": 64,
            "oxygen_onboard": "100%",
            "defibrillator_status": "READY",
            "current_lat": pickup_lat + 0.012,
            "current_lng": pickup_lng - 0.010
        }
    }

    # Attempt write to Firestore as well
    try:
        from app.firebase_db import get_firestore_db
        db = get_firestore_db()
        if db:
            db.collection("ambulance_dispatches").document(dispatch_id).set(dispatch_doc)
    except Exception as e:
        print("Firestore optional write notice:", e)

    return {
        "success": True,
        "message": f"Emergency Ambulance {driver_info['vehicle']} dispatched!",
        "dispatch": dispatch_doc
    }

@router.get("/status/{dispatch_id}")
def get_ambulance_status(dispatch_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ambulance_dispatches WHERE dispatch_id = ?", (dispatch_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Dispatch record not found.")

    r_dict = dict(row)
    pickup_lat = r_dict.get("pickup_lat") or 28.6139
    pickup_lng = r_dict.get("pickup_lng") or 77.2090

    # Calculate status progression based on seconds elapsed
    try:
        created_time = datetime.fromisoformat(r_dict["created_at"])
        elapsed_sec = (datetime.now() - created_time).total_seconds()
    except Exception:
        elapsed_sec = 20

    if elapsed_sec < 45:
        curr_status = "DISPATCHED_EN_ROUTE"
        curr_label = "Ambulance En Route"
        rem_eta = max(2, r_dict["eta_minutes"] - int(elapsed_sec // 15))
        ratio = elapsed_sec / 180.0
    elif elapsed_sec < 90:
        curr_status = "ARRIVING"
        curr_label = "Arriving at Patient Location"
        rem_eta = 2
        ratio = 0.8
    elif elapsed_sec < 140:
        curr_status = "PATIENT_PICKED_UP"
        curr_label = "Patient Picked Up • En Route to Hospital"
        rem_eta = 4
        ratio = 0.5
    else:
        curr_status = "ARRIVED_HOSPITAL"
        curr_label = "Arrived at Emergency Bay"
        rem_eta = 0
        ratio = 0.0

    current_lat = pickup_lat + (0.015 * (1.0 - ratio))
    current_lng = pickup_lng - (0.012 * (1.0 - ratio))

    return {
        "dispatch_id": r_dict["dispatch_id"],
        "patient_name": r_dict["patient_name"],
        "pickup_address": r_dict["pickup_address"],
        "destination_hospital": r_dict["destination_hospital"],
        "emergency_type": r_dict["emergency_type"],
        "ambulance_type": r_dict["ambulance_type"],
        "driver_name": r_dict["driver_name"],
        "driver_phone": r_dict["driver_phone"],
        "vehicle_number": r_dict["vehicle_number"],
        "eta_minutes": rem_eta,
        "status": curr_status,
        "status_label": curr_label,
        "is_simulated": True,
        "pickup_coords": {"lat": pickup_lat, "lng": pickup_lng},
        "ambulance_coords": {"lat": current_lat, "lng": current_lng},
        "hospital_coords": {"lat": pickup_lat + 0.025, "lng": pickup_lng + 0.020},
        "created_at": r_dict["created_at"]
    }

@router.get("/fleet")
def list_fleet():
    return {
        "total_ambulances": 8,
        "active_on_call": 3,
        "standby_available": 5,
        "fleet": [
            {"id": "AMB-01", "type": "Advanced Cardiac ALS", "status": "Available", "zone": "Central Hospital"},
            {"id": "AMB-02", "type": "Neonatal ICU Transport", "status": "Available", "zone": "Pediatric Hub"},
            {"id": "AMB-03", "type": "Basic Life Support (BLS)", "status": "Available", "zone": "North Depot"},
            {"id": "AMB-04", "type": "Heavy Trauma Response", "status": "Available", "zone": "Expressway Corridor"}
        ]
    }
