# Databricks notebook source
# COMMAND ----------
# MAGIC %md
# MAGIC # CareEase AI - Pipeline 02: Bronze to Silver Delta Lake Transformation & Clinical Rule Evaluation
# MAGIC 
# MAGIC This job reads raw events from the **Bronze Delta** table, applies data validation rules, handles nulls,
# MAGIC converts timestamps, and evaluates clinical alert thresholds to produce the **Silver Delta** table.

# COMMAND ----------
try:
    from pyspark.sql.functions import col, when, to_timestamp, current_timestamp  # type: ignore
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

dbutils.widgets.text("bronze_table_path", "/mnt/careease/bronze/patient_vitals", "Bronze Path")
dbutils.widgets.text("silver_table_path", "/mnt/careease/silver/patient_vitals_cleaned", "Silver Path")
dbutils.widgets.text("checkpoint_path", "/mnt/careease/checkpoints/silver_vitals", "Checkpoint Path")

bronze_path = dbutils.widgets.get("bronze_table_path")
silver_path = dbutils.widgets.get("silver_table_path")
checkpoint_path = dbutils.widgets.get("checkpoint_path")

# COMMAND ----------
# Read stream from Bronze Delta table
bronze_df = spark.readStream.format("delta").load(bronze_path)

# Data Cleaning & Validation
valid_bronze_df = bronze_df.filter(
    col("patient_id").isNotNull() & 
    (col("heart_rate") > 0) & 
    (col("spo2") > 0) & 
    (col("systolic_bp") > 0)
)

# Apply Clinical Threshold Evaluations
silver_df = valid_bronze_df.withColumn(
    "event_time", to_timestamp(col("timestamp"))
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
).withColumn("silver_processed_at", current_timestamp())

# Write Stream to Silver Delta Table
query = (
    silver_df.writeStream
    .format("delta")
    .option("checkpointLocation", checkpoint_path)
    .outputMode("append")
    .start(silver_path)
)

print(f"Silver Delta Streaming Transformation pipeline active writing to {silver_path}")
