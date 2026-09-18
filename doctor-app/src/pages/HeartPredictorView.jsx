import React, { useState, useEffect } from 'react';

export default function HeartPredictorView() {
  const [formData, setFormData] = useState({
    age: 58,
    sex: 1,
    cp: 2,
    trestbps: 142,
    chol: 254,
    fbs: 0,
    restecg: 1,
    thalach: 135,
    exang: 1,
    oldpeak: 2.1,
    slope: 1,
    ca: 0,
    thal: 2
  });

  const [ecgImage, setEcgImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [presets, setPresets] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPresets();
    handlePredict(); // Run initial default prediction
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/predict/heart-disease/presets');
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadPreset = (preset) => {
    setFormData({
      age: preset.age,
      sex: preset.sex,
      cp: preset.cp,
      trestbps: preset.trestbps,
      chol: preset.chol,
      fbs: preset.fbs,
      restecg: preset.restecg,
      thalach: preset.thalach,
      exang: preset.exang,
      oldpeak: preset.oldpeak,
      slope: preset.slope,
      ca: preset.ca ?? 0,
      thal: preset.thal ?? 2
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEcgImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePredict = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      const bodyData = new FormData();
      Object.keys(formData).forEach((key) => {
        bodyData.append(key, formData[key]);
      });

      if (ecgImage) {
        bodyData.append('ecg_image', ecgImage);
      }

      const res = await fetch('http://localhost:8000/api/predict/heart-disease', {
        method: 'POST',
        body: bodyData
      });

      if (!res.ok) throw new Error('Prediction request failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert(`Error running prediction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🫀 Multi-Modal XGBoost Heart Disease Predictor</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Ensemble Machine Learning Pipeline combining Clinical Patient Dataset & ECG Image Waveform Analysis
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>QUICK PRESETS:</span>
          {presets.map((p) => (
            <button
              key={p.preset_id}
              onClick={() => loadPreset(p)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Form & Image Uploader */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            1. Clinical Dataset & ECG Image Inputs
          </h3>

          <form onSubmit={handlePredict}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Age (Years)</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Sex</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                  <option value={1}>Male</option>
                  <option value={0}>Female</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Chest Pain Type</label>
                <select
                  value={formData.cp}
                  onChange={(e) => setFormData({ ...formData, cp: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                  <option value={0}>Typical Angina</option>
                  <option value={1}>Atypical Angina</option>
                  <option value={2}>Non-anginal Pain</option>
                  <option value={3}>Asymptomatic</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Resting BP (mmHg)</label>
                <input
                  type="number"
                  value={formData.trestbps}
                  onChange={(e) => setFormData({ ...formData, trestbps: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Serum Cholesterol (mg/dl)</label>
                <input
                  type="number"
                  value={formData.chol}
                  onChange={(e) => setFormData({ ...formData, chol: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Max Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={formData.thalach}
                  onChange={(e) => setFormData({ ...formData, thalach: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Exercise Angina</label>
                <select
                  value={formData.exang}
                  onChange={(e) => setFormData({ ...formData, exang: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                  <option value={1}>Yes (Angina Induced)</option>
                  <option value={0}>No</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>ST Oldpeak (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.oldpeak}
                  onChange={(e) => setFormData({ ...formData, oldpeak: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Major Vessels (ca: 0-3)</label>
                <select
                  value={formData.ca}
                  onChange={(e) => setFormData({ ...formData, ca: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                  <option value={0}>0 Major Vessels Colored</option>
                  <option value={1}>1 Vessel Colored</option>
                  <option value={2}>2 Vessels Colored</option>
                  <option value={3}>3 Vessels Colored</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Thalassemia (thal)</label>
                <select
                  value={formData.thal}
                  onChange={(e) => setFormData({ ...formData, thal: parseInt(e.target.value) || 2 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                  <option value={1}>1: Normal Blood Flow</option>
                  <option value={2}>2: Fixed Defect</option>
                  <option value={3}>3: Reversible Defect</option>
                </select>
              </div>
            </div>

            {/* ECG Image Uploader */}
            <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                📸 Upload ECG Strip Image (Optional)
              </label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '0.8rem' }} />
              {imagePreview && (
                <div style={{ marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live ECG Waveform Preview:</p>
                  <img src={imagePreview} alt="ECG Preview" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Running XGBoost Inference...' : '⚡ Run XGBoost Heart AI Predictor'}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Results & Feature Importance */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            2. XGBoost AI Diagnostic Report
          </h3>

          {result ? (
            <div>
              {/* Score Display Box */}
              <div style={{
                background: result.risk_color === 'purple' ? '#f3e8ff' :
                            result.risk_color === 'rose' ? '#ffe4e6' :
                            result.risk_color === 'amber' ? '#fef3c7' : '#dcfce7',
                padding: '1.25rem',
                borderRadius: '10px',
                textAlign: 'center',
                marginBottom: '1.25rem'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  HEART DISEASE PROBABILITY
                </span>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, margin: '0.25rem 0' }}>
                  {result.risk_percentage}%
                </h2>
                <span className={`pill-badge ${
                  result.risk_color === 'purple' || result.risk_color === 'rose' ? 'pill-danger' :
                  result.risk_color === 'amber' ? 'pill-warning' : 'pill-success'
                }`} style={{ fontSize: '0.9rem', padding: '0.35rem 1rem' }}>
                  {result.risk_category}
                </span>

                {result.tabular_xgb_risk !== undefined && (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                    <span style={{ background: '#ffffffcc', padding: '3px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                      📊 Tabular XGBoost: {(result.tabular_xgb_risk * 100).toFixed(1)}%
                    </span>
                    {result.ecg_xgb_risk !== null && result.ecg_xgb_risk !== undefined && (
                      <span style={{ background: '#ffffffcc', padding: '3px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f766e' }}>
                        📸 ECG Vision AI: {(result.ecg_xgb_risk * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Extracted ECG Metrics */}
              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  📈 ECG Waveform Signals Extracted:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>ST Deviation: <strong>{result.ecg_metrics?.st_deviation_mm} mm</strong></div>
                  <div>QRS Duration: <strong>{result.ecg_metrics?.qrs_duration_ms} ms</strong></div>
                  <div>HRV Metric: <strong>{result.ecg_metrics?.hrv_ms} ms</strong></div>
                  <div>Detected R-Peaks: <strong>{result.ecg_metrics?.detected_r_peaks}</strong></div>
                </div>
              </div>

              {/* Feature Importances */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  📊 XGBoost Feature Importance Breakdown:
                </h4>
                {result.feature_importances?.map((feat, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span>{feat.feature}</span>
                      <span>{feat.impact}</span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${feat.importance * 100}%`, background: 'var(--primary)', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  💡 Suggested Clinical Considerations (AI Decision Support):
                </h4>
                <ul style={{ fontSize: '0.8rem', paddingLeft: '1.2rem', color: 'var(--text-main)', margin: 0 }}>
                  {result.recommendations?.map((rec, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Physician Review & Sign-Off Actions */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: '#92400e', textTransform: 'uppercase' }}>⚠️ Physician Review Required</strong>
                  <span style={{ fontSize: '11px', color: '#b45309' }}>Clinical Decision Support Only</span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#78350f' }}>
                  AI predictive risk metrics are intended solely for clinical guidance and do not replace professional physician judgment.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => alert(`✓ Clinical Decision Support assessment accepted and signed by ${user?.name || 'Dr. Sarah Jenkins'} at ${new Date().toLocaleTimeString()}`)}
                    className="btn-primary"
                    style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                  >
                    ✓ Accept & Sign
                  </button>
                  <button
                    onClick={() => alert('Modify parameters in clinical form to re-run inference.')}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Modify
                  </button>
                  <button
                    onClick={() => alert('Assessment dismissed from active patient record.')}
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Click run prediction to view results.</p>
          )}
        </div>
      </div>
    </div>
  );
}
