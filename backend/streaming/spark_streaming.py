import os
import json
import logging
from datetime import datetime

from streaming.kafka_config import (
    KAFKA_BOOTSTRAP_SERVERS,
    KAFKA_VITALS_TOPIC,
    SPARK_MASTER,
    BRONZE_DIR,
    SILVER_DIR,
    GOLD_DIR,
    CHECKPOINT_DIR
)
from streaming.schemas import SPARK_PATIENT_VITALS_SCHEMA

logger = logging.getLogger(__name__)

class PatientVitalSparkStreamingManager:
    """
    PySpark Structured Streaming pipeline manager.
    Consumes patient vital streams from Kafka, enforces schema validation, transforms records
    through Medallion architecture (Bronze -> Silver -> Gold), and writes structured outputs.
    """

    def __init__(self):
        self.spark = None
        self.is_spark_available = False
        self._init_spark()

    def _init_spark(self):
        try:
            from pyspark.sql import SparkSession  # type: ignore
            self.spark = (
                SparkSession.builder
                .appName("CareEase-PatientVitalStreaming")
                .master(SPARK_MASTER)
                .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
                .config("spark.sql.streaming.forceDeleteTempCheckpointLocation", "true")
                .getOrCreate()
            )
            self.spark.sparkContext.setLogLevel("WARN")
            self.is_spark_available = True
            logger.info("[SPARK STREAMING] Spark Session initialized successfully.")
        except Exception as e:
            self.is_spark_available = False
            logger.warning(f"[SPARK STREAMING] PySpark Session initialization skipped or failed: {str(e)}")

    def start_streaming_pipeline(self):
        """
        Starts PySpark Structured Streaming readStream from Kafka and writes Medallion outputs.
        """
        if not self.is_spark_available or not self.spark:
            logger.warning("[SPARK STREAMING] PySpark not available. Using Python Medallion persistence fallback.")
            return None

        try:
            from pyspark.sql.functions import from_json, col, when, expr, current_timestamp, to_timestamp  # type: ignore

            # 1. Read Stream from Kafka (Bronze Raw Ingestion)
            raw_kafka_df = (
                self.spark.readStream
                .format("kafka")
                .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS)
                .option("subscribe", KAFKA_VITALS_TOPIC)
                .option("startingOffsets", "latest")
                .load()
            )

            # Bronze Layer: Parse JSON payload and retain raw metadata
            bronze_df = raw_kafka_df.select(
                to_timestamp(col("timestamp")).alias("kafka_received_at"),
                from_json(col("value").cast("string"), SPARK_PATIENT_VITALS_SCHEMA).alias("data")
            ).select("data.*")

            # Write Bronze Stream
            bronze_query = (
                bronze_df.writeStream
                .format("parquet")
                .option("path", BRONZE_DIR)
                .option("checkpointLocation", os.path.join(CHECKPOINT_DIR, "bronze"))
                .outputMode("append")
                .start()
            )

            # 2. Silver Layer: Cleaning, Validation & Rule Derivations
            silver_df = bronze_df.filter(
                col("patient_id").isNotNull() & (col("heart_rate") > 0) & (col("spo2") > 0)
            ).withColumn(
                "heart_rate_status",
                when(col("heart_rate") > 150, "CRITICAL")
                .when(col("heart_rate") < 50, "CRITICAL")
                .when(col("heart_rate") > 120, "WARNING")
                .otherwise("NORMAL")
            ).withColumn(
                "spo2_status",
                when(col("spo2") < 88, "CRITICAL")
                .when(col("spo2") < 92, "WARNING")
                .otherwise("NORMAL")
            ).withColumn(
                "blood_pressure_status",
                when((col("systolic_bp") >= 180) | (col("systolic_bp") < 90), "CRITICAL")
                .when(col("systolic_bp") >= 160, "WARNING")
                .otherwise("NORMAL")
            ).withColumn(
                "temperature_status",
                when((col("temperature") >= 40.0) | (col("temperature") < 35.0), "CRITICAL")
                .when(col("temperature") >= 38.5, "WARNING")
                .otherwise("NORMAL")
            ).withColumn(
                "respiratory_rate_status",
                when(col("respiratory_rate") > 30, "CRITICAL")
                .when(col("respiratory_rate") > 24, "WARNING")
                .otherwise("NORMAL")
            ).withColumn(
                "overall_status",
                when(
                    (col("heart_rate_status") == "CRITICAL") |
                    (col("spo2_status") == "CRITICAL") |
                    (col("blood_pressure_status") == "CRITICAL") |
                    (col("temperature_status") == "CRITICAL") |
                    (col("respiratory_rate_status") == "CRITICAL"),
                    "CRITICAL"
                ).when(
                    (col("heart_rate_status") == "WARNING") |
                    (col("spo2_status") == "WARNING") |
                    (col("blood_pressure_status") == "WARNING") |
                    (col("temperature_status") == "WARNING") |
                    (col("respiratory_rate_status") == "WARNING"),
                    "WARNING"
                ).otherwise("NORMAL")
            )

            # Write Silver Stream
            silver_query = (
                silver_df.writeStream
                .format("parquet")
                .option("path", SILVER_DIR)
                .option("checkpointLocation", os.path.join(CHECKPOINT_DIR, "silver"))
                .outputMode("append")
                .start()
            )

            # 3. Gold Layer: Department Level Aggregations & High-Priority Alerts
            gold_df = (
                silver_df.groupBy("department", "overall_status")
                .count()
                .withColumn("processed_at", current_timestamp())
            )

            gold_query = (
                gold_df.writeStream
                .format("memory")
                .queryName("patient_vitals_gold_summary")
                .outputMode("complete")
                .start()
            )

            logger.info("[SPARK STREAMING] Bronze, Silver, and Gold PySpark streams active.")
            return [bronze_query, silver_query, gold_query]

        except Exception as e:
            logger.error(f"[SPARK STREAMING] Error executing PySpark stream: {str(e)}")
            return None

    def stop_spark(self):
        if self.spark:
            try:
                self.spark.stop()
                logger.info("[SPARK STREAMING] PySpark session stopped.")
            except Exception:
                pass
            finally:
                self.spark = None
                self.is_spark_available = False
