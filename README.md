# 🏥 CareEase AI & Integrated Hospital Operations Console

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2.7-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-38BDF8.svg)](https://tailwindcss.com/)
[![LLM Support](https://img.shields.io/badge/LLM-Gemini_%7C_Qwen_2.5-orange.svg)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CareEase AI** is an end-to-end, intelligent hospital operations management platform and patient care companion. Built to bridge clinical operational bottlenecks and post-discharge patient care, CareEase AI combines real-time OPD queue telemetry (powered by M/M/c queuing theory), intelligent AI triage symptom routing, predictive bed occupancy forecasting, hospital inventory tracking, city-wide inter-hospital network interoperability, and an AI-powered Multilingual Discharge Assistant.

---

## 🌟 Key Features

### 📄 1. AI Hospital Discharge Assistant & Care Companion
- **Document Parsing**: Automatic text and structured data extraction from medical discharge summaries in PDF or plain TXT format using `pdfplumber` and `pypdf`.
- **Structured JSON Synthesis**: Converts complex medical jargon into organized schemas (Medications, Daily Timings, Diet & Lifestyle Restrictions, Warning Flags, Follow-up Details).
- **Multilingual Patient Translation**: Translates medical summaries into regional Indian languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, etc.) tailored for patient comprehension.
- **Audio Readout (Text-to-Speech)**: Real-time MP3 streaming text-to-speech powered by `gTTS` so patients and caregivers can listen to clear verbal instructions.
- **Grounded RAG Chat Companion**: Interactive Q&A chatbot grounded strictly on the patient's specific discharge context to prevent hallucinations and offer reliable guidance.

### 🏥 2. Real-Time OPD Queue Operations & Math Simulation
- **M/M/c Queuing Theory Engine**: Evaluates doctor arrival rates ($\lambda$), service rates ($\mu$), and active consulting doctors ($c$) to compute doctor utilization, queue lengths, and estimated patient wait times.
- **Smart AI Clinical Triage**: Rule-based NLP classifier mapping patient symptoms to appropriate clinical departments (Cardiology, Pediatrics, Orthopedics, Dermatology, General Medicine) with priority matrix flags (*Immediate*, *Urgent*, *Routine*).
- **Live Queue Monitoring**: Operational view for nurses and clinic admins to track check-ins, consultation statuses, and doctor workload distribution.

### 🛏️ 3. Bed Management & Occupancy Forecasting
- **Departmental Bed Allocation**: Real-time bed occupancy monitoring across ICU, Emergency, General Ward, and Specialty units.
- **Predictive Occupancy Analytics**: Mathematical forecasting models helping hospital administrators anticipate bottleneck spikes before emergency rooms reach full capacity.

### 📦 4. Hospital Supply & Pharmacy Inventory
- **Stock Telemetry**: Real-time catalog tracking essential pharmaceuticals, medical consumables, surgical kits, and equipment.
- **Low Stock Alerts & Dispensations**: Automated alerts for critical threshold drops and dispensation logs.

### 🌐 5. City-Wide Inter-Hospital Network Integration
- **Regional Interoperability**: Unified API gateway for inter-hospital resource coordination.
- **Emergency & Bed Sharing Network**: Cross-hospital visibility of emergency status, ICU bed availability, queue loads, and regional inventory sharing during crisis situations.

### 🖥️ 6. Role-Based Specialized Dashboards
- **Patient App / Care Companion**: Simple, intuitive view for uploading summaries, hearing audio instructions, and chatting with AI.
- **Staff / Nurse Dashboard**: Queue registration, patient triage, bed assignments, and inventory logs.
- **Doctor Dashboard**: Active patient queue management, triage review, consultation status updates.
- **Admin Dashboard**: Comprehensive hospital telemetry, queuing theory metrics, bed occupancy forecasts, and stock inventory charts.
- **City Operations Center View**: Regional map and telemetry hub for city-wide hospital network monitoring.

### 📡 7. Real-Time Patient Vital Monitoring & Streaming Analytics
- **Synthetic Patient Sensor Simulator**: Continuous multi-patient bedside telemetry simulator streaming Heart Rate, SpO2, Systolic & Diastolic BP, Temperature, and Respiratory Rate.
- **Apache Kafka Ingestion**: Reliable JSON event producer streaming to `patient-vitals` and `patient-alerts` topics.
- **PySpark Structured Streaming**: Real-time schema validation, timestamp normalization, and Medallion architecture (Bronze -> Silver -> Gold).
- **Medallion Data Lake Architecture**:
  - **Bronze**: Raw JSON Kafka ingestion stream.
  - **Silver**: Cleaned telemetry with rule-based status flags (NORMAL, WARNING, CRITICAL).
  - **Gold**: Sliding-window department aggregations and high-priority emergency alerts.
- **Rule-Based Emergency Alert Engine**: Multi-parameter clinical threshold detector generating warnings for hypoxemia ($SpO_2 < 92\%$), severe tachycardia ($HR > 120$), hypertension, and fever.
- **FastAPI WebSockets & Command Center UI**: Real-time WebSocket broadcasting to React command-center dashboard featuring live synthetic ECG visualizer, patient status grid, alert feed with audio alarm, and Databricks compatibility scripts.

---

## 🏗️ System Architecture & Tech Stack

### **Backend Framework**
- **Core Engine**: Python 3.10+, [FastAPI](https://fastapi.tiangolo.com/), Uvicorn.
- **Database**: SQLite (`hospital.db`) with dynamic table initialization & mock telemetry seed.
- **LLM Integrations**:
  - **Google Gemini API** (`google-generativeai`): High-speed structured parsing and multilingual translation.
  - **Qwen 2.5 via Ollama** (`qwen2.5:14b`): Local, privacy-preserving open-source LLM inference.
  - **Custom Fine-Tuned Model**: Fine-tuned Qwen 2.5 adapter via PyTorch, PEFT (LoRA), TRL, Accelerate, and BitsAndBytes.
- **Document Processing**: `pdfplumber`, `pypdf`, `python-multipart`.
- **Audio Service**: `gTTS` (Google Text-to-Speech) with streaming `audio/mpeg` responses.

### **Frontend Framework**
- **Core UI**: React 19, [Vite](https://vitejs.dev/), React Router v7.
- **Styling**: Modern Tailwind CSS v4, custom glassmorphism design system.
- **UI Icons & Visualizations**: Lucide React (`lucide-react`), Recharts (`recharts`) for analytical charts and queuing trends.

---

## 📁 Repository Structure

```
Mini-Project/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── beds.py           # Bed allocation & occupancy forecast API
│   │   │   ├── city_wide.py      # Inter-hospital network integration API
│   │   │   ├── inventory.py      # Pharmacy & supplies inventory API
│   │   │   └── queues.py         # OPD queues & triage routing API
│   │   ├── services/
│   │   │   ├── llm_service.py    # LLM document parser, translation & chat RAG
│   │   │   └── tts_service.py    # Text-to-speech audio streaming service
│   │   ├── ai_triage.py          # Clinical symptom triage classifier
│   │   ├── config.py             # Environment configuration & provider loader
│   │   ├── database.py           # SQLite database schema & mock seeder
│   │   ├── main.py               # FastAPI gateway & AI Discharge endpoints
│   │   └── queue_model.py        # M/M/c Queuing Theory calculation engine
│   ├── data/                     # Data storage & dataset caches
│   ├── scripts/
│   │   ├── fine_tune_qwen.py     # Script to fine-tune Qwen 2.5 using LoRA (PEFT)
│   │   └── generate_dataset.py   # Synthetic clinical dataset generator script
│   ├── tests/                    # Backend unit & endpoint test suite
│   ├── .env.example              # Environment variable config template
│   ├── hospital.db               # SQLite database file
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── public/                   # Static web assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx             # Admin telemetry & operational analytics
│   │   │   ├── CareCompanion.jsx              # Patient discharge summary reader & chat
│   │   │   ├── CityAPIs.jsx                   # City network API tester interface
│   │   │   ├── CityView.jsx                   # City-wide hospital operations center view
│   │   │   ├── DischargeSummaryAssistant.jsx  # Document upload & multilingual viewer
│   │   │   ├── DoctorDashboard.jsx             # Doctor patient queue view
│   │   │   ├── HospitalOps.jsx                # Full hospital management hub
│   │   │   ├── PatientApp.jsx                 # Patient portal interface
│   │   │   ├── PatientDischarge.jsx           # Discharge operations workspace
│   │   │   └── StaffDashboard.jsx              # Nurse & receptionist operational view
│   │   ├── App.jsx               # Main React router & layout manager
│   │   ├── index.css             # Tailwind CSS & global design system
│   │   ├── main.jsx              # React entrypoint
│   │   └── mockData.js           # Frontend fallback mock data
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite build configuration
├── sample_discharge_summary.txt  # Sample medical discharge document for testing
└── README.md                     # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `18.x` or higher (`npm` included)
- **Git**

---

### 🐍 Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your preferred settings. For Google Gemini:
   ```ini
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=8000
   HOST=127.0.0.1
   ```

5. **Start the FastAPI Server**:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API will start at `http://127.0.0.1:8000`. Access interactive API docs (Swagger UI) at `http://127.0.0.1:8000/docs`.

---

### ⚛️ Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node modules**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open your browser and navigate to `http://localhost:5173`.

---

## ⚙️ LLM Provider Configuration (`.env`)

CareEase AI supports three flexible LLM execution backends:

| Provider Key (`LLM_PROVIDER`) | Description | Required Config Variables |
| :--- | :--- | :--- |
| **`gemini`** (Recommended) | High-speed cloud LLM via Google Gemini API | `GEMINI_API_KEY=your_key` |
| **`qwen`** | Local private LLM via Ollama server | `QWEN_API_BASE=http://localhost:11434/v1`<br>`QWEN_MODEL_NAME=qwen2.5:14b` |
| **`qwen-local-ft`** | Fine-tuned PyTorch model with local adapter | `LOCAL_FT_BASE_MODEL=Qwen/Qwen2.5-1.5B-Instruct` |

---

## 📡 API Endpoint Reference

### **1. AI Discharge Assistant Endpoints**
- `POST /api/upload`: Upload PDF or TXT discharge summary, parse and return structured JSON.
- `POST /api/explain`: Translate structured summary into a target regional language.
- `POST /api/chat`: Grounded Q&A conversation based on discharge summary context.
- `GET /api/tts?text=...&language=...`: Stream MP3 audio for speech synthesis.

### **2. Hospital Operations & Queue Endpoints**
- `GET /api/queues/status`: OPD queue status summary and M/M/c telemetry.
- `GET /api/queues/list`: List active queue entries by department.
- `POST /api/queues/triage`: Analyze symptoms and route patient to target department.

### **3. Bed Management Endpoints**
- `GET /api/beds/status`: Current departmental bed occupancy counts.
- `GET /api/beds/forecast`: Bed occupancy forecast metrics.

### **4. Inventory Endpoints**
- `GET /api/inventory/list`: Current stock catalog of medicines and supplies.
- `GET /api/inventory/dispensations`: Logs of medicine dispensations.

### **5. City-Wide Integration Endpoints**
- `GET /api/city-wide/beds`: Regional hospital network bed availability.
- `GET /api/city-wide/queues`: Regional OPD load telemetry.
- `GET /api/city-wide/emergency-status`: City emergency room status matrix.
- `GET /api/city-wide/inventory`: Regional supply chain stock levels.

### **6. Real-Time Patient Vital Monitoring Endpoints**
- `GET /api/monitoring/patients`: Monitored patient telemetry snapshots.
- `GET /api/monitoring/patients/{patient_id}`: Patient vital signs detail.
- `GET /api/monitoring/vitals/history/{patient_id}`: Time-series vital trend history for line charts.
- `GET /api/monitoring/alerts`: Threshold alert feed (Critical, Warning, Resolved).
- `GET /api/monitoring/stats`: Aggregated hospital telemetry summary.
- `POST /api/monitoring/simulator/start`: Start background telemetry stream.
- `POST /api/monitoring/simulator/stop`: Pause background telemetry stream.
- `POST /api/monitoring/simulator/patient/{patient_id}/critical`: Force emergency vital state trigger.
- `GET /api/monitoring/stream/status`: Pipeline health status indicator.
- `WS /ws/monitoring`: Real-time WebSocket connection for vital updates & alerts.

---

## 🧪 Testing with Sample Data

A pre-configured sample medical discharge summary is included in the project root:
- **File**: `sample_discharge_summary.txt`
- **Testing steps**:
  1. Open the CareEase AI Frontend (`http://localhost:5173`).
  2. Navigate to the **Discharge Assistant** / **Care Companion** module.
  3. Upload `sample_discharge_summary.txt`.
  4. View the parsed medications, dietary rules, and warning signs.
  5. Select a regional language (e.g., *Hindi*, *Tamil*, *Telugu*) to translate and click **Play Audio** to test Text-to-Speech.
  6. Use the AI Chat interface to ask questions such as *"What should I do if I get a high fever?"* or *"When is my follow-up appointment?"*.

---

## 🏋️ Fine-Tuning Qwen 2.5 Model (Optional)

To train a custom fine-tuned model for clinical triage and discharge summary extraction:

1. **Generate Synthetic Training Dataset**:
   ```bash
   cd backend
   python scripts/generate_dataset.py
   ```
   This creates JSONL training datasets inside `backend/data/`.

2. **Run LoRA Fine-Tuning**:
   ```bash
   python scripts/fine_tune_qwen.py
   ```
   This uses `peft`, `trl`, `transformers`, and `bitsandbytes` to train a LoRA adapter saved under `backend/models/qwen-triage-adapter/`.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.

---

<p align="center">
  Crafted with ❤️ for healthcare innovation.
</p>
