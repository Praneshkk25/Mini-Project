import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Plus, CalendarPlus, TrendingUp, Pill } from 'lucide-react';
import {
  DASHBOARD_STATS,
  UPCOMING_APPOINTMENTS,
  WARD_OCCUPANCY,
  RECENT_ACTIVITIES,
  TOP_MEDICATIONS,
  PATIENTS_SPARKLINE,
  REVENUE_SPARKLINE,
} from '../../data/dashboardMockData';

/* ─── Status badge color map ─── */
const STATUS_STYLES = {
  'Checked In': { bg: '#dcfce7', color: '#15803d' },
  'In Progress': { bg: '#dbeafe', color: '#1d4ed8' },
  'Waiting': { bg: '#fef3c7', color: '#b45309' },
  'Confirmed': { bg: '#ccfbf1', color: '#0f766e' },
  'Scheduled': { bg: '#f1f5f9', color: '#475569' },
};

/* ─── Mini occupancy ring for Bed Occupancy card ─── */
function OccupancyRing({ pct }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={radius}
        fill="none"
        stroke="#0d9488"
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

/* ─── Appointment avatar ─── */
function Avatar({ initials }) {
  const colors = ['#dbeafe', '#fce7f3', '#ccfbf1', '#fef3c7', '#ede9fe'];
  const textColors = ['#1e40af', '#9d174d', '#0f766e', '#92400e', '#5b21b6'];
  const idx = initials.charCodeAt(0) % colors.length;
  return (
    <div
      className="dash-avatar"
      style={{ background: colors[idx], color: textColors[idx] }}
    >
      {initials}
    </div>
  );
}

export default function DashboardHome() {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const totalOccupancy = WARD_OCCUPANCY.reduce((s, w) => s + w.value, 0);

  return (
    <div className="dash">
      {/* ─── Greeting ─── */}
      <div className="dash-greeting">
        <div>
          <h1 className="dash-greeting-title">{greeting}, Dr. Sarah</h1>
          <p className="dash-greeting-sub">Here is what's happening today.</p>
        </div>
        <div className="dash-greeting-actions">
          <button className="dash-btn-primary" id="btn-add-patient">
            <Plus size={18} /> Add New Patient
          </button>
          <button className="dash-btn-outline" id="btn-schedule-appt">
            <CalendarPlus size={18} /> Schedule Appointment
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="dash-stats">
        {/* Total Patients */}
        <div className="dash-stat-card">
          <p className="dash-stat-label">Total Patients</p>
          <div className="dash-stat-row">
            <span className="dash-stat-value">{DASHBOARD_STATS.totalPatients.value}</span>
            <span className="dash-stat-badge dash-stat-badge--green">
              {DASHBOARD_STATS.totalPatients.trend}
            </span>
          </div>
          <div className="dash-stat-spark">
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={PATIENTS_SPARKLINE}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="dash-stat-card">
          <p className="dash-stat-label">Today's Appointments</p>
          <div className="dash-stat-row">
            <span className="dash-stat-value">{DASHBOARD_STATS.todayAppointments.value}</span>
            <span className="dash-stat-badge dash-stat-badge--teal">
              {DASHBOARD_STATS.todayAppointments.pending} Pending
            </span>
          </div>
          <div className="dash-stat-spark" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <OccupancyRing pct={Math.round((DASHBOARD_STATS.todayAppointments.pending / parseInt(DASHBOARD_STATS.todayAppointments.value)) * 100)} />
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="dash-stat-card">
          <p className="dash-stat-label">Bed Occupancy</p>
          <div className="dash-stat-row">
            <span className="dash-stat-value">{DASHBOARD_STATS.bedOccupancy.value}</span>
            <span className="dash-stat-badge dash-stat-badge--red">
              {DASHBOARD_STATS.bedOccupancy.tag}
            </span>
          </div>
          <div className="dash-stat-progress">
            <div className="dash-stat-progress-fill" style={{ width: DASHBOARD_STATS.bedOccupancy.value }} />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="dash-stat-card">
          <p className="dash-stat-label">Monthly Revenue</p>
          <div className="dash-stat-row">
            <span className="dash-stat-value">{DASHBOARD_STATS.monthlyRevenue.value}</span>
            <span className="dash-stat-badge dash-stat-badge--green">
              {DASHBOARD_STATS.monthlyRevenue.trend}
            </span>
          </div>
          <div className="dash-stat-spark">
            <div className="dash-stat-bars">
              {REVENUE_SPARKLINE.map((d, i) => (
                <div
                  key={i}
                  className="dash-stat-bar"
                  style={{ height: `${(d.v / 55) * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Middle Row: Appointments + Ward Occupancy ─── */}
      <div className="dash-mid-grid">
        {/* Upcoming Appointments */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Upcoming Appointments</h2>
            <button className="dash-link-btn" id="btn-view-all-appts">View All</button>
          </div>
          <div className="dash-appt-list">
            {UPCOMING_APPOINTMENTS.map((appt) => {
              const st = STATUS_STYLES[appt.status] || STATUS_STYLES['Scheduled'];
              return (
                <div key={appt.id} className="dash-appt-row">
                  <Avatar initials={appt.initials} />
                  <div className="dash-appt-info">
                    <span className="dash-appt-name">{appt.name}</span>
                    <span className="dash-appt-detail">
                      {appt.time}
                      <br />
                      {appt.type}
                    </span>
                  </div>
                  <span
                    className="dash-appt-status"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {appt.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ward Occupancy */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Ward Occupancy</h2>
            <span className="dash-card-meta">Today ▾</span>
          </div>
          <div className="dash-ward-content">
            <div className="dash-ward-chart">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={WARD_OCCUPANCY}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {WARD_OCCUPANCY.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-ward-center-label">
                <span className="dash-ward-pct">
                  {Math.round(totalOccupancy / WARD_OCCUPANCY.length)}%
                </span>
              </div>
            </div>
            <div className="dash-ward-legend">
              {WARD_OCCUPANCY.map((w) => (
                <div key={w.name} className="dash-ward-legend-item">
                  <span className="dash-ward-dot" style={{ background: w.color }} />
                  <span className="dash-ward-legend-text">{w.name}</span>
                  <span className="dash-ward-legend-val">{w.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Activities + Medications ─── */}
      <div className="dash-bottom-grid">
        {/* Recent Activities */}
        <div className="dash-card">
          <h2 className="dash-card-title">Recent Activities</h2>
          <div className="dash-activity-list">
            {RECENT_ACTIVITIES.map((a) => (
              <div key={a.id} className="dash-activity-row">
                <span className="dash-activity-time">{a.time}</span>
                <span className="dash-activity-dot" style={{ background: a.color }} />
                <span className="dash-activity-text">{a.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Medications Dispensed */}
        <div className="dash-card">
          <h2 className="dash-card-title">Top Medications Dispensed</h2>
          <div className="dash-meds-list">
            {TOP_MEDICATIONS.map((med, i) => (
              <div key={i} className="dash-med-row">
                <div className="dash-med-icon">
                  <Pill size={16} />
                </div>
                <div className="dash-med-info">
                  <span className="dash-med-name">{med.name}</span>
                  <div className="dash-med-bar-track">
                    <div
                      className="dash-med-bar-fill"
                      style={{ width: `${(med.units / med.maxUnits) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="dash-med-units">{med.units.toLocaleString()} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
