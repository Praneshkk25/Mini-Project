import React, { useState } from 'react';

export default function DischargeApprovalView({ user }) {
  const [signed, setSigned] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [meds, setMeds] = useState('');

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📋 Discharge Summary Approval & Signing</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Attending Physician Final Review & Electronic QR Signature
        </p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Physician Electronic Discharge Sign-Off</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Patient Name</label>
            <input
              type="text"
              placeholder="e.g. Eleanor Vance"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>MRN / UHID</label>
            <input
              type="text"
              placeholder="e.g. UHID-2026-1001"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Primary Discharge Diagnosis</label>
            <input
              type="text"
              placeholder="Enter final clinical diagnosis..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Discharge Medications & Instructions</label>
            <textarea
              rows={3}
              placeholder="List prescribed medicines, dosage, and home care instructions..."
              value={meds}
              onChange={(e) => setMeds(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          {!signed ? (
            <button
              className="btn-primary"
              onClick={() => {
                if (!patientName || !diagnosis) {
                  alert('Please enter patient name and diagnosis before signing.');
                  return;
                }
                setSigned(true);
              }}
            >
              ✍️ Sign & Approve Discharge Summary
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="pill-badge pill-success">
                ✅ Electronic Signature Verified ({user?.name || 'Dr. Sarah Jenkins'})
              </span>
              <button className="btn-secondary" onClick={() => setSigned(false)}>
                Edit Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
