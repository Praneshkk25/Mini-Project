import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, RefreshCw, AlertCircle, Plus } from 'lucide-react';

export default function MyFollowUpsView({ patient }) {
  const [followups, setFollowups] = useState([
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
  ]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Follow-Up Appointments
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
          Physician-ordered care reviews and scheduled clinic follow-ups.
        </p>
      </div>

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
              <button onClick={() => alert('Calendar reminder added for your follow-up.')} className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                + Add to Calendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
