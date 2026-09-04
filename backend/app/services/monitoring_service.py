import os
import json
import time
import asyncio
import threading
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Set
from collections import defaultdict, deque

from streaming.kafka_config import (
    STREAMING_MODE,
    MONITORING_INTERVAL_SECONDS,
    BRONZE_DIR,
    SILVER_DIR,
    GOLD_DIR,
)
from streaming.schemas import (
    PatientVitalEvent,
    ProcessedPatientVital,
    PatientAlert,
    MonitoringSummaryStats,
)
from streaming.sensor_simulator import PatientSensorSimulator
from streaming.kafka_producer import PatientVitalKafkaProducer
from app.services.alert_service import evaluate_patient_vitals

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections for patient monitoring broadcasts."""

    def __init__(self):
        self.active_connections: Set[Any] = set()
        self._lock = threading.Lock()

    async def connect(self, websocket: Any):
        await websocket.accept()
        with self._lock:
            self.active_connections.add(websocket)
        logger.info(f"[WEBSOCKET] Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: Any):
        with self._lock:
            self.active_connections.discard(websocket)
        logger.info(f"[WEBSOCKET] Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        with self._lock:
            connections = list(self.active_connections)

        if not connections:
            return

        dead_connections = []
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"[WEBSOCKET] Send error: {str(e)}")
                dead_connections.append(connection)

        if dead_connections:
            with self._lock:
                for dc in dead_connections:
                    self.active_connections.discard(dc)


class MonitoringService:
    """
    Central service for real-time patient vital monitoring, event ingestion,
    alert processing, medallion file storage, and WebSocket broadcasting.
    """

    def __init__(self):
        self.simulator = PatientSensorSimulator(abnormal_probability=0.06)
        self.kafka_producer = PatientVitalKafkaProducer()
        self.ws_manager = ConnectionManager()

        # In-memory data structures for high performance
        self.latest_patient_vitals: Dict[str, ProcessedPatientVital] = {}
        self.patient_vital_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=60)) # last 60 readings (~2 mins)
        self.recent_alerts: deque = deque(maxlen=200) # last 200 alerts

        # Simulator control flags & thread
        self.is_running = False
        self.simulation_thread: Optional[threading.Thread] = None
        self._loop_event = threading.Event()
        self.event_count = 0
        self.start_time = datetime.now()

        # Initial seeding of patients
        self._seed_initial_state()

    def _seed_initial_state(self):
        """Generates initial vital snapshot for all simulated patients."""
        initial_events = self.simulator.generate_all_events()
        for evt in initial_events:
            processed_vital, alerts = evaluate_patient_vitals(evt)
            self.latest_patient_vitals[evt.patient_id] = processed_vital
            self.patient_vital_history[evt.patient_id].append(processed_vital.model_dump())
            for alert in alerts:
                self.recent_alerts.appendleft(alert.model_dump())

    def start_simulation(self):
        """Starts background thread producing patient vitals."""
        if self.is_running:
            logger.info("[MONITORING SERVICE] Simulation thread already running.")
            return True

        self.is_running = True
        self._loop_event.clear()
        self.simulation_thread = threading.Thread(target=self._simulation_loop, daemon=True)
        self.simulation_thread.start()
        logger.info("[MONITORING SERVICE] Patient telemetry background simulator started.")
        return True

    def stop_simulation(self):
        """Stops background thread producing patient vitals."""
        if not self.is_running:
            return True

        self.is_running = False
        self._loop_event.set()
        if self.simulation_thread and self.simulation_thread.is_alive():
            self.simulation_thread.join(timeout=2.0)
        logger.info("[MONITORING SERVICE] Patient telemetry simulator stopped.")
        return True

    def trigger_patient_critical(self, patient_id: str, duration_seconds: int = 30) -> bool:
        """Triggers severe critical abnormal vital readings for a patient."""
        success = self.simulator.trigger_critical_state(patient_id, duration_seconds)
        if success:
            # Force immediate generation & broadcast of critical event
            evt = self.simulator.generate_patient_event(patient_id)
            if evt:
                self.process_vital_event(evt)
        return success

    def process_vital_event(self, event: PatientVitalEvent):
        """
        Core pipeline processor for a single vital event:
        1. Evaluate vital against alert thresholds
        2. Publish to Kafka (if STREAMING_MODE=kafka)
        3. Update in-memory state & line chart history
        4. Append alerts
        5. Write local Medallion records (Bronze/Silver)
        6. Broadcast to WebSocket clients
        """
        self.event_count += 1
        processed_vital, new_alerts = evaluate_patient_vitals(event)

        # 1. Kafka Publish
        if STREAMING_MODE == "kafka":
            self.kafka_producer.send_vital_event(event)
            for alert in new_alerts:
                self.kafka_producer.send_alert_event(alert)

        # 2. Update In-Memory State
        pid = event.patient_id
        self.latest_patient_vitals[pid] = processed_vital
        vital_dict = processed_vital.model_dump()
        self.patient_vital_history[pid].append(vital_dict)

        # 3. Add Alerts
        for alert in new_alerts:
            alert_dict = alert.model_dump()
            self.recent_alerts.appendleft(alert_dict)
            logger.warning(f"[ALERT GENERATED] [{alert.alert_level}] Patient {alert.patient_id} ({alert.patient_name}): {alert.message}")

        # 4. Local Medallion Persistence (Fallback / Demo Data Lake)
        self._persist_medallion_local(event, processed_vital, new_alerts)

        # 5. Broadcast to connected WebSocket clients (async thread safe call)
        broadcast_payload = {
            "type": "vital_update",
            "vital": vital_dict,
            "alerts": [a.model_dump() for a in new_alerts] if new_alerts else []
        }
        self._async_broadcast(broadcast_payload)

    def _persist_medallion_local(self, raw_evt: PatientVitalEvent, silver_evt: ProcessedPatientVital, alerts: List[PatientAlert]):
        """Saves telemetry to local Medallion folder hierarchy for offline analytics."""
        try:
            today_str = datetime.now().strftime("%Y-%m-%d")
            
            # Bronze: Raw JSON payload
            bronze_file = os.path.join(BRONZE_DIR, f"vitals_{today_str}.jsonl")
            with open(bronze_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(raw_evt.model_dump()) + "\n")

            # Silver: Processed & Evaluated Vitals
            silver_file = os.path.join(SILVER_DIR, f"silver_vitals_{today_str}.jsonl")
            with open(silver_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(silver_evt.model_dump()) + "\n")

            # Gold: High Severity Alerts
            if alerts:
                gold_file = os.path.join(GOLD_DIR, f"gold_alerts_{today_str}.jsonl")
                with open(gold_file, "a", encoding="utf-8") as f:
                    for a in alerts:
                        f.write(json.dumps(a.model_dump()) + "\n")

        except Exception as e:
            logger.error(f"[MEDALLION PERSISTENCE] Error saving record: {str(e)}")

    def _simulation_loop(self):
        """Background thread execution loop for generating synthetic patient vital streams."""
        logger.info(f"[MONITORING SERVICE] Simulation thread loop active (Interval: {MONITORING_INTERVAL_SECONDS}s)...")
        while self.is_running and not self._loop_event.is_set():
            try:
                events = self.simulator.generate_all_events()
                for evt in events:
                    self.process_vital_event(evt)
                time.sleep(MONITORING_INTERVAL_SECONDS)
            except Exception as e:
                logger.error(f"[MONITORING SERVICE] Error in simulation loop: {str(e)}")
                time.sleep(1.0)

    def _async_broadcast(self, payload: Dict[str, Any]):
        """Helper to run async WebSocket broadcast from synchronous background thread."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.run_coroutine_threadsafe(self.ws_manager.broadcast(payload), loop)
        except Exception:
            pass

    # REST Query Handlers

    def get_all_patients_latest(self) -> List[Dict[str, Any]]:
        return [v.model_dump() for v in self.latest_patient_vitals.values()]

    def get_patient_latest(self, patient_id: str) -> Optional[Dict[str, Any]]:
        vital = self.latest_patient_vitals.get(patient_id)
        return vital.model_dump() if vital else None

    def get_patient_history(self, patient_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        history = list(self.patient_vital_history.get(patient_id, []))
        return history[-limit:] if limit else history

    def get_recent_alerts(self, severity_filter: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        alerts = list(self.recent_alerts)
        if severity_filter and severity_filter.upper() != "ALL":
            alerts = [a for a in alerts if a.get("alert_level") == severity_filter.upper()]
        return alerts[:limit]

    def get_summary_stats(self) -> Dict[str, Any]:
        vitals = list(self.latest_patient_vitals.values())
        total_patients = len(vitals)
        if total_patients == 0:
            return MonitoringSummaryStats().model_dump()

        normal_count = sum(1 for v in vitals if v.overall_status == "NORMAL")
        warning_count = sum(1 for v in vitals if v.overall_status == "WARNING")
        critical_count = sum(1 for v in vitals if v.overall_status == "CRITICAL")

        avg_hr = round(sum(v.heart_rate for v in vitals) / total_patients, 1)
        avg_spo2 = round(sum(v.spo2 for v in vitals) / total_patients, 1)

        critical_alerts_count = sum(1 for a in self.recent_alerts if a.get("alert_level") == "CRITICAL")
        
        # Calculate most common alert type
        alert_counts = defaultdict(int)
        for a in self.recent_alerts:
            alert_counts[a.get("parameter", "General")] += 1
        most_common = max(alert_counts.items(), key=lambda x: x[1])[0] if alert_counts else "SpO2"

        return {
            "total_patients": total_patients,
            "active_monitors": total_patients,
            "normal_count": normal_count,
            "warning_count": warning_count,
            "critical_count": critical_count,
            "avg_heart_rate": avg_hr,
            "avg_spo2": avg_spo2,
            "critical_alerts_today": critical_alerts_count,
            "alerts_per_hour": round(critical_alerts_count / max(1, (datetime.now() - self.start_time).seconds / 3600), 1),
            "most_common_alert": f"{most_common} Anomaly",
            "is_simulator_active": self.is_running,
            "streaming_mode": STREAMING_MODE,
            "total_events_processed": self.event_count,
        }

    def get_stream_status(self) -> Dict[str, Any]:
        return {
            "status": "LIVE" if self.is_running else "PAUSED",
            "streaming_mode": STREAMING_MODE,
            "kafka_connected": self.kafka_producer.is_connected,
            "simulator_active": self.is_running,
            "events_processed": self.event_count,
            "active_patients": len(self.latest_patient_vitals),
            "active_websocket_connections": len(self.ws_manager.active_connections),
        }


# Global Singleton Instance
monitoring_service = MonitoringService()
# Start background simulation by default on application launch
monitoring_service.start_simulation()
