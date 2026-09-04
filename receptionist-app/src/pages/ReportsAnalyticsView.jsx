import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, TrendingUp, DollarSign, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

const OPD_VOLUME_DATA = [
  { dept: 'Cardiology', visits: 48, revenue: 38400 },
  { dept: 'General Medicine', visits: 62, revenue: 31000 },
  { dept: 'Neurology', visits: 28, revenue: 25200 },
  { dept: 'Orthopedics', visits: 36, revenue: 30600 },
  { dept: 'Pediatrics', visits: 32, revenue: 19200 },
  { dept: 'Emergency', visits: 40, revenue: 40000 }
];

export default function ReportsAnalyticsView() {
  const [timeframe, setTimeframe] = useState('month'); // 'today' | 'week' | 'month'

  const handleExportCSV = () => {
    alert('✓ Generating and downloading Hospital Operations Summary CSV report...');
  };

  const handleExportPDF = () => {
    alert('✓ Compiling executive PDF summary with financial and clinical metrics...');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Hospital Reports & Analytics
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Administrative metrics, OPD volume trends, bed occupancy, and revenue reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={handleExportPDF} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
            <FileText size={14} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['today', 'week', 'month'].map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            style={{
              background: timeframe === t ? '#0284c7' : '#f1f5f9',
              color: timeframe === t ? '#ffffff' : '#475569',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {t === 'today' ? "Today's Pulse" : t === 'week' ? 'This Week' : 'This Month (August 2026)'}
          </button>
        ))}
      </div>

      {/* 12 KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PATIENTS REGISTERED</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#0f172a' }}>184</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>+12% vs last period</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0d9488', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TOTAL OPD VISITS</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#0d9488' }}>246</h2>
          <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>M/M/c Flow Active</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TOTAL REVENUE (INR)</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>₹1,84,400</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>100% Invoices Cleared</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>BED OCCUPANCY</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#f59e0b' }}>78%</h2>
          <span style={{ fontSize: '11px', color: '#64748b' }}>22 Available Beds</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>AVG WAITING TIME</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#8b5cf6' }}>8.4 mins</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Target &lt; 15 mins</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ef4444', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PENDING DISCHARGES</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#ef4444' }}>2</h2>
          <span style={{ fontSize: '11px', color: '#ef4444' }}>Billing Clearance Pending</span>
        </div>
      </div>

      {/* Chart: Department OPD Volume */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
          📊 Outpatient Consultations & Revenue Breakdown by Specialty (INR ₹)
        </h3>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={OPD_VOLUME_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dept" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Bar dataKey="visits" name="OPD Visits" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
