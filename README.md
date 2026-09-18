# 🏥 CareEase AI & Integrated Hospital Operations Ecosystem

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![Databricks](https://img.shields.io/badge/Databricks-PySpark_Streaming-FF3621.svg)](https://www.databricks.com/)
[![LLM Support](https://img.shields.io/badge/LLMs-Gemini_%7C_Qwen_2.5_%7C_MedGemma-orange.svg)](https://huggingface.co/Qwen)
[![Model Soup](https://img.shields.io/badge/Fine--Tuning-QLoRA_Model_Soup-purple.svg)](https://arxiv.org/abs/2203.05482)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CareEase AI** (AuraHealth Hospital Ecosystem) is an end-to-end, enterprise-grade healthcare management and clinical decision-support platform. It unites OPD queue telemetry (powered by M/M/c queuing theory), AI-driven clinical triage routing, real-time bedside vital telemetry streaming (Kafka + PySpark Medallion Lakehouse), bed occupancy forecasting, pharmacy inventory tracking, city-wide inter-hospital interoperability, and specialized clinical LLMs (Qwen 2.5, MedGemma, Google Gemini) fine-tuned with **Model Soups** for zero-latency clinical reasoning.

---

## 🌟 Ecosystem Overview

CareEase AI is engineered as a coordinated multi-service ecosystem serving four critical clinical roles:

```
                                  ┌────────────────────────┐
                                  │   FastAPI Gateway      │
                                  │   Port 8000            │
                                  └──────────┬─────────────┘
                                             │
             ┌────────────────┬──────────────┴───────────────┬────────────────┐
             ▼                ▼                              ▼                ▼
     ┌──────────────┐ ┌──────────────┐               ┌──────────────┐ ┌──────────────┐
     │ Main Console │ │ Patient App  │               │ Receptionist │ │  Doctor App  │
     │  Port 5173   │ │  Port 5174   │               │  Port 5175   │ │  Port 5176   │
     └──────────────┘ └──────────────┘               └──────────────┘ └──────────────┘
```

| Service / App | Port | Target Users | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Main Operations Console** (`frontend`) | `5173` | Hospital Admin, Pharmacy, Kiosk | Admin telemetry, M/M/c OPD queue monitoring, pharmacy formulary, MediKiosk intake, city-wide hospital network. |
| **Patient Care Companion** (`patient-app`) | `5174` | Patients & Caregivers | OPD token tracking, appointment booking, digital prescriptions, discharge summary reader, telemetry vitals, audio readouts, billing QR. |
| **Receptionist Hub** (`receptionist-app`) | `5175` | Reception & Front Desk Staff | Rapid patient check-in, bed reservation & ward allocation, doctors & department scheduling, audit logs. |
| **Doctor Station** (`doctor-app`) | `5176` | Attending Physicians | Patient consultation queue, clinical diagnosis workspace, real-time bedside vital alert panels. |
| **Backend API Gateway** (`backend`) | `8000` | Microservices & External APIs | REST API, WebSocket streams, M/M/c math engine, LLM inference, clinical TTS, SQLite database. |

---

## 🚀 Key Features

### 📄 1. AI Hospital Discharge Assistant & Care Companion
- **Document Ingestion**: Seamless PDF and TXT medical discharge summary extraction using `pdfplumber` and `pypdf`.
- **Structured Synthesis**: Extracts diagnoses, active medications, dosage schedules, dietary restrictions, red-flag warning signs, and follow-up schedules into validated JSON.
- **Multilingual Vernacular Translation**: Translates medical instructions into regional languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, etc.) with localized context and Indian Rupee (₹ INR) pricing.
- **Audio Readout (Text-to-Speech)**: Real-time streaming MP3 audio instructions powered by `gTTS`.
- **Grounded Clinical Chat**: Patient Q&A companion grounded strictly on the individual discharge document.

### 🏥 2. Real-Time OPD Queue Operations & Math Simulation
- **M/M/c Queuing Theory Engine**: Dynamically calculates arrival rate ($\lambda$), consultation service rate ($\mu$), and active physicians ($c$) to predict wait times, queue lengths, and doctor utilization rates.
- **Smart Clinical Triage**: Evaluates patient symptoms and routes to appropriate specialties (*Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, General Medicine*) with urgency levels (*Immediate, Urgent, Standard*).

### 📡 3. Real-Time Bedside Vital Telemetry & Databricks Lakehouse
- **Synthetic Multi-Patient Telemetry Simulator**: Streams continuous bedside telemetry (Heart Rate, SpO2, Blood Pressure, Temperature, Respiration Rate).
- **Medallion Data Lakehouse (PySpark / Databricks)**:
  - `01_kafka_to_bronze.py`: Raw JSON streaming ingestion from Kafka topics.
  - `02_bronze_to_silver.py`: Telemetry normalization, data cleaning, and clinical status tagging (NORMAL, WARNING, CRITICAL).
  - `03_silver_to_gold.py`: Department-level sliding-window aggregations and emergency alert tables.
  - `04_patient_alerts.py`: Real-time sepsis, hypoxemia, tachycardia, and hypertension alarm logic.
- **Live WebSocket Broadcast**: Instant push notifications and live ECG visualizer to Doctor and Staff consoles.

### 🛏️ 4. Bed Occupancy & Supply Chain Inventory
- **Real-Time Bed Monitoring**: Departmental allocations across ICU, Emergency, General Ward, and Specialty suites with predictive surge forecasting.
- **Pharmacy & Consumables Catalog**: Real-time stock counts, reorder thresholds, and dispensation audit logs.

### 🌐 5. City-Wide Inter-Hospital Network
- **Regional Interoperability**: Cross-hospital visibility of emergency room capacity, available ICU beds, and critical medicine stock across connected healthcare centers.

---

## 🧠 Clinical AI Models & Model Soup Fine-Tuning

CareEase AI supports three flexible LLM execution backends configured via `backend/.env`:

| Provider (`LLM_PROVIDER`) | Model Architecture | Hardware Requirement | Setup Details |
| :--- | :--- | :--- | :--- |
| **`gemini`** (Default Cloud) | Google Gemini 1.5 Pro / Flash | Any (API Key) | Set `GEMINI_API_KEY=...` in `.env` |
| **`qwen`** (Local Ollama) | Qwen 2.5 (1.5B, 7B, 14B) | 4GB – 12GB VRAM | `ollama run qwen2.5:14b` |
| **`qwen-local-ft`** (LoRA Adapter) | `Qwen/Qwen2.5-1.5B-Instruct` | 4GB – 6GB VRAM (4-bit QLoRA) | Loads adapter from `models/qwen-triage-adapter/` |
| **`medgemma`** (Clinical Specialist) | Google Gemma 2 2B / MedGemma | 4GB – 8GB VRAM | Custom Modelfile and fine-tuned checkpoints |

### 🥣 Model Soups (Weight-Averaged LoRA Adapters)
Rather than training a single adapter, the platform utilizes **Model Souping** (averaging weights across multiple fine-tuning runs or task-specialized checkpoints):
1. **Zero Added Inference Cost**: Maintains the exact parameter size and speed of a single LoRA adapter.
2. **Enhanced Generalization**: Mitigates catastrophic forgetting across clinical triage, discharge synthesis, and telemetry alert reasoning.
3. **Specialist Tasks**:
   - Run 1 / Ingredient A: Clinical Triage & Emergency Red Flags (`data/qwen_soup_triage.jsonl`)
   - Run 2 / Ingredient B: Discharge Summary & Medication Translation (`data/qwen_soup_discharge.jsonl`)
   - Run 3 / Ingredient C: ICU & Bedside Vitals Telemetry (`data/qwen_soup_telemetry.jsonl`)
4. **Weight Averaging**: Computed via $W_{soup} = \frac{1}{k}\sum_{i=1}^k W_i$ and saved directly to `models/qwen-triage-adapter/`.

---

## 📁 Repository Structure

```
Mini-Project/
├── backend/                              # FastAPI Gateway & Business Logic
│   ├── app/
│   │   ├── routes/
│   │   │   ├── beds.py                   # Bed allocation & occupancy forecast API
│   │   │   ├── city_wide.py              # Inter-hospital network coordination API
│   │   │   ├── inventory.py              # Pharmacy & medical supplies API
│   │   │   └── queues.py                 # OPD queues & triage routing API
│   │   ├── services/
│   │   │   ├── llm_service.py            # Multi-provider LLM parser, translation & chat
│   │   │   └── tts_service.py            # Text-to-speech audio streaming service
│   │   ├── ai_triage.py                  # Clinical symptom triage classifier
│   │   ├── config.py                     # Environment configuration loader
│   │   ├── database.py                   # SQLite database schema & mock seeder
│   │   ├── main.py                       # FastAPI application entry & WebSocket routes
│   │   └── queue_model.py                # M/M/c Queuing Theory calculation engine
│   ├── data/                             # Backend sample datasets
│   ├── requirements.txt                  # Python dependencies
│   └── .env.example                      # Environment configuration template
├── frontend/                             # Main Operations & Pharmacy Console (Port 5173)
│   ├── src/                              # React modules: Admin, Pharmacy, Kiosk, City
│   └── package.json
├── patient-app/                          # Patient Portal & Companion (Port 5174)
│   ├── src/                              # OPD token, appointments, discharge, billing
│   └── package.json
├── receptionist-app/                     # Receptionist & Front Desk Hub (Port 5175)
│   ├── src/                              # Patient check-in, bed reservation, staff ops
│   └── package.json
├── doctor-app/                           # Doctor Consultation Station (Port 5176)
│   ├── src/                              # Consultation workspace, queue, bedside alerts
│   └── package.json
├── databricks/                           # Medallion Lakehouse PySpark Streaming
│   ├── 01_kafka_to_bronze.py             # Kafka ingestion to Bronze Delta table
│   ├── 02_bronze_to_silver.py            # Cleaning, validation & clinical alert flags
│   ├── 03_silver_to_gold.py              # Departmental aggregations & vital trends
│   └── 04_patient_alerts.py              # Emergency threshold alert engine
├── data/                                 # Clinical & Model Soup Datasets
│   ├── medgemma_soup_training_dataset.json # 9,800+ clinical training examples
│   └── medgemma_clinical_dataset.json    # Clinical triage benchmark samples
├── scripts/                              # Training, Souping & Simulator Tools
│   ├── fine_tune_medgemma.py             # QLoRA fine-tuning for MedGemma
│   ├── train_medgemma_lora.py            # LoRA training runs for Gemma
│   ├── merge_medgemma_soup.py            # Weight averaging tool for MedGemma
│   ├── start_simulator.py                # Bedside vital telemetry simulator
│   └── create_medgemma_model.bat         # Batch script for Ollama model build
├── models/                               # Local fine-tuned LoRA adapters
├── run.bat                               # One-click startup script for all 4 apps + backend
├── run_all_monitoring.bat                # Startup script with streaming telemetry
├── soup.yaml                             # Model Soup training recipe for MedGemma
├── Modelfile                             # Ollama Modelfile for clinical assistant
├── sample_discharge_summary.txt          # Test clinical discharge summary
└── README.md                             # Project documentation
```

---

## ⚡ Quick Start

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `18.x` or higher (`npm` included)
- **Git**

---

### 🚀 One-Click Multi-Service Launch (Windows)

Simply double-click or run:
```bat
run.bat
```
This automatically starts:
1. **Backend API**: `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`)
2. **Main Operations Console**: `http://localhost:5173`
3. **Patient Companion App**: `http://localhost:5174`
4. **Receptionist Desk**: `http://localhost:5175`
5. **Doctor Station**: `http://localhost:5176`

---

### 🛠️ Manual Step-by-Step Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Configure `backend/.env` with your settings (e.g., `LLM_PROVIDER=gemini` and `GEMINI_API_KEY=your_key`).

Start the server:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Frontend Applications Setup
Open separate terminals for each app:

```bash
# Main Operations Console (Port 5173)
cd frontend
npm install
npm run dev

# Patient Companion App (Port 5174)
cd patient-app
npm install
npm run dev

# Receptionist Desk (Port 5175)
cd receptionist-app
npm install
npm run dev

# Doctor Station (Port 5176)
cd doctor-app
npm install
npm run dev
```

---

## 📡 Core API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/upload` | `POST` | Upload and parse discharge summary (PDF/TXT) into structured JSON. |
| `/api/explain` | `POST` | Translate medical summary into regional language with patient-friendly instructions. |
| `/api/chat` | `POST` | Grounded clinical Q&A companion. |
| `/api/tts` | `GET` | Stream MP3 audio for synthesized speech readout. |
| `/api/queues/status` | `GET` | Real-time OPD queue metrics and M/M/c doctor utilization. |
| `/api/queues/triage` | `POST` | AI symptom analysis and priority department routing. |
| `/api/beds/status` | `GET` | Departmental bed occupancy counts and utilization percentages. |
| `/api/inventory/list` | `GET` | Real-time pharmacy stock and low-inventory warnings. |
| `/api/city-wide/beds` | `GET` | Regional inter-hospital network bed availability. |
| `/api/monitoring/patients` | `GET` | Real-time monitored bedside telemetry snapshots. |
| `/api/monitoring/alerts` | `GET` | Multi-parameter clinical threshold alert feed. |
| `/ws/monitoring` | `WS` | WebSocket stream for live patient telemetry & alarms. |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/CareEaseFeature`).
3. Commit your changes (`git commit -m 'Add CareEaseFeature'`).
4. Push to the branch (`git push origin feature/CareEaseFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

<p align="center">
  Crafted with ❤️ for healthcare innovation and clinical workflow excellence.
</p>
