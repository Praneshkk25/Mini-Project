import React, { useState, useEffect } from 'react';
import {
  User, Stethoscope, FileText, CheckCircle, AlertTriangle, Pill, Activity,
  Clock, Plus, Send, BedDouble, ChevronRight, Shield, RefreshCw, AlertOctagon, Check
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const FORMULARY_SUGGESTIONS = [
  { name: 'Paracetamol 650mg', defaultDosage: '1 tab', defaultFreq: 'TDS (Thrice daily)', duration: 5, qty: 15 },
  { name: 'Amoxicillin 500mg', defaultDosage: '1 cap', defaultFreq: 'TDS (Thrice daily)', duration: 7, qty: 21 },
  { name: 'Pantocid 40mg', defaultDosage: '1 tab', defaultFreq: 'OD (Empty stomach)', duration: 10, qty: 10 },
  { name: 'Metformin 500mg', defaultDosage: '1 tab', defaultFreq: 'BD (Twice daily)', duration: 30, qty: 60 },
  { name: 'Amlodipine 5mg', defaultDosage: '1 tab', defaultFreq: 'OD (Morning)', duration: 30, qty: 30 },
  { name: 'Atorvastatin 20mg', defaultDosage: '1 tab', defaultFreq: 'HS (Night)', duration: 30, qty: 30 },
  { name: 'Azithromycin 500mg', defaultDosage: '1 tab', defaultFreq: 'OD (Once daily)', duration: 3, qty: 3 }
];

export default function DoctorConsultationWorkspace() {
  const [queue, setQueue] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('PT-1001');
  const [patientChart, setPatientChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'timeline' | 'prescription' | 'admission'

  // Editable Summary Form
  const [summaryForm, setSummaryForm] = useState({
    chief_complaint: '',
    hpi: '',
    past_medical: '',
    allergies: '',
    clinical_impression: 'Mild Gastrointestinal Upset with Reflux'
  });
  const [isSummaryConfirmed, setIsSummaryConfirmed] = useState(false);

  // Prescription Composer
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicine_name: 'Pantocid 40mg', dosage: '1 tab', frequency: 'OD (Empty stomach)', duration_days: 10, quantity: 10 }
  ]);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  // Available Beds for Admission
  const [availableBeds, setAvailableBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState('GW-202');
  const [admissionSuccess, setAdmissionSuccess] = useState(false);

  useEffect(() => {
    fetchQueue();
    fetchBeds();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientChart(selectedPatientId);
    }
  }, [selectedPatientId]);

  const fetchQueue = async () => {
    try {
      const res = await fetch(`${API_BASE}/consultations/queue`);
      const data = await res.json();
      setQueue(data.queue || []);
      if (data.queue && data.queue.length > 0 && !selectedPatientId) {
        setSelectedPatientId(data.queue[0].patient_id);
      }
    } catch (e) {
      console.error("Failed to load queue", e);
    }
  };

  const fetchBeds = async () => {
    try {
      const res = await fetch(`${API_BASE}/beds/status`);
      const data = await res.json();
      const avail = (data.beds || []).filter((b) => b.status === 'Available');
      setAvailableBeds(avail);
      if (avail.length > 0) setSelectedBed(avail[0].bed_number);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPatientChart = async (pid) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/consultations/patient/${pid}`);
      const data = await res.json();
      setPatientChart(data);

      // Populate summary form with AI draft
      const draft = data.active_intake_session?.ai_summary_draft;
      if (draft) {
        setSummaryForm({
          chief_complaint: draft.chief_complaint || '',
          hpi: typeof draft.history_of_present_illness === 'object' ? JSON.stringify(draft.history_of_present_illness) : draft.history_of_present_illness || '',
          past_medical: draft.past_medical_history || '',
          allergies: draft.allergies || '',
          clinical_impression: 'Clinical evaluation in progress'
        });
        setIsSummaryConfirmed(data.active_intake_session.status === 'CONFIRMED');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSummary = async () => {
    if (!patientChart?.active_intake_session) return;
    try {
      await fetch(`${API_BASE}/consultations/summary/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: patientChart.active_intake_session.session_id,
          doctor_name: 'Dr. Sarah Jenkins',
          edited_summary: summaryForm
        })
      });
      setIsSummaryConfirmed(true);
      alert("AI Summary confirmed and signed by Dr. Sarah Jenkins.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendPrescription = async () => {
    if (!patientChart?.patient) return;
    try {
      await fetch(`${API_BASE}/consultations/prescribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_id: patientChart.active_intake_session?.visit_id || 'VST-9901',
          patient_id: patientChart.patient.patient_id,
          doctor_name: 'Dr. Sarah Jenkins',
          instructions: 'Take medications as prescribed with meals.',
          items: prescriptionItems
        })
      });
      setPrescriptionSuccess(true);
      setTimeout(() => setPrescriptionSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdmitPatient = async () => {
    if (!patientChart?.patient || !selectedBed) return;
    try {
      await fetch(`${API_BASE}/consultations/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_id: patientChart.active_intake_session?.visit_id || 'VST-9901',
          patient_id: patientChart.patient.patient_id,
          bed_number: selectedBed,
          ward_type: selectedBed.startsWith('ICU') ? 'ICU' : 'General Ward',
          attending_doctor: 'Dr. Sarah Jenkins'
        })
      });
      setAdmissionSuccess(true);
      fetchBeds();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', color: '#0f172a' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            👨‍⚕️ Doctor Consultation Workspace
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
            Attending Physician: <strong>Dr. Sarah Jenkins (Chief of Medicine)</strong> &bull; OPD & Triage Review
          </p>
        </div>

        <button onClick={() => { fetchQueue(); if (selectedPatientId) fetchPatientChart(selectedPatientId); }} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
          <RefreshCw size={15} /> Refresh Queue
        </button>
      </div>

      {/* 2-Column Layout: Queue on Left, Patient File on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
        {/* Left: Consultation Queue */}
        <div className="card" style={{ padding: '16px', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
              📋 Today's Queue ({queue.length})
            </h3>
            <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
              Live
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {queue.map((item) => (
              <div
                key={item.ticket_number}
                onClick={() => setSelectedPatientId(item.patient_id)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: selectedPatientId === item.patient_id ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                  background: selectedPatientId === item.patient_id ? 'rgba(13,148,136,0.08)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.patient_name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Ticket: <strong>{item.ticket_number}</strong> &bull; Age: {item.patient_age}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.priority === 'Immediate' ? '#fee2e2' : item.priority === 'Urgent' ? '#fef3c7' : '#e0f2fe',
                      color: item.priority === 'Immediate' ? '#b91c1c' : item.priority === 'Urgent' ? '#b45309' : '#0369a1'
                    }}
                  >
                    {item.priority}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  🩺 {item.symptoms}
                </div>

                {item.session_id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    <CheckCircle size={12} /> MediKiosk Intake Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Patient File */}
        {patientChart?.patient ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Patient Header Banner */}
            <div
              className="card"
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#f8fafc',
                border: '1px solid #334155'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ background: 'var(--primary)', color: '#fff', padding: '12px', borderRadius: '12px' }}>
                    <User size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
                        {patientChart.patient.name}
                      </h2>
                      <span style={{ fontSize: '12px', background: '#334155', padding: '2px 8px', borderRadius: '6px' }}>
                        {patientChart.patient.patient_id}
                      </span>
                      <span style={{ fontSize: '12px', background: '#0284c7', padding: '2px 8px', borderRadius: '6px' }}>
                        UHID: {patientChart.patient.uhid}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                      <span>Age: {patientChart.patient.age} ({patientChart.patient.gender})</span>
                      <span>Blood: <strong>{patientChart.patient.blood_group || 'O+'}</strong></span>
                      <span>Allergies: <strong style={{ color: '#f87171' }}>{patientChart.patient.allergies || 'None'}</strong></span>
                      <span>ABHA: {patientChart.patient.abha_id}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Status</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>
                    ● In Consultation
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              {[
                { id: 'summary', label: '🩺 AI Clinical Summary (Draft)', icon: <FileText size={16} /> },
                { id: 'timeline', label: '📜 Medical Timeline & Records', icon: <Clock size={16} /> },
                { id: 'prescription', label: '💊 Prescribe & Orders', icon: <Pill size={16} /> },
                { id: 'admission', label: '🛏️ Inpatient Admission', icon: <BedDouble size={16} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'var(--primary)' : '#ffffff',
                    color: activeTab === tab.id ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
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
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: AI CLINICAL SUMMARY (EDITABLE) */}
            {activeTab === 'summary' && (
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                      MediKiosk Structured AI Intake Summary
                    </h3>
                    <span style={{ fontSize: '11px', background: isSummaryConfirmed ? '#dcfce7' : '#fef3c7', color: isSummaryConfirmed ? '#166534' : '#b45309', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {isSummaryConfirmed ? '✓ Physician Confirmed' : 'Draft — Pending Review'}
                    </span>
                  </div>

                  <button onClick={handleConfirmSummary} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    ✓ Accept & Confirm Summary
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Chief Complaint</label>
                    <input
                      type="text"
                      value={summaryForm.chief_complaint}
                      onChange={(e) => setSummaryForm({ ...summaryForm, chief_complaint: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Known Allergies</label>
                    <input
                      type="text"
                      value={summaryForm.allergies}
                      onChange={(e) => setSummaryForm({ ...summaryForm, allergies: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>History of Present Illness (HPI)</label>
                    <textarea
                      rows={3}
                      value={summaryForm.hpi}
                      onChange={(e) => setSummaryForm({ ...summaryForm, hpi: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Past Medical & Surgical History</label>
                    <input
                      type="text"
                      value={summaryForm.past_medical}
                      onChange={(e) => setSummaryForm({ ...summaryForm, past_medical: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MEDICAL TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800' }}>
                  📜 Chronological Patient Medical Timeline
                </h3>

                {patientChart.document_timeline?.length > 0 ? (
                  <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #cbd5e1' }}>
                    {patientChart.document_timeline.map((doc, idx) => (
                      <div key={idx} style={{ marginBottom: '20px', position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            left: '-31px',
                            top: '4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            border: '2px solid #fff'
                          }}
                        />
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                              Year {doc.timeline_year} &bull; {doc.document_type}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{doc.uploaded_at?.slice(0, 10)}</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#334155' }}>
                            {doc.filename} &mdash; {doc.extracted_data_json?.clinical_impression || 'Uploaded Medical Record'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No prior digitized records found. You can upload past records via MediKiosk.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PRESCRIPTION COMPOSER */}
            {activeTab === 'prescription' && (
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                    💊 Electronic Prescription & Formulary
                  </h3>

                  <button onClick={handleSendPrescription} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={15} /> Send to Pharmacy Queue
                  </button>
                </div>

                {prescriptionSuccess && (
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 700 }}>
                    ✓ Prescription successfully forwarded to Pharmacy Dispensing console.
                  </div>
                )}

                {/* Formulary Quick Add */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Quick Formulary Search:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {FORMULARY_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug.name}
                        onClick={() => setPrescriptionItems([...prescriptionItems, {
                          medicine_name: sug.name,
                          dosage: sug.defaultDosage,
                          frequency: sug.defaultFreq,
                          duration_days: sug.duration,
                          quantity: sug.qty
                        }])}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        + {sug.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '8px' }}>Medicine Name</th>
                      <th style={{ padding: '8px' }}>Dosage</th>
                      <th style={{ padding: '8px' }}>Frequency</th>
                      <th style={{ padding: '8px' }}>Duration</th>
                      <th style={{ padding: '8px' }}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}><strong>{item.medicine_name}</strong></td>
                        <td style={{ padding: '8px' }}>{item.dosage}</td>
                        <td style={{ padding: '8px' }}>{item.frequency}</td>
                        <td style={{ padding: '8px' }}>{item.duration_days} days</td>
                        <td style={{ padding: '8px' }}>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: INPATIENT ADMISSION */}
            {activeTab === 'admission' && (
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800' }}>
                  🛏️ Inpatient Bed Assignment & Admission
                </h3>

                {admissionSuccess ? (
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '10px', textAlign: 'center', fontWeight: 700 }}>
                    ✓ Patient successfully admitted to Bed {selectedBed}. Telemetry monitoring pipeline activated.
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                      Directly admit patient to available ICU, CCU, or General Ward beds:
                    </p>

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700 }}>Select Bed:</label>
                      <select
                        value={selectedBed}
                        onChange={(e) => setSelectedBed(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      >
                        {availableBeds.map((b) => (
                          <option key={b.bed_number} value={b.bed_number}>
                            {b.bed_number} &mdash; {b.ward_type}
                          </option>
                        ))}
                      </select>

                      <button onClick={handleAdmitPatient} className="btn-primary" style={{ padding: '10px 24px' }}>
                        Confirm Inpatient Admission
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Select a patient from the queue on the left to begin consultation.
          </div>
        )}
      </div>
    </div>
  );
}
