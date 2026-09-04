import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import PublicPatientRegistration from './pages/PublicPatientRegistration';
import PatientTopHeader from './components/PatientTopHeader';
import PatientDashboard from './pages/PatientDashboard';
import MediKioskView from './pages/MediKioskView';
import MyAppointmentsView from './pages/MyAppointmentsView';
import MyOPDTokenView from './pages/MyOPDTokenView';
import MyPrescriptionsView from './pages/MyPrescriptionsView';
import MyVitalsTelemetryView from './pages/MyVitalsTelemetryView';
import MyMedicalDocumentsView from './pages/MyMedicalDocumentsView';
import AIChatCompanionView from './pages/AIChatCompanionView';
import MyFollowUpsView from './pages/MyFollowUpsView';
import MyBillsPaymentsView from './pages/MyBillsPaymentsView';
import HospitalBedSearchView from './pages/HospitalBedSearchView';
import ProfileSettingsView from './pages/ProfileSettingsView';
import FloatingCareCompanion from './components/FloatingCareCompanion';

export default function App() {
  const [patient, setPatient] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('aura_patient_user');
    if (saved) {
      try {
        setPatient(JSON.parse(saved));
      } catch (e) {}
    } else {
      const initialPatient = {
        patient_id: 'PT-1001',
        uhid: 'AUR-2026-001001',
        mrn: 'MRN-884920',
        name: 'James Robertson',
        dob: '1968-05-14',
        age: 58,
        gender: 'Male',
        blood_group: 'A+',
        phone: '+91 98765 43210',
        email: 'james.robertson@aurahealth.org',
        hospital: 'AuraHealth Central Hospital',
        address: '42 Residency Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        emergency_name: 'Sarah Robertson',
        emergency_relation: 'Spouse',
        emergency_phone: '+91 98765 43211',
        allergies: 'None known',
        language_preference: localStorage.getItem('aura_patient_language') || 'English'
      };
      setPatient(initialPatient);
      localStorage.setItem('aura_patient_user', JSON.stringify(initialPatient));
    }
  }, []);

  const handleUpdateProfile = (updated) => {
    setPatient(updated);
    localStorage.setItem('aura_patient_user', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_patient_user');
    setPatient(null);
    setAuthView('login');
  };

  // If not logged in, display login or public registration
  if (!patient) {
    if (authView === 'register') {
      return (
        <PublicPatientRegistration
          onRegistrationComplete={(newPt) => {
            setPatient(newPt);
            setActiveTab('kiosk'); // Send new patient directly into MediKiosk!
          }}
          onBackToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={(u) => {
          setPatient(u);
          localStorage.setItem('aura_patient_user', JSON.stringify(u));
          setActiveTab('dashboard');
        }}
        onGoToRegister={() => setAuthView('register')}
      />
    );
  }

  const PATIENT_SERVICES = [
    { key: 'dashboard', label: '1. My Health Summary', icon: '🏠' },
    { key: 'kiosk', label: '2. MediKiosk AI Intake', icon: '🩺' },
    { key: 'appointments', label: '3. My Appointments', icon: '📅' },
    { key: 'token', label: '4. My OPD Token', icon: '🎟️' },
    { key: 'prescriptions', label: '5. My Prescriptions', icon: '💊' },
    { key: 'vitals', label: '6. My Vitals & Telemetry', icon: '❤️' },
    { key: 'documents', label: '7. Medical Documents', icon: '📁' },
    { key: 'companion', label: '8. Multilingual Care Companion', icon: '💬' },
    { key: 'followups', label: '9. Follow-Up Appointments', icon: '🔄' },
    { key: 'billing', label: '10. My Bills & Payments', icon: '💳' },
    { key: 'emergency', label: '11. Emergency / Bed Search & SOS', icon: '🚨' }
  ];

  return (
    <div className="layout-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">👤</div>
          <div className="brand-title">
            <h2>AuraHealth</h2>
            <span>PATIENT PORTAL</span>
          </div>
        </div>

        <div style={{ padding: '0 0.5rem 0.5rem', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
          FACILITY: <span style={{ color: '#0284c7' }}>{patient.hospital || 'AuraHealth Central'}</span>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">PATIENT SERVICES</div>
          {PATIENT_SERVICES.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span style={{ marginRight: '8px' }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        <div className="nav-section" style={{ marginTop: '1rem' }}>
          <div className="nav-section-title">ACCOUNT</div>
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span style={{ marginRight: '8px' }}>👤</span> My Profile & Settings
          </button>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <span style={{ marginRight: '8px' }}>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <PatientTopHeader patient={patient} onNavigate={setActiveTab} onLogout={handleLogout} />

        <main className="content-viewport" style={{ padding: '24px' }}>
          {activeTab === 'dashboard' && <PatientDashboard patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'kiosk' && <MediKioskView user={patient} onComplete={() => setActiveTab('dashboard')} />}
          {activeTab === 'appointments' && <MyAppointmentsView patient={patient} />}
          {activeTab === 'token' && <MyOPDTokenView patient={patient} />}
          {activeTab === 'prescriptions' && <MyPrescriptionsView patient={patient} />}
          {activeTab === 'vitals' && <MyVitalsTelemetryView patient={patient} />}
          {activeTab === 'documents' && <MyMedicalDocumentsView patient={patient} />}
          {activeTab === 'companion' && <AIChatCompanionView patient={patient} />}
          {activeTab === 'followups' && <MyFollowUpsView patient={patient} />}
          {activeTab === 'billing' && <MyBillsPaymentsView patient={patient} />}
          {activeTab === 'emergency' && <HospitalBedSearchView />}
          {activeTab === 'profile' && <ProfileSettingsView patient={patient} onUpdateProfile={handleUpdateProfile} />}
        </main>
      </div>

      {/* Floating Care Companion AI Widget */}
      <FloatingCareCompanion patient={patient} />
    </div>
  );
}
