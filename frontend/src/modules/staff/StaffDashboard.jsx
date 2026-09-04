import React, { useState, useEffect } from 'react';
import { MOCK_PATIENTS_QUEUE, MOCK_BEDS } from '../../data/mockData';
import BedTile from '../../components/common/BedTile';
import StatusBadge from '../../components/common/StatusBadge';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'beds' | 'admission'
  
  // Queue State
  const [queue, setQueue] = useState(MOCK_PATIENTS_QUEUE);

  // Bed Grid State
  const [beds, setBeds] = useState(MOCK_BEDS);

  // Quick Admission Form State
  const [admitForm, setAdmitForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    ward: 'General Male',
    doctor: 'Dr. Sarah Smith',
    reason: ''
  });

  // Background simulation auto-refresh for live bed matrix & queue
  const [autoSimulation, setAutoSimulation] = useState(true);

  useEffect(() => {
    if (!autoSimulation) return;
    const interval = setInterval(() => {
      // Randomly cycle status of one bed to simulate live hospital operations
      setBeds(prevBeds => {
        const randomIndex = Math.floor(Math.random() * prevBeds.length);
        const statusCycle = ['available', 'occupied', 'cleaning', 'reserved'];
        return prevBeds.map((b, idx) => {
          if (idx === randomIndex) {
            const nextIdx = (statusCycle.indexOf(b.status) + 1) % statusCycle.length;
            return { ...b, status: statusCycle[nextIdx] };
          }
          return b;
        });
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [autoSimulation]);

  // Handlers for Queue actions
  const handleCallNext = (id) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: 'In Consultation' } : p));
  };

  const handleSkip = (id) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: 'Skipped' } : p));
  };

  const handleNoShow = (id) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: 'No Show' } : p));
  };

  // Bed status manual click toggle
  const handleToggleBedStatus = (bedId) => {
    const statusCycle = ['available', 'occupied', 'cleaning', 'reserved'];
    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        const nextIdx = (statusCycle.indexOf(b.status) + 1) % statusCycle.length;
        return { ...b, status: statusCycle[nextIdx] };
      }
      return b;
    }));
  };

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    if (!admitForm.name || !admitForm.age) return;
    
    // Add patient to queue & allocate first available bed in ward
    const newPatient = {
      id: `P-${Date.now().toString().substr(6)}`,
      name: admitForm.name,
      age: parseInt(admitForm.age),
      gender: admitForm.gender,
      token: `A-0${queue.length + 12}`,
      department: admitForm.ward.includes('ICU') ? 'Cardiology' : 'General Medicine',
      doctor: admitForm.doctor,
      status: 'Waiting',
      waitTime: '0 mins',
      history: [admitForm.reason]
    };

    setQueue([newPatient, ...queue]);

    // Also update an available bed
    setBeds(prevBeds => {
      const availBedIdx = prevBeds.findIndex(b => b.ward.includes(admitForm.ward) && b.status === 'available');
      if (availBedIdx !== -1) {
        return prevBeds.map((b, idx) => idx === availBedIdx ? {
          ...b,
          status: 'occupied',
          patientName: admitForm.name,
          age: parseInt(admitForm.age),
          gender: admitForm.gender,
          admittedOn: new Date().toISOString().split('T')[0],
          doctor: admitForm.doctor
        } : b);
      }
      return prevBeds;
    });

    alert(`Patient ${admitForm.name} admitted successfully and allocated to ${admitForm.ward}!`);
    setAdmitForm({ name: '', age: '', gender: 'Male', ward: 'General Male', doctor: 'Dr. Sarah Smith', reason: '' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
            🏥 Hospital Staff & Reception Dashboard
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
            Live OPD patient queue control, interactive bed matrix, and rapid patient admission.
          </p>
        </div>

        <button 
          onClick={() => setAutoSimulation(!autoSimulation)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: autoSimulation ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
            color: autoSimulation ? '#10b981' : '#9ca3af',
            border: autoSimulation ? '1px solid #10b981' : '1px solid #9ca3af',
            cursor: 'pointer'
          }}
        >
          {autoSimulation ? '🟢 Live Auto-Sync Active (8s)' : '⚪ Auto-Sync Paused'}
        </button>
      </div>

      {/* Real-Time Patient Vital Telemetry Alert Widget */}
      <div style={{ background: '#1e293b', border: '1px solid #10b981', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>📡</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: '700' }}>
              Bedside Telemetry Live Monitor (15 Beds Monitored)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Status: <strong>12 Normal</strong> &bull; <span style={{ color: '#fde68a' }}>2 Warning</span> &bull; <span style={{ color: '#fca5a5' }}>1 Critical Alert</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.hash = '#monitoring'}
          style={{
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Open Bedside Command Center &rarr;
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 OPD Queue Control ({queue.filter(p => p.status === 'Waiting').length} Waiting)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'beds' ? 'active' : ''}`}
          onClick={() => setActiveTab('beds')}
        >
          🛏️ Bed Status Grid ({beds.filter(b => b.status === 'available').length} Avail)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'admission' ? 'active' : ''}`}
          onClick={() => setActiveTab('admission')}
        >
          📝 Quick Admission Form
        </button>
      </div>

      {/* 1. Queue Control Panel */}
      {activeTab === 'queue' && (
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>Active OPD Patient Queue</h3>
            <div style={{ fontSize: '13px', color: '#38bdf8' }}>
              Total Serving Today: <strong>{queue.length} Patients</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#0f172a', textAlign: 'left', borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: '12px 16px' }}>Token</th>
                  <th style={{ padding: '12px 16px' }}>Patient Name</th>
                  <th style={{ padding: '12px 16px' }}>Demographics</th>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Queue Control Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#38bdf8', fontSize: '16px' }}>{p.token}</td>
                    <td style={{ padding: '14px 16px', color: '#fff', fontWeight: '600' }}>{p.name}</td>
                    <td style={{ padding: '14px 16px' }}>{p.age} yrs / {p.gender}</td>
                    <td style={{ padding: '14px 16px' }}>{p.department}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleCallNext(p.id)}
                          disabled={p.status === 'In Consultation' || p.status === 'Completed'}
                          style={{
                            padding: '6px 12px',
                            background: p.status === 'In Consultation' ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #0284c7, #06b6d4)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {p.status === 'In Consultation' ? 'In Consultation' : '📞 Call Next'}
                        </button>
                        <button 
                          onClick={() => handleSkip(p.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(245,158,11,0.15)',
                            color: '#f59e0b',
                            border: '1px solid #f59e0b',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ⏭️ Skip
                        </button>
                        <button 
                          onClick={() => handleNoShow(p.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(239,68,68,0.15)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🚫 No-Show
                        </button>
                      </div>
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
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>Interactive Bed Status Matrix</h3>
            
            {/* Color Legend */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Available
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Occupied
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Cleaning
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span> Reserved
              </span>
            </div>
          </div>

          {/* Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {beds.map(bed => (
              <BedTile key={bed.id} bed={bed} onStatusChange={handleToggleBedStatus} />
            ))}
          </div>
        </div>
      )}

      {/* 3. Quick Admission Form */}
      {activeTab === 'admission' && (
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', maxWidth: '700px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc', fontSize: '18px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            📝 Quick Patient Triage & Admission Form
          </h3>

          <form onSubmit={handleAdmitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Patient Full Name *</label>
              <input 
                type="text" 
                required 
                placeholder="Enter patient name..." 
                value={admitForm.name} 
                onChange={e => setAdmitForm({...admitForm, name: e.target.value})} 
                className="form-input" 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Age *</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 45" 
                  value={admitForm.age} 
                  onChange={e => setAdmitForm({...admitForm, age: e.target.value})} 
                  className="form-input" 
                />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select 
                  value={admitForm.gender} 
                  onChange={e => setAdmitForm({...admitForm, gender: e.target.value})} 
                  className="form-input"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Assign Ward / Specialty</label>
                <select 
                  value={admitForm.ward} 
                  onChange={e => setAdmitForm({...admitForm, ward: e.target.value})} 
                  className="form-input"
                >
                  <option value="General Male">General Male Ward</option>
                  <option value="General Female">General Female Ward</option>
                  <option value="ICU Block A">ICU Block A</option>
                  <option value="Maternity Wing">Maternity Wing</option>
                </select>
              </div>
              <div>
                <label className="form-label">Assign Doctor</label>
                <select 
                  value={admitForm.doctor} 
                  onChange={e => setAdmitForm({...admitForm, doctor: e.target.value})} 
                  className="form-input"
                >
                  <option value="Dr. Sarah Smith">Dr. Sarah Smith (General Medicine)</option>
                  <option value="Dr. Vikas Rao">Dr. Vikas Rao (Cardiology)</option>
                  <option value="Dr. Anita Roy">Dr. Anita Roy (Orthopedics)</option>
                  <option value="Dr. M. Patel">Dr. M. Patel (Pediatrics)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Reason for Admission / Diagnosis Notes</label>
              <textarea 
                rows={3} 
                placeholder="Enter chief complaint or emergency notes..." 
                value={admitForm.reason} 
                onChange={e => setAdmitForm({...admitForm, reason: e.target.value})} 
                className="form-input" 
              />
            </div>

            <button 
              type="submit" 
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              🚀 Admit Patient & Allocate Bed
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
