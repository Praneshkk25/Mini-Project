import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, User, Stethoscope, Plus, 
  Send, RefreshCw, Printer, X, Sparkles, Building2, AlertTriangle, Eye, ShieldCheck, ChevronRight
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const AVAILABLE_DOCTORS = [
  { id: 'DOC-CAR-101', name: 'Dr. Sarah Jenkins', dept: 'Cardiology' },
  { id: 'DOC-NEU-102', name: 'Dr. Aris Thalia', dept: 'Neurology' },
  { id: 'DOC-ORT-103', name: 'Dr. Michael Chen', dept: 'Orthopedics' },
  { id: 'DOC-PED-104', name: 'Dr. Priya Sundaram', dept: 'Pediatrics' },
  { id: 'DOC-MED-105', name: 'Dr. Priya Sharma', dept: 'General Medicine' },
  { id: 'DOC-EME-106', name: 'Dr. Vikram Malhotra', dept: 'Emergency' }
];

export default function DischargeDeskManager({ user }) {
  const [activeView, setActiveView] = useState('list'); // 'list' | 'draft'
  const [summaries, setSummaries] = useState([]);
  const [inpatients, setInpatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedSummaryDoc, setSelectedSummaryDoc] = useState(null);

  // Form State
  const [isCustomPatient, setIsCustomPatient] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: 'PT-1002',
    patient_name: 'Eleanor Vance',
    uhid: 'UHID-2026-99201',
    age: 52,
    gender: 'Female',
    bed_number: 'ICU-02',
    department: 'Cardiology',
    doctor_name: 'Dr. Sarah Jenkins',
    doctor_id: 'DOC-CAR-101',
    admission_date: '2026-10-28',
    discharge_date: new Date().toISOString().split('T')[0],
    chief_complaint: 'Retrosternal chest tightness radiating to left jaw, diaphoresis on exertion.',
    primary_diagnosis: 'Acute Coronary Syndrome - Non-STEMI (Resolved)',
    secondary_diagnosis: 'Essential Hypertension (Stage 2), Dyslipidemia',
    hospital_course: 'Patient admitted via Emergency. Bedside ECG showed ST depressions in leads V4-V6. Cardiac enzymes elevated (Troponin-I 0.85 ng/mL). Coronary angiogram performed. Patient was initiated on dual antiplatelet therapy (DAPT), high-intensity statin, and beta-blockers. Vitals remained stable over last 48 hours without anginal recurrence.',
    condition_at_discharge: 'Stable',
    vitals: {
      pulse: 72,
      bp: '122/78',
      spo2: 98,
      temp: 36.7,
      respRate: 16
    },
    investigations: [
      { test: 'Serum Troponin-I', result: '0.02 ng/mL (Normalized)', normal: '< 0.04' },
      { test: '12-Lead ECG', result: 'Normal Sinus Rhythm, resolved ST depression', normal: 'Normal' },
      { test: '2D Echocardiogram', result: 'LVEF 55%, Mild anterior hypokinesia', normal: '> 50%' }
    ],
    procedures: ['Coronary Angiography', 'Femoral Artery Hemostasis'],
    receptionist_notes: 'Drafted at Reception Desk. All operational billing cleared. Forwarded to Attending Consultant for final medication prescribing and electronic sign-off.'
  });

  const [newInv, setNewInv] = useState({ test: '', result: '', normal: '' });

  useEffect(() => {
    fetchSummaries();
    fetchInpatients();

    const interval = setInterval(() => {
      fetchSummaries(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const fetchSummaries = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/discharge/summary/list`);
      if (res.ok) {
        const data = await res.json();
        setSummaries(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error fetching discharge summaries:', e);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const fetchInpatients = async () => {
    try {
      const res = await fetch(`${API_BASE}/discharge/readiness`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setInpatients(data);
        }
      }
    } catch (e) {
      console.warn('Error fetching inpatients:', e);
    }
  };

  const handleSelectInpatient = (pid) => {
    const pt = inpatients.find(p => p.patient_id === pid);
    if (!pt) return;
    setFormData(prev => ({
      ...prev,
      patient_id: pt.patient_id,
      patient_name: pt.patient_name,
      uhid: pt.uhid || `UHID-2026-${pt.patient_id.replace('PT-', '')}`,
      age: pt.age || 45,
      gender: pt.gender || 'Female',
      bed_number: pt.bed_number || 'ICU-02',
      primary_diagnosis: pt.diagnosis || prev.primary_diagnosis
    }));
  };

  const handleAddInvestigation = () => {
    if (!newInv.test.trim() || !newInv.result.trim()) return;
    setFormData(prev => ({
      ...prev,
      investigations: [...prev.investigations, { ...newInv }]
    }));
    setNewInv({ test: '', result: '', normal: '' });
  };

  const handleRemoveInvestigation = (idx) => {
    setFormData(prev => ({
      ...prev,
      investigations: prev.investigations.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmitDraft = async (e) => {
    e.preventDefault();
    if (!formData.patient_name.trim()) {
      alert('Please enter or select a patient name.');
      return;
    }
    if (!formData.doctor_name) {
      alert('Please select an attending doctor to forward the summary to.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/discharge/summary/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          created_by_name: user?.name || 'Elena Rostova (Receptionist)'
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Discharge Summary forwarded to ${formData.doctor_name}! Doctor can now add prescriptions & sign in Doctor Portal.`);
        setActiveView('list');
        fetchSummaries();
      } else {
        const err = await res.json();
        alert('Failed to draft summary: ' + (err.detail || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while forwarding summary.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#0f172a',
          color: '#38bdf8',
          border: '1px solid #0284c7',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={16} color="#38bdf8" />
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Discharge Summary Desk & Doctor Routing
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Draft discharge summary, forward to attending doctor for clinical review & prescriptions, and track approval.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveView('list')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              background: activeView === 'list' ? '#0284c7' : '#f1f5f9',
              color: activeView === 'list' ? '#fff' : '#475569',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📋 All Summaries ({summaries.length})
          </button>

          <button
            onClick={() => setActiveView('draft')}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Initiate / Draft Discharge Summary
          </button>
        </div>
      </div>

      {/* VIEW 1: SUMMARIES LIST */}
      {activeView === 'list' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Discharge Summary Pipeline & Doctor Review Status
            </h3>
            <button onClick={() => fetchSummaries(true)} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading discharge records...</p>
          ) : summaries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ margin: 0, color: '#0f172a' }}>No Discharge Summaries Drafted Yet</h4>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Click "Initiate / Draft Discharge Summary" to create one and send to a doctor.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                    <th style={{ padding: '10px' }}>Summary ID</th>
                    <th style={{ padding: '10px' }}>Patient Details</th>
                    <th style={{ padding: '10px' }}>Bed / Dept</th>
                    <th style={{ padding: '10px' }}>Attending Doctor</th>
                    <th style={{ padding: '10px' }}>Doctor Review Status</th>
                    <th style={{ padding: '10px' }}>Prescriptions</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => {
                    const isApproved = s.status === 'APPROVED_BY_DOCTOR';
                    const medsCount = Array.isArray(s.medications) ? s.medications.length : 0;
                    return (
                      <tr key={s.summary_id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s' }}>
                        <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>
                          {s.summary_id}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.patient_name}</div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {s.patient_id} &bull; {s.age}Y / {s.gender}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontWeight: 700, color: '#334155' }}>{s.bed_number || 'ICU-02'}</span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{s.department || 'Cardiology'}</div>
                        </td>
                        <td style={{ padding: '10px', color: '#0284c7', fontWeight: 700 }}>
                          👨‍⚕️ {s.doctor_name}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isApproved ? (
                            <span style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 size={12} /> Approved & Signed by Doctor
                            </span>
                          ) : (
                            <span style={{
                              background: '#fef3c7',
                              color: '#b45309',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Clock size={12} /> Sent to Doctor (Pending Review)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                            💊 {medsCount} Prescribed Drugs
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setSelectedSummaryDoc(s)}
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={12} /> View Document
                            </button>
                            {isApproved && (
                              <button
                                onClick={() => setSelectedSummaryDoc(s)}
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Printer size={12} /> Print
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DRAFT DISCHARGE SUMMARY FORM */}
      {activeView === 'draft' && (
        <div className="card" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                ✍️ Initiate / Draft Discharge Summary
              </h2>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '3px 0 0 0' }}>
                Fill initial inpatient details and forward to attending doctor for prescription charting & electronic sign-off.
              </p>
            </div>
            <button onClick={() => setActiveView('list')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitDraft}>
            {/* Step A: Patient Selection / Typing */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  1. Select Inpatient or Type Custom Patient
                </span>
                <label style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isCustomPatient}
                    onChange={(e) => setIsCustomPatient(e.target.checked)}
                  />
                  Type Custom Patient Manually
                </label>
              </div>

              {!isCustomPatient ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Select from Active Inpatients:
                  </label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => handleSelectInpatient(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {inpatients.map((pt) => (
                      <option key={pt.patient_id} value={pt.patient_id}>
                        {pt.patient_name} ({pt.patient_id}) — Bed: {pt.bed_number || 'ICU-02'} ({pt.gender}, {pt.age}Y)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>Patient Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>MRN / Patient ID</label>
                    <input
                      type="text"
                      placeholder="e.g. PT-1099"
                      value={formData.patient_id}
                      onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>Age & Gender</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="number"
                        placeholder="Age"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 45 })}
                        style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>Bed / Room Number</label>
                    <input
                      type="text"
                      placeholder="e.g. GW-204"
                      value={formData.bed_number}
                      onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step B: Attending Doctor Selection */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                2. Route to Attending Physician (Doctor to Review & Prescribe) *
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {AVAILABLE_DOCTORS.map((doc) => {
                  const isSel = formData.doctor_name === doc.name;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setFormData({ ...formData, doctor_name: doc.name, doctor_id: doc.id, department: doc.dept })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: isSel ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: isSel ? '#f0f9ff' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{doc.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.dept}</div>
                      </div>
                      {isSel && <CheckCircle2 size={16} color="#0284c7" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step C: Admission & Clinical Diagnosis Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Admission Date
                </label>
                <input
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Expected Discharge Date
                </label>
                <input
                  type="date"
                  value={formData.discharge_date}
                  onChange={(e) => setFormData({ ...formData, discharge_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Chief Complaints / Reason for Admission
                </label>
                <input
                  type="text"
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                  placeholder="e.g. Acute chest pain, shortness of breath on exertion"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Primary Discharge Diagnosis *
                </label>
                <input
                  type="text"
                  value={formData.primary_diagnosis}
                  onChange={(e) => setFormData({ ...formData, primary_diagnosis: e.target.value })}
                  placeholder="e.g. Acute Coronary Syndrome - Resolved"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Secondary Diagnosis / Comorbidities
                </label>
                <input
                  type="text"
                  value={formData.secondary_diagnosis}
                  onChange={(e) => setFormData({ ...formData, secondary_diagnosis: e.target.value })}
                  placeholder="e.g. Type 2 Diabetes Mellitus, Hypertension"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Hospital Inpatient Course & Treatment Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.hospital_course}
                  onChange={(e) => setFormData({ ...formData, hospital_course: e.target.value })}
                  placeholder="Describe patient course during hospitalization, interventions, and condition trajectory..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>
            </div>

            {/* Step D: Initial Lab Investigations */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                3. Diagnostic Investigations & Lab Results
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                {formData.investigations.map((inv, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    <div>
                      <strong>{inv.test}:</strong> <span style={{ color: '#0284c7', fontWeight: 700 }}>{inv.result}</span> (Normal: {inv.normal})
                    </div>
                    <button type="button" onClick={() => handleRemoveInvestigation(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 800 }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Test Name (e.g. Serum Creatinine)"
                  value={newInv.test}
                  onChange={(e) => setNewInv({ ...newInv, test: e.target.value })}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
                <input
                  type="text"
                  placeholder="Result (e.g. 0.9 mg/dL)"
                  value={newInv.result}
                  onChange={(e) => setNewInv({ ...newInv, result: e.target.value })}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
                <input
                  type="text"
                  placeholder="Normal range"
                  value={newInv.normal}
                  onChange={(e) => setNewInv({ ...newInv, normal: e.target.value })}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
                <button
                  type="button"
                  onClick={handleAddInvestigation}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  + Add Lab
                </button>
              </div>
            </div>

            {/* Note banner explaining the workflow */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#1e40af'
            }}>
              ℹ️ <strong>Workflow Protocol:</strong> Once you click submit, this summary will be forwarded directly to <strong>{formData.doctor_name}</strong>'s portal. The doctor will review these notes, <strong>add the prescribed discharge medications</strong>, and provide electronic clinical authorization.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Forwarding to Attending Doctor...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit & Forward to {formData.doctor_name} for Review & Prescriptions
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedSummaryDoc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setSelectedSummaryDoc(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              padding: '30px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                  🏥 AuraHealth Central Hospital — Official Discharge Summary
                </h2>
                <span style={{ fontSize: '11px', color: '#64748b' }}>NABH & JCI Accredited &bull; Electronic Health Record (EHR) Copy</span>
              </div>
              <button
                onClick={() => setSelectedSummaryDoc(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            {/* Document Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '18px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Patient Name</span>
                <strong style={{ color: '#0f172a', fontSize: '13px' }}>{selectedSummaryDoc.patient_name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>MRN / UHID</span>
                <strong style={{ color: '#0284c7' }}>{selectedSummaryDoc.patient_id}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Age / Gender</span>
                <strong>{selectedSummaryDoc.age}Y / {selectedSummaryDoc.gender}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Bed & Ward</span>
                <strong>{selectedSummaryDoc.bed_number} ({selectedSummaryDoc.department})</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Admission Date</span>
                <strong>{selectedSummaryDoc.admission_date}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Discharge Date</span>
                <strong>{selectedSummaryDoc.discharge_date}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Attending Consultant</span>
                <strong style={{ color: '#0284c7' }}>{selectedSummaryDoc.doctor_name}</strong>
              </div>
            </div>

            {/* Clinical Diagnosis Section */}
            <div style={{ marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Primary Discharge Diagnosis:</div>
              <div style={{ background: '#f0f9ff', padding: '8px 12px', borderRadius: '6px', borderLeft: '4px solid #0284c7', color: '#0369a1', fontWeight: 700 }}>
                {selectedSummaryDoc.primary_diagnosis}
              </div>
              {selectedSummaryDoc.secondary_diagnosis && (
                <div style={{ marginTop: '6px', color: '#475569' }}>
                  <strong>Secondary Diagnoses:</strong> {selectedSummaryDoc.secondary_diagnosis}
                </div>
              )}
            </div>

            {/* Hospital Course */}
            <div style={{ marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Inpatient Hospital Course & Interventions:</div>
              <p style={{ margin: 0, color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
                {selectedSummaryDoc.hospital_course}
              </p>
            </div>

            {/* Doctor's Prescribed Discharge Medications Table */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                  💊 Physician Prescribed Discharge Medications
                </div>
                {selectedSummaryDoc.status === 'APPROVED_BY_DOCTOR' ? (
                  <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                    Verified by Attending Clinician
                  </span>
                ) : (
                  <span style={{ fontSize: '10px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                    Pending Doctor Prescriptions
                  </span>
                )}
              </div>

              {Array.isArray(selectedSummaryDoc.medications) && selectedSummaryDoc.medications.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', border: '1px solid #e2e8f0' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                      <th style={{ padding: '8px' }}>Medicine</th>
                      <th style={{ padding: '8px' }}>Dosage</th>
                      <th style={{ padding: '8px' }}>Frequency</th>
                      <th style={{ padding: '8px' }}>Duration</th>
                      <th style={{ padding: '8px' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSummaryDoc.medications.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px', fontWeight: 800, color: '#0f172a' }}>{m.drug}</td>
                        <td style={{ padding: '8px' }}>{m.dose}</td>
                        <td style={{ padding: '8px', color: '#0284c7', fontWeight: 600 }}>{m.frequency}</td>
                        <td style={{ padding: '8px' }}>{m.duration}</td>
                        <td style={{ padding: '8px', color: '#64748b' }}>{m.instructions || 'With water'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '6px', fontSize: '12px', color: '#92400e', fontStyle: 'italic' }}>
                  No discharge medications entered yet. Awaiting attending physician prescription entry in Doctor Portal.
                </div>
              )}
            </div>

            {/* Diet & Follow-Up */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                <strong>Diet & Activity Advice:</strong>
                <p style={{ margin: '3px 0 0 0', color: '#475569' }}>
                  {selectedSummaryDoc.diet_lifestyle_instructions || 'Low sodium, low cholesterol diet. Gradual progressive walking.'}
                </p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                <strong>Next Clinic Follow-Up:</strong>
                <p style={{ margin: '3px 0 0 0', color: '#0284c7', fontWeight: 700 }}>
                  Date: {selectedSummaryDoc.follow_up_date || '2026-11-17'} &bull; {selectedSummaryDoc.follow_up_dept || 'Cardiology OPD'}
                </p>
              </div>
            </div>

            {/* Electronic Signature Badge */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              borderRadius: '10px',
              background: selectedSummaryDoc.status === 'APPROVED_BY_DOCTOR' ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${selectedSummaryDoc.status === 'APPROVED_BY_DOCTOR' ? '#bbf7d0' : '#fde68a'}`
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedSummaryDoc.status === 'APPROVED_BY_DOCTOR' ? '✅ Certified Electronic Physician Signature' : '⏳ Clinical Signature Pending'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {selectedSummaryDoc.status === 'APPROVED_BY_DOCTOR'
                    ? `Signed by ${selectedSummaryDoc.signed_by_doctor || selectedSummaryDoc.doctor_name} on ${selectedSummaryDoc.signed_at || 'Today'}`
                    : `Currently in review queue for ${selectedSummaryDoc.doctor_name}`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={14} /> Print Official Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

