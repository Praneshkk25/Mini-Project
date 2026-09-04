import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, Stethoscope, Thermometer, Wind, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function PatientLiveECG({ bpm = 74 }) {
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
    ctx.lineWidth = 0.75;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let j = 0; j < height; j += 15) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(width, j);
      ctx.stroke();
    }

    const sweepSpeedPxPerSec = 110;
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
      const wipeWidth = 28;
      if (currentX + wipeWidth <= width) {
        ctx.fillRect(currentX, 0, wipeWidth, height);
      } else {
        ctx.fillRect(currentX, 0, width - currentX, height);
        ctx.fillRect(0, 0, (currentX + wipeWidth) % width, height);
      }

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 4;

      const steps = Math.max(2, Math.ceil(pixelsToAdvance * 2));
      const stepX = (targetX >= currentX ? targetX - currentX : (width - currentX + targetX)) / steps;

      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const interpX = (currentX + s * stepX) % width;
        const stepTime = totalTime - dt + (s / steps) * dt;
        const phase = (stepTime % cardiacPeriodSec) / cardiacPeriodSec;
        const voltage = getECGVoltage(phase);
        const y = midY - voltage * (height * 0.42);

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
  }, [bpm]);

  return (
    <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981', fontWeight: '700' }}>
          <Heart size={16} /> LIVE TELEMETRY LEAD II (Continuous Telemetry)
        </div>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>BPM: {bpm} &bull; 25mm/s</span>
      </div>
      <canvas ref={canvasRef} width={600} height={70} style={{ width: '100%', height: '70px', borderRadius: '8px', display: 'block' }} />
    </div>
  );
}

const HISTORICAL_TRENDS = [
  { time: '06:00', hr: 72, spo2: 98, bp_sys: 118 },
  { time: '09:00', hr: 75, spo2: 98, bp_sys: 122 },
  { time: '12:00', hr: 80, spo2: 97, bp_sys: 124 },
  { time: '15:00', hr: 76, spo2: 98, bp_sys: 120 },
  { time: '18:00', hr: 74, spo2: 99, bp_sys: 121 },
  { time: '21:00', hr: 71, spo2: 98, bp_sys: 119 }
];

export default function MyVitalsTelemetryView({ patient }) {
  const [timeRange, setTimeRange] = useState('24h'); // '24h' | '7d' | '30d'

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Vitals & Telemetry
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Continuous cardiac monitoring, SpO2, blood pressure and physiological trends.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['24h', '7d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                background: timeRange === r ? '#0284c7' : '#f1f5f9',
                color: timeRange === r ? '#ffffff' : '#475569',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Live ECG Strip */}
      <PatientLiveECG bpm={74} />

      {/* Current Vitals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ef4444', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            <Heart size={14} color="#ef4444" /> HEART RATE
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#ef4444' }}>74 bpm</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Normal Sinus Rhythm</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            <Stethoscope size={14} color="#0284c7" /> BLOOD PRESSURE
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#0284c7' }}>120/80</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Optimal Range</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            <Activity size={14} color="#10b981" /> OXYGEN SpO2
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>98%</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Healthy Saturation</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            <Thermometer size={14} color="#f59e0b" /> TEMPERATURE
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#f59e0b' }}>36.8°C</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Normothermic</span>
        </div>
      </div>

      {/* Historical Telemetry Chart */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
          📈 {timeRange.toUpperCase()} Physiological Trends & Vitals Trajectory
        </h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={HISTORICAL_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} domain={[60, 140]} />
              <Tooltip />
              <Line type="monotone" dataKey="hr" name="Heart Rate (bpm)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="bp_sys" name="Systolic BP (mmHg)" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', fontSize: '12px' }}>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>● Heart Rate</span>
          <span style={{ color: '#0284c7', fontWeight: 700 }}>● Systolic BP</span>
          <span style={{ color: '#10b981', fontWeight: 700 }}>● SpO2 Oxygen</span>
        </div>
      </div>
    </div>
  );
}
