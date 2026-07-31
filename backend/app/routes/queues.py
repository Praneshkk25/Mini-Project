from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, Any, List
from datetime import datetime
import uuid

from app.database import get_db_connection
from app.queue_model import calculate_mmc_metrics
from app.ai_triage import analyze_symptoms

router = APIRouter(prefix="/api/queues", tags=["Queues"])

# Live settings which can be tweaked via UI to simulate different queuing loads
DEPT_SETTINGS = {
    "General Medicine": {"num_doctors": 2, "arrival_rate": 8.0, "service_rate": 5.0},
    "Cardiology": {"num_doctors": 1, "arrival_rate": 2.0, "service_rate": 3.0},
    "Pediatrics": {"num_doctors": 1, "arrival_rate": 4.0, "service_rate": 6.0},
    "Orthopedics": {"num_doctors": 1, "arrival_rate": 3.0, "service_rate": 4.0},
    "Dermatology": {"num_doctors": 1, "arrival_rate": 2.0, "service_rate": 4.0}
}

@router.get("/status")
def get_queue_status():
    """Returns live queuing theory statistics alongside real DB counts for all departments."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    results = {}
    for dept, settings in DEPT_SETTINGS.items():
        # Get actual counts from Database
        cursor.execute(
            "SELECT COUNT(*) FROM opd_queue WHERE department = ? AND status = 'Waiting'", 
            (dept,)
        )
        waiting_count = cursor.fetchone()[0]
        
        cursor.execute(
            "SELECT COUNT(*) FROM opd_queue WHERE department = ? AND status = 'In-Consultation'", 
            (dept,)
        )
        consultation_count = cursor.fetchone()[0]
        
        # Calculate queuing theory analytics
        metrics = calculate_mmc_metrics(
            arrival_rate=settings["arrival_rate"],
            service_rate=settings["service_rate"],
            num_doctors=settings["num_doctors"]
        )
        
        results[dept] = {
            "department": dept,
            "active_doctors": settings["num_doctors"],
            "arrival_rate_hr": settings["arrival_rate"],
            "service_rate_hr": settings["service_rate"],
            "actual_waiting_count": waiting_count,
            "actual_consultation_count": consultation_count,
            "utilization": metrics["utilization"],
            "expected_wait_time_minutes": metrics["avg_wait_time_minutes"],
            "status": metrics["status"]
        }
        
    conn.close()
    return results


@router.get("/list")
def get_queue_list(department: str = None, status: str = None, search: str = None):
    """Returns list of patients in the OPD queue with optional department, status, and search filters."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM opd_queue WHERE 1=1"
    params = []
    
    if department:
        query += " AND department = ?"
        params.append(department)
        
    if status:
        if status.lower() == "active":
            query += " AND status IN ('Waiting', 'In-Consultation')"
        elif status.lower() != "all":
            query += " AND LOWER(status) = LOWER(?)"
            params.append(status)
    else:
        # Default to active patients if status filter not provided
        query += " AND status IN ('Waiting', 'In-Consultation')"
        
    if search:
        search_pattern = f"%{search.strip()}%"
        query += " AND (patient_name LIKE ? OR ticket_number LIKE ? OR symptoms LIKE ?)"
        params.extend([search_pattern, search_pattern, search_pattern])
        
    query += " ORDER BY CASE priority WHEN 'Immediate' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, check_in_time ASC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(r) for r in rows]



@router.post("/triage")
def triage_symptoms(payload: Dict[str, str] = Body(...)):
    """API endpoint to run AI Triage analysis on a symptoms string."""
    symptoms = payload.get("symptoms", "")
    return analyze_symptoms(symptoms)


