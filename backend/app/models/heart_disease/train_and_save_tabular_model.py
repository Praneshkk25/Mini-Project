import os
import sys
import urllib.request
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score, classification_report
import joblib

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("=================================================================")
print("[*] Training Tabular XGBoost Model from Unified Heart Disease Pipeline")
print("=================================================================")

# Locate heart.csv
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, "heart.csv")

if not os.path.exists(csv_path):
    url = "https://raw.githubusercontent.com/dileep-lingamallu/Heart-Disease-Prediction-Dataset/master/heart.csv"
    print(f"Downloading heart.csv from {url}...")
    urllib.request.urlretrieve(url, csv_path)

print(f"Loading tabular dataset: {csv_path}")
tabular_df = pd.read_csv(csv_path)
print(f"Loaded {len(tabular_df)} patient records with {len(tabular_df.columns)} columns.")
print("Features:", list(tabular_df.columns[:-1]))

# Feature-target split
X_tab = tabular_df.drop(columns=['target'])
y_tab = tabular_df['target']

X_tab_train, X_tab_test, y_tab_train, y_tab_test = train_test_split(
    X_tab, y_tab, test_size=0.2, random_state=42, stratify=y_tab
)

# Train Clinical Tabular XGBoost Classifier matching Unified_Heart_Disease_MultiModal.ipynb
tabular_xgb_model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric='logloss'
)
tabular_xgb_model.fit(X_tab_train, y_tab_train)

y_tab_pred = tabular_xgb_model.predict(X_tab_test)
y_tab_proba = tabular_xgb_model.predict_proba(X_tab_test)[:, 1]

print("\n--- XGBoost Tabular Classifier Performance ---")
print(f"Accuracy : {accuracy_score(y_tab_test, y_tab_pred) * 100:.2f}%")
print(f"Precision: {precision_score(y_tab_test, y_tab_pred) * 100:.2f}%")
print(f"Recall   : {recall_score(y_tab_test, y_tab_pred) * 100:.2f}%")
print(f"ROC-AUC  : {roc_auc_score(y_tab_test, y_tab_proba):.4f}")
print("\nClassification Report:\n", classification_report(y_tab_test, y_tab_pred))

# Save both JSON and PKL formats in backend/app/models/heart_disease
json_save_path = os.path.join(script_dir, "xgboost_tabular_model.json")
pkl_save_path = os.path.join(script_dir, "xgboost_tabular_model.pkl")

tabular_xgb_model.save_model(json_save_path)
print(f"[OK] Saved tabular XGBoost model to JSON: {json_save_path}")

joblib.dump(tabular_xgb_model, pkl_save_path)
print(f"[OK] Saved tabular XGBoost model to PKL: {pkl_save_path}")

print("=================================================================")
print("Training completed successfully!")
print("=================================================================")
