import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Settings, Shield, LogOut, CheckCircle, Clock, AlertTriangle, FileText, Pill, ChevronDown } from 'lucide-react';

export default function PatientTopHeader({ patient, onNavigate, onLogout }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Prescription Ready', desc: 'Pantocid 40mg is dispensed by Central Pharmacy.', time: '10m ago', unread: true, type: 'pharmacy' },
    { id: 2, title: 'OPD Queue Update', desc: 'Your Token #04 is now 2nd in line with Dr. Sarah Jenkins.', time: '25m ago', unread: true, type: 'queue' },
    { id: 3, title: 'Follow-Up Scheduled', desc: 'Cardiology consultation booked for 14-Sep-2026.', time: '2h ago', unread: false, type: 'appointment' }
  ]);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      {/* Left Patient ID Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
          Patient Portal: <strong style={{ color: '#0f172a' }}>{patient.name}</strong>{' '}
          <span style={{ fontSize: '12px', background: '#f1f5f9', color: '#0284c7', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
            {patient.mrn || patient.uhid || 'MRN-884920'}
          </span>
        </div>
      </div>

      {/* Right Actions: Session Status, Notification Bell, User Menu */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Active Patient Session
        </span>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: showNotifications ? '#f1f5f9' : '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={17} color="#475569" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '340px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Patient Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      background: n.unread ? 'rgba(2,132,199,0.04)' : '#ffffff',
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {n.type === 'pharmacy' ? <Pill size={15} color="#0d9488" /> : n.type === 'queue' ? <Clock size={15} color="#0284c7" /> : <CheckCircle size={15} color="#10b981" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '12px', color: '#0f172a' }}>{n.title}</strong>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{n.time}</span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Patient Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
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
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
              {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{patient.name}</span>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showUserMenu && (
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
                  onNavigate('profile');
                  setShowUserMenu(false);
                }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <User size={15} /> My Profile
              </button>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setShowUserMenu(false);
                }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <Settings size={15} /> Settings
              </button>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setShowUserMenu(false);
                }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <Shield size={15} /> Consent & Privacy
              </button>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
              <button
                onClick={onLogout}
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
  );
}
