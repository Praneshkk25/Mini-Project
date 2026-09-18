import React, { useState, useEffect } from 'react';
import {
  User, Heart, Shield, Building2, Phone, Mail,
  MapPin, Calendar, CheckCircle, ArrowRight, Sparkles,
  AlertTriangle, Eye, EyeOff, Droplets, Stethoscope
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const HOSPITALS = [
  'AuraHealth Central Hospital',
  'AuraHealth City Care Hospital',
  'AuraHealth Multispeciality Hospital',
  'AuraHealth Medical Center',
];

const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'];

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const RELATIONS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Guardian', 'Other'];

/* ── helper: compute age from DOB ── */
function ageFromDob(dob) {
  if (!dob) return '';
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? age : '';
}

/* ── small sub-component: section header ── */
function Section({ icon, number, title, color = '#0284c7' }) {
  return (
    <h3 style={{
      fontSize: '1rem', fontWeight: 700, color: '#0f172a',
      borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem',
      marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      {React.cloneElement(icon, { size: 18, color })}
      {number}. {title}
    </h3>
  );
}

/* ── field wrapper ── */
function Field({ label, required, children, span = 1 }) {
  return (
    <div style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px',
  border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a',
  background: '#fff', boxSizing: 'border-box',
};

export default function PublicPatientRegistration({ onRegistrationComplete, onBackToLogin }) {
  const [step, setStep] = useState(1); // 1=Demographics  2=Medical  3=Security
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [abhaVerified, setAbhaVerified] = useState(false);
  const [abhaChecking, setAbhaChecking] = useState(false);

  const [form, setForm] = useState({
    // Section 1 – Demographics
    name: '',
    dob: '',
    age: '',
    gender: 'Female',
    phone: '',
    email: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    hospital: HOSPITALS[0],
    // Section 2 – Identity & Medical
    uhid: '',
    abha_id: '',
    aadhaar: '',
    blood_group: 'O+',
    allergies: 'None known',
    conditions: 'None',
    medications: 'None',
    surgeries: 'None',
    family_history: 'None',
    // Section 2b – Emergency contact
    emergency_name: '',
    emergency_relation: 'Spouse',
    emergency_phone: '',
    // Section 3 – Security & Consent
    password: '',
    confirm_password: '',
    consent_terms: false,
    consent_storage: false,
    consent_ai: false,
  });

  // Auto-calculate age whenever DOB changes
  useEffect(() => {
    if (form.dob) setForm((f) => ({ ...f, age: ageFromDob(form.dob) }));
  }, [form.dob]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  /* ── ABHA verify ── */
  const handleVerifyAbha = async () => {
    if (!form.abha_id.trim()) return;
    setAbhaChecking(true);
    try {
      const res  = await fetch(`${API_BASE}/intake/abha/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abha_id: form.abha_id }),
      });
      const data = await res.json();
      if (data.status?.includes('VERIFIED')) setAbhaVerified(true);
    } catch {}
    setAbhaChecking(false);
  };

  /* ── Step validation ── */
  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!form.name.trim()) return setError('Full legal name is required.'), false;
      const cleanPhone = form.phone.replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) return setError('Please enter a valid 10-digit mobile number.'), false;
      if (!form.dob) return setError('Date of birth is required.'), false;
      const birth = new Date(form.dob);
      if (birth > new Date()) return setError('Date of birth cannot be in the future.'), false;
      if (!form.gender) return setError('Please select a gender.'), false;
    }
    if (step === 3) {
      if (!form.password) return setError('Please create a 6-digit PIN or password.'), false;
      if (form.password.length < 6) return setError('Password/PIN must be at least 6 characters.'), false;
      if (form.password !== form.confirm_password) return setError('Passwords do not match.'), false;
      if (!form.consent_terms) return setError('Please accept the Terms of Service & Privacy Policy.'), false;
      if (!form.consent_storage) return setError('Please accept the Clinical Data Storage Consent.'), false;
    }
    return true;
  };

  /* ── Final submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    setError('');

    try {
      // Call modern AuraHealth patient registration
      const res = await fetch(`${API_BASE}/auth/patient/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          dob: form.dob,
          gender: form.gender,
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
          emergency_contact: form.emergency_name ? `${form.emergency_name} (${form.emergency_relation}) - ${form.emergency_phone}` : undefined,
          blood_group: form.blood_group,
          allergies: form.allergies,
          abha_id: form.abha_id.trim() || undefined,
          uhid: form.uhid.trim() || undefined,
          primary_hospital_name: form.hospital,
          password: form.password,
          terms_accepted: form.consent_terms,
          data_consent: form.consent_storage,
          ai_consent: form.consent_ai,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed. Please check your inputs.');
      }

      const p = data.patient || {};
      const newPatient = {
        patient_id: p.patient_id || data.patient_id,
        uhid: p.uhid || form.uhid.trim() || null,
        mrn: p.mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
        name: p.name || form.name.trim(),
        dob: p.dob || form.dob,
        age: p.age || Number(form.age) || 25,
        gender: p.gender || form.gender,
        phone: p.phone || form.phone.trim(),
        email: p.email || form.email.trim(),
        address: p.address || form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        blood_group: p.blood_group || form.blood_group,
        allergies: p.allergies || form.allergies,
        conditions: form.conditions,
        medications: form.medications,
        hospital: p.primary_hospital_name || form.hospital,
        primary_hospital_name: p.primary_hospital_name || form.hospital,
        emergency_name: form.emergency_name,
        emergency_relation: form.emergency_relation,
        emergency_phone: form.emergency_phone,
        abha_id: p.abha_id || form.abha_id,
        onboarding_completed: p.onboarding_completed || false,
        intake_step: 'pending',
        role: 'patient',
      };

      localStorage.setItem('aura_patient_user', JSON.stringify(newPatient));
      onRegistrationComplete(newPatient);

    } catch (err) {
      console.warn('Registration API error:', err);
      setError(err.message || 'Could not complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ════════════════════════════════════════
     STEP INDICATOR
  ════════════════════════════════════════ */
  const STEPS = ['Demographics', 'Medical Info', 'Security & Consent'];

  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: 0 }}>
      {STEPS.map((label, idx) => {
        const num   = idx + 1;
        const done  = step > num;
        const active = step === num;
        return (
          <React.Fragment key={num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: done ? '#10b981' : active ? '#0284c7' : '#e2e8f0',
                color: done || active ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '14px', marginBottom: '4px',
                transition: 'all .3s',
              }}>
                {done ? <CheckCircle size={16} /> : num}
              </div>
              <span style={{ fontSize: '11px', fontWeight: active ? 700 : 500, color: active ? '#0284c7' : '#94a3b8', textAlign: 'center' }}>
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{ flex: 2, height: '2px', background: step > num ? '#10b981' : '#e2e8f0', transition: 'all .3s', marginBottom: '18px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ════════════════════════════════════════
     OUTER SHELL
  ════════════════════════════════════════ */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0f172a 0%,#0d9488 100%)',
      padding: '2rem 1rem',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    }}>
      <div style={{ maxWidth: '820px', width: '100%', background: '#fff', borderRadius: '18px', padding: '2.5rem', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg,#0d9488,#0284c7)',
            borderRadius: '14px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', margin: '0 auto .75rem',
          }}>🏥</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Create Your AuraHealth Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Register securely to access hospital services and your digital health record.
          </p>
        </div>

        <StepBar />

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ══════════ STEP 1: DEMOGRAPHICS ══════════ */}
          {step === 1 && (
            <div>
              <Section icon={<User />} number={1} title="Personal Demographic Details" color="#0284c7" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Field label="Full Legal Name" required>
                  <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. Aarav Sharma" style={inputStyle} />
                </Field>
                <Field label="Gender" required>
                  <select value={form.gender} onChange={(e) => set('gender', e.target.value)} style={inputStyle}>
                    <option>Female</option><option>Male</option><option>Other</option>
                  </select>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Field label="Date of Birth" required>
                  <input type="date" required value={form.dob} onChange={(e) => set('dob', e.target.value)}
                    max={new Date().toISOString().split('T')[0]} style={inputStyle} />
                </Field>
                <Field label="Age (auto-calculated)">
                  <input type="number" value={form.age} readOnly
                    placeholder="Auto from DOB" style={{ ...inputStyle, background: '#f8fafc', color: '#475569' }} />
                </Field>
                <Field label="Blood Group" required>
                  <select value={form.blood_group} onChange={(e) => set('blood_group', e.target.value)} style={inputStyle}>
                    {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Field label="Phone Number" required>
                  <input type="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)}
                    placeholder="+91 98765 43210" style={inputStyle} />
                </Field>
                <Field label="Email Address">
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                    placeholder="you@example.com" style={inputStyle} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Field label="Street / House Address">
                  <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)}
                    placeholder="House No., Street, Area" style={inputStyle} />
                </Field>
                <Field label="City">
                  <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="State">
                  <select value={form.state} onChange={(e) => set('state', e.target.value)} style={inputStyle}>
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="PIN Code">
                  <input type="text" maxLength={6} value={form.pincode} onChange={(e) => set('pincode', e.target.value)}
                    placeholder="560001" style={inputStyle} />
                </Field>
              </div>

              <Field label="Select Primary Hospital" required>
                <select value={form.hospital} onChange={(e) => set('hospital', e.target.value)} style={inputStyle}>
                  {HOSPITALS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* ══════════ STEP 2: MEDICAL INFO ══════════ */}
          {step === 2 && (
            <div>
              {/* 2a — Digital Identity */}
              <Section icon={<Building2 />} number={2} title="Digital Health Identity" color="#0d9488" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* UHID */}
                <Field label="UHID (Optional - if already assigned)">
                  <input type="text" value={form.uhid} onChange={(e) => set('uhid', e.target.value)}
                    placeholder="e.g. AUR-2026-1002" style={inputStyle} />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Leave blank if new to AuraHealth
                  </div>
                </Field>
                {/* ABHA */}
                <Field label="ABHA Address / Health ID (Optional)">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={form.abha_id} onChange={(e) => set('abha_id', e.target.value)}
                      placeholder="e.g. 91-XXXX-XXXX-XXXX" style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={handleVerifyAbha} disabled={abhaChecking || !form.abha_id}
                      style={{
                        background: abhaVerified ? '#10b981' : '#0d9488', color: '#fff',
                        border: 'none', padding: '0 14px', borderRadius: '8px',
                        fontWeight: 700, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                      }}>
                      {abhaChecking ? '…' : abhaVerified ? '✓ Verified' : 'Verify'}
                    </button>
                  </div>
                  {abhaVerified && (
                    <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 700 }}>
                      ✓ ABHA verified (DEMO)
                    </div>
                  )}
                </Field>
                <Field label="Aadhaar / National ID (Optional)">
                  <input type="text" value={form.aadhaar} onChange={(e) => set('aadhaar', e.target.value)}
                    placeholder="XXXX-XXXX-XXXX" style={inputStyle} />
                </Field>
              </div>

              {/* 2b — Medical details */}
              <Section icon={<Stethoscope />} number={3} title="Known Medical History" color="#8b5cf6" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <Field label="Known Drug / Food Allergies">
                  <input type="text" value={form.allergies} onChange={(e) => set('allergies', e.target.value)}
                    placeholder="e.g. Penicillin, Sulfa, None" style={inputStyle} />
                </Field>
                <Field label="Existing Medical Conditions">
                  <input type="text" value={form.conditions} onChange={(e) => set('conditions', e.target.value)}
                    placeholder="e.g. Diabetes, Hypertension, None" style={inputStyle} />
                </Field>
                <Field label="Current Medications">
                  <input type="text" value={form.medications} onChange={(e) => set('medications', e.target.value)}
                    placeholder="e.g. Metformin 500mg, None" style={inputStyle} />
                </Field>
                <Field label="Past Surgeries / Procedures">
                  <input type="text" value={form.surgeries} onChange={(e) => set('surgeries', e.target.value)}
                    placeholder="e.g. Appendectomy 2018, None" style={inputStyle} />
                </Field>
                <Field label="Family Medical History" span={2}>
                  <input type="text" value={form.family_history} onChange={(e) => set('family_history', e.target.value)}
                    placeholder="e.g. Father — Heart disease; Mother — Diabetes; None" style={inputStyle} />
                </Field>
              </div>

              {/* 2c — Emergency contact */}
              <Section icon={<Phone />} number={4} title="Emergency Contact" color="#ef4444" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <Field label="Contact Person Name">
                  <input type="text" value={form.emergency_name} onChange={(e) => set('emergency_name', e.target.value)}
                    placeholder="Full name" style={inputStyle} />
                </Field>
                <Field label="Relationship">
                  <select value={form.emergency_relation} onChange={(e) => set('emergency_relation', e.target.value)} style={inputStyle}>
                    {RELATIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Emergency Phone">
                  <input type="tel" value={form.emergency_phone} onChange={(e) => set('emergency_phone', e.target.value)}
                    placeholder="+91 98765 00000" style={inputStyle} />
                </Field>
              </div>
            </div>
          )}

          {/* ══════════ STEP 3: SECURITY & CONSENT ══════════ */}
          {step === 3 && (
            <div>
              <Section icon={<Shield />} number={5} title="Portal Password" color="#10b981" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                <Field label="Create Password" required>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} required value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      placeholder="Min 6 characters" style={{ ...inputStyle, paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && (
                    <div style={{ marginTop: '4px', display: 'flex', gap: '4px' }}>
                      {[1,2,3,4].map((n) => (
                        <div key={n} style={{ flex: 1, height: '3px', borderRadius: '2px', background: form.password.length >= n * 3 ? (form.password.length >= 12 ? '#10b981' : form.password.length >= 6 ? '#f59e0b' : '#ef4444') : '#e2e8f0' }} />
                      ))}
                    </div>
                  )}
                </Field>
                <Field label="Confirm Password" required>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirm ? 'text' : 'password'} required value={form.confirm_password}
                      onChange={(e) => set('confirm_password', e.target.value)}
                      placeholder="Re-enter password" style={{ ...inputStyle, paddingRight: '2.5rem', borderColor: form.confirm_password && form.confirm_password !== form.password ? '#ef4444' : undefined }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirm_password && form.confirm_password !== form.password && (
                    <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Passwords do not match</div>
                  )}
                </Field>
              </div>

              {/* Summary card */}
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', fontSize: '13px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#15803d', fontSize: '14px', fontWeight: 700 }}>
                  📋 Registration Summary
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', color: '#334155' }}>
                  <div>Name: <strong>{form.name}</strong></div>
                  <div>Age / Gender: <strong>{form.age} yrs / {form.gender}</strong></div>
                  <div>Phone: <strong>{form.phone}</strong></div>
                  <div>Blood Group: <strong>{form.blood_group}</strong></div>
                  <div>Hospital: <strong>{form.hospital}</strong></div>
                  <div>Allergies: <strong>{form.allergies}</strong></div>
                </div>
              </div>

              {/* Consents */}
              <Section icon={<Shield />} number={6} title="Consent & Agreement" color="#0284c7" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: '#334155' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${form.consent_terms ? '#86efac' : '#e2e8f0'}`, background: form.consent_terms ? '#f0fdf4' : '#fff' }}>
                  <input type="checkbox" checked={form.consent_terms} onChange={(e) => set('consent_terms', e.target.checked)} style={{ marginTop: '2px' }} />
                  <span><strong>Terms of Service & Privacy Policy *</strong><br />I agree to AuraHealth's Terms of Service, Privacy Policy, and Data Protection Statement.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${form.consent_storage ? '#86efac' : '#e2e8f0'}`, background: form.consent_storage ? '#f0fdf4' : '#fff' }}>
                  <input type="checkbox" checked={form.consent_storage} onChange={(e) => set('consent_storage', e.target.checked)} style={{ marginTop: '2px' }} />
                  <span><strong>Clinical Data Storage Consent *</strong><br />I consent to securely storing my health information for clinical care and MediKiosk intake as per DISHA/IT Act.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${form.consent_ai ? '#86efac' : '#e2e8f0'}`, background: form.consent_ai ? '#f0fdf4' : '#fff' }}>
                  <input type="checkbox" checked={form.consent_ai} onChange={(e) => set('consent_ai', e.target.checked)} style={{ marginTop: '2px' }} />
                  <span><strong>AI-Assisted Clinical Processing (Optional)</strong><br />I consent to AI-powered summarisation and triage assistance during my clinical intake sessions.</span>
                </label>
              </div>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            {step === 1 ? (
              <button type="button" onClick={onBackToLogin} className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                ← Back to Login
              </button>
            ) : (
              <button type="button" onClick={() => { setError(''); setStep(step - 1); }} className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                ← Previous
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => { if (validateStep()) setStep(step + 1); }}
                className="btn-primary"
                style={{ padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {submitting
                  ? 'Creating Account…'
                  : <><Sparkles size={18} /> Create Account & Go to MediKiosk</>
                }
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
