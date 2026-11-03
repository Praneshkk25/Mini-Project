import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, Building2, User, FileText, 
  Send, RefreshCw, Activity, ShieldCheck, Check, Sparkles, Stethoscope, ChevronRight,
  Plus, Trash2, Edit3, Save, Printer, ArrowLeft, Pill, FileSignature, CheckCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const COMMON_DRUGS_PRESETS = [
  { medicine_name: 'Tab. Aspirin', dosage: '75 mg', frequency: 'OD (Once daily)', duration: '30 days', instructions: 'Take after lunch' },
  { medicine_name: 'Tab. Atorvastatin', dosage: '40 mg', frequency: 'HS (At bedtime)', duration: '30 days', instructions: 'Take with warm water' },
  { medicine_name: 'Tab. Metoprolol Tartrate', dosage: '25 mg', frequency: 'BD (Twice daily)', duration: '14 days', instructions: 'Monitor pulse before dose' },
  { medicine_name: 'Tab. Pantoprazole', dosage: '40 mg', frequency: 'OD (ac - Empty stomach)', duration: '14 days', instructions: 'Take 30 mins before breakfast' },
  { medicine_name: 'Cap. Amoxicillin-Clavulanate', dosage: '625 mg', frequency: 'BD (Twice daily)', duration: '5 days', instructions: 'Take after meals' },
  { medicine_name: 'Tab. Paracetamol', dosage: '650 mg', frequency: 'SOS (As needed)', duration: '5 days', instructions: 'Take for pain or fever > 100°F' }
];

