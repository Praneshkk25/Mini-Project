import React, { useState } from 'react';
import { MOCK_PATIENTS_QUEUE, MOCK_BEDS } from '../mockData';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'beds' | 'admission'
  
  // Queue Control Panel State
  const [queue, setQueue] = useState(MOCK_PATIENTS_QUEUE);

  const handleCallNext = (id) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: 'In Consultation' } : p));
  };

  const handleSkip = (id) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: 'Skipped' } : p));
  };

  const handleNoShow = (id) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: 'No Show' } : p));
  };

  // Bed Status Grid State
  const [beds, setBeds] = useState(MOCK_BEDS);

  const toggleBedStatus = (bedId) => {
    const statusCycle = ['available', 'occupied', 'cleaning', 'reserved'];
    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        const nextIdx = (statusCycle.indexOf(b.status) + 1) % statusCycle.length;
        return { ...b, status: statusCycle[nextIdx] };
      }
      return b;
    }));
  };

  // Quick Admission Form State
  const [admitForm, setAdmitForm] = useState({
    name: '', age: '', gender: 'Male', ward: 'General Male', doctor: 'Dr. Sarah Smith', reason: ''
  });

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    alert(`Patient ${admitForm.name} admitted successfully! Allocated to ${admitForm.ward}.`);
    setAdmitForm({ name: '', age: '', gender: 'Male', ward: 'General Male', doctor: 'Dr. Sarah Smith', reason: '' });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Staff Nav Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 OPD Queue Control
        </button>
        <button 
          className={`tab-btn ${activeTab === 'beds' ? 'active' : ''}`}
          onClick={() => setActiveTab('beds')}
        >
          🛏️ Live Bed Matrix
        </button>
        <button 
          className={`tab-btn ${activeTab === 'admission' ? 'active' : ''}`}
          onClick={() => setActiveTab('admission')}
        >
          📝 Quick Patient Admission
        </button>
      </div>

      {/* 1. Queue Control Panel */}
      {activeTab === 'queue' && (
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc' }}>Live Patient OPD Queue Control</h3>
            <span style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', border: '1px solid #38bdf8' }}>
              Active Waiting: {queue.filter(p => p.status === 'Waiting').length} Patients
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#0f172a', textAlign: 'left', borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: '12px' }}>Token</th>
                  <th style={{ padding: '12px' }}>Patient Name</th>
                  <th style={{ padding: '12px' }}>Demographics</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{p.token}</td>
                    <td style={{ padding: '12px', color: '#fff' }}>{p.name}</td>
                    <td style={{ padding: '12px' }}>{p.age} yrs / {p.gender}</td>
                    <td style={{ padding: '12px' }}>{p.department}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '6px', fontSize: '12px',
                        background: p.status === 'In Consultation' ? 'rgba(16,185,129,0.2)' : p.status === 'Waiting' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                        color: p.status === 'In Consultation' ? '#10b981' : p.status === 'Waiting' ? '#f59e0b' : '#ef4444',
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleCallNext(p.id)} style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Call Next</button>
                      <button onClick={() => handleSkip(p.id)} style={{ padding: '4px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Skip</button>
                      <button onClick={() => handleNoShow(p.id)} style={{ padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>No Show</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Bed Status Grid */}
      {activeTab === 'beds' && (
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc' }}>Live Bed Occupancy Grid</h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>🟢 Available</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>🔴 Occupied</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>🟡 Cleaning</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}>🔵 Reserved</span>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>💡 Click any bed tile to cycle its status (Available → Occupied → Cleaning → Reserved)</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {beds.map(b => {
              const bgMap = { available: 'rgba(16,185,129,0.15)', occupied: 'rgba(239,68,68,0.15)', cleaning: 'rgba(245,158,11,0.15)', reserved: 'rgba(59,130,246,0.15)' };
              const borderMap = { available: '#10b981', occupied: '#ef4444', cleaning: '#f59e0b', reserved: '#3b82f6' };

              return (
                <div 
                  key={b.id}
                  onClick={() => toggleBedStatus(b.id)}
                  style={{
                    background: bgMap[b.status],
                    border: `1.5px solid ${borderMap[b.status]}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#fff', fontSize: '16px' }}>{b.bedNo}</strong>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: borderMap[b.status], fontWeight: 'bold' }}>{b.status}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'block' }}>{b.ward}</span>
                  {b.patientName && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: '#f1f5f9' }}>
                      <strong>{b.patientName}</strong> ({b.age}/{b.gender[0]})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Quick Admission Form */}
      {activeTab === 'admission' && (
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ marginTop: 0, color: '#f8fafc' }}>Quick Patient Admission Form</h3>
          <form onSubmit={handleAdmitSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Patient Full Name</label>
              <input type="text" required value={admitForm.name} onChange={e => setAdmitForm({ ...admitForm, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Age</label>
                <input type="number" required value={admitForm.age} onChange={e => setAdmitForm({ ...admitForm, age: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Gender</label>
                <select value={admitForm.gender} onChange={e => setAdmitForm({ ...admitForm, gender: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Ward Selection</label>
                <select value={admitForm.ward} onChange={e => setAdmitForm({ ...admitForm, ward: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}>
                  <option value="ICU Block A">ICU Block A</option>
                  <option value="General Male">General Male</option>
                  <option value="General Female">General Female</option>
                  <option value="Maternity Wing">Maternity Wing</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Assigned Doctor</label>
                <select value={admitForm.doctor} onChange={e => setAdmitForm({ ...admitForm, doctor: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}>
                  <option value="Dr. Sarah Smith">Dr. Sarah Smith</option>
                  <option value="Dr. Vikas Rao">Dr. Vikas Rao</option>
                  <option value="Dr. Anita Roy">Dr. Anita Roy</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Reason for Admission</label>
              <textarea rows={3} value={admitForm.reason} onChange={e => setAdmitForm({ ...admitForm, reason: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}></textarea>
            </div>

            <button type="submit" style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Admit Patient Now
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
