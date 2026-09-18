"""
Qwen 2.5 Clinical Dataset Generator for Model Soup Training.
Generates specialized domain datasets formatted in Qwen 2.5 ChatML schema:
1. data/qwen_soup_triage.jsonl     (Triage, Emergency Red-Flags, Department Routing)
2. data/qwen_soup_discharge.jsonl  (Discharge Summary Structuring, Prescription Translation, Low-literacy Advice)
3. data/qwen_soup_telemetry.jsonl  (Bedside Vitals, Telemetry Alerts, Sepsis/Shock Reasoning)
4. data/qwen_soup_master_dataset.jsonl (Unified Dataset for Joint/Stochastic Souping)
5. data/qwen_soup_master_dataset.json  (Alpaca / JSON array format)
"""

import os
import sys
import json
import random

QWEN_SYSTEM_PROMPT = (
    "You are Qwen Clinical Assistant, an expert AI triage and medical decision-support model "
    "integrated into the AuraHealth Hospital Management System. You assist clinical staff, triage nurses, "
    "and physicians with accurate symptom evaluation, emergency red-flag triage, discharge summary synthesis, "
    "and bedside telemetry vital alerts. Always emphasize patient safety and prompt medical intervention."
)

# -------------------------------------------------------------
# Curated Clinical Data for Domain Specialization
# -------------------------------------------------------------

TRIAGE_EXPANDED = [
    {
        "instruction": "Triage a patient presenting with crushing retrosternal chest pain radiating to left arm and jaw, diaphoresis, and nausea.",
        "input": "Patient is a 55-year-old male with known hypertension, BP 155/98 mmHg, HR 105 bpm, SpO2 96% on room air.",
        "output": json.dumps({
            "department": "Cardiology / Emergency Medicine",
            "priority": "Immediate (Red Flag)",
            "suspected_condition": "Acute Coronary Syndrome / STEMI",
            "recommended_actions": [
                "Immediate 12-lead ECG within 10 minutes",
                "Continuous cardiac telemetry and supplemental O2 if SpO2 < 94%",
                "Point-of-care Troponin-I and basic metabolic panel",
                "Aspirin 325mg chewable if not contraindicated",
                "Activate cardiac catheterization lab team immediately"
            ],
            "clinical_rationale": "Classic presentation of acute myocardial ischemia in a high-risk demographic requiring emergency reperfusion protocol."
        }, indent=2)
    },
    {
        "instruction": "Perform triage assessment for sudden onset right-sided hemiparesis and expressive aphasia.",
        "input": "68-year-old female, symptom onset 45 minutes ago at 08:30 AM, history of atrial fibrillation, BP 178/102 mmHg.",
        "output": json.dumps({
            "department": "Neurology / Stroke Resuscitation",
            "priority": "Immediate (Code Stroke)",
            "suspected_condition": "Acute Ischemic Stroke",
            "recommended_actions": [
                "Code Stroke activation; immediate non-contrast head CT/CTA",
                "Assess eligibility for IV thrombolysis (rtPA / Tenecteplase) within 4.5h window",
                "Establish two large-bore IV lines and check fingerstick blood glucose",
                "Continuous neuro vital checks and NIH Stroke Scale assessment"
            ],
            "clinical_rationale": "Acute unilateral motor and speech deficits with onset within the therapeutic reperfusion window. Urgent non-contrast CT required to exclude hemorrhage."
        }, indent=2)
    },
    {
        "instruction": "Evaluate an acute pediatric respiratory complaint with audible inspiratory stridor.",
        "input": "2-year-old child presenting with barky seal-like cough, hoarseness, stridor at rest, temperature 38.5°C.",
        "output": json.dumps({
            "department": "Pediatrics / Pediatric Emergency",
            "priority": "Urgent",
            "suspected_condition": "Acute Laryngotracheobronchitis (Croup) with Stridor at Rest",
            "recommended_actions": [
                "Keep child calm in parent's lap; avoid invasive or agitating exams",
                "Administer single-dose oral Dexamethasone (0.6 mg/kg) or nebulized Budesonide",
                "Administer nebulized racemic epinephrine if respiratory distress is moderate-to-severe",
                "Monitor oxygen saturation and work of breathing for minimum 2-3 hours post-treatment"
            ],
            "clinical_rationale": "Stridor at rest indicates moderate-to-severe upper airway obstruction requiring corticosteroid anti-inflammatory therapy and airway monitoring."
        }, indent=2)
    },
    {
        "instruction": "Triage sudden acute severe lower right quadrant abdominal pain with rebound tenderness.",
        "input": "22-year-old male, pain started periumbilically 18 hours ago and migrated to RLQ (McBurney's point). Low-grade fever 38.0°C, anorexia, leukocytosis 14,000/mcL.",
        "output": json.dumps({
            "department": "General Surgery",
            "priority": "Urgent",
            "suspected_condition": "Acute Appendicitis",
            "recommended_actions": [
                "NPO (nothing by mouth) status immediately in anticipation of surgery",
                "Urgent ultrasound or contrast-enhanced CT of abdomen/pelvis",
                "IV hydration with isotonic crystalloids and pre-operative antibiotics",
                "Surgical consultation for laparoscopic appendectomy"
            ],
            "clinical_rationale": "Classic migratory pain to McBurney's point with rebound tenderness and leukocytosis strongly points to acute appendicitis with risk of rupture."
        }, indent=2)
    },
    {
        "instruction": "Triage patient presenting with progressive polyuria, polydipsia, vomiting, and fruity breath odor.",
        "input": "19-year-old female with Type 1 Diabetes, blood glucose 480 mg/dL, deep rapid Kussmaul respirations, blood ketones 4.2 mmol/L.",
        "output": json.dumps({
            "department": "Endocrinology / Intensive Care Unit",
            "priority": "Immediate",
            "suspected_condition": "Diabetic Ketoacidosis (DKA)",
            "recommended_actions": [
                "Aggressive fluid resuscitation with normal saline (1-1.5 L in first hour)",
                "Serial venous blood gas and serum potassium check BEFORE starting insulin",
                "Continuous IV regular insulin infusion (0.1 units/kg/hr) once K+ > 3.3 mEq/L",
                "Hourly blood glucose and electrolyte monitoring to prevent hypokalemia and cerebral edema"
            ],
            "clinical_rationale": "Severe hyperglycemia, ketonemia, metabolic acidosis, and Kussmaul breathing confirm life-threatening DKA requiring ICU-level fluid and electrolyte correction."
        }, indent=2)
    }
]

