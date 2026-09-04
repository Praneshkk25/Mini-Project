import React, { useRef, useEffect } from 'react';
import { Heart, Activity, Thermometer, Wind, Stethoscope, AlertTriangle, ShieldCheck } from 'lucide-react';

function MiniPatientECG({ bpm = 75, isCritical = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = performance.now();
    let currentX = 0;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < width; i += 15) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let j = 0; j < height; j += 10) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(width, j);
      ctx.stroke();
    }

    const sweepSpeedPxPerSec = 95;
    const cardiacPeriodSec = 60 / Math.max(40, Math.min(180, bpm));

    const getECGVoltage = (phase) => {
      let v = 0;
      if (phase >= 0.12 && phase <= 0.22) {
        const pPhase = (phase - 0.17) / 0.05;
        v += 0.2 * Math.exp(-pPhase * pPhase * 3);
      } else if (phase >= 0.28 && phase <= 0.31) {
        const qPhase = (phase - 0.295) / 0.015;
        v -= 0.25 * Math.exp(-qPhase * qPhase * 5);
      } else if (phase >= 0.31 && phase <= 0.36) {
        const rPhase = (phase - 0.335) / 0.015;
        v += 1.35 * Math.exp(-rPhase * rPhase * 7);
      } else if (phase >= 0.36 && phase <= 0.40) {
        const sPhase = (phase - 0.38) / 0.02;
        v -= 0.45 * Math.exp(-sPhase * sPhase * 5);
      } else if (phase >= 0.48 && phase <= 0.65) {
        const tPhase = (phase - 0.565) / 0.085;
        v += 0.38 * Math.exp(-tPhase * tPhase * 3);
      }
      v += (Math.random() - 0.5) * 0.02;
      return v;
    };

    let totalTime = 0;

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      totalTime += dt;

      const pixelsToAdvance = dt * sweepSpeedPxPerSec;
      const targetX = (currentX + pixelsToAdvance) % width;

      ctx.fillStyle = '#0a0f1d';
      const wipeWidth = 18;
      if (currentX + wipeWidth <= width) {
        ctx.fillRect(currentX, 0, wipeWidth, height);
      } else {
        ctx.fillRect(currentX, 0, width - currentX, height);
        ctx.fillRect(0, 0, (currentX + wipeWidth) % width, height);
      }

      ctx.strokeStyle = isCritical ? '#ef4444' : '#10b981';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = isCritical ? '#ef4444' : '#10b981';
      ctx.shadowBlur = 3;

      const steps = Math.max(2, Math.ceil(pixelsToAdvance * 2));
      const stepX = (targetX >= currentX ? targetX - currentX : (width - currentX + targetX)) / steps;

      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const interpX = (currentX + s * stepX) % width;
        const stepTime = totalTime - dt + (s / steps) * dt;
        const phase = (stepTime % cardiacPeriodSec) / cardiacPeriodSec;
        const voltage = getECGVoltage(phase);
        const y = midY - voltage * (height * 0.4);

        if (s === 0) ctx.moveTo(interpX, y);
        else ctx.lineTo(interpX, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      currentX = targetX;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bpm, isCritical]);

  return (
    <div style={{ marginTop: '10px', background: '#0a0f1d', borderRadius: '8px', padding: '6px 8px', border: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', color: isCritical ? '#ef4444' : '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Heart size={11} className={isCritical ? 'animate-pulse' : ''} /> LEAD II &bull; {bpm} BPM
        </span>
        <span style={{ fontSize: '9px', color: '#64748b' }}>25mm/s</span>
      </div>
      <canvas ref={canvasRef} width={320} height={42} style={{ width: '100%', height: '42px', display: 'block', borderRadius: '4px' }} />
    </div>
  );
}

export default function PatientMonitorCard({ patient, onClick, onTriggerCritical }) {
  if (!patient) return null;

  const {
    patient_id,
    patient_name,
    bed_id,
    department,
    heart_rate,
    spo2,
    systolic_bp,
    diastolic_bp,
    temperature,
    respiratory_rate,
    overall_status = 'NORMAL',
    heart_rate_status = 'NORMAL',
    spo2_status = 'NORMAL',
    blood_pressure_status = 'NORMAL',
    temperature_status = 'NORMAL',
    respiratory_rate_status = 'NORMAL',
  } = patient;

  const isCritical = overall_status === 'CRITICAL';
  const isWarning = overall_status === 'WARNING';

  const cardBorder = isCritical
    ? '2px solid #ef4444'
    : isWarning
    ? '1px solid #f59e0b'
    : '1px solid #334155';

  const cardBg = isCritical
    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
    : isWarning
    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)'
    : 'rgba(30, 41, 59, 0.85)';

  const badgeBg = isCritical
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : '#10b981';

  const getVitalColor = (status) => {
    if (status === 'CRITICAL') return '#ef4444';
    if (status === 'WARNING') return '#f59e0b';
    return '#38bdf8';
  };

  return (
    <div
      onClick={() => onClick && onClick(patient)}
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.25s ease-in-out',
        position: 'relative',
        boxShadow: isCritical ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
      className={`patient-monitor-card ${isCritical ? 'pulse-critical' : ''}`}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
              {patient_name}
            </h4>
            <span style={{ fontSize: '11px', color: '#94a3b8', background: '#0f172a', padding: '2px 8px', borderRadius: '6px', border: '1px solid #334155' }}>
              {patient_id}
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            🛏️ <strong>{bed_id}</strong> &bull; {department}
          </p>
          <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
            👨‍⚕️ Attending: {patient.attending_doctor || 'Dr. Sarah Jenkins'}
          </p>
        </div>

        {/* Status Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span
            style={{
              background: badgeBg,
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isCritical ? <AlertTriangle size={12} /> : isWarning ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
            {overall_status}
          </span>
          {onTriggerCritical && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTriggerCritical(patient_id);
              }}
              title="Force Emergency Reading"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ⚡ Test Alert
            </button>
          )}
        </div>
      </div>

      {/* Vitals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {/* Heart Rate */}
        <div style={{ background: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
            <Heart size={13} color={getVitalColor(heart_rate_status)} />
            <span>Heart Rate</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: getVitalColor(heart_rate_status) }}>
            {heart_rate} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '400' }}>bpm</span>
          </div>
        </div>

        {/* SpO2 Oxygen */}
        <div style={{ background: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
            <Activity size={13} color={getVitalColor(spo2_status)} />
            <span>SpO2</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: getVitalColor(spo2_status) }}>
            {spo2} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '400' }}>%</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div style={{ background: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
            <Stethoscope size={13} color={getVitalColor(blood_pressure_status)} />
            <span>Blood Pressure</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: getVitalColor(blood_pressure_status) }}>
            {systolic_bp}/{diastolic_bp} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '400' }}>mmHg</span>
          </div>
        </div>

        {/* Temperature & RR */}
        <div style={{ background: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Thermometer size={13} color={getVitalColor(temperature_status)} /> Temp
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Wind size={13} color={getVitalColor(respiratory_rate_status)} /> RR
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800' }}>
            <span style={{ color: getVitalColor(temperature_status) }}>{temperature}°C</span>
            <span style={{ color: getVitalColor(respiratory_rate_status) }}>{respiratory_rate}/m</span>
          </div>
        </div>
      </div>

      {/* Embedded Live Telemetry Lead II Strip for EACH Patient */}
      <MiniPatientECG bpm={heart_rate || 75} isCritical={isCritical} />
    </div>
  );
}
