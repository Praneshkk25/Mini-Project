@echo off
echo ===================================================
echo AuraHealth MedGemma Model Setup & Deployment
echo ===================================================
echo Checking Ollama availability...
ollama list
echo.
echo Building custom medgemma-aura model with clinical safety directives...
ollama create medgemma-aura -f Modelfile
echo.
echo ===================================================
echo Setup Complete! Model 'medgemma-aura' is ready for backend FastAPI.
echo ===================================================
pause
