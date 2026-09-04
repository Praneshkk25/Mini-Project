import React, { useState } from 'react';
import { CreditCard, Download, CheckCircle2, Shield, QrCode, FileText } from 'lucide-react';

export default function MyBillsPaymentsView({ patient }) {
  const [bills, setBills] = useState([
    {
      id: 'INV-2026-8801',
      date: '2026-08-31',
      department: 'Cardiology Outpatient Care',
      consultation: 50.0,
      investigations: 40.0,
      pharmacy: 30.0,
      bed_charges: 0.0,
      total: 120.0,
      status: 'PAID',
      payment_method: 'Digital Payment / TPA Direct',
      receipt_id: 'REC-2026-904'
    }
  ]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          My Bills & Payments
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
          Itemized hospital invoices, payment history, and digital discharge clearance receipts.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TOTAL OUTSTANDING</span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>$0.00</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>All Accounts Cleared</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>LAST PAYMENT</span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#0284c7' }}>$120.00</h2>
          <span style={{ fontSize: '11px', color: '#64748b' }}>31-Aug-2026</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0d9488', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>PAYMENT STATUS</span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '6px 0', color: '#0d9488' }}>CLEARED</h2>
          <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>Discharge Pass Ready</span>
        </div>
      </div>

      {/* Itemized Bills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {bills.map((bill) => (
          <div key={bill.id} className="card" style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  OFFICIAL INVOICE
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{bill.id}</h3>
              </div>
              <span style={{ fontSize: '12px', background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> PAID IN FULL
              </span>
            </div>

            {/* Itemized Table */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>Doctor Consultation & Clinical Intake</span>
                <strong>${bill.consultation.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>12-Lead Diagnostic ECG & Telemetry</span>
                <strong>${bill.investigations.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>Prescription Medication (Pantocid 40mg)</span>
                <strong>${bill.pharmacy.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px 0', fontSize: '15px', color: '#0f172a' }}>
                <strong>Total Amount Paid:</strong>
                <strong style={{ color: '#0284c7' }}>${bill.total.toFixed(2)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Receipt: <strong>{bill.receipt_id}</strong> &bull; Method: {bill.payment_method}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => alert('Downloading official tax invoice PDF...')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Download size={14} /> Download Bill PDF
                </button>
                <button onClick={() => alert('Downloading QR Discharge Clearance pass...')} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <QrCode size={14} /> Get QR Clearance Pass
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
