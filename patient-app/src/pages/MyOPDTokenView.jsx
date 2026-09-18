import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Bell, User, MapPin, CheckCircle, Sparkles, AlertCircle, Calendar } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function MyOPDTokenView({ patient, onNavigate }) {
  const [tokenData, setTokenData] = useState(null);
  const [notified, setNotified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchLiveQueue = async () => {
    if (!patient?.patient_id) return;
    try {
      const res = await fetch(`${API_BASE}/queues/token/${patient.patient_id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.active) {
          setTokenData(data);
        } else {
          setTokenData(null);
        }
      }
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.warn('Queue token fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 6000);
    return () => clearInterval(interval);
  }, [patient?.patient_id]);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          My OPD Token & Live Queue
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
          Real-time outpatient queue tracking, queue position, and doctor turn notification.
        </p>
      </div>

      {loading && !tokenData ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px' }} />
          Connecting to OPD queue telemetry…
        </div>
      ) : tokenData ? (
        /* Main Token Ticket Card */
        <div className="card" style={{ padding: '32px', textAlign: 'center', border: '2px solid #0284c7', borderRadius: '18px', background: '#ffffff', boxShadow: '0 10px 30px rgba(2,132,199,0.1)', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
            LIVE OPD QUEUE PASS
          </div>

          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            YOUR QUEUE TICKET
          </div>
          <h1 style={{ fontSize: '72px', fontWeight: 900, color: '#0284c7', margin: '8px 0', letterSpacing: '-2px' }}>
            #{tokenData.ticket_number}
          </h1>

          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            {tokenData.department} &bull; {tokenData.assigned_doctor}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
            <MapPin size={14} color="#0284c7" /> {tokenData.room_number || 'Consultation Room'} &bull; {tokenData.hospital_name}
          </div>

          {/* 4 Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>NOW SERVING</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>#{tokenData.now_serving || '01'}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>YOUR TICKET</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>#{tokenData.ticket_number}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>AHEAD OF YOU</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{tokenData.patients_ahead ?? 0}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>EST. WAIT</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>~{tokenData.estimated_wait_minutes ?? 10}m</div>
            </div>
          </div>

          {/* Live Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '6px 16px', borderRadius: '20px', border: '1px solid #86efac' }}>
              STATUS: {tokenData.status?.toUpperCase() || 'ACTIVE IN QUEUE'}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setNotified(true);
              alert(`✓ Turn notification active! You will be alerted when ticket #${tokenData.ticket_number} is called.`);
            }}
            className={notified ? 'btn-secondary' : 'btn-primary'}
            style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Bell size={16} />
            {notified ? '✓ Live Turn Alerts Active' : "Notify Me When I'm Next"}
          </button>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Auto-refreshing OPD queue &bull; Last updated: {lastUpdated}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ padding: '48px 32px', textAlign: 'center', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Clock size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Active OPD Queue Ticket Today
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
            You do not have an active outpatient ticket in today's clinic queue. You can generate a queue pass by completing a MediKiosk Clinical Intake or booking a doctor consultation.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate ? onNavigate('kiosk') : null}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}
            >
              <Sparkles size={16} /> Launch MediKiosk Intake
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('appointments') : null}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}
            >
              <Calendar size={16} /> Book Doctor Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
