import pandas as pd
import numpy as np
import os
import json

print("==================================================")
print("🫀 XGBoost Heart Disease Classifier Training Pipeline")
print("==================================================")

# Load training dataset
csv_path = os.path.join(os.path.dirname(__file__), "heart_disease_dataset.csv")
df = pd.read_csv(csv_path)

print(f"\n[1/5] Loaded dataset with {len(df)} patient records.")
print("Features:", list(df.columns[:-1]))
print("Target Distribution:\n", df['target'].value_counts())

X = df.drop(columns=['target'])
y = df['target']

try:
    import xgboost as xgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score, classification_report

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("\n[2/5] Training XGBoost Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)

    print("\n[3/5] Evaluating Model Performance...")
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    print(f"Accuracy  : {acc * 100:.2f}%")
    print(f"Precision : {prec * 100:.2f}%")
    print(f"Recall    : {rec * 100:.2f}%")
    print(f"ROC-AUC   : {auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    print("\n[4/5] Feature Importances:")
    importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
    for feat, imp in importances.items():
        print(f"  - {feat:15s}: {imp:.4f}")

    # Save model weights to JSON
    save_path = os.path.join(os.path.dirname(__file__), "heart_disease_xgb.json")
    model.save_model(save_path)
    print(f"\n[5/5] Saved trained XGBoost model to: {save_path}")

except ImportError:
    print("\n⚠️ Note: Install `xgboost` and `scikit-learn` to execute full training script.")
    print("Command: pip install xgboost scikit-learn pandas numpy")
