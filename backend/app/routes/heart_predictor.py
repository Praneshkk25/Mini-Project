from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
from app.services.heart_disease_model import predict_heart_disease_xgboost

router = APIRouter(prefix="/api/predict/heart-disease", tags=["Heart Predictor"])

@router.post("")
async def predict_heart_disease(
    age: int = Form(55),
    sex: int = Form(1),
    cp: int = Form(2),
    trestbps: int = Form(140),
    chol: int = Form(245),
    fbs: int = Form(0),
    restecg: int = Form(1),
    thalach: int = Form(132),
    exang: int = Form(1),
    oldpeak: float = Form(1.8),
    slope: int = Form(1),
    ecg_image: Optional[UploadFile] = File(None)
):
    """
    Runs multi-modal XGBoost Heart Disease risk prediction using tabular clinical features + optional ECG image upload.
    """
    try:
        image_bytes = None
        if ecg_image and ecg_image.filename:
            image_bytes = await ecg_image.read()
            
        result = predict_heart_disease_xgboost(
            age=age,
            sex=sex,
            cp=cp,
            trestbps=trestbps,
            chol=chol,
            fbs=fbs,
            restecg=restecg,
            thalach=thalach,
            exang=exang,
            oldpeak=oldpeak,
            slope=slope,
            ecg_image_bytes=image_bytes
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"XGBoost Prediction failed: {str(e)}")

@router.get("/presets")
def get_preset_cases():
    return [
        {
            "preset_id": "normal",
            "name": "Case A: Low Risk Patient (Normal ECG)",
            "age": 38,
            "sex": 0,
            "cp": 0,
            "trestbps": 118,
            "chol": 185,
            "fbs": 0,
            "restecg": 0,
            "thalach": 168,
            "exang": 0,
            "oldpeak": 0.0,
            "slope": 0,
            "description": "38 yo Female with normal blood pressure, optimal cholesterol, and good exercise tolerance."
        },
        {
            "preset_id": "ischemic",
            "name": "Case B: High Risk Ischemic Patient (ST Depression)",
            "age": 62,
            "sex": 1,
            "cp": 3,
            "trestbps": 152,
            "chol": 278,
            "fbs": 1,
            "restecg": 1,
            "thalach": 124,
            "exang": 1,
            "oldpeak": 2.4,
            "slope": 2,
            "description": "62 yo Male presenting with exercise angina, elevated ST depression (2.4mm), and high blood pressure."
        },
        {
            "preset_id": "arrhythmia",
            "name": "Case C: Moderate Risk Patient (Arrhythmia & Conduction Delay)",
            "age": 54,
            "sex": 1,
            "cp": 2,
            "trestbps": 138,
            "chol": 230,
            "fbs": 0,
            "restecg": 2,
            "thalach": 142,
            "exang": 0,
            "oldpeak": 1.1,
            "slope": 1,
            "description": "54 yo Male with left ventricular hypertrophy, mild ST shift, and non-anginal chest pain."
        }
    ]
