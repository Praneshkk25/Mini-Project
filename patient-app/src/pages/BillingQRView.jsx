import React, { useState } from 'react';

export default function BillingQRView() {
  const [cleared, setCleared] = useState(false);
  const [data, setData] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [provider, setProvider] = useState('Star Health Care');
  const [claimAmount, setClaimAmount] = useState('');

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!patientName || !policyNumber) {
      alert('Please fill in your patient name and policy number.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/billing/clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
          patient_name: patientName,
          insurance_provider: provider,
          policy_number: policyNumber,
          claim_amount: parseFloat(claimAmount) || 25000.0
        })
      });

      if (res.ok) {
        const resData = await res.json();
        setData(resData);
        setCleared(true);
      } else {
        alert('Clearance verification returned error. Please check details.');
      }
    } catch (e) {
      alert('Clearance request failed. Ensure backend is running.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🧾 Insurance Billing Clearance & QR Download</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Instant insurance clearance verification and downloadable certified discharge summary with QR code
        </p>
      </div>

      <div className="card" style={{ maxWidth: '650px' }}>
        {!cleared ? (
          <form onSubmit={handleVerify}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Enter Insurance Claim Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Insurance Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                >
                  <option value="Star Health Care">Star Health Care</option>
                  <option value="HDFC ERGO">HDFC ERGO</option>
                  <option value="ICICI Lombard">ICICI Lombard</option>
                  <option value="Ayushman Bharat (PM-JAY)">Ayushman Bharat (PM-JAY)</option>
                  <option value="Max Bupa">Niva Bupa / Max Bupa</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Policy / TPA Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL-992019"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Estimated Claim Amount ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              🔍 Verify Insurance Clearance & Generate QR Code
            </button>
          </form>
        ) : (
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
            <span className="pill-badge pill-success" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', marginBottom: '1rem' }}>
              ✅ CLEARANCE APPROVED: {data.clearance_id}
            </span>

            {/* QR Code Container */}
            <div style={{
              width: '140px',
              height: '140px',
              background: '#0f172a',
              color: 'white',
              margin: '1rem auto',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '1px'
            }}>
              [ QR CODE ]
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Patient: <strong>{data.patient_name}</strong> &bull; Amount: <strong>${data.claim_amount}</strong>
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Verification Payload: {data.qr_verification_code}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setCleared(false)}>
                New Clearance
              </button>
              <button className="btn-primary" onClick={() => alert('Downloading Certified Discharge Summary PDF with QR Code...')}>
                📄 Download Discharge Summary PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
