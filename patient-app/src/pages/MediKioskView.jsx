import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Shield, Globe, User, CheckCircle, AlertTriangle,
  Upload, FileText, Activity, Clock, ArrowRight, ArrowLeft, RefreshCw, Sparkles,
  Heart, Stethoscope, AlertOctagon, Info, ChevronRight, Zap, Check, X
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', voiceLang: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', voiceLang: 'Hindi' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', voiceLang: 'Tamil' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', voiceLang: 'Telugu' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', voiceLang: 'Kannada' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', voiceLang: 'Malayalam' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', voiceLang: 'Bengali' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', voiceLang: 'Marathi' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', voiceLang: 'Gujarati' }
];

const CHIEF_COMPLAINTS = [
  { id: 'chest_pain', label: 'Chest Pain', icon: '🫀', dept: 'Cardiology', emergency: true },
  { id: 'breathing', label: 'Difficulty Breathing', icon: '🫁', dept: 'Pulmonology', emergency: true },
  { id: 'stomach_pain', label: 'Stomach / Abdominal Pain', icon: '🩺', dept: 'Gastroenterology', emergency: false },
  { id: 'fever', label: 'High Fever & Chills', icon: '🌡️', dept: 'General Medicine', emergency: false },
  { id: 'headache', label: 'Severe Headache / Dizziness', icon: '🧠', dept: 'Neurology', emergency: false },
  { id: 'joint_pain', label: 'Joint / Bone Pain', icon: '🦴', dept: 'Orthopedics', emergency: false },
  { id: 'cough', label: 'Persistent Cough / Cold', icon: '🤧', dept: 'General Medicine', emergency: false },
  { id: 'ayush_general', label: 'Ayurvedic / Holistic Wellness', icon: '🌿', dept: 'AYUSH', isAyush: true }
];

