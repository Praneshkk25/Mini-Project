import React, { useState } from 'react';
import { Pill, CheckCircle, Clock, FileText, User, Calendar, ShieldCheck, X } from 'lucide-react';

export default function MyPrescriptionsView({ patient }) {
  const [filter, setFilter] = useState('active');
  const [selectedRx, setSelectedRx] = useState(null);

  const prescriptions = [
    {
      id: 'RX-2026-8801',
      medicine_name: 'Pantocid 40mg',
      dosage: '1 tablet',
      frequency: 'Once daily (OD)',
      instructions: 'Take 30 minutes before breakfast with a glass of water',
      duration: '10 days',
      quantity: 10,
      prescribed_by: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      date: '2026-08-31',
      status: 'DISPENSED',
      pharmacy_note: 'Dispensed by Central Pharmacy &bull; Batch #PANT-902'
    },
    {
      id: 'RX-2026-8802',
      medicine_name: 'Metformin 500mg',
      dosage: '1 tablet',
      frequency: 'Twice daily (BD)',
      instructions: 'Take with meals (Morning & Night)',
      duration: '30 days',
      quantity: 60,
      prescribed_by: 'Dr. Sarah Jenkins',
      department: 'Cardiology OPD',
      date: '2026-08-31',
      status: 'DISPENSED',
      pharmacy_note: 'Dispensed by Central Pharmacy &bull; Batch #MET-501'
    },
    {
      id: 'RX-2026-7719',
      medicine_name: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      frequency: 'Thrice daily (TDS)',
      instructions: 'Complete full 7-day antibiotic course',
      duration: '7 days',
      quantity: 21,
      prescribed_by: 'Dr. Marcus Vance',
      department: 'General Medicine',
      date: '2026-07-15',
      status: 'COMPLETED',
      pharmacy_note: 'Past completed course'
    }
  ];

  const filtered = prescriptions.filter((rx) => (filter === 'active' ? rx.status === 'DISPENSED' : rx.status === 'COMPLETED'));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Prescriptions
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Doctor-issued electronic prescriptions and pharmacy dispensation records.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          onClick={() => setFilter('active')}
          style={{
            background: filter === 'active' ? '#0284c7' : '#f1f5f9',
            color: filter === 'active' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Active Medicines ({prescriptions.filter((r) => r.status === 'DISPENSED').length})
        </button>
        <button
          onClick={() => setFilter('past')}
          style={{
            background: filter === 'past' ? '#0284c7' : '#f1f5f9',
            color: filter === 'past' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Past Prescriptions ({prescriptions.filter((r) => r.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Prescriptions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((rx) => (
          <div
            key={rx.id}
            className="card"
            style={{
              padding: '20px',
              borderLeft: '4px solid #0d9488',
              marginBottom: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedRx(rx)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e6fffa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{rx.medicine_name}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
                  {rx.dosage} &bull; <strong>{rx.frequency}</strong> &bull; Duration: {rx.duration}
                </p>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Prescribed by <strong>{rx.prescribed_by}</strong> on {rx.date}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> {rx.status === 'DISPENSED' ? '✓ Dispensed by Pharmacy' : 'Completed'}
              </span>
              <div style={{ marginTop: '6px' }}>
                <button className="btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }}>
                  View Instructions &rarr;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prescription Detail Modal */}
      {selectedRx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '560px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#0d9488', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  OFFICIAL PRESCRIPTION RECORD
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>{selectedRx.medicine_name}</h3>
              </div>
              <button onClick={() => setSelectedRx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <strong style={{ color: '#0f172a' }}>Patient Care Instructions:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#334155' }}>{selectedRx.instructions}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Dosage & Frequency:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRx.dosage} - {selectedRx.frequency}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Quantity Prescribed:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRx.quantity} units ({selectedRx.duration})</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Prescribing Physician:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRx.prescribed_by}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Prescription ID:</span>
                  <div style={{ fontWeight: 700, color: '#0284c7' }}>{selectedRx.id}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                {selectedRx.pharmacy_note}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button onClick={() => setSelectedRx(null)} className="btn-primary">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
