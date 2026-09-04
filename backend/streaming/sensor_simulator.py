import random
import time
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from streaming.schemas import PatientVitalEvent

logger = logging.getLogger(__name__)

INITIAL_PATIENT_PROFILES = [
    {
        "patient_id": "PT-1001",
        "patient_name": "Eleanor Vance",
        "bed_id": "ICU-101",
        "department": "ICU",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 72,
        "base_spo2": 98,
        "base_sys": 120,
        "base_dia": 78,
        "base_temp": 36.8,
        "base_rr": 16,
    },
    {
        "patient_id": "PT-1002",
        "patient_name": "Rohan Mehta",
        "bed_id": "ICU-102",
        "department": "ICU",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 84,
        "base_spo2": 95,
        "base_sys": 134,
        "base_dia": 86,
        "base_temp": 37.1,
        "base_rr": 19,
    },
    {
        "patient_id": "PT-1003",
        "patient_name": "Aarav Sharma",
        "bed_id": "GW-201",
        "department": "General Ward",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 68,
        "base_spo2": 99,
        "base_sys": 118,
        "base_dia": 76,
        "base_temp": 36.6,
        "base_rr": 15,
    },
    {
        "patient_id": "PT-1004",
        "patient_name": "Priya Singh",
        "bed_id": "ER-301",
        "department": "Emergency",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 110,
        "base_spo2": 93,
        "base_sys": 145,
        "base_dia": 92,
        "base_temp": 38.2,
        "base_rr": 23,
    },
    {
        "patient_id": "PT-1005",
        "patient_name": "Karan Malhotra",
        "bed_id": "ICU-103",
        "department": "ICU",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 76,
        "base_spo2": 97,
        "base_sys": 124,
        "base_dia": 82,
        "base_temp": 36.9,
        "base_rr": 17,
    },
    {
        "patient_id": "PT-1006",
        "patient_name": "Sita Devi",
        "bed_id": "CCU-401",
        "department": "Cardiology",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 92,
        "base_spo2": 94,
        "base_sys": 148,
        "base_dia": 94,
        "base_temp": 37.3,
        "base_rr": 21,
    },
    {
        "patient_id": "PT-1007",
        "patient_name": "Ananya Verma",
        "bed_id": "PED-501",
        "department": "Pediatrics",
        "attending_doctor": "Dr. Priya Sundaram",
        "base_hr": 105,
        "base_spo2": 98,
        "base_sys": 110,
        "base_dia": 70,
        "base_temp": 38.6,
        "base_rr": 26,
    },
    {
        "patient_id": "PT-1008",
        "patient_name": "Marcus Vance",
        "bed_id": "CCU-402",
        "department": "Cardiology",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 78,
        "base_spo2": 96,
        "base_sys": 130,
        "base_dia": 85,
        "base_temp": 36.7,
        "base_rr": 16,
    },
    {
        "patient_id": "PT-1009",
        "patient_name": "Elena Rostova",
        "bed_id": "NEURO-302",
        "department": "Neurology",
        "attending_doctor": "Dr. Aris Thalia",
        "base_hr": 70,
        "base_spo2": 98,
        "base_sys": 122,
        "base_dia": 80,
        "base_temp": 36.8,
        "base_rr": 15,
    },
    {
        "patient_id": "PT-1010",
        "patient_name": "David O'Connor",
        "bed_id": "ORTHO-204",
        "department": "Orthopedics",
        "attending_doctor": "Dr. Michael Chen",
        "base_hr": 74,
        "base_spo2": 99,
        "base_sys": 126,
        "base_dia": 82,
        "base_temp": 36.6,
        "base_rr": 16,
    },
    {
        "patient_id": "PT-1011",
        "patient_name": "Aisha Rahman",
        "bed_id": "GW-202",
        "department": "General Ward",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 69,
        "base_spo2": 98,
        "base_sys": 116,
        "base_dia": 74,
        "base_temp": 36.5,
        "base_rr": 14,
    },
    {
        "patient_id": "PT-1012",
        "patient_name": "Vikram Patel",
        "bed_id": "ICU-104",
        "department": "ICU",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 88,
        "base_spo2": 91,
        "base_sys": 152,
        "base_dia": 96,
        "base_temp": 37.8,
        "base_rr": 22,
    },
    {
        "patient_id": "PT-1013",
        "patient_name": "Sofia Rossi",
        "bed_id": "GW-203",
        "department": "General Ward",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 73,
        "base_spo2": 97,
        "base_sys": 120,
        "base_dia": 78,
        "base_temp": 36.9,
        "base_rr": 16,
    },
    {
        "patient_id": "PT-1014",
        "patient_name": "James Robertson",
        "bed_id": "ER-302",
        "department": "Emergency",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 96,
        "base_spo2": 93,
        "base_sys": 142,
        "base_dia": 90,
        "base_temp": 37.5,
        "base_rr": 20,
    },
    {
        "patient_id": "PT-1015",
        "patient_name": "Meera Nambiar",
        "bed_id": "ICU-105",
        "department": "ICU",
        "attending_doctor": "Dr. Sarah Jenkins",
        "base_hr": 82,
        "base_spo2": 96,
        "base_sys": 128,
        "base_dia": 84,
        "base_temp": 37.0,
        "base_rr": 18,
    },
]


