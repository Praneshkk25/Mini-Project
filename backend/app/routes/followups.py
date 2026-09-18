from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.database import get_db_connection

router = APIRouter(prefix="/api/followups", tags=["Follow-Up Consultations"])

@router.get("/patient/{patient_id}")
def get_patient_followups(patient_id: str):
    """Returns clinician-ordered care reviews and scheduled clinic follow-ups."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM followups 
    WHERE patient_id = ?
    ORDER BY followup_date ASC
    """, (patient_id,))
    rows = cursor.fetchall()

    if not rows:
        cursor.execute("SELECT name FROM patients WHERE patient_id = ?", (patient_id,))
        pt = cursor.fetchone()
        if pt:
            cursor.execute("""
            SELECT * FROM followups 
            WHERE patient_id IN (SELECT patient_id FROM patients WHERE name = ?)
            ORDER BY followup_date ASC
            """, (pt["name"],))
            rows = cursor.fetchall()

    conn.close()

    results = []
    for r in rows:
        results.append({
            "id": r["followup_id"],
            "followup_id": r["followup_id"],
            "visit_id": r["visit_id"],
            "doctor_name": r["doctor_name"],
            "department": r["department"],
            "hospital": "AuraHealth Central Hospital",
            "room": "Room 302" if "Cardio" in r["department"] else "Room 201",
            "date": r["followup_date"],
            "time": r["followup_time"],
            "reason": r["reason"],
            "status": r["status"] or "CONFIRMED"
        })

    return results
