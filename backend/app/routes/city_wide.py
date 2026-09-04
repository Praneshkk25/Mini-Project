from fastapi import APIRouter, Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from app.database import get_db_connection
from app.routes.queues import DEPT_SETTINGS
from app.queue_model import calculate_mmc_metrics

router = APIRouter(prefix="/api/city-wide", tags=["City-Wide Integration"])

# Simulated API Key security for city-wide nodes
API_KEY_NAME = "X-City-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def validate_api_key(api_key: str = Security(api_key_header)):
    # For demo/hackathon purposes, allow any key, but log/verify its presence
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing City Integration API Key (Header: X-City-API-Key)"
        )
    return api_key

@router.get("/beds")
def get_city_beds(api_key: str = Security(validate_api_key)):
    """Exposes real-time bed inventory to the central city administration module."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get overall counts
    cursor.execute("SELECT ward_type, status, COUNT(*) as count FROM beds GROUP BY ward_type, status")
    rows = cursor.fetchall()
    conn.close()
    
    # Format database response
    breakdown = {}
    total_beds = 0
    available_beds = 0
    
    for r in rows:
        ward = r["ward_type"]
        status_val = r["status"]
        count = r["count"]
        
        if ward not in breakdown:
            breakdown[ward] = {"Total": 0, "Available": 0, "Occupied": 0, "Cleaning": 0, "Maintenance": 0}
            
        breakdown[ward][status_val] = count
        breakdown[ward]["Total"] += count
        total_beds += count
        if status_val == "Available":
            available_beds += count
            
    return {
        "hospital_id": "DELHI-GEN-HOSP-04",
        "hospital_name": "City General Hospital, Delhi",
        "beds": {
            "total_beds": total_beds,
            "available_beds": available_beds,
            "occupancy_rate": round(((total_beds - available_beds) / total_beds) * 100, 1) if total_beds > 0 else 0.0,
            "ward_breakdown": breakdown
        }
    }


@router.get("/queues")
def get_city_queues(api_key: str = Security(validate_api_key)):
    """Exposes real-time queuing bottlenecks to the central city traffic routing node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    queues_summary = {}
    overall_waiting = 0
    
    for dept, settings in DEPT_SETTINGS.items():
        cursor.execute("SELECT COUNT(*) FROM opd_queue WHERE department = ? AND status = 'Waiting'", (dept,))
        waiting_count = cursor.fetchone()[0]
        overall_waiting += waiting_count
        
        # Calculate queue metrics
        metrics = calculate_mmc_metrics(
            arrival_rate=settings["arrival_rate"],
            service_rate=settings["service_rate"],
            num_doctors=settings["num_doctors"]
        )
        
        queues_summary[dept] = {
            "waiting_patients": waiting_count,
            "active_doctors": settings["num_doctors"],
            "expected_wait_time_minutes": metrics["avg_wait_time_minutes"],
            "utilization_rate": metrics["utilization"],
            "congestion_status": metrics["status"]
        }
        
    conn.close()
    
    return {
        "hospital_id": "DELHI-GEN-HOSP-04",
        "hospital_name": "City General Hospital, Delhi",
        "queues": {
            "overall_waiting_patients": overall_waiting,
            "department_status": queues_summary
        }
    }


@router.get("/emergency-status")
def get_emergency_status(api_key: str = Security(validate_api_key)):
    """Lightweight indicator for emergency vehicle routing decisions (e.g. divert ambulances)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check Emergency ward occupancy
    cursor.execute("SELECT status, COUNT(*) as count FROM beds WHERE ward_type = 'Emergency' GROUP BY status")
    rows = cursor.fetchall()
    
    er_total = 0
    er_available = 0
    for r in rows:
        er_total += r["count"]
        if r["status"] == "Available":
            er_available += r["count"]
            
    # Check general wait time in Cardiology / Medicine
    cursor.execute("SELECT COUNT(*) FROM opd_queue WHERE department = 'General Medicine' AND status = 'Waiting'")
    med_waiting = cursor.fetchone()[0]
    conn.close()
    
    status_label = "NORMAL"
    if er_available == 0:
        status_label = "CRITICAL (No Emergency Beds)"
    elif med_waiting > 10 or er_available <= 1:
        status_label = "CONGESTED (High Wait Times)"
        
    return {
        "hospital_id": "DELHI-GEN-HOSP-04",
        "status": status_label,
        "emergency_beds_available": er_available,
        "emergency_beds_total": er_total,
        "general_medicine_waiting": med_waiting
    }


@router.get("/inventory")
def get_city_inventory(api_key: str = Security(validate_api_key)):
    """Exposes critical pharmaceutical supply levels to the central city logistics grid."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT medicine_name, stock_level, reorder_level, expiry_date FROM inventory")
    rows = cursor.fetchall()
    conn.close()
    
    total_items = len(rows)
    low_stock_items = []
    
    for r in rows:
        if r["stock_level"] <= r["reorder_level"]:
            low_stock_items.append({
                "medicine_name": r["medicine_name"],
                "stock_level": r["stock_level"],
                "reorder_level": r["reorder_level"]
            })
            
    return {
        "hospital_id": "DELHI-GEN-HOSP-04",
        "hospital_name": "City General Hospital, Delhi",
        "inventory": {
            "total_medicines_tracked": total_items,
            "critical_shortage_count": len(low_stock_items),
            "critical_items": low_stock_items
        }
    }


@router.get("/hospitals")
def search_city_hospitals(city: str = "Delhi NCR"):
    """Public endpoint for patients to search real-time hospital bed availability by city."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if city and city != "All":
        cursor.execute("SELECT * FROM city_hospitals WHERE city LIKE ?", (f"%{city}%",))
    else:
        cursor.execute("SELECT * FROM city_hospitals")
        
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {
        "selected_city": city,
        "total_hospitals_found": len(rows),
        "hospitals": rows
    }


