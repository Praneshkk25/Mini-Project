import React from 'react';
import { MOCK_CITY_HOSPITALS } from '../mockData';

export default function CityView() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#f8fafc' }}>City-Wide Hospital Capacity & Dispatch Control</h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>Real-time regional telemetry feed of emergency ICU and General Bed availability</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: '6px 14px', borderRadius: '20px', color: '#10b981', fontSize: '13px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          Regional Network Synchronized
        </div>
      </div>

      {/* Ambulance Dispatch Suggestion Card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(185,28,28,0.15) 100%)', border: '1.5px solid #ef4444', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🚨 Emergency Routing Recommendation</span>
          <h3 style={{ margin: '8px 0 4px 0', color: '#fff' }}>City Central Multispecialty Hospital</h3>
          <p style={{ margin: 0, color: '#fca5a5', fontSize: '13px' }}>
            Nearest facility with verified available ICU beds (4 ICU beds | 1.2 km away | Est. Ambulance Transit: 6 mins)
          </p>
        </div>
        <button style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}>
          Dispatch Ambulance Route 🚑
        </button>
      </div>

      {/* Regional Hospital Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {MOCK_CITY_HOSPITALS.map(h => (
          <div key={h.id} style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{h.name}</h4>
                <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: h.status === 'online' ? '#10b981' : '#94a3b8' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: h.status === 'online' ? '#10b981' : '#94a3b8' }}></span>
                  {h.status === 'online' ? 'Live' : 'Offline'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>📍 {h.distance} away | Emergency Bay: {h.emergency ? 'Ready' : 'Full'}</p>
            </div>

            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'center' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>Total Avail. Beds</span>
                <strong style={{ fontSize: '20px', color: h.availBeds > 0 ? '#10b981' : '#ef4444' }}>{h.availBeds}</strong>
              </div>
              <div style={{ borderLeft: '1px solid #334155' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>ICU Beds</span>
                <strong style={{ fontSize: '20px', color: h.icuAvail > 0 ? '#38bdf8' : '#ef4444' }}>{h.icuAvail}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
