# Databricks notebook source
# COMMAND ----------
# MAGIC %md
# MAGIC # CareEase AI - Pipeline 03: Silver to Gold Delta Lake Aggregations & Department Analytics
# MAGIC 
# MAGIC Reads clean patient telemetry from **Silver Delta**, computes sliding window aggregations,
# MAGIC department capacity status, and produces the high-performance **Gold Delta** analytics table.

# COMMAND ----------
try:
    from pyspark.sql.functions import col, window, avg, max as spark_max, count, current_timestamp  # type: ignore
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
dbutils.widgets.text("gold_table_path", "/mnt/careease/gold/department_analytics", "Gold Path")
dbutils.widgets.text("checkpoint_path", "/mnt/careease/checkpoints/gold_vitals", "Checkpoint Path")

silver_path = dbutils.widgets.get("silver_table_path")
gold_path = dbutils.widgets.get("gold_table_path")
checkpoint_path = dbutils.widgets.get("checkpoint_path")

# COMMAND ----------
silver_df = spark.readStream.format("delta").load(silver_path)

# 5-minute sliding window aggregation per department
gold_aggregated_df = (
    silver_df
    .withWatermark("event_time", "10 minutes")
    .groupBy(
        window(col("event_time"), "5 minutes", "1 minute"),
        col("department")
    )
    .agg(
        avg("heart_rate").alias("avg_heart_rate"),
        avg("spo2").alias("avg_spo2"),
        avg("systolic_bp").alias("avg_systolic_bp"),
        avg("temperature").alias("avg_temperature"),
        count("patient_id").alias("total_readings_window"),
        spark_max("overall_status").alias("highest_department_alert")
    )
    .withColumn("gold_aggregated_at", current_timestamp())
)

# Write to Gold Delta Table
query = (
    gold_aggregated_df.writeStream
    .format("delta")
    .option("checkpointLocation", checkpoint_path)
    .outputMode("complete")
    .start(gold_path)
)

print(f"Gold Delta Aggregation pipeline active writing to {gold_path}")
