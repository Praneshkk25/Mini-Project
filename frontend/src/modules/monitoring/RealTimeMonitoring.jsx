import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldAlert, Play, Square, Zap, RefreshCw, AlertCircle, Info, Heart, CheckCircle2 } from 'lucide-react';
import PatientMonitorCard from '../../components/PatientMonitorCard';
import VitalChart from '../../components/VitalChart';
import AlertPanel from '../../components/AlertPanel';
import MonitoringStats from '../../components/MonitoringStats';

// Synthetic ECG Waveform preview renderer calibrated to medical standard (25mm/s)
function LiveECGVisualizer({ active = true, bpm = 75 }) {
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

    // Initialize background & clinical telemetry grid
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

    // Standard medical sweep speed: ~100px per second (representing ~25mm/s paper speed)
    const sweepSpeedPxPerSec = 110; 
    const cardiacPeriodSec = 60 / Math.max(40, Math.min(180, bpm)); // Period in seconds for 1 beat

    const getECGVoltage = (phase) => {
      // phase is between 0.0 and 1.0 of the cardiac beat cycle
      let v = 0;

      // P wave (0.12 - 0.22)
      if (phase >= 0.12 && phase <= 0.22) {
        const pPhase = (phase - 0.17) / 0.05;
        v += 0.2 * Math.exp(-pPhase * pPhase * 3);
      }
      // Q dip (0.28 - 0.31)
      else if (phase >= 0.28 && phase <= 0.31) {
        const qPhase = (phase - 0.295) / 0.015;
        v -= 0.25 * Math.exp(-qPhase * qPhase * 5);
      }
      // R spike (0.31 - 0.36) - Sharp tall ventricular contraction
      else if (phase >= 0.31 && phase <= 0.36) {
        const rPhase = (phase - 0.335) / 0.015;
        v += 1.35 * Math.exp(-rPhase * rPhase * 7);
      }
      // S dip (0.36 - 0.40)
      else if (phase >= 0.36 && phase <= 0.40) {
        const sPhase = (phase - 0.38) / 0.02;
        v -= 0.45 * Math.exp(-sPhase * sPhase * 5);
      }
      // T wave (0.48 - 0.65) - Broader repolarization dome
      else if (phase >= 0.48 && phase <= 0.65) {
        const tPhase = (phase - 0.565) / 0.085;
        v += 0.38 * Math.exp(-tPhase * tPhase * 3);
      }

      // Subtle physiological baseline wander
      v += (Math.random() - 0.5) * 0.02;
      return v;
    };

    let totalTime = 0;

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // time delta in seconds
      lastTime = now;
      totalTime += dt;

      const pixelsToAdvance = dt * sweepSpeedPxPerSec;
      const targetX = (currentX + pixelsToAdvance) % width;

      // Clear the sweep wiper region ahead (25px beam)
      ctx.fillStyle = '#0a0f1d';
      const wipeWidth = 28;
      if (currentX + wipeWidth <= width) {
        ctx.fillRect(currentX, 0, wipeWidth, height);
      } else {
        ctx.fillRect(currentX, 0, width - currentX, height);
        ctx.fillRect(0, 0, (currentX + wipeWidth) % width, height);
      }

      // Redraw grid lines in wiper zone
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.75;
      for (let gx = Math.floor(currentX / 20) * 20; gx < currentX + wipeWidth + 20; gx += 20) {
        const xPos = gx % width;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, height);
        ctx.stroke();
      }

      // Draw smooth ECG line segment
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 4;

      const steps = Math.max(2, Math.ceil(pixelsToAdvance * 2));
      const stepX = (targetX >= currentX ? targetX - currentX : (width - currentX + targetX)) / steps;

      ctx.beginPath();
      let prevY = midY;

      for (let s = 0; s <= steps; s++) {
        const interpX = (currentX + s * stepX) % width;
        const stepTime = totalTime - dt + (s / steps) * dt;
        const phase = (stepTime % cardiacPeriodSec) / cardiacPeriodSec;
        const voltage = getECGVoltage(phase);
        const y = midY - voltage * (height * 0.42);

        if (s === 0) {
          ctx.moveTo(interpX, y);
        } else {
          ctx.lineTo(interpX, y);
        }
        prevY = y;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset glow

      currentX = targetX;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, bpm]);

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981', fontWeight: '700' }}>
          <Heart size={16} className="animate-pulse" /> LIVE TELEMETRY LEAD II (Synthetic Preview)
        </div>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>BPM: {bpm} &bull; 25mm/s</span>
      </div>
      <canvas ref={canvasRef} width={600} height={80} style={{ width: '100%', height: '80px', borderRadius: '8px', background: '#0f172a' }} />
    </div>
  );
}

