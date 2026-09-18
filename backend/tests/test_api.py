import unittest
import anyio
import httpx
import sys
import os

# Adjust path to find app module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.services import llm_service

class ASGIClient:
    """Synchronous test client wrapper around httpx.AsyncClient using ASGITransport for ASGI app compatibility."""
    def __init__(self, app, base_url="http://testserver"):
        self.transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=self.transport, base_url=base_url)

    def get(self, url, **kwargs):
        return anyio.run(lambda: self.client.get(url, **kwargs))

    def post(self, url, **kwargs):
        return anyio.run(lambda: self.client.post(url, **kwargs))

    def delete(self, url, **kwargs):
        return anyio.run(lambda: self.client.delete(url, **kwargs))


class TestCareEaseAPI(unittest.TestCase):
    
    def setUp(self):
        self.client = ASGIClient(app)
        self.city_headers = {"X-City-API-Key": "test-city-key-123"}
        
    def test_root_endpoint(self):
        """Verify the health check root endpoint returns success message."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("CareEase AI", response.json()["message"])

    def test_tts_generator_endpoint(self):
        """Verify the fallback TTS streams audio bytes successfully."""
        response = self.client.get("/api/tts", params={"text": "Hello, how are you?", "language": "English"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "audio/mpeg")
        self.assertTrue(len(response.content) > 0)

    def test_json_cleanup_helper(self):
        """Test the robust JSON extraction helper removes markdown enclosures properly."""
        dirty_json = "```json\n{\n  \"name\": \"Pranesh\"\n}\n```"
        cleaned = llm_service.clean_json_string(dirty_json)
        self.assertEqual(cleaned, "{\n  \"name\": \"Pranesh\"\n}")

    def test_queues_full_flow(self):
        """Test OPD Queues status, triage, check-in, list, update-status, settings, and cancellation."""
        # 1. Status
        res = self.client.get("/api/queues/status")
        self.assertEqual(res.status_code, 200)
        self.assertIn("General Medicine", res.json())

        # 2. AI Triage
        triage_res = self.client.post("/api/queues/triage", json={"symptoms": "severe chest pain radiating to left arm"})
        self.assertEqual(triage_res.status_code, 200)
        self.assertEqual(triage_res.json()["department"], "Cardiology")
        self.assertEqual(triage_res.json()["priority"], "Immediate")

        # 3. Check-in
        checkin_res = self.client.post("/api/queues/check-in", json={
            "patient_name": "Test Patient Queue",
            "patient_age": 40,
            "patient_gender": "Male",
            "symptoms": "High fever and chills"
        })
        self.assertEqual(checkin_res.status_code, 200)
        ticket = checkin_res.json()["ticket_number"]
        self.assertTrue(ticket.startswith("OPD-"))

        # 4. List with filter
        list_res = self.client.get("/api/queues/list", params={"search": "Test Patient Queue"})
        self.assertEqual(list_res.status_code, 200)
        self.assertTrue(len(list_res.json()) > 0)

        # 5. Update Status
        update_res = self.client.post("/api/queues/update-status", json={
            "ticket_number": ticket,
            "status": "In-Consultation"
        })
        self.assertEqual(update_res.status_code, 200)

        # 6. Settings
        set_res = self.client.post("/api/queues/settings", json={
            "department": "Cardiology",
            "num_doctors": 3
        })
        self.assertEqual(set_res.status_code, 200)

        # 7. Cancel ticket
        cancel_res = self.client.delete(f"/api/queues/cancel/{ticket}")
        self.assertEqual(cancel_res.status_code, 200)

    def test_beds_full_flow(self):
        """Test Beds status, add bed, admit, discharge, direct status update, and forecasting."""
        import uuid
        bed_num = f"TEST-BED-{uuid.uuid4().hex[:6]}"

        # 1. Add new bed
        add_res = self.client.post("/api/beds/add", json={
            "bed_number": bed_num,
            "ward_type": "General Ward",
            "status": "Available"
        })
        self.assertEqual(add_res.status_code, 200)

        # 2. Admit patient
        admit_res = self.client.post("/api/beds/admit", json={
            "bed_number": bed_num,
            "patient_name": "Admit Test",
            "patient_age": 30,
            "patient_gender": "Female"
        })
        self.assertEqual(admit_res.status_code, 200)

        # 3. Discharge patient
        dc_res = self.client.post("/api/beds/discharge", json={"bed_number": bed_num})
        self.assertEqual(dc_res.status_code, 200)

        # 4. Update status back to Available
        up_res = self.client.post("/api/beds/update-status", json={
            "bed_number": bed_num,
            "status": "Available"
        })
        self.assertEqual(up_res.status_code, 200)

        # 5. Forecast
        fc_res = self.client.get("/api/beds/forecast")
        self.assertEqual(fc_res.status_code, 200)
        self.assertIn("forecast", fc_res.json())

    def test_inventory_full_flow(self):
        """Test Inventory list, add item, dispense medicine, dispensations log, and item deletion."""
        med_name = "TestMed 100mg"
        from app.database import get_db_connection
        conn = get_db_connection()
        conn.cursor().execute("DELETE FROM inventory WHERE LOWER(medicine_name) = 'testmed 100mg'")
        conn.commit()
        conn.close()

        # 1. Add/Replenish item
        add_res = self.client.post("/api/inventory/add", json={
            "medicine_name": med_name,
            "batch_number": "B-TEST-1",
            "stock_level": 50,
            "expiry_date": "2028-12-31",
            "reorder_level": 10,
            "purpose_simple": "Test medicine for verification",
            "price": 12.5
        })
        self.assertEqual(add_res.status_code, 200)

        # 2. Get list & find added item ID
        list_res = self.client.get("/api/inventory/list")
        self.assertEqual(list_res.status_code, 200)
        items = list_res.json()
        item = next((i for i in items if i["medicine_name"] == med_name), None)
        self.assertIsNotNone(item)
        item_id = item["id"]

        # 3. Dispense medicine (case-insensitive)
        disp_res = self.client.post("/api/inventory/dispense", json={
            "patient_name": "John Doe",
            "medicine_name": "testmed 100mg",
            "quantity": 5
        })
        self.assertEqual(disp_res.status_code, 200)
        self.assertEqual(disp_res.json()["remaining_stock"], 45)

        # 4. Dispensations log
        log_res = self.client.get("/api/inventory/dispensations")
        self.assertEqual(log_res.status_code, 200)
        self.assertTrue(len(log_res.json()) > 0)

        # 5. Delete item
        del_res = self.client.delete(f"/api/inventory/delete/{item_id}")
        self.assertEqual(del_res.status_code, 200)

    def test_city_wide_endpoints(self):
        """Test all city-wide administration integration endpoints."""
        # 1. City Beds
        beds_res = self.client.get("/api/city-wide/beds", headers=self.city_headers)
        self.assertEqual(beds_res.status_code, 200)
        self.assertIn("hospital_id", beds_res.json())

        # 2. City Queues
        queues_res = self.client.get("/api/city-wide/queues", headers=self.city_headers)
        self.assertEqual(queues_res.status_code, 200)
        self.assertIn("queues", queues_res.json())

        # 3. Emergency Status
        er_res = self.client.get("/api/city-wide/emergency-status", headers=self.city_headers)
        self.assertEqual(er_res.status_code, 200)
        self.assertIn("status", er_res.json())

        # 4. City Inventory
        inv_res = self.client.get("/api/city-wide/inventory", headers=self.city_headers)
        self.assertEqual(inv_res.status_code, 200)
        self.assertIn("critical_shortage_count", inv_res.json()["inventory"])

        # 5. Missing API Key validation
        unauth_res = self.client.get("/api/city-wide/beds")
        self.assertEqual(unauth_res.status_code, 401)


if __name__ == '__main__':
    unittest.main()
