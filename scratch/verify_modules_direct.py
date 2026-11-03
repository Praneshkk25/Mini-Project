import sys
import os
from datetime import datetime

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

backend_dir = r"c:\Users\student.CSELAB\Documents\MINI PROJECT TEAM 1\Mini-Project\backend"
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

from app.database import get_db_connection
from app.services.alert_service import calculate_news2, evaluate_patient_vitals
from app.services.discharge_readiness_service import DischargeReadinessService
from app.services.post_discharge_service import PostDischargeService
from streaming.schemas import PatientVitalEvent

def test():
    print("--- 1. Testing Patient Authentication Records in SQLite ---")
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT patient_id, name, phone, password FROM patients WHERE phone = '+91 98765 43212'")
    row = c.fetchone()
    print("Eleanor Vance record:", dict(row) if row else "NOT FOUND")
    assert row is not None
    assert row["password"] == "patient123"
    print("   [OK] Patient password verified.")

    print("\n--- 2. Testing Module 1: NEWS2 & CDS Calculations ---")
    now_iso = datetime.now().isoformat()
    vital_normal = PatientVitalEvent(
        patient_id="PT-1002",
        patient_name="Eleanor Vance",
        bed_id="ICU-02",
        department="Cardiology",
        timestamp=now_iso,
        heart_rate=75,
        spo2=98,
        systolic_bp=120,
        diastolic_bp=80,
        temperature=36.8,
        respiratory_rate=16
    )
    n2_score, n2_risk, n2_prob = calculate_news2(vital_normal)
    print(f"Normal Vitals: Score={n2_score}, Risk={n2_risk}, DeteriorationProb={n2_prob*100:.1f}%")
    assert n2_score <= 2
    assert n2_risk == "LOW"

    vital_critical = PatientVitalEvent(
        patient_id="PT-1002",
        patient_name="Eleanor Vance",
        bed_id="ICU-02",
        department="Cardiology",
        timestamp=now_iso,
        heart_rate=138,
        spo2=88,
        systolic_bp=84,
        diastolic_bp=55,
        temperature=39.2,
        respiratory_rate=29
    )
    processed_vital, alerts = evaluate_patient_vitals(vital_critical)
    print(f"Critical Vital Evaluated: Overall={processed_vital.overall_status}")
    print(f"NEWS2 Score: {processed_vital.news2_score}, Classification: {processed_vital.risk_classification}")
    print(f"Deterioration Probability: {processed_vital.deterioration_probability * 100:.1f}%")
    print(f"CDS Insights: {processed_vital.cds_insights[:2]}")
    print(f"CDS Recommendations: {processed_vital.cds_recommendations[:2]}")
    assert processed_vital.news2_score >= 7
    assert processed_vital.risk_classification == "HIGH"
    assert len(processed_vital.cds_recommendations) > 0
    print("   [OK] Module 1 NEWS2 and CDS verified.")

    print("\n--- 3. Testing Module 2: Intelligent Discharge Readiness ---")
    readiness = DischargeReadinessService.get_readiness("PT-1002")
    print(f"Patient: {readiness['patient_name']} (Bed: {readiness['bed_number']})")
    print(f"Readiness Score: {readiness['readiness_score']}%")
    print(f"Estimated Prep Time: {readiness['estimated_prep_time']}")
    print(f"Clinical Stability: {readiness['pillars']['clinical_stability']['status']}")
    print(f"Lab Clearance: {readiness['pillars']['laboratory_clearance']['status']}")
    print(f"Pharmacy Prep: {readiness['pillars']['pharmacy_preparation']['status']}")
    print(f"Delay Reason: {readiness['delay_reason']}")
    assert readiness["readiness_score"] >= 50
    print("   [OK] Module 2 Discharge Readiness dynamic calculation verified.")

    print("\n--- 4. Testing Module 3: Post-Discharge Enrollment, Check-Ins & Red Flags ---")
    # Enroll Eleanor
    milestones = PostDischargeService.enroll_patient("PT-1002", "Dr. Sarah Jenkins")
    print(f"Enrolled in {len(milestones)} milestones: Day 1, 3, 7, 14, 30")

    # Safe check-in
    res_safe = PostDischargeService.process_patient_checkin(
        patient_id="PT-1002",
        milestone_day=1,
        user_message="Mild soreness around wound, no fever, taking all my tablets with breakfast.",
        pain_score=2,
        medication_adherent=1,
        channel="PORTAL"
    )
    print("Safe Check-In Escalated?", res_safe["escalated"])
    print("AI Response:", res_safe["reply_message"])
    assert res_safe["escalated"] is False

    # Red-flag check-in
    res_redflag = PostDischargeService.process_patient_checkin(
        patient_id="PT-1002",
        milestone_day=3,
        user_message="Experiencing severe chest pain radiating to left shoulder and breathing trouble.",
        pain_score=9,
        medication_adherent=0,
        channel="WHATSAPP"
    )
    print("Red-Flag Check-In Escalated?", res_redflag["escalated"])
    print("AI Triage Severity:", res_redflag["severity"])
    print("AI Alert Reply:", res_redflag["reply_message"])
    assert res_redflag["escalated"] is True

    # Active escalations check
    esc_list = PostDischargeService.get_active_escalations()
    print(f"Active Doctor Escalations Count: {len(esc_list)}")
    assert len(esc_list) > 0

    conn.close()
    print("\n" + "=" * 60)
    print("ALL 3 MODULES VERIFIED 100% FUNCTIONAL!")
    print("=" * 60)

if __name__ == "__main__":
    test()
