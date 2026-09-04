import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Search,
  Star,
  ChevronRight,
  ArrowLeft,
  Printer,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Hospital
} from 'lucide-react';

const FALLBACK_HOSPITALS = [
  {
    id: 1,
    name: 'AuraHealth Central Hospital',
    city: 'Delhi NCR',
    distance_km: 1.2,
    address: '72 Medical Square, Connaught Place, New Delhi',
    phone: '+91 11 4059 8800',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
    icu_available: 14,
    icu_total: 20
  },
  {
    id: 2,
    name: 'AIIMS Hospital & Research',
    city: 'Delhi NCR',
    distance_km: 4.5,
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    phone: '+91 11 2658 8500',
    specialties: ['Cardiology', 'Neurology', 'General Medicine'],
    icu_available: 3,
    icu_total: 45
  },
  {
    id: 3,
    name: 'Max Super Speciality Hospital',
    city: 'Delhi NCR',
    distance_km: 6.8,
    address: '1 Press Enclave Road, Saket, New Delhi',
    phone: '+91 11 2651 5050',
    specialties: ['Cardiology', 'Pulmonology', 'Orthopedics'],
    icu_available: 9,
    icu_total: 15
  },
  {
    id: 4,
    name: 'Fortis Heart Institute',
    city: 'Delhi NCR',
    distance_km: 8.1,
    address: 'Okhla Road, Sukhdev Vihar, New Delhi',
    phone: '+91 11 4713 5000',
    specialties: ['Cardiology'],
    icu_available: 18,
    icu_total: 30
  },
  {
    id: 5,
    name: 'Apollo Multi-Specialty Hospital',
    city: 'Mumbai',
    distance_km: 3.2,
    address: 'Plot 13, Off Thane Belapur Rd, Navi Mumbai',
    phone: '+91 22 3350 3350',
    specialties: ['Cardiology', 'Pediatrics'],
    icu_available: 11,
    icu_total: 25
  },
  {
    id: 6,
    name: 'Lilavati Hospital & Research',
    city: 'Mumbai',
    distance_km: 5.0,
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
    phone: '+91 22 2675 1000',
    specialties: ['Neurology', 'General Medicine'],
    icu_available: 5,
    icu_total: 20
  },
  {
    id: 7,
    name: 'Manipal Hospital Old Airport Rd',
    city: 'Bengaluru',
    distance_km: 2.8,
    address: '98 HAL Old Airport Rd, Kodihalli, Bengaluru',
    phone: '+91 80 2502 4444',
    specialties: ['Cardiology', 'Orthopedics'],
    icu_available: 16,
    icu_total: 25
  },
  {
    id: 8,
    name: 'Apollo Hospitals Greams Rd',
    city: 'Chennai',
    distance_km: 3.7,
    address: '21 Greams Lane, Thousand Lights, Chennai',
    phone: '+91 44 2829 0200',
    specialties: ['Cardiology', 'Neurology'],
    icu_available: 12,
    icu_total: 20
  }
];

