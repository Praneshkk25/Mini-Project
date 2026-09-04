import React, { useState } from 'react';
import { Building2, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const HOSPITALS = [
  'AuraHealth Central Hospital',
  'AuraHealth City Care Hospital',
  'AuraHealth Multispeciality Hospital',
  'AuraHealth Medical Center'
];

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [role, setRole] = useState('Patient');
  const [username, setUsername] = useState('patient');
  const [password, setPassword] = useState('patient123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        // Fallback for standalone demo mode
        const defaultUser = {
          patient_id: 'PT-1001',
          uhid: 'AUR-2026-001001',
          mrn: 'MRN-884920',
          name: username === 'eleanor' ? 'Eleanor Vance' : 'James Robertson',
          dob: '1968-05-14',
          age: 58,
          gender: 'Male',
          phone: '+91 98765 43210',
          email: `${username}@aurahealth.org`,
          hospital,
          role: 'patient'
        };
        localStorage.setItem('aura_patient_user', JSON.stringify(defaultUser));
        onLoginSuccess(defaultUser);
        return;
      }

      const userData = await res.json();
      userData.hospital = hospital;
      localStorage.setItem('aura_patient_user', JSON.stringify(userData));
      onLoginSuccess(userData);
    } catch (err) {
      // Offline / demo fallback
      const defaultUser = {
        patient_id: 'PT-1001',
        uhid: 'AUR-2026-001001',
        mrn: 'MRN-884920',
        name: 'James Robertson',
        dob: '1968-05-14',
        age: 58,
        gender: 'Male',
        phone: '+91 98765 43210',
        email: 'james.robertson@aurahealth.org',
        hospital,
        role: 'patient'
      };
      localStorage.setItem('aura_patient_user', JSON.stringify(defaultUser));
      onLoginSuccess(defaultUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
      padding: '1.5rem'
    }}>
      <div className="card" style={{ width: '440px', padding: '2.5rem', background: '#ffffff', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #0d9488, #0284c7)',
            borderRadius: '14px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1rem',
            fontWeight: 'bold'
          }}>🏥</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>AuraHealth</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Hospital Management & Patient Portal System
          </p>
        </div>

        {error && (
          <div style={{ background: '#ffe4e6', color: '#be123c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
              Select Hospital Facility
            </label>
            <select
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            >
              {HOSPITALS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
              Portal Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            >
              <option>Patient</option>
              <option>Doctor</option>
              <option>Receptionist</option>
              <option>Pharmacist</option>
              <option>Hospital Administrator</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
              Username or Patient UHID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="e.g. patient or AUR-2026-001001"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            New Patient?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              Register here &rarr;
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
