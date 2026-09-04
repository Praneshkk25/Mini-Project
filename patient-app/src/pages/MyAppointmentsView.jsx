import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Plus, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function MyAppointmentsView({ patient }) {
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled'
  const [appointments, setAppointments] = useState([
    {
      id: 'APT-2026-901',
      doctor_name: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      hospital: 'AuraHealth Central Hospital',
      room: 'Room 2 (1st Floor)',
      appointment_date: '2026-09-14',
      appointment_time: '10:30 AM',
      status: 'CONFIRMED',
      type: 'Follow-Up'
    },
    {
      id: 'APT-2026-842',
      doctor_name: 'Dr. Michael Chang',
      department: 'Cardiology Follow-Up',
      hospital: 'AuraHealth Central Hospital',
      room: 'Room 4 (1st Floor)',
      appointment_date: '2026-08-20',
      appointment_time: '02:00 PM',
      status: 'COMPLETED',
      type: 'Routine Consultation'
    }
  ]);

  const [showBookModal, setShowBookModal] = useState(false);
  const [newApt, setNewApt] = useState({
    doctor_name: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '11:00 AM',
    notes: 'Routine cardiac check-up'
  });

  const handleBook = (e) => {
    e.preventDefault();
    // Conflict Check
    const exists = appointments.find(
      (a) => a.appointment_date === newApt.appointment_date && a.appointment_time === newApt.appointment_time
    );
    if (exists) {
      alert('⚠️ Time slot conflict: You already have an appointment scheduled at this time. Please select another slot.');
      return;
    }

    const created = {
      id: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      doctor_name: newApt.doctor_name,
      department: newApt.department,
      hospital: 'AuraHealth Central Hospital',
      room: 'Room 2',
      appointment_date: newApt.appointment_date,
      appointment_time: newApt.appointment_time,
      status: 'SCHEDULED',
      type: 'Outpatient Consult'
    };

    setAppointments([created, ...appointments]);
    setShowBookModal(false);
    alert(`✓ Appointment booked with ${newApt.doctor_name} for ${newApt.appointment_date} at ${newApt.appointment_time}`);
  };

  const handleCancel = (id) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a)));
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'upcoming') return a.status === 'CONFIRMED' || a.status === 'SCHEDULED';
    if (filter === 'completed') return a.status === 'COMPLETED';
    if (filter === 'cancelled') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Appointments
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Manage scheduled doctor consultations and follow-up slots.
          </p>
        </div>

        <button onClick={() => setShowBookModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}>
          <Plus size={16} /> Book New Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          onClick={() => setFilter('upcoming')}
          style={{
            background: filter === 'upcoming' ? '#0284c7' : '#f1f5f9',
            color: filter === 'upcoming' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Upcoming ({appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'SCHEDULED').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{
            background: filter === 'completed' ? '#0284c7' : '#f1f5f9',
            color: filter === 'completed' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Completed ({appointments.filter((a) => a.status === 'COMPLETED').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          style={{
            background: filter === 'cancelled' ? '#0284c7' : '#f1f5f9',
            color: filter === 'cancelled' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Cancelled ({appointments.filter((a) => a.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Appointment Cards */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          <Calendar size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, color: '#0f172a' }}>No {filter} appointments</h4>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Book a consultation slot with our verified physicians.</p>
          <button onClick={() => setShowBookModal(true)} className="btn-primary" style={{ marginTop: '12px', fontSize: '13px', padding: '8px 16px' }}>
            Book an Appointment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((apt) => (
            <div key={apt.id} className="card" style={{ padding: '18px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {apt.department}
                  </span>
                  <h4 style={{ margin: '6px 0 0 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{apt.doctor_name}</h4>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    background: apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED' ? '#dcfce7' : apt.status === 'COMPLETED' ? '#f1f5f9' : '#fee2e2',
                    color: apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED' ? '#15803d' : apt.status === 'COMPLETED' ? '#475569' : '#b91c1c'
                  }}
                >
                  {apt.status}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#0284c7" />
                  <strong>{apt.appointment_date}</strong> at <strong>{apt.appointment_time}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#64748b" />
                  {apt.hospital} &bull; {apt.room}
                </div>
              </div>

              {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <button onClick={() => alert('Calendar reminder added.')} className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px', flex: 1 }}>
                    + Add Reminder
                  </button>
                  <button onClick={() => handleCancel(apt.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '11px', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>📅 Book Doctor Consultation Slot</h3>
              <button onClick={() => setShowBookModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBook}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Select Department</label>
                  <select value={newApt.department} onChange={(e) => setNewApt({ ...newApt, department: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>Cardiology</option>
                    <option>General Medicine</option>
                    <option>Pediatrics</option>
                    <option>Orthopedics</option>
                    <option>AYUSH / Ayurveda</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Select Doctor</label>
                  <select value={newApt.doctor_name} onChange={(e) => setNewApt({ ...newApt, doctor_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>Dr. Sarah Jenkins (Cardiology)</option>
                    <option>Dr. Michael Chang (Cardiology Fellow)</option>
                    <option>Dr. Marcus Vance (General Medicine)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Date</label>
                    <input type="date" required value={newApt.appointment_date} onChange={(e) => setNewApt({ ...newApt, appointment_date: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Time Slot</label>
                    <select value={newApt.appointment_time} onChange={(e) => setNewApt({ ...newApt, appointment_time: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option>09:30 AM</option>
                      <option>10:30 AM</option>
                      <option>11:00 AM</option>
                      <option>02:00 PM</option>
                      <option>03:30 PM</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowBookModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Confirm Booking</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
