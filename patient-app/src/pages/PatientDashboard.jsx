import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Heart,
  Activity,
  Stethoscope,
  Thermometer,
  Calendar,
  Clock,
  Pill,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function PatientDashboard({ patient, onNavigate }) {
  const [vitals, setVitals] = useState({
    heart_rate: 74,
    blood_pressure: '120/80',
    spo2: 98,
    temperature: 36.8
  });

  const recentActivity = [
    { id: 1, text: 'Prescription issued & fulfilled: Pantocid 40mg', time: 'Today, 11:20 AM', type: 'rx' },
    { id: 2, text: 'MediKiosk AI Intake completed in Tamil', time: 'Today, 10:05 AM', type: 'kiosk' },
    { id: 3, text: '12-Lead ECG Report uploaded to chart', time: 'Yesterday, 04:15 PM', type: 'doc' },
    { id: 4, text: 'Cardiology Follow-Up confirmed with Dr. Sarah Jenkins', time: '28-Aug-2026', type: 'apt' }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Greeting */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Welcome back, {patient.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Your personal health overview, telemetry, and upcoming care schedule.
          </p>
        </div>
        <span style={{ fontSize: '12px', background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontWeight: 800, border: '1px solid #bbf7d0' }}>
          ● Connected to Hospital Telemetry Grid
        </span>
      </div>

      {/* 1. Patient Identity Card */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #0d9488)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px' }}>
            {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{patient.name}</h3>
              <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                {patient.gender}, {patient.age} yrs
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              <span>MRN: <strong style={{ color: '#0f172a' }}>{patient.mrn || 'MRN-884920'}</strong></span>
              <span>&bull;</span>
              <span>UHID: <strong style={{ color: '#0f172a' }}>{patient.uhid || 'UHID-2026-884920'}</strong></span>
              <span>&bull;</span>
              <span>Blood: <strong style={{ color: '#0f172a' }}>{patient.blood_group || 'A+'}</strong></span>
              <span>&bull;</span>
              <span>Allergies: <strong style={{ color: patient.allergies === 'None' ? '#10b981' : '#ef4444' }}>{patient.allergies || 'None known'}</strong></span>
            </div>
          </div>
        </div>

        <button onClick={() => onNavigate('profile')} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={15} /> View Profile & Settings
        </button>
      </div>

      {/* 2. Vitals KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ef4444', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            <Heart size={14} color="#ef4444" /> HEART RATE
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#ef4444' }}>{vitals.heart_rate} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>bpm</span></h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Normal Sinus Rhythm</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            <Stethoscope size={14} color="#0284c7" /> BLOOD PRESSURE
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#0284c7' }}>{vitals.blood_pressure}</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Optimal Range</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            <Activity size={14} color="#10b981" /> OXYGEN SpO2
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>{vitals.spo2}%</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Healthy Saturation</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            <Thermometer size={14} color="#f59e0b" /> TEMPERATURE
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#f59e0b' }}>{vitals.temperature}°C</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Normothermic</span>
        </div>
      </div>

      {/* 4. Quick Actions Row */}
      <div className="card" style={{ padding: '18px', marginBottom: '20px', background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Quick Health Actions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <button onClick={() => onNavigate('kiosk')} className="btn-primary" style={{ padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Sparkles size={15} /> Start MediKiosk Intake
          </button>
          <button onClick={() => onNavigate('appointments')} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Calendar size={15} /> Book Appointment
          </button>
          <button onClick={() => onNavigate('prescriptions')} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Pill size={15} /> View Prescriptions
          </button>
          <button onClick={() => onNavigate('documents')} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <FileText size={15} /> View Documents
          </button>
          <button onClick={() => onNavigate('companion')} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <MessageSquare size={15} /> Care Companion
          </button>
        </div>
      </div>

      {/* 5. Current Care & Recent Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Current Care */}
        <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            🩺 Current Care & Active Visit
          </h3>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #0284c7', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Cardiology Outpatient Visit</strong>
              <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                ACTIVE OPD
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#475569' }}>
              Attending: <strong>Dr. Sarah Jenkins</strong> &bull; Consultation Room 2
            </p>
            <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
              <span>OPD Token: <strong style={{ color: '#0284c7' }}>#04 (Called Next)</strong></span>
              <span>&bull;</span>
              <span>Next Follow-Up: <strong style={{ color: '#0f172a' }}>14-Sep-2026</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Need assistance with your ongoing treatment?</span>
            <button onClick={() => onNavigate('companion')} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>
              Ask Care Companion &rarr;
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            🕒 Recent Health Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivity.map((act) => (
              <div key={act.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12px' }}>
                <CheckCircle2 size={15} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 600 }}>{act.text}</div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
