import json
import logging
from typing import Optional, Any
from streaming.kafka_config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_VITALS_TOPIC, KAFKA_ALERTS_TOPIC
from streaming.schemas import PatientVitalEvent, PatientAlert

logger = logging.getLogger(__name__)

class PatientVitalKafkaProducer:
    """
    Kafka Producer for streaming patient vital signs and emergency alerts.
    Gracefully handles environment setup and connection failures.
    """

    def __init__(self, bootstrap_servers: str = KAFKA_BOOTSTRAP_SERVERS):
        self.bootstrap_servers = bootstrap_servers
        self.producer = None
        self.is_connected = False
        self._init_producer()

    def _init_producer(self):
        try:
            import socket
            first_server = self.bootstrap_servers.split(",")[0].strip()
            host, port_str = first_server.split(":")
            port = int(port_str)
            
            # Quick socket probe to check if broker port is open
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.2)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result != 0:
                self.is_connected = False
                logger.info(f"[KAFKA PRODUCER] Kafka broker {self.bootstrap_servers} not reachable. Using SIMULATION mode.")
                return

            from kafka import KafkaProducer
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers.split(","),
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                key_serializer=lambda k: str(k).encode("utf-8"),
                retries=1,
                max_block_ms=500,
                request_timeout_ms=500
            )
            self.is_connected = True
            logger.info(f"[KAFKA PRODUCER] Connected to Kafka brokers at {self.bootstrap_servers}")
        except Exception as e:
            self.is_connected = False
            logger.info(f"[KAFKA PRODUCER] Could not connect to Kafka at {self.bootstrap_servers}. Fallback to local mode enabled.")

    def send_vital_event(self, event: PatientVitalEvent, topic: str = KAFKA_VITALS_TOPIC) -> bool:
        if not self.is_connected or not self.producer:
            logger.debug(f"[KAFKA PRODUCER] (Fallback Local) Simulating Kafka publish for patient {event.patient_id}")
            return False

        try:
            payload = event.model_dump()
            future = self.producer.send(topic, key=event.patient_id, value=payload)
            # Non-blocking async publish with callback logging
            future.add_callback(lambda metadata: logger.debug(f"[KAFKA PRODUCER] Sent vital event to {metadata.topic}:{metadata.partition}:{metadata.offset}"))
            future.add_errback(lambda err: logger.error(f"[KAFKA PRODUCER] Failed to send vital event: {err}"))
            return True
        except Exception as e:
            logger.error(f"[KAFKA PRODUCER] Error sending vital event: {str(e)}")
            return False

    def send_alert_event(self, alert: PatientAlert, topic: str = KAFKA_ALERTS_TOPIC) -> bool:
        if not self.is_connected or not self.producer:
            return False

        try:
            payload = alert.model_dump()
            future = self.producer.send(topic, key=alert.patient_id, value=payload)
            future.add_callback(lambda metadata: logger.info(f"[KAFKA PRODUCER] Published ALERT to {metadata.topic}:{metadata.partition}"))
            return True
        except Exception as e:
            logger.error(f"[KAFKA PRODUCER] Error sending alert event: {str(e)}")
            return False

    def flush(self):
        if self.is_connected and self.producer:
            try:
                self.producer.flush(timeout=2)
            except Exception:
                pass

    def close(self):
        if self.is_connected and self.producer:
            try:
                self.producer.close()
                logger.info("[KAFKA PRODUCER] Connection closed gracefully.")
            except Exception as e:
                logger.error(f"[KAFKA PRODUCER] Error closing producer: {str(e)}")
            finally:
                self.is_connected = False
