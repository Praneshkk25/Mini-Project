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

  const [activeToken, setActiveToken] = useState(null);
  const [upcomingAppt, setUpcomingAppt] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    if (!patient?.patient_id) return;
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch live queue token
        const tokenRes = await fetch(`${API_BASE}/queues/token/${patient.patient_id}`);
        if (tokenRes.ok) {
          const tData = await tokenRes.json();
          if (tData.active) {
            setActiveToken(tData);
          } else {
            setActiveToken(null);
          }
        }
      } catch (e) {}

      try {
        // 2. Fetch upcoming appointments
        const apptRes = await fetch(`${API_BASE}/appointments/patient/${patient.patient_id}`);
        if (apptRes.ok) {
          const aData = await apptRes.json();
          if (aData.appointments && aData.appointments.length > 0) {
            // Pick earliest upcoming confirmed appointment
            const sorted = [...aData.appointments].filter(a => a.status !== 'Cancelled');
            if (sorted.length > 0) {
              setUpcomingAppt(sorted[0]);
            }
          }
        }
      } catch (e) {}
      setLoadingData(false);
    };

    fetchDashboardData();
  }, [patient?.patient_id]);

  const recentActivity = [
    { id: 1, text: 'Prescription verified: Pantocid 40mg (OD, 14 days)', time: 'Today, 11:20 AM', type: 'rx' },
    { id: 2, text: 'Clinical intake session documented in EHR', time: 'Today, 10:05 AM', type: 'kiosk' },
    { id: 3, text: 'Diagnostic test uploaded & linked to patient record', time: 'Yesterday, 04:15 PM', type: 'doc' },
    { id: 4, text: 'Cardiology Follow-Up confirmed with Dr. Sarah Jenkins', time: '28-Aug-2026', type: 'apt' }
  ];

  const hasIncompleteOnboarding = patient.onboarding_completed === false;

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

      {/* Onboarding Notice Banner if Intake Incomplete */}
      {hasIncompleteOnboarding && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f59e0b', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <strong style={{ color: '#92400e', fontSize: '14px', display: 'block' }}>
                Complete your MediKiosk AI Clinical Intake
              </strong>
              <span style={{ color: '#b45309', fontSize: '13px' }}>
                Your clinical file requires your primary symptoms, vitals, and medical background for your attending doctor.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('kiosk')}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={15} /> Complete Intake Now
          </button>
        </div>
      )}

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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              <span>MRN: <strong style={{ color: '#0f172a' }}>{patient.mrn || patient.patient_id}</strong></span>
              <span>&bull;</span>
              <span>UHID: <strong style={{ color: patient.uhid ? '#0284c7' : '#94a3b8' }}>{patient.uhid || 'UHID: Not linked'}</strong></span>
              <span>&bull;</span>
              <span>Blood: <strong style={{ color: '#0f172a' }}>{patient.blood_group || 'O+'}</strong></span>
              <span>&bull;</span>
              <span>Hospital: <strong style={{ color: '#0d9488' }}>{patient.hospital || patient.primary_hospital_name || 'AuraHealth Central Hospital'}</strong></span>
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
            🩺 Active OPD Queue & Care Status
          </h3>

          {activeToken ? (
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #10b981', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#15803d' }}>
                  Live OPD Ticket: #{activeToken.ticket_number}
                </strong>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  ● {activeToken.status || 'Active'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#334155' }}>
                Attending: <strong>{activeToken.assigned_doctor || 'Cardiologist on duty'}</strong> &bull; {activeToken.department}
              </p>
              <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                <span>Patients Ahead: <strong style={{ color: '#0f172a' }}>{activeToken.patients_ahead ?? 0}</strong></span>
                <span>&bull;</span>
                <span>Est. Wait: <strong style={{ color: '#0284c7' }}>~{activeToken.estimated_wait_minutes ?? 15} mins</strong></span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <button onClick={() => onNavigate('token')} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  Open Live OPD Queue Pass &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px dashed #cbd5e1', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#475569' }}>No Active OPD Token</strong>
                <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '6px' }}>
                  Queue Idle
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                You are not currently in an active OPD queue. To join today's clinic queue, run a clinical intake or book an appointment.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => onNavigate('kiosk')} className="btn-primary" style={{ fontSize: '12px', padding: '4px 12px' }}>
                  Start Intake &rarr;
                </button>
                <button onClick={() => onNavigate('appointments')} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 12px' }}>
                  Book Doctor
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Appointment teaser */}
          {upcomingAppt && (
            <div style={{ background: '#f0f9ff', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #0284c7', marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0369a1' }}>
                <span>Next Scheduled Appointment</span>
                <span>{upcomingAppt.appointment_date} at {upcomingAppt.slot_time}</span>
              </div>
              <div style={{ color: '#334155', marginTop: '2px' }}>
                Dr. {upcomingAppt.doctor_name} &bull; {upcomingAppt.hospital_name} &bull; ₹{upcomingAppt.fee_inr || 500}
              </div>
            </div>
          )}

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
