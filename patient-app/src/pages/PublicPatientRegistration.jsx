import React, { useState } from 'react';
import {
  User,
  Heart,
  Shield,
  Building2,
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const HOSPITALS = [
  'AuraHealth Central Hospital',
  'AuraHealth City Care Hospital',
  'AuraHealth Multispeciality Hospital',
  'AuraHealth Medical Center'
];

export default function PublicPatientRegistration({ onRegistrationComplete, onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '1990-01-01',
    age: 36,
    gender: 'Female',
    phone: '',
    email: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    aadhaar: '',
    abha_id: '',
    emergency_name: '',
    emergency_relation: 'Spouse',
    emergency_phone: '',
    allergies: 'None known',
    conditions: 'None',
    medications: 'None',
    surgeries: 'None',
    family_history: 'None',
    hospital: HOSPITALS[0],
    password: '',
    confirm_password: '',
    consent_terms: false,
    consent_storage: false
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone) {
      setError('Please fill in all required demographic details.');
      return;
    }
    if (formData.password && formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.consent_terms || !formData.consent_storage) {
      setError('Please accept the terms and clinical data storage consent.');
      return;
    }

    const uhid = `AUR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPatient = {
      patient_id: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      uhid,
      mrn: `MRN-${uhid.split('-')[2]}`,
      name: formData.name,
      dob: formData.dob,
      age: Number(formData.age),
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@aurahealth.org`,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      emergency_name: formData.emergency_name,
      emergency_relation: formData.emergency_relation,
      emergency_phone: formData.emergency_phone,
      allergies: formData.allergies,
      conditions: formData.conditions,
      medications: formData.medications,
      hospital: formData.hospital,
      role: 'patient'
    };

    localStorage.setItem('aura_patient_user', JSON.stringify(newPatient));
    onRegistrationComplete(newPatient);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
      padding: '2rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="card" style={{ maxWidth: '800px', width: '100%', padding: '2.5rem', background: '#ffffff', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #0d9488, #0284c7)',
            borderRadius: '14px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1rem',
            fontWeight: 'bold'
          }}>🏥</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Your AuraHealth Account</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Register securely to access hospital services and your digital health record.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Personal Information */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#0284c7" /> 1. Personal Demographic Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Full Legal Name *</label>
                <input type="text" required placeholder="e.g. Eleanor Vance" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Gender *</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Date of Birth *</label>
                <input type="date" required value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Age *</label>
                <input type="number" required value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Phone Number *</label>
                <input type="tel" required placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Residential Address</label>
                <input type="text" placeholder="House / Street" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Pincode</label>
                <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
          </div>

          {/* Section 2: Hospital & Identity */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#0d9488" /> 2. Primary Hospital & Digital Health Identity
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Select Hospital Facility *</label>
              <select value={formData.hospital} onChange={(e) => setFormData({ ...formData, hospital: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {HOSPITALS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>ABHA Address / National ID (Optional)</label>
                <input type="text" placeholder="e.g. eleanor@abdm" value={formData.abha_id} onChange={(e) => setFormData({ ...formData, abha_id: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Aadhaar / Government ID (Optional)</label>
                <input type="text" placeholder="XXXX-XXXX-XXXX" value={formData.aadhaar} onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency & Medical Details */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={18} color="#ef4444" /> 3. Emergency Contact & Known Medical Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Emergency Contact Name</label>
                <input type="text" placeholder="Contact person" value={formData.emergency_name} onChange={(e) => setFormData({ ...formData, emergency_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Relationship</label>
                <input type="text" placeholder="Spouse / Parent" value={formData.emergency_relation} onChange={(e) => setFormData({ ...formData, emergency_relation: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Emergency Phone</label>
                <input type="tel" placeholder="+91 98765 00000" value={formData.emergency_phone} onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Known Drug/Food Allergies</label>
              <input type="text" placeholder="e.g. Penicillin, Sulfa, None" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          {/* Section 4: Security & Consents */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#10b981" /> 4. Account Security & Consent
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create Portal Password *</label>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>Confirm Password *</label>
                <input type="password" required value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#334155' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.consent_terms} onChange={(e) => setFormData({ ...formData, consent_terms: e.target.checked })} />
                <span>I agree to AuraHealth Terms of Service and Privacy Policy.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.consent_storage} onChange={(e) => setFormData({ ...formData, consent_storage: e.target.checked })} />
                <span>I consent to securely storing my health information for clinical care and MediKiosk intake.</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={onBackToLogin} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
              &larr; Back to Login
            </button>

            <button type="submit" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Continue to AuraHealth MediKiosk <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
