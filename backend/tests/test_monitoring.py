import unittest
import sys
import os
from datetime import datetime

# Adjust sys.path to find backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from streaming.schemas import PatientVitalEvent
from app.services.alert_service import evaluate_patient_vitals
from streaming.kafka_producer import PatientVitalKafkaProducer
from app.main import app
from tests.test_api import ASGIClient


class TestPatientMonitoringPipeline(unittest.TestCase):

    def setUp(self):
        self.client = ASGIClient(app)

    def test_normal_vital_evaluation(self):
        """Verify normal vital readings return NORMAL status and no alerts."""
        normal_vital = PatientVitalEvent(
            patient_id="PT-TEST-01",
            patient_name="Test Normal Patient",
            bed_id="TEST-101",
            department="General Ward",
            timestamp=datetime.now().isoformat(),
            heart_rate=75,
            spo2=98,
            systolic_bp=120,
            diastolic_bp=80,
            temperature=36.8,
            respiratory_rate=16
        )

        processed, alerts = evaluate_patient_vitals(normal_vital)
        self.assertEqual(processed.overall_status, "NORMAL")
        self.assertEqual(processed.heart_rate_status, "NORMAL")
        self.assertEqual(processed.spo2_status, "NORMAL")
        self.assertEqual(len(alerts), 0)

    def test_warning_vital_evaluation(self):
        """Verify elevated heart rate (>120 bpm) returns WARNING status and alert."""
        warning_vital = PatientVitalEvent(
            patient_id="PT-TEST-02",
            patient_name="Test Warning Patient",
            bed_id="TEST-102",
            department="Emergency",
            timestamp=datetime.now().isoformat(),
            heart_rate=130,  # Warning threshold > 120
            spo2=95,
            systolic_bp=130,
            diastolic_bp=85,
            temperature=37.0,
            respiratory_rate=18
        )

        processed, alerts = evaluate_patient_vitals(warning_vital)
        self.assertEqual(processed.overall_status, "WARNING")
        self.assertEqual(processed.heart_rate_status, "WARNING")
        self.assertTrue(len(alerts) >= 1)
        self.assertEqual(alerts[0].alert_level, "WARNING")
        self.assertEqual(alerts[0].parameter, "Heart Rate")

    def test_critical_vital_evaluation(self):
        """Verify severe hypoxemia (SpO2=86%) and severe tachycardia (HR=165 bpm) return CRITICAL status."""
        critical_vital = PatientVitalEvent(
            patient_id="PT-TEST-03",
            patient_name="Test Critical Patient",
            bed_id="ICU-999",
            department="ICU",
            timestamp=datetime.now().isoformat(),
            heart_rate=165,      # Severe Tachycardia > 150 -> CRITICAL
            spo2=86,             # Critical SpO2 < 88 -> CRITICAL
            systolic_bp=185,     # Hypertensive Crisis >= 180 -> CRITICAL
            diastolic_bp=110,
            temperature=39.8,    # High Fever -> WARNING
            respiratory_rate=30  # Tachypnea -> WARNING
        )

        processed, alerts = evaluate_patient_vitals(critical_vital)
        self.assertEqual(processed.overall_status, "CRITICAL")
        self.assertEqual(processed.spo2_status, "CRITICAL")
        self.assertEqual(processed.heart_rate_status, "CRITICAL")
        self.assertEqual(processed.blood_pressure_status, "CRITICAL")
        self.assertTrue(len(alerts) >= 3)
        self.assertTrue(any(a.alert_level == "CRITICAL" for a in alerts))

    def test_kafka_producer_fallback(self):
        """Verify Kafka producer handles missing broker gracefully without crashing."""
        producer = PatientVitalKafkaProducer(bootstrap_servers="localhost:9999") # Non-existent port
        self.assertFalse(producer.is_connected)
        
        evt = PatientVitalEvent(
            patient_id="PT-TEST-04",
            patient_name="Fallback Test",
            bed_id="BED-1",
            department="ICU",
            timestamp=datetime.now().isoformat(),
            heart_rate=80,
            spo2=98,
            systolic_bp=120,
            diastolic_bp=80,
            temperature=36.7,
            respiratory_rate=16
        )
        success = producer.send_vital_event(evt)
        self.assertFalse(success)  # Gracefully returns False on fallback
        producer.close()

    def test_monitoring_api_endpoints(self):
        """Verify FastAPI /api/monitoring endpoints return valid responses."""
        # 1. Get Monitored Patients
        patients_res = self.client.get("/api/monitoring/patients")
        self.assertEqual(patients_res.status_code, 200)
        patients_data = patients_res.json()
        self.assertTrue(len(patients_data) > 0)

        patient_id = patients_data[0]["patient_id"]

        # 2. Get Single Patient Detail
        detail_res = self.client.get(f"/api/monitoring/patients/{patient_id}")
        self.assertEqual(detail_res.status_code, 200)
        self.assertEqual(detail_res.json()["patient_id"], patient_id)

        # 3. Get Patient Vital History
        history_res = self.client.get(f"/api/monitoring/vitals/history/{patient_id}")
        self.assertEqual(history_res.status_code, 200)
        self.assertTrue(isinstance(history_res.json(), list))

        # 4. Get Monitoring Summary Stats
        stats_res = self.client.get("/api/monitoring/stats")
        self.assertEqual(stats_res.status_code, 200)
        self.assertIn("total_patients", stats_res.json())

        # 5. Get Stream Health Status
        status_res = self.client.get("/api/monitoring/stream/status")
        self.assertEqual(status_res.status_code, 200)
        self.assertIn("status", status_res.json())

        # 6. Trigger Emergency Patient State
        trigger_res = self.client.post(f"/api/monitoring/simulator/patient/{patient_id}/critical")
        self.assertEqual(trigger_res.status_code, 200)
        self.assertEqual(trigger_res.json()["status"], "CRITICAL_TRIGGERED")


if __name__ == '__main__':
    unittest.main()
