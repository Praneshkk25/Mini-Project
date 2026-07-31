import json
import os

# Define clinical dataset examples
TRIAGE_EXAMPLES = [
    {
        "symptoms": "Sharp chest pain spreading to my left arm, sweating, and difficulty breathing since last 30 minutes.",
        "department": "Cardiology",
        "priority": "Immediate",
        "reason": "Chest pain radiating to the left arm accompanied by dyspnea and diaphoresis are classic signs of acute coronary syndrome (myocardial infarction) requiring immediate resuscitation."
    },
    {
        "symptoms": "Severe pain in my lower right abdomen. It started near the belly button and moved down. Feels worse when I move or touch it.",
        "department": "General Surgery",
        "priority": "Urgent",
        "reason": "Lower right quadrant abdominal pain with migration is highly suggestive of acute appendicitis, requiring clinical evaluation and potential surgical intervention."
    },
    {
        "symptoms": "My 3-year-old child has a high fever of 102F, has been vomiting, and is extremely lethargic and won't drink water.",
        "department": "Pediatrics",
        "priority": "Urgent",
        "reason": "High fever, vomiting, and lethargy in a toddler indicate risk of severe dehydration or systemic infection like meningitis, requiring rapid pediatric assessment."
    },
    {
        "symptoms": "Fell down the stairs and now my right ankle is swollen, bruised, and I cannot put any weight on it at all.",
        "department": "Orthopedics",
        "priority": "Standard",
        "reason": "Inability to bear weight on a swollen and bruised joint indicates potential fracture or severe ligamentous tear requiring X-ray diagnostics."
    },
    {
        "symptoms": "Red itchy rash with circular patches spreading on my arms and neck for the last few days.",
        "department": "Dermatology",
        "priority": "Standard",
        "reason": "Itchy circular rashes indicate superficial fungal or allergic dermatological conditions, suitable for routine clinical outpatient evaluation."
    },
    {
        "symptoms": "Sudden weakness on the left side of my face, I cannot close my left eye or smile properly since this morning.",
        "department": "Neurology",
        "priority": "Immediate",
        "reason": "Sudden unilateral facial weakness requires immediate stroke protocol assessment to rule out acute cerebrovascular event versus Bell's palsy."
    }
]

DISCHARGE_EXAMPLES = [
    {
        "clinical_notes": "Tab Pantoprazole 40mg PO QD AC x5 days for gastroprotection.",
        "simple_text": "Take 1 tablet of Pantoprazole (40mg) by mouth daily, in the morning before eating food, for 5 days. This medicine protects your stomach and prevents acidity."
    },
    {
        "clinical_notes": "Tab Ciprofloxacin 500mg BID PC x7 days. Complete full course.",
        "simple_text": "Take 1 tablet of Ciprofloxacin (500mg) twice daily (morning and night) after eating food, for 7 days. Be sure to finish all 7 days of this medicine even if you feel better, to completely kill the infection."
    },
    {
        "clinical_notes": "Sip ORS solution to maintain hydration status post severe fluid loss.",
        "simple_text": "Dissolve 1 packet of Oral Rehydration Salts (ORS) in 1 Liter of clean water. Sip this solution slowly throughout the day to recover water and salt lost from vomiting or diarrhea."
    },
    {
        "clinical_notes": "Restrict sodium intake, avoid lipid-heavy foods, walk 30 mins daily, review in clinic in 2 weeks.",
        "simple_text": "Limit salt in your food, avoid oily or greasy dishes, walk for 30 minutes every day, and visit the doctor in the clinic in 2 weeks for a check-up."
    }
]


def build_triage_instruction(symptoms: str) -> str:
    return (
        "You are an expert clinical triage assistant. Analyze the patient's symptoms and classify the target medical department "
        "and urgency priority. Return your response strictly as a JSON object containing the keys: 'department', 'priority', and 'reason'.\n\n"
        f"Symptoms: {symptoms}"
    )

def build_discharge_instruction(notes: str) -> str:
    return (
        "You are a clinical pharmacist. Translate the complex prescription shorthand into a clear, "
        "low-literacy instruction guide that an average patient can easily follow.\n\n"
        f"Clinical Notes: {notes}"
    )


def main():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    os.makedirs(data_dir, exist_ok=True)
    dataset_file = os.path.join(data_dir, "train_dataset.jsonl")
    
    print(f"Generating synthetic training dataset in {dataset_file}...")
    
    with open(dataset_file, "w", encoding="utf-8") as f:
        # 1. Write triage instruction pairs
        for item in TRIAGE_EXAMPLES:
            completion = {
                "department": item["department"],
                "priority": item["priority"],
                "reason": item["reason"]
            }
            # Conversations schema standard for instruction finetuning (Qwen/ShareGPT format)
            row = {
                "messages": [
                    {"role": "system", "content": "You are a clinical triage assistant."},
                    {"role": "user", "content": build_triage_instruction(item["symptoms"])},
                    {"role": "assistant", "content": json.dumps(completion)}
                ]
            }
            f.write(json.dumps(row) + "\n")
            
        # 2. Write discharge summary translation pairs
        for item in DISCHARGE_EXAMPLES:
            row = {
                "messages": [
                    {"role": "system", "content": "You are a clinical pharmacist."},
                    {"role": "user", "content": build_discharge_instruction(item["clinical_notes"])},
                    {"role": "assistant", "content": item["simple_text"]}
                ]
            }
            f.write(json.dumps(row) + "\n")
            
    print(f"Dataset generated. Total records: {len(TRIAGE_EXAMPLES) + len(DISCHARGE_EXAMPLES)}")

if __name__ == "__main__":
    main()
