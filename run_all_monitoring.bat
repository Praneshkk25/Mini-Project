@echo off
TITLE CareEase AI - Complete Multi-Application Hospital and Telemetry Suite
color 0B

:: Ensure working directory is always Mini-Project folder
cd /d "%~dp0"

echo ======================================================================
echo    CareEase AI - Multi-Service Operations and Monitoring Suite
echo ======================================================================
echo.

:: Set Firebase Service Account Environment Variables
set "FIREBASE_KEY_PATH=%~dp0hospital-management-c0ec1-firebase-adminsdk-fbsvc-f8916a8277.json"
set "GOOGLE_APPLICATION_CREDENTIALS=%~dp0hospital-management-c0ec1-firebase-adminsdk-fbsvc-f8916a8277.json"

:: 1. Kafka / Docker Check
echo [1/7] Checking Streaming Infrastructure...
docker info >nul 2>nul
if %ERRORLEVEL% equ 0 goto :DOCKER_FOUND
echo    [NOTE] Docker/Kafka not detected. Telemetry streaming will use high-fidelity simulation engine.
goto :AFTER_DOCKER

:DOCKER_FOUND
echo    Docker detected. Starting Apache Kafka and Zookeeper containers...
docker-compose up -d

:AFTER_DOCKER
echo.

:: 2. Optional MedGemma AI Engine (Ollama)
echo [2/7] Checking MedGemma Clinical AI Engine...
where ollama >nul 2>nul
if %ERRORLEVEL% equ 0 goto :OLLAMA_FOUND
echo    [NOTE] Ollama not installed. System will use native grounded clinical database mode with hosted Hugging Face models.
goto :AFTER_OLLAMA

:OLLAMA_FOUND
echo    Ollama detected. Starting MedGemma AI Engine...
start "CareEase MedGemma AI" cmd /k "ollama run medgemma-aura"

:AFTER_OLLAMA
echo.

:: 3. Bedside Vital Telemetry Sensor Simulator (Kafka Producer)
echo [3/7] Starting Bedside Vital Telemetry Streamer (15 Monitored Patients)...
start "CareEase Bedside Telemetry Streamer" cmd /k "cd /d %~dp0 && backend\venv\Scripts\python.exe scripts\start_simulator.py"

timeout /t 2 /nobreak >nul

:: 4. Backend Server (FastAPI on Port 8000)
echo [4/7] Starting FastAPI Backend Gateway (Port 8000)...
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    start "CareEase Backend API (:8000)" cmd /k "venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
) else (
    start "CareEase Backend API (:8000)" cmd /k "python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)

timeout /t 3 /nobreak >nul

:: 5. Main Operations and Pharmacy Console (Port 5173)
echo [5/7] Starting Operations and Pharmacy Console (:5173)...
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo Installing dependencies for Pharmacy Frontend...
    call npm install
)
start "CareEase Main Operations (:5173)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

:: 6. Patient Companion App (Port 5174)
echo [6/7] Starting Patient Companion Portal (:5174)...
cd /d "%~dp0patient-app"
if not exist "node_modules\" (
    echo Installing dependencies for Patient App...
    call npm install
)
start "CareEase Patient Portal (:5174)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

:: 7. Receptionist Desk and Doctor Clinical Workstation
echo [7/7] Starting Staff Hubs: Receptionist (:5175) and Doctor Station (:5176)...
cd /d "%~dp0receptionist-app"
if not exist "node_modules\" (
    call npm install
)
start "CareEase Receptionist Desk (:5175)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

cd /d "%~dp0doctor-app"
if not exist "node_modules\" (
    call npm install
)
start "CareEase Doctor Station (:5176)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo    All Hospital Applications, Kafka Streamer and AI Engines Started!
echo ======================================================================
echo.
echo    [1] Operations and Pharmacy Console: http://localhost:5173
echo    [2] Patient Companion Portal:        http://localhost:5174
echo    [3] Receptionist / Staff Desk:       http://localhost:5175
echo    [4] Doctor Clinical Workstation:     http://localhost:5176
echo    [5] Backend Gateway API:             http://127.0.0.1:8000
echo    [6] API Swagger Documentation:       http://127.0.0.1:8000/docs
echo    [7] Real-Time WebSocket Telemetry:   ws://127.0.0.1:8000/ws/monitoring
echo    [8] Firebase Admin SDK:              ACTIVE (hospital-management-c0ec1)
echo.
echo    Close individual terminal windows to stop any service.
echo ======================================================================
echo.

:: Automatically open main dashboard in default browser
start http://localhost:5173

pause
