from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.services.post_discharge_service import PostDischargeService

router = APIRouter(prefix="/api/remote-rpm", tags=["AI Post-Discharge & Remote Patient Monitoring"])

class CheckinSubmissionRequest(BaseModel):
    patient_id: str
    milestone_day: int
    user_message: str
    pain_score: Optional[int] = 2
    medication_adherent: Optional[int] = 1
    channel: Optional[str] = "WHATSAPP"

class ResolveEscalationRequest(BaseModel):
    escalation_id: str
    physician_note: str

class WhatsAppWebhookSimRequest(BaseModel):
    from_phone: str
    patient_id: Optional[str] = "PT-1002"
    milestone_day: Optional[int] = 1
    text: str

@router.get("/patient/{patient_id}/timeline")
def get_patient_remote_timeline(patient_id: str):
    """Retrieves post-discharge milestones (Day 1, 3, 7, 14, 30), check-in history, and adherence."""
    return PostDischargeService.get_patient_timeline(patient_id)

@router.post("/checkin")
def submit_patient_checkin(req: CheckinSubmissionRequest):
    """
    Submits patient check-in response.
    Analyzes symptoms with Clinical NLP, evaluates red-flags, and alerts doctor if critical.
    """
    return PostDischargeService.process_patient_checkin(
        patient_id=req.patient_id,
        milestone_day=req.milestone_day,
        user_message=req.user_message,
        pain_score=req.pain_score,
        medication_adherent=req.medication_adherent,
        channel=req.channel or "PORTAL"
    )

@router.get("/doctor/escalations")
def get_doctor_escalations():
    """Lists urgent post-discharge patient alerts requiring attending physician review."""
    return PostDischargeService.get_active_escalations()

@router.post("/doctor/escalations/resolve")
def resolve_doctor_escalation(req: ResolveEscalationRequest):
    """Attending doctor marks post-discharge escalation as resolved with clinical notes."""
    return PostDischargeService.resolve_escalation(req.escalation_id, req.physician_note)

@router.post("/whatsapp/simulate")
def simulate_whatsapp_message(req: WhatsAppWebhookSimRequest):
    """
    Simulates incoming WhatsApp conversational AI message from discharged patient.
    Returns the automated AI triage response and records the telemetry.
    """
    res = PostDischargeService.process_patient_checkin(
        patient_id=req.patient_id,
        milestone_day=req.milestone_day,
        user_message=req.text,
        channel="WHATSAPP"
    )
    return {
        "whatsapp_status": "DELIVERED",
        "sender": req.from_phone,
        "incoming_text": req.text,
        "outgoing_ai_reply": res["reply_message"],
        "clinical_triage": res
    }

