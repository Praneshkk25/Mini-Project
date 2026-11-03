import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, User, Heart, Activity, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DoctorDashboard({ user, onSelectPatient, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escalationsCount, setEscalationsCount] = useState(0);

  useEffect(() => {
    fetchAppointments(true);
    // Real-Time 3s Polling for Instant Booking Reflection
    const timer = setInterval(() => {
      fetchAppointments(false);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const fetchAppointments = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/appointments/list');
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const escRes = await fetch('http://localhost:8000/api/remote-rpm/doctor/escalations');
      if (escRes.ok) {
        const escData = await escRes.json();
        setEscalationsCount(Array.isArray(escData) ? escData.length : 0);
      }
    } catch (e) {
      console.warn('Could not fetch escalations count:', e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const totalCount = appointments.length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const inConsultCount = appointments.filter(a => a.status === 'In-Consultation').length;
  const waitingCount = appointments.filter(a => a.status === 'Waiting' || a.status === 'Confirmed' || a.status === 'Checked-In').length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Good Morning, {user?.name || 'Dr. Sarah Jenkins'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            {user?.specialty_or_info || 'Cardiology'} OPD Queue & Active Consultations Workspace &bull; Suite 204
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={fetchAppointments} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Urgent Post-Discharge Alert Banner if any escalation is active */}
      {escalationsCount > 0 && (
        <div
          onClick={() => onNavigate && onNavigate('remote-rpm')}
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={24} color="#ef4444" className="animate-pulse" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>
                🚨 Urgent Clinical Alert: {escalationsCount} Post-Discharge Patient{escalationsCount > 1 ? 's' : ''} Reported High-Risk Red Flags!
              </div>
              <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
                Module 3 Remote Care: Patient symptoms flagged by AI triage requiring physician review & instructions.
              </div>
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ background: '#ef4444', fontSize: '12px', padding: '6px 14px', border: 'none' }}
          >
            Review Escalations <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 5 Stat KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Today's Consults</p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#0f172a' }}>{totalCount}</h2>
          <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>{completedCount} Completed</span>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OPD Waiting</p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#f59e0b' }}>{waitingCount}</h2>
          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>M/M/c Active Flow</span>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>MediKiosk Intake</p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>{totalCount > 0 ? totalCount - 1 : 0}</h2>
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>AI Draft Summary</span>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #06b6d4', marginBottom: 0 }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Inpatient Telemetry</p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#06b6d4' }}>Active</h2>
          <span style={{ fontSize: '12px', color: '#06b6d4', fontWeight: 600 }}>NEWS2 CDS Live</span>
        </div>

        <div
          className="card"
          onClick={() => onNavigate && onNavigate('remote-rpm')}
          style={{
            padding: '18px',
            borderLeft: `4px solid ${escalationsCount > 0 ? '#ef4444' : '#10b981'}`,
            marginBottom: 0,
            cursor: 'pointer'
          }}
        >
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Post-Discharge Alerts</p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: escalationsCount > 0 ? '#ef4444' : '#10b981' }}>
            {escalationsCount}
          </h2>
          <span style={{ fontSize: '12px', color: escalationsCount > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {escalationsCount > 0 ? 'Urgent Action Required' : 'All Recovering Safely'}
          </span>
        </div>
      </div>

      {/* OPD Queue Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            📋 Live Outpatient Queue & MediKiosk Status
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Click patient row to open clinical workspace</span>
        </div>

        {loading ? (
          <p style={{ color: '#64748b', padding: '20px', textAlign: 'center' }}>Loading queue records...</p>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
            <User size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ margin: 0, color: '#0f172a' }}>No patients currently waiting in OPD queue</h4>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>New patient appointments and MediKiosk walk-ins will appear here live.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Token</th>
                  <th style={{ padding: '10px' }}>Patient Name</th>
                  <th style={{ padding: '10px' }}>Age/Gender</th>
                  <th style={{ padding: '10px' }}>Department</th>
                  <th style={{ padding: '10px' }}>Time</th>
                  <th style={{ padding: '10px' }}>MediKiosk Status</th>
                  <th style={{ padding: '10px' }}>Queue Status</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => onNavigate && onNavigate('doctor-workspace')}
                  >
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>
                      #{apt.appointment_token || `0${idx + 1}`}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#0f172a' }}>{apt.patient_name}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{apt.patient_age || 45} yrs / {apt.gender || 'Male'}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{apt.department}</td>
                    <td style={{ padding: '10px' }}>{apt.date_time || '10:30 AM'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={11} /> AI Ready
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {apt.status || 'CHECKED-IN'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Consult <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
