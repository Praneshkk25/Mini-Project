import uuid
from datetime import datetime
from typing import Tuple, List, Dict, Any
from streaming.schemas import PatientVitalEvent, ProcessedPatientVital, PatientAlert

def calculate_news2(vital: PatientVitalEvent) -> Tuple[int, str, float]:
    """
    Calculates the validated NHS National Early Warning Score 2 (NEWS2).
    Evaluates: Respiration Rate, SpO2, Systolic BP, Heart Rate, Temperature.
    Returns: (news2_score: int, risk_level: str ['LOW', 'MODERATE', 'HIGH'], deterioration_probability: float)
    """
    score = 0

    # 1. Respiration Rate (breaths/min)
    rr = vital.respiratory_rate
    if rr <= 8 or rr >= 25:
        score += 3
    elif 21 <= rr <= 24:
        score += 2
    elif 9 <= rr <= 11:
        score += 1

    # 2. Oxygen Saturation SpO2 (%)
    spo2 = vital.spo2
    if spo2 <= 91:
        score += 3
    elif 92 <= spo2 <= 93:
        score += 2
    elif 94 <= spo2 <= 95:
        score += 1

    # 3. Systolic Blood Pressure (mmHg)
    sbp = vital.systolic_bp
    if sbp <= 90 or sbp >= 220:
        score += 3
    elif 91 <= sbp <= 100:
        score += 2
    elif 101 <= sbp <= 110:
        score += 1

    # 4. Heart Rate (bpm)
    hr = vital.heart_rate
    if hr <= 40 or hr >= 131:
        score += 3
    elif 111 <= hr <= 130:
        score += 2
    elif (41 <= hr <= 50) or (91 <= hr <= 110):
        score += 1

    # 5. Body Temperature (°C)
    temp = vital.temperature
    if temp <= 35.0:
        score += 3
    elif temp >= 39.1:
        score += 2
    elif (35.1 <= temp <= 36.0) or (38.1 <= temp <= 39.0):
        score += 1

    # NHS Clinical Risk Stratification:
    # 0 - 4: Low clinical risk (Ward routine care)
    # 5 - 6 (or any single red score of 3): Moderate clinical risk (Urgent ward doctor review)
    # >= 7: High clinical risk (Emergency Rapid Response / ICU review)
    if score >= 7:
        risk = "HIGH"
        prob = min(0.94, 0.55 + (score - 7) * 0.08)
    elif score >= 5:
        risk = "MODERATE"
        prob = min(0.50, 0.25 + (score - 5) * 0.10)
    elif score >= 3:
        risk = "MODERATE"
        prob = 0.20
    else:
        risk = "LOW"
        prob = max(0.02, score * 0.04)

    return score, risk, round(prob, 2)

