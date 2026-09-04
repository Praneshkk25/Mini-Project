import React, { useState, useEffect, useRef } from 'react';
import Login from './pages/Login';
import ReceptionOpsHub from './pages/ReceptionOpsHub';
import ClinicalCommunications from './components/ClinicalCommunications';
import OpsProfileSettingsModal from './components/OpsProfileSettingsModal';
import { User, Settings, Shield, FileText, LogOut, ChevronDown } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [modalConfig, setModalConfig] = useState({ open: false, tab: 'profile' });
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('aura_receptionist_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    } else {
      const defaultUser = {
        name: 'Elena Rostova',
        employee_id: 'EMP-OPS-4412',
        role: 'Desk Administrator',
        email: 'elena.rostova@aurahealth.org',
        phone: '+91 98409 11223'
      };
      setUser(defaultUser);
      localStorage.setItem('aura_receptionist_user', JSON.stringify(defaultUser));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aura_receptionist_user');
    setUser(null);
  };

  const handleUpdateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('aura_receptionist_user', JSON.stringify(updated));
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => {
      setUser(u);
      localStorage.setItem('aura_receptionist_user', JSON.stringify(u));
    }} />;
  }

  const MENU_ITEMS = [
    { key: 'dashboard', label: '1. Reception Dashboard', icon: '📊' },
    { key: 'registration', label: '2. Patient Registration', icon: '➕' },
    { key: 'search', label: '3. Patient Search', icon: '🔍' },
    { key: 'appointments', label: '4. Appointments', icon: '📅' },
    { key: 'checkin', label: '5. Patient Check-In & Triage', icon: '⚡' },
    { key: 'queue', label: '6. OPD Queue', icon: '👥' },
    { key: 'admissions', label: '7. Admission & Bed Management', icon: '🛏️' },
    { key: 'discharge', label: '8. Discharge Desk', icon: '📋' },
    { key: 'billing', label: '9. Billing & Payments (₹)', icon: '💳' },
    { key: 'staff', label: '10. Doctors & Staff', icon: '👨‍⚕️' },
    { key: 'departments', label: '11. Departments', icon: '🏥' },
    { key: 'reports', label: '12. Reports & Analytics', icon: '📈' },
    { key: 'notifications', label: '13. Notifications', icon: '🔔' },
    { key: 'audit', label: '14. Audit Logs', icon: '🛡️' }
  ];

  return (
    <div className="layout-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🏥</div>
          <div className="brand-title">
            <h2>AuraHealth</h2>
            <span>Operations Console</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">OPERATIONS DESK</div>
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

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="search-box">
            <span>🔍</span>
            <input type="text" placeholder="Search patients, records, or staff... #K" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ClinicalCommunications currentUser={user} />

            {/* Profile Dropdown Menu */}
            <div style={{ position: 'relative' }} ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  borderRadius: '8px'
                }}
              >
                <span className="pill-badge pill-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  Desk Admin: {user.name} <ChevronDown size={12} />
                </span>
              </button>

              {showProfileDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '200px',
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
                      setModalConfig({ open: true, tab: 'profile' });
                      setShowProfileDropdown(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <User size={15} /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      setModalConfig({ open: true, tab: 'settings' });
                      setShowProfileDropdown(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Settings size={15} /> Settings
                  </button>
                  <button
                    onClick={() => {
                      setModalConfig({ open: true, tab: 'security' });
                      setShowProfileDropdown(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Shield size={15} /> Security
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('audit');
                      setShowProfileDropdown(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <FileText size={15} /> Activity Log
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

        <main className="content-viewport">
          <ReceptionOpsHub activeTab={activeTab} user={user} onSelectTab={setActiveTab} />
        </main>
      </div>

      {/* Profile & Settings Modal */}
      {modalConfig.open && (
        <OpsProfileSettingsModal
          user={user}
          initialTab={modalConfig.tab}
          onClose={() => setModalConfig({ open: false, tab: 'profile' })}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
}
