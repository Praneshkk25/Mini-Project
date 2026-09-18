import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Calendar,
  CheckSquare,
  Clock,
  Bed,
  FileCheck,
  CreditCard,
  Bell,
  Plus,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Phone,
  UserCheck,
  Building2,
  BarChart3,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  Printer,
  Download,
  X
} from 'lucide-react';
import DoctorsStaffManagementView, { INITIAL_DOCTORS } from './DoctorsStaffManagementView';
import DepartmentManagementView from './DepartmentManagementView';
import ReportsAnalyticsView from './ReportsAnalyticsView';
import AuditLogsView from './AuditLogsView';
import HospitalAdminDashboardView from './HospitalAdminDashboardView';

const API_BASE = 'http://localhost:8000/api';

export default function ReceptionOpsHub({ activeTab = 'dashboard', user, onSelectTab }) {
  const [appointments, setAppointments] = useState([
    {
      id: 'APT-2026-901',
      appointment_token: '01',
      patient_name: 'James Robertson',
      uhid: 'UHID-2026-884920',
      patient_age: 58,
      gender: 'Male',
      phone: '+91 98765 43210',
      doctor_name: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      date: '2026-08-31',
      time_slot: '10:30 AM',
      type: 'Routine Consultation',
      status: 'In Consultation',
      priority: 'Routine'
    },
    {
      id: 'APT-2026-902',
      appointment_token: '02',
      patient_name: 'Eleanor Vance',
      uhid: 'UHID-2026-884921',
      patient_age: 42,
      gender: 'Female',
      phone: '+91 98765 43212',
      doctor_name: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      date: '2026-08-31',
      time_slot: '11:00 AM',
      type: 'Follow-Up',
      status: 'Checked-In',
      priority: 'Routine'
    },
    {
      id: 'APT-2026-903',
      appointment_token: '03',
      patient_name: 'Meera Nambiar',
      uhid: 'UHID-2026-884922',
      patient_age: 64,
      gender: 'Female',
      phone: '+91 98765 43213',
      doctor_name: 'Dr. Arun Kumar',
      department: 'Neurology',
      date: '2026-08-31',
      time_slot: '11:30 AM',
      type: 'Emergency Triage',
      status: 'Waiting',
      priority: 'Urgent'
    }
  ]);

  const [beds, setBeds] = useState([
    { bed_number: 'ICU-101', ward: 'ICU', room: 'Suite 1', status: 'OCCUPIED', patient_name: 'Eleanor Vance', doctor: 'Dr. Sarah Jenkins' },
    { bed_number: 'ICU-102', ward: 'ICU', room: 'Suite 2', status: 'OCCUPIED', patient_name: 'Meera Nambiar', doctor: 'Dr. Arun Kumar' },
    { bed_number: 'ICU-103', ward: 'ICU', room: 'Suite 3', status: 'AVAILABLE', patient_name: null, doctor: null },
    { bed_number: 'GW-201', ward: 'General Ward', room: 'Room 201', status: 'OCCUPIED', patient_name: 'Ramesh Patel', doctor: 'Dr. Priya Sharma' },
    { bed_number: 'GW-202', ward: 'General Ward', room: 'Room 202', status: 'CLEANING', patient_name: null, doctor: null },
    { bed_number: 'GW-203', ward: 'General Ward', room: 'Room 203', status: 'AVAILABLE', patient_name: null, doctor: null },
    { bed_number: 'EMR-01', ward: 'Emergency', room: 'Bay 1', status: 'OCCUPIED', patient_name: 'Amitabh Sen', doctor: 'Dr. Vikram Malhotra' },
    { bed_number: 'EMR-02', ward: 'Emergency', room: 'Bay 2', status: 'AVAILABLE', patient_name: null, doctor: null },
    { bed_number: 'PED-301', ward: 'Pediatrics', room: 'Room 301', status: 'AVAILABLE', patient_name: null, doctor: null }
  ]);

  const [queue, setQueue] = useState([
    { token: '01', patient_name: 'James Robertson', uhid: 'UHID-2026-884920', doctor: 'Dr. Sarah Jenkins', department: 'Cardiology', arrival: '10:15 AM', priority: 'Routine', status: 'In Consultation', wait_time: '15m' },
    { token: '02', patient_name: 'Eleanor Vance', uhid: 'UHID-2026-884921', doctor: 'Dr. Sarah Jenkins', department: 'Cardiology', arrival: '10:35 AM', priority: 'Routine', status: 'Called', wait_time: '10m' },
    { token: '03', patient_name: 'Meera Nambiar', uhid: 'UHID-2026-884922', doctor: 'Dr. Arun Kumar', department: 'Neurology', arrival: '10:45 AM', priority: 'Urgent', status: 'Waiting', wait_time: '5m' }
  ]);

  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2026-8801',
      patient_name: 'James Robertson',
      uhid: 'UHID-2026-884920',
      doctor: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      services: 'Consultation (₹800), 12-Lead ECG (₹400)',
      subtotal: 1200,
      discount: 0,
      tax: 0,
      total: 1200,
      payment_method: 'UPI',
      status: 'PAID'
    },
    {
      id: 'INV-2026-8802',
      patient_name: 'Eleanor Vance',
      uhid: 'UHID-2026-884921',
      doctor: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      services: 'Consultation (₹800), Pharmacy (₹350)',
      subtotal: 1150,
      discount: 50,
      tax: 0,
      total: 1100,
      payment_method: 'Card',
      status: 'PAID'
    },
    {
      id: 'INV-2026-8803',
      patient_name: 'Meera Nambiar',
      uhid: 'UHID-2026-884922',
      doctor: 'Dr. Arun Kumar',
      department: 'Neurology',
      services: 'Consultation (₹900), ICU Bed Charge (₹3,500)',
      subtotal: 4400,
      discount: 0,
      tax: 0,
      total: 4400,
      payment_method: 'Insurance',
      status: 'PENDING'
    }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Emergency', message: 'Urgent Triage: Meera Nambiar checked in for Neurology consult.', time: '10m ago', priority: 'HIGH', read: false },
    { id: 2, type: 'Bed', message: 'Bed GW-202 moved to CLEANING status post-discharge.', time: '25m ago', priority: 'NORMAL', read: false },
    { id: 3, type: 'Appointment', message: 'New appointment scheduled with Dr. Sarah Jenkins.', time: '1h ago', priority: 'NORMAL', read: true }
  ]);

  // Search & Patient Overview Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientOverview, setSelectedPatientOverview] = useState(null);
  const [patientOverviewTab, setPatientOverviewTab] = useState('overview');

  // Registration Form — expanded
  const [regForm, setRegForm] = useState({
    name: '',
    dob: '',
    age: '',
    gender: 'Female',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Delhi',
    pincode: '',
    blood_group: 'O+',
    allergies: 'None known',
    conditions: 'None',
    medications: 'None',
    abha_id: '',
    emergency_name: '',
    emergency_relation: 'Spouse',
    emergency_phone: '',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Jenkins',
    chief_complaint: '',
    visit_type: 'OPD Walk-In',
    priority: 'Routine',
    photo: null,        // placeholder — stores DataURL
  });
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [regSuccess, setRegSuccess]             = useState(null); // holds newly created patient
  const [regStep, setRegStep]                   = useState(1);    // 1=Demographics 2=Clinical 3=Review

  // Check-In & Triage Workflow (5 Steps)
  const [checkinStep, setCheckinStep] = useState(1);
  const [checkinSearch, setCheckinSearch] = useState('');
  const [checkinPatient, setCheckinPatient] = useState(null);
  const [triageData, setTriageData] = useState({
    temp: '36.8',
    bp: '120/80',
    hr: '74',
    spo2: '98',
    weight: '68',
    complaint: 'Mild chest discomfort',
    priority: 'Routine'
  });
  const [generatedTokenPass, setGeneratedTokenPass] = useState(null);

  // Book Appointment Modal
  const [showBookAptModal, setShowBookAptModal] = useState(false);
  const [newAptData, setNewAptData] = useState({
    patient_name: '',
    uhid: '',
    phone: '',
    department: 'Cardiology',
    doctor_name: 'Dr. Sarah Jenkins',
    date: new Date().toISOString().split('T')[0],
    time_slot: '11:00 AM',
    type: 'Routine Consultation',
    priority: 'Routine'
  });

  // Assign Bed Modal
  const [showAssignBedModal, setShowAssignBedModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [assignBedPatient, setAssignBedPatient] = useState('');

  // Collect Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Duplicate Check
  const handlePhoneOrAbhaChange = (field, val) => {
    setRegForm((prev) => ({ ...prev, [field]: val }));
    if (val.length >= 6) {
      const duplicate = appointments.find(
        (a) => (field === 'phone' && a.phone === val) || (field === 'abha_id' && a.uhid === val)
      );
      if (duplicate) {
        setDuplicateWarning(`⚠️ Existing patient record found: ${duplicate.patient_name} (${duplicate.uhid})`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  // 1. Submit Registration (expanded)
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const uhid  = `UHID-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const token = `0${appointments.length + 1}`;

    const newApt = {
      id:                `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      appointment_token: token,
      patient_name:      regForm.name,
      uhid,
      patient_age:       Number(regForm.age) || 35,
      gender:            regForm.gender,
      phone:             regForm.phone,
      doctor_name:       regForm.doctor,
      department:        regForm.department,
      date:              new Date().toISOString().split('T')[0],
      time_slot:         'Walk-In',
      type:              regForm.visit_type,
      status:            'Checked-In',
      priority:          regForm.priority,
    };

    setAppointments([newApt, ...appointments]);
    setQueue([...queue, {
      token,
      patient_name: regForm.name,
      uhid,
      doctor:       regForm.doctor,
      department:   regForm.department,
      arrival:      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority:     regForm.priority,
      status:       'Waiting',
      wait_time:    '0m',
    }]);

    setRegSuccess({ name: regForm.name, uhid, token });

    // Reset form back to step 1
    setRegForm({
      name: '', dob: '', age: '', gender: 'Female', phone: '', email: '',
      address: '', city: '', state: 'Delhi', pincode: '', blood_group: 'O+',
      allergies: 'None known', conditions: 'None', medications: 'None',
      abha_id: '', emergency_name: '', emergency_relation: 'Spouse', emergency_phone: '',
      department: 'Cardiology', doctor: 'Dr. Sarah Jenkins',
      chief_complaint: '', visit_type: 'OPD Walk-In', priority: 'Routine', photo: null,
    });
    setDuplicateWarning(null);
    setRegStep(1);
  };

  // 2. Submit Appointment Booking
  const handleBookAppointmentSubmit = (e) => {
    e.preventDefault();
    // Validate doctor schedule
    const doctorObj = INITIAL_DOCTORS.find((d) => d.name === newAptData.doctor_name);
    const dayOfWeek = new Date(newAptData.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (doctorObj && doctorObj.schedule[dayOfWeek] && !doctorObj.schedule[dayOfWeek].available) {
      alert(`⚠️ ${newAptData.doctor_name} is unavailable on ${dayOfWeek}s. Please choose another date or doctor.`);
      return;
    }

    const created = {
      id: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      appointment_token: `0${appointments.length + 1}`,
      patient_name: newAptData.patient_name,
      uhid: newAptData.uhid || `UHID-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      patient_age: 40,
      gender: 'Male',
      phone: newAptData.phone || '+91 98400 11111',
      doctor_name: newAptData.doctor_name,
      department: newAptData.department,
      date: newAptData.date,
      time_slot: newAptData.time_slot,
      type: newAptData.type,
      status: 'Scheduled',
      priority: newAptData.priority
    };

    setAppointments([created, ...appointments]);
    setShowBookAptModal(false);
    alert(`✓ Appointment booked for ${created.patient_name} with ${created.doctor_name} on ${created.date} at ${created.time_slot}`);
  };

  // 3. Complete 5-Step Triage & Check-in
  const handleGenerateCheckinToken = () => {
    const token = `0${queue.length + 1}`;
    const tokenEntry = {
      token,
      patient_name: checkinPatient.patient_name,
      uhid: checkinPatient.uhid,
      doctor: checkinPatient.doctor_name,
      department: checkinPatient.department,
      arrival: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: triageData.priority,
      status: 'Waiting',
      wait_time: '0m'
    };

    setQueue([...queue, tokenEntry]);
    setAppointments(appointments.map((a) => (a.uhid === checkinPatient.uhid ? { ...a, status: 'Checked-In', priority: triageData.priority } : a)));
    setGeneratedTokenPass(tokenEntry);
    setCheckinStep(5);
  };

  // 4. Finalize Discharge
  const handleFinalizeDischarge = (patientName, bedNumber) => {
    if (confirm(`Confirm clinical discharge for ${patientName}? This will clear patient records and transition bed ${bedNumber} to CLEANING.`)) {
      setBeds(beds.map((b) => (b.bed_number === bedNumber ? { ...b, status: 'CLEANING', patient_name: null, doctor: null } : b)));
      alert(`✓ Patient ${patientName} discharged successfully. Bed ${bedNumber} status updated to CLEANING.`);
    }
  };

  // 5. Bed Actions
  const handleAssignBedSubmit = (e) => {
    e.preventDefault();
    if (!selectedBed || selectedBed.status === 'OCCUPIED') {
      alert('Cannot assign an occupied bed!');
      return;
    }
    setBeds(beds.map((b) => (b.bed_number === selectedBed.bed_number ? { ...b, status: 'OCCUPIED', patient_name: assignBedPatient, doctor: 'Dr. Sarah Jenkins' } : b)));
    setShowAssignBedModal(false);
    alert(`✓ Bed ${selectedBed.bed_number} assigned to ${assignBedPatient}`);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* 1. RECEPTION DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                AuraHealth Operations Console & Reception Desk
              </h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Desk Administrator: <strong>{user?.name || 'Elena Rostova'}</strong> &bull; Central Outpatient Triage & Bed Hub
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onSelectTab('registration')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}>
                <Plus size={16} /> Register Patient
              </button>
            </div>
          </div>

          {/* 4 Primary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TODAY'S APPOINTMENTS</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#0f172a' }}>{appointments.length}</h2>
              <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>{appointments.filter((a) => a.status === 'Checked-In').length} Checked In</span>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>OPD QUEUE WAITING</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#f59e0b' }}>{queue.length}</h2>
              <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>M/M/c Active Flow</span>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>AVAILABLE INPATIENT BEDS</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>{beds.filter((b) => b.status === 'AVAILABLE').length}</h2>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>of {beds.length} Total Units</span>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #0d9488', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TODAY'S REVENUE (INR)</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#0d9488' }}>₹6,750</h2>
              <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: 600 }}>100% Verified Invoices</span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="card" style={{ padding: '16px', marginBottom: '24px', background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Desk Quick Actions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <button onClick={() => onSelectTab('checkin')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#0284c7" /> Check-In & Triage
              </button>
              <button onClick={() => onSelectTab('appointments')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#0284c7" /> Book Appointment
              </button>
              <button onClick={() => onSelectTab('admissions')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bed size={14} color="#0284c7" /> Assign Inpatient Bed
              </button>
              <button onClick={() => onSelectTab('discharge')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={14} color="#0284c7" /> Discharge Clearance
              </button>
            </div>
          </div>

          {/* Recent Live Queue Table */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                📋 Live Outpatient Queue & Consultation Status
              </h3>
              <button onClick={() => onSelectTab('queue')} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>
                View Full Queue &rarr;
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Token</th>
                  <th style={{ padding: '10px' }}>Patient</th>
                  <th style={{ padding: '10px' }}>UHID</th>
                  <th style={{ padding: '10px' }}>Doctor</th>
                  <th style={{ padding: '10px' }}>Department</th>
                  <th style={{ padding: '10px' }}>Priority</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q) => (
                  <tr key={q.token} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>#{q.token}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{q.patient_name}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{q.uhid}</td>
                    <td style={{ padding: '10px' }}>{q.doctor}</td>
                    <td style={{ padding: '10px' }}>{q.department}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: q.priority === 'Urgent' ? '#fee2e2' : '#f1f5f9', color: q.priority === 'Urgent' ? '#b91c1c' : '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {q.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: q.status === 'In Consultation' ? '#e0f2fe' : '#dcfce7', color: q.status === 'In Consultation' ? '#0369a1' : '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PATIENT REGISTRATION — expanded 3-step form */}
      {activeTab === 'registration' && (() => {
        const iStyle = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' };
        const lStyle = { fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#334155' };

        // Step labels
        const REG_STEPS = ['1. Demographics', '2. Medical & Clinical', '3. Review & Confirm'];

        // Auto age from DOB
        const computeAge = (dob) => {
          if (!dob) return '';
          const today = new Date(), b = new Date(dob);
          let age = today.getFullYear() - b.getFullYear();
          if (today.getMonth() - b.getMonth() < 0 || (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) age--;
          return age > 0 ? age : '';
        };

        const setF = (field, val) => setRegForm((prev) => ({ ...prev, [field]: val }));

        return (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* Success banner */}
            {regSuccess && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={28} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#15803d' }}>✓ Patient Registered Successfully!</div>
                    <div style={{ fontSize: '13px', color: '#166534' }}>
                      <strong>{regSuccess.name}</strong> &bull; UHID: <strong>{regSuccess.uhid}</strong> &bull; OPD Token: <strong>#{regSuccess.token}</strong>
                    </div>
                  </div>
                </div>
                <button onClick={() => setRegSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
              </div>
            )}

            <div className="card" style={{ padding: '28px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>➕ New Patient Registration</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Create permanent Hospital UHID and generate an OPD queue token.</p>
                </div>
                {/* Step indicator */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {REG_STEPS.map((label, idx) => (
                    <div key={idx} style={{
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                      background: regStep === idx + 1 ? '#0284c7' : regStep > idx + 1 ? '#10b981' : '#e2e8f0',
                      color: regStep >= idx + 1 ? '#fff' : '#94a3b8',
                    }}>{label}</div>
                  ))}
                </div>
              </div>

              {/* Duplicate warning */}
              {duplicateWarning && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={15} /><strong>{duplicateWarning}</strong>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit}>

                {/* ── STEP 1: DEMOGRAPHICS ── */}
                {regStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Photo upload */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{
                        width: '72px', height: '72px', borderRadius: '50%', border: '2px dashed #94a3b8',
                        background: regForm.photo ? `url(${regForm.photo}) center/cover` : '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0,
                      }}>
                        {!regForm.photo && '👤'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Patient Photo (Optional)</div>
                        <label style={{
                          background: '#0284c7', color: '#fff', padding: '6px 14px', borderRadius: '6px',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-block',
                        }}>
                          📷 Upload Photo
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => setF('photo', ev.target.result);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                        {regForm.photo && <button type="button" onClick={() => setF('photo', null)} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>Remove</button>}
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>JPG, PNG — max 2 MB</div>
                      </div>
                    </div>

                    {/* Name + Gender */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={lStyle}>Full Patient Name <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" required placeholder="e.g. Ramesh Kumar" value={regForm.name}
                          onChange={(e) => setF('name', e.target.value)} style={iStyle} />
                      </div>
                      <div>
                        <label style={lStyle}>Gender <span style={{ color: '#ef4444' }}>*</span></label>
                        <select value={regForm.gender} onChange={(e) => setF('gender', e.target.value)} style={iStyle}>
                          <option>Female</option><option>Male</option><option>Other</option>
                        </select>
                      </div>
                    </div>

                    {/* DOB + Age + Blood Group */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={lStyle}>Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="date" required value={regForm.dob} max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => { setF('dob', e.target.value); setF('age', computeAge(e.target.value)); }} style={iStyle} />
                      </div>
                      <div>
                        <label style={lStyle}>Age (auto-calculated)</label>
                        <input type="text" readOnly value={regForm.age} placeholder="From DOB"
                          style={{ ...iStyle, background: '#f8fafc', color: '#475569' }} />
                      </div>
                      <div>
                        <label style={lStyle}>Blood Group</label>
                        <select value={regForm.blood_group} onChange={(e) => setF('blood_group', e.target.value)} style={iStyle}>
                          {['A+','A−','B+','B−','AB+','AB−','O+','O−','Unknown'].map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Phone + Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={lStyle}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="tel" required placeholder="+91 98765 43210" value={regForm.phone}
                          onChange={(e) => handlePhoneOrAbhaChange('phone', e.target.value)} style={iStyle} />
                      </div>
                      <div>
                        <label style={lStyle}>Email Address</label>
                        <input type="email" placeholder="patient@example.com" value={regForm.email}
                          onChange={(e) => setF('email', e.target.value)} style={iStyle} />
                      </div>
                    </div>

                    {/* Address */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={lStyle}>Street / House Address</label>
                        <input type="text" placeholder="House No., Street, Area" value={regForm.address}
                          onChange={(e) => setF('address', e.target.value)} style={iStyle} />
                      </div>
                      <div>
                        <label style={lStyle}>City</label>
                        <input type="text" value={regForm.city} onChange={(e) => setF('city', e.target.value)}
                          placeholder="New Delhi" style={iStyle} />
                      </div>
                      <div>
                        <label style={lStyle}>PIN Code</label>
                        <input type="text" maxLength={6} value={regForm.pincode} onChange={(e) => setF('pincode', e.target.value)}
                          placeholder="110001" style={iStyle} />
                      </div>
                    </div>

                    {/* ABHA */}
                    <div>
                      <label style={lStyle}>ABHA / National Health ID (Optional)</label>
                      <input type="text" placeholder="e.g. ramesh@abdm or 91-XXXX-XXXX-XXXX" value={regForm.abha_id}
                        onChange={(e) => handlePhoneOrAbhaChange('abha_id', e.target.value)} style={iStyle} />
                    </div>

                    {/* Emergency contact */}
                    <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c', marginBottom: '10px' }}>🆘 Emergency Contact</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={lStyle}>Contact Name</label>
                          <input type="text" placeholder="Full name" value={regForm.emergency_name}
                            onChange={(e) => setF('emergency_name', e.target.value)} style={iStyle} />
                        </div>
                        <div>
                          <label style={lStyle}>Relationship</label>
                          <select value={regForm.emergency_relation} onChange={(e) => setF('emergency_relation', e.target.value)} style={iStyle}>
                            {['Spouse','Parent','Sibling','Child','Friend','Guardian','Other'].map(r => <option key={r}>{r}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lStyle}>Emergency Phone</label>
                          <input type="tel" placeholder="+91 98765 00000" value={regForm.emergency_phone}
                            onChange={(e) => setF('emergency_phone', e.target.value)} style={iStyle} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: MEDICAL & CLINICAL ── */}
                {regStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Allergies + conditions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={lStyle}>Known Drug / Food Allergies</label>
                        <input type="text" placeholder="e.g. Penicillin, Sulfa, None" value={regForm.allergies}
                          onChange={(e) => setF('allergies', e.target.value)} style={iStyle} />
                      </div>
                      <div>
                        <label style={lStyle}>Existing Medical Conditions</label>
                        <input type="text" placeholder="e.g. Diabetes, HTN, None" value={regForm.conditions}
                          onChange={(e) => setF('conditions', e.target.value)} style={iStyle} />
                      </div>
                    </div>

                    {/* Current medications */}
                    <div>
                      <label style={lStyle}>Current Medications</label>
                      <input type="text" placeholder="e.g. Metformin 500mg, Amlodipine 5mg, None" value={regForm.medications}
                        onChange={(e) => setF('medications', e.target.value)} style={iStyle} />
                    </div>

                    {/* Department + Doctor */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={lStyle}>Clinical Department <span style={{ color: '#ef4444' }}>*</span></label>
                        <select value={regForm.department} onChange={(e) => setF('department', e.target.value)} style={iStyle}>
                          <option>Cardiology</option>
                          <option>Neurology</option>
                          <option>General Medicine</option>
                          <option>Orthopedics</option>
                          <option>Pediatrics</option>
                          <option>Dermatology</option>
                          <option>Ophthalmology</option>
                          <option>AYUSH</option>
                          <option>Emergency</option>
                        </select>
                      </div>
                      <div>
                        <label style={lStyle}>Attending Physician <span style={{ color: '#ef4444' }}>*</span></label>
                        <select value={regForm.doctor} onChange={(e) => setF('doctor', e.target.value)} style={iStyle}>
                          <option>Dr. Sarah Jenkins (Cardiology)</option>
                          <option>Dr. Arun Kumar (Neurology)</option>
                          <option>Dr. Priya Sharma (General Medicine)</option>
                          <option>Dr. Rajesh Menon (Orthopedics)</option>
                          <option>Dr. Priya Sundaram (Pediatrics)</option>
                          <option>Dr. Vikram Malhotra (Emergency)</option>
                          <option>Dr. Harshavardhan Rao (AYUSH)</option>
                        </select>
                      </div>
                    </div>

                    {/* Visit type + priority */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={lStyle}>Visit Type</label>
                        <select value={regForm.visit_type} onChange={(e) => setF('visit_type', e.target.value)} style={iStyle}>
                          <option>OPD Walk-In</option>
                          <option>Scheduled Appointment</option>
                          <option>Emergency Visit</option>
                          <option>Follow-Up</option>
                          <option>AYUSH Consultation</option>
                        </select>
                      </div>
                      <div>
                        <label style={lStyle}>Triage Priority</label>
                        <select value={regForm.priority} onChange={(e) => setF('priority', e.target.value)} style={iStyle}>
                          <option value="Routine">Routine</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Immediate">Immediate / Emergency</option>
                        </select>
                      </div>
                    </div>

                    {/* Chief complaint */}
                    <div>
                      <label style={lStyle}>Chief Complaint / Reason for Visit</label>
                      <textarea rows={3} placeholder="Describe the patient's main complaint in brief…"
                        value={regForm.chief_complaint} onChange={(e) => setF('chief_complaint', e.target.value)}
                        style={{ ...iStyle, resize: 'vertical' }} />
                    </div>
                  </div>
                )}

                {/* ── STEP 3: REVIEW ── */}
                {regStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px' }}>
                      <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>📋 Registration Review</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', fontSize: '13px', color: '#334155' }}>
                        <div>Name: <strong>{regForm.name}</strong></div>
                        <div>Age / Gender: <strong>{regForm.age} yrs / {regForm.gender}</strong></div>
                        <div>DOB: <strong>{regForm.dob || '—'}</strong></div>
                        <div>Blood Group: <strong>{regForm.blood_group}</strong></div>
                        <div>Phone: <strong>{regForm.phone}</strong></div>
                        <div>Email: <strong>{regForm.email || '—'}</strong></div>
                        <div>ABHA: <strong>{regForm.abha_id || '—'}</strong></div>
                        <div>Allergies: <strong>{regForm.allergies}</strong></div>
                        <div>Conditions: <strong>{regForm.conditions}</strong></div>
                        <div>Medications: <strong>{regForm.medications}</strong></div>
                        <div>Department: <strong>{regForm.department}</strong></div>
                        <div>Doctor: <strong>{regForm.doctor}</strong></div>
                        <div>Visit Type: <strong>{regForm.visit_type}</strong></div>
                        <div>Priority: <strong style={{ color: regForm.priority === 'Immediate' ? '#ef4444' : regForm.priority === 'Urgent' ? '#f59e0b' : '#10b981' }}>{regForm.priority}</strong></div>
                        {regForm.chief_complaint && <div style={{ gridColumn: 'span 2' }}>Chief Complaint: <strong>{regForm.chief_complaint}</strong></div>}
                        {regForm.emergency_name && <div style={{ gridColumn: 'span 2' }}>Emergency Contact: <strong>{regForm.emergency_name} ({regForm.emergency_relation}) — {regForm.emergency_phone}</strong></div>}
                      </div>
                    </div>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#1e40af' }}>
                      ℹ️ Submitting will assign a permanent <strong>UHID</strong>, create an OPD queue token, and add the patient to today's appointment list.
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  {regStep > 1 ? (
                    <button type="button" onClick={() => setRegStep(regStep - 1)} className="btn-secondary">← Previous</button>
                  ) : <div />}

                  {regStep < 3 ? (
                    <button type="button" className="btn-primary"
                      onClick={() => {
                        if (regStep === 1 && !regForm.name.trim()) return alert('Patient name is required.');
                        if (regStep === 1 && !regForm.phone.trim()) return alert('Phone number is required.');
                        if (regStep === 1 && !regForm.dob) return alert('Date of birth is required.');
                        setRegStep(regStep + 1);
                      }}
                      style={{ padding: '10px 24px', fontWeight: 800 }}>
                      Next Step →
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontWeight: 800, fontSize: '14px' }}>
                      ✓ Register & Generate UHID + Token
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        );
      })()}

      {/* 3. PATIENT SEARCH & OVERVIEW */}
      {activeTab === 'search' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Patient Record Search & Master Index
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Lookup hospital records by Patient Name, UHID, Phone number, or ABHA address.
            </p>
          </div>

          <div className="card" style={{ padding: '16px', marginBottom: '20px', background: '#f8fafc' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search by patient name, UHID-2026-..., phone, or ABHA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Patient Name</th>
                  <th style={{ padding: '10px' }}>UHID</th>
                  <th style={{ padding: '10px' }}>Age/Gender</th>
                  <th style={{ padding: '10px' }}>Phone</th>
                  <th style={{ padding: '10px' }}>Doctor</th>
                  <th style={{ padding: '10px' }}>Department</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter((a) => a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || a.uhid.toLowerCase().includes(searchQuery.toLowerCase()) || a.phone.includes(searchQuery))
                  .map((pt) => (
                    <tr key={pt.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#0f172a' }}>{pt.patient_name}</td>
                      <td style={{ padding: '10px', color: '#0284c7', fontWeight: 700 }}>{pt.uhid}</td>
                      <td style={{ padding: '10px' }}>{pt.patient_age} yrs / {pt.gender}</td>
                      <td style={{ padding: '10px' }}>{pt.phone}</td>
                      <td style={{ padding: '10px' }}>{pt.doctor_name}</td>
                      <td style={{ padding: '10px' }}>{pt.department}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button onClick={() => setSelectedPatientOverview(pt)} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>
                          <Eye size={13} /> View Overview
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Patient Overview Modal with Administrative Tabs */}
          {selectedPatientOverview && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="card" style={{ width: '740px', padding: '24px', background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      PATIENT MASTER OVERVIEW
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>{selectedPatientOverview.patient_name} ({selectedPatientOverview.uhid})</h3>
                  </div>
                  <button onClick={() => setSelectedPatientOverview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Sub-Tabs */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  {['overview', 'appointments', 'admissions', 'billing'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPatientOverviewTab(tab)}
                      style={{
                        background: patientOverviewTab === tab ? '#0284c7' : '#f1f5f9',
                        color: patientOverviewTab === tab ? '#ffffff' : '#475569',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {patientOverviewTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>Name: <strong>{selectedPatientOverview.patient_name}</strong></div>
                      <div>UHID: <strong>{selectedPatientOverview.uhid}</strong></div>
                      <div>Age / Gender: <strong>{selectedPatientOverview.patient_age} yrs / {selectedPatientOverview.gender}</strong></div>
                      <div>Phone: <strong>{selectedPatientOverview.phone}</strong></div>
                      <div>Assigned Doctor: <strong>{selectedPatientOverview.doctor_name}</strong></div>
                      <div>Department: <strong>{selectedPatientOverview.department}</strong></div>
                    </div>
                  </div>
                )}

                {patientOverviewTab === 'billing' && (
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Consultation & Investigations</span>
                        <strong>₹1,200</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#15803d', fontWeight: 700 }}>
                        <span>Payment Status:</span>
                        <span>PAID IN FULL (UPI)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button onClick={() => setSelectedPatientOverview(null)} className="btn-primary">
                    Close Overview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Doctor Consultations & Appointments
              </h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Schedule, manage slots, check-in outpatients, and view practitioner availability.
              </p>
            </div>
            <button onClick={() => setShowBookAptModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}>
              <Plus size={16} /> + New Appointment
            </button>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Appt ID</th>
                  <th style={{ padding: '10px' }}>Patient</th>
                  <th style={{ padding: '10px' }}>Doctor</th>
                  <th style={{ padding: '10px' }}>Date & Time</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#0284c7' }}>{apt.id}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 800 }}>{apt.patient_name}</div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{apt.uhid}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div>{apt.doctor_name}</div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{apt.department}</span>
                    </td>
                    <td style={{ padding: '10px' }}>{apt.date} at {apt.time_slot}</td>
                    <td style={{ padding: '10px' }}>{apt.type}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: apt.status === 'Checked-In' ? '#dcfce7' : '#e0f2fe', color: apt.status === 'Checked-In' ? '#15803d' : '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => alert(`Checked in ${apt.patient_name}`)} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                          Check In
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Book Appointment Modal */}
          {showBookAptModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="card" style={{ width: '540px', padding: '24px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>📅 Book Doctor Consultation Slot</h3>
                  <button onClick={() => setShowBookAptModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleBookAppointmentSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Patient Name *</label>
                      <input type="text" required placeholder="e.g. Ramesh Kumar" value={newAptData.patient_name} onChange={(e) => setNewAptData({ ...newAptData, patient_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Department *</label>
                        <select value={newAptData.department} onChange={(e) => setNewAptData({ ...newAptData, department: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option>Cardiology</option>
                          <option>Neurology</option>
                          <option>General Medicine</option>
                          <option>Orthopedics</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Doctor *</label>
                        <select value={newAptData.doctor_name} onChange={(e) => setNewAptData({ ...newAptData, doctor_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option>Dr. Sarah Jenkins</option>
                          <option>Dr. Arun Kumar</option>
                          <option>Dr. Priya Sharma</option>
                          <option>Dr. Rajesh Menon</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Date *</label>
                        <input type="date" required value={newAptData.date} onChange={(e) => setNewAptData({ ...newAptData, date: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Time Slot *</label>
                        <select value={newAptData.time_slot} onChange={(e) => setNewAptData({ ...newAptData, time_slot: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option>09:30 AM</option>
                          <option>10:30 AM</option>
                          <option>11:00 AM</option>
                          <option>02:00 PM</option>
                          <option>03:30 PM</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                      <button type="button" onClick={() => setShowBookAptModal(false)} className="btn-secondary">Cancel</button>
                      <button type="submit" className="btn-primary">Confirm Appointment</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. PATIENT CHECK-IN & TRIAGE */}
      {activeTab === 'checkin' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              ⚡ 5-Step Outpatient Check-In & Triage
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Record vital signs, assign triage priority, and dispatch real-time OPD token to doctor workspace.
            </p>

            {/* Step Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              {['1. Search', '2. Verify', '3. Triage Vitals', '4. Priority', '5. Token Pass'].map((st, idx) => (
                <span key={idx} style={{ fontSize: '12px', fontWeight: 700, color: checkinStep === idx + 1 ? '#0284c7' : '#94a3b8' }}>
                  {st}
                </span>
              ))}
            </div>

            {checkinStep === 1 && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Search Scheduled Patient by UHID or Name</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="e.g. James Robertson or UHID-2026-884920"
                    value={checkinSearch}
                    onChange={(e) => setCheckinSearch(e.target.value)}
                    style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <button
                    onClick={() => {
                      const found = appointments.find((a) => a.patient_name.toLowerCase().includes(checkinSearch.toLowerCase()) || a.uhid.includes(checkinSearch));
                      if (found) {
                        setCheckinPatient(found);
                        setCheckinStep(2);
                      } else {
                        alert('Patient record not found. Please verify details or register new patient.');
                      }
                    }}
                    className="btn-primary"
                  >
                    Search Record
                  </button>
                </div>
              </div>
            )}

            {checkinStep === 2 && checkinPatient && (
              <div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0f172a' }}>Patient Details Verified</h4>
                  <div>Name: <strong>{checkinPatient.patient_name}</strong></div>
                  <div>UHID: <strong>{checkinPatient.uhid}</strong></div>
                  <div>Doctor: <strong>{checkinPatient.doctor_name}</strong> &bull; Dept: <strong>{checkinPatient.department}</strong></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setCheckinStep(1)} className="btn-secondary">Back</button>
                  <button onClick={() => setCheckinStep(3)} className="btn-primary">Proceed to Triage &rarr;</button>
                </div>
              </div>
            )}

            {checkinStep === 3 && (
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Desk Triage Vitals</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700 }}>Temp (°C)</label>
                    <input type="text" value={triageData.temp} onChange={(e) => setTriageData({ ...triageData, temp: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700 }}>Blood Pressure</label>
                    <input type="text" value={triageData.bp} onChange={(e) => setTriageData({ ...triageData, bp: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700 }}>SpO2 (%)</label>
                    <input type="text" value={triageData.spo2} onChange={(e) => setTriageData({ ...triageData, spo2: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Triage Priority Assessment</label>
                  <select value={triageData.priority} onChange={(e) => setTriageData({ ...triageData, priority: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Routine">Routine Outpatient (Normal Flow)</option>
                    <option value="Urgent">Urgent Priority (Immediate Assessment)</option>
                    <option value="Emergency">Emergency Code (Direct ICU/ER Routing)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setCheckinStep(2)} className="btn-secondary">Back</button>
                  <button onClick={handleGenerateCheckinToken} className="btn-primary">Generate OPD Token & Dispatch</button>
                </div>
              </div>
            )}

            {checkinStep === 5 && generatedTokenPass && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#0284c7', margin: '6px 0' }}>
                  #{generatedTokenPass.token}
                </h2>
                <h4 style={{ margin: 0, fontSize: '16px' }}>{generatedTokenPass.patient_name}</h4>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                  {generatedTokenPass.doctor} &bull; {generatedTokenPass.department}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => alert('Printing thermal queue ticket...')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Printer size={14} /> Print Ticket
                  </button>
                  <button onClick={() => { setCheckinStep(1); setCheckinPatient(null); }} className="btn-primary">
                    Next Check-In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. OPD QUEUE */}
      {activeTab === 'queue' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Live Outpatient Queue (M/M/c Roster)
              </h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Centralized queue synchronized in real-time with physician consultation rooms.
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Token</th>
                  <th style={{ padding: '10px' }}>Patient</th>
                  <th style={{ padding: '10px' }}>UHID</th>
                  <th style={{ padding: '10px' }}>Doctor</th>
                  <th style={{ padding: '10px' }}>Department</th>
                  <th style={{ padding: '10px' }}>Arrival</th>
                  <th style={{ padding: '10px' }}>Priority</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q) => (
                  <tr key={q.token} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>#{q.token}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{q.patient_name}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{q.uhid}</td>
                    <td style={{ padding: '10px' }}>{q.doctor}</td>
                    <td style={{ padding: '10px' }}>{q.department}</td>
                    <td style={{ padding: '10px' }}>{q.arrival}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: q.priority === 'Urgent' ? '#fee2e2' : '#f1f5f9', color: q.priority === 'Urgent' ? '#b91c1c' : '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {q.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: q.status === 'In Consultation' ? '#e0f2fe' : '#dcfce7', color: q.status === 'In Consultation' ? '#0369a1' : '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button onClick={() => alert(`Called Token #${q.token} (${q.patient_name}) for consultation room entrance.`)} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                        Call Next
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. ADMISSION & BED MANAGEMENT */}
      {activeTab === 'admissions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Admission & Inpatient Bed Management
              </h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Real-time bed allocation across ICU, General Wards, Emergency, and Pediatrics.
              </p>
            </div>
            <button onClick={() => { setSelectedBed(beds.find(b => b.status === 'AVAILABLE')); setShowAssignBedModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}>
              <Plus size={16} /> Assign Bed
            </button>
          </div>

          {/* Bed Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '14px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>AVAILABLE BEDS</span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '2px 0', color: '#10b981' }}>{beds.filter((b) => b.status === 'AVAILABLE').length}</h2>
            </div>
            <div className="card" style={{ padding: '14px', borderLeft: '4px solid #ef4444', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>OCCUPIED BEDS</span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '2px 0', color: '#ef4444' }}>{beds.filter((b) => b.status === 'OCCUPIED').length}</h2>
            </div>
            <div className="card" style={{ padding: '14px', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CLEANING IN PROGRESS</span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '2px 0', color: '#f59e0b' }}>{beds.filter((b) => b.status === 'CLEANING').length}</h2>
            </div>
          </div>

          {/* Beds Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {beds.map((bed) => (
              <div key={bed.bed_number} className="card" style={{ padding: '18px', borderLeft: bed.status === 'OCCUPIED' ? '4px solid #ef4444' : bed.status === 'CLEANING' ? '4px solid #f59e0b' : '4px solid #10b981', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '16px', color: '#0f172a' }}>{bed.bed_number}</strong>
                  <span style={{ fontSize: '11px', background: bed.status === 'OCCUPIED' ? '#fee2e2' : bed.status === 'CLEANING' ? '#fef3c7' : '#dcfce7', color: bed.status === 'OCCUPIED' ? '#b91c1c' : bed.status === 'CLEANING' ? '#b45309' : '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {bed.status}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                  <div>Ward: <strong>{bed.ward}</strong> &bull; {bed.room}</div>
                  {bed.patient_name ? (
                    <div style={{ marginTop: '4px', color: '#0f172a', fontWeight: 700 }}>
                      Patient: {bed.patient_name} ({bed.doctor})
                    </div>
                  ) : (
                    <div style={{ marginTop: '4px', color: '#10b981' }}>Ready for admission</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  {bed.status === 'CLEANING' && (
                    <button
                      onClick={() => setBeds(beds.map((b) => (b.bed_number === bed.bed_number ? { ...b, status: 'AVAILABLE' } : b)))}
                      className="btn-primary"
                      style={{ fontSize: '11px', padding: '4px 8px', width: '100%' }}
                    >
                      Mark Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. DISCHARGE DESK */}
      {activeTab === 'discharge' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Discharge Clearance Desk
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Verify physician approval, finalize itemized invoice in INR (₹), and trigger bed turnaround.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Patient</th>
                  <th style={{ padding: '10px' }}>UHID</th>
                  <th style={{ padding: '10px' }}>Bed</th>
                  <th style={{ padding: '10px' }}>Attending Doctor</th>
                  <th style={{ padding: '10px' }}>Doctor Approval</th>
                  <th style={{ padding: '10px' }}>Billing Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 800 }}>James Robertson</td>
                  <td style={{ padding: '10px', color: '#0284c7' }}>UHID-2026-884920</td>
                  <td style={{ padding: '10px' }}>ICU-101</td>
                  <td style={{ padding: '10px' }}>Dr. Sarah Jenkins</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ✓ Signed & Approved
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ₹1,200 (PAID)
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button onClick={() => handleFinalizeDischarge('James Robertson', 'ICU-101')} className="btn-primary" style={{ fontSize: '11px', padding: '5px 10px' }}>
                      Finalize Discharge
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. BILLING & PAYMENTS (INR ₹) */}
      {activeTab === 'billing' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Billing, Invoices & Payments (INR ₹)
              </h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Itemized invoice generation, UPI/Card/Insurance collection, and tax receipts.
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Invoice ID</th>
                  <th style={{ padding: '10px' }}>Patient & UHID</th>
                  <th style={{ padding: '10px' }}>Department</th>
                  <th style={{ padding: '10px' }}>Services Rendered</th>
                  <th style={{ padding: '10px' }}>Total Amount</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{inv.id}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 700 }}>{inv.patient_name}</div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{inv.uhid}</span>
                    </td>
                    <td style={{ padding: '10px' }}>{inv.department}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{inv.services}</td>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0f172a' }}>₹{inv.total.toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: inv.status === 'PAID' ? '#dcfce7' : '#fee2e2', color: inv.status === 'PAID' ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {inv.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              setInvoices(invoices.map((i) => (i.id === inv.id ? { ...i, status: 'PAID' } : i)));
                              alert(`✓ Collected ₹${inv.total} for ${inv.id}`);
                            }}
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            Collect ₹
                          </button>
                        )}
                        <button onClick={() => alert(`Printing Tax Invoice ${inv.id}...`)} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                          <Printer size={12} /> Print
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

      {/* 10. DOCTORS & STAFF */}
      {activeTab === 'staff' && <DoctorsStaffManagementView />}

      {/* 11. DEPARTMENTS */}
      {activeTab === 'departments' && <DepartmentManagementView />}

      {/* 12. REPORTS & ANALYTICS */}
      {activeTab === 'reports' && <ReportsAnalyticsView />}

      {/* 13. NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Operations Notifications & Alerts
              </h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Real-time updates from outpatient triage, doctor consultations, and inpatient bed turnarounds.
              </p>
            </div>
            <button onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              Mark All Read
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div key={n.id} className="card" style={{ padding: '16px', borderLeft: n.priority === 'HIGH' ? '4px solid #ef4444' : '4px solid #0284c7', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {n.type}
                    </span>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{n.message}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{n.time}</div>
                </div>
                {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14. AUDIT LOGS */}
      {activeTab === 'audit' && <AuditLogsView />}

      {/* 15. HOSPITAL ADMINISTRATION */}
      {activeTab === 'admin' && <HospitalAdminDashboardView />}
    </div>
  );
}
