import React, { useState } from 'react';
import { Building2, User, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const HOSPITALS = [
  'AuraHealth Central Hospital',
  'AuraHealth City Care Hospital',
  'AuraHealth Multispeciality Hospital',
  'AuraHealth Medical Center'
];

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');

    // Input Validation
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your registered phone number, email address, or MRN.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          password: password,
          hospital: hospital
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Generic security error from backend: "Incorrect phone number/email or password."
        setError(data.detail || 'Incorrect phone number/email or password.');
        return;
      }

      if (data.patient) {
        onLoginSuccess(data.patient);
      } else {
        setError('Login response format error. Please try again.');
      }
    } catch (err) {
      setError('Unable to reach AuraHealth authentication service. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick fillers for testing
  const handleQuickDemo = (demoType) => {
    if (demoType === 'james') {
      setIdentifier('+91 98765 43210');
      setPassword('patient123');
      setError('');
    } else if (demoType === 'eleanor') {
      setIdentifier('+91 98765 43212');
      setPassword('patient123');
      setError('');
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
      <div className="card" style={{ width: '460px', padding: '2.5rem', background: '#ffffff', borderRadius: '18px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #0d9488, #0284c7)',
            borderRadius: '16px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 20px rgba(13,148,136,0.25)'
          }}>🏥</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
            AuraHealth Patient Portal
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Sign in to view your health records, appointments, and care companion
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Primary Hospital */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Select Hospital Unit
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
              >
                {HOSPITALS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Identifier: Phone / Email / MRN */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Phone Number / Email / MRN
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. +91 98765 43210 or email"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.4rem 0.75rem 2.4rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '0.4rem',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Demo Fast Logins for Testing */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', textAlign: 'center' }}>
            🧪 Fast Demo Logins (Testing Accounts)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('james')}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              👤 James Robertson (PT-1001)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('eleanor')}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              👤 Eleanor Vance (PT-1002)
            </button>
          </div>
        </div>

        {/* Registration Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            First time visiting AuraHealth?{' '}
          </span>
          <button
            type="button"
            onClick={onGoToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#0d9488',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Register as New Patient
          </button>
        </div>

        {/* Security badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>HIPAA & ABDM Compliant 256-Bit Encrypted Portal</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px', background: '#fff', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Password Assistance
            </h3>
            <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px' }}>
              For your patient record security, password resets are verified via SMS OTP to your registered phone number or handled directly at any hospital registration desk.
            </p>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#166534', marginBottom: '16px' }}>
              📞 AuraHealth Support Helpline: <strong>+91 11 4059 8800</strong> (24x7)
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
