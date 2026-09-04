import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Pill,
  CheckCircle2,
  Package,
  AlertTriangle,
  Activity,
  History,
  ShoppingCart,
  Truck,
  ArrowRightLeft,
  RotateCcw,
  UserCheck,
  BarChart3,
  Bell,
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Printer,
  Download,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  X,
  FileText
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

// Initial Shared Formularies & Inventory Data (All in INR ₹)
export const INITIAL_FORMULARY = [
  {
    id: 'MED-101',
    brand_name: 'Pantocid 40mg',
    generic_name: 'Pantoprazole Sodium Gastro-Resistant',
    strength: '40 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Sun Pharma Laboratories',
    supplier: 'MedPharma Logistics Central',
    batch_number: 'PANT-902',
    stock_level: 450,
    reorder_level: 100,
    expiry_date: '2027-08-31',
    purchase_price: 8.5,
    selling_price: 15.5,
    gst: '12%',
    storage_condition: 'Store below 25°C',
    rx_required: true,
    status: 'Healthy',
    category: 'Gastroenterology'
  },
  {
    id: 'MED-102',
    brand_name: 'Metformin 500mg',
    generic_name: 'Metformin Hydrochloride Prolonged Release',
    strength: '500 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Cipla Healthcare',
    supplier: 'Cipla Distribution Hub',
    batch_number: 'MET-501',
    stock_level: 60,
    reorder_level: 150,
    expiry_date: '2027-04-30',
    purchase_price: 12.0,
    selling_price: 22.0,
    gst: '12%',
    storage_condition: 'Store in cool dry place',
    rx_required: true,
    status: 'Low Stock',
    category: 'Diabetology'
  },
  {
    id: 'MED-103',
    brand_name: 'Amoxicillin 500mg',
    generic_name: 'Amoxicillin Trihydrate',
    strength: '500 mg',
    dosage_form: 'Capsule',
    manufacturer: 'Dr. Reddy’s Laboratories',
    supplier: 'Apollo Med Wholesale',
    batch_number: 'AMX-304',
    stock_level: 320,
    reorder_level: 80,
    expiry_date: '2026-09-25',
    purchase_price: 28.0,
    selling_price: 45.0,
    gst: '12%',
    storage_condition: 'Store below 25°C',
    rx_required: true,
    status: 'Near Expiry',
    category: 'Antibiotics'
  },
  {
    id: 'MED-104',
    brand_name: 'Atorvastatin 20mg',
    generic_name: 'Atorvastatin Calcium IP',
    strength: '20 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Lupin Pharmaceuticals',
    supplier: 'MedPharma Logistics Central',
    batch_number: 'ATV-882',
    stock_level: 280,
    reorder_level: 75,
    expiry_date: '2027-11-30',
    purchase_price: 18.0,
    selling_price: 32.0,
    gst: '12%',
    storage_condition: 'Store below 30°C',
    rx_required: true,
    status: 'Healthy',
    category: 'Cardiology'
  },
  {
    id: 'MED-105',
    brand_name: 'Paracetamol 650mg',
    generic_name: 'Paracetamol IP (Dolo 650 equivalent)',
    strength: '650 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Micro Labs Limited',
    supplier: 'MedPharma Logistics Central',
    batch_number: 'PCM-119',
    stock_level: 850,
    reorder_level: 200,
    expiry_date: '2028-02-28',
    purchase_price: 1.8,
    selling_price: 3.5,
    gst: '12%',
    storage_condition: 'Room temperature',
    rx_required: false,
    status: 'Healthy',
    category: 'Analgesics'
  }
];

export const INITIAL_PRESCRIPTIONS = [
  {
    id: 'RX-2026-8801',
    patient_name: 'James Robertson',
    uhid: 'UHID-2026-884920',
    doctor_name: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    date: '2026-08-31',
    medicine_name: 'Pantocid 40mg',
    dosage: '1 tablet OD (Before breakfast)',
    quantity: 10,
    priority: 'Routine',
    status: 'Verified',
    notes: 'Post-consultation gastro-protective therapy'
  },
  {
    id: 'RX-2026-8802',
    patient_name: 'Eleanor Vance',
    uhid: 'UHID-2026-884921',
    doctor_name: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    date: '2026-08-31',
    medicine_name: 'Metformin 500mg',
    dosage: '1 tablet BD (With meals)',
    quantity: 30,
    priority: 'Routine',
    status: 'Pending Verification',
    notes: 'Routine glycemic maintenance'
  },
  {
    id: 'RX-2026-8803',
    patient_name: 'Meera Nambiar',
    uhid: 'UHID-2026-884922',
    doctor_name: 'Dr. Arun Kumar',
    department: 'Neurology',
    date: '2026-08-31',
    medicine_name: 'Atorvastatin 20mg',
    dosage: '1 tablet HS (Night)',
    quantity: 15,
    priority: 'Urgent',
    status: 'Pending Verification',
    notes: 'Lipid stabilization therapy'
  }
];

