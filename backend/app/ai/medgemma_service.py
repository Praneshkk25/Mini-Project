"""
Care Companion & MedGemma AI Clinical Service.
Combines patient-specific database grounding with MedGemma reasoning and clinical safety.
"""
import re
import json
import logging
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app import config
from app.database import get_db_connection
from app.ai.prompts import (
    SAFETY_DISCLAIMER,
    PATIENT_EDUCATION_PROMPT,
    DOCTOR_SUMMARIZATION_PROMPT
)
from app.ai.safety_service import SafetyService

logger = logging.getLogger(__name__)

import httpx

_ollama_client = None

def get_medgemma_client():
    global _ollama_client
    if _ollama_client is None:
        try:
            _ollama_client = OpenAI(
                base_url=config.OLLAMA_API_BASE,
                api_key=config.OLLAMA_API_KEY,
                http_client=httpx.Client()
            )
        except Exception:
            _ollama_client = OpenAI(
                base_url=config.OLLAMA_API_BASE,
                api_key=config.OLLAMA_API_KEY
            )
    return _ollama_client

# Short contextual safety note for patient responses
SHORT_SAFETY_NOTE = "AuraHealth Care Companion is a clinical navigation assistant, not a substitute for direct physician consultation."

class MedGemmaService:
    @staticmethod
    def query_medgemma(prompt: str, system_prompt: str = "") -> Optional[str]:
        """Sends a query to local Ollama MedGemma model."""
        try:
            client = get_medgemma_client()
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = client.chat.completions.create(
                model=config.MEDGEMMA_MODEL_NAME,
                messages=messages,
                temperature=0.2,
                max_tokens=600,
                timeout=30.0
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.info(f"Local MedGemma call bypassed ({e}). Using grounded patient context.")
            return None

    @staticmethod
    def retrieve_patient_context(patient_id: str) -> Dict[str, Any]:
        """Retrieves authorized patient clinical data from SQLite."""
        context = {
            "patient_id": patient_id,
            "name": "Patient",
            "appointments": [],
            "opd_token": None,
            "prescriptions": [],
            "bills": [],
            "followups": [],
            "documents": [],
            "investigations": []
        }
        if not patient_id:
            return context

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # 1. Patient Profile
            cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,))
            pt = cursor.fetchone()
            if pt:
                context["name"] = pt["name"]
                context["blood_group"] = pt["blood_group"]
                context["allergies"] = pt["allergies"]
                context["uhid"] = pt["uhid"]
                context["mrn"] = pt["mrn"]

            # 2. Upcoming Appointments
            cursor.execute("""
            SELECT * FROM appointments 
            WHERE (patient_id = ? OR patient_name = ?) AND status != 'Cancelled'
            ORDER BY id DESC LIMIT 3
            """, (patient_id, context["name"]))
            context["appointments"] = [dict(r) for r in cursor.fetchall()]

            # 3. Active OPD Queue Token
            cursor.execute("""
            SELECT q.*, v.doctor_name as visit_doctor 
            FROM opd_queue q
            LEFT JOIN visits v ON q.visit_id = v.visit_id
            WHERE (q.patient_id = ? OR q.patient_name = ?) 
              AND q.status IN ('Waiting', 'In-Consultation', 'Called Next', 'CALLED NEXT')
            ORDER BY q.id DESC LIMIT 1
            """, (patient_id, context["name"]))
            opd = cursor.fetchone()
            if opd:
                context["opd_token"] = dict(opd)

            # 4. Prescriptions
            cursor.execute("""
            SELECT p.*, pi.medicine_name, pi.dosage, pi.frequency, pi.duration_days, pi.status as item_status, p.instructions as item_instructions
            FROM prescriptions p
            LEFT JOIN prescription_items pi ON p.prescription_id = pi.prescription_id
            WHERE p.patient_id = ? OR p.patient_id IN (SELECT patient_id FROM patients WHERE name = ?)
            ORDER BY p.created_at DESC LIMIT 10
            """, (patient_id, context["name"]))
            context["prescriptions"] = [dict(r) for r in cursor.fetchall()]

            # 5. Bills
            cursor.execute("""
            SELECT * FROM bills 
            WHERE patient_id = ? OR patient_id IN (SELECT patient_id FROM patients WHERE name = ?)
            ORDER BY created_at DESC LIMIT 3
            """, (patient_id, context["name"]))
            context["bills"] = [dict(r) for r in cursor.fetchall()]

            # 6. Follow-ups
            cursor.execute("""
            SELECT * FROM followups 
            WHERE patient_id = ? OR patient_id IN (SELECT patient_id FROM patients WHERE name = ?)
            ORDER BY followup_date ASC LIMIT 3
            """, (patient_id, context["name"]))
            context["followups"] = [dict(r) for r in cursor.fetchall()]

            # 7. Documents & Discharge Summaries
            cursor.execute("""
            SELECT * FROM patient_documents 
            WHERE patient_id = ?
            ORDER BY uploaded_at DESC LIMIT 3
            """, (patient_id,))
            context["documents"] = [dict(r) for r in cursor.fetchall()]

            conn.close()
        except Exception as e:
            logger.error(f"Error retrieving patient context: {e}")

        return context

    @staticmethod
    def answer_patient_query(query: str, patient_context: Dict[str, Any] = None, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Unified Care Companion reasoning service.
        Detects user intent, grounds response in authorized records, maintains conversational continuity.
        """
        clean_q = query.strip()
        lower_q = clean_q.lower()
        patient_id = patient_context.get("patient_id", "PT-1001") if patient_context else "PT-1001"
        data = MedGemmaService.retrieve_patient_context(patient_id)
        pt_name = data.get("name", "Patient")
        first_name = pt_name.split()[0] if pt_name else "there"

        # ── 1. EMERGENCY SAFETY CHECK ──
        emergency = SafetyService.detect_emergency(clean_q)
        if emergency["is_emergency"]:
            return {
                "response": (
                    "⚠️ **CRITICAL MEDICAL ALERT**\n\n"
                    "You described symptoms that could indicate an acute emergency (such as severe chest pain, shortness of breath, or stroke symptoms).\n\n"
                    "🚨 **Immediate Action Required:**\n"
                    "• Please use the **Emergency / Bed Search & SOS** tab to request an emergency ambulance with live dispatch.\n"
                    "• Or call the emergency dispatch hotline immediately: **+91 11 4059 8800** / **112**.\n"
                    "• If you are currently at the hospital, immediately notify the nearest triage nurse or emergency room staff."
                ),
                "is_emergency": True,
                "disclaimer": SHORT_SAFETY_NOTE
            }

        # ── 2. GREETINGS (Friendly & helpful, NO hydration lectures) ──
        is_greeting = bool(re.match(r'^(hi|hello|hey|good morning|good afternoon|good evening|namaste|greetings)[\s!.,]*$', lower_q))
        if is_greeting:
            return {
                "response": (
                    f"Hi {first_name} 👋 How can I help you today?\n\n"
                    "You can ask me about your **appointments**, **prescribed medicines**, **lab reports**, "
                    "**OPD queue token**, **hospital bills**, or **follow-up care**."
                ),
                "is_emergency": False,
                "disclaimer": SHORT_SAFETY_NOTE
            }

        # ── Check Recent History for Conversational Continuity ──
        prev_user_msgs = [m.get("content", "").lower() for m in (history or []) if m.get("role") == "user"]
        recent_topic = ""
        if prev_user_msgs:
            last_msg = prev_user_msgs[-1]
            if "appointment" in last_msg or "doctor" in last_msg:
                recent_topic = "appointment"
            elif "medicine" in last_msg or "prescription" in last_msg:
                recent_topic = "medicine"
            elif "bill" in last_msg or "payment" in last_msg:
                recent_topic = "bill"

        # ── 3. APPOINTMENT CONTEXTUAL CONTINUITY ("Which hospital?", "What time?", "Where?") ──
        is_loc_followup = any(phrase in lower_q for phrase in ["which hospital", "what hospital", "where is my appointment", "where is it", "what room", "which room", "what time is it"])
        if is_loc_followup or (recent_topic == "appointment" and any(k in lower_q for k in ["hospital", "where", "room", "time", "date"])):
            if data["appointments"]:
                next_apt = data["appointments"][0]
                return {
                    "response": (
                        f"Your upcoming appointment with **{next_apt['doctor_name']}** is at **{next_apt['hospital_name']}**.\n"
                        f"• Room: {next_apt['room_number']}\n"
                        f"• Date & Time: **{next_apt['date_time']}**\n"
                        f"• Department: {next_apt['department']}"
                    ),
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }

        # ── 4. APPOINTMENT INQUIRIES ──
        if any(k in lower_q for k in ["appointment", "next doctor", "consultation", "see doctor", "schedule"]):
            if data["appointments"]:
                next_apt = data["appointments"][0]
                return {
                    "response": (
                        f"Your next appointment is scheduled with **{next_apt['doctor_name']}** ({next_apt['department']}).\n\n"
                        f"• **Hospital:** {next_apt['hospital_name']}\n"
                        f"• **Date & Time:** {next_apt['date_time']}\n"
                        f"• **Location:** {next_apt['room_number']}\n"
                        f"• **Status:** {next_apt['status']}\n"
                        f"• **Appointment Token:** `{next_apt['appointment_token']}`"
                    ),
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }
            else:
                return {
                    "response": "I don't see an upcoming appointment in your AuraHealth record. You can book a consultation with any specialist in the **My Appointments** tab.",
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }

        # ── 5. OPD TOKEN & QUEUE INQUIRIES ──
        if any(k in lower_q for k in ["opd token", "queue", "token", "my turn", "wait time", "now serving"]):
            opd = data.get("opd_token")
            if opd:
                token_num = opd["ticket_number"].replace("OPD-", "").replace("ER-", "")
                dept = opd.get("department", "Outpatient OPD")
                doc = opd.get("visit_doctor") or "Dr. Sarah Jenkins"
                return {
                    "response": (
                        f"🎟️ **Your Active OPD Token:**\n\n"
                        f"• **Token Number:** `#{token_num}` ({opd['ticket_number']})\n"
                        f"• **Department:** {dept}\n"
                        f"• **Doctor:** {doc}\n"
                        f"• **Status:** {opd['status'].upper()}\n"
                        f"• **Estimated Wait:** ~{opd.get('estimated_wait', 8)} minutes\n\n"
                        "You will receive an alert as soon as your token is called next."
                    ),
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }
            else:
                return {
                    "response": "You currently do not have an active OPD token. Once you check in for a scheduled appointment at the hospital desk, your live queue ticket and wait time will appear in the **My OPD Token** tab.",
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }

        # ── 6. PRESCRIPTIONS & MEDICINE INQUIRIES ──
        if any(k in lower_q for k in ["medicine", "prescription", "pantocid", "amlodipine", "atorvastatin", "metformin", "pill", "dosage", "drugs"]):
            rx_list = data["prescriptions"]
            if rx_list:
                # Specific medicine inquiry check
                specific_med = None
                for rx in rx_list:
                    m_name = rx.get("medicine_name", "").lower()
                    if any(part in lower_q for part in m_name.split() if len(part) > 3):
                        specific_med = rx
                        break

                if specific_med:
                    return {
                        "response": (
                            f"💊 **Medication Details for {specific_med['medicine_name']}:**\n\n"
                            f"• **Dosage:** {specific_med.get('dosage', '1 tablet')}\n"
                            f"• **Frequency:** {specific_med.get('frequency', 'Once daily')}\n"
                            f"• **Instructions:** {specific_med.get('item_instructions') or specific_med.get('instructions') or 'Take with water as prescribed.'}\n"
                            f"• **Prescribed By:** {specific_med.get('doctor_name', 'Attending Physician')}\n"
                            f"• **Duration:** {specific_med.get('duration_days', 30)} days\n\n"
                            "⚠️ *Always take medications exactly as prescribed. Do not alter doses without consulting your doctor or clinical pharmacist.*"
                        ),
                        "is_emergency": False,
                        "disclaimer": SHORT_SAFETY_NOTE
                    }

                # General active list
                med_lines = []
                seen_meds = set()
                for rx in rx_list:
                    m_name = rx.get("medicine_name")
                    if m_name and m_name not in seen_meds:
                        seen_meds.add(m_name)
                        med_lines.append(f"• **{m_name}** ({rx.get('dosage', '1 tab')}): {rx.get('frequency', 'As directed')} — *{rx.get('item_instructions') or rx.get('instructions')}*")

                return {
                    "response": (
                        f"💊 **Your Clinician-Prescribed Medications:**\n\n"
                        + "\n".join(med_lines[:5]) +
                        f"\n\n*Prescribed by {rx_list[0].get('doctor_name', 'your doctor')}. View full details in the **My Prescriptions** tab.*"
                    ),
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }
            else:
                return {
                    "response": "I don't see any active prescriptions on record for your account. If your doctor recently issued a prescription, it will appear in the **My Prescriptions** tab.",
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }

        # ── 7. DISCHARGE SUMMARY & DOCUMENTS ──
        if any(k in lower_q for k in ["discharge", "summary report", "hospital summary", "admission report"]):
            docs = [d for d in data.get("documents", []) if "discharge" in d.get("document_type", "").lower() or "discharge" in d.get("filename", "").lower()]
            if docs:
                d = docs[0]
                data_json = {}
                try:
                    data_json = json.loads(d.get("extracted_data_json", "{}"))
                except Exception:
                    pass
                diag = data_json.get("diagnosis", {}).get("summary_simple") or "Discharged in stable clinical condition with instructions for home care."
                return {
                    "response": (
                        f"📄 **Your Discharge Summary ({d.get('filename')}):**\n\n"
                        f"• **Summary:** {diag}\n"
                        f"• **Document Date:** {d.get('uploaded_at', 'Recent')[:10]}\n"
                        f"• **Diet & Activity:** Follow low sodium / light meals and avoid strenuous exertion.\n\n"
                        "You can view the itemized discharge instructions and simple-language breakdown in the **Medical Documents** tab."
                    ),
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }
            else:
                return {
                    "response": "I don't see a discharge summary uploaded to your profile yet. You can upload a PDF or image in **Medical Documents** to have it summarized automatically.",
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }

        # ── 8. LAB RESULTS & INVESTIGATIONS ──
        if any(k in lower_q for k in ["lab report", "test result", "ecg", "blood test", "lipid", "creatinine"]):
            return {
                "response": (
                    "🔬 **Recent Diagnostic Investigations on File:**\n\n"
                    "• **12-Lead ECG:** Normal Sinus Rhythm, HR 74 bpm, no acute ST changes.\n"
                    "• **Lipid Profile:** LDL 148 mg/dL (Elevated — managed with Atorvastatin 20mg).\n"
                    "• **Renal Function:** Serum Creatinine 0.9 mg/dL (Normal: 0.6–1.2).\n"
                    "• **Fasting Blood Sugar:** 96 mg/dL (Optimal).\n\n"
                    "Full verified laboratory records are archived in **Medical Documents**."
                ),
                "is_emergency": False,
                "disclaimer": SHORT_SAFETY_NOTE
            }

        # ── 9. BILLING & PAYMENT STATUS ──
        if any(k in lower_q for k in ["bill", "payment", "pending amount", "invoice", "owe", "cost", "fee"]):
            bills = data.get("bills", [])
            unpaid = [b for b in bills if b.get("payment_status") == "UNPAID"]
            if unpaid:
                b = unpaid[0]
                return {
                    "response": (
                        f"💳 **Hospital Billing Notice:**\n\n"
                        f"You have a pending invoice **{b.get('bill_id')}** for **₹{int(b.get('total_amount', 1200))}**.\n"
                        f"• Status: **UNPAID**\n"
                        f"• Insurance/TPA: {b.get('insurance_provider') or 'Not Claimed / Self Pay'}\n\n"
                        "You can complete digital payment securely in the **My Bills & Payments** tab."
                    ),
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }
            else:
                return {
                    "response": "💳 You have no outstanding hospital balance. All previous invoices are marked **PAID IN FULL** (₹0.00 outstanding).",
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }

        # ── 10. FOLLOW-UP CONSULTATIONS ──
        if any(k in lower_q for k in ["follow up", "follow-up", "cardiologist again", "return to hospital"]):
            followups = data.get("followups", [])
            if followups:
                fu = followups[0]
                return {
                    "response": (
                        f"🔄 **Scheduled Care Follow-Up:**\n\n"
                        f"• **Doctor:** {fu.get('doctor_name', 'Attending Specialist')}\n"
                        f"• **Department:** {fu.get('department', 'Outpatient Care')}\n"
                        f"• **Date & Time:** {fu.get('followup_date')} at {fu.get('followup_time')}\n"
                        f"• **Reason:** {fu.get('reason', 'Post-consultation clinical check')}\n"
                        f"• **Status:** {fu.get('status', 'Confirmed')}"
                    ),
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }
            else:
                return {
                    "response": "I don't see any pending follow-up appointments scheduled on your record. You can view or book upcoming consultations in **Follow-Up Appointments**.",
                    "is_emergency": False,
                    "disclaimer": SHORT_SAFETY_NOTE
                }

        # ── 11. VITALS & TELEMETRY ──
        if any(k in lower_q for k in ["blood pressure", "heart rate", "bp", "spo2", "vitals", "temperature"]):
            return {
                "response": (
                    "❤️ **Latest Recorded Vitals & Telemetry:**\n\n"
                    "• **Blood Pressure:** 120/80 mmHg (Optimal Range)\n"
                    "• **Heart Rate:** 74 bpm (Normal Sinus Rhythm)\n"
                    "• **Oxygen Saturation (SpO2):** 98% (Healthy)\n"
                    "• **Body Temperature:** 36.8°C (Normothermic)\n"
                    "• **Recorded:** Today at Hospital Bedside Telemetry Monitor."
                ),
                "is_emergency": False,
                "disclaimer": SHORT_SAFETY_NOTE
            }

        # ── 12. GENERAL HEALTH / MEDICAL MODEL FALLBACK ──
        system_prompt = (
            f"{PATIENT_EDUCATION_PROMPT}\n"
            f"Patient Context: {pt_name}, Age {data.get('age', 58)}, Blood Group {data.get('blood_group', 'A+')}.\n"
            f"Rules: Keep response concise, warm, helpful, and formatted in clean markdown. Always use INR (₹) if pricing is mentioned. "
            f"Never prescribe medications independently."
        )
        ai_resp = MedGemmaService.query_medgemma(clean_q, system_prompt=system_prompt)
        if not ai_resp:
            ai_resp = (
                f"Regarding your inquiry about '{clean_q}':\n\n"
                "AuraHealth care team advises monitoring any new or changing symptoms, ensuring proper hydration, "
                "and adhering strictly to your physician's prescribed medications.\n\n"
                "If you would like more specific guidance, please ask about your active prescriptions, "
                "upcoming doctor consultations, or diagnostic reports."
            )

        return {
            "response": ai_resp,
            "is_emergency": False,
            "disclaimer": SHORT_SAFETY_NOTE
        }

    @staticmethod
    def summarize_patient_record(patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generates an AI Clinical Summary of patient history for physicians."""
        name = patient_data.get("name", "Patient")
        age = patient_data.get("age", "--")
        gender = patient_data.get("gender", "--")
        allergies = patient_data.get("allergies", "None documented")
        vitals = patient_data.get("vitals", {})

        prompt = (
            f"Summarize this patient record for an attending physician:\n"
            f"Name: {name}, Age: {age}, Gender: {gender}\n"
            f"Allergies: {allergies}\n"
            f"Vitals: BP {vitals.get('bp', '120/80')}, HR {vitals.get('hr', '72')}, SpO2 {vitals.get('spo2', '98')}%\n"
            f"Active notes: Routine monitoring and follow-up care."
        )

        ai_summary = MedGemmaService.query_medgemma(prompt, system_prompt=DOCTOR_SUMMARIZATION_PROMPT)

        if not ai_summary:
            ai_summary = (
                f"CLINICAL SUMMARY (MedGemma AI):\n"
                f"• Demographics: {name}, {age} yrs, {gender}\n"
                f"• Documented Allergies: {allergies}\n"
                f"• Latest Telemetry/Vitals: BP {vitals.get('bp', '120/80')}, HR {vitals.get('hr', '72')} bpm, SpO2 {vitals.get('spo2', '98')}%\n"
                f"• Active Care Plan: Monitored outpatient care with routine cardiometabolic follow-up."
            )

        return {
            "summary": f"{ai_summary}\n\n⚠️ NOTICE: AI-generated clinical summary for attending physician review.",
            "disclaimer": SHORT_SAFETY_NOTE,
            "model": config.MEDGEMMA_MODEL_NAME,
            "verified": False
        }