export default function RealTimeMonitoring() {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // LIVE, DEMO MODE, RECONNECTING, OFFLINE
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(true);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'stats'
  const wsRef = useRef(null);

  const API_BASE = 'http://localhost:8000/api/monitoring';
  const WS_URL = 'ws://localhost:8000/ws/monitoring';

  // Initial REST fetch & WebSocket setup
  useEffect(() => {
    fetchInitialData();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Fetch patient history when modal opens
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientHistory(selectedPatient.patient_id);
    }
  }, [selectedPatient]);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, alertsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/patients`),
        fetch(`${API_BASE}/alerts`),
        fetch(`${API_BASE}/stats`),
      ]);

      if (patientsRes.ok) {
        const data = await patientsRes.json();
        setPatients(data);
      }
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
        setIsSimulatorRunning(data.is_simulator_active ?? true);
      }
    } catch (e) {
      console.warn('REST API connection error:', e);
      setConnectionStatus('DEMO MODE');
    }
  };

  const fetchPatientHistory = async (patientId) => {
    try {
      const res = await fetch(`${API_BASE}/vitals/history/${patientId}?limit=50`);
      if (res.ok) {
        const historyData = await res.json();
        setPatientHistory(historyData);
      }
    } catch (e) {
      console.warn('Failed to fetch patient history:', e);
    }
  };

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        setConnectionStatus('LIVE');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'initial_snapshot') {
            setPatients(msg.vitals || []);
            setAlerts(msg.alerts || []);
            if (msg.stats) setStats(msg.stats);
          } else if (msg.type === 'vital_update') {
            const updatedVital = msg.vital;
            setPatients((prev) =>
              prev.map((p) => (p.patient_id === updatedVital.patient_id ? updatedVital : p))
            );
            if (msg.alerts && msg.alerts.length > 0) {
              setAlerts((prev) => [...msg.alerts, ...prev].slice(0, 100));
            }
            // Update modal history if currently viewing this patient
            if (selectedPatient && selectedPatient.patient_id === updatedVital.patient_id) {
              setSelectedPatient(updatedVital);
              setPatientHistory((prev) => [...prev, updatedVital].slice(-60));
            }
          }
        } catch (err) {
          console.error('WebSocket payload parse error:', err);
        }
      };

      wsRef.current.onerror = () => {
        setConnectionStatus('DEMO MODE');
      };

      wsRef.current.onclose = () => {
        setConnectionStatus('RECONNECTING');
        setTimeout(connectWebSocket, 4000);
      };
    } catch (e) {
      setConnectionStatus('DEMO MODE');
    }
  };

  const handleStartSimulator = async () => {
    try {
      await fetch(`${API_BASE}/simulator/start`, { method: 'POST' });
      setIsSimulatorRunning(true);
    } catch (e) {
      setIsSimulatorRunning(true);
    }
  };

  const handleStopSimulator = async () => {
    try {
      await fetch(`${API_BASE}/simulator/stop`, { method: 'POST' });
      setIsSimulatorRunning(false);
    } catch (e) {
      setIsSimulatorRunning(false);
    }
  };

  const handleTriggerCritical = async (patientId) => {
    try {
      await fetch(`${API_BASE}/simulator/patient/${patientId}/critical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_seconds: 30 }),
      });
      fetchInitialData();
    } catch (e) {
      console.warn('Failed to trigger critical patient event:', e);
    }
  };

  // Derive top summary metrics
  const totalPatients = patients.length;
  const normalCount = patients.filter((p) => p.overall_status === 'NORMAL').length;
  const warningCount = patients.filter((p) => p.overall_status === 'WARNING').length;
  const criticalCount = patients.filter((p) => p.overall_status === 'CRITICAL').length;

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px', color: '#f8fafc' }}>
      {/* ─── Top Command Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              🏥 REAL-TIME PATIENT VITAL MONITORING
            </h1>
            <span
              style={{
                background: connectionStatus === 'LIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: connectionStatus === 'LIVE' ? '#34d399' : '#fbbf24',
                border: connectionStatus === 'LIVE' ? '1px solid #10b981' : '1px solid #f59e0b',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ● {connectionStatus}
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Apache Kafka & PySpark Medallion Structured Streaming Pipeline &bull; Bedside Telemetry
          </p>
        </div>

        {/* Simulator Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchInitialData}
            style={{
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>

          {isSimulatorRunning ? (
            <button
              onClick={handleStopSimulator}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                border: '1px solid #ef4444',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Square size={16} /> Pause Stream
            </button>
          ) : (
            <button
              onClick={handleStartSimulator}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Play size={16} /> Start Stream
            </button>
          )}

          <button
            onClick={() => handleTriggerCritical('PT-1001')}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            }}
          >
            <Zap size={16} /> Trigger Critical Patient
          </button>
        </div>
      </div>

      {/* ─── Top Summary Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Total Patients Monitored</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>{totalPatients}</div>
          <span style={{ fontSize: '11px', color: '#10b981' }}>100% telemetry coverage</span>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Active Bed Monitors</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>{totalPatients}</div>
          <span style={{ fontSize: '11px', color: '#38bdf8' }}>ICU, ER, GW, CCU Wards</span>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Normal Status</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{normalCount}</div>
          <span style={{ fontSize: '11px', color: '#10b981' }}>Vitals within safe threshold</span>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Warning Status</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>{warningCount}</div>
          <span style={{ fontSize: '11px', color: '#f59e0b' }}>Moderate deviation detected</span>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, #1e293b 100%)', border: '1px solid #ef4444', borderRadius: '16px', padding: '18px' }}>
          <span style={{ fontSize: '13px', color: '#fca5a5' }}>Critical Status</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>{criticalCount}</div>
          <span style={{ fontSize: '11px', color: '#fca5a5' }}>Requires immediate medical intervention</span>
      {/* ─── Main Two Column Layout: Cards vs Alert Panel ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left: Patient Monitor Cards Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
              🛏️ Bedside Monitors ({patients.length} Active Beds)
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Click card for historical trends & details</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {patients.map((pt) => (
              <PatientMonitorCard
                key={pt.patient_id}
                patient={pt}
                onClick={setSelectedPatient}
                onTriggerCritical={handleTriggerCritical}
              />
            ))}
          </div>
        </div>

        {/* Right: Live Alerts Feed Panel */}
        <div style={{ height: '100%' }}>
          <AlertPanel
            alerts={alerts}
            onSelectPatient={(pid) => {
              const p = patients.find((item) => item.patient_id === pid);
              if (p) setSelectedPatient(p);
            }}
          />
        </div>
      </div>

      {/* ─── Analytics Summary Section ─── */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#f8fafc', fontWeight: '700' }}>
          📊 Hospital Streaming Telemetry Analytics & Department Breakdown
        </h3>
        <MonitoringStats stats={stats} />
      </div>

      {/* ─── Healthcare Safety Disclaimer ─── */}
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#94a3b8',
          fontSize: '13px',
        }}
      >
        <Info size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#cbd5e1' }}>Healthcare Engineering Disclaimer:</strong> Demo monitoring system using synthetic patient telemetry streamed through Apache Kafka & PySpark Structured Streaming. Alerts are threshold-based software metrics and do not constitute formal medical diagnosis or treatment advice.
        </div>
      </div>

      {/* ─── Patient Detail Modal View ─── */}
      {selectedPatient && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justify: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedPatient(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#f8fafc', fontWeight: '800' }}>
                  {selectedPatient.patient_name} <span style={{ fontSize: '14px', color: '#94a3b8' }}>({selectedPatient.patient_id})</span>
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#38bdf8' }}>
                  Bed: <strong>{selectedPatient.bed_id}</strong> &bull; Department: {selectedPatient.department}
                </p>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '18px',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Current Vitals Grid in Modal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Heart Rate</span>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', marginTop: '2px' }}>
                  {selectedPatient.heart_rate} <span style={{ fontSize: '10px' }}>bpm</span>
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>SpO2</span>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>
                  {selectedPatient.spo2} <span style={{ fontSize: '10px' }}>%</span>
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Blood Pressure</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b', marginTop: '2px' }}>
                  {selectedPatient.systolic_bp}/{selectedPatient.diastolic_bp}
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Temperature</span>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444', marginTop: '2px' }}>
                  {selectedPatient.temperature} <span style={{ fontSize: '10px' }}>°C</span>
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Resp. Rate</span>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#a855f7', marginTop: '2px' }}>
                  {selectedPatient.respiratory_rate} <span style={{ fontSize: '10px' }}>/m</span>
                </div>
              </div>
            </div>

            {/* Time Series Trend Chart */}
            <VitalChart history={patientHistory} patientName={selectedPatient.patient_name} />
          </div>
        </div>
      )}
    </div>
  );
}
