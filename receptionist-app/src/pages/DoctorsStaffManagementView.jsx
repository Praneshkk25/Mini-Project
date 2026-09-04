import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Calendar,
  Clock,
  Edit3,
  CheckCircle2,
  XCircle,
  UserCheck,
  Building2,
  Stethoscope,
  Phone,
  Mail,
  Shield,
  Save,
  X
} from 'lucide-react';

export const INITIAL_DOCTORS = [
  {
    id: 'DOC-101',
    name: 'Dr. Sarah Jenkins',
    doctor_id: 'DOC-CAR-101',
    employee_id: 'EMP-CAR-8401',
    department: 'Cardiology',
    specialization: 'Interventional Cardiology',
    qualification: 'MD, DM (Cardiology), FACC',
    registration_number: 'MCI-REG-84920-IND',
    experience_years: 16,
    consultation_fee: 800,
    room: 'Suite 204 (2nd Floor)',
    opd_status: 'AVAILABLE',
    account_status: 'ACTIVE',
    phone: '+91 98401 55678',
    email: 'sarah.jenkins@aurahealth.org',
    schedule: {
      Monday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
      Tuesday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
      Wednesday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
      Thursday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
      Friday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
      Saturday: { available: true, start: '09:00 AM', end: '01:00 PM', max_opd: 15 },
      Sunday: { available: false, start: '--', end: '--', max_opd: 0 }
    }
  },
  {
    id: 'DOC-102',
    name: 'Dr. Arun Kumar',
    doctor_id: 'DOC-NEU-102',
    employee_id: 'EMP-NEU-8402',
    department: 'Neurology',
    specialization: 'Stroke & Neuro-Electrophysiology',
    qualification: 'MBBS, MD, DM (Neurology)',
    registration_number: 'MCI-REG-91024-IND',
    experience_years: 14,
    consultation_fee: 900,
    room: 'Room 305 (3rd Floor)',
    opd_status: 'IN_CONSULTATION',
    account_status: 'ACTIVE',
    phone: '+91 98402 77890',
    email: 'arun.kumar@aurahealth.org',
    schedule: {
      Monday: { available: true, start: '10:00 AM', end: '04:00 PM', max_opd: 25 },
      Tuesday: { available: true, start: '10:00 AM', end: '04:00 PM', max_opd: 25 },
      Wednesday: { available: true, start: '10:00 AM', end: '04:00 PM', max_opd: 25 },
      Thursday: { available: true, start: '10:00 AM', end: '04:00 PM', max_opd: 25 },
      Friday: { available: true, start: '10:00 AM', end: '04:00 PM', max_opd: 25 },
      Saturday: { available: false, start: '--', end: '--', max_opd: 0 },
      Sunday: { available: false, start: '--', end: '--', max_opd: 0 }
    }
  },
  {
    id: 'DOC-103',
    name: 'Dr. Priya Sharma',
    doctor_id: 'DOC-MED-103',
    employee_id: 'EMP-MED-8403',
    department: 'General Medicine',
    specialization: 'Internal Medicine & Diabetology',
    qualification: 'MBBS, MD (General Medicine)',
    registration_number: 'MCI-REG-77412-IND',
    experience_years: 11,
    consultation_fee: 500,
    room: 'Room 102 (1st Floor)',
    opd_status: 'AVAILABLE',
    account_status: 'ACTIVE',
    phone: '+91 98403 11234',
    email: 'priya.sharma@aurahealth.org',
    schedule: {
      Monday: { available: true, start: '08:30 AM', end: '04:30 PM', max_opd: 35 },
      Tuesday: { available: true, start: '08:30 AM', end: '04:30 PM', max_opd: 35 },
      Wednesday: { available: true, start: '08:30 AM', end: '04:30 PM', max_opd: 35 },
      Thursday: { available: true, start: '08:30 AM', end: '04:30 PM', max_opd: 35 },
      Friday: { available: true, start: '08:30 AM', end: '04:30 PM', max_opd: 35 },
      Saturday: { available: true, start: '09:00 AM', end: '02:00 PM', max_opd: 20 },
      Sunday: { available: false, start: '--', end: '--', max_opd: 0 }
    }
  },
  {
    id: 'DOC-104',
    name: 'Dr. Rajesh Menon',
    doctor_id: 'DOC-ORT-104',
    employee_id: 'EMP-ORT-8404',
    department: 'Orthopedics',
    specialization: 'Joint Replacement & Trauma Surgery',
    qualification: 'MS (Orthopedics), MCh, Fellowship UK',
    registration_number: 'MCI-REG-66389-IND',
    experience_years: 18,
    consultation_fee: 850,
    room: 'Room 210 (2nd Floor)',
    opd_status: 'AVAILABLE',
    account_status: 'ACTIVE',
    phone: '+91 98404 99887',
    email: 'rajesh.menon@aurahealth.org',
    schedule: {
      Monday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
      Tuesday: { available: false, start: '--', end: '--', max_opd: 0 },
      Wednesday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
      Thursday: { available: false, start: '--', end: '--', max_opd: 0 },
      Friday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
      Saturday: { available: true, start: '09:00 AM', end: '01:00 PM', max_opd: 15 },
      Sunday: { available: false, start: '--', end: '--', max_opd: 0 }
    }
  },
  {
    id: 'DOC-105',
    name: 'Dr. Ananya Sen',
    doctor_id: 'DOC-PED-105',
    employee_id: 'EMP-PED-8405',
    department: 'Pediatrics',
    specialization: 'Neonatology & Child Health',
    qualification: 'MD (Pediatrics), DCH',
    registration_number: 'MCI-REG-55201-IND',
    experience_years: 9,
    consultation_fee: 600,
    room: 'Room 108 (1st Floor)',
    opd_status: 'AVAILABLE',
    account_status: 'ACTIVE',
    phone: '+91 98405 33445',
    email: 'ananya.sen@aurahealth.org',
    schedule: {
      Monday: { available: true, start: '09:00 AM', end: '04:00 PM', max_opd: 30 },
      Tuesday: { available: true, start: '09:00 AM', end: '04:00 PM', max_opd: 30 },
      Wednesday: { available: true, start: '09:00 AM', end: '04:00 PM', max_opd: 30 },
      Thursday: { available: true, start: '09:00 AM', end: '04:00 PM', max_opd: 30 },
      Friday: { available: true, start: '09:00 AM', end: '04:00 PM', max_opd: 30 },
      Saturday: { available: false, start: '--', end: '--', max_opd: 0 },
      Sunday: { available: false, start: '--', end: '--', max_opd: 0 }
    }
  },
  {
    id: 'DOC-106',
    name: 'Dr. Vikram Malhotra',
    doctor_id: 'DOC-EMR-106',
    employee_id: 'EMP-EMR-8406',
    department: 'Emergency',
    specialization: 'Emergency Trauma & Critical Care',
    qualification: 'MBBS, MEM (Emergency Medicine)',
    registration_number: 'MCI-REG-44119-IND',
    experience_years: 12,
    consultation_fee: 1000,
    room: 'Emergency Triage Bay A',
    opd_status: 'AVAILABLE',
    account_status: 'ACTIVE',
    phone: '+91 98406 88776',
    email: 'vikram.malhotra@aurahealth.org',
    schedule: {
      Monday: { available: true, start: '00:00 AM', end: '11:59 PM', max_opd: 100 },
      Tuesday: { available: true, start: '00:00 AM', end: '11:59 PM', max_opd: 100 },
      Wednesday: { available: true, start: '00:00 AM', end: '11:59 PM', max_opd: 100 },
      Thursday: { available: true, start: '00:00 AM', end: '11:59 PM', max_opd: 100 },
      Friday: { available: true, start: '00:00 AM', end: '11:59 PM', max_opd: 100 },
      Saturday: { available: true, start: '00:00 AM', end: '11:59 PM', max_opd: 100 },
      Sunday: { available: true, start: '00:00 AM', end: '11:59 PM', max_opd: 100 }
    }
  }
];

