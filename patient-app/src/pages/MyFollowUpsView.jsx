import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, CheckCircle, RefreshCw, AlertCircle, 
  MessageSquare, Heart, ShieldAlert, Sparkles, Send, Activity, User, Phone, Check, ArrowRight
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function MyFollowUpsView({ patient, onNavigate }) {
  const patientId = patient?.patient_id || 'PT-1002';
  const patientName = patient?.name || 'Eleanor Vance';

  const [activeSubTab, setActiveSubTab] = useState('milestones'); // 'milestones' | 'whatsapp' | 'clinic'
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check-In Form State
  const [activeMilestoneDay, setActiveMilestoneDay] = useState(1);
  const [painScore, setPainScore] = useState(2);
  const [medAdherent, setMedAdherent] = useState(1);
  const [userMessage, setUserMessage] = useState('');
  const [submittingCheckin, setSubmittingCheckin] = useState(false);
  const [checkinResponse, setCheckinResponse] = useState(null);

  // WhatsApp simulation state
  const [waMessages, setWaMessages] = useState([
    {
      sender: 'ai',
      time: '09:00 AM',
      text: `Hello ${patientName}, this is AuraHealth AI Care Companion following up on your post-discharge recovery. How are you feeling today? Are you experiencing any pain or shortness of breath?`
    }
  ]);
  const [waInput, setWaInput] = useState('');
  const [waLoading, setWaLoading] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [patientId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/remote-rpm/patient/${patientId}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimelineData(data);
      }
    } catch (e) {
      console.warn('Error fetching timeline:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckinSubmit = async () => {
    if (!userMessage.trim()) {
      alert('Please describe how you are feeling in the message box.');
      return;
    }
    setSubmittingCheckin(true);
    try {
      const res = await fetch(`${API_BASE}/remote-rpm/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          milestone_day: activeMilestoneDay,
          user_message: userMessage,
          pain_score: painScore,
          medication_adherent: medAdherent,
          channel: 'PORTAL'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCheckinResponse(data);
        fetchTimeline();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit recovery check-in.');
    } finally {
      setSubmittingCheckin(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!waInput.trim()) return;
    const userText = waInput;
    setWaInput('');
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setWaMessages(prev => [...prev, { sender: 'user', time: timeNow, text: userText }]);
    setWaLoading(true);

    try {
      const res = await fetch(`${API_BASE}/remote-rpm/whatsapp/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_phone: patient?.phone || '+91 98765 43212',
          patient_id: patientId,
          milestone_day: activeMilestoneDay,
          text: userText
        })
      });
      if (res.ok) {
        const data = await res.json();
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setWaMessages(prev => [
          ...prev,
          { sender: 'ai', time: replyTime, text: data.outgoing_ai_reply }
        ]);
        fetchTimeline();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(false);
    }
  };

  const setPresetMessage = (type) => {
    if (type === 'normal') {
      setPainScore(2);
      setMedAdherent(1);
      setUserMessage('I am feeling much better today. Only mild soreness around the incision, no fever, and I have taken all my morning tablets with breakfast.');
    } else if (type === 'redflag') {
      setPainScore(8);
      setMedAdherent(0);
      setUserMessage('I am having sudden sharp chest tightness and shortness of breath since 45 minutes, feeling dizzy when standing up.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            AI Post-Discharge Remote Care & Recovery Companion
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Continuous home recovery monitoring &bull; WhatsApp AI agent & automated clinical triage
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button
            onClick={() => setActiveSubTab('milestones')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              background: activeSubTab === 'milestones' ? '#0284c7' : 'none',
              color: activeSubTab === 'milestones' ? '#ffffff' : '#475569',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📋 Recovery Milestones
          </button>
          <button
            onClick={() => setActiveSubTab('whatsapp')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              background: activeSubTab === 'whatsapp' ? '#0284c7' : 'none',
              color: activeSubTab === 'whatsapp' ? '#ffffff' : '#475569',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            💬 WhatsApp AI Companion
          </button>
          <button
            onClick={() => setActiveSubTab('clinic')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              background: activeSubTab === 'clinic' ? '#0284c7' : 'none',
              color: activeSubTab === 'clinic' ? '#ffffff' : '#475569',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🏥 Clinic Appointments
          </button>
        </div>
      </div>

      {activeSubTab === 'milestones' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Left Column: 5 Milestones Flow & Interactive Check-in */}
          <div>
            {/* Interactive Check-in Card */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#0284c7" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Day {activeMilestoneDay} Recovery Check-In
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 3, 7].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setActiveMilestoneDay(d);
                        setCheckinResponse(null);
                      }}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: activeMilestoneDay === d ? '#0284c7' : '#f1f5f9',
                        color: activeMilestoneDay === d ? '#fff' : '#475569',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preset Buttons for Demo */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center' }}>⚡ Demo Presets:</span>
                <button
                  onClick={() => setPresetMessage('normal')}
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🟢 Normal Recovery (Safe)
                </button>
                <button
                  onClick={() => setPresetMessage('redflag')}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🔴 Red-Flag Complication (Escalates to Doctor)
                </button>
              </div>

              {/* Pain Score Slider */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: '#334155' }}>Pain Level (0 = None, 10 = Severe)</span>
                  <span style={{ color: painScore >= 7 ? '#ef4444' : painScore >= 4 ? '#f59e0b' : '#10b981', fontSize: '13px', fontWeight: 800 }}>
                    {painScore} / 10 &bull; {painScore >= 7 ? 'Severe' : painScore >= 4 ? 'Moderate' : 'Mild / None'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScore}
                  onChange={(e) => setPainScore(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: painScore >= 7 ? '#ef4444' : '#0284c7' }}
                />
              </div>

              {/* Medication Adherence Toggle */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Have you taken all prescribed medications today?
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setMedAdherent(1)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: medAdherent === 1 ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: medAdherent === 1 ? '#f0fdf4' : '#ffffff',
                      color: medAdherent === 1 ? '#15803d' : '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✅ Yes, completely on schedule
                  </button>
                  <button
                    onClick={() => setMedAdherent(0)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: medAdherent === 0 ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      background: medAdherent === 0 ? '#fef2f2' : '#ffffff',
                      color: medAdherent === 0 ? '#991b1b' : '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚠️ Missed or delayed dose
                  </button>
                </div>
              </div>

              {/* Message Box */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  How are you feeling? (Symptoms, appetite, wound status, concerns)
                </label>
                <textarea
                  rows={3}
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Describe your current symptoms, pain characteristics, or any questions for the care team..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <button
                onClick={handleCheckinSubmit}
                disabled={submittingCheckin}
                className="btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {submittingCheckin ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Analyzing Symptoms with Clinical NLP...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Submit Recovery Check-In
                  </>
                )}
              </button>

              {/* Checkin Response Box */}
              {checkinResponse && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: checkinResponse.escalated ? '#fef2f2' : '#f0fdf4',
                  border: `1px solid ${checkinResponse.escalated ? '#fecaca' : '#bbf7d0'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    color: checkinResponse.escalated ? '#991b1b' : '#15803d',
                    marginBottom: '8px'
                  }}>
                    {checkinResponse.escalated ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                    {checkinResponse.escalated
                      ? 'Clinical Alert Dispatched to Attending Physician!'
                      : 'AI Care Companion Assessment: Normal Recovery'}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: checkinResponse.escalated ? '#7f1d1d' : '#166534', lineHeight: 1.5 }}>
                    {checkinResponse.reply_message}
                  </p>
                  {checkinResponse.escalated && (
                    <div style={{ marginTop: '10px', background: '#ffffff', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: '#991b1b', border: '1px solid #fecaca' }}>
                      🚨 <strong>Doctor Escalation:</strong> Dr. Sarah Jenkins has been alerted via priority triage queue. Please keep your phone accessible. If pain worsens, immediately call emergency 108.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 5-Stage Post-Discharge Recovery Journey */}
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Activity size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Connected Care Recovery Milestones
                </h3>
              </div>

              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                Personalized follow-up schedule designed by attending doctor. AI monitoring adapts frequency according to recovery pace.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { day: 1, title: 'Day 1 – Initial Follow-Up', desc: 'AI agent assesses pain levels, anesthesia recovery, and acute post-discharge symptoms.', status: 'COMPLETED' },
                  { day: 3, title: 'Day 3 – Recovery Assessment', desc: 'Feedback collected on medication adherence, wound dressing, and mobility progress.', status: 'ACTIVE' },
                  { day: 7, title: 'Day 7 – Risk Evaluation', desc: 'Clinical NLP detects concerning symptoms and trends to prevent readmission.', status: 'SCHEDULED' },
                  { day: 14, title: 'Day 14 – OPD Review Consultation', desc: 'In-person clinic review with Dr. Sarah Jenkins; follow-up blood tests.', status: 'SCHEDULED' },
                  { day: 30, title: 'Day 30 – Long-Term Outcome Review', desc: 'Holistic lifestyle assessment and cardiac rehabilitation progress.', status: 'SCHEDULED' }
                ].map((m) => (
                  <div
                    key={m.day}
                    style={{
                      borderLeft: `4px solid ${m.status === 'COMPLETED' ? '#10b981' : m.status === 'ACTIVE' ? '#0284c7' : '#cbd5e1'}`,
                      background: m.status === 'ACTIVE' ? '#f0f9ff' : '#f8fafc',
                      padding: '12px 14px',
                      borderRadius: '0 8px 8px 0',
                      borderTop: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{m.title}</span>
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
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                      {m.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: WhatsApp AI Simulation */}
      {activeSubTab === 'whatsapp' && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            {/* WhatsApp Header Bar */}
            <div style={{ background: '#075e54', color: '#ffffff', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                🤖
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>AuraHealth AI Care Companion</h3>
                <span style={{ fontSize: '11px', color: '#bbf7d0' }}>Official Hospital Verified WhatsApp Agent &bull; Online</span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div style={{
              background: '#efeae2',
              backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              padding: '20px',
              minHeight: '380px',
              maxHeight: '480px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {waMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: m.sender === 'user' ? '#d9fdd3' : '#ffffff',
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '12px 0 12px 12px' : '0 12px 12px 12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                    color: '#111b21',
                    position: 'relative'
                  }}
                >
                  <p style={{ margin: 0, lineHeight: 1.45 }}>{m.text}</p>
                  <span style={{ fontSize: '10px', color: '#667781', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                    {m.time} {m.sender === 'user' && '✓✓'}
                  </span>
                </div>
              ))}
              {waLoading && (
                <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', color: '#64748b' }}>
                  AuraHealth AI is analyzing your response...
                </div>
              )}
            </div>

            {/* WhatsApp Input Bar */}
            <div style={{ background: '#f0f2f5', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Type your WhatsApp reply..."
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsApp()}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              />
              <button
                onClick={handleSendWhatsApp}
                disabled={waLoading || !waInput.trim()}
                style={{
                  background: '#25d366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: In-Person Clinic Appointments */}
      {activeSubTab === 'clinic' && (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Cardiology OPD
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Dr. Sarah Jenkins
                </h3>
              </div>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                CONFIRMED
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              <strong style={{ color: '#0f172a' }}>Clinical Reason:</strong>
              <p style={{ margin: '2px 0 0 0', color: '#475569' }}>
                14-Day Post-Discharge Cardiac Biomarker, Echo & ECG Evaluation
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#0284c7" />
                <span>Date: <strong style={{ color: '#0f172a' }}>2026-09-14</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="#0284c7" />
                <span>Time: <strong style={{ color: '#0f172a' }}>10:30 AM</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="#64748b" />
                <span>AuraHealth Central Hospital &bull; Suite 204</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <button
                onClick={() => onNavigate ? onNavigate('appointments') : null}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                + Schedule Follow-Up Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