DISCHARGE_PHARMA_EXPANDED = [
    {
        "instruction": "Translate and explain the medical discharge prescription into low-literacy patient instructions with Indian context and INR pricing.",
        "input": "Discharge Rx: Tab Metformin 500mg PO BID with meals; Tab Telmisartan 40mg PO QD in AM; Tab Atorvastatin 20mg PO QHS; Syp Gelusil 10ml TID PC PRN.",
        "output": (
            "### 💊 Your Daily Medicine Guide (AuraHealth Pharmacy)\n\n"
            "1. **Metformin (500mg)** - Blood Sugar Control:\n"
            "   - **How to take**: 1 tablet TWICE daily, taken WITH your breakfast and dinner.\n"
            "   - **Tip**: Taking it with food prevents stomach upset. Estimated cost: ~₹45 for 10 tablets.\n\n"
            "2. **Telmisartan (40mg)** - Blood Pressure Protection:\n"
            "   - **How to take**: 1 tablet ONCE daily in the MORNING after breakfast.\n"
            "   - **Tip**: Take it at the same time every day to keep blood pressure steady. Estimated cost: ~₹85 for 15 tablets.\n\n"
            "3. **Atorvastatin (20mg)** - Heart & Cholesterol Care:\n"
            "   - **How to take**: 1 tablet ONCE daily at BEDTIME.\n"
            "   - **Tip**: Cholesterol synthesis peaks at night, making bedtime the most effective time. Estimated cost: ~₹110 for 10 tablets.\n\n"
            "4. **Gelusil Syrup** - Antacid for Heartburn:\n"
            "   - **How to take**: 2 teaspoons (10ml) AFTER meals, only when needed for acidity or burning.\n\n"
            "⚠️ **Important Warning**: If you experience chest heaviness, severe dizziness, or swelling in feet, contact the AuraHealth 24/7 helpline immediately."
        )
    },
    {
        "instruction": "Structure the unformatted clinical discharge narrative into a standard JSON schema for electronic health record archival.",
        "input": "Patient Rajiv Sharma, 48M, admitted 2026-08-10 with acute bacterial pneumonia, discharged 2026-08-14. Treated with IV Ceftriaxone. Afebrile for 48 hours. Discharge on Tab Amoxiclav 625mg TID x 5 days, Tab Paracetamol 650mg SOS for fever > 100F. Follow up in Pulmonary OPD on 2026-08-22 with repeat CXR.",
        "output": json.dumps({
            "patient_name": "Rajiv Sharma",
            "age": 48,
            "gender": "Male",
            "admission_date": "2026-08-10",
            "discharge_date": "2026-08-14",
            "primary_diagnosis": "Acute Bacterial Community-Acquired Pneumonia",
            "discharge_status": "Clinically stable, afebrile for 48 hours",
            "discharge_medications": [
                {
                    "medication": "Amoxicillin-Clavulanate (Amoxiclav)",
                    "dosage": "625mg",
                    "route": "Oral",
                    "frequency": "Three times daily (every 8 hours) with food",
                    "duration": "5 days",
                    "purpose": "Complete antibacterial eradication"
                },
                {
                    "medication": "Paracetamol",
                    "dosage": "650mg",
                    "route": "Oral",
                    "frequency": "As needed (SOS) for fever > 100°F",
                    "duration": "PRN",
                    "purpose": "Antipyretic / Analgesic"
                }
            ],
            "lifestyle_restrictions": [
                "Adequate oral hydration (minimum 2.5 Liters daily)",
                "Avoid exposure to dust, tobacco smoke, and sudden temperature shifts",
                "Deep breathing and incentive spirometry exercises thrice daily"
            ],
            "follow_up": {
                "department": "Pulmonology Outpatient Clinic",
                "date": "2026-08-22",
                "required_investigations": ["Repeat Posteroanterior Chest X-Ray (CXR)"]
            },
            "red_flags": [
                "Recurrent high fever (> 101°F)",
                "Worsening shortness of breath or resting oxygen saturation below 94%",
                "Rust-colored or blood-tinged sputum"
            ]
        }, indent=2)
    },
    {
        "instruction": "Explain surgical wound care and antibiotic stewardship post-laparoscopic cholecystectomy in simple patient terms.",
        "input": "42-year-old female post elective laparoscopic cholecystectomy. Discharged on Cefixime 200mg BID x 5 days, Pantoprazole 40mg QD AC x 10 days, Tramadol-Paracetamol SOS for pain.",
        "output": (
            "### 🩹 Post-Surgery Care Instructions (Gallbladder Removal)\n\n"
            "**1. Incision and Wound Care:**\n"
            "- Keep the small abdomen bandage clean and dry for the first 48 hours.\n"
            "- You may take a quick sponge bath, but do NOT soak in a bathtub or swimming pool.\n"
            "- If the dressings become moist, replace them with sterile gauze available at the pharmacy.\n\n"
            "**2. Prescription Schedule:**\n"
            "- **Cefixime 200mg**: 1 tablet every 12 hours after food for 5 full days. *Do not stop early even if feeling healthy!*\n"
            "- **Pantoprazole 40mg**: 1 tablet in the morning 30 minutes BEFORE breakfast.\n"
            "- **Pain Relief**: Take only if pain exceeds 5/10; do not take on an empty stomach.\n\n"
            "**3. Warning Flags:**\n"
            "- Redness, warmth, foul drainage from wound sites, fever above 100.4°F, or yellowing of the eyes (jaundice). Call hospital emergency desk immediately."
        )
    }
]

