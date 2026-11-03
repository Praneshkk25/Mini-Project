import re
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.database import get_db_connection

RED_FLAG_KEYWORDS = [
    ("chest pain", "Acute Chest Pain / Angina"),
    ("chest tightness", "Chest Pressure / Tightness"),
    ("shortness of breath", "Severe Dyspnea / Breathlessness"),
    ("breathless", "Severe Dyspnea / Breathlessness"),
    ("cannot breathe", "Acute Respiratory Distress"),
    ("high fever", "High Pyrexia / Potential Infection"),
    ("fever", "Fever"),
    ("pus", "Purulent Wound Infection"),
    ("bleeding", "Active Surgical Wound Bleeding"),
    ("blood", "Active Bleeding"),
    ("fainted", "Syncope / Loss of Consciousness"),
    ("dizzy", "Severe Presyncope / Dizziness"),
    ("swelling in leg", "Deep Vein Thrombosis (DVT) Sign"),
    ("calf pain", "Deep Vein Thrombosis (DVT) Sign")
]

class PostDischargeService:
    @staticmethod
    def enroll_patient(patient_id: str, doctor_name: str = "Dr. Sarah Jenkins") -> List[Dict[str, Any]]:
        """Enrolls a discharged patient into the 5-stage Post-Discharge RPM Schedule."""
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now()

        milestones = [
            (1, "Day 1 – Initial Follow-Up", "AI agent checks pain levels, wound symptoms and general post-procedure recovery.", now + timedelta(days=1)),
            (3, "Day 3 – Recovery Assessment", "Collect feedback on medication adherence, side effects, and vital stability.", now + timedelta(days=3)),
            (7, "Day 7 – Risk Evaluation", "Analyse functional recovery progress, mobility, and check for concerning symptoms.", now + timedelta(days=7)),
            (14, "Day 14 – Mid-Term Care Review", "Review clinical progress ahead of upcoming outpatient specialist review.", now + timedelta(days=14)),
            (30, "Day 30 – Complete Outcome Assessment", "Final recovery confirmation and quality of life outcome assessment.", now + timedelta(days=30))
        ]

        created_schedules = []
        for day, title, desc, target_dt in milestones:
            sched_id = f"SCH-{patient_id}-{day}-{uuid.uuid4().hex[:4].upper()}"
            cursor.execute("""
            INSERT OR REPLACE INTO remote_engagement_schedules (schedule_id, patient_id, milestone_day, title, description, target_date, channel, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (sched_id, patient_id, day, title, desc, target_dt.strftime("%Y-%m-%d"), "WHATSAPP", "PENDING", now.isoformat()))
            created_schedules.append({
                "schedule_id": sched_id,
                "milestone_day": day,
                "title": title,
                "target_date": target_dt.strftime("%Y-%m-%d"),
                "status": "PENDING"
            })

        conn.commit()
        conn.close()
        return created_schedules

    @staticmethod
    def get_patient_timeline(patient_id: str) -> Dict[str, Any]:
        """Returns patient's recovery milestones, completed check-ins, and active escalations."""
        conn = get_db_connection()
        cursor = conn.cursor()

        # Schedules
        cursor.execute("SELECT * FROM remote_engagement_schedules WHERE patient_id = ? ORDER BY milestone_day ASC", (patient_id,))
        schedules = [dict(r) for r in cursor.fetchall()]

        # Past check-ins
        cursor.execute("SELECT * FROM remote_patient_checkins WHERE patient_id = ? ORDER BY milestone_day ASC, created_at DESC", (patient_id,))
        checkins = [dict(r) for r in cursor.fetchall()]

        # Active escalations
        cursor.execute("SELECT * FROM clinical_escalations WHERE patient_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC", (patient_id,))
        escalations = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,))
        pt = cursor.fetchone()
        pt_dict = dict(pt) if pt else {}

        conn.close()

        # Calculate adherence & overall recovery health
        total_checkins = len(checkins)
        avg_pain = round(sum(c.get("pain_score", 0) for c in checkins) / total_checkins, 1) if total_checkins > 0 else 2.0
        adherence_rate = round((sum(c.get("medication_adherent", 1) for c in checkins) / total_checkins) * 100, 1) if total_checkins > 0 else 100.0

        current_risk = "LOW"
        if escalations:
            current_risk = "HIGH_ESCALATED"
        elif any(c.get("risk_level") == "MODERATE" for c in checkins):
            current_risk = "MODERATE"

        return {
            "patient_id": patient_id,
            "patient_name": pt_dict.get("name", "Patient"),
            "current_risk": current_risk,
            "adherence_rate": adherence_rate,
            "average_pain_score": avg_pain,
            "has_active_escalation": len(escalations) > 0,
            "schedules": schedules,
            "checkins": checkins,
            "escalations": escalations
        }

    @staticmethod
    def process_patient_checkin(
        patient_id: str,
        milestone_day: int,
        user_message: str,
        pain_score: Optional[int] = None,
        medication_adherent: int = 1,
        channel: str = "WHATSAPP"
    ) -> Dict[str, Any]:
        """
        Processes patient check-in response:
        1. Analyzes free-form text with Clinical NLP for symptom and red-flag extraction.
        2. Assigns clinical risk level (LOW, MODERATE, HIGH_ESCALATED).
        3. If HIGH, triggers immediate Clinical Escalation to attending physician.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        now_str = datetime.now().isoformat()

        # Extract pain score if not supplied directly
        if pain_score is None:
            pain_match = re.search(r'pain\s*(?:is|level|score)?\s*(?:of)?\s*([0-9]|10)', user_message, re.IGNORECASE)
            pain_score = int(pain_match.group(1)) if pain_match else 2

        # Red-Flag Clinical Detection with Negation Handling (e.g., 'no fever', 'denies chest pain')
        lower_msg = user_message.lower()
        detected_red_flags = []
        for phrase, label in RED_FLAG_KEYWORDS:
            if phrase in lower_msg:
                # Check for clinical negation before the keyword
                is_negated = bool(re.search(r'\b(?:no|not|without|denies|denying|free of|neither)\s+(?:\w+\s+){0,2}' + re.escape(phrase), lower_msg))
                if not is_negated and label not in detected_red_flags:
                    detected_red_flags.append(label)

        # Risk Classification
        requires_escalation = 0
        if detected_red_flags or pain_score >= 8:
            risk_level = "HIGH_ESCALATED"
            requires_escalation = 1
        elif pain_score >= 5 or medication_adherent == 0:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # AI Clinical Summary Generation
        if risk_level == "HIGH_ESCALATED":
            red_str = ", ".join(detected_red_flags) if detected_red_flags else f"Severe Pain Score ({pain_score}/10)"
            ai_summary = f"CRITICAL POST-DISCHARGE ALERT: Patient reports {red_str}. Severe acute symptom requires immediate physician review."
            reply_message = (
                f"⚠️ **AuraHealth Clinical Alert**: We have flagged your symptoms ({red_str}) as requiring urgent clinical attention. "
                f"Your attending physician has been notified immediately. If you feel dizzy or chest pain worsens, please call emergency services (108) or proceed to the nearest emergency department right away."
            )
        elif risk_level == "MODERATE":
            ai_summary = f"ELEVATED MONITORING: Patient reports pain score {pain_score}/10 with mild discomfort. Medication adherence: {'Confirmed' if medication_adherent else 'Missed dose reported'}. Daily cadence recommended."
            reply_message = (
                f"Thank you for checking in. We noticed your pain is at {pain_score}/10. Please ensure you are taking your prescribed analgesics with food and drinking plenty of fluids. "
                "Our clinical nurse team will follow up with you tomorrow."
            )
        else:
            ai_summary = f"NORMAL RECOVERY: Patient reports mild expected discomfort ({pain_score}/10). Full medication adherence confirmed. Clinical milestones progressing satisfactorily."
            reply_message = (
                f"Great to hear you are recovering well! Your pain score is {pain_score}/10 and medication adherence is on track. "
                f"We will check in with you again for your Day {milestone_day + 2 if milestone_day < 7 else 14} review. Rest well!"
            )

        # Insert check-in record
        checkin_id = f"CHK-{uuid.uuid4().hex[:8].upper()}"
        cursor.execute("""
        INSERT INTO remote_patient_checkins (
            checkin_id, patient_id, milestone_day, pain_score, medication_adherent,
            symptoms_reported, ai_clinical_summary, risk_level, requires_escalation, channel, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            checkin_id, patient_id, milestone_day, pain_score, medication_adherent,
            user_message, ai_summary, risk_level, requires_escalation, channel, now_str
        ))

        # Update schedule status to COMPLETED
        cursor.execute("""
        UPDATE remote_engagement_schedules
        SET status = ?
        WHERE patient_id = ? AND milestone_day = ?
        """, ("ESCALATED" if requires_escalation else "COMPLETED", patient_id, milestone_day))

        # If Escalated, create record in clinical_escalations for Doctor Station
        if requires_escalation:
            cursor.execute("SELECT name FROM patients WHERE patient_id = ?", (patient_id,))
            pt_row = cursor.fetchone()
            pt_name = pt_row["name"] if pt_row else "Patient"

            esc_id = f"ESC-{uuid.uuid4().hex[:6].upper()}"
            cursor.execute("""
            INSERT INTO clinical_escalations (
                escalation_id, patient_id, patient_name, doctor_name, reason,
                reported_symptoms, severity, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                esc_id, patient_id, pt_name, "Dr. Sarah Jenkins",
                f"Post-Discharge Red-Flag: {', '.join(detected_red_flags)}",
                user_message, "CRITICAL" if "chest" in lower_msg else "URGENT", "ACTIVE", now_str
            ))

        conn.commit()
        conn.close()

        return {
            "checkin_id": checkin_id,
            "milestone_day": milestone_day,
            "pain_score": pain_score,
            "medication_adherent": bool(medication_adherent),
            "risk_level": risk_level,
            "detected_red_flags": detected_red_flags,
            "ai_clinical_summary": ai_summary,
            "requires_escalation": bool(requires_escalation),
            "escalated": bool(requires_escalation),
            "severity": "CRITICAL" if requires_escalation else "NORMAL",
            "reply_message": reply_message
        }

    @staticmethod
    def get_active_escalations() -> List[Dict[str, Any]]:
        """Returns active post-discharge escalations for Doctor Station."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM clinical_escalations 
        ORDER BY created_at DESC
        """)
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def resolve_escalation(escalation_id: str, physician_note: str) -> Dict[str, Any]:
        """Physician reviews and resolves a post-discharge patient escalation."""
        conn = get_db_connection()
        cursor = conn.cursor()
        now_str = datetime.now().isoformat()
        cursor.execute("""
        UPDATE clinical_escalations
        SET status = 'RESOLVED', physician_action_note = ?, resolved_at = ?
        WHERE escalation_id = ?
        """, (physician_note, now_str, escalation_id))
        conn.commit()
        conn.close()
        return {"message": "Escalation resolved successfully.", "escalation_id": escalation_id}