export default function MediKioskView({ user, onComplete }) {
  // Wizard steps: 'IDENTIFY' -> 'LANGUAGE' -> 'CONSENT' -> 'INTAKE_TYPE' -> 'HISTORY' -> 'DOCUMENTS' -> 'TIMELINE' -> 'SUMMARY_TOKEN'
  const [step, setStep] = useState('IDENTIFY');
  
  // Patient State
  const [patientLookupQuery, setPatientLookupQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: user?.name || '',
    age: '35',
    gender: 'Male',
    phone: '',
    blood_group: 'B+',
    allergies: 'None known',
    abha_id: ''
  });
  const [abhaVerified, setAbhaVerified] = useState(false);

  // Language & Consent
  const [selectedLanguage, setSelectedLanguage] = useState(INDIAN_LANGUAGES[0]);
  const [audioConsentActive, setAudioConsentActive] = useState(false);
  const [consentGranted, setConsentGranted] = useState(true);

  // Session & Consultation Type
  const [consultationType, setConsultationType] = useState('Allopathy'); // 'Allopathy' | 'AYUSH'
  const [sessionId, setSessionId] = useState(null);
  const [visitId, setVisitId] = useState(null);

  // Clinical History Questions
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [hpiAnswers, setHpiAnswers] = useState({});
  const [pastMedicalAnswers, setPastMedicalAnswers] = useState([]);
  const [ayushAnswers, setAyushAnswers] = useState({});
  const [redFlagsDetected, setRedFlagsDetected] = useState([]);
  const [isEmergencyBypass, setIsEmergencyBypass] = useState(false);

  // Audio / Mic State
  const [micState, setMicState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'SPEAKING'
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  // Document Upload & Timeline
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Final Output
  const [summaryDraft, setSummaryDraft] = useState(null);
  const [finalToken, setFinalToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill with current patient if logged in
  useEffect(() => {
    if (user && !selectedPatient) {
      const defaultPt = {
        patient_id: 'PT-1001',
        uhid: user.specialty_or_info || 'UHID-2026-884920',
        name: user.name || 'James Robertson',
        age: 58,
        gender: 'Male',
        phone: '+91 98765 43210',
        blood_group: 'A+',
        allergies: 'None',
        abha_id: '91-4920-1948-2811'
      };
      setSelectedPatient(defaultPt);
    }
  }, [user]);

  // -------------------------------------------------------------------------
  // Speech Recognition & Audio Setup
  // -------------------------------------------------------------------------
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage.code === 'hi' ? 'hi-IN' : selectedLanguage.code === 'ta' ? 'ta-IN' : 'en-US';

      recognition.onstart = () => {
        setMicState('LISTENING');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setMicState('IDLE');
      };

      recognition.onend = () => {
        setMicState('IDLE');
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const handleMicToggle = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (micState === 'LISTENING') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setMicState('IDLE');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setMicState('LISTENING');
        } catch (err) {
          console.error("Failed to start speech recognition", err);
        }
      }
    }
  };

  const playTTS = (text) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setMicState('SPEAKING');
    const audio = new Audio(`${API_BASE}/tts?text=${encodeURIComponent(text)}&language=${encodeURIComponent(selectedLanguage.voiceLang)}`);
    audioRef.current = audio;
    audio.play().catch((e) => console.error("Audio playback error:", e));
    audio.onended = () => setMicState('IDLE');
  };

  // -------------------------------------------------------------------------
  // 1. Patient Lookup & Registration
  // -------------------------------------------------------------------------
  const handleSearchPatient = async () => {
    if (!patientLookupQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/intake/patient/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: patientLookupQuery })
      });
      const data = await res.json();
      setSearchResults(data.patients || []);
      if (data.patients && data.patients.length === 1) {
        setSelectedPatient(data.patients[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNewPatient = async (e) => {
    e.preventDefault();
    if (!newPatientForm.name || !newPatientForm.phone) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/intake/patient/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientForm)
      });
      const data = await res.json();
      setSelectedPatient({
        patient_id: data.patient_id,
        uhid: data.uhid,
        name: newPatientForm.name,
        age: parseInt(newPatientForm.age) || 30,
        gender: newPatientForm.gender,
        phone: newPatientForm.phone,
        blood_group: newPatientForm.blood_group,
        allergies: newPatientForm.allergies,
        abha_id: newPatientForm.abha_id || '91-4920-1948-2811'
      });
      setIsRegisteringNew(false);
      setStep('LANGUAGE');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAbha = async () => {
    if (!newPatientForm.abha_id) return;
    try {
      const res = await fetch(`${API_BASE}/intake/abha/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abha_id: newPatientForm.abha_id })
      });
      const data = await res.json();
      if (data.status?.includes('VERIFIED')) {
        setAbhaVerified(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // -------------------------------------------------------------------------
  // 2. Consent Submission & Start Session
  // -------------------------------------------------------------------------
  const handleConsentSubmit = async (granted) => {
    setConsentGranted(granted);
    if (!granted) {
      alert("Without clinical consent, automated intake is suspended. Please approach the registration desk.");
      return;
    }
    setLoading(true);
    try {
      // 1. Record Consent
      await fetch(`${API_BASE}/intake/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient?.patient_id || 'PT-1001',
          consent_type: 'Clinical_Intake',
          granted: true,
          audio_guided: audioConsentActive,
          language: selectedLanguage.name
        })
      });

      // 2. Start Intake Session
      const sessionRes = await fetch(`${API_BASE}/intake/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient?.patient_id || 'PT-1001',
          language: selectedLanguage.name,
          consultation_category: consultationType
        })
      });
      const sessionData = await sessionRes.json();
      setSessionId(sessionData.session_id);
      setVisitId(sessionData.visit_id);
      setStep('INTAKE_TYPE');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // 3. Clinical Questions & Voice Submission
  // -------------------------------------------------------------------------
  const handleChiefComplaintSelect = async (complaint) => {
    setChiefComplaint(complaint.label);
    if (complaint.isAyush) {
      setConsultationType('AYUSH');
    }
    
    // Check immediate red flag
    if (complaint.emergency) {
      setRedFlagsDetected([{
        flag: complaint.label,
        reason: 'Acute cardiopulmonary presentation flagged for emergency priority assessment',
        severity: 'IMMEDIATE'
      }]);
      setIsEmergencyBypass(true);
    }

    if (sessionId) {
      try {
        await fetch(`${API_BASE}/intake/session/${sessionId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'chief_complaint',
            question_key: 'primary_symptom',
            answer_text: complaint.label,
            is_voice: false
          })
        });
      } catch (e) {
        console.error(e);
      }
    }

    setStep('HISTORY');
  };

  const handleVoiceAnswerSubmit = async () => {
    if (!voiceTranscript.trim()) return;
    const answer = voiceTranscript.trim();
    setVoiceTranscript('');

    // Check emergency keywords
    const lower = answer.toLowerCase();
    if (lower.includes('chest pain') || lower.includes('breathing') || lower.includes('bleeding') || lower.includes('stroke')) {
      setIsEmergencyBypass(true);
      setRedFlagsDetected((prev) => [
        ...prev,
        { flag: answer, reason: 'High-risk clinical symptoms detected via patient voice input', severity: 'IMMEDIATE' }
      ]);
    }

    if (sessionId) {
      try {
        await fetch(`${API_BASE}/intake/session/${sessionId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'hpi',
            question_key: `q_${activeQuestionIdx}`,
            answer_text: answer,
            is_voice: true
          })
        });
      } catch (e) {
        console.error(e);
      }
    }

    // Move next
    setActiveQuestionIdx((prev) => prev + 1);
  };

  // -------------------------------------------------------------------------
  // 4. Document Upload & Extraction
  // -------------------------------------------------------------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'Prescription');
    formData.append('timeline_year', '2025');

    try {
      const res = await fetch(`${API_BASE}/intake/session/${sessionId || 'SES-1'}/document`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setUploadedDocs((prev) => [...prev, data]);
    } catch (err) {
      console.error("Document upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  // -------------------------------------------------------------------------
  // 5. Generate Summary & Enqueue
  // -------------------------------------------------------------------------
  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const summaryRes = await fetch(`${API_BASE}/intake/session/${sessionId || 'SES-1'}/generate-summary`, {
        method: 'POST'
      });
      const summaryData = await summaryRes.json();
      setSummaryDraft(summaryData.summary_draft);

      // Complete and enqueue into OPD/ER Queue
      const completeRes = await fetch(`${API_BASE}/intake/session/${sessionId || 'SES-1'}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: isEmergencyBypass ? 'Emergency' : (consultationType === 'AYUSH' ? 'AYUSH' : 'General Medicine')
        })
      });
      const tokenData = await completeRes.json();
      setFinalToken(tokenData);
      setStep('SUMMARY_TOKEN');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render Steps
  // -------------------------------------------------------------------------
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Kiosk Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '16px 24px',
          borderRadius: '16px',
          border: '1px solid #334155',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'var(--primary, #0d9488)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
            <Stethoscope size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>
                AuraHealth MediKiosk™
              </h2>
              <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                AI Clinical Intake
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Self-service clinical history, document scanning, and automated triage entry
            </p>
          </div>
        </div>

        {/* Language & Voice Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#334155', padding: '6px 12px', borderRadius: '10px' }}>
            <Globe size={16} color="#38bdf8" />
            <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}>{selectedLanguage.name}</span>
          </div>

          <button
            onClick={handleMicToggle}
            style={{
              background: micState === 'LISTENING' ? '#ef4444' : micState === 'SPEAKING' ? '#0284c7' : '#1e293b',
              color: '#fff',
              border: '1px solid #475569',
              padding: '8px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
          >
            {micState === 'LISTENING' ? <MicOff size={16} /> : <Mic size={16} />}
            {micState === 'LISTENING' ? 'Listening...' : micState === 'SPEAKING' ? 'AI Speaking...' : 'Voice Input'}
          </button>
        </div>
      </div>

      {/* STEP 1: PATIENT IDENTIFICATION */}
      {step === 'IDENTIFY' && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            👋 Welcome to Hospital Clinical Intake
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
            Please confirm your identity or search using UHID, Patient ID, Phone, or ABHA Health ID.
          </p>

          {/* Current Logged-in Patient Banner */}
          {selectedPatient && (
            <div style={{ maxWidth: '600px', margin: '0 auto 24px auto', background: 'rgba(13,148,136,0.08)', border: '2px solid var(--primary)', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    Active Patient Profile
                  </span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', fontWeight: 800 }}>{selectedPatient.name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    ID: {selectedPatient.patient_id} &bull; UHID: {selectedPatient.uhid} &bull; Age: {selectedPatient.age} ({selectedPatient.gender})
                  </p>
                </div>
                <button
                  onClick={() => setStep('LANGUAGE')}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                >
                  Proceed with this Profile <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {!isRegisteringNew ? (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Enter UHID, Phone, ABHA, or Name (e.g. Eleanor / 98401)..."
                  value={patientLookupQuery}
                  onChange={(e) => setPatientLookupQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    fontSize: '15px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                />
                <button onClick={handleSearchPatient} className="btn-primary" style={{ padding: '0 24px', fontSize: '15px' }}>
                  Search
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a' }}>Select Matched Patient:</h4>
                  {searchResults.map((pt) => (
                    <div
                      key={pt.patient_id}
                      onClick={() => {
                        setSelectedPatient(pt);
                        setStep('LANGUAGE');
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>{pt.name}</strong> &bull; Age: {pt.age} ({pt.gender})
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          ID: {pt.patient_id} | UHID: {pt.uhid} | Phone: {pt.phone}
                        </div>
                      </div>
                      <ChevronRight size={18} color="#0d9488" />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>First time visiting this hospital?</span>
                <button
                  onClick={() => setIsRegisteringNew(true)}
                  style={{
                    display: 'block',
                    margin: '12px auto 0 auto',
                    background: 'transparent',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ➕ Register as New Patient
                </button>
              </div>
            </div>
          ) : (
            /* New Patient Form */
            <form onSubmit={handleRegisterNewPatient} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Age</label>
                  <input
                    type="number"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    placeholder="35"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* ABHA ID Section */}
              <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #86efac', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                    🇮🇳 Ayushman Bharat Health Account (ABHA ID)
                  </label>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    DEMO MODE
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="91-4920-1948-2811"
                    value={newPatientForm.abha_id}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, abha_id: e.target.value })}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #86efac' }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAbha}
                    style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {abhaVerified ? '✓ Verified' : 'Verify'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsRegisteringNew(false)} className="btn-secondary">
                  Back to Search
                </button>
                <button type="submit" className="btn-primary">
                  Save & Proceed <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* STEP 2: LANGUAGE SELECTION */}
      {step === 'LANGUAGE' && selectedPatient && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🌐</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>
              Select Your Preferred Language
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
            Patient: <strong>{selectedPatient.name}</strong> ({selectedPatient.patient_id})
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', maxWidth: '800px', margin: '0 auto 32px auto' }}>
            {INDIAN_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang);
                  playTTS(`Welcome ${selectedPatient.name}. Please confirm your clinical consent.`);
                }}
                style={{
                  padding: '18px 12px',
                  borderRadius: '14px',
                  border: selectedLanguage.code === lang.code ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                  background: selectedLanguage.code === lang.code ? 'rgba(13,148,136,0.1)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: '800', color: selectedLanguage.code === lang.code ? 'var(--primary)' : '#0f172a' }}>
                  {lang.native}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{lang.name}</div>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => setStep('IDENTIFY')} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep('CONSENT')} className="btn-primary" style={{ padding: '12px 28px', fontSize: '16px' }}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONSENT-FIRST SCREEN */}
      {step === 'CONSENT' && (
        <div className="card" style={{ padding: '32px', maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#0284c7', color: '#fff', padding: '10px', borderRadius: '10px' }}>
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Digital Health Intake Consent
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Consent-First Architecture & Patient Privacy Protection
              </span>
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '18px',
              borderRadius: '12px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#334155',
              marginBottom: '20px'
            }}
          >
            <p style={{ marginTop: 0 }}>
              <strong>What information is collected?</strong> Your reported symptoms, previous medical history, uploaded prescriptions, and vital parameters.
            </p>
            <p>
              <strong>How AI is used?</strong> AI structures your conversation into a draft summary for your attending doctor. <em>AI does NOT diagnose your condition.</em>
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>Who accesses it?</strong> Only licensed attending hospital physicians, triage nurses, and certified pharmacists.
            </p>
          </div>

          {/* Audio Explanation Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', background: 'rgba(2,132,199,0.08)', padding: '12px 16px', borderRadius: '10px' }}>
            <button
              onClick={() => {
                setAudioConsentActive(!audioConsentActive);
                playTTS("This hospital uses an AI intake assistant to help prepare your clinical file for the doctor. Your information remains strictly private.");
              }}
              style={{
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              <Volume2 size={16} /> Listen to Audio Consent
            </button>
            <span style={{ fontSize: '13px', color: '#0369a1' }}>
              Audio explanation playing in <strong>{selectedLanguage.name}</strong> for low-literacy guidance.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep('LANGUAGE')} className="btn-secondary">
              <ArrowLeft size={16} /> Change Language
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleConsentSubmit(false)}
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #ef4444',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Decline
              </button>
              <button onClick={() => handleConsentSubmit(true)} className="btn-primary" style={{ padding: '10px 24px' }}>
                ✓ Grant Consent & Start Intake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: INTAKE CATEGORY */}
      {step === 'INTAKE_TYPE' && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            What is your primary reason for visiting today?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
            Select your main complaint or speak directly using the microphone button.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {CHIEF_COMPLAINTS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleChiefComplaintSelect(item)}
                style={{
                  padding: '20px 16px',
                  borderRadius: '16px',
                  border: item.emergency ? '1px solid #f87171' : '1px solid #cbd5e1',
                  background: item.isAyush ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : item.emergency ? '#fff1f2' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '28px' }}>{item.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: item.emergency ? '#be123c' : item.isAyush ? '#15803d' : '#0f172a' }}>
                  {item.label}
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  Dept: {item.dept} {item.emergency && '• ⚠️ Urgent'}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button onClick={() => setStep('CONSENT')} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ADAPTIVE CONVERSATIONAL HISTORY */}
      {step === 'HISTORY' && (
        <div className="card" style={{ padding: '32px' }}>
          {isEmergencyBypass && (
            <div
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                color: '#fff',
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 4px 14px rgba(239,68,68,0.4)'
              }}
            >
              <AlertOctagon size={32} />
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                  🚨 Potential Emergency Indicator Detected
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  These symptoms may require urgent medical assessment. Triage priority set to <strong>IMMEDIATE</strong>. Clinical staff has been notified.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Section {activeQuestionIdx + 1}: {consultationType === 'AYUSH' ? '🌿 AYUSH Dashavidha Pariksha' : '🩺 Clinical History'}
              </span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
                {activeQuestionIdx === 0 && `When did this ${chiefComplaint || 'problem'} start?`}
                {activeQuestionIdx === 1 && `How would you rate the severity of the discomfort?`}
                {activeQuestionIdx === 2 && `Do you have any existing conditions like Diabetes, Blood Pressure, or Asthma?`}
                {activeQuestionIdx >= 3 && `Any previous surgeries, procedures, or known medicine allergies?`}
              </h3>
            </div>

            <button
              onClick={() => playTTS(activeQuestionIdx === 0 ? `When did this ${chiefComplaint} start?` : "Please answer using the touch choices or microphone.")}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Volume2 size={15} /> Repeat Question
            </button>
          </div>

          {/* Touch Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {activeQuestionIdx === 0 && [
              'Today (< 24 hours)', '2 to 3 days ago', '1 week ago', 'More than a month (Chronic)'
            ].map((opt) => (
              <button
                key={opt}
                onClick={() => setVoiceTranscript(opt)}
                className="btn-secondary"
                style={{ padding: '14px', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}
              >
                ⏱️ {opt}
              </button>
            ))}

            {activeQuestionIdx === 1 && [
              'Mild (1-3)', 'Moderate (4-6)', 'Severe (7-8)', 'Unbearable (9-10)'
            ].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setVoiceTranscript(opt);
                  if (opt.includes('Unbearable')) setIsEmergencyBypass(true);
                }}
                className="btn-secondary"
                style={{ padding: '14px', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}
              >
                📊 {opt}
              </button>
            ))}

            {activeQuestionIdx === 2 && [
              'Diabetes (Sugar)', 'High Blood Pressure (HTN)', 'Asthma / Breathing', 'None / Healthy'
            ].map((opt) => (
              <button
                key={opt}
                onClick={() => setVoiceTranscript(opt)}
                className="btn-secondary"
                style={{ padding: '14px', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}
              >
                💊 {opt}
              </button>
            ))}
          </div>

          {/* Live Voice Input Box */}
          <div
            style={{
              background: '#f8fafc',
              border: micState === 'LISTENING' ? '2px solid #ef4444' : '1px solid #cbd5e1',
              padding: '18px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                {micState === 'LISTENING' ? '🎙️ Listening to your voice...' : 'Speech / Selected Answer:'}
              </span>
              <button
                onClick={handleMicToggle}
                style={{
                  background: micState === 'LISTENING' ? '#ef4444' : '#0d9488',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {micState === 'LISTENING' ? <MicOff size={14} /> : <Mic size={14} />}
                {micState === 'LISTENING' ? 'Stop Listening' : 'Speak Answer'}
              </button>
            </div>

            <textarea
              rows={3}
              value={voiceTranscript}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              placeholder="Your answer will appear here as you speak, or you can type directly..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#0f172a',
                fontSize: '15px'
              }}
            />
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('INTAKE_TYPE')} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep('DOCUMENTS')}
                className="btn-secondary"
                style={{ color: '#0284c7' }}
              >
                Skip to Document Scan ➔
              </button>
              <button onClick={handleVoiceAnswerSubmit} className="btn-primary">
                Save & Next Question <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: DOCUMENT UPLOAD & OCR EXTRACTION */}
      {step === 'DOCUMENTS' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#0d9488', color: '#fff', padding: '10px', borderRadius: '10px' }}>
              <Upload size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>
                Scan or Upload Previous Medical Documents
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Upload old prescriptions, lab reports, or discharge summaries to build your chronological medical timeline.
              </p>
            </div>
          </div>

          {/* Upload Drop Area */}
          <div
            style={{
              border: '2px dashed #94a3b8',
              borderRadius: '16px',
              padding: '36px',
              textAlign: 'center',
              background: '#f8fafc',
              marginBottom: '24px',
              cursor: 'pointer'
            }}
          >
            <input
              type="file"
              id="file-upload-kiosk"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload-kiosk" style={{ cursor: 'pointer' }}>
              <FileText size={40} color="#0d9488" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {isUploading ? 'Extracting clinical text with OCR...' : 'Click to Upload Prescription / Lab Report'}
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Supports PDF, Images (PNG, JPG) & Text files
              </span>
            </label>
          </div>

          {/* Uploaded Documents List */}
          {uploadedDocs.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                Extracted Documents & Timeline Events ({uploadedDocs.length}):
              </h4>
              {uploadedDocs.map((doc) => (
                <div
                  key={doc.document_id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#0f172a' }}>{doc.filename}</strong>
                      <span className="pill-badge pill-info" style={{ fontSize: '11px' }}>
                        Year {doc.timeline_year}
                      </span>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        ✓ OCR Extracted
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Type: {doc.document_type} | Impression: {doc.extracted_data?.clinical_impression || 'Clinical notes captured'}
                    </div>
                  </div>
                  <CheckCircle size={20} color="#10b981" />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('HISTORY')} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={handleGenerateSummary}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '16px' }}
            >
              Generate AI Summary & Issue Token <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: OFFICIAL OPD TOKEN & SUMMARY PASS */}
      {step === 'SUMMARY_TOKEN' && finalToken && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
            Intake Completed Successfully!
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Your clinical summary has been transmitted to attending physician <strong>{finalToken.assigned_doctor}</strong>.
          </p>

          {/* Token Pass Card */}
          <div
            style={{
              maxWidth: '480px',
              margin: '0 auto 28px auto',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '24px',
              borderRadius: '20px',
              textAlign: 'left',
              boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
              border: '1px solid #334155'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #475569', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  CareEase AI Hospital Pass
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: '800' }}>
                  {selectedPatient?.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#38bdf8' }}>
                  ID: {selectedPatient?.patient_id} | UHID: {selectedPatient?.uhid}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Queue Ticket</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>
                  {finalToken.ticket_number}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '14px' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Department:</span>
                <div style={{ fontWeight: 700 }}>{finalToken.department}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Attending Doctor:</span>
                <div style={{ fontWeight: 700 }}>{finalToken.assigned_doctor}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Triage Priority:</span>
                <div style={{ fontWeight: 700, color: finalToken.is_emergency ? '#f87171' : '#34d399' }}>
                  ● {finalToken.priority}
                </div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Est. Wait Time:</span>
                <div style={{ fontWeight: 700 }}>{finalToken.estimated_wait_minutes} mins</div>
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', border: '1px solid #334155' }}>
              📱 Please proceed to <strong>Room 104 ({finalToken.department})</strong> when your ticket is announced.
            </div>
          </div>

          <button
            onClick={() => {
              setStep('IDENTIFY');
              setSelectedPatient(null);
              setSummaryDraft(null);
              setFinalToken(null);
              if (onComplete) onComplete();
            }}
            className="btn-primary"
            style={{ padding: '12px 32px', fontSize: '16px' }}
          >
            Done / Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
