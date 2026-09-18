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

// Auth sub-screens
const AUTH_VIEWS = {
  LOGIN:    'login',
  REGISTER: 'register',
};

export default function App() {
  const [patient,   setPatient]   = useState(null);
  const [authView,  setAuthView]  = useState(AUTH_VIEWS.LOGIN);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnboardingFlow, setIsOnboardingFlow] = useState(false);

  /* ─── Restore session from localStorage ─── */
  useEffect(() => {
    const saved = localStorage.getItem('aura_patient_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.name) {
          setPatient(parsed);
          // If patient still hasn't completed onboarding, can open kiosk
          if (parsed.onboarding_completed === false && parsed.is_new_registration) {
            setActiveTab('kiosk');
            setIsOnboardingFlow(true);
          }
        }
      } catch {}
    }
  }, []);

  const handleLoginSuccess = (u) => {
    localStorage.setItem('aura_patient_user', JSON.stringify(u));
    setPatient(u);
    if (u.onboarding_completed === false) {
      setActiveTab('kiosk');
      setIsOnboardingFlow(true);
    } else {
      setActiveTab('dashboard');
      setIsOnboardingFlow(false);
    }
  };

  const handleRegistrationComplete = (newPt) => {
    // Save to state and navigate DIRECTLY to MediKiosk AI Clinical Intake
    const ptWithFlag = { ...newPt, is_new_registration: true, onboarding_completed: false };
    localStorage.setItem('aura_patient_user', JSON.stringify(ptWithFlag));
    setPatient(ptWithFlag);
    setIsOnboardingFlow(true);
    setActiveTab('kiosk');
  };

  const handleKioskComplete = () => {
    if (patient) {
      const updated = { ...patient, onboarding_completed: true, is_new_registration: false };
      setPatient(updated);
      localStorage.setItem('aura_patient_user', JSON.stringify(updated));
    }
    setIsOnboardingFlow(false);
    setActiveTab('dashboard');
  };

  const handleUpdateProfile = (updated) => {
    setPatient(updated);
    localStorage.setItem('aura_patient_user', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_patient_user');
    setPatient(null);
    setAuthView(AUTH_VIEWS.LOGIN);
    setActiveTab('dashboard');
    setIsOnboardingFlow(false);
  };

  /* ─────────────────────────────────────────────
     NOT LOGGED IN — show Login or Registration
  ───────────────────────────────────────────── */
  if (!patient) {
    if (authView === AUTH_VIEWS.REGISTER) {
      return (
        <PublicPatientRegistration
          onRegistrationComplete={handleRegistrationComplete}
          onBackToLogin={() => setAuthView(AUTH_VIEWS.LOGIN)}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setAuthView(AUTH_VIEWS.REGISTER)}
      />
    );
  }

  /* ─────────────────────────────────────────────
     LOGGED IN — full portal
  ───────────────────────────────────────────── */
  const PATIENT_SERVICES = [
    { key: 'dashboard',    label: '1. My Health Summary',           icon: '🏠' },
    { key: 'kiosk',        label: '2. MediKiosk AI Intake',          icon: '🩺' },
    { key: 'appointments', label: '3. My Appointments',              icon: '📅' },
    { key: 'token',        label: '4. My OPD Token',                 icon: '🎟️' },
    { key: 'prescriptions',label: '5. My Prescriptions',            icon: '💊' },
    { key: 'vitals',       label: '6. My Vitals & Telemetry',        icon: '❤️' },
    { key: 'documents',    label: '7. Medical Documents',            icon: '📁' },
    { key: 'companion',    label: '8. Multilingual Care Companion',  icon: '💬' },
    { key: 'followups',    label: '9. Follow-Up Appointments',       icon: '🔄' },
    { key: 'billing',      label: '10. My Bills & Payments',         icon: '💳' },
    { key: 'emergency',    label: '11. Emergency / Bed Search & SOS',icon: '🚨' },
  ];

  return (
    <div className="layout-container">
      {/* ── Left Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">👤</div>
          <div className="brand-title">
            <h2>AuraHealth</h2>
            <span>PATIENT PORTAL</span>
          </div>
        </div>

        {/* Patient quick-info strip */}
        <div style={{ padding: '10px 12px', margin: '0 0 10px', background: 'rgba(2,132,199,.08)', borderRadius: '10px', fontSize: '11px', border: '1px solid rgba(2,132,199,.15)' }}>
          <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px' }}>
            {patient.name}
          </div>
          <div style={{ color: '#475569', marginTop: '2px' }}>
            MRN: <span style={{ color: '#0f172a', fontWeight: 700 }}>{patient.mrn || patient.patient_id}</span>
          </div>
          <div style={{ color: '#64748b', marginTop: '1px' }}>
            UHID: <span style={{ color: patient.uhid ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{patient.uhid || 'Not linked'}</span>
          </div>
          <div style={{ color: '#0d9488', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            🏥 {patient.hospital || patient.primary_hospital_name || 'AuraHealth Central Hospital'}
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">PATIENT SERVICES</div>
          {PATIENT_SERVICES.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span style={{ marginRight: '8px' }}>{item.icon}</span>
              {item.label}
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

      {/* ── Main Content ── */}
      <div className="main-wrapper">
        <PatientTopHeader patient={patient} onNavigate={setActiveTab} onLogout={handleLogout} />

        <main className="content-viewport" style={{ padding: '24px' }}>
          {activeTab === 'dashboard' && (
            <PatientDashboard 
              patient={patient} 
              onNavigate={setActiveTab} 
            />
          )}

          {activeTab === 'kiosk' && (
            <MediKioskView
              user={patient}
              isOnboarding={isOnboardingFlow}
              onComplete={handleKioskComplete}
              onEditPatient={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'appointments'  && <MyAppointmentsView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'token'         && <MyOPDTokenView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'prescriptions' && <MyPrescriptionsView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'vitals'        && <MyVitalsTelemetryView patient={patient} />}
          {activeTab === 'documents'     && <MyMedicalDocumentsView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'companion'     && <AIChatCompanionView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'followups'     && <MyFollowUpsView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'billing'       && <MyBillsPaymentsView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'emergency'     && <HospitalBedSearchView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'profile'       && (
            <ProfileSettingsView patient={patient} onUpdateProfile={handleUpdateProfile} />
          )}
        </main>
      </div>

      {/* ── Floating AI Companion (Unified across all screens) ── */}
      <FloatingCareCompanion patient={patient} activeTab={activeTab} />
    </div>
  );
}
