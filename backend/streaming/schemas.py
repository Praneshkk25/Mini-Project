from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# Pydantic Schemas for API / WebSocket / Serialization

class PatientVitalEvent(BaseModel):
    patient_id: str = Field(..., example="PT-1001")
    patient_name: str = Field(..., example="Eleanor Vance")
    bed_id: str = Field(..., example="ICU-101")
    department: str = Field(..., example="ICU")
    attending_doctor: Optional[str] = Field("Dr. Sarah Jenkins", example="Dr. Sarah Jenkins")
    timestamp: str = Field(..., example="2026-08-28T13:20:15")
    heart_rate: int = Field(..., example=75)
    spo2: int = Field(..., example=98)
    systolic_bp: int = Field(..., example=120)
    diastolic_bp: int = Field(..., example=80)
    temperature: float = Field(..., example=36.8)
    respiratory_rate: int = Field(..., example=16)

class ProcessedPatientVital(PatientVitalEvent):
    heart_rate_status: str = Field("NORMAL", example="NORMAL")
    spo2_status: str = Field("NORMAL", example="NORMAL")
    blood_pressure_status: str = Field("NORMAL", example="NORMAL")
    temperature_status: str = Field("NORMAL", example="NORMAL")
    respiratory_rate_status: str = Field("NORMAL", example="NORMAL")
    overall_status: str = Field("NORMAL", example="NORMAL")  # NORMAL, WARNING, CRITICAL
    alert_level: str = Field("NORMAL", example="NORMAL")

class PatientAlert(BaseModel):
    alert_id: str = Field(..., example="ALT-98231")
    patient_id: str = Field(..., example="PT-1001")
    patient_name: str = Field(..., example="Eleanor Vance")
    bed_id: str = Field(..., example="ICU-101")
    department: str = Field(..., example="ICU")
    attending_doctor: Optional[str] = Field("Dr. Sarah Jenkins", example="Dr. Sarah Jenkins")
    timestamp: str = Field(..., example="2026-08-28T13:20:15")
    alert_level: str = Field(..., example="CRITICAL") # WARNING or CRITICAL
    parameter: str = Field(..., example="SpO2")
    value: float = Field(..., example=86.0)
    message: str = Field(..., example="Critical SpO2 drop below 88%")
    status: str = Field("ACTIVE", example="ACTIVE")  # ACTIVE or RESOLVED
    resolved_at: Optional[str] = None

class MonitoringSummaryStats(BaseModel):
    total_patients: int = 15
    active_monitors: int = 15
    normal_count: int = 12
    warning_count: int = 2
    critical_count: int = 1
    avg_heart_rate: float = 76.5
    avg_spo2: float = 97.2
    critical_alerts_today: int = 4
    alerts_per_hour: float = 1.5
    most_common_alert: str = "SpO2 Warning (<92%)"

# PySpark Schema (dynamically loaded if PySpark is available)
def get_spark_patient_vitals_schema():
    try:
        import importlib
        pyspark_types = importlib.import_module("pyspark.sql.types")
        StructType = getattr(pyspark_types, "StructType")
        StructField = getattr(pyspark_types, "StructField")
        StringType = getattr(pyspark_types, "StringType")
        IntegerType = getattr(pyspark_types, "IntegerType")
        DoubleType = getattr(pyspark_types, "DoubleType")

        return StructType([
            StructField("patient_id", StringType(), False),
            StructField("patient_name", StringType(), False),
            StructField("bed_id", StringType(), False),
            StructField("department", StringType(), False),
            StructField("timestamp", StringType(), False),
            StructField("heart_rate", IntegerType(), False),
            StructField("spo2", IntegerType(), False),
            StructField("systolic_bp", IntegerType(), False),
            StructField("diastolic_bp", IntegerType(), False),
            StructField("temperature", DoubleType(), False),
            StructField("respiratory_rate", IntegerType(), False),
        ])
    except Exception:
        return None

SPARK_PATIENT_VITALS_SCHEMA = get_spark_patient_vitals_schema()