def generate_clinical_decision_support(vital: PatientVitalEvent, score: int, risk: str) -> Tuple[str, List[str]]:
    """
    Generates evidence-based Clinical Decision Support (CDS) insights and actionable next steps.
    """
    recs = []
    insights = []

    if vital.spo2 < 92:
        recs.append("Initiate supplemental O2 therapy (target SpO2 94-98% or 88-92% if COPD).")
        recs.append("Order STAT Arterial Blood Gas (ABG) & Portable Chest Radiograph.")
        insights.append(f"Hypoxemic desaturation ({vital.spo2}%) detected.")

    if vital.heart_rate > 120 and vital.temperature >= 38.5:
        recs.append("Initiate Sepsis Six: Blood cultures x2, IV broad-spectrum antibiotics within 1 hr, Serum Lactate.")
        recs.append("Administer IV crystalloid fluid challenge (30 mL/kg if hypoperfused).")
        insights.append("SIRS / Sepsis criteria met (Tachycardia + Hyperpyrexia).")
    elif vital.heart_rate > 130:
        recs.append("Perform 12-lead ECG STAT to assess for SVT or Atrial Fibrillation with RVR.")
        recs.append("Check serum electrolytes (potassium, magnesium) and high-sensitivity Troponin.")
        insights.append(f"Severe tachycardia ({vital.heart_rate} bpm) impairs cardiac diastolic filling time.")
    elif vital.heart_rate < 50:
        recs.append("Evaluate for symptomatic bradycardia; keep Atropine 0.5mg IV & transcutaneous pacing standby.")
        recs.append("Review medication chart for AV nodal blocking agents (beta-blockers, diltiazem, digoxin).")
        insights.append(f"Hemodynamically significant bradycardia ({vital.heart_rate} bpm).")

    if vital.systolic_bp >= 160:
        recs.append("Check for acute end-organ damage (papilledema, acute kidney injury, encephalopathy).")
        recs.append("Consider IV antihypertensive infusion (Labetalol / Nicardipine) with repeat BP in 15 mins.")
        insights.append(f"Hypertensive urgency pattern (Systolic {vital.systolic_bp} mmHg).")
    elif vital.systolic_bp < 90:
        recs.append("STAT fluid bolus 500 mL normal saline; monitor mean arterial pressure (MAP target >= 65 mmHg).")
        recs.append("Prepare peripheral or central vasopressor support (Norepinephrine) if volume unresponsive.")
        insights.append(f"Hypotensive decompensation (Systolic {vital.systolic_bp} mmHg).")

    if vital.respiratory_rate > 24:
        recs.append("Elevate head of bed to High Fowler position; assess work of breathing & accessory muscle use.")
        insights.append(f"Tachypnea ({vital.respiratory_rate}/min) is an early predictive marker of metabolic acidosis or pulmonary compromise.")

    if not recs:
        insights.append("Vitals hemodynamically stable within normal clinical limits.")
        recs.append("Maintain routine q4h continuous vital telemetry observation.")
        recs.append("Encourage incentive spirometry and progressive mobilization.")

    insight_str = " | ".join(insights)
    return insight_str, recs