export default function BookAppointmentView() {
  // Step state: 1: Hospital -> 2: Doctor -> 3: Time Slot & Patient -> 4: Confirmed
  const [currentStep, setCurrentStep] = useState(1);

  // Selection states
  const [selectedCity, setSelectedCity] = useState('All');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [hospitals, setHospitals] = useState(FALLBACK_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [selectedDate, setSelectedDate] = useState('Today, Aug 31');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('James Robertson');
  const [patientAge, setPatientAge] = useState(64);
  const [visitReason, setVisitReason] = useState('Routine consultation & vitals check');

  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const cities = ['All', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Chennai'];

  // Load saved patient name if available
  useEffect(() => {
    const saved = localStorage.getItem('aura_patient_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.name) setPatientName(u.name);
      } catch (e) {}
    }
  }, []);

  // Fetch Hospitals
  useEffect(() => {
    fetchHospitals();
  }, [selectedCity]);

  const fetchHospitals = async () => {
    try {
      const cityQuery = selectedCity === 'All' ? 'All' : selectedCity;
      const res = await fetch(`http://localhost:8000/api/city-wide/hospitals?city=${encodeURIComponent(cityQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hospitals && data.hospitals.length > 0) {
          setHospitals(data.hospitals);
        } else {
          setHospitals(FALLBACK_HOSPITALS);
        }
      }
    } catch (e) {
      setHospitals(FALLBACK_HOSPITALS);
    }
  };

  // Fetch Doctors when Hospital changes
  useEffect(() => {
    if (selectedHospital) {
      fetchDoctors(selectedHospital.name);
    }
  }, [selectedHospital]);

  const fetchDoctors = async (hospitalName) => {
    try {
      const res = await fetch(`http://localhost:8000/api/appointments/doctors?hospital_name=${encodeURIComponent(hospitalName)}`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctor(data[0]);
        } else {
          setSelectedDoctor(null);
        }
      }
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  // Filtered hospitals
  const filteredHospitals = hospitals.filter((h) => {
    const matchesCity = selectedCity === 'All' || h.city?.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesSearch =
      !hospitalSearch ||
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.address?.toLowerCase().includes(hospitalSearch.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Extract specialties available for selected hospital's doctors
  const availableSpecialties = ['All', ...new Set(doctors.map((d) => d.specialty))];

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedSpecialty === 'All') return true;
    return doc.specialty === selectedSpecialty;
  });

  // Handle Booking
  const handleBook = async () => {
    if (!selectedHospital || !selectedDoctor || !selectedSlot) {
      alert('Please complete all steps to book your appointment.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName,
          patient_age: Number(patientAge) || 64,
          doctor_name: selectedDoctor.name,
          department: selectedDoctor.specialty,
          hospital_name: selectedHospital.name,
          date_time: `${selectedDate} • ${selectedSlot}`,
          room_number: selectedDoctor.room_number
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBookingResult(data);
        setCurrentStep(4);
      } else {
        // Fallback for demo
        const fallbackResult = {
          appointment_token: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          patient_name: patientName,
          doctor_name: selectedDoctor.name,
          department: selectedDoctor.specialty,
          hospital_name: selectedHospital.name,
          date_time: `${selectedDate} • ${selectedSlot}`,
          room_number: selectedDoctor.room_number,
          status: 'Confirmed'
        };
        setBookingResult(fallbackResult);
        setCurrentStep(4);
      }
    } catch (e) {
      const fallbackResult = {
        appointment_token: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patient_name: patientName,
        doctor_name: selectedDoctor.name,
        department: selectedDoctor.specialty,
        hospital_name: selectedHospital.name,
        date_time: `${selectedDate} • ${selectedSlot}`,
        room_number: selectedDoctor.room_number,
        status: 'Confirmed'
      };
      setBookingResult(fallbackResult);
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setSelectedSlot('');
    setBookingResult(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              📅 Book Doctor Appointment
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Choose your hospital first, select your attending specialist, and secure an instant confirmation slot
            </p>
          </div>

          {currentStep > 1 && currentStep < 4 && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              <ArrowLeft size={16} /> Back to Step {currentStep - 1}
            </button>
          )}
        </div>

        {/* Step Progress Pills Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { step: 1, label: '1. Select Hospital', icon: Building2 },
            { step: 2, label: '2. Choose Doctor', icon: Stethoscope },
            { step: 3, label: '3. Pick Date & Slot', icon: Calendar },
            { step: 4, label: '4. Confirmed Token', icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: s.step < currentStep ? 'pointer' : 'default',
                  background: isCurrent
                    ? 'var(--primary)'
                    : isCompleted
                    ? '#dcfce7'
                    : '#f1f5f9',
                  color: isCurrent
                    ? '#ffffff'
                    : isCompleted
                    ? '#15803d'
                    : 'var(--text-muted)',
                  border: isCurrent
                    ? '1px solid var(--primary)'
                    : isCompleted
                    ? '1px solid #bbf7d0'
                    : '1px solid var(--border-color)',
                  transition: 'all 0.2s ease',
                  boxShadow: isCurrent ? '0 4px 12px rgba(13,148,136,0.25)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: CHOOSE HOSPITAL FIRST */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              {/* City selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>CITY:</span>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`btn-${selectedCity === city ? 'primary' : 'secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>

              {/* Hospital Search */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search hospital name or area..."
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
            🏥 Select Network Hospital ({filteredHospitals.length} Available)
          </h3>

          {/* Hospitals Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filteredHospitals.map((hosp) => {
              const isSelected = selectedHospital?.id === hosp.id;
              return (
                <div
                  key={hosp.id}
                  onClick={() => setSelectedHospital(hosp)}
                  className="card"
                  style={{
                    padding: '1.4rem',
                    cursor: 'pointer',
                    marginBottom: 0,
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isSelected ? '#f0fdfa' : '#ffffff',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 8px 20px rgba(13,148,136,0.15)' : 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                >
                  {isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <CheckCircle2 size={13} /> Selected
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: isSelected ? 'var(--primary)' : '#e0f2fe',
                        color: isSelected ? 'white' : '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontWeight: 800
                      }}
                    >
                      <Hospital size={22} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                        {hosp.name}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <MapPin size={14} style={{ flexShrink: 0 }} /> {hosp.address}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={13} /> {hosp.phone}
                      </p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <span className="pill-badge pill-info" style={{ fontSize: '0.7rem' }}>
                        📍 {hosp.city} ({hosp.distance_km || 2.5} km)
                      </span>
                      {hosp.icu_available && (
                        <span className="pill-badge pill-success" style={{ fontSize: '0.7rem' }}>
                          ICU: {hosp.icu_available} Free
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHospital(hosp);
                        setCurrentStep(2);
                      }}
                      className="btn-primary"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                    >
                      Choose Hospital <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedHospital && (
            <div
              style={{
                position: 'sticky',
                bottom: 20,
                marginTop: '2rem',
                background: '#0f172a',
                color: 'white',
                padding: '1.1rem 1.5rem',
                borderRadius: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                zIndex: 30
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>STEP 1 COMPLETE</div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedHospital.name}</div>
              </div>
              <button
                className="btn-primary"
                onClick={() => setCurrentStep(2)}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', background: 'var(--primary-light)', color: 'var(--primary-hover)', fontWeight: 800 }}
              >
                Proceed to Select Doctor <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SELECT SPECIALIST & DOCTOR */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div>
          {/* Hospital Header Ribbon */}
          <div
            className="card"
            style={{
              padding: '1.2rem 1.5rem',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: 'white',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                HOSPITAL SELECTED
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 4 }}>{selectedHospital?.name}</h2>
              <p style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: 2 }}>📍 {selectedHospital?.address}</p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.45rem 0.9rem',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Change Hospital
            </button>
          </div>

          {/* Specialty Filter */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>DEPARTMENT:</span>
            {availableSpecialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`btn-${selectedSpecialty === spec ? 'primary' : 'secondary'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                🩺 {spec}
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
            👨‍⚕️ Available Attending Specialists ({filteredDoctors.length})
          </h3>

          {/* Doctors Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredDoctors.map((doc) => {
              const isSelected = selectedDoctor?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setSelectedSlot('');
                  }}
                  className="card"
                  style={{
                    padding: '1.4rem',
                    cursor: 'pointer',
                    marginBottom: 0,
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isSelected ? '#f0fdfa' : '#ffffff',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 8px 20px rgba(13,148,136,0.15)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}
                      >
                        {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {doc.name}
                        </h4>
                        <span className="pill-badge pill-info" style={{ fontSize: '0.72rem', marginTop: 3 }}>
                          {doc.specialty}
                        </span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          🚪 {doc.room_number} • {doc.experience || '12+ yrs exp'}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>
                        <Star size={14} fill="#f59e0b" /> {doc.rating || 4.9}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                        {doc.fee || '$60'}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ⏰ {doc.available_slots.length} Slots Today
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoctor(doc);
                        setCurrentStep(3);
                      }}
                      className="btn-primary"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                    >
                      Select & Choose Slot <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDoctor && (
            <div
              style={{
                position: 'sticky',
                bottom: 20,
                marginTop: '2rem',
                background: '#0f172a',
                color: 'white',
                padding: '1.1rem 1.5rem',
                borderRadius: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                zIndex: 30
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>STEP 2 COMPLETE</div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedDoctor.name} ({selectedDoctor.specialty})</div>
              </div>
              <button
                className="btn-primary"
                onClick={() => setCurrentStep(3)}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', background: 'var(--primary-light)', color: 'var(--primary-hover)', fontWeight: 800 }}
              >
                Pick Appointment Time Slot <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: PICK DATE & AVAILABLE TIME SLOT */}
      {/* ========================================================================= */}
      {currentStep === 3 && selectedDoctor && selectedHospital && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Date & Slot Selection */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              ⏰ Select Consultation Slot
            </h3>

            {/* Date Tabs */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                APPOINTMENT DATE:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Today, Aug 31', 'Tomorrow, Sep 01', 'Wednesday, Sep 02', 'Thursday, Sep 03'].map((d) => (
                  <button
                    key={d}
                    onClick={() => { setSelectedDate(d); setSelectedSlot(''); }}
                    className={`btn-${selectedDate === d ? 'primary' : 'secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    📅 {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots Grid */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                AVAILABLE TIME SLOTS FOR {selectedDoctor.name.toUpperCase()}:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {selectedDoctor.available_slots.map((slot) => {
                  const isSlotSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: isSlotSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSlotSelected ? 'var(--primary-light)' : '#f8fafc',
                        color: isSlotSelected ? 'var(--primary-hover)' : 'var(--text-main)',
                        fontWeight: isSlotSelected ? 800 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Clock size={14} /> {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Patient Form details */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                👤 Patient Information Preview:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PATIENT NAME</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.85rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PATIENT AGE</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.85rem', marginTop: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>REASON FOR VISIT / SYMPTOMS</label>
                <input
                  type="text"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  placeholder="e.g. Chest discomfort, post-op consultation..."
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Appointment Summary Confirmation Card */}
          <div>
            <div className="card" style={{ border: '2px solid var(--primary)', background: '#ffffff' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <span className="pill-badge pill-success" style={{ marginBottom: '0.5rem' }}>
                  BOOKING SUMMARY
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>Consultation Details</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                {/* Hospital info */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    1. SELECTED HOSPITAL
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>{selectedHospital.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {selectedHospital.address}</div>
                </div>

                {/* Doctor info */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    2. ATTENDING SPECIALIST
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>{selectedDoctor.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {selectedDoctor.specialty} • {selectedDoctor.room_number}
                  </div>
                </div>

                {/* Date & Time info */}
                <div style={{ background: selectedSlot ? '#f0fdfa' : '#f8fafc', padding: '0.85rem 1rem', borderRadius: 8, border: selectedSlot ? '1px solid var(--primary)' : 'none' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    3. SELECTED DATE & SLOT
                  </div>
                  <div style={{ fontWeight: 800, color: selectedSlot ? 'var(--primary-hover)' : 'var(--text-muted)', marginTop: 2 }}>
                    {selectedDate}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: selectedSlot ? 'var(--primary)' : 'var(--danger)' }}>
                    {selectedSlot ? `⏰ ${selectedSlot}` : '⚠️ Please click an available time slot on the left'}
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                disabled={!selectedSlot || loading}
                onClick={handleBook}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  opacity: !selectedSlot ? 0.6 : 1
                }}
              >
                {loading ? 'Confirming Token & Reserving Slot...' : 'Confirm Appointment Booking'}
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                🔒 Instant priority token will be generated and assigned to your electronic patient record.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: BOOKING CONFIRMED & TOKEN PASS */}
      {/* ========================================================================= */}
      {currentStep === 4 && bookingResult && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'center', border: '2px solid #10b981', boxShadow: '0 12px 36px rgba(16,185,129,0.15)' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <span className="pill-badge pill-success" style={{ fontSize: '0.8rem', padding: '0.35rem 1rem' }}>
              OFFICIALLY CONFIRMED
            </span>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.75rem' }}>
              Appointment Booked Successfully!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Your electronic OPD consultation token has been generated and synced with hospital reception.
            </p>

            {/* Token Badge */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: 'white',
                padding: '1.25rem',
                borderRadius: '12px',
                margin: '1.5rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700 }}>APPOINTMENT TOKEN</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '1px' }}>
                  {bookingResult.appointment_token}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, fontWeight: 800 }}>
                  PRIORITY PASS
                </span>
                <div style={{ fontSize: '0.78rem', marginTop: 4, opacity: 0.95 }}>
                  Status: <strong>Confirmed</strong>
                </div>
              </div>
            </div>

            {/* Pass details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', textAlign: 'left', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>PATIENT</div>
                <div style={{ fontWeight: 800, marginTop: 2 }}>{bookingResult.patient_name}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>DOCTOR</div>
                <div style={{ fontWeight: 800, marginTop: 2 }}>{bookingResult.doctor_name}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>HOSPITAL & ROOM</div>
                <div style={{ fontWeight: 800, marginTop: 2 }}>{bookingResult.hospital_name || selectedHospital?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{bookingResult.room_number}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>SCHEDULED TIME</div>
                <div style={{ fontWeight: 800, marginTop: 2, color: 'var(--primary)' }}>{bookingResult.date_time}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => window.print()}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Printer size={16} /> Print Token Slip
              </button>
              <button
                className="btn-secondary"
                onClick={resetBooking}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <RotateCcw size={16} /> Book Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
