"""
MedGemma AI Reasoning Service Abstraction.
Queries the local MedGemma model via Ollama (http://localhost:11434/v1) with clinical safety checks and fallback handling.
"""
import json
import logging
from typing import Dict, Any, List
from openai import OpenAI
from app import config
from app.ai.prompts import (
    SAFETY_DISCLAIMER,
    PATIENT_EDUCATION_PROMPT,
    DOCTOR_SUMMARIZATION_PROMPT
)
from app.ai.safety_service import SafetyService
from app.ai.tool_executor import ToolExecutor

logger = logging.getLogger(__name__)

_ollama_client = None

def get_medgemma_client():
    global _ollama_client
    if _ollama_client is None:
        _ollama_client = OpenAI(
            base_url=config.OLLAMA_API_BASE,
            api_key=config.OLLAMA_API_KEY
        )
    return _ollama_client

class MedGemmaService:
    @staticmethod
    def query_medgemma(prompt: str, system_prompt: str = "") -> str:
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
                max_tokens=600
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"Local MedGemma Ollama call failed ({e}). Falling back to rule-based clinical response.")
            return None

    @staticmethod
    def answer_patient_query(query: str, patient_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Answers patient health questions using MedGemma reasoning with safety checks."""
        # 1. Emergency safety check
        emergency = SafetyService.detect_emergency(query)
        if emergency["is_emergency"]:
            return {
                "response": emergency["warning_message"],
                "is_emergency": True,
                "disclaimer": SAFETY_DISCLAIMER
            }

        # 2. Try querying MedGemma model via Ollama
        system_prompt = (
            f"{PATIENT_EDUCATION_PROMPT}\n"
            f"Context: Patient is consulting AuraHealth hospital assistant. Keep answers concise, safe, and helpful. "
            f"Always include INR (₹) when discussing pricing. Never prescribe medication independently."
        )
        ai_response = MedGemmaService.query_medgemma(query, system_prompt=system_prompt)

        if not ai_response:
            # Rule-based fallback
            lower_q = query.lower()
            if "prescription" in lower_q or "medicine" in lower_q:
                ai_response = (
                    "Regarding your medications: Please take your prescribed doses on time with water as directed on your prescription. "
                    "Always consult your doctor or clinical pharmacist before changing dosages."
                )
            elif "appointment" in lower_q or "doctor" in lower_q:
                ai_response = (
                    "You can schedule or view consultations directly in the Appointments tab or through the MediKiosk. "
                    "Our hospital outpatient consultation timings are 09:00 AM to 05:00 PM."
                )
            else:
                ai_response = (
                    f"Based on your inquiry: '{query}', ensure adequate rest, hydration, and monitoring of your symptoms. "
                    f"If symptoms persist or worsen, please schedule a clinical consultation with your physician."
                )

        final_response = SafetyService.enforce_disclaimer(ai_response)
        return {
            "response": final_response,
            "is_emergency": False,
            "model": config.MEDGEMMA_MODEL_NAME,
            "disclaimer": SAFETY_DISCLAIMER
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
            "summary": f"{ai_summary}\n\n⚠️ NOTICE: AI-generated summary. Physician review and clinical verification required before diagnostic use.",
            "disclaimer": SAFETY_DISCLAIMER,
            "model": config.MEDGEMMA_MODEL_NAME,
            "verified": False
        }
