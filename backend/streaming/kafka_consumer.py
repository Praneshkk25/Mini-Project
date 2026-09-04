import json
import logging
from typing import Callable, Optional
from streaming.kafka_config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_VITALS_TOPIC, KAFKA_ALERTS_TOPIC

logger = logging.getLogger(__name__)

class PatientVitalKafkaConsumer:
    """
    Kafka Consumer for consuming patient vitals and alerts from Kafka topics.
    """

    def __init__(self, topic: str = KAFKA_VITALS_TOPIC, group_id: str = "careease-vitals-group", bootstrap_servers: str = KAFKA_BOOTSTRAP_SERVERS):
        self.topic = topic
        self.group_id = group_id
        self.bootstrap_servers = bootstrap_servers
        self.consumer = None
        self.is_connected = False
        self._init_consumer()

    def _init_consumer(self):
        try:
            import socket
            first_server = self.bootstrap_servers.split(",")[0].strip()
            host, port_str = first_server.split(":")
            port = int(port_str)
            
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.2)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result != 0:
                self.is_connected = False
                logger.info(f"[KAFKA CONSUMER] Kafka broker {self.bootstrap_servers} not reachable.")
                return

            from kafka import KafkaConsumer
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers.split(","),
                group_id=self.group_id,
                auto_offset_reset="latest",
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                consumer_timeout_ms=1000
            )
            self.is_connected = True
            logger.info(f"[KAFKA CONSUMER] Subscribed to Kafka topic '{self.topic}' at {self.bootstrap_servers}")
        except Exception as e:
            self.is_connected = False
            logger.info(f"[KAFKA CONSUMER] Could not subscribe to Kafka topic '{self.topic}'. Error: {str(e)}")

    def listen(self, callback: Callable[[dict], None], stop_condition: Callable[[], bool] = lambda: False):
        if not self.is_connected or not self.consumer:
            logger.warning("[KAFKA CONSUMER] Kafka consumer not connected. Listening aborted.")
            return

        logger.info(f"[KAFKA CONSUMER] Started listening on topic '{self.topic}'...")
        try:
            while not stop_condition():
                for message in self.consumer:
                    if stop_condition():
                        break
                    try:
                        callback(message.value)
                    except Exception as cb_err:
                        logger.error(f"[KAFKA CONSUMER] Callback processing error: {str(cb_err)}")
        except Exception as e:
            logger.error(f"[KAFKA CONSUMER] Error in consumer loop: {str(e)}")
        finally:
            self.close()

    def close(self):
        if self.is_connected and self.consumer:
            try:
                self.consumer.close()
                logger.info("[KAFKA CONSUMER] Consumer connection closed.")
            except Exception as e:
                logger.error(f"[KAFKA CONSUMER] Error closing consumer: {str(e)}")
            finally:
                self.is_connected = False
