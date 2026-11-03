import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle2, MessageSquare, Clock, User, Phone, 
  Send, RefreshCw, Sparkles, Activity, ShieldAlert, Heart, Calendar, ArrowRight
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function RemoteRPMDoctorView({ user }) {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [patientTimeline, setPatientTimeline] = useState(null);
  const [inspectingPid, setInspectingPid] = useState('PT-1002');

  const doctorName = user?.name || 'Dr. Sarah Jenkins';

  useEffect(() => {
    fetchEscalations();
    fetchTimeline(inspectingPid);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/remote-rpm/doctor/escalations`);
      if (res.ok) {
        const data = await res.json();
        setEscalations(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error fetching escalations:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (pid) => {
    try {
      const res = await fetch(`${API_BASE}/remote-rpm/patient/${pid}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setPatientTimeline(data);
      }
    } catch (e) {
      console.warn('Error fetching timeline:', e);
    }
  };

  const handleResolve = async (escId) => {
    if (!resolutionNote.trim()) {
      alert('Please enter clinical resolution notes.');
      return;
    }
    setResolving(true);
    try {
      const res = await fetch(`${API_BASE}/remote-rpm/doctor/escalations/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escalation_id: escId,
          physician_note: resolutionNote
        })
      });
      if (res.ok) {
        showToast('✅ Escalation resolved and clinical note appended to EHR.');
        setSelectedEscalation(null);
        setResolutionNote('');
        fetchEscalations();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to resolve escalation.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            AI Post-Discharge Remote Patient Monitoring & Escalations
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Continuous home recovery monitoring &bull; WhatsApp AI agent red-flag escalations
          </p>
        </div>

        <button
          onClick={fetchEscalations}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Alerts
        </button>
      </div>

      {/* 2-Column Layout: Active Alerts vs Patient Recovery Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Left: Active Red-Flag Escalations */}
        <div>
          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Urgent Clinical Escalations ({escalations.length})
                </h3>
              </div>
              <span style={{ fontSize: '11px', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                Requires Physician Review
              </span>
            </div>

            {loading ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Checking for active escalations...</p>
            ) : escalations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ margin: 0, color: '#0f172a' }}>No Unresolved Clinical Escalations</h4>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  All post-discharge patients are recovering within expected physiological benchmarks.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {escalations.map((esc) => (
                  <div
                    key={esc.escalation_id}
                    style={{
                      background: '#fff',
                      border: '1px solid #fecaca',
                      borderRadius: '10px',
                      padding: '16px',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{esc.patient_name || esc.patient_id}</span>
                          <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '6px' }}>
                            {esc.patient_id}
                          </span>
                          <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '6px' }}>
                            Day {esc.milestone_day} Check-In
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                          Reported via {esc.reported_channel || 'WhatsApp AI Agent'} &bull; {esc.created_at || 'Just now'}
                        </p>
                      </div>

                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '12px'
                      }}>
                        {esc.severity || 'CRITICAL'}
                      </span>
                    </div>

                    <div style={{ background: '#fef2f2', borderLeft: '3px solid #ef4444', padding: '10px 12px', borderRadius: '6px', margin: '10px 0', fontSize: '12.5px' }}>
                      <strong style={{ color: '#991b1b' }}>Patient Message:</strong>
                      <div style={{ color: '#7f1d1d', fontStyle: 'italic', marginTop: '2px' }}>
                        "{esc.patient_message || esc.trigger_reason}"
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', color: '#334155', marginBottom: '12px' }}>
                      <strong style={{ color: '#0f172a' }}>AI Clinical NLP Assessment:</strong>
                      <p style={{ margin: '2px 0 0 0' }}>
                        {esc.ai_assessment || 'Severe symptom exacerbation detected. High risk of post-discharge decompensation.'}
                      </p>
                    </div>

                    {selectedEscalation === esc.escalation_id ? (
                      <div style={{ marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Attending Physician Clinical Action / Advice:
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Advised immediate OPD visit for ECG and cardiac enzymes. Prescribed emergency sublingual tablet."
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => setSelectedEscalation(null)}
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-primary"
                            disabled={resolving}
                            onClick={() => handleResolve(esc.escalation_id)}
                            style={{ fontSize: '11px', padding: '4px 12px' }}
                          >
                            {resolving ? 'Resolving...' : 'Confirm Clinical Resolution'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setInspectingPid(esc.patient_id);
                            fetchTimeline(esc.patient_id);
                          }}
                          className="btn-secondary"
                          style={{ fontSize: '11px', padding: '5px 12px' }}
                        >
                          View Full Timeline
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEscalation(esc.escalation_id);
                            setResolutionNote('Reviewed telemetry and patient symptoms. Advised urgent clinical follow-up.');
                          }}
                          className="btn-primary"
                          style={{ fontSize: '11px', padding: '5px 12px' }}
                        >
                          Take Action / Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Discharged Patient Remote Care Timeline */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Post-Discharge Care Plan (5 Milestones)
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Patient: <strong>{inspectingPid}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto' }}>
              {['PT-1002', 'PT-1001'].map((pid) => (
                <button
                  key={pid}
                  onClick={() => {
                    setInspectingPid(pid);
                    fetchTimeline(pid);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: inspectingPid === pid ? '#0284c7' : '#f1f5f9',
                    color: inspectingPid === pid ? '#fff' : '#475569',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {pid}
                </button>
              ))}
            </div>

            {patientTimeline ? (
              <div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{patientTimeline.patient_name || inspectingPid}</div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    Diagnosis: {patientTimeline.primary_diagnosis || 'Post-PCI Care'} &bull; Discharged by: {patientTimeline.discharged_by || doctorName}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(patientTimeline.milestones || [
                    { milestone_day: 1, title: 'Day 1 – Initial Follow-Up', focus: 'Pain & acute symptom inquiry', status: 'COMPLETED' },
                    { milestone_day: 3, title: 'Day 3 – Recovery Assessment', focus: 'Medication adherence & mobility', status: 'ACTIVE' },
                    { milestone_day: 7, title: 'Day 7 – Risk Evaluation', focus: 'Wound healing & telemetry review', status: 'SCHEDULED' },
                    { milestone_day: 14, title: 'Day 14 – Clinical Review', focus: 'OPD follow-up consultation', status: 'SCHEDULED' },
                    { milestone_day: 30, title: 'Day 30 – Outcome Assessment', focus: 'Long-term functional recovery', status: 'SCHEDULED' },
                  ]).map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: m.status === 'COMPLETED' ? '#f0fdf4' : m.status === 'ACTIVE' ? '#eff6ff' : '#f8fafc',
                        border: `1px solid ${m.status === 'COMPLETED' ? '#bbf7d0' : m.status === 'ACTIVE' ? '#bfdbfe' : '#e2e8f0'}`
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                          {m.title || `Day ${m.milestone_day} Check-In`}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {m.focus || m.milestone_focus}
                        </div>
                      </div>

                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: m.status === 'COMPLETED' ? '#10b981' : m.status === 'ACTIVE' ? '#0284c7' : '#94a3b8',
                        color: '#fff'
                      }}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center' }}>Loading care plan timeline...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

