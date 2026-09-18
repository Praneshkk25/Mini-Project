@echo off
TITLE CareEase AI - Complete Multi-Application Hospital & Telemetry Suite
color 0B

echo ======================================================================
echo    CareEase AI - Multi-Service Operations & Monitoring Suite
echo ======================================================================
echo.

:: 1. MedGemma Clinical AI Engine (Ollama)
echo [1/6] Starting MedGemma Clinical AI Engine via Ollama (medgemma-aura)...
start "CareEase MedGemma AI (Ollama:11434)" cmd /k "ollama run medgemma-aura"

timeout /t 3 /nobreak >nul

:: 2. Backend Server
echo [2/6] Starting FastAPI Backend Gateway & Telemetry Streaming Service...
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    start "CareEase Backend API (:8000)" cmd /k "venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
) else (
    start "CareEase Backend API (:8000)" cmd /k "python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)

timeout /t 3 /nobreak >nul

:: 3. Pharmacy Console & Real-Time Inventory
echo [3/6] Starting AuraHealth Pharmacy Console & Formulary Hub (:5173)...
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo Installing dependencies for Pharmacy Frontend...
    call npm install
)
start "AuraHealth Pharmacy Console (:5173)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

:: 4. Patient Companion App
echo [4/6] Starting Patient Companion Portal (:5174)...
cd /d "%~dp0patient-app"
if not exist "node_modules\" (
    echo Installing dependencies for Patient App...
    call npm install
)
start "CareEase Patient Portal (:5174)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

:: 5. Receptionist Desk App
echo [5/6] Starting Receptionist Desk Portal (:5175)...
cd /d "%~dp0receptionist-app"
if not exist "node_modules\" (
    echo Installing dependencies for Receptionist App...
    call npm install
)
start "CareEase Receptionist Desk (:5175)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

:: 6. Doctor Clinical Station App
echo [6/6] Starting Doctor Clinical Workstation (:5176)...
cd /d "%~dp0doctor-app"
if not exist "node_modules\" (
    echo Installing dependencies for Doctor App...
    call npm install
)
start "CareEase Doctor Station (:5176)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo    All Hospital Applications & AI Engines Started Successfully!
echo ======================================================================
echo.
echo    [0] MedGemma AI Service (Ollama):        http://localhost:11434 (medgemma-aura)
echo    [1] Pharmacy Console & Formulary Hub:    http://localhost:5173
echo    [2] Patient Companion Portal:            http://localhost:5174
echo    [3] Receptionist / Staff Desk:           http://localhost:5175
echo    [4] Doctor Clinical Workstation:         http://localhost:5176
echo    [5] Backend Gateway API (Qwen Local FT): http://127.0.0.1:8000
echo    [6] API Swagger Documentation:           http://127.0.0.1:8000/docs
echo    [7] Real-Time WebSocket Stream:          ws://127.0.0.1:8000/ws/monitoring
echo.
echo    Close individual terminal windows to stop any service.
echo ======================================================================
echo.

:: Automatically open main dashboard in default browser
start http://localhost:5173

pause