@router.post("/check-in")
def check_in_patient(payload: Dict[str, Any] = Body(...)):
    """Registers a new patient into the OPD queue (optionally using AI triage)."""
    name = payload.get("patient_name")
    age = payload.get("patient_age")
    gender = payload.get("patient_gender")
    symptoms = payload.get("symptoms", "")
    
    if not name:
        raise HTTPException(status_code=400, detail="Patient name is required.")
        
    # Run AI Triage to auto-assign department and priority if not explicitly chosen
    triage_result = analyze_symptoms(symptoms)
    
    department = payload.get("department") or triage_result["department"]
    priority = payload.get("priority") or triage_result["priority"]
    
    # Generate unique ticket number
    ticket_number = f"OPD-{str(uuid.uuid4().int)[:4]}"
    now_str = datetime.now().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT INTO opd_queue (ticket_number, patient_name, patient_age, patient_gender, symptoms, department, priority, status, check_in_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Waiting', ?)
        """, (ticket_number, name, age, gender, symptoms, department, priority, now_str))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database write error: {str(e)}")
    finally:
        conn.close()
        
    # Dynamically scale arrival rate slightly to simulate real check-in load
    DEPT_SETTINGS[department]["arrival_rate"] = round(DEPT_SETTINGS[department]["arrival_rate"] + 0.3, 1)
        
    return {
        "message": "Patient checked in successfully.",
        "ticket_number": ticket_number,
        "department": department,
        "priority": priority,
        "ai_routed": not payload.get("department")
    }


@router.post("/update-status")
def update_queue_status(payload: Dict[str, Any] = Body(...)):
    """Updates status (Waiting -> In-Consultation -> Completed)."""
    ticket_number = payload.get("ticket_number")
    new_status = payload.get("status")
    
    if not ticket_number or not new_status:
        raise HTTPException(status_code=400, detail="ticket_number and status are required.")
        
    if new_status not in ["Waiting", "In-Consultation", "Completed", "Cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid queue status value.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch current state to know department
    cursor.execute("SELECT department FROM opd_queue WHERE ticket_number = ?", (ticket_number,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Queue ticket not found.")
        
    department = row["department"]
    now_str = datetime.now().isoformat()
    
    if new_status in ["Completed", "Cancelled"]:
        cursor.execute(
            "UPDATE opd_queue SET status = ?, check_out_time = ? WHERE ticket_number = ?",
            (new_status, now_str, ticket_number)
        )
        # Decay arrival rate since pressure decreases
        DEPT_SETTINGS[department]["arrival_rate"] = max(1.0, round(DEPT_SETTINGS[department]["arrival_rate"] - 0.2, 1))
    else:
        cursor.execute(
            "UPDATE opd_queue SET status = ? WHERE ticket_number = ?",
            (new_status, ticket_number)
        )
        
    conn.commit()
    conn.close()
    
    return {"message": f"Ticket {ticket_number} updated to {new_status}."}


@router.post("/settings")
def update_dept_settings(payload: Dict[str, Any] = Body(...)):
    """Allows staff to change active doctors, arrival rates, and service rates to simulate queuing effects."""
    dept = payload.get("department")
    if dept not in DEPT_SETTINGS:
        raise HTTPException(status_code=400, detail="Invalid department name.")
        
    if "num_doctors" in payload:
        DEPT_SETTINGS[dept]["num_doctors"] = int(payload["num_doctors"])
    if "arrival_rate" in payload:
        DEPT_SETTINGS[dept]["arrival_rate"] = float(payload["arrival_rate"])
    if "service_rate" in payload:
        DEPT_SETTINGS[dept]["service_rate"] = float(payload["service_rate"])
        
    return {
        "message": f"Settings updated for {dept}.",
        "settings": DEPT_SETTINGS[dept]
    }


@router.delete("/cancel/{ticket_number}")
def cancel_queue_ticket(ticket_number: str):
    """Cancels/removes an OPD queue ticket by ticket number."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, department, status FROM opd_queue WHERE ticket_number = ?", (ticket_number,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Queue ticket not found.")

    department = row["department"]
    now_str = datetime.now().isoformat()
    try:
        cursor.execute(
            "UPDATE opd_queue SET status = 'Cancelled', check_out_time = ? WHERE ticket_number = ?",
            (now_str, ticket_number)
        )
        conn.commit()
        DEPT_SETTINGS[department]["arrival_rate"] = max(1.0, round(DEPT_SETTINGS[department]["arrival_rate"] - 0.2, 1))
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database update error: {str(e)}")
    finally:
        conn.close()

    return {"message": f"Ticket {ticket_number} cancelled successfully."}

