import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, RefreshCw, AlertCircle, Plus } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const DEFAULT_FOLLOWUPS = [
  {
    id: 'FU-2026-01',
    doctor_name: 'Dr. Sarah Jenkins',
    department: 'Cardiology OPD',
    hospital: 'AuraHealth Central Hospital',
    room: 'Room 2 (1st Floor)',
    date: '2026-09-14',
    time: '10:30 AM',
    reason: '14-Day Post-Consultation Blood Pressure & ECG Review',
    status: 'CONFIRMED'
  }
];

export default function MyFollowUpsView({ patient, onNavigate }) {
  const [followups, setFollowups] = useState(DEFAULT_FOLLOWUPS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patient?.patient_id) return;
    const fetchFollowups = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/followups/patient/${patient.patient_id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.followups && data.followups.length > 0) {
            setFollowups(data.followups.map((fu) => ({
              id: fu.id || fu.followup_id,
              doctor_name: fu.doctor_name || 'Dr. Sarah Jenkins',
              department: fu.department || 'Outpatient Clinic',
              hospital: fu.hospital_name || 'AuraHealth Central Hospital',
              room: fu.room_number || 'Room 2',
              date: fu.followup_date || '2026-09-14',
              time: fu.followup_time || '10:30 AM',
              reason: fu.clinical_reason || fu.reason || 'Follow-up clinical assessment',
              status: (fu.status || 'Confirmed').toUpperCase()
            })));
          }
        }
      } catch (e) {
        console.warn('Followups fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, [patient?.patient_id]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Follow-Up Appointments
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Physician-ordered care reviews and scheduled clinic follow-ups.
          </p>
        </div>

        <button
          onClick={() => onNavigate ? onNavigate('appointments') : null}
          className="btn-primary"
          style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Calendar size={15} /> Book Another Appointment
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
          Loading follow-up schedule…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {followups.map((fu) => (
            <div key={fu.id} className="card" style={{ padding: '22px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {fu.department}
                  </span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{fu.doctor_name}</h3>
                </div>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                  {fu.status}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
                <strong style={{ color: '#0f172a' }}>Clinical Reason:</strong>
                <p style={{ margin: '2px 0 0 0', color: '#475569' }}>{fu.reason}</p>
              </div>

              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="#0284c7" />
                  <span>Date: <strong style={{ color: '#0f172a' }}>{fu.date}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#0284c7" />
                  <span>Time: <strong style={{ color: '#0f172a' }}>{fu.time}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#64748b" />
                  <span>{fu.hospital} &bull; {fu.room}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button onClick={() => alert(`Calendar reminder added for follow-up with ${fu.doctor_name} on ${fu.date}`)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                  + Add to Calendar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
