import React, { useState } from 'react';
import { Shield, Search, Filter, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-901',
    timestamp: '2026-08-31 11:20:15',
    user: 'Elena Rostova',
    role: 'Desk Admin',
    module: 'Patient Check-In',
    action: 'Generated OPD Token #04 for James Robertson',
    patient_uhid: 'UHID-2026-884920',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-08-31 11:15:30',
    user: 'Elena Rostova',
    role: 'Desk Admin',
    module: 'Bed Management',
    action: 'Assigned Bed ICU-102 to Meera Nambiar',
    patient_uhid: 'UHID-2026-884922',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-08-31 10:45:00',
    user: 'Elena Rostova',
    role: 'Desk Admin',
    module: 'Appointments',
    action: 'Rescheduled appointment AP-204 with Dr. Sarah Jenkins',
    patient_uhid: 'UHID-2026-884920',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-08-31 10:30:12',
    user: 'Rohan Sharma',
    role: 'Billing Staff',
    module: 'Billing & Payments',
    action: 'Marked invoice INV-2026-8801 as Paid (₹1,200 via UPI)',
    patient_uhid: 'UHID-2026-884920',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-905',
    timestamp: '2026-08-31 09:15:00',
    user: 'Elena Rostova',
    role: 'Desk Admin',
    module: 'Patient Registration',
    action: 'Registered new outpatient Eleanor Vance',
    patient_uhid: 'UHID-2026-884921',
    status: 'SUCCESS'
  }
];

export default function AuditLogsView() {
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const filtered = logs.filter((l) => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.patient_uhid.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === 'All' || l.module === moduleFilter;
    return matchSearch && matchModule;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Institutional Security & Audit Trail
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
          Immutable record of hospital administrative events, user access, and patient data modifications.
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', background: '#f8fafc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search audit actions, user, or UHID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div>
            <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
              <option value="All">All Operations Modules</option>
              <option value="Patient Registration">Patient Registration</option>
              <option value="Patient Check-In">Patient Check-In</option>
              <option value="Appointments">Appointments</option>
              <option value="Bed Management">Bed Management</option>
              <option value="Billing & Payments">Billing & Payments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                <th style={{ padding: '12px 10px' }}>Timestamp</th>
                <th style={{ padding: '12px 10px' }}>User & Role</th>
                <th style={{ padding: '12px 10px' }}>Module</th>
                <th style={{ padding: '12px 10px' }}>Administrative Action</th>
                <th style={{ padding: '12px 10px' }}>Patient / UHID</th>
                <th style={{ padding: '12px 10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 10px', color: '#64748b', fontSize: '12px' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.user}</div>
                    <span style={{ fontSize: '11px', color: '#0284c7' }}>{log.role}</span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {log.module}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#334155' }}>{log.action}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#0284c7' }}>{log.patient_uhid}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
