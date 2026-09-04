from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/billing", tags=["Billing"])

class BillingClearanceRequest(BaseModel):
    patient_id: str
    patient_name: str
    insurance_provider: str
    policy_number: str
    claim_amount: float

@router.post("/clearance")
def process_billing_clearance(req: BillingClearanceRequest):
    clearance_id = f"CLR-2026-{req.patient_id[:6].upper() if req.patient_id else '8849'}"
    qr_payload = f"AURAHEALTH://VERIFY_DISCHARGE?clearance={clearance_id}&patient={req.patient_name}&amount={req.claim_amount}"
    
    return {
        "status": "APPROVED",
        "clearance_id": clearance_id,
        "patient_name": req.patient_name,
        "insurance_status": "Verified & Cleared 100%",
        "approved_amount": req.claim_amount,
        "out_of_pocket": 0.0,
        "qr_verification_code": qr_payload,
        "download_pdf_url": f"/api/billing/pdf/{clearance_id}"
    }
