import React, { useState, useEffect, useRef } from 'react';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorWorkspaceView from './pages/DoctorWorkspaceView';
import HeartPredictorView from './pages/HeartPredictorView';
import AIDiagnosticsView from './pages/AIDiagnosticsView';
import DischargeApprovalView from './pages/DischargeApprovalView';
import RealTimeMonitoringView from './pages/RealTimeMonitoringView';
import DoctorProfileSettingsView from './pages/DoctorProfileSettingsView';
import DoctorClinicalCommunications from './components/DoctorClinicalCommunications';
import DoctorNotifications from './components/DoctorNotifications';
import { User, Settings, Shield, PenTool, LogOut, ChevronDown } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('aura_doctor_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    } else {
      const defaultDoc = {
        name: 'Dr. Sarah Jenkins',
        doctor_id: 'DOC-CAR-101',
        department: 'Cardiology',
        designation: 'Chief of Cardiology',
        specialization: 'Interventional Cardiology & Electrophysiology',
        registration_number: 'MCI-REG-84920-IND',
        qualifications: 'MD (Cardiology), DM, FACC, FSCAI',
        experience_years: 16,
        languages: 'English, Hindi, Tamil',
        phone: '+91 98401 55678',
        email: 'sarah.jenkins@aurahealth.org',
        office_room: 'Consultation Suite 204 (2nd Floor)',
        pager: 'PGR-404'
      };
      setUser(defaultDoc);
      localStorage.setItem('aura_doctor_user', JSON.stringify(defaultDoc));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateDoctor = (updated) => {
    setUser(updated);
    localStorage.setItem('aura_doctor_user', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_doctor_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => {
      setUser(u);
      localStorage.setItem('aura_doctor_user', JSON.stringify(u));
    }} />;
  }

  const MENU_ITEMS = [
    { key: 'dashboard', label: '1. OPD Queue & Consults', icon: '📊' },
    { key: 'doctor-workspace', label: '2. Doctor Workspace', icon: '👨‍⚕️' },
    { key: 'patient-history', label: '3. Patient History & MediKiosk', icon: '📋' },
    { key: 'monitoring', label: '4. Live Telemetry & Vitals', icon: '🫀' },
    { key: 'heart-predictor', label: '5. AI Clinical Decision Support', icon: '🧠' },
    { key: 'diagnostics', label: '6. AI Imaging & Scans', icon: '🔬' },
    { key: 'prescriptions-orders', label: '7. Prescriptions & Orders', icon: '💊' },
    { key: 'discharge', label: '8. Discharge Approvals', icon: '📝' }
  ];

  return (
    <div className="layout-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🩺</div>
          <div className="brand-title">
            <h2>AuraHealth</h2>
            <span>Doctor Portal</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">CLINICAL WORKSPACE</div>
          {MENU_ITEMS.map((item) => (
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
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navbar Header */}
        <header className="top-header">
          <div className="search-box">
            <span>🔍</span>
            <input type="text" placeholder="Search patients, MRN, ECG records... #K" />
            <span className="shortcut-badge">⌘K</span>
          </div>

          <div className="header-right" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <DoctorClinicalCommunications currentUser={user} />
            <DoctorNotifications />

            {/* Doctor Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <div
                className="user-profile"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div className="user-avatar" style={{ background: '#0284c7', color: '#fff', fontWeight: 800 }}>
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="user-info">
                  <h4 style={{ margin: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {user.name} <ChevronDown size={12} />
                  </h4>
                  <p style={{ margin: 0, fontSize: '11px' }}>{user.designation || user.specialty_or_info || 'Chief of Cardiology'}</p>
                </div>
              </div>

              {showUserDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    padding: '6px'
                  }}
                >
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <User size={15} /> Professional Profile
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Settings size={15} /> Clinical Preferences
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <PenTool size={15} /> Digital Signature
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Shield size={15} /> Security & Privacy
                  </button>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="content-viewport" style={{ padding: '24px' }}>
          {activeTab === 'dashboard' && <DoctorDashboard user={user} onNavigate={setActiveTab} />}
          {activeTab === 'doctor-workspace' && <DoctorWorkspaceView user={user} initialSubTab="summary" />}
          {activeTab === 'patient-history' && <DoctorWorkspaceView user={user} initialSubTab="summary" />}
          {activeTab === 'monitoring' && <RealTimeMonitoringView user={user} />}
          {activeTab === 'heart-predictor' && <HeartPredictorView user={user} />}
          {activeTab === 'diagnostics' && <AIDiagnosticsView />}
          {activeTab === 'prescriptions-orders' && <DoctorWorkspaceView user={user} initialSubTab="prescription" />}
          {activeTab === 'discharge' && <DischargeApprovalView />}
          {activeTab === 'profile' && <DoctorProfileSettingsView doctor={user} onUpdateDoctor={handleUpdateDoctor} />}
        </main>
      </div>
    </div>
  );
}