export default function DoctorsStaffManagementView() {
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    department: 'Cardiology',
    specialization: '',
    qualification: '',
    registration_number: '',
    experience_years: 5,
    consultation_fee: 600,
    room: '',
    phone: '',
    email: ''
  });

  const filteredDoctors = doctors.filter((doc) => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.doctor_id.toLowerCase().includes(search.toLowerCase()) || doc.specialization.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || doc.department === deptFilter;
    const matchStatus = statusFilter === 'All' || doc.account_status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      department: 'Cardiology',
      specialization: '',
      qualification: '',
      registration_number: `MCI-REG-${Math.floor(10000 + Math.random() * 90000)}-IND`,
      experience_years: 8,
      consultation_fee: 700,
      room: 'Consultation Room 105',
      phone: '+91 98400 00000',
      email: 'new.doctor@aurahealth.org'
    });
    setIsAdding(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const newDoc = {
      id: `DOC-${Math.floor(200 + Math.random() * 800)}`,
      name: formData.name.startsWith('Dr.') ? formData.name : `Dr. ${formData.name}`,
      doctor_id: `DOC-${formData.department.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      employee_id: `EMP-${formData.department.slice(0, 3).toUpperCase()}-${Math.floor(8000 + Math.random() * 1000)}`,
      department: formData.department,
      specialization: formData.specialization,
      qualification: formData.qualification,
      registration_number: formData.registration_number,
      experience_years: Number(formData.experience_years),
      consultation_fee: Number(formData.consultation_fee),
      room: formData.room,
      opd_status: 'AVAILABLE',
      account_status: 'ACTIVE',
      phone: formData.phone,
      email: formData.email,
      schedule: {
        Monday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
        Tuesday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
        Wednesday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
        Thursday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
        Friday: { available: true, start: '09:00 AM', end: '05:00 PM', max_opd: 30 },
        Saturday: { available: false, start: '--', end: '--', max_opd: 0 },
        Sunday: { available: false, start: '--', end: '--', max_opd: 0 }
      }
    };
    setDoctors([...doctors, newDoc]);
    setIsAdding(false);
    alert(`✓ Doctor profile created for ${newDoc.name} (${newDoc.doctor_id})`);
  };

  const handleToggleStatus = (id) => {
    setDoctors(doctors.map((d) => (d.id === id ? { ...d, account_status: d.account_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : d)));
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Doctors & Staff Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Hospital medical faculty roster, OPD schedules, credentials, and practice room allocations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleOpenAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}>
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', background: '#f8fafc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by doctor name, ID, or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
              <option value="All">All Account Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                <th style={{ padding: '12px 10px' }}>Doctor Name & ID</th>
                <th style={{ padding: '12px 10px' }}>Department</th>
                <th style={{ padding: '12px 10px' }}>Specialization</th>
                <th style={{ padding: '12px 10px' }}>Qualifications</th>
                <th style={{ padding: '12px 10px' }}>Room / Fee</th>
                <th style={{ padding: '12px 10px' }}>OPD Status</th>
                <th style={{ padding: '12px 10px' }}>Account</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{doc.name}</div>
                    <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>{doc.doctor_id} &bull; Reg: {doc.registration_number}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {doc.department}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#475569' }}>{doc.specialization}</td>
                  <td style={{ padding: '12px 10px', color: '#64748b' }}>{doc.qualification} ({doc.experience_years} yrs)</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{doc.room}</div>
                    <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>₹{doc.consultation_fee} OPD</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontSize: '11px', background: doc.opd_status === 'AVAILABLE' ? '#dcfce7' : '#fef3c7', color: doc.opd_status === 'AVAILABLE' ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ● {doc.opd_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontSize: '11px', background: doc.account_status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: doc.account_status === 'ACTIVE' ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {doc.account_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setScheduleDoctor(doc)} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={12} /> Schedule
                      </button>
                      <button onClick={() => setSelectedDoctor(doc)} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Edit3 size={12} /> View
                      </button>
                      <button
                        onClick={() => handleToggleStatus(doc.id)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: doc.account_status === 'ACTIVE' ? '#fef2f2' : '#f0fdf4',
                          color: doc.account_status === 'ACTIVE' ? '#b91c1c' : '#15803d',
                          fontWeight: 700
                        }}
                      >
                        {doc.account_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Profile View Modal */}
      {selectedDoctor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '640px', padding: '24px', background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  PRACTITIONER PROFILE
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>{selectedDoctor.name}</h3>
              </div>
              <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><span style={{ color: '#64748b' }}>Doctor ID:</span> <strong>{selectedDoctor.doctor_id}</strong></div>
                <div><span style={{ color: '#64748b' }}>Employee ID:</span> <strong>{selectedDoctor.employee_id}</strong></div>
                <div><span style={{ color: '#64748b' }}>Medical Registration:</span> <strong>{selectedDoctor.registration_number}</strong></div>
                <div><span style={{ color: '#64748b' }}>Experience:</span> <strong>{selectedDoctor.experience_years} Years</strong></div>
                <div><span style={{ color: '#64748b' }}>Consultation Fee:</span> <strong style={{ color: '#15803d' }}>₹{selectedDoctor.consultation_fee}</strong></div>
                <div><span style={{ color: '#64748b' }}>Assigned Room:</span> <strong>{selectedDoctor.room}</strong></div>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>Contact Details:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#475569' }}>Phone: {selectedDoctor.phone} &bull; Email: {selectedDoctor.email}</p>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>Qualifications & Specialization:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#475569' }}>{selectedDoctor.qualification} &bull; Specialization: {selectedDoctor.specialization}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setSelectedDoctor(null)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Schedule Modal */}
      {scheduleDoctor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '680px', padding: '24px', background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  OPD ROSTER & AVAILABILITY
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>Weekly Schedule: {scheduleDoctor.name}</h3>
              </div>
              <button onClick={() => setScheduleDoctor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(scheduleDoctor.schedule).map(([day, s]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: s.available ? '#f8fafc' : '#fee2e2', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <div style={{ width: '100px', fontWeight: 700, color: s.available ? '#0f172a' : '#b91c1c' }}>{day}</div>
                  <div>
                    {s.available ? (
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>Shift: {s.start} &ndash; {s.end}</span>
                    ) : (
                      <span style={{ color: '#991b1b', fontWeight: 600 }}>Unavailable / Off</span>
                    )}
                  </div>
                  <div>
                    {s.available && <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Cap: {s.max_opd} OPD Tokens</span>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setScheduleDoctor(null); alert('✓ Weekly OPD schedule updated and synced with appointment booking calendar.'); }} className="btn-primary">
                Save & Synchronize Slots
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '580px', padding: '24px', background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>➕ Register New Hospital Doctor</h3>
              <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Practitioner Name *</label>
                  <input type="text" required placeholder="e.g. Dr. Priya Sharma" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Department *</label>
                    <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>General Medicine</option>
                      <option>Orthopedics</option>
                      <option>Pediatrics</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Specialization *</label>
                    <input type="text" required placeholder="e.g. Diabetology" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Qualifications *</label>
                    <input type="text" required placeholder="e.g. MBBS, MD" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Consultation Fee (INR ₹) *</label>
                    <input type="number" required value={formData.consultation_fee} onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Room / OPD Bay</label>
                    <input type="text" required value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Register Practitioner</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
