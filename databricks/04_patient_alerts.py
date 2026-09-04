# Databricks notebook source
# COMMAND ----------
# MAGIC %md
# MAGIC # CareEase AI - Pipeline 04: Real-Time Patient Alert Dispatcher
# MAGIC 
# MAGIC Filters high-priority `WARNING` and `CRITICAL` records from Silver Delta, formats structured alert JSON,
# MAGIC and writes to the **Gold Alerts Delta Table** as well as publishing back to Kafka `patient-alerts`.

# COMMAND ----------
try:
    from pyspark.sql.functions import col, expr, struct, to_json, concat, lit, current_timestamp, when  # type: ignore
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

dbutils.widgets.text("silver_table_path", "/mnt/careease/silver/patient_vitals_cleaned", "Silver Path")
dbutils.widgets.text("alerts_gold_path", "/mnt/careease/gold/patient_alerts", "Alerts Path")
dbutils.widgets.text("kafka_bootstrap_servers", "localhost:9092", "Kafka Servers")
dbutils.widgets.text("kafka_alerts_topic", "patient-alerts", "Alerts Topic")

silver_path = dbutils.widgets.get("silver_table_path")
alerts_gold_path = dbutils.widgets.get("alerts_gold_path")
kafka_servers = dbutils.widgets.get("kafka_bootstrap_servers")
kafka_topic = dbutils.widgets.get("kafka_alerts_topic")

# COMMAND ----------
silver_df = spark.readStream.format("delta").load(silver_path)

# Filter Critical and Warning Events
alert_events_df = silver_df.filter(col("overall_status") != "NORMAL").select(
    expr("concat('ALT-', uuid())").alias("alert_id"),
    col("patient_id"),
    col("patient_name"),
    col("bed_id"),
    col("department"),
    col("timestamp"),
    col("overall_status").alias("alert_level"),
    when(col("spo2_status") != "NORMAL", "SpO2")
    .when(col("heart_rate_status") != "NORMAL", "Heart Rate")
    .when(col("blood_pressure_status") != "NORMAL", "Blood Pressure")
    .when(col("temperature_status") != "NORMAL", "Temperature")
    .otherwise("Respiratory Rate").alias("parameter"),
    col("spo2").cast("double").alias("value"),
    concat(lit("Abnormal reading detected for "), col("patient_name"), lit(" on bed "), col("bed_id")).alias("message"),
    lit("ACTIVE").alias("status")
)

# Write to Alerts Gold Delta Table
gold_alerts_query = (
    alert_events_df.writeStream
    .format("delta")
    .option("checkpointLocation", "/mnt/careease/checkpoints/gold_alerts")
    .outputMode("append")
    .start(alerts_gold_path)
)

# Also Publish Alerts to Kafka `patient-alerts`
kafka_alerts_query = (
    alert_events_df
    .select(
        col("patient_id").alias("key"),
        to_json(struct("*")).alias("value")
    )
    .writeStream
    .format("kafka")
    .option("kafka.bootstrap.servers", kafka_servers)
    .option("topic", kafka_topic)
    .option("checkpointLocation", "/mnt/careease/checkpoints/kafka_alerts")
    .outputMode("append")
    .start()
)

print(f"Patient Alert Dispatcher active. Delta -> {alerts_gold_path}, Kafka -> {kafka_topic}")
