import React from 'react';
import { MOCK_ADMIN_ANALYTICS } from '../../data/mockData';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AdminDashboard() {
  const { avgWaitTime, dailyInflow, bedTurnover, dischargeEfficiency, inflowTrend, deptWaitTimes, staffAllocation, bottlenecks } = MOCK_ADMIN_ANALYTICS;

  const staffColumns = [
    { header: 'Department', accessor: 'department' },
    { header: 'Active Doctors', accessor: 'activeDoctors' },
    { header: 'Duty Nurses', accessor: 'dutyNurses' },
    { header: 'Total Beds', accessor: 'totalBeds' },
    { header: 'Occupied Beds', accessor: 'occupiedBeds' },
    { 
      header: 'Occupancy Rate', 
      render: (row) => (
        <span style={{ 
          color: parseFloat(row.occupancyRate) > 90 ? '#ef4444' : parseFloat(row.occupancyRate) > 80 ? '#f59e0b' : '#10b981',
          fontWeight: 'bold' 
        }}>
          {row.occupancyRate}
        </span>
      ) 
    },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
            📊 Hospital Executive Control Tower & 360° Operations Analytics
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
            Real-time multi-department monitoring, bed turnover metrics, inflow trends, and staff allocation.
          </p>
        </div>
        <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', color: '#10b981' }}>
          🟢 System Status: <strong>Operational (100% Uptime)</strong>
        </div>
      </div>

      {/* Real-Time Patient Monitoring Executive Summary Card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid #38bdf8', borderRadius: '16px', padding: '20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📡</span>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>
              REAL-TIME PATIENT TELEMETRY & MONITORING
            </h3>
            <span style={{ background: '#10b981', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
              LIVE KAFKA / SPARK PIPELINE
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '14px', color: '#cbd5e1' }}>
            <span>👥 <strong>15 Active Patients</strong></span>
            <span style={{ color: '#6ee7b7' }}>🟢 <strong>12 Normal</strong></span>
            <span style={{ color: '#fde68a' }}>🟡 <strong>2 Warning</strong></span>
            <span style={{ color: '#fca5a5' }}>🔴 <strong>1 Critical</strong></span>
          </div>
        </div>
        <div>
          <button
            onClick={() => window.location.hash = '#monitoring'}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
            }}
          >
            Open Real-Time Monitoring Console &rarr;
          </button>
        </div>
      </div>

      {/* 1. Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <StatCard 
          icon="⏱️"
          label="Avg OPD Wait Time"
          value={avgWaitTime}
          trend="-2.4 mins"
          subtext="Target: < 15.0 mins"
          color="#06b6d4"
        />
        <StatCard 
          icon="👥"
          label="Daily Patient Inflow"
          value={dailyInflow}
          trend="+12% today"
          subtext="Total admissions & consultations"
          color="#38bdf8"
        />
        <StatCard 
          icon="🛏️"
          label="Bed Turnover Rate"
          value={bedTurnover}
          trend="+4.1%"
          subtext="Average discharge clearing efficiency"
          color="#10b981"
        />
        <StatCard 
          icon="⚡"
          label="Discharge Efficiency"
          value={dischargeEfficiency}
          trend="+6%"
          subtext="Same-day summary generation"
          color="#f59e0b"
        />
      </div>

      {/* 2. Recharts Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        
        {/* Hourly Inflow vs Discharge Velocity Line Chart */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#f8fafc' }}>
            📈 Hourly Patient Inflow vs. Discharge Velocity
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inflowTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="patients" name="Inflow Patients" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="discharge" name="Discharged Patients" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Wait Times Bar Chart */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#f8fafc' }}>
            📊 Department Wait Times vs. Target (mins)
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptWaitTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="department" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Legend />
                <Bar dataKey="avgWait" name="Actual Wait (mins)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Target Max (mins)" fill="#64748b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Whole-Hospital Operational Analysis: Staff & Room Allocation Table */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>
            🏥 Complete Departmental Staff & Ward Capacity Allocation
          </h3>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Live synchronization with HR & Ward Management</span>
        </div>

        <DataTable columns={staffColumns} data={staffAllocation} />
      </div>

      {/* 4. Real-time Bottlenecks & Operational Alerts */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '18px' }}>
          ⚠️ Real-Time Operational Bottlenecks & Capacity Alerts
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bottlenecks.map((item, idx) => (
            <div 
              key={idx}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: item.type === 'warning' ? 'rgba(239, 68, 68, 0.1)' : item.type === 'info' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: item.type === 'warning' ? '1px solid #ef4444' : item.type === 'info' ? '1px solid #38bdf8' : '1px solid #10b981',
                color: item.type === 'warning' ? '#fca5a5' : item.type === 'info' ? '#7dd3fc' : '#6ee7b7',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '20px' }}>
                {item.type === 'warning' ? '🔴' : item.type === 'info' ? 'ℹ️' : '🟢'}
              </span>
              <div>
                <strong style={{ color: '#fff' }}>{item.title}:</strong> {item.message}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
