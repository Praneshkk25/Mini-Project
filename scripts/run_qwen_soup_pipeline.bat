@echo off
title Qwen 2.5 Model Soup Pipeline - AuraHealth AI
color 0B

echo ======================================================================
echo           QWEN 2.5 CLINICAL MODEL SOUP AUTOMATED PIPELINE             
echo ======================================================================
echo.

cd /d "%~dp0.."

:: 1. Generate Datasets
echo [Step 1/5] Generating Domain-Specific Qwen Datasets...
python scripts/generate_qwen_datasets.py
if errorlevel 1 (
    echo Error generating datasets. Exiting.
    pause
    exit /b 1
)
echo.

:: 2. Candidate Run A: Triage Specialist
echo [Step 2/5] Fine-tuning Candidate 1: Clinical Triage Specialist...
python scripts/train_qwen_soup_models.py --run_name triage --dataset data/qwen_soup_triage.jsonl --lr 2e-4 --epochs 3
if errorlevel 1 (
    echo Warning: Candidate 1 training had issues. Continuing...
)
echo.

:: 3. Candidate Run B: Discharge & Medication Specialist
echo [Step 3/5] Fine-tuning Candidate 2: Discharge & Pharma Specialist...
python scripts/train_qwen_soup_models.py --run_name discharge --dataset data/qwen_soup_discharge.jsonl --lr 1.5e-4 --epochs 3
if errorlevel 1 (
    echo Warning: Candidate 2 training had issues. Continuing...
)
echo.

:: 4. Candidate Run C: Telemetry Specialist
echo [Step 4/5] Fine-tuning Candidate 3: Bedside Vitals Telemetry Specialist...
python scripts/train_qwen_soup_models.py --run_name telemetry --dataset data/qwen_soup_telemetry.jsonl --lr 2e-4 --epochs 3
if errorlevel 1 (
    echo Warning: Candidate 3 training had issues. Continuing...
)
echo.

:: 5. Model Soup Weight Averaging
echo [Step 5/5] Synthesizing Model Soup via Uniform Weight Averaging...
python scripts/merge_qwen_soup.py --checkpoints checkpoints/qwen_triage checkpoints/qwen_discharge checkpoints/qwen_telemetry --output_dir models/qwen-triage-adapter
if errorlevel 1 (
    echo Error during soup merging.
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo      QWEN 2.5 MODEL SOUP PIPELINE COMPLETED SUCCESSFULLY!             
echo ======================================================================
echo   Souped LoRA Adapter saved at: models\qwen-triage-adapter\
echo   Backend will automatically load this adapter when:
echo   LLM_PROVIDER=qwen-local-ft in backend\.env
echo ======================================================================
echo.
pause
