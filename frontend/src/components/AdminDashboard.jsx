import React from 'react';
import { MOCK_ADMIN_ANALYTICS } from '../mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const data = MOCK_ADMIN_ANALYTICS;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>Hospital Executive & Analytics Dashboard</h2>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Avg Patient Wait Time</span>
          <h2 style={{ margin: '8px 0 0 0', color: '#38bdf8' }}>{data.avgWaitTime}</h2>
          <span style={{ fontSize: '11px', color: '#10b981' }}>↓ 12% vs last week</span>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Daily Patient Inflow</span>
          <h2 style={{ margin: '8px 0 0 0', color: '#f59e0b' }}>{data.dailyInflow}</h2>
          <span style={{ fontSize: '11px', color: '#10b981' }}>↑ 8% peak period</span>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Bed Turnover Rate</span>
          <h2 style={{ margin: '8px 0 0 0', color: '#a855f7' }}>{data.bedTurnover}</h2>
          <span style={{ fontSize: '11px', color: '#10b981' }}>Optimal efficiency</span>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Discharge Efficiency</span>
          <h2 style={{ margin: '8px 0 0 0', color: '#10b981' }}>{data.dischargeEfficiency}</h2>
          <span style={{ fontSize: '11px', color: '#38bdf8' }}>AI Summaries Enabled</span>
        </div>
      </div>

      {/* Recharts Graphs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Patient Inflow vs Discharge Trend */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '16px' }}>Hourly Patient Inflow vs Discharges</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.inflowTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                <Line type="monotone" dataKey="patients" stroke="#38bdf8" strokeWidth={3} name="Inflow Patients" />
                <Line type="monotone" dataKey="discharge" stroke="#10b981" strokeWidth={3} name="Discharged" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wait Time by Department */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '16px' }}>Avg Wait Time by Department (Mins)</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.deptWaitTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="department" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                <Bar dataKey="avgWait" fill="#f59e0b" name="Avg Wait (min)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#3b82f6" name="Target (min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff & Room Allocation Table */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>Active Staff & Duty Roster Allocation</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#0f172a', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Doctor Name</th>
              <th style={{ padding: '10px' }}>Specialty</th>
              <th style={{ padding: '10px' }}>Assigned OPD Room</th>
              <th style={{ padding: '10px' }}>Current Shift Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '10px', color: '#fff' }}>Dr. Sarah Smith</td>
              <td style={{ padding: '10px' }}>General Medicine</td>
              <td style={{ padding: '10px' }}>Room 4 (Block B)</td>
              <td style={{ padding: '10px', color: '#10b981' }}>Active (On Duty)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '10px', color: '#fff' }}>Dr. Vikas Rao</td>
              <td style={{ padding: '10px' }}>Cardiology</td>
              <td style={{ padding: '10px' }}>Room 12 (ICU Annex)</td>
              <td style={{ padding: '10px', color: '#10b981' }}>Active (On Duty)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '10px', color: '#fff' }}>Dr. Anita Roy</td>
              <td style={{ padding: '10px' }}>Orthopedics</td>
              <td style={{ padding: '10px' }}>Room 8 (Block A)</td>
              <td style={{ padding: '10px', color: '#f59e0b' }}>On Break</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
