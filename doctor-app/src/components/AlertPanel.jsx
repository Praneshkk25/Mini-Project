import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Bell, Volume2, VolumeX, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AlertPanel({ alerts = [], onSelectPatient }) {
  const [filter, setFilter] = useState('ALL');
  const [isMuted, setIsMuted] = useState(true);
  const audioContextRef = useRef(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'CRITICAL') return a.alert_level === 'CRITICAL';
    if (filter === 'WARNING') return a.alert_level === 'WARNING';
    if (filter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  useEffect(() => {
    if (!isMuted && alerts.length > 0 && alerts[0].alert_level === 'CRITICAL') {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {
        // Audio context handling
      }
    }
  }, [alerts, isMuted]);

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} color="#ef4444" />
          <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc', fontWeight: '700' }}>
            Emergency & Warning Alerts
          </h3>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            background: isMuted ? '#334155' : 'rgba(239, 68, 68, 0.2)',
            color: isMuted ? '#94a3b8' : '#fca5a5',
            border: '1px solid #475569',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {isMuted ? 'Muted' : 'Audio On'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {['ALL', 'CRITICAL', 'WARNING', 'RESOLVED'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              background: filter === type ? '#0284c7' : '#0f172a',
              color: filter === type ? '#ffffff' : '#94a3b8',
              border: '1px solid #334155',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Alert Feed List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', paddingRight: '4px' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b', fontSize: '13px' }}>
            <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            No active alerts matching filter. All patient vitals within normal operating thresholds.
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const isCrit = alert.alert_level === 'CRITICAL';
            const alertBg = isCrit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
            const alertBorder = isCrit ? '1px solid #ef4444' : '1px solid #f59e0b';
            const textColor = isCrit ? '#fca5a5' : '#fde68a';
            const timeStr = alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now';

            return (
              <div
                key={alert.alert_id || idx}
                onClick={() => onSelectPatient && alert.patient_id && onSelectPatient(alert.patient_id)}
                style={{
                  background: alertBg,
                  border: alertBorder,
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: textColor,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                className="alert-item-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span
                    style={{
                      background: isCrit ? '#ef4444' : '#f59e0b',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {alert.alert_level}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{timeStr}</span>
                </div>

                <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '2px' }}>
                  {alert.patient_name} ({alert.patient_id}) &bull; <span style={{ color: '#38bdf8' }}>{alert.bed_id}</span>
                </div>

                <div style={{ fontSize: '12px' }}>
                  {alert.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