export const INITIAL_DISPENSING_HISTORY = [
  {
    tx_id: 'TX-DISP-9001',
    rx_id: 'RX-2026-8801',
    patient_name: 'James Robertson',
    uhid: 'UHID-2026-884920',
    medicine_name: 'Pantocid 40mg',
    batch_number: 'PANT-902',
    quantity: 10,
    total_amount: 155.0,
    pharmacist: 'David Kim (Chief Clinical Pharmacist)',
    date_time: '2026-08-31 11:20 AM',
    status: 'COMPLETED'
  },
  {
    tx_id: 'TX-DISP-9002',
    rx_id: 'RX-2026-7719',
    patient_name: 'Eleanor Vance',
    uhid: 'UHID-2026-884921',
    medicine_name: 'Amoxicillin 500mg',
    batch_number: 'AMX-304',
    quantity: 21,
    total_amount: 945.0,
    pharmacist: 'David Kim (Chief Clinical Pharmacist)',
    date_time: '2026-08-31 09:45 AM',
    status: 'COMPLETED'
  }
];

export default function PharmacyConsole({ activeTab = 'dashboard', onSelectTab }) {
  const [formulary, setFormulary] = useState(INITIAL_FORMULARY);
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [dispensingHistory, setDispensingHistory] = useState(INITIAL_DISPENSING_HISTORY);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals & Panels
  const [selectedRx, setSelectedRx] = useState(null);
  const [selectedMed, setSelectedMed] = useState(null);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);

  // Stock-In Form State
  const [stockInForm, setStockInForm] = useState({
    brand_name: '',
    generic_name: '',
    manufacturer: 'Sun Pharma Laboratories',
    supplier: 'MedPharma Logistics Central',
    batch_number: `B-${Math.floor(100 + Math.random() * 900)}`,
    expiry_date: '2027-12-31',
    quantity: 100,
    purchase_price: 15.0,
    selling_price: 25.0,
    gst: '12%',
    storage_condition: 'Store below 25°C',
    category: 'General'
  });

  // Purchase Orders State
  const [purchaseOrders, setPurchaseOrders] = useState([
    { po_number: 'PO-2026-9901', supplier: 'Cipla Healthcare', medicine: 'Metformin 500mg', quantity: 300, date: '2026-08-31', expected: '2026-09-02', total_amount: 3600, status: 'Shipped' },
    { po_number: 'PO-2026-9902', supplier: 'Sun Pharma Laboratories', medicine: 'Pantocid 40mg', quantity: 500, date: '2026-08-30', expected: '2026-09-01', total_amount: 4250, status: 'Processing' }
  ]);

  // Suppliers & Vendors State
  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-101', name: 'MedPharma Logistics Central', gstin: '29ABCDE1234F1Z5', phone: '+91 80 4123 8899', email: 'orders@medpharma.co.in', medicines_count: 42, outstanding: 18500, status: 'Active' },
    { id: 'SUP-102', name: 'Cipla Healthcare Direct', gstin: '29CIPLA5678G2Z1', phone: '+91 80 2234 5566', email: 'supply@cipla.com', medicines_count: 28, outstanding: 12400, status: 'Active' },
    { id: 'SUP-103', name: 'Sun Pharma Distribution Hub', gstin: '29SUNPH9911H3Z9', phone: '+91 80 3345 7788', email: 'dist@sunpharma.com', medicines_count: 35, outstanding: 0, status: 'Active' }
  ]);

  // Stock Transfers State
  const [stockTransfers, setStockTransfers] = useState([
    { id: 'TRF-2026-01', from: 'Central Pharmacy', to: 'Emergency OPD Satellite', medicine: 'Paracetamol 650mg', batch: 'PCM-119', quantity: 100, date: '2026-08-31', status: 'Received' }
  ]);

  // Returns & Recalls State
  const [returnsList, setReturnsList] = useState([
    { id: 'RET-101', type: 'Customer Return', medicine: 'Pantocid 40mg', batch: 'PANT-902', quantity: 2, reason: 'Unused / Dose reduced', date: '2026-08-30', status: 'Restocked' }
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { timestamp: '2026-08-31 11:20:12', user: 'David Kim', role: 'Chief Pharmacist', action: 'Dispensed 10 units Pantocid 40mg (Batch PANT-902)', rx_id: 'RX-2026-8801', uhid: 'UHID-2026-884920' },
    { timestamp: '2026-08-31 11:18:05', user: 'David Kim', role: 'Chief Pharmacist', action: 'Verified prescription RX-2026-8801 for James Robertson', rx_id: 'RX-2026-8801', uhid: 'UHID-2026-884920' },
    { timestamp: '2026-08-31 10:45:00', user: 'David Kim', role: 'Chief Pharmacist', action: 'Stock-In 500 units Paracetamol 650mg (Batch PCM-119)', rx_id: '--', uhid: '--' }
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Low Stock', message: 'Metformin 500mg (Batch MET-501) is below reorder threshold (60/150).', time: '15m ago', read: false },
    { id: 2, type: 'Near Expiry', message: 'Amoxicillin 500mg (Batch AMX-304) expires in 25 days (25-Sep-2026).', time: '1h ago', read: false },
    { id: 3, type: 'Prescription Queue', message: 'New electronic prescription RX-2026-8802 received from Dr. Sarah Jenkins.', time: '2h ago', read: true }
  ]);

  // 1. Pharmacist Verifies Prescription
  const handleVerifyPrescription = (rxId) => {
    setPrescriptions(prescriptions.map((p) => (p.id === rxId ? { ...p, status: 'Verified' } : p)));
    setAuditLogs([
      { timestamp: new Date().toLocaleTimeString(), user: 'David Kim', role: 'Chief Pharmacist', action: `Verified prescription ${rxId}`, rx_id: rxId, uhid: selectedRx?.uhid || '--' },
      ...auditLogs
    ]);
    alert(`✓ Prescription ${rxId} verified by Pharmacist David Kim.`);
    if (selectedRx) setSelectedRx({ ...selectedRx, status: 'Verified' });
  };

  // 2. Dispense Prescription Workflow
  const handleDispensePrescription = (rx) => {
    const med = formulary.find((m) => m.brand_name.includes(rx.medicine_name.split(' ')[0]));
    if (!med) {
      alert('Medication item not found in hospital formulary inventory.');
      return;
    }
    if (med.stock_level < rx.quantity) {
      alert(`⚠️ Insufficient stock for ${med.brand_name}. Current available stock: ${med.stock_level} units.`);
      return;
    }

    // Decrement stock without negative inventory
    const updatedStock = med.stock_level - rx.quantity;
    setFormulary(formulary.map((m) => (m.id === med.id ? { ...m, stock_level: updatedStock, status: updatedStock <= m.reorder_level ? 'Low Stock' : 'Healthy' } : m)));

    // Update prescription status
    setPrescriptions(prescriptions.map((p) => (p.id === rx.id ? { ...p, status: 'Dispensed' } : p)));

    // Create Dispensing Transaction
    const tx = {
      tx_id: `TX-DISP-${Math.floor(1000 + Math.random() * 9000)}`,
      rx_id: rx.id,
      patient_name: rx.patient_name,
      uhid: rx.uhid,
      medicine_name: med.brand_name,
      batch_number: med.batch_number,
      quantity: rx.quantity,
      total_amount: rx.quantity * med.selling_price,
      pharmacist: 'David Kim (Chief Clinical Pharmacist)',
      date_time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'COMPLETED'
    };
    setDispensingHistory([tx, ...dispensingHistory]);

    // Record Audit
    setAuditLogs([
      { timestamp: new Date().toLocaleTimeString(), user: 'David Kim', role: 'Chief Pharmacist', action: `Dispensed ${rx.quantity} units ${med.brand_name} (Batch ${med.batch_number})`, rx_id: rx.id, uhid: rx.uhid },
      ...auditLogs
    ]);

    setSelectedRx(null);
    alert(`✓ Successfully dispensed ${rx.quantity} units of ${med.brand_name} (Batch #${med.batch_number}) for ${rx.patient_name}.\nTotal Amount: ₹${tx.total_amount}\nInventory balance updated to ${updatedStock} units.`);
  };

  // 3. Stock-In Submission
  const handleStockInSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `MED-${Math.floor(200 + Math.random() * 800)}`,
      brand_name: stockInForm.brand_name,
      generic_name: stockInForm.generic_name,
      strength: 'Standard',
      dosage_form: 'Tablet',
      manufacturer: stockInForm.manufacturer,
      supplier: stockInForm.supplier,
      batch_number: stockInForm.batch_number,
      stock_level: Number(stockInForm.quantity),
      reorder_level: 50,
      expiry_date: stockInForm.expiry_date,
      purchase_price: Number(stockInForm.purchase_price),
      selling_price: Number(stockInForm.selling_price),
      gst: stockInForm.gst,
      storage_condition: stockInForm.storage_condition,
      rx_required: true,
      status: 'Healthy',
      category: stockInForm.category
    };

    setFormulary([...formulary, newEntry]);
    setAuditLogs([
      { timestamp: new Date().toLocaleTimeString(), user: 'David Kim', role: 'Chief Pharmacist', action: `Stocked in ${newEntry.stock_level} units of ${newEntry.brand_name} (Batch ${newEntry.batch_number})`, rx_id: '--', uhid: '--' },
      ...auditLogs
    ]);

    setShowStockInModal(false);
    alert(`✓ Stock-In complete: Added ${newEntry.stock_level} units of ${newEntry.brand_name} (Batch #${newEntry.batch_number}) to formulary.`);
  };

  // 4. Create Purchase Order Submission
  const handleCreatePOSubmit = (e) => {
    e.preventDefault();
    const po = {
      po_number: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: stockInForm.supplier,
      medicine: stockInForm.brand_name || 'Metformin 500mg',
      quantity: 500,
      date: new Date().toISOString().split('T')[0],
      expected: '2026-09-05',
      total_amount: 500 * 12,
      status: 'Submitted'
    };
    setPurchaseOrders([po, ...purchaseOrders]);
    setShowCreatePOModal(false);
    alert(`✓ Purchase Order ${po.po_number} generated and sent to ${po.supplier}. Total: ₹${po.total_amount}`);
  };

  // 5. Recall Drug Batch
  const handleRecallBatch = (batchNum, medName) => {
    if (confirm(`⚠️ Urgent Drug Recall: Are you sure you want to block batch #${batchNum} of ${medName}? This will prevent all dispensing across all hospital stations.`)) {
      setFormulary(formulary.map((m) => (m.batch_number === batchNum ? { ...m, status: 'Blocked / Recalled' } : m)));
      setAuditLogs([
        { timestamp: new Date().toLocaleTimeString(), user: 'David Kim', role: 'Chief Pharmacist', action: `BLOCKED recalled batch #${batchNum} of ${medName}`, rx_id: '--', uhid: '--' },
        ...auditLogs
      ]);
      alert(`✓ Batch #${batchNum} marked as BLOCKED / RECALLED. Dispensing disabled.`);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      {/* 1. PHARMACY DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                AuraPharmacy Dispensary & Formulary Hub
              </h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Logged in as <strong>David Kim (Chief Clinical Pharmacist)</strong> &bull; Central Dispensary Unit 1
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowStockInModal(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
                <Plus size={15} /> + Stock-In Medicine
              </button>
              <button onClick={() => setShowCreatePOModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
                <ShoppingCart size={15} /> + Create Purchase Order
              </button>
            </div>
          </div>

          {/* 6 Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PENDING PRESCRIPTIONS</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#f59e0b' }}>
                {prescriptions.filter((p) => p.status !== 'Dispensed').length}
              </h2>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Awaiting verification</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>DISPENSED TODAY</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>{dispensingHistory.length}</h2>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>100% Fulfillment rate</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ef4444', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>LOW STOCK ALERTS</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#ef4444' }}>
                {formulary.filter((m) => m.stock_level <= m.reorder_level).length}
              </h2>
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Reorder recommended</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f97316', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>NEAR EXPIRY ITEMS</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#f97316' }}>
                {formulary.filter((m) => m.status === 'Near Expiry').length}
              </h2>
              <span style={{ fontSize: '11px', color: '#64748b' }}>&lt; 90 days remaining</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>FORMULARY ITEMS</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#0284c7' }}>{formulary.length}</h2>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Active SKUs</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0d9488', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TODAY'S REVENUE (INR)</span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#0d9488' }}>
                ₹{dispensingHistory.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString()}
              </h2>
              <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>Cleared OTC & Rx</span>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="card" style={{ padding: '14px', marginBottom: '20px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
              <button onClick={() => onSelectTab('prescriptions')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                📋 View Prescription Queue ({prescriptions.filter((p) => p.status !== 'Dispensed').length})
              </button>
              <button onClick={() => onSelectTab('low_stock')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                ⚠️ View Low Stock Alerts
              </button>
              <button onClick={() => onSelectTab('city_network')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                🌐 City-Wide Drug Network
              </button>
              <button onClick={() => onSelectTab('reports')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                📈 Pharmacy Reports
              </button>
            </div>
          </div>

          {/* Prescription Fulfillment Queue */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                📋 Electronic Prescriptions Waiting for Fulfillment
              </h3>
              <button onClick={() => onSelectTab('prescriptions')} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>
                Full Queue &rarr;
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Rx ID</th>
                  <th style={{ padding: '10px' }}>Patient & UHID</th>
                  <th style={{ padding: '10px' }}>Prescribing Doctor</th>
                  <th style={{ padding: '10px' }}>Medicine Prescribed</th>
                  <th style={{ padding: '10px' }}>Qty</th>
                  <th style={{ padding: '10px' }}>Priority</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{rx.id}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 700 }}>{rx.patient_name}</div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{rx.uhid}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div>{rx.doctor_name}</div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{rx.department}</span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{rx.medicine_name}</td>
                    <td style={{ padding: '10px' }}>{rx.quantity}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: rx.priority === 'Urgent' ? '#fee2e2' : '#f1f5f9', color: rx.priority === 'Urgent' ? '#b91c1c' : '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {rx.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: rx.status === 'Dispensed' ? '#dcfce7' : rx.status === 'Verified' ? '#e0f2fe' : '#fef3c7', color: rx.status === 'Dispensed' ? '#15803d' : rx.status === 'Verified' ? '#0369a1' : '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {rx.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button onClick={() => setSelectedRx(rx)} className="btn-primary" style={{ fontSize: '12px', padding: '4px 10px' }}>
                        Process Rx &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PRESCRIPTION QUEUE */}
      {activeTab === 'prescriptions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Prescription Verification & Fulfillment Queue</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Electronic doctor orders awaiting clinical verification and dispensary batch issue.
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Prescription ID</th>
                  <th style={{ padding: '10px' }}>Patient Name</th>
                  <th style={{ padding: '10px' }}>UHID</th>
                  <th style={{ padding: '10px' }}>Doctor</th>
                  <th style={{ padding: '10px' }}>Medicine & Dose</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{rx.id}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{rx.patient_name}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{rx.uhid}</td>
                    <td style={{ padding: '10px' }}>{rx.doctor_name}</td>
                    <td style={{ padding: '10px' }}>
                      <strong>{rx.medicine_name}</strong> &bull; {rx.dosage}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: rx.status === 'Dispensed' ? '#dcfce7' : rx.status === 'Verified' ? '#e0f2fe' : '#fef3c7', color: rx.status === 'Dispensed' ? '#15803d' : rx.status === 'Verified' ? '#0369a1' : '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {rx.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button onClick={() => setSelectedRx(rx)} className="btn-primary" style={{ fontSize: '12px', padding: '4px 10px' }}>
                        View & Verify &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PHARMACY & FORMULARY (INR ₹) */}
      {activeTab === 'formulary' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Hospital Pharmacy Formulary & Drug Master</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Standardized drug database with batch tracking, pricing in INR (₹), and regulatory storage specs.
              </p>
            </div>
            <button onClick={() => setShowStockInModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
              <Plus size={15} /> + Add Medicine / Stock-In
            </button>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Brand & Generic Name</th>
                  <th style={{ padding: '10px' }}>Batch & Expiry</th>
                  <th style={{ padding: '10px' }}>Manufacturer</th>
                  <th style={{ padding: '10px' }}>Stock Level</th>
                  <th style={{ padding: '10px' }}>Pricing (INR)</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {formulary.map((med) => (
                  <tr key={med.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{med.brand_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{med.generic_name} ({med.strength})</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600 }}>{med.batch_number}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Exp: {med.expiry_date}</div>
                    </td>
                    <td style={{ padding: '10px', color: '#475569' }}>{med.manufacturer}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 800, color: med.stock_level <= med.reorder_level ? '#ef4444' : '#0f172a' }}>
                        {med.stock_level} units
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Reorder: {med.reorder_level}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 700, color: '#15803d' }}>₹{med.selling_price.toFixed(2)}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Cost: ₹{med.purchase_price.toFixed(2)}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: med.status === 'Healthy' ? '#dcfce7' : med.status === 'Low Stock' ? '#fee2e2' : '#fef3c7', color: med.status === 'Healthy' ? '#15803d' : med.status === 'Low Stock' ? '#b91c1c' : '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {med.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button onClick={() => setSelectedMed(med)} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DISPENSING STATION (Prescription-First Workflow) */}
      {activeTab === 'dispensing' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Dispensary & Verification Station</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Prescription-verified medication fulfillment with real-time stock deduction and digital signature.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800 }}>
                1. Select Prescription to Dispense
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {prescriptions
                  .filter((p) => p.status !== 'Dispensed')
                  .map((rx) => (
                    <div key={rx.id} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: selectedRx?.id === rx.id ? '#e0f2fe' : '#ffffff', cursor: 'pointer' }} onClick={() => setSelectedRx(rx)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#0284c7' }}>{rx.id} &bull; {rx.patient_name}</strong>
                        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {rx.status}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                        Medicine: <strong>{rx.medicine_name}</strong> &bull; Qty: <strong>{rx.quantity}</strong>
                      </p>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Doctor: {rx.doctor_name} ({rx.department})</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Dispensing Action Panel */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800 }}>
                2. Clinical Verification & Issue
              </h3>

              {selectedRx ? (
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <div>Patient: <strong>{selectedRx.patient_name}</strong> ({selectedRx.uhid})</div>
                    <div>Prescription ID: <strong>{selectedRx.id}</strong></div>
                    <div>Medicine: <strong style={{ color: '#0284c7' }}>{selectedRx.medicine_name}</strong></div>
                    <div>Quantity to Dispense: <strong>{selectedRx.quantity} units</strong></div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>SAFETY VERIFICATION CHECKLIST:</div>
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                      <div>✓ Patient identity confirmed via UHID</div>
                      <div>✓ Correct dosage & frequency verified</div>
                      <div>✓ Active batch selected (PANT-902 &bull; Exp: 2027)</div>
                      <div>✓ Zero drug-drug interactions detected</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDispensePrescription(selectedRx)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: 800, marginTop: '8px' }}
                  >
                    ✓ Sign & Dispense Medication (INR ₹)
                  </button>
                </div>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  <Pill size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>Select an active prescription from the left to start dispensing.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. STOCK INVENTORY */}
      {activeTab === 'inventory' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Dispensary Stock & Inventory Control</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Batch-level tracking, reorder automation, and physical inventory reconciliations.
              </p>
            </div>
            <button onClick={() => setShowStockInModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
              <Plus size={15} /> + Stock-In Medicine
            </button>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Medicine</th>
                  <th style={{ padding: '10px' }}>Batch</th>
                  <th style={{ padding: '10px' }}>Supplier</th>
                  <th style={{ padding: '10px' }}>Current Stock</th>
                  <th style={{ padding: '10px' }}>Reorder Level</th>
                  <th style={{ padding: '10px' }}>Expiry</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {formulary.map((med) => (
                  <tr key={med.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800 }}>{med.brand_name}</td>
                    <td style={{ padding: '10px' }}>{med.batch_number}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{med.supplier}</td>
                    <td style={{ padding: '10px', fontWeight: 800 }}>{med.stock_level} units</td>
                    <td style={{ padding: '10px' }}>{med.reorder_level} units</td>
                    <td style={{ padding: '10px' }}>{med.expiry_date}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: med.status === 'Healthy' ? '#dcfce7' : '#fee2e2', color: med.status === 'Healthy' ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {med.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. LOW STOCK & EXPIRY */}
      {activeTab === 'low_stock' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Low Stock & Expiry Surveillance</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Automated reorder triggers and near-expiry quarantined batches.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#ef4444' }}>
                ⚠️ Low Stock Threshold Alerts
              </h3>
              {formulary
                .filter((m) => m.stock_level <= m.reorder_level)
                .map((m) => (
                  <div key={m.id} style={{ padding: '12px', border: '1px solid #fee2e2', borderRadius: '8px', background: '#fef2f2', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{m.brand_name}</strong>
                      <span style={{ color: '#b91c1c', fontWeight: 800 }}>{m.stock_level} / {m.reorder_level} units</span>
                    </div>
                    <p style={{ margin: '4px 0 8px 0', fontSize: '12px', color: '#64748b' }}>Supplier: {m.supplier}</p>
                    <button onClick={() => setShowCreatePOModal(true)} className="btn-primary" style={{ fontSize: '11px', padding: '4px 10px' }}>
                      + Create Replenishment PO
                    </button>
                  </div>
                ))}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#f97316' }}>
                ⏳ Near Expiry Batch Monitor
              </h3>
              {formulary
                .filter((m) => m.status === 'Near Expiry')
                .map((m) => (
                  <div key={m.id} style={{ padding: '12px', border: '1px solid #ffedd5', borderRadius: '8px', background: '#fff7ed', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{m.brand_name} (Batch #{m.batch_number})</strong>
                      <span style={{ color: '#c2410c', fontWeight: 800 }}>Exp: {m.expiry_date}</span>
                    </div>
                    <p style={{ margin: '4px 0 8px 0', fontSize: '12px', color: '#64748b' }}>Stock: {m.stock_level} units remaining</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleRecallBatch(m.batch_number, m.brand_name)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                        Block & Recall
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. CITY-WIDE DRUG NETWORK */}
      {activeTab === 'city_network' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>City-Wide Inter-Hospital Drug Network</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Real-time stock queries across partner hospital dispensaries for critical drug sharing.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { hospital: 'AuraHealth South Metro Hospital', distance: '4.2 km', med: 'Atorvastatin 20mg', available: '420 units', phone: '+91 80 4455 1100' },
                { hospital: 'St. Jude Memorial Super-Specialty', distance: '6.8 km', med: 'Metformin 500mg', available: '850 units', phone: '+91 80 2233 4455' },
                { hospital: 'Apollo Regional Center', distance: '8.1 km', med: 'Pantocid 40mg', available: '1,200 units', phone: '+91 80 5566 7788' }
              ].map((h, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{h.hospital}</strong>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{h.distance}</span>
                  </div>
                  <div style={{ margin: '8px 0', fontSize: '13px' }}>Available: <strong style={{ color: '#15803d' }}>{h.available}</strong> of {h.med}</div>
                  <button onClick={() => alert(`Stock transfer request initiated to ${h.hospital}. Dispatch ticket logged.`)} className="btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '6px' }}>
                    Request Stock Transfer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. DISPENSING HISTORY (INR ₹) */}
      {activeTab === 'history' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Dispensing Transaction Ledger (Read-Only)</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Immutable audit history of all prescription and OTC medication dispensations.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Tx ID</th>
                  <th style={{ padding: '10px' }}>Prescription ID</th>
                  <th style={{ padding: '10px' }}>Patient & UHID</th>
                  <th style={{ padding: '10px' }}>Medicine & Batch</th>
                  <th style={{ padding: '10px' }}>Qty</th>
                  <th style={{ padding: '10px' }}>Amount (INR)</th>
                  <th style={{ padding: '10px' }}>Pharmacist</th>
                  <th style={{ padding: '10px' }}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {dispensingHistory.map((tx) => (
                  <tr key={tx.tx_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{tx.tx_id}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{tx.rx_id}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 700 }}>{tx.patient_name}</div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{tx.uhid}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <strong>{tx.medicine_name}</strong> (Batch #{tx.batch_number})
                    </td>
                    <td style={{ padding: '10px' }}>{tx.quantity}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#15803d' }}>₹{tx.total_amount.toFixed(2)}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{tx.pharmacist}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{tx.date_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. PROCUREMENT & ORDERS */}
      {activeTab === 'procurement' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Procurement, Purchase Orders & Deliveries</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Manage wholesale pharmaceutical orders and receiving inspections.
              </p>
            </div>
            <button onClick={() => setShowCreatePOModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
              <Plus size={15} /> + Create Purchase Order
            </button>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>PO Number</th>
                  <th style={{ padding: '10px' }}>Supplier</th>
                  <th style={{ padding: '10px' }}>Medicine</th>
                  <th style={{ padding: '10px' }}>Quantity</th>
                  <th style={{ padding: '10px' }}>Order Date</th>
                  <th style={{ padding: '10px' }}>Expected</th>
                  <th style={{ padding: '10px' }}>Total (INR)</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.po_number} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{po.po_number}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{po.supplier}</td>
                    <td style={{ padding: '10px' }}>{po.medicine}</td>
                    <td style={{ padding: '10px' }}>{po.quantity} units</td>
                    <td style={{ padding: '10px' }}>{po.date}</td>
                    <td style={{ padding: '10px' }}>{po.expected}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#15803d' }}>₹{po.total_amount.toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: po.status === 'Shipped' ? '#e0f2fe' : '#fef3c7', color: po.status === 'Shipped' ? '#0369a1' : '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. SUPPLIERS & VENDORS */}
      {activeTab === 'suppliers' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Suppliers & Authorized Pharmaceutical Vendors</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Directory of verified pharmaceutical distributors and GST compliance.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Supplier Name</th>
                  <th style={{ padding: '10px' }}>GSTIN</th>
                  <th style={{ padding: '10px' }}>Contact Phone</th>
                  <th style={{ padding: '10px' }}>Official Email</th>
                  <th style={{ padding: '10px' }}>SKUs Supplied</th>
                  <th style={{ padding: '10px' }}>Outstanding</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800 }}>{s.name}</td>
                    <td style={{ padding: '10px', color: '#0284c7' }}>{s.gstin}</td>
                    <td style={{ padding: '10px' }}>{s.phone}</td>
                    <td style={{ padding: '10px' }}>{s.email}</td>
                    <td style={{ padding: '10px' }}>{s.medicines_count} Medicines</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: s.outstanding > 0 ? '#b45309' : '#15803d' }}>
                      ₹{s.outstanding.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. STOCK TRANSFERS */}
      {activeTab === 'transfers' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Inter-Departmental & Satellite Stock Transfers</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Internal drug allocations between central dispensary, ICU bays, and emergency satellites.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Transfer ID</th>
                  <th style={{ padding: '10px' }}>Origin</th>
                  <th style={{ padding: '10px' }}>Destination</th>
                  <th style={{ padding: '10px' }}>Medicine & Batch</th>
                  <th style={{ padding: '10px' }}>Quantity</th>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockTransfers.map((trf) => (
                  <tr key={trf.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{trf.id}</td>
                    <td style={{ padding: '10px' }}>{trf.from}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{trf.to}</td>
                    <td style={{ padding: '10px' }}>{trf.medicine} ({trf.batch})</td>
                    <td style={{ padding: '10px' }}>{trf.quantity} units</td>
                    <td style={{ padding: '10px' }}>{trf.date}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {trf.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 12. RETURNS & RECALL */}
      {activeTab === 'returns' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Medication Returns & Quality Recalls</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Patient returns, vendor batch returns, and mandatory pharmacovigilance recalls.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Return ID</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Medicine & Batch</th>
                  <th style={{ padding: '10px' }}>Quantity</th>
                  <th style={{ padding: '10px' }}>Reason</th>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {returnsList.map((ret) => (
                  <tr key={ret.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{ret.id}</td>
                    <td style={{ padding: '10px' }}>{ret.type}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{ret.medicine} ({ret.batch})</td>
                    <td style={{ padding: '10px' }}>{ret.quantity} units</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{ret.reason}</td>
                    <td style={{ padding: '10px' }}>{ret.date}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {ret.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 13. PATIENT MEDICATION PROFILE */}
      {activeTab === 'patient_profile' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Patient Medication Profile & History</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Search patient EHR for active prescriptions, past dispensations, and allergy safety.
            </p>
          </div>

          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
              <div>Patient: <strong style={{ color: '#0f172a' }}>James Robertson</strong> (Age 58 &bull; Male)</div>
              <div>UHID: <strong style={{ color: '#0284c7' }}>UHID-2026-884920</strong></div>
              <div>Allergies: <strong style={{ color: '#10b981' }}>None known</strong></div>
              <div>Attending Physician: <strong>Dr. Sarah Jenkins (Cardiology)</strong></div>
            </div>

            <h4 style={{ margin: '20px 0 10px 0', fontSize: '15px' }}>Active Prescribed Medications:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Pantocid 40mg</strong> &bull; 1 tablet OD (Before breakfast) &bull; Qty: 10 units
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Prescribed on 31-Aug-2026 by Dr. Sarah Jenkins</div>
                </div>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  ✓ Dispensed Today
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14. PHARMACY REPORTS (INR ₹) */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Dispensary Financial & Inventory Reports</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Revenue reconciliation in INR (₹), stock turnover rate, and tax reports.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TOTAL REVENUE</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#10b981' }}>₹1,100.00</h2>
              <span style={{ fontSize: '11px', color: '#10b981' }}>Today's Cleared Invoices</span>
            </div>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0284c7', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TOTAL STOCK VALUATION</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#0284c7' }}>₹48,250.00</h2>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Formulary Inventory Value</span>
            </div>
          </div>
        </div>
      )}

      {/* 15. NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Pharmacy Alerts & Notifications</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                Surveillance alerts for low stock, expiring batches, and electronic prescriptions.
              </p>
            </div>
            <button onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              Mark All Read
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div key={n.id} className="card" style={{ padding: '16px', borderLeft: n.type === 'Low Stock' ? '4px solid #ef4444' : '4px solid #0284c7', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {n.type}
                  </span>
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>{n.message}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{n.time}</div>
                </div>
                {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 16. PHARMACY AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Pharmacy Dispensary Audit Trail (Read-Only)</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Immutable institutional log of all stock movements, prescription verifications, and drug dispensations.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                  <th style={{ padding: '10px' }}>User & Role</th>
                  <th style={{ padding: '10px' }}>Action</th>
                  <th style={{ padding: '10px' }}>Prescription ID</th>
                  <th style={{ padding: '10px' }}>UHID</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((l, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', color: '#64748b', fontSize: '12px' }}>{l.timestamp}</td>
                    <td style={{ padding: '10px' }}>
                      <strong>{l.user}</strong> &bull; <span style={{ fontSize: '11px', color: '#0284c7' }}>{l.role}</span>
                    </td>
                    <td style={{ padding: '10px' }}>{l.action}</td>
                    <td style={{ padding: '10px', color: '#0284c7', fontWeight: 600 }}>{l.rx_id}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{l.uhid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prescription Detail & Verification Modal */}
      {selectedRx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '560px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  ELECTRONIC PRESCRIPTION VERIFICATION
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>{selectedRx.id}</h3>
              </div>
              <button onClick={() => setSelectedRx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                <div>Patient Name: <strong>{selectedRx.patient_name}</strong></div>
                <div>UHID: <strong>{selectedRx.uhid}</strong></div>
                <div>Prescribed By: <strong>{selectedRx.doctor_name}</strong> ({selectedRx.department})</div>
                <div>Date: <strong>{selectedRx.date}</strong></div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{selectedRx.medicine_name}</div>
                <div style={{ marginTop: '4px', color: '#475569' }}>Dosage & Instructions: <strong>{selectedRx.dosage}</strong></div>
                <div style={{ marginTop: '4px' }}>Prescribed Quantity: <strong>{selectedRx.quantity} units</strong></div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>Clinical Purpose: {selectedRx.notes}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Status: <strong>{selectedRx.status}</strong>
                </span>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedRx.status === 'Pending Verification' && (
                    <button onClick={() => handleVerifyPrescription(selectedRx.id)} className="btn-secondary">
                      ✓ Verify Prescription
                    </button>
                  )}
                  {selectedRx.status !== 'Dispensed' && (
                    <button onClick={() => handleDispensePrescription(selectedRx)} className="btn-primary">
                      Dispense Medication (INR ₹)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock-In Modal */}
      {showStockInModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '560px', padding: '24px', background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>➕ Add / Stock-In Medicine Batch</h3>
              <button onClick={() => setShowStockInModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Brand Name *</label>
                  <input type="text" required placeholder="e.g. Pantocid 40mg" value={stockInForm.brand_name} onChange={(e) => setStockInForm({ ...stockInForm, brand_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Generic Name *</label>
                  <input type="text" required placeholder="e.g. Pantoprazole Sodium" value={stockInForm.generic_name} onChange={(e) => setStockInForm({ ...stockInForm, generic_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Batch Number *</label>
                    <input type="text" required value={stockInForm.batch_number} onChange={(e) => setStockInForm({ ...stockInForm, batch_number: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Expiry Date *</label>
                    <input type="date" required value={stockInForm.expiry_date} onChange={(e) => setStockInForm({ ...stockInForm, expiry_date: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Quantity *</label>
                    <input type="number" required value={stockInForm.quantity} onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Cost Price (₹)</label>
                    <input type="number" step="0.1" required value={stockInForm.purchase_price} onChange={(e) => setStockInForm({ ...stockInForm, purchase_price: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Selling Price (₹)</label>
                    <input type="number" step="0.1" required value={stockInForm.selling_price} onChange={(e) => setStockInForm({ ...stockInForm, selling_price: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button type="button" onClick={() => setShowStockInModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Complete Stock-In</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showCreatePOModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '520px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>🛒 Create Wholesale Purchase Order</h3>
              <button onClick={() => setShowCreatePOModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Select Supplier</label>
                  <select value={stockInForm.supplier} onChange={(e) => setStockInForm({ ...stockInForm, supplier: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>Cipla Healthcare Direct</option>
                    <option>MedPharma Logistics Central</option>
                    <option>Sun Pharma Distribution Hub</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Select Medicine SKU</label>
                  <select value={stockInForm.brand_name} onChange={(e) => setStockInForm({ ...stockInForm, brand_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>Pantocid 40mg</option>
                    <option>Metformin 500mg</option>
                    <option>Amoxicillin 500mg</option>
                    <option>Atorvastatin 20mg</option>
                    <option>Paracetamol 650mg</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button type="button" onClick={() => setShowCreatePOModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Generate Purchase Order</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
