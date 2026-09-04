import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.services.monitoring_service import monitoring_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/monitoring", tags=["Real-Time Patient Monitoring"])

class TriggerCriticalRequest(BaseModel):
    duration_seconds: int = 30


@router.get("/patients", summary="Get all monitored patients and current statuses")
def get_monitored_patients():
    """Returns the latest telemetry snapshot for all monitored patients."""
    return monitoring_service.get_all_patients_latest()


@router.get("/patients/{patient_id}", summary="Get vital snapshot and details for a single patient")
def get_patient_detail(patient_id: str):
    """Returns latest vital signs and status for a specific patient."""
    patient = monitoring_service.get_patient_latest(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient with ID '{patient_id}' not found in monitoring system.")
    return patient


@router.get("/vitals/latest", summary="Get latest vital readings across all monitors")
def get_latest_vitals():
    """Returns latest vitals dictionary keyed by patient_id."""
    return monitoring_service.get_all_patients_latest()


@router.get("/vitals/history/{patient_id}", summary="Get historical vital trends for a patient")
def get_patient_history(
    patient_id: str,
    limit: int = Query(30, ge=5, le=100, description="Number of recent data points to return")
):
    """Returns recent time-series vital history for line charts."""
    patient = monitoring_service.get_patient_latest(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")
    return monitoring_service.get_patient_history(patient_id, limit=limit)


@router.get("/alerts", summary="Get active and recent alert log")
def get_recent_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity: 'CRITICAL', 'WARNING', or 'ALL'"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of alerts to return")
):
    """Returns list of recent threshold alerts."""
    return monitoring_service.get_recent_alerts(severity_filter=severity, limit=limit)


@router.get("/stats", summary="Get aggregated monitoring statistics")
def get_monitoring_stats():
    """Returns summary analytics for monitoring dashboard (patient counts, average vitals, alert rates)."""
    return monitoring_service.get_summary_stats()


@router.post("/simulator/start", summary="Start background patient telemetry simulator")
def start_simulator():
    """Starts continuous background generation of synthetic patient telemetry events."""
    success = monitoring_service.start_simulation()
    return {"message": "Patient vital simulator started successfully.", "active": success}


@router.post("/simulator/stop", summary="Stop background patient telemetry simulator")
def stop_simulator():
    """Pauses background generation of patient telemetry events."""
    success = monitoring_service.stop_simulation()
    return {"message": "Patient vital simulator stopped.", "active": not success}


@router.post("/simulator/patient/{patient_id}/critical", summary="Force a patient into a severe critical state")
def trigger_critical_patient(patient_id: str, body: Optional[TriggerCriticalRequest] = None):
    """Forces abnormal vital signs (hypoxemia, tachycardia, fever) for a patient for testing alert pipelines."""
    duration = body.duration_seconds if body else 30
    success = monitoring_service.trigger_patient_critical(patient_id, duration_seconds=duration)
    if not success:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")
    return {
        "message": f"CRITICAL state triggered for patient {patient_id} for {duration} seconds.",
        "patient_id": patient_id,
        "duration_seconds": duration,
        "status": "CRITICAL_TRIGGERED"
    }


@router.get("/stream/status", summary="Get Kafka / PySpark / Simulator streaming health status")
def get_stream_status():
    """Returns system status, active mode (Kafka vs Simulation), and connection indicators."""
    return monitoring_service.get_stream_status()


# WebSocket Endpoint (mounted under /ws/monitoring)
async def handle_monitoring_websocket(websocket: WebSocket):
    await monitoring_service.ws_manager.connect(websocket)
    try:
        # Send initial snapshot of all current patient vitals upon connection
        snapshot = monitoring_service.get_all_patients_latest()
        alerts = monitoring_service.get_recent_alerts(limit=20)
        await websocket.send_json({
            "type": "initial_snapshot",
            "vitals": snapshot,
            "alerts": alerts,
            "stats": monitoring_service.get_summary_stats()
        })

        # Keep connection open and handle incoming ping / client messages
        while True:
            data = await websocket.receive_text()
            # Echo back pong or status on client ping
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        monitoring_service.ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"[WEBSOCKET ERROR] {str(e)}")
        monitoring_service.ws_manager.disconnect(websocket)
