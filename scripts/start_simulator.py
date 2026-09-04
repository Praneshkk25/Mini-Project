import sys
import os
import time
import logging

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from streaming.sensor_simulator import PatientSensorSimulator  # type: ignore
from streaming.kafka_producer import PatientVitalKafkaProducer  # type: ignore
from streaming.kafka_config import KAFKA_VITALS_TOPIC, KAFKA_ALERTS_TOPIC, MONITORING_INTERVAL_SECONDS  # type: ignore
from app.services.alert_service import evaluate_patient_vitals  # type: ignore

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SensorSimulatorStandalone")

def main():
    logger.info("Initializing Standalone Patient Vital Sensor Simulator...")
    simulator = PatientSensorSimulator(abnormal_probability=0.08)
    producer = PatientVitalKafkaProducer()

    if producer.is_connected:
        logger.info(f"Connected to Apache Kafka. Streaming to topic '{KAFKA_VITALS_TOPIC}'...")
    else:
        logger.info("Kafka broker not detected. Running local simulation generator...")

    try:
        while True:
            events = simulator.generate_all_events()
            for evt in events:
                processed, alerts = evaluate_patient_vitals(evt)
                
                # Publish to Kafka if connected
                if producer.is_connected:
                    producer.send_vital_event(evt)
                    for a in alerts:
                        producer.send_alert_event(a)

                if alerts:
                    logger.warning(f"ALERT [{alerts[0].alert_level}] Patient {evt.patient_id} ({evt.patient_name}): {alerts[0].message}")
                else:
                    logger.info(f"Telemetry [{evt.patient_id}] HR: {evt.heart_rate} bpm | SpO2: {evt.spo2}% | BP: {evt.systolic_bp}/{evt.diastolic_bp} | Temp: {evt.temperature}°C")

            time.sleep(MONITORING_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        logger.info("Stopping standalone sensor simulator...")
    finally:
        producer.close()

if __name__ == "__main__":
    main()
