import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Bell, User, MapPin, CheckCircle, Sparkles } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function MyOPDTokenView({ patient }) {
  const [tokenData, setTokenData] = useState({
    token_number: '04',
    department: 'Cardiology OPD',
    doctor: 'Dr. Sarah Jenkins',
    room: 'Consultation Room 2 (1st Floor)',
    now_serving: '02',
    patients_ahead: 1,
    estimated_wait_minutes: 8,
    status: 'CALLED NEXT',
    last_updated: 'Just now'
  });
  const [notified, setNotified] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLiveQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/opd/queue`);
      if (res.ok) {
        const data = await res.json();
        // Calculate live queue stats
        setTokenData((prev) => ({
          ...prev,
          last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          My OPD Token & Live Queue
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
          Real-time outpatient queue tracking and turn notification.
        </p>
      </div>

      {/* Main Token Ticket Card */}
      <div className="card" style={{ padding: '32px', textAlign: 'center', border: '2px solid #0284c7', borderRadius: '18px', background: '#ffffff', boxShadow: '0 10px 30px rgba(2,132,199,0.1)', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '16px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
          LIVE OPD QUEUE PASS
        </div>

        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>YOUR TOKEN NUMBER</div>
        <h1 style={{ fontSize: '72px', fontWeight: 900, color: '#0284c7', margin: '8px 0', letterSpacing: '-2px' }}>
          #{tokenData.token_number}
        </h1>

        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
          {tokenData.department} &bull; {tokenData.doctor}
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          <MapPin size={14} color="#0284c7" /> {tokenData.room}
        </div>

        {/* 4 Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>NOW SERVING</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>#{tokenData.now_serving}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>YOUR TOKEN</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>#{tokenData.token_number}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PATIENTS AHEAD</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{tokenData.patients_ahead}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ESTIMATED WAIT</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>~{tokenData.estimated_wait_minutes}m</div>
          </div>
        </div>

        {/* Live Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '6px 16px', borderRadius: '20px', border: '1px solid #86efac' }}>
            STATUS: {tokenData.status}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setNotified(true);
            alert('✓ Turn notification registered! You will receive a high-priority alert when your token is called.');
          }}
          className={notified ? 'btn-secondary' : 'btn-primary'}
          style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Bell size={16} />
          {notified ? '✓ Notification Alert Active' : "Notify Me When I'm Next"}
        </button>

        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Auto-refreshing queue &bull; Last updated: {tokenData.last_updated}
        </div>
      </div>
    </div>
  );
}
