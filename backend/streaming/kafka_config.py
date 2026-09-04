import os
import logging
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_VITALS_TOPIC = os.getenv("KAFKA_VITALS_TOPIC", "patient-vitals")
KAFKA_ALERTS_TOPIC = os.getenv("KAFKA_ALERTS_TOPIC", "patient-alerts")
KAFKA_STATUS_TOPIC = os.getenv("KAFKA_STATUS_TOPIC", "patient-status")

# Streaming Configuration
STREAMING_MODE = os.getenv("STREAMING_MODE", "simulation").lower()  # "kafka" or "simulation"
MONITORING_INTERVAL_SECONDS = float(os.getenv("MONITORING_INTERVAL_SECONDS", "2.0"))
SPARK_MASTER = os.getenv("SPARK_MASTER", "local[*]")

# Medallion Data Storage Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STREAMING_DATA_DIR = os.path.join(BASE_DIR, "data", "streaming")

BRONZE_DIR = os.path.join(STREAMING_DATA_DIR, "bronze")
SILVER_DIR = os.path.join(STREAMING_DATA_DIR, "silver")
GOLD_DIR = os.path.join(STREAMING_DATA_DIR, "gold")
CHECKPOINT_DIR = os.path.join(STREAMING_DATA_DIR, "checkpoints")

# Ensure required directories exist
for path in [BRONZE_DIR, SILVER_DIR, GOLD_DIR, CHECKPOINT_DIR]:
    os.makedirs(path, exist_ok=True)
