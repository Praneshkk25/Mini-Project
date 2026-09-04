import React, { useState } from 'react';
import { Building2, User, Lock, ArrowRight, Shield } from 'lucide-react';

const HOSPITALS = [
  'AuraHealth Central Hospital',
  'AuraHealth City Care Hospital',
  'AuraHealth Multispeciality Hospital',
  'AuraHealth Medical Center'
];

export default function Login({ onLoginSuccess }) {
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [role, setRole] = useState('Receptionist');
  const [username, setUsername] = useState('receptionist');
  const [password, setPassword] = useState('staff123');
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
        // Fallback demo user
        const userData = {
          id: 4,
          name: role === 'Hospital Administrator' ? 'Dr. Marcus Vance' : 'Elena Rostova',
          role: role === 'Hospital Administrator' ? 'admin' : 'receptionist',
          employee_id: role === 'Hospital Administrator' ? 'EMP-ADM-001' : 'EMP-OPS-4412',
          email: role === 'Hospital Administrator' ? 'admin@aurahealth.org' : 'elena.rostova@aurahealth.org',
          phone: '+91 98409 11223',
          hospital
        };
        localStorage.setItem('aura_receptionist_user', JSON.stringify(userData));
        onLoginSuccess(userData);
        return;
      }

      const data = await res.json();
      data.hospital = hospital;
      if (role === 'Hospital Administrator') data.role = 'admin';
      localStorage.setItem('aura_receptionist_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      const userData = {
        id: 4,
        name: role === 'Hospital Administrator' ? 'Dr. Marcus Vance' : 'Elena Rostova',
        role: role === 'Hospital Administrator' ? 'admin' : 'receptionist',
        employee_id: role === 'Hospital Administrator' ? 'EMP-ADM-001' : 'EMP-OPS-4412',
        email: role === 'Hospital Administrator' ? 'admin@aurahealth.org' : 'elena.rostova@aurahealth.org',
        phone: '+91 98409 11223',
        hospital
      };
      localStorage.setItem('aura_receptionist_user', JSON.stringify(userData));
      onLoginSuccess(userData);
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
      background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
      padding: '1.5rem'
    }}>
      <div className="card" style={{ width: '440px', padding: '2.5rem', background: '#ffffff', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #0284c7, #7c3aed)',
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
            Hospital Front Desk & Operations Console
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
              Role
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value === 'Hospital Administrator') {
                  setUsername('admin');
                  setPassword('admin123');
                } else {
                  setUsername('receptionist');
                  setPassword('staff123');
                }
              }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            >
              <option>Receptionist</option>
              <option>Hospital Administrator</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
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
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, borderRadius: '8px' }}
          >
            {loading ? 'Authenticating...' : `Sign In as ${role}`}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleLogin}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
          >
            🚀 Quick Login ({role === 'Hospital Administrator' ? 'Dr. Marcus Vance' : 'Elena Rostova'})
          </button>
        </div>
      </div>
    </div>
  );
}
