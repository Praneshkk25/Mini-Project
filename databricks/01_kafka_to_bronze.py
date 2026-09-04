# Databricks notebook source
# COMMAND ----------
# MAGIC %md
# MAGIC # CareEase AI - Pipeline 01: Kafka Event Ingestion to Bronze Delta Lake
# MAGIC 
# MAGIC This PySpark Structured Streaming job consumes raw JSON telemetry events from the Kafka `patient-vitals` topic
# MAGIC and writes raw payloads directly to the **Bronze Delta Lake** table.
# MAGIC 
# MAGIC Architecture:
# MAGIC Patient Bedside Sensors -> Kafka Topic (`patient-vitals`) -> PySpark Structured Streaming -> Bronze Delta Table

# COMMAND ----------
import os
try:
    from pyspark.sql.functions import from_json, col, current_timestamp  # type: ignore
    from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DoubleType  # type: ignore
except ImportError:
    pass

# Databricks runtime objects stub for static analysis
try:
    dbutils  # type: ignore
except NameError:
    class _DBUtilsMock:
        class _Widgets:
            def text(self, *args, **kwargs): pass
            def get(self, name): return ""
        widgets = _Widgets()
    dbutils = _DBUtilsMock()  # type: ignore

try:
    spark  # type: ignore
except NameError:
    spark = None  # type: ignore

# Define Widget Parameters for Databricks Jobs
dbutils.widgets.text("kafka_bootstrap_servers", "localhost:9092", "Kafka Bootstrap Servers")
dbutils.widgets.text("kafka_topic", "patient-vitals", "Kafka Topic")
dbutils.widgets.text("bronze_table_path", "/mnt/careease/bronze/patient_vitals", "Bronze Delta Path")
dbutils.widgets.text("checkpoint_path", "/mnt/careease/checkpoints/bronze_vitals", "Checkpoint Path")

kafka_servers = dbutils.widgets.get("kafka_bootstrap_servers")
kafka_topic = dbutils.widgets.get("kafka_topic")
bronze_path = dbutils.widgets.get("bronze_table_path")
checkpoint_path = dbutils.widgets.get("checkpoint_path")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Define Patient Vital Schema

# COMMAND ----------
patient_vitals_schema = StructType([
    StructField("patient_id", StringType(), True),
    StructField("patient_name", StringType(), True),
    StructField("bed_id", StringType(), True),
    StructField("department", StringType(), True),
    StructField("timestamp", StringType(), True),
    StructField("heart_rate", IntegerType(), True),
    StructField("spo2", IntegerType(), True),
    StructField("systolic_bp", IntegerType(), True),
    StructField("diastolic_bp", IntegerType(), True),
    StructField("temperature", DoubleType(), True),
    StructField("respiratory_rate", IntegerType(), True),
])

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Read Stream from Kafka

# COMMAND ----------
raw_stream = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", kafka_servers)
    .option("subscribe", kafka_topic)
    .option("startingOffsets", "latest")
    .option("failOnDataLoss", "false")
    .load()
)

# Parse JSON Payload
bronze_stream = (
    raw_stream
    .select(
        col("timestamp").alias("kafka_timestamp"),
        col("key").cast("string").alias("kafka_key"),
        from_json(col("value").cast("string"), patient_vitals_schema).alias("payload"),
        current_timestamp().alias("ingested_at")
    )
    .select("ingested_at", "kafka_timestamp", "kafka_key", "payload.*")
)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Write Stream to Bronze Delta Lake Table

# COMMAND ----------
query = (
    bronze_stream.writeStream
    .format("delta")
    .option("checkpointLocation", checkpoint_path)
    .outputMode("append")
    .start(bronze_path)
)

print(f"Bronze Delta Streaming Ingestion pipeline active writing to {bronze_path}")
