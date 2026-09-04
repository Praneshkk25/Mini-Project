import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Settings,
  Shield,
  Activity,
  Bell,
  FileCheck,
  Building2,
  Lock,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  PenTool,
  X
} from 'lucide-react';

export default function DoctorProfileSettingsView({ doctor, onUpdateDoctor }) {
  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Doctor Profile Form
  const [profile, setProfile] = useState({
    name: doctor?.name || 'Dr. Sarah Jenkins',
    doctor_id: doctor?.doctor_id || 'DOC-CAR-101',
    department: doctor?.department || 'Cardiology',
    designation: doctor?.designation || 'Chief of Cardiology',
    specialization: doctor?.specialization || 'Interventional Cardiology & Electrophysiology',
    registration_number: doctor?.registration_number || 'MCI-REG-84920-IND',
    qualifications: doctor?.qualifications || 'MD (Cardiology), DM, FACC, FSCAI',
    experience_years: doctor?.experience_years || 16,
    languages: doctor?.languages || 'English, Hindi, Tamil',
    affiliation: doctor?.affiliation || 'AuraHealth Central Super-Specialty Hospital',
    phone: doctor?.phone || '+91 98401 55678',
    email: doctor?.email || 'sarah.jenkins@aurahealth.org',
    office_room: doctor?.office_room || 'Consultation Suite 204 (2nd Floor)',
    pager: doctor?.pager || 'PGR-404'
  });

  // Schedule & Availability
  const [schedule, setSchedule] = useState({
    working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    start_time: '09:00 AM',
    end_time: '05:00 PM',
    slot_duration_minutes: 15,
    max_opd_patients_per_day: 30,
    break_start: '01:00 PM',
    break_end: '02:00 PM',
    teleconsult_enabled: true
  });

  // Clinical & Telemetry Preferences
  const [preferences, setPreferences] = useState({
    auto_open_history: true,
    auto_open_kiosk: true,
    auto_open_vitals: true,
    auto_open_investigations: true,
    show_ai_cds: true,
    require_physician_confirmation: true,
    critical_alert_sound: true,
    desktop_notifications: true,
    auto_refresh_telemetry: true,
    refresh_interval_sec: 5,
    only_my_patients: false
  });

  // Digital Signature
  const [signature, setSignature] = useState({
    status: 'ACTIVE_VERIFIED',
    pin_enabled: true,
    last_signed: '2026-08-31 11:20 AM',
    certificate_id: 'DS-CERT-2026-SJ-992'
  });

  // Request Protected Field Change Modal
  const [showRequestChangeModal, setShowRequestChangeModal] = useState(false);
  const [changeField, setChangeField] = useState('Medical Registration Number');
  const [changeReason, setChangeReason] = useState('');

  const handleSave = (e) => {
    e?.preventDefault();
    const updated = { ...doctor, ...profile, schedule, preferences, signature };
    if (onUpdateDoctor) onUpdateDoctor(updated);
    localStorage.setItem('aura_doctor_user', JSON.stringify(updated));
    alert('✓ Doctor profile, clinical preferences, and schedule updated successfully.');
  };

  const handleRequestChange = (e) => {
    e.preventDefault();
    alert(`✓ Request to modify protected field "${changeField}" submitted to Hospital Administration Audit Desk.`);
    setShowRequestChangeModal(false);
    setChangeReason('');
  };

  const SUB_TABS = [
    { key: 'profile', label: '1. Professional Profile', icon: User },
    { key: 'contact', label: '2. Contact & Office', icon: Phone },
    { key: 'schedule', label: '3. Availability & Schedule', icon: Calendar },
    { key: 'consultation', label: '4. Consultation Preferences', icon: Clock },
    { key: 'clinical', label: '5. Clinical & AI CDS', icon: Settings },
    { key: 'telemetry', label: '6. Telemetry Preferences', icon: Activity },
    { key: 'notifications', label: '7. Notification Settings', icon: Bell },
    { key: 'signature', label: '8. Digital Signature', icon: PenTool },
    { key: 'affiliations', label: '9. Hospital Affiliations', icon: Building2 },
    { key: 'security', label: '10. Security & Privacy', icon: Lock },
    { key: 'audit', label: '11. Consent & Audit', icon: FileCheck }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #0d9488)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '24px' }}>
            {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{profile.name}</h2>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                ● Active Clinical Practicing
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b', marginTop: '4px', flexWrap: 'wrap' }}>
              <span>{profile.designation}</span>
              <span>&bull;</span>
              <span>Dept: <strong style={{ color: '#0f172a' }}>{profile.department}</strong></span>
              <span>&bull;</span>
              <span>Reg: <strong style={{ color: '#0284c7' }}>{profile.registration_number}</strong></span>
            </div>
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 18px' }}>
          <Save size={16} /> Save All Preferences
        </button>
      </div>

      {/* Internal Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        {SUB_TABS.map((tab) => {
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
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. Professional Profile */}
      {activeSubTab === 'profile' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>👨‍⚕️ Professional Credentials & Practice Details</h3>
            <button onClick={() => setShowRequestChangeModal(true)} className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>
              Request Protected Info Change
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Practitioner Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Doctor ID (Hospital Protected)</label>
              <input type="text" disabled value={profile.doctor_id} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Department</label>
              <input type="text" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Clinical Designation</label>
              <input type="text" value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Medical Council Registration No. (Read-Only)</label>
              <input type="text" disabled value={profile.registration_number} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Qualifications & Fellowships</label>
              <input type="text" value={profile.qualifications} onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Languages Spoken</label>
              <input type="text" value={profile.languages} onChange={(e) => setProfile({ ...profile, languages: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Years of Clinical Experience</label>
              <input type="number" value={profile.experience_years} onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
        </div>
      )}

      {/* 2. Contact Information */}
      {activeSubTab === 'contact' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>📞 Contact & Hospital Office Location</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Official Hospital Email</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Consultation Phone</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Office / Consultation Room</label>
              <input type="text" value={profile.office_room} onChange={(e) => setProfile({ ...profile, office_room: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Internal Pager Code</label>
              <input type="text" value={profile.pager} onChange={(e) => setProfile({ ...profile, pager: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
        </div>
      )}

      {/* 3. Availability & Schedule */}
      {activeSubTab === 'schedule' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>📅 OPD Schedule & Booking Configuration</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Configuring these working hours directly syncs available appointment slots in the Patient and Receptionist booking engines.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>OPD Shift Start Time</label>
              <input type="text" value={schedule.start_time} onChange={(e) => setSchedule({ ...schedule, start_time: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>OPD Shift End Time</label>
              <input type="text" value={schedule.end_time} onChange={(e) => setSchedule({ ...schedule, end_time: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Slot Duration (Minutes)</label>
              <select value={schedule.slot_duration_minutes} onChange={(e) => setSchedule({ ...schedule, slot_duration_minutes: parseInt(e.target.value) || 15 })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Max Daily OPD Queue Limit</label>
              <input type="number" value={schedule.max_opd_patients_per_day} onChange={(e) => setSchedule({ ...schedule, max_opd_patients_per_day: parseInt(e.target.value) || 30 })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
        </div>
      )}

      {/* 4. Consultation & 5. Clinical Preferences */}
      {(activeSubTab === 'consultation' || activeSubTab === 'clinical') && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>⚙️ Clinical Workspace & AI CDS Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>Auto-Open MediKiosk AI Draft Summary</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Automatically expand structured patient intake upon opening chart</p>
              </div>
              <input type="checkbox" checked={preferences.auto_open_kiosk} onChange={(e) => setPreferences({ ...preferences, auto_open_kiosk: e.target.checked })} style={{ width: '18px', height: '18px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>AI Clinical Decision Support (CDS) Recommendations</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Show XGBoost cardiac risk scores and evidence-backed clinical suggestions</p>
              </div>
              <input type="checkbox" checked={preferences.show_ai_cds} onChange={(e) => setPreferences({ ...preferences, show_ai_cds: e.target.checked })} style={{ width: '18px', height: '18px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>Mandatory Physician Review Confirmation</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Require explicit doctor sign-off before committing AI summaries into immutable EHR</p>
              </div>
              <input type="checkbox" checked={preferences.require_physician_confirmation} onChange={(e) => setPreferences({ ...preferences, require_physician_confirmation: e.target.checked })} style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
        </div>
      )}

      {/* 6. Telemetry Preferences */}
      {activeSubTab === 'telemetry' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>🫀 Live Telemetry Stream Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>Audio Alarm for Critical Vitals (SpO2 &lt; 90% or HR &gt; 120)</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Play audio alert chime in telemetry station</p>
              </div>
              <input type="checkbox" checked={preferences.critical_alert_sound} onChange={(e) => setPreferences({ ...preferences, critical_alert_sound: e.target.checked })} style={{ width: '18px', height: '18px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>Filter: Only Show Admitted Patients Under My Care</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Hides telemetry from unassigned general wards</p>
              </div>
              <input type="checkbox" checked={preferences.only_my_patients} onChange={(e) => setPreferences({ ...preferences, only_my_patients: e.target.checked })} style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
        </div>
      )}

      {/* 8. Digital Signature */}
      {activeSubTab === 'signature' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>✍️ Electronic Prescription & Discharge Signature</h3>
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '24px', borderRadius: '12px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '32px', color: '#0284c7', marginBottom: '8px' }}>
              {profile.name}
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Certificate: <strong>{signature.certificate_id}</strong> &bull; Status: <span style={{ color: '#15803d', fontWeight: 700 }}>VERIFIED</span>
            </p>
          </div>
          <button onClick={() => alert('Digital signature PIN verification confirmed.')} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 14px' }}>
            Update Signature PIN & Stamp
          </button>
        </div>
      )}

      {/* 10. Security & 11. Audit */}
      {(activeSubTab === 'security' || activeSubTab === 'audit' || activeSubTab === 'affiliations' || activeSubTab === 'notifications') && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800 }}>🛡️ Security & Institutional Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>Current Clinical Session</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Doctor Workstation &bull; Authenticated via Hospital IAM &bull; IP: 127.0.0.1</p>
              </div>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Active & Verified
              </span>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>EHR Access Log Compliance</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>All patient record views and prescription dispatches are immutably logged</p>
              </div>
              <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Audit Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Request Protected Change Modal */}
      {showRequestChangeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>🛡️ Request Protected Credential Change</h3>
              <button onClick={() => setShowRequestChangeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRequestChange}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Protected Field</label>
                  <select value={changeField} onChange={(e) => setChangeField(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>Medical Registration Number</option>
                    <option>Doctor ID</option>
                    <option>Clinical Designation</option>
                    <option>Hospital Affiliation</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Reason for Modification *</label>
                  <textarea required rows={3} placeholder="Provide details or upload medical license certificate..." value={changeReason} onChange={(e) => setChangeReason(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowRequestChangeModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Submit to Admin</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
