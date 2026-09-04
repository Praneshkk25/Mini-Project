import React, { useState } from 'react';
import { MOCK_PATIENTS_QUEUE } from '../../data/mockData';
import StatusBadge from '../../components/common/StatusBadge';

export default function DoctorDashboard({ onOpenDischargeAssistant }) {
  const [patients, setPatients] = useState(MOCK_PATIENTS_QUEUE);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
            🩺 Doctor Clinical Workstation
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
            Consultation queue, medical history inspection, and 1-click AI discharge summary creation.
          </p>
        </div>

        <button 
          onClick={onOpenDischargeAssistant}
          style={{
            padding: '10px 18px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📋 Open Discharge Summary Assistant
        </button>
      </div>

      {/* Real-Time Patient Vital Telemetry Alert Widget */}
      <div style={{ background: '#1e293b', border: '1px solid #38bdf8', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>❤️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: '700' }}>
              Real-Time Bedside Patient Telemetry Alert Feed
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              15 streaming monitors &bull; 1 patient requiring high-priority vital review (PT-1001 / SpO2 86%)
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.hash = '#monitoring'}
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid #38bdf8',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          View Telemetry Dashboard &rarr;
        </button>
      </div>

      {/* Patient Queue List */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '18px' }}>
          Today's Scheduled Consultations ({patients.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {patients.map(p => {
            const isExpanded = expandedId === p.id;
            return (
              <div 
                key={p.id}
                style={{
                  background: isExpanded ? '#0f172a' : '#1e293b',
                  border: isExpanded ? '1px solid #06b6d4' : '1px solid #334155',
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Main Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'rgba(56,189,248,0.15)',
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '15px'
                    }}>
                      {p.token}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                        {p.name} <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#94a3b8' }}>({p.age}y / {p.gender})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        UHID: {p.id} | Department: {p.department} | Doctor: {p.doctor}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <StatusBadge status={p.status} />

                    <button 
                      onClick={() => toggleExpand(p.id)}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(51, 65, 85, 0.5)',
                        color: '#cbd5e1',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {isExpanded ? '▲ Hide History' : '▼ View History'}
                    </button>

                    <button 
                      onClick={onOpenDischargeAssistant}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid #06b6d4',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      📝 Generate Discharge Summary
                    </button>
                  </div>
                </div>

                {/* Expandable History Drawer */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #334155', color: '#cbd5e1', fontSize: '13px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '14px' }}>
                      📜 Patient Medical History & Allergies
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                      {p.history.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>

                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                      <span style={{ background: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                        ⏱️ Est. Wait: <strong>{p.waitTime}</strong>
                      </span>
                      <span style={{ background: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                        🩺 Primary Physician: <strong>{p.doctor}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
