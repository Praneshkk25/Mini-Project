import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Shield, Globe, Volume2, Bell, Lock, FileText, CheckCircle2, AlertTriangle, Edit3, Save, X } from 'lucide-react';

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' }
];

export default function ProfileSettingsView({ patient, onUpdateProfile }) {
  const [activeSubTab, setActiveSubTab] = useState('personal'); // 'personal' | 'emergency' | 'preferences' | 'consent' | 'security' | 'correction'

  // Editable Profile State
  const [formData, setFormData] = useState({
    name: patient.name || '',
    dob: patient.dob || '1968-05-14',
    gender: patient.gender || 'Male',
    blood_group: patient.blood_group || 'A+',
    phone: patient.phone || '+91 98765 43210',
    email: patient.email || 'patient@aurahealth.org',
    address: patient.address || '42 Residency Road, Indiranagar',
    city: patient.city || 'Bengaluru',
    state: patient.state || 'Karnataka',
    pincode: patient.pincode || '560038',
    emergency_name: patient.emergency_name || 'Sarah Robertson',
    emergency_relation: patient.emergency_relation || 'Spouse',
    emergency_phone: patient.emergency_phone || '+91 98765 43211',
    preferred_language: localStorage.getItem('aura_patient_language') || 'English',
    voice_enabled: true,
    auto_read: true,
    speech_rate: '1.0'
  });

  // Calculate age from DOB
  const calculateAge = (dobString) => {
    if (!dobString) return patient.age || 58;
    const birth = new Date(dobString);
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const currentAge = calculateAge(formData.dob);

  // Correction Request Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    field: 'Diagnosis',
    current_value: 'Stable Sinus Rhythm',
    requested_correction: '',
    reason: ''
  });
  const [correctionRequests, setCorrectionRequests] = useState([
    { id: 'CR-101', field: 'Allergies', requested: 'Add Penicillin allergy', reason: 'Mild rash experienced in 2024', status: 'REVIEWED_APPROVED', date: '2026-08-15' }
  ]);

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    localStorage.setItem('aura_patient_language', formData.preferred_language);
    if (onUpdateProfile) {
      onUpdateProfile({ ...patient, ...formData, age: currentAge });
    }
    alert('✓ Profile and preferences updated successfully!');
  };

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    const newReq = {
      id: `CR-${Math.floor(100 + Math.random() * 900)}`,
      field: correctionForm.field,
      requested: correctionForm.requested_correction,
      reason: correctionForm.reason,
      status: 'PENDING_PHYSICIAN_REVIEW',
      date: new Date().toISOString().split('T')[0]
    };
    setCorrectionRequests([newReq, ...correctionRequests]);
    setShowCorrectionModal(false);
    alert('✓ Clinical correction request submitted for physician review.');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #0d9488)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '24px' }}>
            {formData.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{formData.name}</h2>
            <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#64748b', marginTop: '4px', flexWrap: 'wrap' }}>
              <span>MRN: <strong style={{ color: '#0f172a' }}>{patient.mrn || 'MRN-884920'}</strong> (Read-Only)</span>
              <span>&bull;</span>
              <span>UHID: <strong style={{ color: '#0f172a' }}>{patient.uhid || 'UHID-2026-884920'}</strong></span>
              <span>&bull;</span>
              <span>Age: <strong style={{ color: '#0f172a' }}>{currentAge} yrs</strong></span>
            </div>
          </div>
        </div>

        <button onClick={handleSaveProfile} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 18px' }}>
          <Save size={16} /> Save All Changes
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        {[
          { key: 'personal', label: 'Personal Information', icon: User },
          { key: 'emergency', label: 'Emergency Contact', icon: Phone },
          { key: 'preferences', label: 'Language & Voice', icon: Globe },
          { key: 'consent', label: 'Consent & Privacy', icon: Shield },
          { key: 'correction', label: 'Clinical Corrections', icon: FileText },
          { key: 'security', label: 'Security & Sessions', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              style={{
                background: isActive ? '#0284c7' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. Personal Information */}
      {activeSubTab === 'personal' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>👤 Personal Demographic Details</h3>
          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Date of Birth (Age: {currentAge} yrs)</label>
                <input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Blood Group</label>
                <select value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Phone Number (Editable)</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Residential Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>State</label>
                <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pincode</label>
                <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 2. Emergency Contact */}
      {activeSubTab === 'emergency' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>🚨 Emergency Contact Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Contact Person Name</label>
              <input type="text" value={formData.emergency_name} onChange={(e) => setFormData({ ...formData, emergency_name: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Relationship</label>
              <input type="text" value={formData.emergency_relation} onChange={(e) => setFormData({ ...formData, emergency_relation: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Emergency Phone</label>
              <input type="tel" value={formData.emergency_phone} onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
        </div>
      )}

      {/* 3. Language & Voice Preferences */}
      {activeSubTab === 'preferences' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>🌐 Language & Voice Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Preferred Language (Persisted Across Portals)</label>
              <select
                value={formData.preferred_language}
                onChange={(e) => {
                  setFormData({ ...formData, preferred_language: e.target.value });
                  localStorage.setItem('aura_patient_language', e.target.value);
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                {INDIAN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>Voice Guidance & Auto-Read</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Automatically read instructions aloud in preferred language</p>
              </div>
              <input type="checkbox" checked={formData.auto_read} onChange={(e) => setFormData({ ...formData, auto_read: e.target.checked })} style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
        </div>
      )}

      {/* 4. Consent History */}
      {activeSubTab === 'consent' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>🛡️ Digital Health Consent History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { type: 'MediKiosk Clinical Intake Consent', date: '2026-08-31 10:05 AM', status: 'GRANTED', version: 'v2.4' },
              { type: 'AI Diagnostic Processing & OCR Consent', date: '2026-08-31 10:05 AM', status: 'GRANTED', version: 'v2.4' },
              { type: 'ABHA / ABDM Health Records Sharing', date: '2026-08-20 09:30 AM', status: 'GRANTED', version: 'v1.1' }
            ].map((c, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{c.type}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Recorded on: {c.date} &bull; Policy: {c.version}</div>
                </div>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  ✓ {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Clinical Corrections */}
      {activeSubTab === 'correction' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>📝 Clinical Information Correction Requests</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Doctor diagnoses and clinical notes are immutable. Submit a formal correction request for physician review.
              </p>
            </div>
            <button onClick={() => setShowCorrectionModal(true)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              + Request Correction
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {correctionRequests.map((cr) => (
              <div key={cr.id} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px' }}>{cr.field}: {cr.requested}</strong>
                  <span style={{ fontSize: '11px', background: cr.status.includes('APPROVED') ? '#dcfce7' : '#fef3c7', color: cr.status.includes('APPROVED') ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {cr.status}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Reason: {cr.reason} &bull; Submitted: {cr.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Security */}
      {activeSubTab === 'security' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>🔒 Security & Active Sessions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '500px' }}>
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '13px' }}>Current Active Session</strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Patient Portal &bull; Web Browser &bull; IP: 127.0.0.1</p>
            </div>
            <button onClick={() => alert('Password reset verification link sent to your registered email.')} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
              Change Password
            </button>
          </div>
        </div>
      )}

      {/* Correction Request Modal */}
      {showCorrectionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>📝 Request Clinical Record Correction</h3>
              <button onClick={() => setShowCorrectionModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Field to Correct</label>
                  <select value={correctionForm.field} onChange={(e) => setCorrectionForm({ ...correctionForm, field: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>Allergies</option>
                    <option>Past Medical History</option>
                    <option>Current Medications</option>
                    <option>Personal History</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Requested Correction *</label>
                  <input type="text" required placeholder="e.g. Add Penicillin allergy" value={correctionForm.requested_correction} onChange={(e) => setCorrectionForm({ ...correctionForm, requested_correction: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Clinical Reason *</label>
                  <textarea required rows={3} placeholder="Please explain the clinical rationale..." value={correctionForm.reason} onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowCorrectionModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Submit to Physician</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
