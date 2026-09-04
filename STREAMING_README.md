# CareEase AI - Real-Time Patient Vital Monitoring & Streaming Pipeline

This module adds a real-time bedside patient vital sign monitoring and event-driven streaming pipeline to CareEase AI.

## Architecture

```
Patient Sensors (15 Bedside Monitors)
        ↓
Kafka Producer (JSON events)
        ↓
Kafka Topic: patient-vitals
        ↓
PySpark Structured Streaming Consumer
        ↓
┌────────────────────────────────────────────────────────┐
│ Medallion Data Storage                                 │
│  ├── Bronze: Raw Kafka JSON Payload                    │
│  ├── Silver: Cleaned & Evaluated Patient Telemetry     │
│  └── Gold:   Aggregated Stats & High-Priority Alerts   │
└────────────────────────────────────────────────────────┘
        ↓
Real-Time Alert Engine (Rule-based: Normal / Warning / Critical)
        ↓
FastAPI Monitoring Services + WebSocket Gateway (/ws/monitoring)
        ↓
React Real-Time Monitoring Command Center (Live ECG, cards, details, audio alerts)
```

## Setup Options

### Option A: Local Demo Simulation Mode (Zero External Dependencies)
In Demo Mode, the backend uses an integrated telemetry generator and local Medallion JSON data lake without requiring a live Kafka or PySpark cluster.
Set in `backend/.env`:
```env
STREAMING_MODE=simulation
MONITORING_INTERVAL_SECONDS=2
```

### Option B: Apache Kafka + PySpark Streaming Mode
1. Start Apache Kafka via Docker Compose:
   ```bash
   docker-compose up -d
   ```
2. Set in `backend/.env`:
   ```env
   STREAMING_MODE=kafka
   KAFKA_BOOTSTRAP_SERVERS=localhost:9092
   ```
3. Run PySpark Streaming pipeline:
   ```bash
   python backend/streaming/spark_streaming.py
   ```

### Option C: Databricks Production Pipeline
Import the notebooks in `databricks/` into Databricks workspace:
- `01_kafka_to_bronze.py`: Ingests Kafka `patient-vitals` to Bronze Delta.
- `02_bronze_to_silver.py`: Cleans payload, validates bounds, evaluates clinical rules to Silver Delta.
- `03_silver_to_gold.py`: Calculates 5-minute sliding window aggregations to Gold Delta.
- `04_patient_alerts.py`: Dispatches active critical alerts to Gold Delta and Kafka `patient-alerts`.

## REST API Endpoints

- `GET /api/monitoring/patients` - List all monitored patient telemetry snapshots.
- `GET /api/monitoring/patients/{patient_id}` - Detailed vital snapshot for a specific patient.
- `GET /api/monitoring/vitals/latest` - Latest vitals across all monitors.
- `GET /api/monitoring/vitals/history/{patient_id}` - Historical time-series telemetry.
- `GET /api/monitoring/alerts` - Active and recent threshold alert log.
- `GET /api/monitoring/stats` - Aggregated monitoring summary metrics.
- `POST /api/monitoring/simulator/start` - Start background telemetry stream.
- `POST /api/monitoring/simulator/stop` - Pause background telemetry stream.
- `POST /api/monitoring/simulator/patient/{patient_id}/critical` - Force emergency vital state for testing.
- `GET /api/monitoring/stream/status` - Streaming pipeline health check.
- `WS /ws/monitoring` - Real-time WebSocket connection.

## Run Verification Tests
```bash
python -m unittest backend/tests/test_monitoring.py
```