TELEMETRY_VITALS_EXPANDED = [
    {
        "instruction": "Analyze bedside telemetry vital signs and provide immediate clinical alerts and intervention recommendations.",
        "input": "Bed ICU-04, Patient 61M with septic shock on norepinephrine: HR 138 bpm (sinus tachycardia), BP 82/48 mmHg (MAP 59 mmHg), SpO2 88% on 4L nasal cannula, RR 32 breaths/min, Temp 39.2°C.",
        "output": json.dumps({
            "alert_level": "CRITICAL (Code Alert)",
            "primary_concern": "Refractory Septic Shock & Acute Hypoxemic Respiratory Failure",
            "vital_anomalies": {
                "hypotension": "MAP 59 mmHg (Goal >= 65 mmHg)",
                "hypoxemia": "SpO2 88% on low-flow O2",
                "tachypnea": "RR 32 breaths/min (severe respiratory work)",
                "hyperthermia": "Temp 39.2°C exacerbating oxygen consumption"
            },
            "immediate_orders": [
                "Escalate oxygen to Non-Rebreather Mask (15L) or prepare for High Flow Nasal Cannula / Intubation",
                "Titrate norepinephrine infusion to achieve target MAP >= 65 mmHg",
                "Administer IV crystalloid bolus (500ml balanced salt solution over 15 mins) if fluid responsive",
                "Stat arterial blood gas (ABG) and repeat serum lactate",
                "Administer antipyretic (IV Paracetamol 1g) to reduce metabolic demand"
            ],
            "telemetry_rationale": "Tissue hypoperfusion with inadequate oxygenation in septic shock leads to rapid multi-organ dysfunction syndrome (MODS) without rapid vasoactive and respiratory titration."
        }, indent=2)
    },
    {
        "instruction": "Evaluate ward telemetry alert for an elderly postoperative patient exhibiting sudden vital sign deterioration.",
        "input": "Bed Ward-208, Patient 74F on Post-Op Day 2 after total knee arthroplasty: Sudden onset dyspnea and pleuritic chest pain. HR 122 bpm, BP 100/65 mmHg, SpO2 89% room air, RR 28 breaths/min.",
        "output": json.dumps({
            "alert_level": "WARNING -> HIGH PRIORITY",
            "suspected_condition": "Acute Pulmonary Embolism (PE)",
            "vital_anomalies": {
                "hypoxemia": "SpO2 89% (desaturation > 5% from baseline)",
                "tachycardia": "HR 122 bpm",
                "tachypnea": "RR 28 breaths/min"
            },
            "immediate_orders": [
                "Place patient on 4-6 L/min O2 via nasal cannula / Venturi mask immediately (target SpO2 > 94%)",
                "Stat 12-lead ECG (look for S1Q3T3 pattern, right axis deviation, T-wave inversions V1-V4)",
                "Urgent CT Pulmonary Angiogram (CTPA) or bedside venous Doppler if CT contraindicated",
                "Stat D-Dimer, Troponin, and bedside Echocardiogram for right ventricular strain",
                "Evaluate for immediate initiation of therapeutic anticoagulation (e.g., Enoxaparin / Heparin)"
            ],
            "telemetry_rationale": "High clinical pre-test probability (Wells score) for deep vein thrombosis complication post orthopedic surgery presenting with acute ventilation-perfusion mismatch."
        }, indent=2)
    },
    {
        "instruction": "Interpret continuous ECG telemetry and rhythm disturbance alarm for a monitored cardiology inpatient.",
        "input": "Bed Ward-112, Patient 65M with CAD: Telemetry monitor triggers wide-complex tachycardia at 165 bpm lasting > 30 seconds. Patient reports dizziness and lightheadedness. BP 88/54 mmHg.",
        "output": json.dumps({
            "alert_level": "CRITICAL (Malignant Ventricular Arrhythmia)",
            "suspected_rhythm": "Sustained Monomorphic Ventricular Tachycardia (VT) with Hemodynamic Instability",
            "immediate_orders": [
                "Activate Medical Emergency Team / Code Blue immediately",
                "Bring defibrillator/crash cart to bedside; apply defibrillation pads",
                "Assess ABCs (Airway, Breathing, Circulation) and verify carotid pulse presence",
                "Because patient is unstable (hypotension, dizziness), prepare for synchronized electrical cardioversion (100 J)",
                "Obtain stat 12-lead ECG, establish IV access, and check serum potassium/magnesium"
            ],
            "telemetry_rationale": "Sustained wide-complex tachycardia with hypoperfusion is unstable ventricular tachycardia until proven otherwise. Immediate synchronized cardioversion is indicated to prevent degeneration to ventricular fibrillation."
        }, indent=2)
    }
]


