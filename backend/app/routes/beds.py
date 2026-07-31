from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random

from app.database import get_db_connection

router = APIRouter(prefix="/api/beds", tags=["Beds"])

@router.get("/status")
def get_bed_status():
    """Returns summaries and full list of all beds and their status."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM beds")
    rows = cursor.fetchall()
    conn.close()
    
    beds_list = [dict(r) for r in rows]
    
    # Calculate summary metrics
    summary = {
        "Total": 0,
        "Available": 0,
        "Occupied": 0,
        "Cleaning": 0,
        "Maintenance": 0,
        "ICU_available": 0,
        "ICU_total": 0
    }
    
    for bed in beds_list:
        status = bed["status"]
        ward = bed["ward_type"]
        
        summary["Total"] += 1
        if status in summary:
            summary[status] += 1
            
        if ward == "ICU":
            summary["ICU_total"] += 1
            if status == "Available":
                summary["ICU_available"] += 1
                
    return {
        "summary": summary,
        "beds": beds_list
    }


@router.post("/admit")
def admit_patient(payload: Dict[str, Any] = Body(...)):
    """Allocates a bed to a patient and sets status to 'Occupied'."""
    bed_number = payload.get("bed_number")
    patient_name = payload.get("patient_name")
    patient_age = payload.get("patient_age")
    patient_gender = payload.get("patient_gender")
    
    if not bed_number or not patient_name:
        raise HTTPException(status_code=400, detail="bed_number and patient_name are required.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify bed exists and is available
    cursor.execute("SELECT status FROM beds WHERE bed_number = ?", (bed_number,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Bed not found.")
        
    if row["status"] != "Available":
        conn.close()
        raise HTTPException(status_code=400, detail=f"Bed {bed_number} is not available (Status: {row['status']}).")
        
    now_str = datetime.now().isoformat()
    try:
        cursor.execute("""
        UPDATE beds 
        SET status = 'Occupied', patient_name = ?, patient_age = ?, patient_gender = ?, admission_date = ?
        WHERE bed_number = ?
        """, (patient_name, patient_age, patient_gender, now_str, bed_number))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database write error: {str(e)}")
    finally:
        conn.close()
        
    return {"message": f"Patient {patient_name} admitted to Bed {bed_number} successfully."}


@router.post("/discharge")
def discharge_patient(payload: Dict[str, Any] = Body(...)):
    """Discharges a patient and puts the bed in 'Cleaning' status."""
    bed_number = payload.get("bed_number")
    
    if not bed_number:
        raise HTTPException(status_code=400, detail="bed_number is required.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT status, patient_name FROM beds WHERE bed_number = ?", (bed_number,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Bed not found.")
        
    if row["status"] != "Occupied":
        conn.close()
        raise HTTPException(status_code=400, detail=f"Bed {bed_number} is not occupied (Status: {row['status']}).")
        
    pname = row["patient_name"]
    try:
        cursor.execute("""
        UPDATE beds 
        SET status = 'Cleaning', patient_name = NULL, patient_age = NULL, patient_gender = NULL, admission_date = NULL
        WHERE bed_number = ?
        """, (bed_number,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database update error: {str(e)}")
    finally:
        conn.close()
        
    return {
        "message": f"Patient {pname} discharged from Bed {bed_number}. Bed marked for cleaning.",
        "discharged_patient_name": pname
    }


@router.post("/update-status")
def update_bed_status(payload: Dict[str, Any] = Body(...)):
    """Updates status directly (e.g., from 'Cleaning' to 'Available', or marking a bed for Maintenance)."""
    bed_number = payload.get("bed_number")
    new_status = payload.get("status")
    
    if not bed_number or not new_status:
        raise HTTPException(status_code=400, detail="bed_number and status are required.")
        
    if new_status not in ["Available", "Cleaning", "Maintenance"]:
        raise HTTPException(status_code=400, detail="Invalid bed status value.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
        UPDATE beds 
        SET status = ?, patient_name = NULL, patient_age = NULL, patient_gender = NULL, admission_date = NULL
        WHERE bed_number = ?
        """, (new_status, bed_number))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database write error: {str(e)}")
    finally:
        conn.close()
        
    return {"message": f"Bed {bed_number} status updated to {new_status}."}


@router.get("/forecast")
def get_bed_forecast():
    """
    AI Bed Demand Forecast.
    Generates a 7-day occupancy projection using current database occupancy rates, 
    day-of-week seasonal trends, and simulated noise.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM beds")
    total_beds = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM beds WHERE status = 'Occupied'")
    occupied_beds = cursor.fetchone()[0]
    conn.close()
    
    # Calculate baseline occupancy percentage
    base_percent = (occupied_beds / total_beds) * 100 if total_beds > 0 else 50.0
    
    forecast_data = []
    now = datetime.now()
    
    # Generate forecast over 7 days
    for i in range(8):
        date_val = now + timedelta(days=i)
        date_str = date_val.strftime("%a (%b %d)")
        
        # Simulated seasonal occupancy (weekday surge, weekend slight drop)
        weekday = date_val.weekday() # 0 = Monday, 6 = Sunday
        seasonal_effect = 12.0 * (1.0 - abs(weekday - 2) / 3.0)  # Peak around Wednesday
        
        # Add random noise
        noise = random.uniform(-4.0, 4.0)
        
        predicted_percent = min(100.0, max(15.0, base_percent + seasonal_effect + noise))
        predicted_occupied = int(round((predicted_percent / 100.0) * total_beds))
        
        forecast_data.append({
            "label": date_str,
            "occupancy_rate": round(predicted_percent, 1),
            "predicted_occupied": predicted_occupied,
            "total_beds": total_beds
        })
        
    return {
        "current_occupancy_count": occupied_beds,
        "total_beds_count": total_beds,
        "forecast": forecast_data
    }


@router.post("/add")
def add_new_bed(payload: Dict[str, Any] = Body(...)):
    """Registers a new bed into the hospital capacity catalog."""
    bed_number = payload.get("bed_number")
    ward_type = payload.get("ward_type", "General Ward")
    status_val = payload.get("status", "Available")

    if not bed_number:
        raise HTTPException(status_code=400, detail="bed_number is required.")

    valid_statuses = ["Available", "Occupied", "Cleaning", "Maintenance"]
    if status_val not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM beds WHERE bed_number = ?", (bed_number,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail=f"Bed number {bed_number} already exists.")

    try:
        cursor.execute("""
        INSERT INTO beds (bed_number, ward_type, status, patient_name, patient_age, patient_gender, admission_date)
        VALUES (?, ?, ?, NULL, NULL, NULL, NULL)
        """, (bed_number, ward_type, status_val))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database write error: {str(e)}")
    finally:
        conn.close()

    return {"message": f"Bed {bed_number} ({ward_type}) added successfully with status '{status_val}'."}

