"""
Upload fine-tuned models and adapters to Hugging Face Hub.
Repositories:
- PraneshKK/careease-xgboost-models
- PraneshKK/careease-qwen-triage-adapter
- PraneshKK/careease-medgemma-adapter
"""

import os
import shutil
import tempfile
from pathlib import Path
from huggingface_hub import HfApi

def upload_all():
    api = HfApi()
    user = api.whoami()
    username = user.get("name")
    print(f"[INFO] Authenticated as: {username}")
    
    # -------------------------------------------------------------
    # 1. XGBoost Models Repo
    # -------------------------------------------------------------
    repo_xgb = f"{username}/careease-xgboost-models"
    print(f"\n[1/3] Processing XGBoost Models -> {repo_xgb}...")
    api.create_repo(repo_id=repo_xgb, repo_type="model", private=True, exist_ok=True)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        # Copy model files
        shutil.copy2("xgboost_tabular_model.json", tmp_path / "xgboost_tabular_model.json")
        shutil.copy2("xgboost_ecg_model.json", tmp_path / "xgboost_ecg_model.json")
        
        xgb_readme = f"""---
language:
- en
library_name: xgboost
tags:
- healthcare
- clinical-risk
- ecg-analysis
- patient-vitals
license: apache-2.0
---

# CareEase & AuraHealth - XGBoost Clinical Models

This repository contains trained XGBoost models used for real-time patient risk assessment and vital sign streaming triage in the CareEase / AuraHealth Hospital Management System.

## Models Included:
1. `xgboost_tabular_model.json`: Evaluates vital signs (Heart Rate, Blood Pressure, SpO2, Respiratory Rate, Temperature) to predict patient deterioration / triage urgency.
2. `xgboost_ecg_model.json`: Analyzes streaming ECG lead telemetry features for arrhythmia and anomaly detection.

## How to Load and Use:
```python
import xgboost as xgb
import json

# Load tabular vital risk model
tabular_model = xgb.Booster()
tabular_model.load_model("xgboost_tabular_model.json")

# Load ECG arrhythmia model
ecg_model = xgb.Booster()
ecg_model.load_model("xgboost_ecg_model.json")
```
"""
        with open(tmp_path / "README.md", "w", encoding="utf-8") as f:
            f.write(xgb_readme)
            
        print(f"Uploading XGBoost files to {repo_xgb}...")
        api.upload_folder(
            folder_path=str(tmp_path),
            repo_id=repo_xgb,
            repo_type="model",
            commit_message="Upload CareEase XGBoost tabular and ECG models"
        )
        print(f"[SUCCESS] XGBoost models uploaded to https://huggingface.co/{repo_xgb}")

    # -------------------------------------------------------------
    # 2. Qwen Triage Adapter Repo
    # -------------------------------------------------------------
    repo_qwen = f"{username}/careease-qwen-triage-adapter"
    print(f"\n[2/3] Processing Qwen Triage Adapter -> {repo_qwen}...")
    api.create_repo(repo_id=repo_qwen, repo_type="model", private=True, exist_ok=True)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        qwen_src = Path("models/qwen-triage-adapter")
        
        # Files to upload
        include_files = [
            "adapter_config.json",
            "adapter_model.safetensors",
            "chat_template.jinja",
            "tokenizer.json",
            "tokenizer_config.json",
        ]
        for fname in include_files:
            src_file = qwen_src / fname
            if src_file.exists():
                shutil.copy2(src_file, tmp_path / fname)
        
        qwen_readme = f"""---
base_model: Qwen/Qwen2.5-1.5B-Instruct
library_name: peft
pipeline_tag: text-generation
tags:
- peft
- lora
- medical-triage
- emergency-detection
- careease
license: apache-2.0
---

# CareEase - Qwen 2.5 1.5B Fine-Tuned Triage Adapter

This repository hosts the LoRA fine-tuned adapter for **Qwen/Qwen2.5-1.5B-Instruct**, trained specifically for clinical triage, emergency red flag detection, and hospital department routing in the CareEase / AuraHealth hospital ecosystem.

## Base Model:
- `Qwen/Qwen2.5-1.5B-Instruct`
- Adapter Type: LoRA (PEFT)
- Target Modules: `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`
- Rank: 16, Alpha: 32

## How to Load:
```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base_model_id = "Qwen/Qwen2.5-1.5B-Instruct"
adapter_id = "{repo_qwen}"

tokenizer = AutoTokenizer.from_pretrained(base_model_id)
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_id,
    torch_dtype=torch.float16,
    device_map="auto"
)
model = PeftModel.from_pretrained(base_model, adapter_id)
```
"""
        with open(tmp_path / "README.md", "w", encoding="utf-8") as f:
            f.write(qwen_readme)
            
        print(f"Uploading Qwen adapter files to {repo_qwen}...")
        api.upload_folder(
            folder_path=str(tmp_path),
            repo_id=repo_qwen,
            repo_type="model",
            commit_message="Upload CareEase Qwen 2.5 1.5B triage LoRA adapter"
        )
        print(f"[SUCCESS] Qwen adapter uploaded to https://huggingface.co/{repo_qwen}")

    # -------------------------------------------------------------
    # 3. MedGemma Clinical Reasoning Adapter Repo
    # -------------------------------------------------------------
    repo_medgemma = f"{username}/careease-medgemma-adapter"
    print(f"\n[3/3] Processing MedGemma Adapter -> {repo_medgemma}...")
    api.create_repo(repo_id=repo_medgemma, repo_type="model", private=True, exist_ok=True)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        medgemma_src = Path("output/medgemma_run1/checkpoint-1000")
        
        include_files = [
            "adapter_config.json",
            "adapter_model.safetensors",
            "chat_template.jinja",
            "tokenizer.json",
            "tokenizer_config.json",
        ]
        for fname in include_files:
            src_file = medgemma_src / fname
            if src_file.exists():
                shutil.copy2(src_file, tmp_path / fname)
                
        medgemma_readme = f"""---
base_model: google/medgemma-4b-it
library_name: peft
pipeline_tag: text-generation
tags:
- peft
- lora
- clinical-reasoning
- patient-intake
- discharge-summary
- careease
license: apache-2.0
---

# CareEase - MedGemma Fine-Tuned Clinical Adapter

This repository hosts the LoRA fine-tuned adapter for **google/medgemma-4b-it**, optimized for clinical reasoning, patient intake interviews, structured discharge summaries, and patient medication explanation.

## Base Model:
- `google/medgemma-4b-it`
- Adapter Type: LoRA (PEFT)
- Target Modules: `down_proj, o_proj, v_proj, gate_proj, q_proj, k_proj, up_proj`
- Rank: 16, Alpha: 32

## How to Load:
```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base_model_id = "google/medgemma-4b-it"
adapter_id = "{repo_medgemma}"

tokenizer = AutoTokenizer.from_pretrained(base_model_id)
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)
model = PeftModel.from_pretrained(base_model, adapter_id)
```
"""
        with open(tmp_path / "README.md", "w", encoding="utf-8") as f:
            f.write(medgemma_readme)
            
        print(f"Uploading MedGemma adapter files to {repo_medgemma}...")
        api.upload_folder(
            folder_path=str(tmp_path),
            repo_id=repo_medgemma,
            repo_type="model",
            commit_message="Upload CareEase MedGemma clinical reasoning LoRA adapter"
        )
        print(f"[SUCCESS] MedGemma adapter uploaded to https://huggingface.co/{repo_medgemma}")

    print("\n========================================================")
    print("All models successfully uploaded to Hugging Face!")
    print(f"1. XGBoost Models:       https://huggingface.co/{repo_xgb}")
    print(f"2. Qwen Triage Adapter:  https://huggingface.co/{repo_qwen}")
    print(f"3. MedGemma Adapter:     https://huggingface.co/{repo_medgemma}")
    print("========================================================")

if __name__ == "__main__":
    upload_all()