def evaluate_patient_vitals(vital: PatientVitalEvent) -> Tuple[ProcessedPatientVital, List[PatientAlert]]:
    """
    Evaluates raw patient vital telemetry against clinical safety thresholds and calculates NEWS2.
    Returns: (ProcessedPatientVital with calculated status flags and CDS, List of generated PatientAlerts)
    """
    alerts: List[PatientAlert] = []
    timestamp = vital.timestamp or datetime.now().isoformat()

    # Individual vital status evaluation
    hr_status = "NORMAL"
    spo2_status = "NORMAL"
    bp_status = "NORMAL"
    temp_status = "NORMAL"
    rr_status = "NORMAL"

    abnormal_count = 0
    max_severity = "NORMAL"

    # 1. Heart Rate Evaluation (bpm)
    if vital.heart_rate > 150:
        hr_status = "CRITICAL"
        max_severity = "CRITICAL"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="CRITICAL",
            parameter="Heart Rate",
            value=float(vital.heart_rate),
            message=f"Severe tachycardia detected: {vital.heart_rate} bpm (threshold > 150)",
            status="ACTIVE"
        ))
    elif vital.heart_rate < 50:
        hr_status = "CRITICAL"
        max_severity = "CRITICAL"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="CRITICAL",
            parameter="Heart Rate",
            value=float(vital.heart_rate),
            message=f"Severe bradycardia detected: {vital.heart_rate} bpm (threshold < 50)",
            status="ACTIVE"
        ))
    elif vital.heart_rate > 120:
        hr_status = "WARNING"
        if max_severity != "CRITICAL":
            max_severity = "WARNING"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="WARNING",
            parameter="Heart Rate",
            value=float(vital.heart_rate),
            message=f"Elevated heart rate detected: {vital.heart_rate} bpm (threshold > 120)",
            status="ACTIVE"
        ))

    # 2. SpO2 Oxygen Saturation Evaluation (%)
    if vital.spo2 < 88:
        spo2_status = "CRITICAL"
        max_severity = "CRITICAL"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="CRITICAL",
            parameter="SpO2",
            value=float(vital.spo2),
            message=f"Critical hypoxemia: SpO2 dropped to {vital.spo2}% (threshold < 88%)",
            status="ACTIVE"
        ))
    elif vital.spo2 < 92:
        spo2_status = "WARNING"
        if max_severity != "CRITICAL":
            max_severity = "WARNING"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="WARNING",
            parameter="SpO2",
            value=float(vital.spo2),
            message=f"Low oxygen saturation: SpO2 {vital.spo2}% (threshold < 92%)",
            status="ACTIVE"
        ))

    # 3. Blood Pressure Evaluation (Systolic mmHg)
    if vital.systolic_bp >= 180 or vital.systolic_bp < 85:
        bp_status = "CRITICAL"
        max_severity = "CRITICAL"
        abnormal_count += 1
        msg = f"Critical Blood Pressure: {vital.systolic_bp}/{vital.diastolic_bp} mmHg"
        if vital.systolic_bp >= 180:
            msg += " (Hypertensive Crisis >= 180)"
        else:
            msg += " (Hypotensive Shock < 85)"
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="CRITICAL",
            parameter="Blood Pressure",
            value=float(vital.systolic_bp),
            message=msg,
            status="ACTIVE"
        ))
    elif vital.systolic_bp >= 160:
        bp_status = "WARNING"
        if max_severity != "CRITICAL":
            max_severity = "WARNING"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="WARNING",
            parameter="Blood Pressure",
            value=float(vital.systolic_bp),
            message=f"High Blood Pressure: {vital.systolic_bp}/{vital.diastolic_bp} mmHg (threshold >= 160)",
            status="ACTIVE"
        ))

    # 4. Body Temperature Evaluation (°C)
    if vital.temperature >= 40.0 or vital.temperature < 35.0:
        temp_status = "CRITICAL"
        max_severity = "CRITICAL"
        abnormal_count += 1
        msg = f"Critical Temperature: {vital.temperature:.1f} °C"
        if vital.temperature >= 40.0:
            msg += " (Hyperpyrexia >= 40.0°C)"
        else:
            msg += " (Hypothermia < 35.0°C)"
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="CRITICAL",
            parameter="Temperature",
            value=float(vital.temperature),
            message=msg,
            status="ACTIVE"
        ))
    elif vital.temperature >= 38.5:
        temp_status = "WARNING"
        if max_severity != "CRITICAL":
            max_severity = "WARNING"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="WARNING",
            parameter="Temperature",
            value=float(vital.temperature),
            message=f"High Fever: {vital.temperature:.1f} °C (threshold >= 38.5°C)",
            status="ACTIVE"
        ))

    # 5. Respiratory Rate Evaluation (/min)
    if vital.respiratory_rate > 30:
        rr_status = "CRITICAL"
        max_severity = "CRITICAL"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="CRITICAL",
            parameter="Respiratory Rate",
            value=float(vital.respiratory_rate),
            message=f"Severe Tachypnea: {vital.respiratory_rate} /min (threshold > 30)",
            status="ACTIVE"
        ))
    elif vital.respiratory_rate > 24:
        rr_status = "WARNING"
        if max_severity != "CRITICAL":
            max_severity = "WARNING"
        abnormal_count += 1
        alerts.append(PatientAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            patient_id=vital.patient_id,
            patient_name=vital.patient_name,
            bed_id=vital.bed_id,
            department=vital.department,
            timestamp=timestamp,
            alert_level="WARNING",
            parameter="Respiratory Rate",
            value=float(vital.respiratory_rate),
            message=f"Elevated Respiratory Rate: {vital.respiratory_rate} /min (threshold > 24)",
            status="ACTIVE"
        ))

    # Multiple Simultaneous Abnormalities Rule
    if abnormal_count >= 2:
        max_severity = "CRITICAL"

    overall_status = max_severity

    # Calculate NEWS2 & Clinical Decision Support
    news2_score, risk_class, det_prob = calculate_news2(vital)
    cds_insights, cds_recs = generate_clinical_decision_support(vital, news2_score, risk_class)

    processed_vital = ProcessedPatientVital(
        **vital.model_dump(),
        heart_rate_status=hr_status,
        spo2_status=spo2_status,
        blood_pressure_status=bp_status,
        temperature_status=temp_status,
        respiratory_rate_status=rr_status,
        overall_status=overall_status,
        alert_level=overall_status,
        news2_score=news2_score,
        risk_classification=risk_class,
        deterioration_probability=det_prob,
        cds_insights=cds_insights,
        cds_recommendations=cds_recs
    )

    return processed_vital, alerts
