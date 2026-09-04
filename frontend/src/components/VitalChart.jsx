import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function VitalChart({ history = [], patientName = 'Patient' }) {
  const [selectedMetric, setSelectedMetric] = useState('heart_rate');
  const [timeRange, setTimeRange] = useState('5m');

  // Format timestamp for chart X axis
  const chartData = history.map((item) => {
    const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
    return {
      time: timeStr,
      heart_rate: item.heart_rate,
      spo2: item.spo2,
      systolic_bp: item.systolic_bp,
      diastolic_bp: item.diastolic_bp,
      temperature: item.temperature,
      respiratory_rate: item.respiratory_rate,
    };
  });

  // Metric metadata
  const METRICS = {
    heart_rate: { name: 'Heart Rate (bpm)', color: '#38bdf8', unit: 'bpm', domain: [40, 180] },
    spo2: { name: 'SpO2 Oxygen Saturation (%)', color: '#10b981', unit: '%', domain: [80, 100] },
    blood_pressure: { name: 'Blood Pressure (mmHg)', color: '#f59e0b', unit: 'mmHg', domain: [60, 200] },
    temperature: { name: 'Temperature (°C)', color: '#ef4444', unit: '°C', domain: [34, 42] },
    respiratory_rate: { name: 'Respiratory Rate (/min)', color: '#a855f7', unit: '/min', domain: [10, 40] },
  };

  const activeMetric = METRICS[selectedMetric] || METRICS.heart_rate;

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc', fontWeight: '700' }}>
            📈 Vital Signs Telemetry Trends ({patientName})
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Real-time streaming telemetry window
          </p>
        </div>

        {/* Metric & Time Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="heart_rate">❤️ Heart Rate</option>
            <option value="spo2">💧 SpO2 Oxygen</option>
            <option value="blood_pressure">🩺 Blood Pressure</option>
            <option value="temperature">🌡 Temperature</option>
            <option value="respiratory_rate">🫁 Respiratory Rate</option>
          </select>

          <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', padding: '2px' }}>
            {['1m', '5m', '15m', '1h'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  background: timeRange === range ? '#3b82f6' : 'transparent',
                  color: timeRange === range ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Line Container */}
      <div style={{ height: '280px', width: '100%' }}>
        {chartData.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
            Waiting for streaming telemetry data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={activeMetric.domain} />
              <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Legend />

              {selectedMetric === 'blood_pressure' ? (
                <>
                  <Line type="monotone" dataKey="systolic_bp" name="Systolic BP (mmHg)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="diastolic_bp" name="Diastolic BP (mmHg)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  name={activeMetric.name}
                  stroke={activeMetric.color}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
