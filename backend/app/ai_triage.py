import logging
import json
from app import config

logger = logging.getLogger(__name__)

# Basic rule-based classification engine for rapid clinical routing (fallback)
CLINICAL_KEYWORDS = {
    "Cardiology": [
        "chest pain", "breathless", "heart", "palpitation", "left arm pain", 
        "cardiac", "bp", "blood pressure", "angina", "choking"
    ],
    "Pediatrics": [
        "child", "baby", "pediatric", "kid", "infant", "newborn", 
        "vaccination", "teething", "crying persistently", "juvenile"
    ],
    "Orthopedics": [
        "bone", "joint", "fracture", "knee", "back pain", "sprain", 
        "fall", "swelling", "shoulder", "ligament", "accident"
    ],
    "Dermatology": [
        "rash", "skin", "itching", "acne", "spots", "burn", 
        "eczema", "fungal", "allergy", "hair loss"
    ]
}

def analyze_symptoms(symptoms_text: str) -> dict:
    """
    Classifies patient symptoms into a target hospital department and assigns a triage priority.
    Uses the local Fine-Tuned Qwen LoRA adapter when LLM_PROVIDER is 'qwen-local-ft',
    with a resilient fallback to clinical keyword heuristics.
    """
    raw_text = (symptoms_text or "").strip()
    if not raw_text:
        return {
            "department": "General Medicine",
            "priority": "Routine",
            "reason": "No symptoms specified. Routed to General Medicine by default."
        }

    # 1. First attempt: Fine-Tuned Qwen LoRA Clinical Triage Model
    if config.LLM_PROVIDER == "qwen-local-ft":
        try:
            from app.services.llm_service import run_local_ft_inference, clean_json_string
            system_prompt = "You are a clinical triage assistant."
            prompt = (
                "You are an expert clinical triage assistant. Analyze the patient's symptoms and classify the "
                "target medical department and urgency priority. Return your response strictly as a JSON object "
                "containing the keys: 'department', 'priority', and 'reason'.\n\n"
                f"Symptoms: {raw_text}"
            )
            response_text = run_local_ft_inference(prompt=prompt, system_prompt=system_prompt)
            cleaned = clean_json_string(response_text)
            data = json.loads(cleaned)
            if "department" in data and "priority" in data:
                prio = str(data["priority"]).strip()
                if any(w in prio.lower() for w in ["immediate", "red", "stat", "emergency", "code", "critical", "high"]):
                    prio = "Immediate"
                elif any(w in prio.lower() for w in ["urgent", "yellow", "priority", "moderate"]):
                    prio = "Urgent"
                else:
                    prio = "Routine"

                dept_raw = str(data["department"]).strip()
                if "/" in dept_raw:
                    dept_raw = dept_raw.split("/")[0].strip()

                dept_lower = dept_raw.lower()
                if "cardio" in dept_lower:
                    dept = "Cardiology"
                elif "pediatric" in dept_lower or "child" in dept_lower:
                    dept = "Pediatrics"
                elif "ortho" in dept_lower or "bone" in dept_lower:
                    dept = "Orthopedics"
                elif "derma" in dept_lower or "skin" in dept_lower:
                    dept = "Dermatology"
                elif any(m in dept_lower for m in ["internal", "general", "medicine", "physician", "er", "emergency"]):
                    dept = "General Medicine"
                else:
                    dept = dept_raw

                # Clinical Safety Guardrail: Immediate Red-Flags cannot be downgraded to Routine
                immediate_triggers = ["chest pain", "unconscious", "severe bleeding", "difficulty breathing", "choking", "seizure", "stroke", "heart attack"]
                urgent_triggers = ["high fever", "fracture", "severe pain", "baby", "infant", "vomiting blood", "deep cut"]
                lower_text = raw_text.lower()
                if any(trigger in lower_text for trigger in immediate_triggers):
                    prio = "Immediate"
                elif prio == "Routine" and any(trigger in lower_text for trigger in urgent_triggers):
                    prio = "Urgent"

                logger.info(f"Fine-Tuned Qwen Triage: '{raw_text}' -> Dept: {dept}, Priority: {prio}")
                return {
                    "department": dept,
                    "priority": prio,
                    "reason": data.get("reason", data.get("clinical_rationale", "Classified by Fine-Tuned Qwen Clinical Triage AI."))
                }
        except Exception as e:
            logger.warning(f"Fine-Tuned Qwen triage inference bypassed ({e}). Falling back to rule-based engine.")

    # 2. Rule-based heuristic fallback engine
    text = raw_text.lower()
        
    # 1. Determine Triage Priority (Red/Yellow/Green)
    # Immediate / Urgent triggers
    immediate_triggers = ["chest pain", "unconscious", "severe bleeding", "difficulty breathing", "choking", "seizure", "stroke"]
    urgent_triggers = ["high fever", "fracture", "severe pain", "baby", "infant", "vomiting blood", "deep cut"]
    
    priority = "Routine"
    if any(trigger in text for trigger in immediate_triggers):
        priority = "Immediate"
    elif any(trigger in text for trigger in urgent_triggers):
        priority = "Urgent"
        
    # 2. Determine Department Routing
    department = "General Medicine"
    max_matches = 0
    matched_dept = None
    
    for dept, keywords in CLINICAL_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in text)
        if matches > max_matches:
            max_matches = matches
            matched_dept = dept
            
    if matched_dept:
        department = matched_dept
        reason = f"Symptoms matched database keywords for {department}."
    else:
        reason = "Could not find a specific match. Routed to General Medicine for initial assessment."
        
    logger.info(f"AI Triage analyzed: '{symptoms_text}' -> Dept: {department}, Priority: {priority}")
    
    return {
        "department": department,
        "priority": priority,
        "reason": reason
    }
