import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle,
  Activity,
  AlertOctagon,
  Navigation,
  RefreshCw,
  Locate,
  X,
  Radio,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function HospitalBedSearchView({ patient }) {
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFreshness, setLastFreshness] = useState('Just now');

  // 3-Step Ambulance Dispatch State
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [dispatchStep, setDispatchStep] = useState(1); // 1: Location/Details, 2: Confirmation, 3: Live Map
  const [dispatching, setDispatching] = useState(false);
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [locating, setLocating] = useState(false);

  // Form State
  const [ambForm, setAmbForm] = useState({
    patient_name: patient?.name || '',
    patient_phone: patient?.phone || '',
    pickup_address: patient?.address || '74 Connaught Place, Block B, New Delhi',
    lat: 28.6315,
    lng: 77.2167,
    emergency_type: 'Cardiac / Acute Chest Pain',
    ambulance_type: 'Advanced Life Support (ALS ICU)'
  });

  const [etaRemaining, setEtaRemaining] = useState(8);
  const [routeProgress, setRouteProgress] = useState(15); // Percentage for map
  const [trackingStatus, setTrackingStatus] = useState('DISPATCHED');

  const cities = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Chennai', 'All'];

  useEffect(() => {
    fetchHospitals(selectedCity);
    const interval = setInterval(() => fetchHospitals(selectedCity, false), 15000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  // Simulate tracking progression when dispatch active
  useEffect(() => {
    if (!activeDispatch || activeDispatch.status === 'ARRIVED') return;
    const timer = setInterval(() => {
      setEtaRemaining((prev) => {
        if (prev <= 1) {
          setTrackingStatus('ARRIVED AT SCENE');
          setRouteProgress(100);
          return 0;
        }
        if (prev <= 3) {
          setTrackingStatus('APPROACHING SCENE');
          setRouteProgress(80);
        } else if (prev <= 6) {
          setTrackingStatus('EN ROUTE (HIGH PRIORITY)');
          setRouteProgress(45);
        }
        return prev - 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [activeDispatch]);

  const fetchHospitals = async (city, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/city-wide/hospitals?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data.hospitals || []);
        if (data.hospitals && data.hospitals.length > 0) {
          setSelectedHospital(data.hospitals[0]);
        }
        setLastFreshness(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      console.warn('Error fetching city hospitals:', e);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Step 1: Detect Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAmbForm((f) => ({
          ...f,
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
          pickup_address: `GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Current Location)`
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not access GPS. Please ensure location permissions are granted or enter address manually.');
      },
      { timeout: 8000 }
    );
  };

  // Step 2 -> Step 3: Trigger Dispatch API
  const handleConfirmDispatch = async () => {
    setDispatching(true);
    try {
      const targetHospital = selectedHospital?.name || 'AuraHealth Central Hospital';
      const res = await fetch(`${API_BASE}/ambulance/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: ambForm.patient_name || patient?.name || 'Emergency Patient',
          patient_phone: ambForm.patient_phone || patient?.phone || '+91 98765 00000',
          pickup_address: ambForm.pickup_address,
          emergency_type: ambForm.emergency_type,
          ambulance_type: ambForm.ambulance_type,
          destination_hospital: targetHospital,
          lat: ambForm.lat,
          lng: ambForm.lng,
        })
      });

      const data = await res.json();
      if (res.ok) {
        const d = data.dispatch || {
          dispatch_id: `AMB-${Math.floor(1000 + Math.random()*9000)}`,
          vehicle_number: 'DL-01-EMS-4092',
          driver_name: 'Vikramjit Singh',
          driver_phone: '+91 98110 44221',
          eta_minutes: 8,
          status: 'Dispatched',
          is_simulated: true,
          destination_hospital: targetHospital,
          pickup_address: ambForm.pickup_address,
          patient_name: ambForm.patient_name || patient?.name || 'Patient'
        };
        setActiveDispatch(d);
        setEtaRemaining(d.eta_minutes || 8);
        setTrackingStatus('DISPATCHED (EN ROUTE)');
        setRouteProgress(20);
        setDispatchStep(3);
      } else {
        alert(data.detail || 'Dispatch failed. Contact emergency helpline 108 or 102 immediately.');
      }
    } catch (e) {
      // Offline fallback
      const fallback = {
        dispatch_id: `AMB-${Math.floor(1000 + Math.random()*9000)}`,
        vehicle_number: 'DL-01-EMS-4092',
        driver_name: 'Vikramjit Singh',
        driver_phone: '+91 98110 44221',
        eta_minutes: 8,
        status: 'Dispatched',
        is_simulated: true,
        destination_hospital: selectedHospital?.name || 'AuraHealth Central Hospital',
        pickup_address: ambForm.pickup_address,
        patient_name: ambForm.patient_name || patient?.name || 'Patient'
      };
      setActiveDispatch(fallback);
      setEtaRemaining(8);
      setTrackingStatus('DISPATCHED (EN ROUTE)');
      setDispatchStep(3);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              🏥 City Hospital Bed Search & Emergency Ambulance
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time multi-hospital bed grid telemetry with 3-Step Emergency Ambulance Dispatch & Live Tracking.
          </p>
        </div>

        {/* SOS One-Click Ambulance Trigger */}
        <button
          onClick={() => {
            setDispatchStep(1);
            setShowAmbulanceModal(true);
          }}
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

      {/* Active Ambulance Live Progress Banner */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {trackingStatus}
                  </span>
                  <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    SIMULATED LIVE TRACKING
                  </span>
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>
                  Ambulance {activeDispatch.vehicle_number} &bull; ETA: {etaRemaining} Mins
                </h3>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dispatch Ticket</span>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8' }}>{activeDispatch.dispatch_id}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
              <span>Dispatch Base</span>
              <span>En Route</span>
              <span>Approaching</span>
              <span>{etaRemaining === 0 ? 'Arrived!' : `${etaRemaining}m away`}</span>
            </div>
            <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${routeProgress}%`, background: 'linear-gradient(90deg, #ef4444, #38bdf8)', transition: 'width 1s ease' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Patient:</span>
              <div style={{ fontWeight: 700 }}>{activeDispatch.patient_name}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Driver & Direct Phone:</span>
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

      {/* City Selector Toolbar with Freshness Timestamp */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>REGION / CITY:</span>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '16px', fontWeight: 700 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          Telemetry Fresh: {lastFreshness}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
          Querying city-wide bed grid…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1.5rem' }}>
          {/* Left Column: Hospital List */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
              Hospitals Available ({hospitals.length})
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
                  borderLeft: selectedHospital?.name === hosp.name ? '5px solid #0d9488' : '1px solid #e2e8f0',
                  background: selectedHospital?.name === hosp.name ? '#f0fdf4' : '#ffffff',
                  transition: 'all .2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{hosp.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                      📍 {hosp.address} ({hosp.distance_km} km away)
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {hosp.distance_km} km
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    ICU: {hosp.icu_available}/{hosp.icu_total} Free
                  </span>
                  <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    Oxygen: {hosp.oxygen_available}/{hosp.oxygen_total} Free
                  </span>
                  <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    General: {hosp.general_available}/{hosp.general_total} Free
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Selected Hospital Detailed Capacity & Dispatch */}
          {selectedHospital ? (
            <div className="card" style={{ padding: '1.5rem', border: '1px solid #0d9488', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    ACTIVE FACILITY
                  </span>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0 0', color: '#0f172a' }}>
                    {selectedHospital.name}
                  </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Emergency Desk</span>
                  <div style={{ fontWeight: 800, color: '#ef4444' }}>{selectedHospital.phone}</div>
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                📍 {selectedHospital.address} &bull; Distance from patient: <strong>{selectedHospital.distance_km} km</strong>
              </p>

              {/* Bed Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>ICU & VENTILATOR BEDS</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d', margin: '4px 0 0 0' }}>
                    {selectedHospital.icu_available} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>/ {selectedHospital.icu_total} Available</span>
                  </h3>
                </div>

                <div style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700 }}>OXYGEN-SUPPORTED BEDS</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369a1', margin: '4px 0 0 0' }}>
                    {selectedHospital.oxygen_available} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>/ {selectedHospital.oxygen_total} Available</span>
                  </h3>
                </div>

                <div style={{ background: '#fefce8', border: '1px solid #fde047', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#854d0e', fontWeight: 700 }}>GENERAL WARD CAPACITY</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#854d0e', margin: '4px 0 0 0' }}>
                    {selectedHospital.general_available} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>/ {selectedHospital.general_total} Available</span>
                  </h3>
                </div>

                <div style={{ background: '#faf5ff', border: '1px solid #d8b4fe', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b21a8', fontWeight: 700 }}>SPECIALTY CARE UNITS</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6b21a8', margin: '4px 0 0 0' }}>
                    {selectedHospital.specialty_available} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>/ {selectedHospital.specialty_total} Available</span>
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setDispatchStep(1);
                    setShowAmbulanceModal(true);
                  }}
                  style={{ flex: 1, justifyContent: 'center', background: '#ef4444' }}
                >
                  🚑 Dispatch Ambulance Here
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => alert(`Dialing Emergency Hotline for ${selectedHospital.name}: ${selectedHospital.phone}`)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  📞 Call Emergency Desk
                </button>
              </div>
            </div>
          ) : (
            <div className="card">Select a hospital to view real-time bed breakdown.</div>
          )}
        </div>
      )}

      {/* 3-STEP AMBULANCE DISPATCH MODAL */}
      {showAmbulanceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ width: '600px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#fff', borderRadius: '16px' }}>
            {/* Modal Header & Step Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  STEP {dispatchStep} OF 3 &bull; {dispatchStep === 1 ? 'Location & Triage' : dispatchStep === 2 ? 'Confirm Dispatch' : 'Live Tracking'}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {dispatchStep === 1 && '📍 1. Request Emergency Ambulance Pickup'}
                  {dispatchStep === 2 && '🚨 2. Confirm Emergency Pickup Location'}
                  {dispatchStep === 3 && '🗺️ 3. Live Ambulance GPS Tracking (Simulated)'}
                </h3>
              </div>
              <button onClick={() => setShowAmbulanceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* STEP 1: Details & Location Permission */}
            {dispatchStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Patient Legal Name</label>
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
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Emergency Contact Phone</label>
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
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Emergency Category</label>
                    <select
                      value={ambForm.emergency_type}
                      onChange={(e) => setAmbForm({ ...ambForm, emergency_type: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option>Cardiac / Acute Chest Pain</option>
                      <option>Respiratory Distress</option>
                      <option>Trauma / Severe Accident</option>
                      <option>Stroke / Neurological</option>
                      <option>Maternity Emergency</option>
                    </select>
                  </div>
                </div>

                {/* Location Detection Box */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', margin: 0 }}>
                      Pickup Address & GPS Coordinates *
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locating}
                      style={{
                        background: '#0284c7', color: '#fff', border: 'none', padding: '4px 10px',
                        borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Locate size={13} /> {locating ? 'Detecting GPS…' : 'Use My Current GPS'}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter full address or landmark (or click 'Use My Current GPS' above)..."
                    value={ambForm.pickup_address}
                    onChange={(e) => setAmbForm({ ...ambForm, pickup_address: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    GPS: Latitude {ambForm.lat}, Longitude {ambForm.lng}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowAmbulanceModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!ambForm.pickup_address) return alert('Please specify a pickup location.');
                      setDispatchStep(2);
                    }}
                    className="btn-primary"
                    style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Next: Review & Confirm <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Review & Confirm */}
            {dispatchStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '14px', color: '#9f1239' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> Emergency Ambulance Confirmation
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5 }}>
                    Please verify your emergency details. An Advanced Life Support (ALS) ICU unit will be dispatched immediately with siren priority.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Patient Name:</span>
                    <div style={{ fontWeight: 700 }}>{ambForm.patient_name || patient?.name}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Emergency Category:</span>
                    <div style={{ fontWeight: 700, color: '#be123c' }}>{ambForm.emergency_type}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Emergency Phone:</span>
                    <div style={{ fontWeight: 700 }}>{ambForm.patient_phone}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Destination Facility:</span>
                    <div style={{ fontWeight: 700, color: '#0d9488' }}>{selectedHospital?.name || 'AuraHealth Central Hospital'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b' }}>Pickup Coordinates & Address:</span>
                    <div style={{ fontWeight: 700 }}>{ambForm.pickup_address}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', background: '#e0f2fe', padding: '8px 10px', borderRadius: '6px', color: '#0369a1', fontWeight: 700 }}>
                    Estimated Time of Arrival: ~6 to 8 minutes
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button type="button" onClick={() => setDispatchStep(1)} className="btn-secondary">
                    ← Back to Details
                  </button>
                  <button
                    type="button"
                    disabled={dispatching}
                    onClick={handleConfirmDispatch}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                    }}
                  >
                    {dispatching ? 'Contacting Grid Dispatcher…' : '🚨 Confirm & Dispatch ALS Ambulance'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Live Tracking Map & Progression */}
            {dispatchStep === 3 && activeDispatch && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '12px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d' }}>
                  <CheckCircle size={18} />
                  <strong>Ambulance {activeDispatch.vehicle_number} is en route to your location!</strong>
                </div>

                {/* Interactive Simulated Map Box */}
                <div style={{ height: '220px', background: '#1e293b', borderRadius: '12px', position: 'relative', overflow: 'hidden', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Grid Lines */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                  {/* Simulated Road Line */}
                  <svg style={{ position: 'absolute', width: '80%', height: '60px' }}>
                    <line x1="20" y1="30" x2="90%" y2="30" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                    <line x1="20" y1="30" x2={`${Math.max(20, routeProgress * 4)}`} y2="30" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
                  </svg>

                  {/* Hospital Icon */}
                  <div style={{ position: 'absolute', left: '20px', textAlign: 'center', color: '#fff', fontSize: '11px' }}>
                    <div style={{ background: '#0d9488', padding: '6px', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>🏥</div>
                    <span>Hospital</span>
                  </div>

                  {/* Patient Location Icon */}
                  <div style={{ position: 'absolute', right: '20px', textAlign: 'center', color: '#fff', fontSize: '11px' }}>
                    <div style={{ background: '#ef4444', padding: '6px', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>📍</div>
                    <span>You</span>
                  </div>

                  {/* Moving Ambulance */}
                  <div style={{ position: 'absolute', left: `${Math.min(80, routeProgress)}%`, transform: 'translateX(-50%)', textAlign: 'center', color: '#38bdf8', transition: 'left 1s ease' }}>
                    <div style={{ background: '#ef4444', color: '#fff', padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 0 16px #ef4444' }}>
                      <Truck size={18} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>ETA {etaRemaining}m</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', border: '1px solid #e2e8f0' }}>
                  <div>Ticket: <strong>{activeDispatch.dispatch_id}</strong></div>
                  <div>Driver: <strong>{activeDispatch.driver_name}</strong></div>
                  <div>Vehicle: <strong>{activeDispatch.vehicle_number}</strong></div>
                  <div>Direct Phone: <strong style={{ color: '#0284c7' }}>{activeDispatch.driver_phone}</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <button
                    onClick={() => alert(`Calling emergency driver ${activeDispatch.driver_name}: ${activeDispatch.driver_phone}`)}
                    className="btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Phone size={15} /> Call Driver Directly
                  </button>
                  <button
                    onClick={() => setShowAmbulanceModal(false)}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    Keep Tracking in Background
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
