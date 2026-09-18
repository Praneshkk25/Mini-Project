"""
FastAPI Routes for MedGemma AI Clinical & Voice Services.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.ai.medgemma_service import MedGemmaService
from app.ai.intake_service import IntakeService
from app.ai.safety_service import SafetyService
from app.ai.tool_executor import ToolExecutor

router = APIRouter(prefix="/api/ai", tags=["MedGemma AI"])

class PatientQueryRequest(BaseModel):
    query: Optional[str] = None
    message: Optional[str] = None
    patient_id: Optional[str] = None
    role: str = "patient"
    history: Optional[List[Dict[str, Any]]] = []

class IntakeAnalysisRequest(BaseModel):
    chief_complaint: str
    symptoms: Optional[List[str]] = []
    severity: int = 5

class RecordSummarizationRequest(BaseModel):
    patient_data: Dict[str, Any]

class ToolExecutionRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    user_role: str = "patient"
    user_id: Optional[str] = ""

@router.post("/chat")
def patient_ai_chat(req: PatientQueryRequest):
    """Handles patient health inquiries with MedGemma reasoning and grounded patient context."""
    user_prompt = (req.query or req.message or "").strip()
    if not user_prompt:
        raise HTTPException(status_code=400, detail="Query or message content is required.")

    result = MedGemmaService.answer_patient_query(
        user_prompt, 
        patient_context={"patient_id": req.patient_id},
        history=req.history
    )
    return result

@router.post("/intake/analyze")
def analyze_kiosk_intake(req: IntakeAnalysisRequest):
    """Analyzes MediKiosk patient health intake and recommends department/triage priority."""
    result = IntakeService.process_intake(req.chief_complaint, req.symptoms, req.severity)
    return result

@router.post("/doctor/summarize")
def summarize_clinical_record(req: RecordSummarizationRequest):
    """Generates an AI Clinical Summary of patient history for physicians."""
    result = MedGemmaService.summarize_patient_record(req.patient_data)
    return result

@router.post("/tools/execute")
def execute_controlled_tool(req: ToolExecutionRequest):
    """Executes controlled backend tool with RBAC permission enforcement."""
    result = ToolExecutor.execute_tool(req.tool_name, req.parameters, req.user_role, req.user_id)
    if not result.get("success", True):
        raise HTTPException(status_code=403, detail=result.get("error", "Execution failed"))
    return result
