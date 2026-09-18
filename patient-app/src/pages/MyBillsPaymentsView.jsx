import React, { useState, useEffect } from 'react';
import { CreditCard, Download, CheckCircle2, Shield, QrCode, FileText, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const DEFAULT_BILLS = [
  {
    id: 'INV-2026-8801',
    invoice_id: 'INV-2026-8801',
    date: '2026-08-31',
    department: 'Cardiology Outpatient Care',
    consultation: 750.0,
    investigations: 650.0,
    pharmacy: 350.0,
    bed_charges: 0.0,
    total: 1750.0,
    status: 'PAID',
    payment_method: 'UPI / Digital Payment',
    receipt_id: 'REC-2026-904'
  }
];

export default function MyBillsPaymentsView({ patient }) {
  const [bills, setBills] = useState(DEFAULT_BILLS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patient?.patient_id) return;
    const fetchBills = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/billing/patient/${patient.patient_id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.invoices && data.invoices.length > 0) {
            setBills(data.invoices.map((inv) => ({
              id: inv.invoice_id,
              invoice_id: inv.invoice_id,
              date: inv.invoice_date || '2026-08-31',
              department: inv.department || 'Outpatient Clinic',
              consultation: inv.consultation_fee || 750,
              investigations: inv.investigations_fee || 0,
              pharmacy: inv.pharmacy_fee || 0,
              bed_charges: inv.room_charges || 0,
              total: inv.total_amount || 750,
              status: (inv.status || 'Paid').toUpperCase(),
              payment_method: inv.payment_method || 'UPI / Online Clearance',
              receipt_id: inv.receipt_number || `REC-${inv.invoice_id}`
            })));
          }
        }
      } catch (e) {
        console.warn('Bills fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [patient?.patient_id]);

  const totalPaid = bills
    .filter((b) => b.status === 'PAID')
    .reduce((acc, b) => acc + Number(b.total || 0), 0);

  const totalOutstanding = bills
    .filter((b) => b.status !== 'PAID')
    .reduce((acc, b) => acc + Number(b.total || 0), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          My Bills & Payments
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
          Itemized hospital invoices, payment history, and digital discharge clearance receipts in INR (₹).
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TOTAL OUTSTANDING</span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: totalOutstanding > 0 ? '#ef4444' : '#10b981' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '11px', color: totalOutstanding === 0 ? '#10b981' : '#b45309', fontWeight: 600 }}>
            {totalOutstanding === 0 ? 'All Accounts Cleared' : 'Pending Clearance'}
          </span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TOTAL SETTLED</span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#0284c7' }}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Across all visits</span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0d9488', marginBottom: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>PAYMENT STATUS</span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '6px 0', color: '#0d9488' }}>
            {totalOutstanding === 0 ? 'CLEARED' : 'PENDING'}
          </h2>
          <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>
            {totalOutstanding === 0 ? 'Discharge Clearance Active' : 'Action Required'}
          </span>
        </div>
      </div>

      {/* Itemized Bills */}
      {loading ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
          Loading invoices…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bills.map((bill) => (
            <div key={bill.id} className="card" style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    OFFICIAL HOSPITAL INVOICE
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{bill.id}</h3>
                </div>
                <span style={{ fontSize: '12px', background: bill.status === 'PAID' ? '#dcfce7' : '#fee2e2', color: bill.status === 'PAID' ? '#15803d' : '#b91c1c', padding: '4px 12px', borderRadius: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> {bill.status === 'PAID' ? 'PAID IN FULL' : 'PENDING'}
                </span>
              </div>

              {/* Itemized Table */}
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Doctor Consultation & Outpatient Intake</span>
                  <strong>₹{Number(bill.consultation).toLocaleString('en-IN')}</strong>
                </div>
                {bill.investigations > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Diagnostic Investigations & Telemetry</span>
                    <strong>₹{Number(bill.investigations).toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {bill.pharmacy > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Pharmacy Medication Dispensation</span>
                    <strong>₹{Number(bill.pharmacy).toLocaleString('en-IN')}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px 0', fontSize: '15px', color: '#0f172a' }}>
                  <strong>Total Amount:</strong>
                  <strong style={{ color: '#0284c7' }}>₹{Number(bill.total).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Receipt: <strong>{bill.receipt_id}</strong> &bull; Method: {bill.payment_method}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => alert(`Downloading official GST invoice PDF for ${bill.id}...`)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={14} /> Download Tax Invoice (₹)
                  </button>
                  <button onClick={() => alert(`Generating UPI & QR Discharge Clearance Pass for Invoice #${bill.id}`)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <QrCode size={14} /> Get QR Clearance Pass
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
