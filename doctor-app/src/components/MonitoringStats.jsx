import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function MonitoringStats({ stats = {} }) {
  const {
    total_patients = 15,
    normal_count = 11,
    warning_count = 3,
    critical_count = 1,
    avg_heart_rate = 76.5,
    avg_spo2 = 97.2,
    critical_alerts_today = 4,
    alerts_per_hour = 1.2,
    most_common_alert = 'SpO2 Warning',
  } = stats;

  const departmentData = [
    { department: 'ICU', patients: 6, critical: 1, warning: 1 },
    { department: 'Emergency', patients: 3, critical: 0, warning: 1 },
    { department: 'General Ward', patients: 4, critical: 0, warning: 0 },
    { department: 'Cardiology', patients: 2, critical: 0, warning: 1 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Avg Heart Rate</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
            {avg_heart_rate} <span style={{ fontSize: '12px', fontWeight: '400' }}>bpm</span>
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Avg Oxygen (SpO2)</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
            {avg_spo2} <span style={{ fontSize: '12px', fontWeight: '400' }}>%</span>
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Critical Alerts Today</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>
            {critical_alerts_today}
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Alert Frequency</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
            {alerts_per_hour} <span style={{ fontSize: '12px', fontWeight: '400' }}>/ hr</span>
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Primary Anomaly Type</span>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#cbd5e1', marginTop: '8px' }}>
            {most_common_alert}
          </div>
        </div>
      </div>

      {/* Department Patient Status Bar Chart */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#f8fafc' }}>
          🏥 Monitored Bed Occupancy & Alert Distribution by Department
        </h4>
        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="department" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              <Bar dataKey="patients" name="Total Patients" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="warning" name="Warning" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="critical" name="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
