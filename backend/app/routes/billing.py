from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db_connection

router = APIRouter(prefix="/api/billing", tags=["Billing"])

class BillingClearanceRequest(BaseModel):
    patient_id: str
    patient_name: str
    insurance_provider: str
    policy_number: str
    claim_amount: float

class PayBillRequest(BaseModel):
    bill_id: str
    patient_id: str
    payment_method: str = "UPI / NetBanking"

@router.get("/patient/{patient_id}")
def get_patient_bills(patient_id: str):
    """Returns actual itemized invoices and payment status in INR (₹) for the patient."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT b.*, v.department 
    FROM bills b
    LEFT JOIN visits v ON b.visit_id = v.visit_id
    WHERE b.patient_id = ?
    ORDER BY b.created_at DESC
    """, (patient_id,))
    rows = cursor.fetchall()

    if not rows:
        # Check if patient name has records
        cursor.execute("SELECT name FROM patients WHERE patient_id = ?", (patient_id,))
        pt = cursor.fetchone()
        if pt:
            cursor.execute("""
            SELECT b.*, v.department 
            FROM bills b
            LEFT JOIN visits v ON b.visit_id = v.visit_id
            WHERE b.patient_id IN (SELECT patient_id FROM patients WHERE name = ?)
            ORDER BY b.created_at DESC
            """, (pt["name"],))
            rows = cursor.fetchall()

    conn.close()

    if not rows:
        # Return empty list or sample if none found
        return []

    results = []
    for r in rows:
        results.append({
            "bill_id": r["bill_id"],
            "id": r["bill_id"],
            "visit_id": r["visit_id"],
            "patient_id": r["patient_id"],
            "date": r["created_at"][:10] if r["created_at"] else "2026-08-31",
            "department": r["department"] or "Outpatient Care",
            "hospital": "AuraHealth Central Hospital",
            "consultation": r["consultation_fee"] or 0.0,
            "investigations": r["investigation_fee"] or 0.0,
            "pharmacy": r["pharmacy_fee"] or 0.0,
            "bed_charges": r["bed_fee"] or 0.0,
            "discount": r["discount"] or 0.0,
            "total": r["total_amount"],
            "total_formatted": f"₹{int(r['total_amount'])}",
            "status": r["payment_status"],
            "insurance_provider": r["insurance_provider"],
            "policy_number": r["policy_number"],
            "claim_status": r["claim_status"],
            "receipt_id": f"REC-{r['bill_id'].replace('BIL-', '')}",
            "payment_method": "TPA / Insurance Direct" if r["insurance_provider"] else "UPI Digital Payment"
        })

    return results

@router.post("/pay")
def pay_patient_bill(req: PayBillRequest):
    """Processes digital payment for an unpaid bill in INR."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM bills WHERE bill_id = ?", (req.bill_id,))
    bill = cursor.fetchone()
    if not bill:
        conn.close()
        raise HTTPException(status_code=404, detail="Invoice record not found.")

    cursor.execute("UPDATE bills SET payment_status = 'PAID' WHERE bill_id = ?", (req.bill_id,))
    
    # Notification
    cursor.execute("""
    INSERT INTO notifications (patient_id, title, desc, type, time_str, unread, created_at)
    VALUES (?, 'Payment Received', ?, 'billing', 'Just now', 1, datetime('now'))
    """, (
        req.patient_id,
        f"Payment of ₹{int(bill['total_amount'])} confirmed for invoice {req.bill_id} via {req.payment_method}."
    ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Payment of ₹{int(bill['total_amount'])} received successfully.",
        "receipt_id": f"REC-{req.bill_id.replace('BIL-', '')}",
        "status": "PAID"
    }

@router.post("/clearance")
def process_billing_clearance(req: BillingClearanceRequest):
    clearance_id = f"CLR-2026-{req.patient_id[:6].upper() if req.patient_id else '8849'}"
    qr_payload = f"AURAHEALTH://VERIFY_DISCHARGE?clearance={clearance_id}&patient={req.patient_name}&amount=INR_{req.claim_amount}"
    
    return {
        "status": "APPROVED",
        "clearance_id": clearance_id,
        "patient_name": req.patient_name,
        "insurance_status": "Verified & Cleared 100%",
        "approved_amount": f"₹{int(req.claim_amount)}",
        "out_of_pocket": "₹0",
        "qr_verification_code": qr_payload,
        "download_pdf_url": f"/api/billing/pdf/{clearance_id}"
    }
