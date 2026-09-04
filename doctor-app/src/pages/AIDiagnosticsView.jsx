import React, { useState } from 'react';

export default function AIDiagnosticsView() {
  const [selectedScan, setSelectedScan] = useState('xray');
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🔬 AI Clinical Diagnostics & Radiology Viewer</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Deep Learning Scan Analysis (Chest X-Ray, CT Pulmo, Brain MRI)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Diagnostic Scan Input
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              className={`btn-${selectedScan === 'xray' ? 'primary' : 'secondary'}`}
              onClick={() => setSelectedScan('xray')}
            >
              Chest X-Ray
            </button>
            <button
              className={`btn-${selectedScan === 'ct' ? 'primary' : 'secondary'}`}
              onClick={() => setSelectedScan('ct')}
            >
              CT Pulmonary
            </button>
          </div>

          <div style={{
            background: '#0f172a',
            color: 'white',
            borderRadius: '10px',
            padding: '2rem',
            textAlign: 'center',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🩻</div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {selectedScan === 'xray' ? 'Chest PA View DICOM/JPEG' : 'CT Pulmo Contrast Scan'}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Patient MRN-884920 | Acquisition Date: 2026-08-14
            </span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            AI Radiological Findings
          </h3>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>PRIMARY FINDING:</span>
              <span className="pill-badge pill-success">No Acute Infiltrates (96.4%)</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Clear lung fields bilaterally. Cardiac silhouette size within normal physiological limits. No pneumothorax or pleural effusion detected.
            </p>
          </div>

          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Automated Radiologist Draft Note:</h4>
            <textarea
              defaultValue="Chest radiograph demonstrates clear lung parenchyma without focal consolidation. Mediastinal contours normal."
              rows={4}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
