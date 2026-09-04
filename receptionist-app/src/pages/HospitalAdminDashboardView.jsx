import React, { useState } from 'react';
import {
  Building2,
  Users,
  Shield,
  Bed,
  BarChart3,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Lock,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

const INITIAL_STAFF = [
  { id: 'EMP-DOC-001', name: 'Dr. Sarah Jenkins', role: 'Doctor', department: 'Cardiology', hospital: 'AuraHealth Central Hospital', email: 'sarah.jenkins@aurahealth.org', phone: '+91 98401 22334', status: 'ACTIVE' },
  { id: 'EMP-DOC-002', name: 'Dr. Arun Kumar', role: 'Doctor', department: 'Neurology', hospital: 'AuraHealth Central Hospital', email: 'arun.kumar@aurahealth.org', phone: '+91 98402 33445', status: 'ACTIVE' },
  { id: 'EMP-DOC-003', name: 'Dr. Priya Sharma', role: 'Doctor', department: 'General Medicine', hospital: 'AuraHealth City Care Hospital', email: 'priya.sharma@aurahealth.org', phone: '+91 98403 44556', status: 'ACTIVE' },
  { id: 'EMP-PHARM-001', name: 'David Kim', role: 'Pharmacist', department: 'Pharmacy Dispensary', hospital: 'AuraHealth Central Hospital', email: 'david.kim@aurahealth.org', phone: '+91 98404 55667', status: 'ACTIVE' },
  { id: 'EMP-OPS-4412', name: 'Elena Rostova', role: 'Receptionist', department: 'Operations & Triage Desk', hospital: 'AuraHealth Central Hospital', email: 'elena.rostova@aurahealth.org', phone: '+91 98409 11223', status: 'ACTIVE' },
  { id: 'EMP-NURSE-001', name: 'Sister Mary Joseph', role: 'Nurse', department: 'ICU Critical Care', hospital: 'AuraHealth Central Hospital', email: 'mary.joseph@aurahealth.org', phone: '+91 98405 66778', status: 'ACTIVE' }
];

const INITIAL_HOSPITALS = [
  { code: 'AUR-CENTRAL', name: 'AuraHealth Central Hospital', city: 'Bengaluru', beds_total: 120, beds_available: 48, doctors_count: 32, status: 'OPERATIONAL' },
  { code: 'AUR-CITYCARE', name: 'AuraHealth City Care Hospital', city: 'Bengaluru', beds_total: 80, beds_available: 24, doctors_count: 18, status: 'OPERATIONAL' },
  { code: 'AUR-MULTI', name: 'AuraHealth Multispeciality Hospital', city: 'Bengaluru', beds_total: 150, beds_available: 65, doctors_count: 45, status: 'OPERATIONAL' },
  { code: 'AUR-MEDCTR', name: 'AuraHealth Medical Center', city: 'Bengaluru', beds_total: 60, beds_available: 19, doctors_count: 14, status: 'OPERATIONAL' }
];

export default function HospitalAdminDashboardView() {
  const [adminTab, setAdminTab] = useState('overview');
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [hospitals, setHospitals] = useState(INITIAL_HOSPITALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: 'Doctor',
    department: 'Cardiology',
    hospital: 'AuraHealth Central Hospital',
    email: '',
    phone: '',
    status: 'ACTIVE'
  });

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `EMP-${newStaffForm.role.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newStaffForm.name,
      role: newStaffForm.role,
      department: newStaffForm.department,
      hospital: newStaffForm.hospital,
      email: newStaffForm.email || `${newStaffForm.name.toLowerCase().replace(/\s+/g, '.')}@aurahealth.org`,
      phone: newStaffForm.phone || '+91 98400 00000',
      status: newStaffForm.status
    };

    setStaffList([...staffList, created]);
    setShowAddStaffModal(false);
    alert(`✓ Successfully registered staff account for ${created.name} (${created.id})`);
  };

  const handleToggleStatus = (staffId) => {
    setStaffList(staffList.map((s) => (s.id === staffId ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s)));
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Hospital Administration & Institutional Governance
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Central Executive Cockpit &bull; Managing Multi-Hospital Nodes, Clinical Staff, and RBAC Matrix
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowAddStaffModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}>
            <Plus size={16} /> + Register New Staff
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        {[
          { key: 'overview', label: 'Executive Overview', icon: BarChart3 },
          { key: 'hospitals', label: 'Hospital Facilities', icon: Building2 },
          { key: 'staff', label: 'User & Staff Management', icon: Users },
          { key: 'rbac', label: 'Roles & Permissions', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key)}
              style={{
                background: isActive ? '#0284c7' : '#f8fafc',
                color: isActive ? '#ffffff' : '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. EXECUTIVE OVERVIEW */}
      {adminTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>HOSPITAL FACILITIES</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#0f172a' }}>{hospitals.length}</h2>
              <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>100% Operational Nodes</span>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>REGISTERED CLINICAL STAFF</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>{staffList.length}</h2>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>{staffList.filter((s) => s.status === 'ACTIVE').length} Active On-Duty</span>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>NETWORK BED CAPACITY</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#f59e0b' }}>
                {hospitals.reduce((acc, curr) => acc + curr.beds_total, 0)} Units
              </h2>
              <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                {hospitals.reduce((acc, curr) => acc + curr.beds_available, 0)} Available
              </span>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #0d9488', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>INSTITUTIONAL REVENUE (INR)</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#0d9488' }}>₹4,85,200</h2>
              <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: 600 }}>Consolidated Billing</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. HOSPITALS */}
      {adminTab === 'hospitals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {hospitals.map((h) => (
            <div key={h.code} className="card" style={{ padding: '20px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{h.name}</strong>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  {h.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Facility Code: <strong>{h.code}</strong> &bull; {h.city}</div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>Total Beds: <strong>{h.beds_total}</strong></div>
                <div>Available: <strong style={{ color: '#10b981' }}>{h.beds_available}</strong></div>
                <div>Clinical Doctors: <strong>{h.doctors_count}</strong></div>
                <div>Pharmacy: <strong style={{ color: '#0284c7' }}>Connected</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. STAFF MANAGEMENT */}
      {adminTab === 'staff' && (
        <div>
          <div className="card" style={{ padding: '16px', marginBottom: '16px', background: '#f8fafc' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search staff by name, role, department, or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Staff Name</th>
                  <th style={{ padding: '10px' }}>Employee ID</th>
                  <th style={{ padding: '10px' }}>Role</th>
                  <th style={{ padding: '10px' }}>Department</th>
                  <th style={{ padding: '10px' }}>Hospital Facility</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList
                  .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase()) || s.department.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((staff) => (
                    <tr key={staff.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#0f172a' }}>{staff.name}</td>
                      <td style={{ padding: '10px', color: '#0284c7', fontWeight: 700 }}>{staff.id}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {staff.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{staff.department}</td>
                      <td style={{ padding: '10px', color: '#475569' }}>{staff.hospital}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: '11px', background: staff.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: staff.status === 'ACTIVE' ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {staff.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button onClick={() => handleToggleStatus(staff.id)} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                          {staff.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. RBAC MATRIX */}
      {adminTab === 'rbac' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800 }}>Role-Based Access Control (RBAC) Permissions Matrix</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                <th style={{ padding: '10px' }}>System Permission</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Patient</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Doctor</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Receptionist</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Pharmacist</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Administrator</th>
              </tr>
            </thead>
            <tbody>
              {[
                { perm: 'View Patient Medical Record', pt: '✓ (Own)', doc: '✓', rec: '✓ (Demog)', pharm: '✓ (Meds)', adm: '✓' },
                { perm: 'Prescribe Clinical Medication', pt: '✗', doc: '✓', rec: '✗', pharm: '✗', adm: '✗' },
                { perm: 'Verify & Dispense Pharmacy Drugs', pt: '✗', doc: '✗', rec: '✗', pharm: '✓', adm: '✓' },
                { perm: 'Assign Inpatient Hospital Beds', pt: '✗', doc: 'Request', rec: '✓', pharm: '✗', adm: '✓' },
                { perm: 'Generate OPD Queue & Triage', pt: 'Self (Kiosk)', doc: '✓', rec: '✓', pharm: '✗', adm: '✓' },
                { perm: 'System Settings & User Creation', pt: '✗', doc: '✗', rec: '✗', pharm: '✗', adm: '✓' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>{row.perm}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{row.pt}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#0284c7', fontWeight: 700 }}>{row.doc}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{row.rec}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#0d9488', fontWeight: 700 }}>{row.pharm}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#15803d', fontWeight: 700 }}>{row.adm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '540px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>➕ Register Clinical Staff Member</h3>
              <button onClick={() => setShowAddStaffModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Name *</label>
                  <input type="text" required placeholder="e.g. Dr. Vikram Menon" value={newStaffForm.name} onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Role *</label>
                    <select value={newStaffForm.role} onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option>Doctor</option>
                      <option>Receptionist</option>
                      <option>Pharmacist</option>
                      <option>Nurse</option>
                      <option>Hospital Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Department *</label>
                    <select value={newStaffForm.department} onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>General Medicine</option>
                      <option>Orthopedics</option>
                      <option>Pharmacy Dispensary</option>
                      <option>Operations & Triage Desk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Hospital Facility *</label>
                  <select value={newStaffForm.hospital} onChange={(e) => setNewStaffForm({ ...newStaffForm, hospital: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>AuraHealth Central Hospital</option>
                    <option>AuraHealth City Care Hospital</option>
                    <option>AuraHealth Multispeciality Hospital</option>
                    <option>AuraHealth Medical Center</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button type="button" onClick={() => setShowAddStaffModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Register Staff</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
