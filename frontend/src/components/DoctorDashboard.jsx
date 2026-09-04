import React, { useState } from 'react';
import { MOCK_PATIENTS_QUEUE } from '../mockData';

export default function DoctorDashboard({ onOpenDischargeAssistant }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#f8fafc' }}>Doctor Clinical Console</h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>Attending Physician: Dr. Sarah Smith (General Medicine)</p>
        </div>
        <button 
          onClick={onOpenDischargeAssistant}
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
        >
          📋 Launch Discharge Summary Assistant
        </button>
      </div>

      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
        <h3 style={{ marginTop: 0, color: '#f8fafc', marginBottom: '16px' }}>Assigned Patient Queue</h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          {MOCK_PATIENTS_QUEUE.map(p => (
            <div key={p.id} style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#fff', fontSize: '16px' }}>{p.name}</strong>
                    <span style={{ fontSize: '12px', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Token: {p.token}</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                    {p.age} yrs | {p.gender} | Dept: {p.department}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => toggleExpand(p.id)}
                    style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    {expandedId === p.id ? 'Hide History' : 'View History'}
                  </button>
                  <button 
                    onClick={onOpenDischargeAssistant}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                  >
                    Generate Discharge Summary
                  </button>
                </div>
              </div>

              {/* Expandable History Drawer */}
              {expandedId === p.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #334155', fontSize: '13px', color: '#cbd5e1' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#38bdf8' }}>Medical History & Allergies</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {p.history.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
