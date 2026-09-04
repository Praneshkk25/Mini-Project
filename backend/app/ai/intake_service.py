"""
MediKiosk AI Intake Reasoning & Department Recommendation.
"""
from typing import Dict, Any, List
from app.ai.safety_service import SafetyService

DEPARTMENT_MAPPINGS = {
    "chest": "Cardiology",
    "heart": "Cardiology",
    "palpitation": "Cardiology",
    "breath": "Pulmonology",
    "cough": "General Medicine",
    "fever": "General Medicine",
    "cold": "General Medicine",
    "headache": "Neurology",
    "dizziness": "Neurology",
    "seizure": "Neurology",
    "bone": "Orthopedics",
    "joint": "Orthopedics",
    "fracture": "Orthopedics",
    "knee": "Orthopedics",
    "skin": "Dermatology",
    "rash": "Dermatology",
    "ear": "ENT",
    "nose": "ENT",
    "throat": "ENT",
    "eye": "Ophthalmology",
    "vision": "Ophthalmology",
    "stomach": "Gastroenterology",
    "abdominal": "Gastroenterology",
    "child": "Pediatrics",
    "baby": "Pediatrics",
    "infant": "Pediatrics",
    "anxiety": "Psychiatry",
    "depression": "Psychiatry",
    "pregnancy": "Gynecology"
}

class IntakeService:
    @staticmethod
    def process_intake(complaint: str, symptoms: List[str] = None, severity: int = 5) -> Dict[str, Any]:
        """Analyzes patient complaint to extract triage level and suggested department."""
        full_text = f"{complaint} " + (" ".join(symptoms) if symptoms else "")
        emergency_eval = SafetyService.detect_emergency(full_text)
        
        # Suggest department based on clinical keywords
        suggested_dept = "General Medicine"
        lower_text = full_text.lower()
        for kw, dept in DEPARTMENT_MAPPINGS.items():
            if kw in lower_text:
                suggested_dept = dept
                break
                
        if emergency_eval["is_emergency"]:
            triage_level = "EMERGENCY"
            suggested_dept = "Emergency Medicine"
        elif severity >= 8:
            triage_level = "URGENT"
        else:
            triage_level = "ROUTINE"

        return {
            "suggested_department": suggested_dept,
            "triage_priority": triage_level,
            "emergency_assessment": emergency_eval,
            "intake_summary": f"Patient reports: '{complaint}' with severity {severity}/10.",
            "disclaimer": "AI Suggested Department — To be verified by intake triage staff or attending physician."
        }
