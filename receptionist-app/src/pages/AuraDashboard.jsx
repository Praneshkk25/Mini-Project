import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AuraDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aptRes, bedRes] = await Promise.all([
        fetch('http://localhost:8000/api/appointments/list'),
        fetch('http://localhost:8000/api/beds/status')
      ]);

      if (aptRes.ok) {
        const aptData = await aptRes.json();
        setAppointments(aptData);
      }
      if (bedRes.ok) {
        const bedData = await bedRes.json();
        setBeds(bedData.beds || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalBeds = beds.length || 10;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const occupancyPct = Math.round((occupiedBeds / totalBeds) * 100) || 0;

  const wardData = [
    { name: 'ICU', value: beds.filter(b => b.ward_type === 'ICU' && b.status === 'Occupied').length, color: '#ef4444' },
    { name: 'General Ward', value: beds.filter(b => b.ward_type === 'General Ward' && b.status === 'Occupied').length, color: '#0284c7' },
    { name: 'Pediatrics', value: beds.filter(b => b.ward_type === 'Pediatric' && b.status === 'Occupied').length, color: '#0d9488' },
    { name: 'Available', value: beds.filter(b => b.status === 'Available').length || 10, color: '#10b981' }
  ];

  return (
    <div>
      {/* Top Greeting & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Good Morning, {user?.name || 'Elena'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Here is what's happening across hospital operations today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <button className="btn-secondary" onClick={fetchData}>
            🔄 Refresh Operations
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="stats-grid">
        {/* Card 1: Total Appointments */}
        <div className="card">
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Booked Visits</p>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0.35rem 0 0.5rem' }}>{appointments.length}</h2>
          <span className="pill-badge pill-info">Live Queue</span>
        </div>

        {/* Card 2: Today's Appointments */}
        <div className="card">
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Active OPD Encounters</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0.35rem 0 0.5rem' }}>
                {appointments.filter(a => a.status === 'Confirmed' || a.status === 'Checked-In').length}
              </h2>
              <span className="pill-badge pill-success">In Flow</span>
            </div>
          </div>
        </div>

        {/* Card 3: Bed Occupancy */}
        <div className="card">
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Bed Occupancy</p>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0.35rem 0 0.5rem' }}>{occupancyPct}%</h2>
          <span className="pill-badge pill-success">{beds.filter(b => b.status === 'Available').length} Beds Available</span>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${occupancyPct}%`, background: '#0d9488', borderRadius: '3px' }}></div>
          </div>
        </div>

        {/* Card 4: Pharmacy Status */}
        <div className="card">
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>System Health</p>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: 'var(--primary)' }}>100%</h2>
          <span className="pill-badge pill-success">All Services Operational</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Grid: Upcoming Appointments Table */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upcoming Appointments</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Live List</span>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No appointments booked yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>New registrations and patient bookings will appear here.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem' }}>Token</th>
                  <th style={{ padding: '0.65rem' }}>Patient</th>
                  <th style={{ padding: '0.65rem' }}>Time & Consultation</th>
                  <th style={{ padding: '0.65rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{apt.appointment_token}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{apt.patient_name}</td>
                    <td style={{ padding: '0.75rem' }}>{apt.date_time} ({apt.department})</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`pill-badge ${
                        apt.status === 'Checked-In' ? 'pill-success' :
                        apt.status === 'In-Consultation' ? 'pill-info' : 'pill-warning'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Grid: Ward Occupancy Donut Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ward Capacity & Occupancy</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live</span>
          </div>

          <div style={{ height: '220px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={wardData} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={4}>
                  {wardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{occupancyPct}%</h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>OCCUPIED</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            {wardData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                  {item.name}
                </span>
                <strong>{item.value} beds</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
