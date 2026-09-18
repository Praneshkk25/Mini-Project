from fastapi import APIRouter
from typing import List, Optional
from app.database import get_db_connection

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/patient/{patient_id}")
def get_patient_notifications(patient_id: str):
    """Returns patient-specific notifications and unread count."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM notifications 
    WHERE patient_id = ?
    ORDER BY id DESC LIMIT 20
    """, (patient_id,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "title": r["title"],
            "desc": r["desc"],
            "type": r["type"],
            "time": r["time_str"],
            "unread": bool(r["unread"])
        })

    # Default mock if empty
    if not results:
        results = [
            {"id": 1, "title": "AuraHealth Welcome", "desc": "Welcome to your AuraHealth Patient Portal.", "time": "Just now", "unread": True, "type": "appointment"},
            {"id": 2, "title": "MediKiosk Active", "desc": "Complete your AI clinical intake anytime.", "time": "Today", "unread": False, "type": "queue"}
        ]

    unread_count = sum(1 for n in results if n["unread"])
    return {
        "unread_count": unread_count,
        "notifications": results
    }

@router.post("/read-all/{patient_id}")
def mark_all_notifications_read(patient_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET unread = 0 WHERE patient_id = ?", (patient_id,))
    conn.commit()
    conn.close()
    return {"message": "All notifications marked as read."}
