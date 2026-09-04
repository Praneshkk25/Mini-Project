import React, { useState } from 'react';
import { MOCK_CITY_HOSPITALS } from '../../data/mockData';
import StatusBadge from '../../components/common/StatusBadge';

export default function CityView() {
  const [hospitals, setHospitals] = useState(MOCK_CITY_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);

  // Find nearest hospital with available ICU bed for ambulance smart routing card
  const nearestIcuHospital = hospitals
    .filter(h => h.status === 'online' && h.icuAvail > 0)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))[0];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
            🏙️ City-Wide Healthcare Integration & Live Bed Grid
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
            Inter-hospital bed availability heat grid, live sync monitoring, and emergency ambulance smart routing.
          </p>
        </div>
        <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', color: '#38bdf8' }}>
          📡 Integrated City Nodes: <strong>{hospitals.filter(h => h.status === 'online').length} / {hospitals.length} Online</strong>
        </div>
      </div>

      {/* 1. Emergency Ambulance Smart Routing Suggestion Card */}
      {nearestIcuHospital && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.25) 100%)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#ef4444',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              🚑
            </div>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#fca5a5', fontWeight: '700', letterSpacing: '1px' }}>
                AI AMBULANCE SMART ROUTING RECOMMENDATION
              </div>
              <h3 style={{ margin: '2px 0 4px 0', fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
                {nearestIcuHospital.name}
              </h3>
              <div style={{ fontSize: '13px', color: '#fecdd3' }}>
                📍 Distance: <strong>{nearestIcuHospital.distance}</strong> | 🔴 Available ICU Beds: <strong style={{ color: '#fff' }}>{nearestIcuHospital.icuAvail} Beds Free</strong>
              </div>
            </div>
          </div>

          <button style={{
            padding: '12px 24px',
            background: '#ffffff',
            color: '#dc2626',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            🚨 Dispatch Ambulance to {nearestIcuHospital.name}
          </button>
        </div>
      )}

      {/* 2. Main Grid Layout: Hospital Heatmap Grid + Hospital Focus Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '28px' }}>
        
        {/* Hospital Beds Heatmap Matrix */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>
              Hospital Bed Availability Heat Indicators
            </h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>🟢 High Avail (&gt;20%)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>🟡 Low Avail (&lt;10%)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>🔴 Critical (0 Beds)</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {hospitals.map(h => {
              const isSelected = selectedHospital.id === h.id;
              const availPercent = (h.availBeds / h.totalBeds) * 100;
              const heatColor = availPercent > 15 ? '#10b981' : availPercent > 0 ? '#f59e0b' : '#ef4444';

              return (
                <div 
                  key={h.id}
                  onClick={() => setSelectedHospital(h)}
                  style={{
                    background: isSelected ? '#0f172a' : '#1e293b',
                    border: isSelected ? '2px solid #06b6d4' : '1px solid #334155',
                    borderLeft: `6px solid ${heatColor}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '15px' }}>{h.name}</h4>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>📍 {h.distance} away</span>
                    </div>
                    {/* Live Sync Status Indicator Dot */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: h.status === 'online' ? '#10b981' : '#9ca3af' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: h.status === 'online' ? '#10b981' : '#64748b' }}></span>
                      {h.status === 'online' ? 'Live Sync' : 'Offline'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Total Beds:</span> <strong style={{ color: '#fff' }}>{h.totalBeds}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Avail Beds:</span> <strong style={{ color: heatColor }}>{h.availBeds} Free</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>ICU Avail:</span> <strong style={{ color: h.icuAvail > 0 ? '#10b981' : '#ef4444' }}>{h.icuAvail} Beds</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Emergency:</span> <strong style={{ color: h.emergency ? '#10b981' : '#9ca3af' }}>{h.emergency ? 'Active' : 'No'}</strong>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Hospital Detailed Inspector Card */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#38bdf8', fontSize: '18px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
            🔎 Node Inspector: {selectedHospital.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#cbd5e1' }}>
            <div>
              <span style={{ color: '#64748b' }}>Sync Status:</span> <StatusBadge status={selectedHospital.status} />
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Address:</span> <div><strong>{selectedHospital.address}</strong></div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Helpline Phone:</span> <div><strong style={{ color: '#38bdf8' }}>{selectedHospital.contact}</strong></div>
            </div>

            <div style={{ marginTop: '10px', background: '#0f172a', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>Ward Bed Breakdown</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🔴 ICU Trauma Beds:</span> <strong>{selectedHospital.icuAvail} Available</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🛏️ General Medical Beds:</span> <strong>{selectedHospital.generalAvail} Available</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>👶 Maternity & Pediatric Beds:</span> <strong>{selectedHospital.maternityAvail} Available</strong>
              </div>
            </div>

            <button style={{
              marginTop: '10px',
              padding: '12px',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer'
            }}>
              🔄 Trigger Manual Sync Ping
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
