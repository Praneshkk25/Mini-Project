import logging

logger = logging.getLogger(__name__)

# Basic rule-based classification engine for rapid clinical routing (simulated NLP)
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
    Simulates a natural language processing model that classifies patient symptoms 
    into a target hospital department and assigns a triage priority.
    """
    text = symptoms_text.lower().strip()
    
    if not text:
        return {
            "department": "General Medicine",
            "priority": "Routine",
            "reason": "No symptoms specified. Routed to General Medicine by default."
        }
        
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