export default function DischargeApprovalView({ user, onNavigate }) {
  const doctorName = user?.name || 'Dr. Sarah Jenkins';
  const [activeMainTab, setActiveMainTab] = useState('forwarded'); // 'forwarded' | 'readiness' | 'approved'
  
  // Forwarded Summaries State
  const [summaries, setSummaries] = useState([]);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null); // The summary being actively reviewed/edited
  const [editFormData, setEditFormData] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState(null);

  // Operational Readiness State (Module 2)
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('PT-1002');
  const [readinessData, setReadinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingPillar, setUpdatingPillar] = useState(false);
  const [signOffNotes, setSignOffNotes] = useState({
    diagnosis: 'Acute Coronary Syndrome - Non-STEMI (Resolved)',
    meds: 'Tab. Aspirin 75mg OD, Tab. Atorvastatin 40mg HS, Tab. Metoprolol 25mg BD',
    instructions: 'Salt-restricted diet (<3g/day). Avoid heavy lifting for 2 weeks. Walk 20 mins daily.'
  });
  const [signOffSuccess, setSignOffSuccess] = useState(null);
  const [signing, setSigning] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // 1. Fetch live forwarded summaries from Reception Desk
  const fetchSummaries = async () => {
    try {
      const res = await fetch(`${API_BASE}/discharge/summary/list`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSummaries(data);
        }
      }
    } catch (e) {
      console.warn('Error fetching discharge summaries:', e);
    }
  };

  useEffect(() => {
    fetchSummaries();
    fetchInpatientList();
    // 3s interval polling so doctor immediately sees when reception forwards a summary
    const timer = setInterval(fetchSummaries, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientReadiness(selectedPatientId);
    }
  }, [selectedPatientId]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Operational Readiness APIs
  const fetchInpatientList = async () => {
    try {
      const res = await fetch(`${API_BASE}/discharge/readiness`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPatients(data);
          if (!selectedPatientId || !data.some(p => p.patient_id === selectedPatientId)) {
            setSelectedPatientId(data[0].patient_id);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load inpatients for discharge:', e);
    }
  };

  const fetchPatientReadiness = async (pid) => {
    setLoading(true);
    setSignOffSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/discharge/readiness/${pid}`);
      if (res.ok) {
        const data = await res.json();
        setReadinessData(data);
      }
    } catch (e) {
      console.warn('Error fetching discharge readiness:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePillar = async (pillarName, newValue) => {
    setUpdatingPillar(true);
    try {
      const res = await fetch(`${API_BASE}/discharge/readiness/${selectedPatientId}/update-pillar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillar: pillarName, value: newValue })
      });
      if (res.ok) {
        showToast(`Updated ${pillarName} to "${newValue}"`);
        await fetchPatientReadiness(selectedPatientId);
        await fetchInpatientList();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingPillar(false);
    }
  };

  const handleApproveSignOff = async () => {
    if (!signOffNotes.diagnosis) {
      alert('Please enter primary discharge diagnosis.');
      return;
    }
    setSigning(true);
    try {
      const res = await fetch(`${API_BASE}/discharge/approve-signoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          doctor_name: doctorName,
          primary_diagnosis: signOffNotes.diagnosis,
          discharge_meds: signOffNotes.meds,
          home_instructions: signOffNotes.instructions
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSignOffSuccess(data);
        showToast(`Discharge Approved! Patient enrolled into Module 3 AI Remote RPM.`);
        await fetchPatientReadiness(selectedPatientId);
        await fetchSummaries();
      }
    } catch (e) {
      console.error('Sign-off failed:', e);
      alert('Error during discharge approval: ' + e.message);
    } finally {
      setSigning(false);
    }
  };

  // -------------------------------------------------------------
  // Doctor Clinical Review & Prescribing Handlers
  // -------------------------------------------------------------
  const handleOpenReview = (sum) => {
    setSelectedSummary(sum);
    setApprovalResult(null);
    // Initialize editable form
    const medsList = Array.isArray(sum.medications) && sum.medications.length > 0 
      ? sum.medications 
      : [
          { medicine_name: 'Tab. Aspirin', dosage: '75 mg', frequency: 'OD (Once daily)', duration: '30 days', instructions: 'Take after food' },
          { medicine_name: 'Tab. Atorvastatin', dosage: '40 mg', frequency: 'HS (Bedtime)', duration: '30 days', instructions: 'Take with warm water' }
        ];

    setEditFormData({
      primary_diagnosis: sum.primary_diagnosis || '',
      secondary_diagnosis: sum.secondary_diagnosis || '',
      hospital_course: sum.hospital_course || '',
      condition_at_discharge: sum.condition_at_discharge || 'Clinically Fit & Stable',
      medications: medsList,
      diet_lifestyle_instructions: sum.diet_lifestyle_instructions || 'Low sodium, low saturated fat diet. Mild walking 20 mins/day. Avoid strenuous weight lifting for 2 weeks.',
      follow_up_date: sum.follow_up_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      follow_up_dept: sum.follow_up_dept || sum.department || 'Cardiology OPD',
      doctor_notes: sum.doctor_notes || `Discharge approved by attending physician ${doctorName}. Patient hemodynamically stable.`
    });
  };

  const handleAddMedicationRow = () => {
    setEditFormData({
      ...editFormData,
      medications: [
        ...editFormData.medications,
        { medicine_name: '', dosage: '', frequency: 'OD (Once daily)', duration: '14 days', instructions: 'Take after meals' }
      ]
    });
  };

  const handleAddPresetDrug = (preset) => {
    setEditFormData({
      ...editFormData,
      medications: [...editFormData.medications, { ...preset }]
    });
    showToast(`Added ${preset.medicine_name} to prescription chart`);
  };

  const handleUpdateMedRow = (index, field, val) => {
    const updated = [...editFormData.medications];
    updated[index] = { ...updated[index], [field]: val };
    setEditFormData({ ...editFormData, medications: updated });
  };

  const handleRemoveMedRow = (index) => {
    const updated = editFormData.medications.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, medications: updated });
  };

  const handleSaveDoctorEdit = async () => {
    if (!selectedSummary) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE}/discharge/summary/${selectedSummary.summary_id}/doctor-edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        showToast('Prescriptions and clinical edits saved successfully!');
        await fetchSummaries();
      } else {
        const err = await res.json();
        alert('Failed to save changes: ' + (err.detail || 'Server error'));
      }
    } catch (e) {
      alert('Network error saving changes: ' + e.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleApproveAndSign = async () => {
    if (!selectedSummary) return;
    if (!editFormData.primary_diagnosis.trim()) {
      alert('Please enter a Primary Diagnosis before authorizing discharge.');
      return;
    }
    if (editFormData.medications.length === 0) {
      if (!confirm('No discharge medications are currently charted. Do you wish to proceed without prescriptions?')) {
        return;
      }
    }

    setApproving(true);
    try {
      // 1. First save all clinical edits and prescribed medications
      await fetch(`${API_BASE}/discharge/summary/${selectedSummary.summary_id}/doctor-edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      // 2. Clinically authorize & electronically sign
      const res = await fetch(`${API_BASE}/discharge/summary/${selectedSummary.summary_id}/doctor-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_name: doctorName,
          doctor_notes: editFormData.doctor_notes
        })
      });

      if (res.ok) {
        const data = await res.json();
        setApprovalResult(data);
        showToast(`Discharge Summary Officially Approved & Signed by ${doctorName}!`);
        await fetchSummaries();
        await fetchInpatientList();
      } else {
        const err = await res.json();
        alert('Approval failed: ' + (err.detail || 'Server error'));
      }
    } catch (e) {
      alert('Network error approving summary: ' + e.message);
    } finally {
      setApproving(false);
    }
  };

  const pendingSummaries = summaries.filter(s => s.status === 'PENDING_DOCTOR_REVIEW');
  const approvedSummaries = summaries.filter(s => s.status === 'APPROVED_BY_DOCTOR');

  const score = readinessData?.readiness_score ?? 82;
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const pillars = readinessData?.pillars || {};

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Physician Discharge Approvals & Clinical Prescribing Hub
            </h1>
            <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
              Module 2 Operations
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Review summaries forwarded by reception desk, chart discharge prescriptions, and electronically authorize sign-off
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
            🟢 Auto-Sync Active (3s)
          </span>
          <button
            onClick={() => { fetchSummaries(); fetchInpatientList(); if (selectedPatientId) fetchPatientReadiness(selectedPatientId); }}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh All
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px',
        background: '#ffffff',
        padding: '6px 12px 0',
        borderRadius: '12px 12px 0 0'
      }}>
        <button
          onClick={() => { setActiveMainTab('forwarded'); setSelectedSummary(null); }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeMainTab === 'forwarded' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeMainTab === 'forwarded' ? '#0284c7' : '#64748b',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📥 Forwarded by Reception (Pending Doctor Review & Prescriptions)</span>
          {pendingSummaries.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', padding: '1px 7px', borderRadius: '10px' }}>
              {pendingSummaries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveMainTab('readiness'); setSelectedSummary(null); }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeMainTab === 'readiness' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeMainTab === 'readiness' ? '#0284c7' : '#64748b',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📊 Intelligent Discharge Readiness Score (4 Pillars)</span>
        </button>

        <button
          onClick={() => { setActiveMainTab('approved'); setSelectedSummary(null); }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeMainTab === 'approved' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeMainTab === 'approved' ? '#0284c7' : '#64748b',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>✅ Approved & Electronically Signed Summaries Archive ({approvedSummaries.length})</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: FORWARDED SUMMARIES - PENDING DOCTOR REVIEW & PRESCRIBING */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'forwarded' && (
        <div>
          {/* Active Clinical Editor Modal / Panel when a summary is selected */}
          {selectedSummary && editFormData ? (
            <div className="card" style={{ padding: '24px', marginBottom: '24px', borderTop: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setSelectedSummary(null)}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#475569' }}
                  >
                    <ArrowLeft size={14} /> Back to List
                  </button>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      Clinical Review & Discharge Prescribing Suite
                    </h2>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Summary #{selectedSummary.summary_id} &bull; Forwarded by Reception ({selectedSummary.receptionist_notes || 'Routine clearance request'})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleSaveDoctorEdit}
                    disabled={savingEdit || approving}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Save size={14} /> {savingEdit ? 'Saving Draft...' : 'Save Draft Edits'}
                  </button>
                  <button
                    onClick={handleApproveAndSign}
                    disabled={savingEdit || approving}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px', background: '#059669', borderColor: '#059669' }}
                  >
                    <FileSignature size={15} /> {approving ? 'Authorizing...' : '✍️ Clinically Approve & Sign'}
                  </button>
                </div>
              </div>

              {/* Approval Success Banner */}
              {approvalResult && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle2 size={28} color="#059669" />
                    <div>
                      <h4 style={{ margin: 0, color: '#065f46', fontSize: '15px', fontWeight: 800 }}>
                        Official Discharge Summary Clinically Authorized & Signed!
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#047857' }}>
                        Signed electronically by {doctorName} at {new Date().toLocaleTimeString()}. Bed {selectedSummary.bed_number} transitioned to Cleaning. Module 3 Post-Discharge AI Remote Care successfully enrolled.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedSummary(null); setActiveMainTab('approved'); }}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    View in Archive →
                  </button>
                </div>
              )}

              {/* Patient Demographics Banner */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Patient Name</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{selectedSummary.patient_name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>UHID / MRN</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7' }}>{selectedSummary.uhid || 'UHID-2026-GEN'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Bed & Ward</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedSummary.bed_number || 'ICU-101'} ({selectedSummary.department})</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Stay Duration</span>
                  <div style={{ fontSize: '13px', color: '#475569' }}>{selectedSummary.admission_date || '2026-08-28'} → {selectedSummary.discharge_date || '2026-08-31'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Attending</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>{selectedSummary.doctor_name}</div>
                </div>
              </div>

              {/* Form Grid: Diagnoses & Hospital Course */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Primary Diagnosis * (Doctor Clinical Evaluation)
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.primary_diagnosis}
                      onChange={(e) => setEditFormData({ ...editFormData, primary_diagnosis: e.target.value })}
                      placeholder="e.g. Acute Coronary Syndrome - Non-STEMI (Resolved)"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Secondary Diagnosis / Comorbidities
                    </label>
                    <input
                      type="text"
                      value={editFormData.secondary_diagnosis}
                      onChange={(e) => setEditFormData({ ...editFormData, secondary_diagnosis: e.target.value })}
                      placeholder="e.g. Essential Hypertension Grade II, Type 2 Diabetes Mellitus"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Hospital Course & Clinical Progression
                    </label>
                    <textarea
                      rows={4}
                      value={editFormData.hospital_course}
                      onChange={(e) => setEditFormData({ ...editFormData, hospital_course: e.target.value })}
                      placeholder="Summary of inpatient stay, clinical response to therapy, and stability..."
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', lineHeight: 1.5 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Condition at Discharge
                    </label>
                    <select
                      value={editFormData.condition_at_discharge}
                      onChange={(e) => setEditFormData({ ...editFormData, condition_at_discharge: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                    >
                      <option>Clinically Fit & Stable</option>
                      <option>Improving / Telemetry Normalized</option>
                      <option>Stable - Requires Home Monitoring</option>
                      <option>Guarded / Oxygen Dependent</option>
                      <option>Transferred to Rehab Facility</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Dietary & Physical Activity Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.diet_lifestyle_instructions}
                      onChange={(e) => setEditFormData({ ...editFormData, diet_lifestyle_instructions: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                        Follow-Up Date
                      </label>
                      <input
                        type="date"
                        value={editFormData.follow_up_date}
                        onChange={(e) => setEditFormData({ ...editFormData, follow_up_date: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                        Follow-Up Department
                      </label>
                      <input
                        type="text"
                        value={editFormData.follow_up_dept}
                        onChange={(e) => setEditFormData({ ...editFormData, follow_up_dept: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────── */}
              {/* Discharge Medications Prescribing Table (Doctor Adds/Edits) */}
              {/* ───────────────────────────────────────────────────────── */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pill size={18} color="#0284c7" />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      Discharge Medications & Take-Home Prescriptions (Doctor Charting)
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMedicationRow}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> Add Medicine Row
                  </button>
                </div>

                {/* Common Presets Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Quick Presets:</span>
                  {COMMON_DRUGS_PRESETS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddPresetDrug(d)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '14px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: '#334155'
                      }}
                    >
                      + {d.medicine_name} {d.dosage}
                    </button>
                  ))}
                </div>

                {/* Prescriptions Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#475569' }}>
                        <th style={{ padding: '8px 10px' }}>Medicine Name</th>
                        <th style={{ padding: '8px 10px', width: '110px' }}>Dosage</th>
                        <th style={{ padding: '8px 10px', width: '160px' }}>Frequency</th>
                        <th style={{ padding: '8px 10px', width: '110px' }}>Duration</th>
                        <th style={{ padding: '8px 10px' }}>Instructions</th>
                        <th style={{ padding: '8px 10px', width: '50px', textAlign: 'center' }}>Del</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editFormData.medications.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                            No medications added yet. Click "+ Add Medicine Row" or select from Quick Presets above.
                          </td>
                        </tr>
                      ) : (
                        editFormData.medications.map((med, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={med.medicine_name}
                                onChange={(e) => handleUpdateMedRow(idx, 'medicine_name', e.target.value)}
                                placeholder="e.g. Tab. Aspirin"
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={med.dosage}
                                onChange={(e) => handleUpdateMedRow(idx, 'dosage', e.target.value)}
                                placeholder="e.g. 75 mg"
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <select
                                value={med.frequency}
                                onChange={(e) => handleUpdateMedRow(idx, 'frequency', e.target.value)}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                              >
                                <option>OD (Once daily)</option>
                                <option>BD (Twice daily)</option>
                                <option>TDS (Thrice daily)</option>
                                <option>QID (4 times daily)</option>
                                <option>HS (At bedtime)</option>
                                <option>SOS (As needed)</option>
                                <option>Weekly</option>
                              </select>
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={med.duration}
                                onChange={(e) => handleUpdateMedRow(idx, 'duration', e.target.value)}
                                placeholder="e.g. 14 days"
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={med.instructions}
                                onChange={(e) => handleUpdateMedRow(idx, 'instructions', e.target.value)}
                                placeholder="e.g. After food"
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveMedRow(idx)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                title="Remove medication"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor Clinical Notes & Authorization Action */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Attending Physician Notes & Digital Signature Remarks
                </label>
                <textarea
                  rows={2}
                  value={editFormData.doctor_notes}
                  onChange={(e) => setEditFormData({ ...editFormData, doctor_notes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>

              {/* Bottom Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSummary(null)}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '10px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDoctorEdit}
                  disabled={savingEdit || approving}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={15} /> {savingEdit ? 'Saving...' : 'Save Draft Edits'}
                </button>
                <button
                  type="button"
                  onClick={handleApproveAndSign}
                  disabled={savingEdit || approving}
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: '#059669', borderColor: '#059669', fontWeight: 800 }}
                >
                  <FileSignature size={17} /> {approving ? 'Clinically Authorizing...' : '✍️ Clinically Authorize & Digitally Sign'}
                </button>
              </div>
            </div>
          ) : (
            /* Table of summaries awaiting doctor review */
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Discharge Summaries Forwarded by Reception Desk
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Select a patient's summary to review hospital course, chart discharge prescriptions, and electronically sign
                  </p>
                </div>
                <span style={{ fontSize: '12px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontWeight: 800 }}>
                  {pendingSummaries.length} Awaiting Physician Review
                </span>
              </div>

              {pendingSummaries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ margin: 0, color: '#0f172a' }}>No summaries currently pending doctor review</h4>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>
                    When a receptionist fills or drafts a discharge summary at the desk, it will appear here in real time.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                        <th style={{ padding: '10px' }}>Summary ID</th>
                        <th style={{ padding: '10px' }}>Patient Name</th>
                        <th style={{ padding: '10px' }}>UHID</th>
                        <th style={{ padding: '10px' }}>Bed / Dept</th>
                        <th style={{ padding: '10px' }}>Attending Doctor</th>
                        <th style={{ padding: '10px' }}>Dates</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingSummaries.map((s) => (
                        <tr key={s.summary_id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s' }}>
                          <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{s.summary_id}</td>
                          <td style={{ padding: '10px', fontWeight: 800, color: '#0f172a' }}>{s.patient_name}</td>
                          <td style={{ padding: '10px', color: '#475569', fontSize: '12px' }}>{s.uhid || 'UHID-2026-GEN'}</td>
                          <td style={{ padding: '10px', color: '#475569' }}>{s.bed_number || 'ICU-101'} &bull; {s.department}</td>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#0284c7' }}>{s.doctor_name}</td>
                          <td style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>
                            {s.admission_date || '2026-08-28'} → {s.discharge_date || '2026-08-31'}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                              ⏳ PENDING REVIEW
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleOpenReview(s)}
                              className="btn-primary"
                              style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Edit3 size={13} /> Review & Prescribe
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: INTELLIGENT DISCHARGE READINESS SCORE (4 PILLARS) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'readiness' && (
        <div>
          {/* Inpatient Bed Selector Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            overflowX: 'auto'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
              Select Inpatient:
            </span>
            {patients.map((p) => {
              const isSel = p.patient_id === selectedPatientId;
              const pScore = p.readiness_score || 80;
              const badgeBg = pScore >= 80 ? '#10b981' : pScore >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <button
                  key={p.patient_id}
                  onClick={() => setSelectedPatientId(p.patient_id)}
                  style={{
                    background: isSel ? '#0284c7' : '#f8fafc',
                    color: isSel ? '#ffffff' : '#1e293b',
                    border: isSel ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{p.patient_name} ({p.patient_id})</span>
                  <span style={{
                    background: isSel ? 'rgba(255,255,255,0.25)' : badgeBg,
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 800
                  }}>
                    {pScore}%
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              Computing dynamic clinical stability and operational clearance score...
            </div>
          ) : readinessData ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              {/* Left Column: Live Readiness Dashboard */}
              <div>
                <div className="card" style={{ padding: '24px', marginBottom: '20px', borderTop: `4px solid ${scoreColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        PATIENT DISCHARGE READINESS
                      </span>
                      <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                        {readinessData.patient_name} <span style={{ fontSize: '14px', color: '#64748b' }}>({readinessData.patient_id})</span>
                      </h2>
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#475569' }}>
                        🛏️ Bed: <strong>{readinessData.bed_number || 'ICU-02'}</strong> &bull; Age/Gender: {readinessData.age || 45}Y / {readinessData.gender || 'Female'}
                      </p>
                    </div>
                    <span style={{
                      background: readinessData.doctor_decision === 'Clinically_Approved' ? '#dcfce7' : '#fef3c7',
                      color: readinessData.doctor_decision === 'Clinically_Approved' ? '#15803d' : '#b45309',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      {readinessData.doctor_decision === 'Clinically_Approved' ? '✅ Discharge Authorized' : 'Awaiting clearance'}
                    </span>
                  </div>

                  {/* 2 Big Callout Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '38px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                        {readinessData.readiness_score}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                        Dynamic readiness score
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '38px', fontWeight: 900, color: '#0284c7', lineHeight: 1 }}>
                        {readinessData.estimated_prep_time || '2–3 hrs'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                        Estimated preparation time
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>Operational & Clinical Completion</span>
                      <span style={{ fontWeight: 800, color: scoreColor }}>{readinessData.readiness_score}% of 100%</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${readinessData.readiness_score}%`, height: '100%', background: scoreColor, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  {/* 4 Pillars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {/* Pillar 1: Clinical Stability */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: pillars.clinical_stability?.status === 'Stable' ? '#f0fdf4' : '#fffbeb',
                      border: `1px solid ${pillars.clinical_stability?.status === 'Stable' ? '#bbf7d0' : '#fde68a'}`
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          Clinical stability
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {pillars.clinical_stability?.detail || 'Telemetry vitals stable within doctor-defined baseline.'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: pillars.clinical_stability?.status === 'Stable' ? '#10b981' : '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}>
                          {pillars.clinical_stability?.status || 'Stable'}
                        </span>
                        <button
                          onClick={() => handleUpdatePillar('clinical_stability', pillars.clinical_stability?.status === 'Stable' ? 'MONITORING' : 'STABLE')}
                          style={{ background: 'none', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          Toggle
                        </button>
                      </div>
                    </div>

                    {/* Pillar 2: Laboratory Clearance */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: pillars.laboratory_clearance?.status === 'Completed' ? '#f0fdf4' : '#fffbeb',
                      border: `1px solid ${pillars.laboratory_clearance?.status === 'Completed' ? '#bbf7d0' : '#fde68a'}`
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          Laboratory clearance
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {pillars.laboratory_clearance?.pending_count > 0
                            ? `Pending (${pillars.laboratory_clearance?.pending_count}): ${pillars.laboratory_clearance?.pending_tests?.join(', ')}`
                            : 'All ordered diagnostic investigations verified.'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: pillars.laboratory_clearance?.status === 'Completed' ? '#10b981' : '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}>
                          {pillars.laboratory_clearance?.status || 'Pending'}
                        </span>
                        <button
                          onClick={() => handleUpdatePillar('lab_clearance', pillars.laboratory_clearance?.status === 'Completed' ? 'PENDING' : 'COMPLETED')}
                          style={{ background: 'none', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          {pillars.laboratory_clearance?.status === 'Completed' ? 'Re-open' : 'Clear Labs'}
                        </button>
                      </div>
                    </div>

                    {/* Pillar 3: Pharmacy Preparation */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: pillars.pharmacy_preparation?.status === 'Completed' ? '#f0fdf4' : '#fffbeb',
                      border: `1px solid ${pillars.pharmacy_preparation?.status === 'Completed' ? '#bbf7d0' : '#fde68a'}`
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          Pharmacy preparation
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {pillars.pharmacy_preparation?.detail || 'Prescription verified; discharge medication packets prepared.'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: pillars.pharmacy_preparation?.status === 'Completed' ? '#10b981' : '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}>
                          {pillars.pharmacy_preparation?.status || 'Pending'}
                        </span>
                        <button
                          onClick={() => handleUpdatePillar('pharmacy_prep', pillars.pharmacy_preparation?.status === 'Completed' ? 'PENDING' : 'COMPLETED')}
                          style={{ background: 'none', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          {pillars.pharmacy_preparation?.status === 'Completed' ? 'Pending' : 'Complete'}
                        </button>
                      </div>
                    </div>

                    {/* Pillar 4: Billing Clearance */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: pillars.billing_clearance?.status === 'Cleared' ? '#f0fdf4' : '#fffbeb',
                      border: `1px solid ${pillars.billing_clearance?.status === 'Cleared' ? '#bbf7d0' : '#fde68a'}`
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          Billing clearance
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {pillars.billing_clearance?.detail || 'TPA Pre-Authorization verified.'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: pillars.billing_clearance?.status === 'Cleared' ? '#10b981' : '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}>
                          {pillars.billing_clearance?.status || 'Pending'}
                        </span>
                        <button
                          onClick={() => handleUpdatePillar('billing_clearance', pillars.billing_clearance?.status === 'Cleared' ? 'PENDING_INSURANCE' : 'CLEARED')}
                          style={{ background: 'none', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottleneck Notice */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      ⏳ Bottleneck & Delay Forecast:
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      {readinessData.delay_reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Direct Sign-off */}
              <div>
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Stethoscope size={20} color="#0284c7" />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      Quick Physician Sign-Off & Module 3 RPM Connection
                    </h3>
                  </div>

                  {signOffSuccess ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#15803d', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>
                        <CheckCircle2 size={22} color="#15803d" />
                        Electronic Discharge Authorized & Signed!
                      </div>
                      <p style={{ fontSize: '13px', color: '#166534', margin: '0 0 12px 0' }}>
                        Attending Physician <strong>{doctorName}</strong> has authorized patient {readinessData.patient_name}'s discharge summary.
                      </p>

                      <div style={{ background: '#ffffff', borderRadius: '8px', padding: '12px', border: '1px solid #dcfce7', marginBottom: '14px', fontSize: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                          🚀 Module 3 Connected: AI Remote RPM Activated
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: '#475569' }}>
                          <li>Day 1 – Initial Follow-Up (Pain & symptom inquiry)</li>
                          <li>Day 3 – Recovery Assessment (Medication adherence check)</li>
                          <li>Day 7 – Risk Evaluation (Wound healing & telemetry review)</li>
                        </ul>
                      </div>

                      <button
                        className="btn-secondary"
                        onClick={() => setSignOffSuccess(null)}
                        style={{ fontSize: '12px', padding: '8px 14px' }}
                      >
                        Re-review Signoff
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Primary Discharge Diagnosis
                        </label>
                        <input
                          type="text"
                          value={signOffNotes.diagnosis}
                          onChange={(e) => setSignOffNotes({ ...signOffNotes, diagnosis: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Discharge Medications & Regimen
                        </label>
                        <textarea
                          rows={3}
                          value={signOffNotes.meds}
                          onChange={(e) => setSignOffNotes({ ...signOffNotes, meds: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Home Care & Activity Instructions
                        </label>
                        <textarea
                          rows={3}
                          value={signOffNotes.instructions}
                          onChange={(e) => setSignOffNotes({ ...signOffNotes, instructions: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>

                      <button
                        onClick={handleApproveSignOff}
                        disabled={signing}
                        className="btn-primary"
                        style={{ padding: '12px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                      >
                        {signing ? 'Signing...' : '✍️ Sign & Authorize Discharge (Connect Module 3)'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: APPROVED & ELECTRONICALLY SIGNED ARCHIVE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'approved' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Officially Signed & Approved Discharge Summaries
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Authoritative records with digital physician signature, prescribed take-home medications, and active Remote RPM enrollments
            </p>
          </div>

          {approvedSummaries.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              No approved summaries found in current session.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}>
                    <th style={{ padding: '10px' }}>Summary ID</th>
                    <th style={{ padding: '10px' }}>Patient Name</th>
                    <th style={{ padding: '10px' }}>UHID</th>
                    <th style={{ padding: '10px' }}>Bed / Ward</th>
                    <th style={{ padding: '10px' }}>Primary Diagnosis</th>
                    <th style={{ padding: '10px' }}>Prescriptions</th>
                    <th style={{ padding: '10px' }}>Digital Seal</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedSummaries.map((s) => (
                    <tr key={s.summary_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{s.summary_id}</td>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{s.patient_name}</td>
                      <td style={{ padding: '10px', color: '#64748b', fontSize: '12px' }}>{s.uhid || 'UHID-2026-GEN'}</td>
                      <td style={{ padding: '10px' }}>{s.bed_number || 'ICU-101'}</td>
                      <td style={{ padding: '10px', color: '#1e293b', fontWeight: 600 }}>{s.primary_diagnosis || 'ACS - NSTEMI (Resolved)'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {Array.isArray(s.medications) ? s.medications.length : 0} Meds Prescribed
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          <CheckCircle2 size={12} /> {s.signed_by_doctor || doctorName}
                        </div>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenReview(s)}
                          className="btn-secondary"
                          style={{ fontSize: '11px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit3 size={11} /> View / Re-chart
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
