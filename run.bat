@echo off
title CareEase AI — Multi-Service Hospital Suite
color 0A

echo =======================================================
echo   CareEase AI — Starting Complete Hospital Operations Suite
echo =======================================================
echo.

:: 1. Backend Server
echo [1/5] Starting Backend Server (FastAPI on Port 8000)...
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    start "CareEase Backend API (:8000)" cmd /k "venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
) else (
    start "CareEase Backend API (:8000)" cmd /k "python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)

timeout /t 3 /nobreak >nul

:: 2. Main Integrated Frontend Dashboard
echo [2/5] Starting Main Operations Console (Port 5173)...
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo Installing dependencies for Main Frontend...
    call npm install
)
start "CareEase Main Console (:5173)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

:: 3. Patient Portal App
echo [3/5] Starting Patient Portal (Port 5174)...
cd /d "%~dp0patient-app"
if not exist "node_modules\" (
    echo Installing dependencies for Patient App...
    call npm install
)
start "CareEase Patient App (:5174)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

:: 4. Receptionist / Staff App
echo [4/5] Starting Receptionist Desk (Port 5175)...
cd /d "%~dp0receptionist-app"
if not exist "node_modules\" (
    echo Installing dependencies for Receptionist App...
    call npm install
)
start "CareEase Receptionist App (:5175)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

:: 5. Doctor Clinical App
echo [5/5] Starting Doctor Station (Port 5176)...
cd /d "%~dp0doctor-app"
if not exist "node_modules\" (
    echo Installing dependencies for Doctor App...
    call npm install
)
start "CareEase Doctor Station (:5176)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo =======================================================
echo   All Hospital Applications Started Successfully!
echo =======================================================
echo.
echo   [1] Main Operations Console:   http://localhost:5173
echo   [2] Patient Companion App:     http://localhost:5174
echo   [3] Receptionist Desk:         http://localhost:5175
echo   [4] Doctor Station:            http://localhost:5176
echo   [5] Backend API & Swagger:     http://127.0.0.1:8000/docs
echo.
echo   Close individual terminal windows to stop any service.
echo =======================================================
echo.

:: Open the main dashboard in default browser
start http://localhost:5173

pause
