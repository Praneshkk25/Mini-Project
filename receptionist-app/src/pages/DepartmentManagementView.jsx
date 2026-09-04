import React, { useState } from 'react';
import { Building2, Plus, Users, Stethoscope, Edit3, CheckCircle2, XCircle, Search, X } from 'lucide-react';

export const INITIAL_DEPARTMENTS = [
  {
    id: 'DEP-01',
    name: 'Cardiology',
    code: 'CARD',
    hod: 'Dr. Sarah Jenkins',
    doctors_count: 6,
    rooms: 'Suite 201–206 (2nd Floor)',
    opd_status: 'ACTIVE_FLOW',
    status: 'ACTIVE'
  },
  {
    id: 'DEP-02',
    name: 'Neurology',
    code: 'NEUR',
    hod: 'Dr. Arun Kumar',
    doctors_count: 4,
    rooms: 'Rooms 301–306 (3rd Floor)',
    opd_status: 'ACTIVE_FLOW',
    status: 'ACTIVE'
  },
  {
    id: 'DEP-03',
    name: 'General Medicine',
    code: 'GMED',
    hod: 'Dr. Priya Sharma',
    doctors_count: 8,
    rooms: 'Rooms 101–106 (1st Floor)',
    opd_status: 'HIGH_DEMAND',
    status: 'ACTIVE'
  },
  {
    id: 'DEP-04',
    name: 'Orthopedics',
    code: 'ORTH',
    hod: 'Dr. Rajesh Menon',
    doctors_count: 5,
    rooms: 'Rooms 207–212 (2nd Floor)',
    opd_status: 'ACTIVE_FLOW',
    status: 'ACTIVE'
  },
  {
    id: 'DEP-05',
    name: 'Pediatrics',
    code: 'PED',
    hod: 'Dr. Ananya Sen',
    doctors_count: 4,
    rooms: 'Rooms 107–110 (1st Floor)',
    opd_status: 'ACTIVE_FLOW',
    status: 'ACTIVE'
  },
  {
    id: 'DEP-06',
    name: 'Emergency',
    code: 'EMER',
    hod: 'Dr. Vikram Malhotra',
    doctors_count: 10,
    rooms: 'Triage Bays A1–A8 (Ground Floor)',
    opd_status: '24X7_ACTIVE',
    status: 'ACTIVE'
  },
  {
    id: 'DEP-07',
    name: 'Radiology & Imaging',
    code: 'RAD',
    hod: 'Dr. K. S. Raman',
    doctors_count: 4,
    rooms: 'Imaging Wing (Ground Floor)',
    opd_status: 'ACTIVE_FLOW',
    status: 'ACTIVE'
  },
  {
    id: 'DEP-08',
    name: 'Psychiatry & Mental Health',
    code: 'PSYC',
    hod: 'Dr. Neha Kapoor',
    doctors_count: 3,
    rooms: 'Wellness Wing (4th Floor)',
    opd_status: 'SCHEDULED_ONLY',
    status: 'ACTIVE'
  }
];

export default function DepartmentManagementView() {
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '',
    code: '',
    hod: '',
    doctors_count: 2,
    rooms: 'Block B'
  });

  const filtered = departments.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()) || d.hod.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    const created = {
      id: `DEP-0${departments.length + 1}`,
      name: newDept.name,
      code: newDept.code.toUpperCase(),
      hod: newDept.hod.startsWith('Dr.') ? newDept.hod : `Dr. ${newDept.hod}`,
      doctors_count: Number(newDept.doctors_count),
      rooms: newDept.rooms,
      opd_status: 'ACTIVE_FLOW',
      status: 'ACTIVE'
    };
    setDepartments([...departments, created]);
    setShowAddModal(false);
    alert(`✓ Department ${created.name} (${created.code}) created successfully.`);
  };

  const handleToggleStatus = (id) => {
    setDepartments(departments.map((d) => (d.id === id ? { ...d, status: d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : d)));
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Department Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Hospital clinical specialties, Head of Department assignments, and outpatient room allocation.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}>
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Search Filter */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', background: '#f8fafc' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search department name, code, or HOD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map((dept) => (
          <div key={dept.id} className="card" style={{ padding: '20px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  {dept.code}
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{dept.name}</h3>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: dept.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                  color: dept.status === 'ACTIVE' ? '#15803d' : '#b91c1c'
                }}
              >
                {dept.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569', margin: '12px 0' }}>
              <div>Head of Dept: <strong style={{ color: '#0f172a' }}>{dept.hod}</strong></div>
              <div>Faculty Roster: <strong>{dept.doctors_count} Attending Doctors</strong></div>
              <div>Clinic Rooms: <strong>{dept.rooms}</strong></div>
              <div>OPD Flow: <span style={{ color: '#0284c7', fontWeight: 700 }}>{dept.opd_status}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <button
                onClick={() => handleToggleStatus(dept.id)}
                style={{
                  flex: 1,
                  fontSize: '12px',
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: dept.status === 'ACTIVE' ? '#fef2f2' : '#f0fdf4',
                  color: dept.status === 'ACTIVE' ? '#b91c1c' : '#15803d',
                  fontWeight: 700
                }}
              >
                {dept.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>➕ Add Hospital Department</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Department Name *</label>
                  <input type="text" required placeholder="e.g. Oncology" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Department Code *</label>
                    <input type="text" required placeholder="e.g. ONCO" value={newDept.code} onChange={(e) => setNewDept({ ...newDept, code: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Number of Doctors</label>
                    <input type="number" required value={newDept.doctors_count} onChange={(e) => setNewDept({ ...newDept, doctors_count: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Head of Department (HOD) *</label>
                  <input type="text" required placeholder="e.g. Dr. Ramesh Gupta" value={newDept.hod} onChange={(e) => setNewDept({ ...newDept, hod: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Consultation Rooms / Location</label>
                  <input type="text" required placeholder="e.g. Rooms 401–406 (4th Floor)" value={newDept.rooms} onChange={(e) => setNewDept({ ...newDept, rooms: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Create Department</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
