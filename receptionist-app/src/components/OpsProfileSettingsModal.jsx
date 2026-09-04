import React, { useState } from 'react';
import { User, Settings, Shield, Lock, FileCheck, CheckCircle2, Save, X, Phone, Mail, Building2 } from 'lucide-react';

export default function OpsProfileSettingsModal({ user, initialTab = 'profile', onClose, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'settings' | 'roles' | 'security'

  const [profile, setProfile] = useState({
    name: user?.name || 'Elena Rostova',
    employee_id: user?.employee_id || 'EMP-OPS-4412',
    email: user?.email || 'elena.rostova@aurahealth.org',
    phone: user?.phone || '+91 98409 11223',
    gender: 'Female',
    role: user?.role || 'Desk Administrator',
    department: 'Central Operations & Registration',
    facility: 'AuraHealth Central Super-Specialty Hospital',
    supervisor: 'Dr. Sarah Jenkins (Medical Superintendent)',
    joining_date: '2023-04-15'
  });

  const [hospitalSettings, setHospitalSettings] = useState({
    hospital_name: 'AuraHealth Central Hospital',
    address: '42 Residency Road, Indiranagar, Bengaluru, Karnataka 560038',
    phone: '+91 80 4455 6677',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST +5:30)',
    default_consult_duration: '15 Minutes',
    token_prefix: 'TKN-',
    tax_rate: '5% GST'
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateUser) onUpdateUser({ ...user, ...profile });
    alert('✓ Operations administrator profile updated successfully.');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('✓ Institutional operations and billing configuration saved.');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div className="card" style={{ width: '740px', maxHeight: '90vh', background: '#fff', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Modal Header */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                background: activeTab === 'profile' ? '#0284c7' : 'transparent',
                color: activeTab === 'profile' ? '#fff' : '#475569',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              👤 My Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                background: activeTab === 'settings' ? '#0284c7' : 'transparent',
                color: activeTab === 'settings' ? '#fff' : '#475569',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⚙️ Hospital Settings
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              style={{
                background: activeTab === 'roles' ? '#0284c7' : 'transparent',
                color: activeTab === 'roles' ? '#fff' : '#475569',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🛡️ Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab('security')}
              style={{
                background: activeTab === 'security' ? '#0284c7' : 'transparent',
                color: activeTab === 'security' ? '#fff' : '#475569',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔒 Security
            </button>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* 1. My Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px' }}>
                  {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{profile.name}</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {profile.role} &bull; ID: <strong>{profile.employee_id}</strong> (Read-Only)
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Official Email</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Department</label>
                  <input type="text" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </form>
          )}

          {/* 2. Hospital Settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800 }}>Institutional & Queue Parameters</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Hospital Name</label>
                  <input type="text" value={hospitalSettings.hospital_name} onChange={(e) => setHospitalSettings({ ...hospitalSettings, hospital_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Billing Currency (Standard)</label>
                  <input type="text" disabled value="INR (₹)" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, color: '#15803d' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Timezone</label>
                  <input type="text" disabled value={hospitalSettings.timezone} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Default Consultation Duration</label>
                  <input type="text" value={hospitalSettings.default_consult_duration} onChange={(e) => setHospitalSettings({ ...hospitalSettings, default_consult_duration: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" className="btn-primary">Save Settings</button>
              </div>
            </form>
          )}

          {/* 3. Roles & Permissions */}
          {activeTab === 'roles' && (
            <div>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800 }}>Role-Based Access Matrix (RBAC)</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc' }}>
                    <th style={{ padding: '8px' }}>Module Permission</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Super Admin</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Operations / Reception</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Billing Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { module: 'Patient Registration & Search', sa: true, ops: true, bill: true },
                    { module: 'Appointments & Rescheduling', sa: true, ops: true, bill: false },
                    { module: 'Check-In & Triage Token Generation', sa: true, ops: true, bill: false },
                    { module: 'Bed Admission & Allocation', sa: true, ops: true, bill: false },
                    { module: 'Billing Invoices & Receipts (INR ₹)', sa: true, ops: true, bill: true },
                    { module: 'Doctor Roster & Schedules', sa: true, ops: true, bill: false },
                    { module: 'Clinical Diagnoses & CDS (Restricted)', sa: true, ops: false, bill: false }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{row.module}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: row.sa ? '#15803d' : '#94a3b8' }}>{row.sa ? '✓ Allowed' : '— Restricted'}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: row.ops ? '#15803d' : '#94a3b8' }}>{row.ops ? '✓ Allowed' : '— Restricted'}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: row.bill ? '#15803d' : '#94a3b8' }}>{row.bill ? '✓ Allowed' : '— Restricted'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Security */}
          {activeTab === 'security' && (
            <div>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800 }}>Account Security & Sessions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong>Current Active Desk Session</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Operations Console &bull; Session IP: 127.0.0.1 &bull; Active</p>
                </div>
                <button onClick={() => alert('Password reset verification link sent to your registered official email.')} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
