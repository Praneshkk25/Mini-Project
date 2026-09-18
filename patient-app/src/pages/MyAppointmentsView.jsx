import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Plus, CheckCircle, AlertCircle, RefreshCw, X, Building2, Stethoscope, AlertTriangle, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function MyAppointmentsView({ patient }) {
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingReason, setBookingReason] = useState('Consultation & Follow-up');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // 1. Fetch Patient Appointments
  const loadAppointments = async () => {
    if (!patient?.patient_id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/patient/${patient.patient_id}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.warn('Could not load appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Multi-Hospital Doctors
  const loadDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE}/appointments/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDoctorsList(data.doctors || []);
        if (data.doctors && data.doctors.length > 0) {
          const doc = data.doctors[0];
          setSelectedDoctor(doc);
          if (doc.affiliations && doc.affiliations.length > 0) {
            setSelectedHospital(doc.affiliations[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load doctors:', e);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, [patient?.patient_id]);

  // Update slots when doctor/hospital/date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedHospital || !selectedDate) return;
    const fetchSlots = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/appointments/availability?doctor_id=${selectedDoctor.doctor_id}&hospital_name=${encodeURIComponent(selectedHospital.hospital_name)}&date=${selectedDate}`
        );
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.available_slots || []);
          if (data.available_slots && data.available_slots.length > 0) {
            setSelectedSlot(data.available_slots[0]);
          } else {
            setSelectedSlot('');
          }
        }
      } catch (e) {
        setAvailableSlots(['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM']);
        setSelectedSlot('09:30 AM');
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedHospital, selectedDate]);

  // Handle Book
  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please choose an available time slot.');
      return;
    }
    setBookingSubmitting(true);
    setBookingError('');

    try {
      const res = await fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.patient_id,
          patient_name: patient.name,
          doctor_id: selectedDoctor.doctor_id,
          doctor_name: selectedDoctor.name,
          hospital_name: selectedHospital.hospital_name,
          department: selectedDoctor.specialty,
          appointment_date: selectedDate,
          slot_time: selectedSlot,
          fee_inr: selectedHospital.consultation_fee_inr,
          reason: bookingReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(data.detail || 'That appointment slot is no longer available. Please select another slot.');
        }
        throw new Error(data.detail || 'Failed to book appointment.');
      }

      setShowBookModal(false);
      loadAppointments();
      alert(`✓ Appointment booked successfully with ${selectedDoctor.name} at ${selectedHospital.hospital_name} on ${selectedDate} at ${selectedSlot}.`);
    } catch (err) {
      setBookingError(err.message || 'Error occurred while booking.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Handle Cancel
  const handleCancel = async (token) => {
    if (!confirm('Are you sure you want to cancel this scheduled appointment?')) return;
    try {
      const res = await fetch(`${API_BASE}/appointments/${token}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        loadAppointments();
      } else {
        alert('Could not cancel appointment.');
      }
    } catch (e) {
      alert('Error cancelling appointment.');
    }
  };

  const filtered = appointments.filter((a) => {
    const st = (a.status || '').toUpperCase();
    if (filter === 'upcoming') return st === 'CONFIRMED' || st === 'SCHEDULED';
    if (filter === 'completed') return st === 'COMPLETED';
    if (filter === 'cancelled') return st === 'CANCELLED';
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
            Hospital-aware doctor bookings across multi-hospital schedules with transparent fees in INR (₹).
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
          Upcoming ({appointments.filter((a) => (a.status || '').toUpperCase() === 'CONFIRMED' || (a.status || '').toUpperCase() === 'SCHEDULED').length})
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
          Completed ({appointments.filter((a) => (a.status || '').toUpperCase() === 'COMPLETED').length})
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
          Cancelled ({appointments.filter((a) => (a.status || '').toUpperCase() === 'CANCELLED').length})
        </button>
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
          Loading appointments…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          <Calendar size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, color: '#0f172a' }}>No {filter} appointments found</h4>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Book a hospital consultation slot with our verified medical specialists.</p>
          <button onClick={() => setShowBookModal(true)} className="btn-primary" style={{ marginTop: '12px', fontSize: '13px', padding: '8px 16px' }}>
            Book an Appointment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map((apt) => {
            const isConfirmed = (apt.status || '').toUpperCase() === 'CONFIRMED' || (apt.status || '').toUpperCase() === 'SCHEDULED';
            return (
              <div key={apt.id || apt.token} className="card" style={{ padding: '18px', borderLeft: `4px solid ${isConfirmed ? '#0284c7' : '#94a3b8'}`, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {apt.department}
                    </span>
                    <h4 style={{ margin: '6px 0 0 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      {apt.doctor_name}
                    </h4>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: isConfirmed ? '#dcfce7' : (apt.status === 'COMPLETED' ? '#f1f5f9' : '#fee2e2'),
                      color: isConfirmed ? '#15803d' : (apt.status === 'COMPLETED' ? '#475569' : '#b91c1c'),
                    }}
                  >
                    {apt.status}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#0284c7" />
                    <strong>{apt.appointment_date}</strong> at <strong>{apt.slot_time || apt.appointment_time}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#64748b" />
                    <span>{apt.hospital_name || apt.hospital} {apt.room ? `• ${apt.room}` : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 700 }}>
                    <span>Fee: ₹{apt.fee_inr || 750}</span>
                    {apt.token && <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>• Token: {apt.token}</span>}
                  </div>
                </div>

                {isConfirmed && (
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button onClick={() => alert(`Appointment token: ${apt.token || apt.id}. Please present this at the reception desk.`)} className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px', flex: 1 }}>
                      View Booking Slip
                    </button>
                    <button onClick={() => handleCancel(apt.token || apt.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '11px', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel Slot
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hospital-Aware Multi-Hospital Booking Modal */}
      {showBookModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ width: '640px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#fff', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  📅 Hospital-Aware Doctor Booking
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Select doctor, compare affiliated hospitals, and secure your slot.
                </span>
              </div>
              <button onClick={() => setShowBookModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {bookingError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBook}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Doctor Selection */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#334155' }}>
                    1. Select Doctor & Specialty
                  </label>
                  <select
                    value={selectedDoctor?.doctor_id || ''}
                    onChange={(e) => {
                      const doc = doctorsList.find((d) => d.doctor_id === e.target.value);
                      if (doc) {
                        setSelectedDoctor(doc);
                        if (doc.affiliations && doc.affiliations.length > 0) {
                          setSelectedHospital(doc.affiliations[0]);
                        }
                      }
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  >
                    {doctorsList.map((d) => (
                      <option key={d.doctor_id} value={d.doctor_id}>
                        {d.name} — {d.specialty} ({d.experience_years} yrs exp)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Multi-Hospital Affiliations Comparison */}
                {selectedDoctor && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#334155' }}>
                      2. Choose Hospital Location ({selectedDoctor.name} consults at {selectedDoctor.affiliations?.length || 1} hospitals)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                      {selectedDoctor.affiliations?.map((aff) => {
                        const isSelected = selectedHospital?.hospital_name === aff.hospital_name;
                        return (
                          <div
                            key={aff.hospital_name}
                            onClick={() => setSelectedHospital(aff)}
                            style={{
                              border: isSelected ? '2px solid #0d9488' : '1px solid #cbd5e1',
                              background: isSelected ? '#f0fdf4' : '#fff',
                              borderRadius: '10px',
                              padding: '12px',
                              cursor: 'pointer',
                              transition: 'all .2s',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '13px', color: isSelected ? '#15803d' : '#0f172a' }}>
                                {aff.hospital_name}
                              </strong>
                              {isSelected && <CheckCircle size={15} color="#10b981" />}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                              📍 {aff.distance_km} km away &bull; {aff.hospital_city}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0d9488' }}>
                                ₹{aff.consultation_fee_inr}
                              </span>
                              <span style={{ fontSize: '11px', color: '#475569', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                {aff.room_number}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Date & Available Slots */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#334155' }}>
                      3. Consultation Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#334155' }}>
                      4. Available Slot
                    </label>
                    {availableSlots.length > 0 ? (
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      >
                        {availableSlots.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ padding: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '12px', borderRadius: '6px' }}>
                        No slots available on this date
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Booking Reason */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#334155' }}>
                    Reason for Consultation
                  </label>
                  <input
                    type="text"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="e.g. Chest pain review, Routine follow-up, BP check"
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                {/* Summary & Buttons */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
                  <div>Doctor: <strong>{selectedDoctor?.name}</strong></div>
                  <div>Hospital: <strong>{selectedHospital?.hospital_name}</strong></div>
                  <div>Date & Slot: <strong>{selectedDate} at {selectedSlot || 'Select slot'}</strong></div>
                  <div>Consultation Fee: <strong style={{ color: '#0d9488' }}>₹{selectedHospital?.consultation_fee_inr || 750}</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowBookModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={bookingSubmitting || !selectedSlot} className="btn-primary" style={{ padding: '10px 20px' }}>
                    {bookingSubmitting ? 'Securing Slot…' : 'Confirm & Book Appointment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
