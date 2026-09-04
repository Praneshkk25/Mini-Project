import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000/api';

export default function BedReservationView() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambulance Dispatch State
  const [showAmbModal, setShowAmbModal] = useState(false);
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [ambForm, setAmbForm] = useState({
    patient_name: '',
    patient_phone: '',
    pickup_address: '',
    emergency_type: 'Trauma / Critical Care',
    ambulance_type: 'Advanced Cardiac ALS'
  });

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const res = await fetch(`${API_BASE}/beds/status`);
      if (res.ok) {
        const data = await res.json();
        setBeds(data.beds || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/ambulance/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ambForm)
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDispatch(data.dispatch);
        setShowAmbModal(false);
      }
    } catch (err) {
      alert('Dispatch failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🛏️ Inpatient Bed Matrix & Ambulance Dispatch</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time bed allocation grid across ICU, General Ward, Emergency, and Ambulance Dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAmbModal(true)}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🚑 Dispatch Ambulance
          </button>
          <button className="btn-secondary" onClick={fetchBeds}>🔄 Refresh Grid</button>
        </div>
      </div>

      {activeDispatch && (
        <div style={{ background: '#0f172a', color: '#fff', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '5px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                AMBULANCE EN ROUTE ({activeDispatch.vehicle_number})
              </span>
              <h4 style={{ margin: '6px 0 0', fontSize: '16px' }}>
                Driver: {activeDispatch.driver_name} ({activeDispatch.driver_phone}) &bull; ETA: {activeDispatch.eta_minutes} mins
              </h4>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>{activeDispatch.dispatch_id}</span>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ward Bed Matrix</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{beds.filter(b => b.status === 'Available').length} Available</span>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading beds...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {beds.map((bed) => (
              <div
                key={bed.id || bed.bed_number}
                style={{
                  padding: '1.2rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: bed.status === 'Available' ? '#f0fdf4' :
                              bed.status === 'Occupied' ? '#fff1f2' : '#fefce8',
                  textAlign: 'center'
                }}
              >
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{bed.bed_number}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' }}>{bed.ward_type}</p>
                <span className={`pill-badge ${
                  bed.status === 'Available' ? 'pill-success' :
                  bed.status === 'Occupied' ? 'pill-danger' : 'pill-warning'
                }`}>
                  {bed.status}
                </span>
                {bed.patient_name && (
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    {bed.patient_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAmbModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '500px', padding: '24px', background: '#fff' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: 800 }}>🚑 Emergency Ambulance Dispatch</h3>
            <form onSubmit={handleDispatch}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={ambForm.patient_name}
                    onChange={(e) => setAmbForm({ ...ambForm, patient_name: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={ambForm.patient_phone}
                    onChange={(e) => setAmbForm({ ...ambForm, patient_phone: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Pickup Location *</label>
                  <input
                    type="text"
                    required
                    value={ambForm.pickup_address}
                    onChange={(e) => setAmbForm({ ...ambForm, pickup_address: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAmbModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700 }}>
                    Confirm Dispatch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
