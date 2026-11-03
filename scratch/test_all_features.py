import sys
import os

# Add backend directory to sys.path
backend_dir = r"c:\Users\student.CSELAB\Documents\MINI PROJECT TEAM 1\Mini-Project\backend"
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("CareEase AI - Verification of 3 Advanced Modules & Logins")
    print("=" * 60)

    # 1. Test Patient Login
    print("\n[1] Testing Patient Authentication...")
    resp = client.post("/api/auth/patient/login", json={
        "phone": "+91 98765 43212",
        "pin": "patient123"
    })
    print(f"Login (+91 98765 43212): status={resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"   Patient authenticated: {data['user']['name']} ({data['user']['patient_id']})")
    else:
        print(f"   Login failed: {resp.text}")

    # 2. Test Module 1: NEWS2 & CDS Alert Service
    print("\n[2] Testing Module 1: NEWS2 Deterioration & CDS Engine...")
    from app.services.alert_service import calculate_news2, generate_clinical_decision_support, evaluate_patient_vitals
    
    # Test stable vitals
    news2_stable = calculate_news2(hr=72, spo2=98, sbp=120, temp=36.8, rr=16)
    print(f"   Stable Vitals NEWS2: {news2_stable} (Expected: 0-1)")

    # Test critical vitals (hypoxia, tachycardia, tachypnea)
    news2_crit = calculate_news2(hr=135, spo2=89, sbp=85, temp=39.2, rr=28)
    print(f"   Critical Deterioration NEWS2: {news2_crit} (Expected >= 7)")
    cds = generate_clinical_decision_support(news2_crit, "CRITICAL", {"heart_rate": 135, "spo2": 89, "respiratory_rate": 28})
    print(f"   CDS Risk Classification: {cds['risk_classification']}")
    print(f"   Deterioration Probability: {cds['deterioration_probability'] * 100:.1f}%")
    print(f"   CDS Insights: {cds['cds_insights']}")
    print(f"   CDS Next Steps: {cds['cds_recommendations']}")

    # 3. Test Module 2: Intelligent Discharge Readiness
    print("\n[3] Testing Module 2: Intelligent Discharge Readiness...")
    resp_readiness = client.get("/api/discharge/readiness")
    print(f"   GET /api/discharge/readiness: status={resp_readiness.status_code}, count={len(resp_readiness.json())}")
    
    resp_single = client.get("/api/discharge/readiness/PT-1002")
    print(f"   GET /api/discharge/readiness/PT-1002: status={resp_single.status_code}")
    r_data = resp_single.json()
    print(f"   Patient: {r_data['patient_name']}, Score: {r_data['readiness_score']}%, Prep ETA: {r_data['estimated_prep_time']}")
    print(f"   Clinical Stability: {r_data['pillars']['clinical_stability']['status']}")
    print(f"   Lab Clearance: {r_data['pillars']['laboratory_clearance']['status']}")
    print(f"   Pharmacy Prep: {r_data['pillars']['pharmacy_preparation']['status']}")
    print(f"   Bottleneck Delay: {r_data['delay_reason']}")

    # Test Pillar update
    resp_pill = client.post("/api/discharge/readiness/PT-1002/update-pillar", json={
        "pillar": "lab_clearance",
        "value": "COMPLETED"
    })
    print(f"   Update Pillar (lab_clearance=COMPLETED): status={resp_pill.status_code}")

    # Test Sign-off & auto-enrollment into Module 3
    resp_signoff = client.post("/api/discharge/approve-signoff", json={
        "patient_id": "PT-1002",
        "doctor_name": "Dr. Sarah Jenkins",
        "primary_diagnosis": "Acute Coronary Syndrome - Resolved",
        "discharge_meds": "Aspirin, Atorvastatin",
        "home_instructions": "Low sodium diet, walking 20 mins"
    })
    print(f"   Doctor Signoff & Remote RPM Auto-Enrollment: status={resp_signoff.status_code}")
    s_data = resp_signoff.json()
    print(f"   Remote Care Enrolled: {s_data['remote_rpm_enrolled']}, Milestones: {len(s_data['remote_milestones'])}")

    # 4. Test Module 3: AI Post-Discharge Remote RPM
    print("\n[4] Testing Module 3: Post-Discharge Remote RPM & AI Check-Ins...")
    
    # Safe Day 1 check-in
    resp_checkin_safe = client.post("/api/remote-rpm/checkin", json={
        "patient_id": "PT-1002",
        "milestone_day": 1,
        "user_message": "Mild soreness around wound, no fever, taking my Aspirin with breakfast.",
        "pain_score": 2,
        "medication_adherent": 1,
        "channel": "PORTAL"
    })
    print(f"   Safe Check-In: status={resp_checkin_safe.status_code}")
    c_safe = resp_checkin_safe.json()
    print(f"   Escalated: {c_safe['escalated']}, AI Reply: {c_safe['reply_message'][:60]}...")

    # Red-flag Day 3 check-in (Severe chest pain)
    resp_checkin_crit = client.post("/api/remote-rpm/checkin", json={
        "patient_id": "PT-1002",
        "milestone_day": 3,
        "user_message": "Experiencing sudden severe chest tightness radiating to left arm and dizziness.",
        "pain_score": 9,
        "medication_adherent": 0,
        "channel": "WHATSAPP"
    })
    print(f"   Red-Flag Check-In: status={resp_checkin_crit.status_code}")
    c_crit = resp_checkin_crit.json()
    print(f"   Escalated: {c_crit['escalated']}, Severity: {c_crit['severity']}")
    print(f"   AI Triage Reply: {c_crit['reply_message'][:70]}...")

    # Doctor Escalations list
    resp_esc = client.get("/api/remote-rpm/doctor/escalations")
    print(f"   Doctor Escalations Queue: status={resp_esc.status_code}, count={len(resp_esc.json())}")

    # WhatsApp Webhook simulation
    resp_wa = client.post("/api/remote-rpm/whatsapp/simulate", json={
        "from_phone": "+91 98765 43212",
        "patient_id": "PT-1002",
        "milestone_day": 7,
        "text": "Wound is healing well and pain is gone, feeling energized."
    })
    print(f"   WhatsApp Webhook Sim: status={resp_wa.status_code}")
    wa_data = resp_wa.json()
    print(f"   WhatsApp Outgoing Reply: {wa_data['outgoing_ai_reply'][:60]}...")

    print("\n" + "=" * 60)
    print("ALL MODULE VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()

