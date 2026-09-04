import uuid
from datetime import datetime
from typing import Tuple, List, Dict, Any
from streaming.schemas import PatientVitalEvent, ProcessedPatientVital, PatientAlert

def evaluate_patient_vitals(vital: PatientVitalEvent) -> Tuple[ProcessedPatientVital, List[PatientAlert]]:
    """
    Evaluates raw patient vital telemetry against clinical safety thresholds.
    Returns: (ProcessedPatientVital with calculated status flags, List of generated PatientAlerts)
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
    max_severity = "NORMAL"  # NORMAL < WARNING < CRITICAL

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

    # 3. Blood Pressure Evaluation (Systolic / Diastolic mmHg)
    if vital.systolic_bp >= 180 or vital.systolic_bp < 90:
        bp_status = "CRITICAL"
        max_severity = "CRITICAL"
        abnormal_count += 1
        msg = f"Critical Blood Pressure: {vital.systolic_bp}/{vital.diastolic_bp} mmHg"
        if vital.systolic_bp >= 180:
            msg += " (Hypertensive Crisis >= 180)"
        else:
            msg += " (Severe Hypotension < 90)"
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

    processed_vital = ProcessedPatientVital(
        **vital.model_dump(),
        heart_rate_status=hr_status,
        spo2_status=spo2_status,
        blood_pressure_status=bp_status,
        temperature_status=temp_status,
        respiratory_rate_status=rr_status,
        overall_status=overall_status,
        alert_level=overall_status
    )

    return processed_vital, alerts
