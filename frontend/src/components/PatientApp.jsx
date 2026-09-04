import React, { useState, useEffect } from 'react';
import { MOCK_CITY_HOSPITALS } from '../mockData';

export default function PatientApp() {
  const [activeTab, setActiveTab] = useState('token'); // 'token' | 'beds' | 'discharge'
  const [language, setLanguage] = useState('English');
  
  // Live OPD Token State
  const [currentServing, setCurrentServing] = useState(11);
  const [userToken] = useState(15);
  const [avgConsultTime] = useState(4); // minutes per patient
  const [estWait, setEstWait] = useState(16);

  // Auto-refresh token every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServing(prev => {
        const next = prev >= 15 ? 11 : prev + 1;
        setEstWait(Math.max(0, (userToken - next) * avgConsultTime));
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [userToken, avgConsultTime]);

  // Bed Finder Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const filteredHospitals = MOCK_CITY_HOSPITALS.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (specialtyFilter === 'ICU') return matchesSearch && h.icuAvail > 0;
    if (specialtyFilter === 'Available') return matchesSearch && h.availBeds > 0;
    return matchesSearch;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Patient Sub-Header / Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`tab-btn ${activeTab === 'token' ? 'active' : ''}`}
            onClick={() => setActiveTab('token')}
          >
            🎟️ Live OPD Token
          </button>
          <button 
            className={`tab-btn ${activeTab === 'beds' ? 'active' : ''}`}
            onClick={() => setActiveTab('beds')}
          >
            🏥 Find Hospital Beds
          </button>
          <button 
            className={`tab-btn ${activeTab === 'discharge' ? 'active' : ''}`}
            onClick={() => setActiveTab('discharge')}
          >
            📄 My Discharge Summary
          </button>
        </div>

        {/* Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>🌐 Language:</span>
          {['English', 'Tamil', 'Hindi'].map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: language === lang ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                background: language === lang ? 'rgba(56,189,248,0.15)' : 'transparent',
                color: language === lang ? '#38bdf8' : '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Live OPD Token Tracker */}
      {activeTab === 'token' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Now Serving Token</span>
            <h1 style={{ fontSize: '64px', color: '#38bdf8', margin: '16px 0 8px 0', fontWeight: '800' }}>A-0{currentServing}</h1>
            <p style={{ fontSize: '14px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></span>
              Dr. Sarah Smith (General Medicine)
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Your Token Number</span>
            <h1 style={{ fontSize: '64px', color: '#f59e0b', margin: '16px 0 8px 0', fontWeight: '800' }}>A-0{userToken}</h1>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              {userToken - currentServing > 0 ? `${userToken - currentServing} patient(s) ahead of you` : 'It is your turn! Please enter Room 4.'}
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Estimated Wait Time</span>
            <h1 style={{ fontSize: '64px', color: '#a855f7', margin: '16px 0 8px 0', fontWeight: '800' }}>{estWait} <span style={{ fontSize: '24px' }}>mins</span></h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Updates live every 5s based on doctor pacing</p>
          </div>
        </div>
      )}

      {/* Tab 2: Hospital Bed Finder */}
      {activeTab === 'beds' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Search hospital by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: '1', padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
              />
              <select
                value={specialtyFilter}
                onChange={e => setSpecialtyFilter(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
              >
                <option value="All">All Hospitals</option>
                <option value="Available">Available Beds</option>
                <option value="ICU">Has ICU Beds</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '4px', background: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
              <button 
                onClick={() => setViewMode('list')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? '#3b82f6' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '13px' }}
              >
                📋 List View
              </button>
              <button 
                onClick={() => setViewMode('map')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'map' ? '#3b82f6' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '13px' }}
              >
                🗺️ Map Grid
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredHospitals.map(h => (
                <div key={h.id} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>{h.name}</h3>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: h.status === 'online' ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.2)', color: h.status === 'online' ? '#10b981' : '#94a3b8', border: `1px solid ${h.status === 'online' ? '#10b981' : '#94a3b8'}` }}>
                        {h.status === 'online' ? '● Live Feed' : '○ Offline'}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>📍 {h.distance} away | 🚨 Emergency Services {h.emergency ? 'Available' : 'Unavailable'}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8' }}>Available Beds</span>
                      <strong style={{ fontSize: '18px', color: h.availBeds > 0 ? '#10b981' : '#ef4444' }}>{h.availBeds} / {h.totalBeds}</strong>
                    </div>
                    <div style={{ textAlign: 'right', borderLeft: '1px solid #334155', paddingLeft: '16px' }}>
                      <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8' }}>ICU Beds</span>
                      <strong style={{ fontSize: '18px', color: h.icuAvail > 0 ? '#38bdf8' : '#ef4444' }}>{h.icuAvail} Available</strong>
                    </div>
                    <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                      Book / Inquire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)', borderRadius: '12px', border: '1px dashed #475569' }}>
                <div>
                  <span style={{ fontSize: '40px' }}>🗺️</span>
                  <p style={{ color: '#cbd5e1', marginTop: '10px' }}>Interactive City Hospital Heatmap Grid</p>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{filteredHospitals.length} hospital markers loaded</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Discharge Summary */}
      {activeTab === 'discharge' && (
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>My Official Hospital Discharge Record</h2>
            <button 
              onClick={() => window.print()}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              📥 Download Official PDF
            </button>
          </div>
          <div style={{ background: '#fff', color: '#000', padding: '30px', borderRadius: '8px' }}>
            <h3 style={{ margin: 0, color: '#1e3a8a' }}>City Central Multispecialty Hospital</h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 16px 0' }}>Patient Discharge Card | Record ID: DS-2026-9812</p>
            <hr />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', fontSize: '14px' }}>
              <p><strong>Patient Name:</strong> Ramesh Kumar</p>
              <p><strong>UHID:</strong> UH-88910</p>
              <p><strong>Diagnosis:</strong> Acute Gastritis & Dehydration</p>
              <p><strong>Discharge Date:</strong> 31-Jul-2026</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