class PatientSensorSimulator:
    """
    Simulates bedside healthcare patient monitoring devices generating real-time telemetry events.
    """

    def __init__(self, abnormal_probability: float = 0.05):
        self.abnormal_probability = abnormal_probability
        self.forced_critical_patients: Dict[str, float] = {}  # patient_id -> expiry_timestamp
        # Current state per patient to maintain smooth baseline trajectories
        self.patient_states: Dict[str, Dict[str, Any]] = {}
        self._init_states()

    def _init_states(self):
        for p in INITIAL_PATIENT_PROFILES:
            self.patient_states[p["patient_id"]] = {
                "profile": p,
                "current_hr": p["base_hr"],
                "current_spo2": p["base_spo2"],
                "current_sys": p["base_sys"],
                "current_dia": p["base_dia"],
                "current_temp": p["base_temp"],
                "current_rr": p["base_rr"],
            }

    def trigger_critical_state(self, patient_id: str, duration_seconds: int = 30):
        """Forces a patient into a severe critical state for demonstration."""
        if patient_id in self.patient_states:
            self.forced_critical_patients[patient_id] = time.time() + duration_seconds
            logger.info(f"[SIMULATOR] Forced CRITICAL state triggered for patient {patient_id} for {duration_seconds}s")
            return True
        return False

    def generate_patient_event(self, patient_id: str) -> Optional[PatientVitalEvent]:
        state = self.patient_states.get(patient_id)
        if not state:
            return None

        p = state["profile"]
        now_ts = time.time()
        is_forced_critical = (
            patient_id in self.forced_critical_patients
            and self.forced_critical_patients[patient_id] > now_ts
        )

        if is_forced_critical:
            # Generate severe critical reading
            critical_type = random.choice(["spo2_drop", "tachycardia", "hypertension", "fever_rr"])
            if critical_type == "spo2_drop":
                hr = random.randint(135, 160)
                spo2 = random.randint(82, 87)
                sys_bp = random.randint(165, 185)
                dia_bp = random.randint(100, 115)
                temp = round(random.uniform(38.8, 40.2), 1)
                rr = random.randint(28, 34)
            elif critical_type == "tachycardia":
                hr = random.randint(155, 175)
                spo2 = random.randint(89, 93)
                sys_bp = random.randint(170, 190)
                dia_bp = random.randint(105, 120)
                temp = round(random.uniform(38.0, 39.5), 1)
                rr = random.randint(26, 32)
            else:
                hr = random.randint(130, 150)
                spo2 = random.randint(85, 90)
                sys_bp = random.randint(182, 200)
                dia_bp = random.randint(110, 125)
                temp = round(random.uniform(39.5, 40.5), 1)
                rr = random.randint(30, 36)
        else:
            # Normal small fluctuation around baseline
            hr_delta = random.choice([-2, -1, 0, 1, 2])
            spo2_delta = random.choice([-1, 0, 0, 1])
            sys_delta = random.choice([-2, -1, 0, 1, 2])
            dia_delta = random.choice([-1, 0, 1])
            temp_delta = round(random.choice([-0.1, 0.0, 0.1]), 1)
            rr_delta = random.choice([-1, 0, 1])

            # Apply delta with boundary drift control
            hr = max(55, min(140, state["current_hr"] + hr_delta))
            spo2 = max(88, min(100, state["current_spo2"] + spo2_delta))
            sys_bp = max(90, min(175, state["current_sys"] + sys_delta))
            dia_bp = max(60, min(110, state["current_dia"] + dia_delta))
            temp = round(max(35.5, min(40.0, state["current_temp"] + temp_delta)), 1)
            rr = max(10, min(32, state["current_rr"] + rr_delta))

            # Occasional spontaneous abnormal event (~5% chance)
            if random.random() < self.abnormal_probability:
                spike_type = random.choice(["hr", "spo2", "bp", "temp", "rr"])
                if spike_type == "hr":
                    hr = random.randint(125, 145)
                elif spike_type == "spo2":
                    spo2 = random.randint(89, 91)
                elif spike_type == "bp":
                    sys_bp = random.randint(162, 178)
                    dia_bp = random.randint(98, 110)
                elif spike_type == "temp":
                    temp = round(random.uniform(38.6, 39.4), 1)
                elif spike_type == "rr":
                    rr = random.randint(25, 29)

            # Update current state towards baseline if drifted too far
            if abs(hr - p["base_hr"]) > 15 and not is_forced_critical:
                hr = int(0.7 * hr + 0.3 * p["base_hr"])
            if abs(sys_bp - p["base_sys"]) > 20 and not is_forced_critical:
                sys_bp = int(0.7 * sys_bp + 0.3 * p["base_sys"])

            state["current_hr"] = hr
            state["current_spo2"] = spo2
            state["current_sys"] = sys_bp
            state["current_dia"] = dia_bp
            state["current_temp"] = temp
            state["current_rr"] = rr

        event = PatientVitalEvent(
            patient_id=p["patient_id"],
            patient_name=p["patient_name"],
            bed_id=p["bed_id"],
            department=p["department"],
            attending_doctor=p.get("attending_doctor", "Dr. Sarah Jenkins"),
            timestamp=datetime.now().isoformat(),
            heart_rate=hr,
            spo2=spo2,
            systolic_bp=sys_bp,
            diastolic_bp=dia_bp,
            temperature=temp,
            respiratory_rate=rr,
        )
        return event

    def generate_all_events(self) -> List[PatientVitalEvent]:
        events = []
        for pid in self.patient_states.keys():
            evt = self.generate_patient_event(pid)
            if evt:
                events.append(evt)
        return events
