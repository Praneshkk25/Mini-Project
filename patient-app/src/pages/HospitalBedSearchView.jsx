import React, { useState, useEffect } from 'react';
import {
  Truck,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle,
  Activity,
  AlertOctagon,
  Navigation
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function HospitalBedSearchView() {
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ambulance Dispatch Modal & Tracking State
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [ambForm, setAmbForm] = useState({
    patient_name: '',
    patient_phone: '',
    pickup_address: '',
    emergency_type: 'Cardiac / Acute Chest Pain',
    ambulance_type: 'Advanced Life Support (ALS ICU)'
  });

  const cities = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Chennai', 'All'];

  useEffect(() => {
    fetchHospitals(selectedCity);
  }, [selectedCity]);

  const fetchHospitals = async (city) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/city-wide/hospitals?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data.hospitals || []);
        if (data.hospitals && data.hospitals.length > 0) {
          setSelectedHospital(data.hospitals[0]);
        } else {
          setSelectedHospital(null);
        }
      }
    } catch (e) {
      console.error('Error fetching city hospitals:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchAmbulance = async (e) => {
    e.preventDefault();
    if (!ambForm.patient_name || !ambForm.patient_phone || !ambForm.pickup_address) {
      alert('Please enter patient name, phone number, and pickup address.');
      return;
    }

    setDispatching(true);
    try {
      const res = await fetch(`${API_BASE}/ambulance/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ambForm,
          destination_hospital: selectedHospital?.name || 'AuraHealth Central Hospital'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveDispatch(data.dispatch);
        setShowAmbulanceModal(false);
      } else {
        alert('Failed to dispatch ambulance. Please call emergency hotline directly.');
      }
    } catch (err) {
      alert('Network error connecting to Emergency Ambulance Dispatch gateway.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🏥 City Hospital Bed Search & Emergency Ambulance</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time ICU bed lookup with 1-Click Emergency Ambulance Call & Live GPS Dispatch
          </p>
        </div>

        {/* SOS One-Click Ambulance Trigger */}
        <button
          onClick={() => setShowAmbulanceModal(true)}
          style={{
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239,68,68,0.35)'
          }}
        >
          🚑 CALL EMERGENCY AMBULANCE
        </button>
      </div>

      {/* Active Ambulance Tracking Banner */}
      {activeDispatch && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            borderRadius: '16px',
            border: '1px solid #ef4444',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(239,68,68,0.2)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #334155', paddingBottom: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#ef4444', padding: '10px', borderRadius: '10px' }}>
                <Truck size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  LIVE EN ROUTE
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>
                  Ambulance {activeDispatch.vehicle_number} &bull; ETA: {activeDispatch.eta_minutes} Mins
                </h3>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dispatch Ticket</span>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8' }}>{activeDispatch.dispatch_id}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Patient:</span>
              <div style={{ fontWeight: 700 }}>{activeDispatch.patient_name} ({activeDispatch.patient_phone})</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Driver & Helpline:</span>
              <div style={{ fontWeight: 700, color: '#34d399' }}>{activeDispatch.driver_name} &bull; {activeDispatch.driver_phone}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Destination Hospital:</span>
              <div style={{ fontWeight: 700 }}>{activeDispatch.destination_hospital}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Pickup Address:</span>
              <div style={{ fontWeight: 700 }}>{activeDispatch.pickup_address}</div>
            </div>
          </div>
        </div>
      )}

      {/* City Selector Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>SELECT CITY:</span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`btn-${selectedCity === city ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
            >
              📍 {city}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Searching hospitals in {selectedCity}...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1.5rem' }}>
          {/* Left Column: Hospital List */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Hospitals Found ({hospitals.length})
            </h3>

            {hospitals.map((hosp) => (
              <div
                key={hosp.id || hosp.name}
                onClick={() => setSelectedHospital(hosp)}
                className="card"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  borderLeft: selectedHospital?.name === hosp.name ? '5px solid var(--primary)' : '1px solid var(--border-color)',
                  background: selectedHospital?.name === hosp.name ? '#f0fdf4' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{hosp.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      📍 {hosp.address} ({hosp.distance_km} km away)
                    </p>
                  </div>
                  <span className="pill-badge pill-info" style={{ whiteSpace: 'nowrap' }}>
                    {hosp.distance_km} km
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                  <span className="pill-badge pill-success">
                    ICU: {hosp.icu_available}/{hosp.icu_total} Free
                  </span>
                  <span className="pill-badge pill-info">
                    Oxygen: {hosp.oxygen_available}/{hosp.oxygen_total} Free
                  </span>
                  <span className="pill-badge pill-warning">
                    General: {hosp.general_available}/{hosp.general_total} Free
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Detailed Telemetry & Ambulance Pre-booking */}
          {selectedHospital ? (
            <div className="card">
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <span className="pill-badge pill-success" style={{ marginBottom: '0.5rem' }}>SELECTED FACILITY</span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedHospital.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  📍 {selectedHospital.address}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  📞 Emergency Helpline: {selectedHospital.phone}
                </p>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                🛏️ Real-Time Bed Availability Breakdown:
              </h4>

              {/* ICU Beds */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span>ICU Beds (Intensive Care)</span>
                  <span style={{ color: 'var(--success)' }}>
                    {selectedHospital.icu_available} / {selectedHospital.icu_total} Available
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(selectedHospital.icu_available / selectedHospital.icu_total) * 100}%`,
                    background: 'var(--success)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              {/* Oxygen Beds */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span>Oxygen & Emergency Beds</span>
                  <span style={{ color: 'var(--accent-blue)' }}>
                    {selectedHospital.oxygen_available} / {selectedHospital.oxygen_total} Available
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(selectedHospital.oxygen_available / selectedHospital.oxygen_total) * 100}%`,
                    background: 'var(--accent-blue)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => setShowAmbulanceModal(true)}
                  style={{ flex: 1, justifyContent: 'center', background: '#ef4444' }}
                >
                  🚑 Dispatch Ambulance Here
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => alert(`Dialing Emergency Desk for ${selectedHospital.name}: ${selectedHospital.phone}`)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  📞 Call Hospital Desk
                </button>
              </div>
            </div>
          ) : (
            <div className="card">Select a hospital to view real-time bed breakdown.</div>
          )}
        </div>
      )}

      {/* Ambulance Dispatch Modal */}
      {showAmbulanceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '560px', padding: '28px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#ef4444', color: '#fff', padding: '10px', borderRadius: '10px' }}>
                <Truck size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Emergency Ambulance Request
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Immediate triage response & Live GPS dispatch to {selectedHospital?.name || 'Nearest Hospital'}
                </span>
              </div>
            </div>

            <form onSubmit={handleDispatchAmbulance}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={ambForm.patient_name}
                    onChange={(e) => setAmbForm({ ...ambForm, patient_name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Emergency Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={ambForm.patient_phone}
                      onChange={(e) => setAmbForm({ ...ambForm, patient_phone: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Emergency Type</label>
                    <select
                      value={ambForm.emergency_type}
                      onChange={(e) => setAmbForm({ ...ambForm, emergency_type: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option>Cardiac / Acute Chest Pain</option>
                      <option>Trauma / Severe Accident</option>
                      <option>Respiratory Distress</option>
                      <option>Stroke / Neurological</option>
                      <option>Maternity Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Current Patient Location / Pickup Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter full address, apartment / street / landmark..."
                    value={ambForm.pickup_address}
                    onChange={(e) => setAmbForm({ ...ambForm, pickup_address: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button type="button" onClick={() => setShowAmbulanceModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dispatching}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {dispatching ? 'Dispatching...' : '🚨 Confirm & Dispatch Now'}
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