def convert_to_qwen_chatml(instruction: str, input_text: str, output_text: str) -> dict:
    """Format an instruction-input-output triplet into Qwen 2.5 ChatML format."""
    user_content = instruction
    if input_text and input_text.strip():
        user_content = f"{instruction}\n\n[Clinical Context]:\n{input_text.strip()}"

    messages = [
        {"role": "system", "content": QWEN_SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
        {"role": "assistant", "content": output_text.strip()}
    ]
    return {"messages": messages}


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, "data")
    os.makedirs(data_dir, exist_ok=True)

    print("================================================================")
    print("      AURAHEALTH QWEN 2.5 CLINICAL DATASET GENERATOR            ")
    print("================================================================")
    print(f"Target Directory: {data_dir}\n")

    triage_file = os.path.join(data_dir, "qwen_soup_triage.jsonl")
    discharge_file = os.path.join(data_dir, "qwen_soup_discharge.jsonl")
    telemetry_file = os.path.join(data_dir, "qwen_soup_telemetry.jsonl")
    master_jsonl = os.path.join(data_dir, "qwen_soup_master_dataset.jsonl")
    master_json = os.path.join(data_dir, "qwen_soup_master_dataset.json")

    # 1. Ingest existing base dataset if present
    base_dataset_path = os.path.join(data_dir, "medgemma_soup_training_dataset.json")
    base_examples = []
    if os.path.exists(base_dataset_path):
        print(f"[1/5] Ingesting clinical corpus from {base_dataset_path}...")
        try:
            with open(base_dataset_path, "r", encoding="utf-8") as f:
                base_examples = json.load(f)
            print(f"      -> Successfully loaded {len(base_examples):,} clinical records.")
        except Exception as e:
            print(f"      -> Warning loading base dataset: {e}")
    else:
        print(f"[1/5] No previous base dataset found at {base_dataset_path}. Proceeding with curated examples.")

    # 2. Partition base dataset by clinical domain
    triage_records = []
    discharge_records = []
    telemetry_records = []
    general_records = []

    # Add curated high-impact examples first
    for item in TRIAGE_EXPANDED:
        triage_records.append(convert_to_qwen_chatml(item["instruction"], item["input"], item["output"]))
    for item in DISCHARGE_PHARMA_EXPANDED:
        discharge_records.append(convert_to_qwen_chatml(item["instruction"], item["input"], item["output"]))
    for item in TELEMETRY_VITALS_EXPANDED:
        telemetry_records.append(convert_to_qwen_chatml(item["instruction"], item["input"], item["output"]))

    print("[2/5] Categorizing records into domain-specific Model Soup ingredients...")
    for rec in base_examples:
        inst = rec.get("instruction", "")
        inp = rec.get("input", "")
        out = rec.get("output", "")
        source = rec.get("source", "").lower()
        
        chatml_item = convert_to_qwen_chatml(inst, inp, out)

        if any(w in source or w in inst.lower() for w in ["triage", "emergency", "symptom", "urgent", "observation", "priority"]):
            triage_records.append(chatml_item)
        elif any(w in source or w in inst.lower() for w in ["prescription", "medication", "discharge", "treatment", "dose", "tablet"]):
            discharge_records.append(chatml_item)
        elif any(w in source or w in inst.lower() for w in ["vital", "telemetry", "test", "exam", "complication", "icu", "rate", "pressure"]):
            telemetry_records.append(chatml_item)
        else:
            general_records.append(chatml_item)

    for i, rec in enumerate(general_records):
        if i % 3 == 0:
            triage_records.append(rec)
        elif i % 3 == 1:
            discharge_records.append(rec)
        else:
            telemetry_records.append(rec)

    # 3. Write individual soup ingredient files (.jsonl)
    print("[3/5] Writing Model Soup ingredient datasets...")
    with open(triage_file, "w", encoding="utf-8") as f:
        for r in triage_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"      -> [Ingredient 1: Triage]    {len(triage_records):,} records -> {triage_file}")

    with open(discharge_file, "w", encoding="utf-8") as f:
        for r in discharge_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"      -> [Ingredient 2: Discharge] {len(discharge_records):,} records -> {discharge_file}")

    with open(telemetry_file, "w", encoding="utf-8") as f:
        for r in telemetry_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"      -> [Ingredient 3: Telemetry] {len(telemetry_records):,} records -> {telemetry_file}")

    # 4. Write Unified Master Dataset (.jsonl & .json)
    print("[4/5] Compiling Unified Master Dataset...")
    all_chatml = triage_records + discharge_records + telemetry_records
    random.seed(42)
    random.shuffle(all_chatml)

    with open(master_jsonl, "w", encoding="utf-8") as f:
        for r in all_chatml:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"      -> Master JSONL: {len(all_chatml):,} records -> {master_jsonl}")

    all_alpaca = []
    for item in all_chatml:
        msgs = item["messages"]
        user_msg = next((m["content"] for m in msgs if m["role"] == "user"), "")
        asst_msg = next((m["content"] for m in msgs if m["role"] == "assistant"), "")
        all_alpaca.append({
            "instruction": user_msg,
            "input": "",
            "output": asst_msg,
            "source": "AuraHealth-Qwen2.5-Clinical"
        })

    with open(master_json, "w", encoding="utf-8") as f:
        json.dump(all_alpaca, f, indent=2, ensure_ascii=False)
    print(f"      -> Master JSON:  {len(all_alpaca):,} records -> {master_json}")

    print("\n[5/5] Dataset Generation Complete!")
    print(f"Total clinical records ready for Qwen 2.5 Model Soup training: {len(all_chatml):,}\n")


if __name__ == "__main__":
    main()
