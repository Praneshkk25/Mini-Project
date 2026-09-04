import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.database import get_db_connection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/audit", tags=["Audit Logs & Security Trail"])

@router.get("/logs")
def get_audit_logs(
    role: Optional[str] = Query(None, description="Filter by user role"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    limit: int = Query(50, description="Max logs to return")
):
    """Returns chronologically ordered system audit log entries for healthcare data governance."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM audit_logs WHERE 1=1"
    params = []
    
    if role:
        query += " AND role = ?"
        params.append(role)
        
    if action:
        query += " AND action = ?"
        params.append(action)
        
    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {
        "total_logs": len(rows),
        "logs": rows
    }
