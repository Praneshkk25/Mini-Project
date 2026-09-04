"""
Safety and clinical risk validation service.
Monitors user prompts and AI responses for emergency red flags and enforces disclaimers.
"""
from typing import Dict, Any, List
from app.ai.prompts import SAFETY_DISCLAIMER

EMERGENCY_KEYWORDS = [
    "chest pain", "crushing chest", "heart attack",
    "difficulty breathing", "cannot breathe", "severe shortness of breath", "gasping",
    "fainting", "loss of consciousness", "unconscious", "passed out", "seizure",
    "severe bleeding", "hemorrhage", "vomiting blood", "coughing blood",
    "paralysis", "slurred speech", "facial drooping", "stroke",
    "severe allergic reaction", "anaphylaxis", "throat swelling"
]

class SafetyService:
    @staticmethod
    def detect_emergency(text: str) -> Dict[str, Any]:
        """Detects emergency indicators in patient intake or conversation."""
        if not text:
            return {"is_emergency": False, "matched_keywords": [], "action": "ROUTINE"}
            
        lower_text = text.lower()
        matched = [kw for kw in EMERGENCY_KEYWORDS if kw in lower_text]
        
        is_emergency = len(matched) > 0
        return {
            "is_emergency": is_emergency,
            "matched_keywords": matched,
            "action": "EMERGENCY_ALERT" if is_emergency else "ROUTINE",
            "warning_message": (
                "⚠️ CRITICAL ALERT: Immediate medical attention may be required. "
                "Please approach the nearest Emergency Desk or notify hospital emergency staff immediately."
                if is_emergency else None
            )
        }

    @staticmethod
    def enforce_disclaimer(response_text: str) -> str:
        """Appends the mandatory clinical safety disclaimer to AI outputs."""
        if SAFETY_DISCLAIMER in response_text:
            return response_text
        return f"{response_text}\n\n---\n*Disclaimer: {SAFETY_DISCLAIMER}*"
