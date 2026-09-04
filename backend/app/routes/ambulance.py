import random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.firebase_db import get_firestore_db

router = APIRouter(prefix="/api/ambulance", tags=["Ambulance & Emergency Dispatch"])

class DispatchRequest(BaseModel):
    patient_name: str
    patient_phone: str
    pickup_address: str
    destination_hospital: Optional[str] = "AuraHealth Central Hospital"
    emergency_type: Optional[str] = "Cardiac / Critical"
    ambulance_type: Optional[str] = "Advanced Life Support (ALS)"

DRIVER_ROSTER = [
    {"driver": "Vikram Rathore", "phone": "+91 98101 55210", "vehicle": "DL-01-AM-8842", "base": "Central ER Station"},
    {"driver": "Suresh Nair", "phone": "+91 98402 11980", "vehicle": "DL-02-AM-4419", "base": "South Zone Depot"},
    {"driver": "Ramesh Yadav", "phone": "+91 98711 77320", "vehicle": "DL-04-AM-9901", "base": "Metro Trauma Hub"}
]

@router.post("/dispatch")
def request_ambulance(req: DispatchRequest):
    db = get_firestore_db()
    
    dispatch_num = random.randint(1000, 9999)
    dispatch_id = f"AMB-2026-{dispatch_num}"
    driver_info = random.choice(DRIVER_ROSTER)
    eta_mins = random.randint(4, 9)
    now_str = datetime.now().isoformat()
    
    dispatch_doc = {
        "dispatch_id": dispatch_id,
        "patient_name": req.patient_name,
        "patient_phone": req.patient_phone,
        "pickup_address": req.pickup_address,
        "destination_hospital": req.destination_hospital,
        "emergency_type": req.emergency_type,
        "ambulance_type": req.ambulance_type,
        "driver_name": driver_info["driver"],
        "driver_phone": driver_info["phone"],
        "vehicle_number": driver_info["vehicle"],
        "eta_minutes": eta_mins,
        "status": "DISPATCHED_EN_ROUTE",
        "created_at": now_str,
        "telemetry": {
            "speed_kmh": 68,
            "oxygen_onboard": "100%",
            "defibrillator_status": "READY",
            "gps_lat": 28.6139 + random.uniform(-0.02, 0.02),
            "gps_lng": 77.2090 + random.uniform(-0.02, 0.02)
        }
    }
    
    try:
        db.collection("ambulance_dispatches").document(dispatch_id).set(dispatch_doc)
    except Exception as e:
        print("Firestore dispatch write error:", e)
        
    return {
        "success": True,
        "message": f"Emergency Ambulance {driver_info['vehicle']} dispatched immediately!",
        "dispatch": dispatch_doc
    }

@router.get("/status/{dispatch_id}")
def get_ambulance_status(dispatch_id: str):
    db = get_firestore_db()
    doc_ref = db.collection("ambulance_dispatches").document(dispatch_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Dispatch record not found")
        
    return doc.to_dict()

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
