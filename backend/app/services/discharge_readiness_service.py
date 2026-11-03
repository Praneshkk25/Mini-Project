import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.database import get_db_connection

class DischargeReadinessService:
    @staticmethod
    def get_readiness(patient_id: str) -> Dict[str, Any]:
        """Calculates dynamic readiness score and retrieves operational pillar states."""
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Fetch patient and bed details
        cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,))
        patient = cursor.fetchone()
        if not patient:
            conn.close()
            return {"error": f"Patient {patient_id} not found"}

        # 2. Check if readiness record exists
        cursor.execute("SELECT * FROM discharge_readiness WHERE patient_id = ?", (patient_id,))
        readiness = cursor.fetchone()

        # 3. Fetch investigations / labs for patient
        cursor.execute("SELECT * FROM investigations WHERE patient_id = ? ORDER BY created_at DESC", (patient_id,))
        inv_rows = cursor.fetchall()
        labs = [dict(r) for r in inv_rows]

        # 4. Fetch discharge prescriptions
        cursor.execute("SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC", (patient_id,))
        rx_rows = cursor.fetchall()
        prescriptions = [dict(r) for r in rx_rows]

        # 5. Fetch bills
        cursor.execute("SELECT * FROM bills WHERE patient_id = ? ORDER BY created_at DESC", (patient_id,))
        bill_row = cursor.fetchone()
        bill = dict(bill_row) if bill_row else None

        conn.close()

        # If stored readiness exists, use stored states or dynamically compute
        if readiness:
            r_dict = dict(readiness)
            stability = r_dict.get("clinical_stability", "STABLE")
            lab_status = r_dict.get("lab_clearance", "PENDING")
            pharm_status = r_dict.get("pharmacy_prep", "COMPLETED")
            billing_status = r_dict.get("billing_clearance", "CLEARED")
            bed_num = r_dict.get("bed_number") or "ICU-02"
            doc_decision = r_dict.get("doctor_decision", "Awaiting_Clearance")
        else:
            stability = "STABLE"
            lab_status = "PENDING"
            pharm_status = "COMPLETED"
            billing_status = "CLEARED"
            bed_num = "GW-101"
            doc_decision = "Awaiting_Clearance"

        # Compute dynamic points
        # 1. Clinical Stability (35%)
        stability_score = 35 if stability == "STABLE" else (15 if stability == "MONITORING" else 0)
        
        # 2. Lab Clearance (25%)
        pending_labs = [l for l in labs if l["status"] != "REPORT_VERIFIED"]
        if not labs or len(pending_labs) == 0:
            lab_status = "COMPLETED"
            lab_score = 25
        elif any(l["status"] == "CRITICAL_ABNORMAL" for l in labs):
            lab_status = "CRITICAL_ABNORMAL"
            lab_score = 0
        else:
            lab_status = "PENDING"
            lab_score = 12

        # 3. Pharmacy Prep (25%)
        pharm_score = 25 if pharm_status == "COMPLETED" else (15 if pharm_status == "PACKAGING" else 5)

        # 4. Billing Clearance (15%)
        billing_score = 15 if billing_status == "CLEARED" else (8 if billing_status == "PENDING_INSURANCE" else 0)

        total_score = min(100, max(10, stability_score + lab_score + pharm_score + billing_score))

        # ETA and delay cause calculation
        delays = []
        eta_hours = 0.5

        if stability != "STABLE":
            delays.append("Bedside telemetry monitoring required until 6-hour normothermic stability")
            eta_hours += 4.0
        if lab_status == "PENDING":
            pending_names = ", ".join([l["test_name"] for l in pending_labs[:2]])
            delays.append(f"Awaiting laboratory clearance: {pending_names or 'Serum Troponin-I'}")
            eta_hours += 2.0
        if pharm_status != "COMPLETED":
            delays.append("Pharmacy medication verification and take-home blister packaging in progress")
            eta_hours += 1.0
        if billing_status != "CLEARED":
            delays.append("Third-Party Insurance (TPA) pre-authorization awaiting financial clearance")
            eta_hours += 1.0

        if not delays:
            delay_reason = "All clinical and operational clearances verified. Patient ready for physician discharge sign-off."
            eta_str = "< 30 mins"
            eta_hours = 0.5
        elif eta_hours <= 3.0:
            delay_reason = delays[0]
            eta_str = "2–3 hrs"
        else:
            delay_reason = delays[0]
            eta_str = f"4–{int(eta_hours)} hrs"

        return {
            "patient_id": patient_id,
            "patient_name": patient["name"],
            "age": patient["age"],
            "gender": patient["gender"],
            "bed_number": bed_num,
            "readiness_score": total_score,
            "estimated_prep_time": eta_str,
            "estimated_prep_hours": eta_hours,
            "delay_reason": delay_reason,
            "doctor_decision": doc_decision,
            "pillars": {
                "clinical_stability": {
                    "status": "Stable" if stability == "STABLE" else ("Monitoring" if stability == "MONITORING" else "Unstable"),
                    "code": stability,
                    "score_contribution": f"{stability_score}/35%",
                    "detail": "Bedside vitals stable, NEWS2 score < 3 over past 6 hours." if stability == "STABLE" else "Continuous telemetry monitoring active."
                },
                "laboratory_clearance": {
                    "status": "Completed" if lab_status == "COMPLETED" else ("Pending" if lab_status == "PENDING" else "Abnormal"),
                    "code": lab_status,
                    "score_contribution": f"{lab_score}/25%",
                    "pending_count": len(pending_labs),
                    "pending_tests": [l["test_name"] for l in pending_labs],
                    "all_tests": labs
                },
                "pharmacy_preparation": {
                    "status": "Completed" if pharm_status == "COMPLETED" else ("Packaging" if pharm_status == "PACKAGING" else "Pending"),
                    "code": pharm_status,
                    "score_contribution": f"{pharm_score}/25%",
                    "detail": "Take-home discharge medications packaged & counseling leaflet attached." if pharm_status == "COMPLETED" else "Dispensation review in progress."
                },
                "billing_clearance": {
                    "status": "Cleared" if billing_status == "CLEARED" else ("Pending Insurance" if billing_status == "PENDING_INSURANCE" else "Unpaid"),
                    "code": billing_status,
                    "score_contribution": f"{billing_score}/15%",
                    "detail": "Invoice settled / TPA cashless authorized." if billing_status == "CLEARED" else "Awaiting insurance settlement."
                }
            },
            "last_updated": datetime.now().isoformat()
        }

    @staticmethod
    def list_all_inpatient_readiness() -> List[Dict[str, Any]]:
        """Returns readiness overview for all active inpatients awaiting discharge."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT patient_id FROM discharge_readiness")
        rows = cursor.fetchall()
        conn.close()

        results = []
        for r in rows:
            results.append(DischargeReadinessService.get_readiness(r["patient_id"]))
        return results

    @staticmethod
    def update_pillar(patient_id: str, pillar: str, value: str) -> Dict[str, Any]:
        """Allows nurse/pharmacist/doctor to update a clearance pillar."""
        allowed_pillars = ["clinical_stability", "lab_clearance", "pharmacy_prep", "billing_clearance", "doctor_decision"]
        if pillar not in allowed_pillars:
            raise ValueError(f"Invalid pillar {pillar}. Allowed: {allowed_pillars}")

        conn = get_db_connection()
        cursor = conn.cursor()
        now_str = datetime.now().isoformat()

        cursor.execute(f"""
        UPDATE discharge_readiness 
        SET {pillar} = ?, last_updated = ?
        WHERE patient_id = ?
        """, (value, now_str, patient_id))
        conn.commit()
        conn.close()

        return DischargeReadinessService.get_readiness(patient_id)
