import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Shield, Globe, CheckCircle, AlertTriangle,
  Upload, FileText, Activity, ArrowRight, ArrowLeft, Sparkles,
  Stethoscope, AlertOctagon, ChevronRight, X
} from 'lucide-react';
import { translateText, translateAll } from '../utils/translate';

const API_BASE = 'http://localhost:8000/api';

/* ─────────────────────────────────────────────────────────────
   Language config — one source of truth for codes + TTS names.
   voiceLang  → backend gTTS name  (tts_service.py LANGUAGE_TAGS)
   speechLang → Web Speech API BCP-47 lang attribute
───────────────────────────────────────────────────────────── */
const INDIAN_LANGUAGES = [
  // ── Indian regional languages ────────────────────────────
  { code: 'en', name: 'English',            native: 'English',         voiceLang: 'English',                  speechLang: 'en-US',  flag: '🇬🇧', group: 'Indian' },
  { code: 'hi', name: 'Hindi',              native: 'हिन्दी',           voiceLang: 'Hindi',                    speechLang: 'hi-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'ta', name: 'Tamil',              native: 'தமிழ்',            voiceLang: 'Tamil',                    speechLang: 'ta-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'te', name: 'Telugu',             native: 'తెలుగు',           voiceLang: 'Telugu',                   speechLang: 'te-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'kn', name: 'Kannada',            native: 'ಕನ್ನಡ',           voiceLang: 'Kannada',                  speechLang: 'kn-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'ml', name: 'Malayalam',          native: 'മലയാളം',          voiceLang: 'Malayalam',                speechLang: 'ml-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'bn', name: 'Bengali',            native: 'বাংলা',            voiceLang: 'Bengali',                  speechLang: 'bn-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'mr', name: 'Marathi',            native: 'मराठी',            voiceLang: 'Marathi',                  speechLang: 'mr-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'gu', name: 'Gujarati',           native: 'ગુજરાતી',         voiceLang: 'Gujarati',                 speechLang: 'gu-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'pa', name: 'Punjabi',            native: 'ਪੰਜਾਬੀ',           voiceLang: 'Punjabi',                  speechLang: 'pa-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'ur', name: 'Urdu',               native: 'اردو',             voiceLang: 'Urdu',                     speechLang: 'ur-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'or', name: 'Odia',               native: 'ଓଡ଼ିଆ',            voiceLang: 'Odia',                     speechLang: 'or-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'as', name: 'Assamese',           native: 'অসমীয়া',          voiceLang: 'Assamese',                 speechLang: 'as-IN',  flag: '🇮🇳', group: 'Indian' },
  { code: 'ne', name: 'Nepali',             native: 'नेपाली',           voiceLang: 'Nepali',                   speechLang: 'ne-NP',  flag: '🇳🇵', group: 'Indian' },
  { code: 'si', name: 'Sinhala',            native: 'සිංහල',            voiceLang: 'Sinhala',                  speechLang: 'si-LK',  flag: '🇱🇰', group: 'Indian' },
  // ── International languages ──────────────────────────────
  { code: 'ar', name: 'Arabic',             native: 'العربية',          voiceLang: 'Arabic',                   speechLang: 'ar-SA',  flag: '🌍', group: 'International' },
  { code: 'fr', name: 'French',             native: 'Français',         voiceLang: 'French',                   speechLang: 'fr-FR',  flag: '🇫🇷', group: 'International' },
  { code: 'es', name: 'Spanish',            native: 'Español',          voiceLang: 'Spanish',                  speechLang: 'es-ES',  flag: '🇪🇸', group: 'International' },
  { code: 'de', name: 'German',             native: 'Deutsch',          voiceLang: 'German',                   speechLang: 'de-DE',  flag: '🇩🇪', group: 'International' },
  { code: 'pt', name: 'Portuguese',         native: 'Português',        voiceLang: 'Portuguese',               speechLang: 'pt-BR',  flag: '🇧🇷', group: 'International' },
  { code: 'ru', name: 'Russian',            native: 'Русский',          voiceLang: 'Russian',                  speechLang: 'ru-RU',  flag: '🇷🇺', group: 'International' },
  { code: 'ja', name: 'Japanese',           native: '日本語',            voiceLang: 'Japanese',                 speechLang: 'ja-JP',  flag: '🇯🇵', group: 'International' },
  { code: 'ko', name: 'Korean',             native: '한국어',            voiceLang: 'Korean',                   speechLang: 'ko-KR',  flag: '🇰🇷', group: 'International' },
  { code: 'zh-CN', name: 'Chinese (Simplified)',  native: '中文(简体)',  voiceLang: 'Chinese (Simplified)',     speechLang: 'zh-CN',  flag: '🇨🇳', group: 'International' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '中文(繁體)', voiceLang: 'Chinese (Traditional)',    speechLang: 'zh-TW',  flag: '🇹🇼', group: 'International' },
  { code: 'it', name: 'Italian',            native: 'Italiano',         voiceLang: 'Italian',                  speechLang: 'it-IT',  flag: '🇮🇹', group: 'International' },
  { code: 'tr', name: 'Turkish',            native: 'Türkçe',           voiceLang: 'Turkish',                  speechLang: 'tr-TR',  flag: '🇹🇷', group: 'International' },
  { code: 'id', name: 'Indonesian',         native: 'Bahasa Indonesia', voiceLang: 'Indonesian',               speechLang: 'id-ID',  flag: '🇮🇩', group: 'International' },
  { code: 'vi', name: 'Vietnamese',         native: 'Tiếng Việt',       voiceLang: 'Vietnamese',               speechLang: 'vi-VN',  flag: '🇻🇳', group: 'International' },
  { code: 'th', name: 'Thai',               native: 'ภาษาไทย',          voiceLang: 'Thai',                     speechLang: 'th-TH',  flag: '🇹🇭', group: 'International' },
  { code: 'sw', name: 'Swahili',            native: 'Kiswahili',        voiceLang: 'Swahili',                  speechLang: 'sw-KE',  flag: '🌍', group: 'International' },
];

/* ─────────────────────────────────────────────────────────────
   Chief complaints — English source labels (translated live)
───────────────────────────────────────────────────────────── */
const CHIEF_COMPLAINTS_EN = [
  { id: 'chest_pain',   label: 'Chest Pain',                    icon: '🫀', dept: 'Cardiology',       emergency: true  },
  { id: 'breathing',    label: 'Difficulty Breathing',          icon: '🫁', dept: 'Pulmonology',      emergency: true  },
  { id: 'stomach_pain', label: 'Stomach / Abdominal Pain',      icon: '🩺', dept: 'Gastroenterology', emergency: false },
  { id: 'fever',        label: 'High Fever & Chills',           icon: '🌡️', dept: 'General Medicine', emergency: false },
  { id: 'headache',     label: 'Severe Headache / Dizziness',   icon: '🧠', dept: 'Neurology',        emergency: false },
  { id: 'joint_pain',   label: 'Joint / Bone Pain',             icon: '🦴', dept: 'Orthopedics',      emergency: false },
  { id: 'cough',        label: 'Persistent Cough / Cold',       icon: '🤧', dept: 'General Medicine', emergency: false },
  { id: 'skin',         label: 'Skin Rash / Allergy',           icon: '🧴', dept: 'Dermatology',      emergency: false },
  { id: 'eye',          label: 'Eye Pain / Redness',            icon: '👁️', dept: 'Ophthalmology',    emergency: false },
  { id: 'ayush_general',label: 'Ayurvedic / Holistic Wellness', icon: '🌿', dept: 'AYUSH',            isAyush: true    },
];

/* ─────────────────────────────────────────────────────────────
   Wizard steps
   IDENTIFY → LANGUAGE → CONSENT → INTAKE_TYPE → HISTORY
             → DOCUMENTS → SUMMARY_TOKEN
───────────────────────────────────────────────────────────── */
export default function MediKioskView({ user, onComplete, onGoToRegister, onEditPatient }) {
  // If user is already authenticated, jump straight to language/intake flow
  const [step, setStep] = useState(user ? 'LANGUAGE' : 'IDENTIFY');

  // Patient
  const [patientLookupQuery, setPatientLookupQuery] = useState('');
  const [searchResults, setSearchResults]           = useState([]);
  const [selectedPatient, setSelectedPatient]       = useState(() => {
    if (!user) return null;
    return {
      patient_id:  user.patient_id || 'PT-1001',
      uhid:        user.uhid || (user.specialty_or_info && user.specialty_or_info.startsWith('UHID-') ? user.specialty_or_info : null),
      mrn:         user.mrn || 'MRN-PENDING',
      name:        user.name || 'Patient',
      age:         user.age || 35,
      gender:      user.gender || 'Male',
      phone:       user.phone || '',
      blood_group: user.blood_group || 'O+',
      allergies:   user.allergies || 'None',
      abha_id:     user.abha_id || '',
    };
  });

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState(INDIAN_LANGUAGES[0]);

  // Translated UI strings — re-computed whenever language changes
  const [tx, setTx] = useState({});
  const [translatedComplaints, setTranslatedComplaints] = useState(CHIEF_COMPLAINTS_EN);

  // Consent / session
  const [audioConsentActive, setAudioConsentActive] = useState(false);
  const [consentGranted, setConsentGranted]         = useState(false);
  const [consultationType, setConsultationType]     = useState('Allopathy');
  const [sessionId, setSessionId]                   = useState(null);
  const [visitId, setVisitId]                       = useState(null);

  // Clinical history
  const [activeQuestionIdx, setActiveQuestionIdx]   = useState(0);
  const [chiefComplaint, setChiefComplaint]         = useState('');
  const [redFlagsDetected, setRedFlagsDetected]     = useState([]);
  const [isEmergencyBypass, setIsEmergencyBypass]   = useState(false);

  // Voice / mic
  const [micState, setMicState]         = useState('IDLE'); // IDLE | LISTENING | SPEAKING
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const audioRef     = useRef(null);
  const recognitionRef = useRef(null);

  // Document upload
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isUploading, setIsUploading]   = useState(false);

  // Final output
  const [summaryDraft, setSummaryDraft] = useState(null);
  const [finalToken, setFinalToken]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fhirModalOpen, setFhirModalOpen] = useState(false);
  const [fhirData, setFhirData]           = useState(null);
  const [fhirLoading, setFhirLoading]     = useState(false);
  const [copiedFhir, setCopiedFhir]       = useState(false);

  const handleDownloadFhir = (sid) => {
    const targetSessionId = sid || sessionId || finalToken?.session_id || 'SES-1';
    window.open(`${API_BASE}/intake/session/${targetSessionId}/fhir?download=true`, '_blank');
  };

  const handleOpenFhirModal = async (sid) => {
    const targetSessionId = sid || sessionId || finalToken?.session_id || 'SES-1';
    setFhirLoading(true);
    setFhirModalOpen(true);
    try {
      const res = await fetch(`${API_BASE}/intake/session/${targetSessionId}/fhir`);
      const data = await res.json();
      setFhirData(data);
    } catch (e) {
      console.error(e);
    }
    setFhirLoading(false);
  };

  /* ───────────────────────────────────────────────────────────
     Pre-fill logged-in patient
  ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (user && !selectedPatient) {
      setSelectedPatient({
        patient_id: user.patient_id || 'PT-1001',
        uhid:       user.uhid || (user.specialty_or_info && user.specialty_or_info.startsWith('UHID-') ? user.specialty_or_info : null),
        mrn:        user.mrn || 'MRN-PENDING',
        name:       user.name,
        age:        user.age || 35,
        gender:     user.gender || 'Male',
        phone:      user.phone || '',
        blood_group: user.blood_group || 'O+',
        allergies:  user.allergies || 'None',
        abha_id:    user.abha_id || '',
      });
    }
  }, [user]);

  /* ───────────────────────────────────────────────────────────
     Translate all static UI strings when language changes
  ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (selectedLanguage.name === 'English') {
      setTx({});
      setTranslatedComplaints(CHIEF_COMPLAINTS_EN);
      return;
    }

    const UI_STRINGS = {
      welcomeTitle:      'Welcome to Hospital Clinical Intake',
      welcomeSub:        'Confirm your identity or search using UHID, Patient ID, Phone or ABHA ID.',
      searchPlaceholder: 'Enter UHID, Phone, ABHA or Name…',
      search:            'Search',
      firstTime:         'First time visiting this hospital?',
      registerNew:       '➕ Register as New Patient',
      proceedProfile:    'Proceed with this Profile',
      activeProfile:     'Active Patient Profile',
      selectLang:        'Select Your Preferred Language',
      patient:           'Patient',
      continuBtn:        'Continue',
      backBtn:           'Back',
      consentTitle:      'Digital Health Intake Consent',
      consentSub:        'Consent-First Architecture & Patient Privacy Protection',
      listenAudio:       'Listen to Audio Consent',
      audioPlaying:      'Audio explanation playing in',
      lowLiteracy:       'for low-literacy guidance.',
      grantConsent:      '✓ Grant Consent & Start Intake',
      declineConsent:    'Decline',
      changeLang:        'Change Language',
      visitReason:       'What is your primary reason for visiting today?',
      visitReasonSub:    'Select your main complaint or speak using the microphone.',
      clinicalHistory:   '🩺 Clinical History',
      ayushHistory:      '🌿 AYUSH Dashavidha Pariksha',
      repeatQuestion:    'Repeat Question',
      speakAnswer:       'Speak Answer',
      stopListening:     'Stop Listening',
      listeningLabel:    '🎙️ Listening to your voice…',
      answerLabel:       'Speech / Selected Answer:',
      typeDirectly:      'Your answer will appear here as you speak, or type directly…',
      saveNext:          'Save & Next Question',
      skipDocs:          'Skip to Document Scan ➔',
      uploadTitle:       'Scan or Upload Previous Medical Documents',
      uploadSub:         'Upload old prescriptions, lab reports or discharge summaries.',
      uploadClick:       'Click to Upload Prescription / Lab Report',
      uploadFormats:     'Supports PDF, Images (PNG, JPG) & Text files',
      extracting:        'Extracting clinical text with OCR…',
      generateBtn:       'Generate AI Summary & Issue Token',
      intakeComplete:    'Intake Completed Successfully!',
      summaryTransmit:   'Your clinical summary has been transmitted to attending physician',
      doneBtn:           'Done / Return to Dashboard',
      emergencyTitle:    '🚨 Potential Emergency Indicator Detected',
      emergencySub:      'These symptoms may require urgent medical assessment. Triage priority set to IMMEDIATE.',
      q0:                'When did this problem start?',
      q1:                'How would you rate the severity of your discomfort?',
      q2:                'Do you have existing conditions like Diabetes, Blood Pressure or Asthma?',
      q3:                'Any previous surgeries, procedures or known medicine allergies?',
      o0_0: 'Today (< 24 hours)', o0_1: '2 to 3 days ago', o0_2: '1 week ago', o0_3: 'More than a month (Chronic)',
      o1_0: 'Mild (1-3)',         o1_1: 'Moderate (4-6)',  o1_2: 'Severe (7-8)', o1_3: 'Unbearable (9-10)',
      o2_0: 'Diabetes (Sugar)',   o2_1: 'High Blood Pressure (HTN)', o2_2: 'Asthma / Breathing', o2_3: 'None / Healthy',
      aiVoiceInput: 'Voice Input',
      aiSpeaking:   'AI Speaking…',
      consentWhat:  'What information is collected?',
      consentHow:   'How AI is used?',
      consentWho:   'Who accesses it?',
      consentWhatAns: 'Your reported symptoms, previous medical history, uploaded prescriptions and vital parameters.',
      consentHowAns:  'AI structures your conversation into a draft summary for your attending doctor. AI does NOT diagnose your condition.',
      consentWhoAns:  'Only licensed attending hospital physicians, triage nurses and certified pharmacists.',
      dept:             'Dept',
      urgent:           'Urgent',
      extractedDocs:    'Extracted Documents & Timeline Events',
    };

    translateAll(Object.values(UI_STRINGS), selectedLanguage.name).then((vals) => {
      const keys = Object.keys(UI_STRINGS);
      const result = {};
      keys.forEach((k, i) => { result[k] = vals[i]; });
      setTx(result);
    });

    // Translate complaint labels
    translateAll(CHIEF_COMPLAINTS_EN.map((c) => c.label), selectedLanguage.name).then((labels) => {
      setTranslatedComplaints(CHIEF_COMPLAINTS_EN.map((c, i) => ({ ...c, labelTx: labels[i] })));
    });
  }, [selectedLanguage]);

  // Helper — returns translated string or English fallback
  const t = useCallback((key, fallback) => tx[key] || fallback || key, [tx]);

  /* ───────────────────────────────────────────────────────────
     Speech Recognition — rebuilds when language changes
  ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous    = false;
    recognition.interimResults = true;
    recognition.lang          = selectedLanguage.speechLang;

    recognition.onstart  = () => setMicState('LISTENING');
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join('');
      setVoiceTranscript(transcript);
    };
    recognition.onerror  = () => setMicState('IDLE');
    recognition.onend    = () => setMicState('IDLE');

    recognitionRef.current = recognition;
  }, [selectedLanguage]);

  /* ───────────────────────────────────────────────────────────
     TTS — plays backend gTTS in the selected language.
     playTTS        → uses current selectedLanguage state (for all
                       existing call-sites throughout the component).
     playTTSInLang  → accepts an explicit lang object so the language-
                       switcher can speak IMMEDIATELY in the NEW language
                       before the React state update has propagated.
  ─────────────────────────────────────────────────────────── */
  const stopAllAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMicState('IDLE');
  }, []);

  const playTTSInLang = useCallback(async (englishText, lang) => {
    stopAllAudio();
    const textToSpeak = await translateText(englishText, lang.name);
    setMicState('SPEAKING');
    const audio = new Audio(
      `${API_BASE}/tts?text=${encodeURIComponent(textToSpeak)}&language=${encodeURIComponent(lang.voiceLang)}`
    );
    audioRef.current = audio;
    audio.play().catch(() => {});
    audio.onended = () => setMicState('IDLE');
  }, [stopAllAudio]);

  const playTTS = useCallback(async (englishText) => {
    stopAllAudio();
    const textToSpeak = await translateText(englishText, selectedLanguage.name);
    setMicState('SPEAKING');
    const audio = new Audio(
      `${API_BASE}/tts?text=${encodeURIComponent(textToSpeak)}&language=${encodeURIComponent(selectedLanguage.voiceLang)}`
    );
    audioRef.current = audio;
    audio.play().catch(() => {});
    audio.onended = () => setMicState('IDLE');
  }, [selectedLanguage, stopAllAudio]);

  const handleMicToggle = () => {
    stopAllAudio();
    if (micState === 'LISTENING') {
      recognitionRef.current?.stop();
      setMicState('IDLE');
    } else {
      try { recognitionRef.current?.start(); } catch {}
    }
  };

  /* ───────────────────────────────────────────────────────────
     1. Patient lookup
  ─────────────────────────────────────────────────────────── */
  const handleSearchPatient = async () => {
    if (!patientLookupQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/intake/patient/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: patientLookupQuery }),
      });
      const data = await res.json();
      setSearchResults(data.patients || []);
      if (data.patients?.length === 1) setSelectedPatient(data.patients[0]);
    } catch {}
    setSearchLoading(false);
  };

  /* ───────────────────────────────────────────────────────────
     2. Consent + session start
  ─────────────────────────────────────────────────────────── */
  const handleConsentSubmit = async (granted) => {
    setConsentGranted(granted);
    if (!granted) {
      alert('Without clinical consent, automated intake is suspended. Please approach the registration desk.');
      return;
    }
    setLoading(true);
    try {
      await fetch(`${API_BASE}/intake/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id:    selectedPatient?.patient_id || 'PT-1001',
          consent_type:  'Clinical_Intake',
          granted:       true,
          audio_guided:  audioConsentActive,
          language:      selectedLanguage.name,
        }),
      });

      const sessionRes = await fetch(`${API_BASE}/intake/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id:            selectedPatient?.patient_id || 'PT-1001',
          language:              selectedLanguage.name,
          consultation_category: consultationType,
        }),
      });
      const sessionData = await sessionRes.json();
      setSessionId(sessionData.session_id);
      setVisitId(sessionData.visit_id);
      setStep('INTAKE_TYPE');
    } catch {}
    setLoading(false);
  };

  /* ───────────────────────────────────────────────────────────
     3. Chief complaint selection
  ─────────────────────────────────────────────────────────── */
  const handleChiefComplaintSelect = async (complaint) => {
    setChiefComplaint(complaint.label);
    if (complaint.isAyush) setConsultationType('AYUSH');
    if (complaint.emergency) {
      setRedFlagsDetected([{ flag: complaint.label, reason: 'Acute cardiopulmonary presentation', severity: 'IMMEDIATE' }]);
      setIsEmergencyBypass(true);
    }
    if (sessionId) {
      await fetch(`${API_BASE}/intake/session/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'chief_complaint', question_key: 'primary_symptom', answer_text: complaint.label, is_voice: false }),
      }).catch(() => {});
    }
    setStep('HISTORY');
  };

  /* ───────────────────────────────────────────────────────────
     4. Voice answer submit
  ─────────────────────────────────────────────────────────── */
  /* ───────────────────────────────────────────────────────────
     4. Voice answer submit
  ─────────────────────────────────────────────────────────── */
  const handleVoiceAnswerSubmit = async () => {
    const answer = voiceTranscript.trim();
    if (!answer) return;
    setVoiceTranscript('');

    const lower = answer.toLowerCase();
    if (['chest pain','breathing','bleeding','stroke'].some((kw) => lower.includes(kw))) {
      setIsEmergencyBypass(true);
      setRedFlagsDetected((prev) => [...prev, { flag: answer, reason: 'High-risk clinical symptoms detected', severity: 'IMMEDIATE' }]);
    }
    if (answer.toLowerCase().includes('unbearable')) setIsEmergencyBypass(true);

    const isAyushMode = consultationType === 'AYUSH' || chiefComplaint === 'Ayurvedic / Holistic Wellness';
    const ayushKeys = ['prakriti_temperament', 'agni_digestive_power', 'koshtha_bowel_nature', 'ahara_vihara_lifestyle', 'bala_vyayama_shakti'];
    const section = isAyushMode ? 'ayush' : 'hpi';
    const question_key = isAyushMode ? (ayushKeys[activeQuestionIdx] || `ayush_${activeQuestionIdx}`) : `q_${activeQuestionIdx}`;

    if (sessionId) {
      await fetch(`${API_BASE}/intake/session/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, question_key, answer_text: answer, is_voice: true }),
      }).catch(() => {});
    }

    if (activeQuestionIdx + 1 >= QUESTIONS.length) {
      setStep('DOCUMENTS');
    } else {
      setActiveQuestionIdx((prev) => prev + 1);
    }
  };

  /* ───────────────────────────────────────────────────────────
     5. Document upload
  ─────────────────────────────────────────────────────────── */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'Prescription');
    formData.append('timeline_year', '2025');
    try {
      const res  = await fetch(`${API_BASE}/intake/session/${sessionId || 'SES-1'}/document`, { method: 'POST', body: formData });
      const data = await res.json();
      setUploadedDocs((prev) => [...prev, data]);
    } catch {}
    setIsUploading(false);
  };

  /* ───────────────────────────────────────────────────────────
     6. Generate summary + enqueue
  ─────────────────────────────────────────────────────────── */
  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const summaryRes  = await fetch(`${API_BASE}/intake/session/${sessionId || 'SES-1'}/generate-summary`, { method: 'POST' });
      const summaryData = await summaryRes.json();
      setSummaryDraft(summaryData.summary_draft);

      const completeRes = await fetch(`${API_BASE}/intake/session/${sessionId || 'SES-1'}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: isEmergencyBypass ? 'Emergency' : (consultationType === 'AYUSH' ? 'AYUSH' : 'General Medicine') }),
      });
      const tokenData = await completeRes.json();
      setFinalToken(tokenData);
      setStep('SUMMARY_TOKEN');

      // Update patient profile onboarding status
      const targetPatientId = selectedPatient?.patient_id || user?.patient_id;
      if (targetPatientId) {
        try {
          await fetch(`${API_BASE}/auth/patients/me/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patient_id: targetPatientId,
              onboarding_completed: true,
              intake_step: 'completed',
            }),
          });
        } catch (e) {}
        try {
          const raw = localStorage.getItem('aura_patient_user');
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.onboarding_completed = true;
            parsed.intake_step = 'completed';
            localStorage.setItem('aura_patient_user', JSON.stringify(parsed));
          }
        } catch (e) {}
      }

      // Announce the token in the patient's language
      playTTS(`Your OPD token is ${tokenData.ticket_number}. Please proceed to ${tokenData.department}.`);
    } catch {}
    setLoading(false);
  };

  /* ═══════════════════════════════════════════════════════════
     ADAPTIVE CLINICAL QUESTIONS
  ═══════════════════════════════════════════════════════════ */
  const getAdaptiveQuestions = () => {
    // AYUSH Dashavidha Pariksha Mode (AIIA / Ministry of Ayush)
    if (chiefComplaint === 'Ayurvedic / Holistic Wellness' || consultationType === 'AYUSH') {
      return [
        t('ay_q0', '🌿 Prakriti Assessment: What is your natural body constitution and weather/temperature tolerance?'),
        t('ay_q1', '🔥 Agni (Digestive Fire): How is your hunger, appetite rhythm, and digestion?'),
        t('ay_q2', '🚽 Koshtha (Bowel Nature): How would you describe your bowel movements and evacuation?'),
        t('ay_q3', '🥗 Ahara-Vihara (Diet & Routine): Describe your dietary habits, sleep quality (Nidra), and daily schedule:'),
        t('ay_q4', '💪 Bala & Vyayama Shakti: How is your daily physical stamina, endurance, and exercise capacity?'),
      ];
    }
    if (chiefComplaint === 'Chest Pain') {
      return [
        t('cp_q0', 'Where exactly is the chest discomfort, and does it radiate to your left arm, neck, or jaw?'),
        t('cp_q1', 'Rate the pain severity from 1 (mild) to 10 (unbearable):'),
        t('cp_q2', 'Are you experiencing sudden shortness of breath, cold sweating, or dizziness?'),
        t('cp_q3', 'Do you have existing hypertension, high cholesterol, or previous cardiac history?'),
      ];
    }
    if (chiefComplaint === 'Difficulty Breathing') {
      return [
        t('db_q0', 'When did this breathlessness start, and does it worsen when lying flat or walking?'),
        t('db_q1', 'How would you rate your breathing difficulty right now?'),
        t('db_q2', 'Do you have known Asthma, COPD, or a persistent cough with sputum?'),
        t('db_q3', 'Are your lips or fingernails pale or bluish, or do you feel chest heaviness?'),
      ];
    }
    if (chiefComplaint === 'High Fever & Chills') {
      return [
        t('fev_q0', 'When did the high fever start, and is it accompanied by shivering or chills?'),
        t('fev_q1', 'How severe is your body pain, weakness, or fatigue?'),
        t('fev_q2', 'Any persistent vomiting, skin rash, or stiff neck?'),
        t('fev_q3', 'Have you taken paracetamol or any antipyretic medicine today?'),
      ];
    }
    return [
      t('q0', `When did this ${chiefComplaint || 'problem'} start?`),
      t('q1', 'How would you rate the severity of your discomfort?'),
      t('q2', 'Do you have existing conditions like Diabetes, Blood Pressure or Asthma?'),
      t('q3', 'Any previous surgeries, procedures or known medicine allergies?'),
    ];
  };

  const getAdaptiveOptions = () => {
    // AYUSH Dashavidha Pariksha Options
    if (chiefComplaint === 'Ayurvedic / Holistic Wellness' || consultationType === 'AYUSH') {
      return [
        [
          'Vata: Lean build, dry skin, sensitive to cold/wind',
          'Pitta: Medium build, warm body, sweats easily, sensitive to heat',
          'Kapha: Heavy build, smooth/oily skin, calm, sensitive to cold/damp',
          'Mixed / Dwandwaja (Vata-Pitta / Pitta-Kapha)'
        ],
        [
          'Samagni: Balanced, timely appetite & comfortable digestion',
          'Tikshnagni: Intense/sharp hunger, acidity & burning sensation',
          'Mandagni: Sluggish/poor appetite, heaviness after meals',
          'Vishamagni: Irregular hunger, gas, bloating & erratic digestion'
        ],
        [
          'Krura Koshtha: Hard, dry stools, prone to constipation',
          'Mridu Koshtha: Soft stools, quick evacuation (quick response to milk)',
          'Madhyama Koshtha: Regular, formed stools once or twice daily',
          'Irregular: Fluctuating frequency with incomplete evacuation'
        ],
        [
          'Regular warm home food, sound 7-8h sleep, active schedule',
          'Irregular meal times, spicy/fried food, disturbed sleep',
          'Sedentary routine, daytime naps, heavy/cold food intake',
          'High work stress, late dinner, chronic insomnia'
        ],
        [
          'Pravara Bala: High stamina, vigorous exercise daily, energetic',
          'Madhyama Bala: Moderate strength, mild exertion causes fatigue',
          'Avara Bala: Low stamina, easily exhausted, chronic tiredness',
          'Sedentary / Unable to perform physical exertion'
        ]
      ];
    }
    if (chiefComplaint === 'Chest Pain') {
      return [
        ['Substernal (Center of chest)', 'Radiating to left arm/jaw', 'Sharp localized pain', 'Upper back tightness'],
        [t('o1_0','Mild (1-3)'), t('o1_1','Moderate (4-6)'), t('o1_2','Severe (7-8)'), t('o1_3','Unbearable (9-10)')],
        ['Yes, profuse sweating & dizzy', 'Short of breath only', 'Mild nausea', 'No secondary symptoms'],
        ['High BP & Diabetes', 'Cardiac stent/bypass history', 'High Cholesterol', 'None known'],
      ];
    }
    if (chiefComplaint === 'Difficulty Breathing') {
      return [
        ['Started today (< 24h)', 'Worse when lying flat', 'Gradual over 3-5 days', 'Sudden acute onset'],
        [t('o1_0','Mild (1-3)'), t('o1_1','Moderate (4-6)'), t('o1_2','Severe (7-8)'), t('o1_3','Unbearable (9-10)')],
        ['Known Asthma / Inhaler user', 'COPD / Smoker', 'Productive cough', 'No prior lung disease'],
        ['Yes, bluish tinge / tightness', 'Chest tightness only', 'Mild cough', 'None of these'],
      ];
    }
    return [
      [t('o0_0','Today (< 24 hours)'), t('o0_1','2 to 3 days ago'), t('o0_2','1 week ago'), t('o0_3','More than a month (Chronic)')],
      [t('o1_0','Mild (1-3)'), t('o1_1','Moderate (4-6)'), t('o1_2','Severe (7-8)'), t('o1_3','Unbearable (9-10)')],
      [t('o2_0','Diabetes (Sugar)'), t('o2_1','High Blood Pressure (HTN)'), t('o2_2','Asthma / Breathing'), t('o2_3','None / Healthy')],
      ['No surgeries / No allergies', 'Known drug allergy', 'Past surgical procedure', 'Multiple allergies'],
    ];
  };

  const QUESTIONS = getAdaptiveQuestions();
  const OPTIONS = getAdaptiveOptions();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Kiosk header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
        padding: '16px 24px', borderRadius: '16px', border: '1px solid #334155',
        marginBottom: '24px', boxShadow: '0 8px 24px rgba(0,0,0,.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#0d9488', padding: '10px', borderRadius: '12px', color: '#fff' }}>
            <Stethoscope size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                AuraHealth MediKiosk™
              </h2>
              <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                AI Clinical Intake
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Self-service clinical history • Document scanning • Multilingual AI triage
            </p>
          </div>
        </div>

        {/* Language switcher + mic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* ── Inline language dropdown ── */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Globe size={15} color="#38bdf8" style={{ position: 'absolute', left: '10px', pointerEvents: 'none', zIndex: 1 }} />
            <select
              value={selectedLanguage.code}
              onChange={(e) => {
                const lang = INDIAN_LANGUAGES.find((l) => l.code === e.target.value);
                if (lang) {
                  setSelectedLanguage(lang);
                  // Pass `lang` directly — avoids stale closure on selectedLanguage
                  playTTSInLang('Language changed. Welcome to AuraHealth MediKiosk.', lang);
                }
              }}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '10px',
                padding: '8px 32px 8px 30px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                minWidth: '155px',
              }}
            >
              <optgroup label="🇮🇳 Indian Languages" style={{ background: '#1e293b', color: '#94a3b8' }}>
                {INDIAN_LANGUAGES.filter((l) => l.group === 'Indian').map((l) => (
                  <option key={l.code} value={l.code} style={{ background: '#1e293b', color: '#f8fafc' }}>
                    {l.flag} {l.native} — {l.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌐 International" style={{ background: '#1e293b', color: '#94a3b8' }}>
                {INDIAN_LANGUAGES.filter((l) => l.group === 'International').map((l) => (
                  <option key={l.code} value={l.code} style={{ background: '#1e293b', color: '#f8fafc' }}>
                    {l.flag} {l.native} — {l.name}
                  </option>
                ))}
              </optgroup>
            </select>
            {/* custom chevron */}
            <svg
              style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }}
              width="12" height="12" viewBox="0 0 12 12" fill="none"
            >
              <path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* ── Mic / TTS button ── */}
          <button
            onClick={handleMicToggle}
            style={{
              background: micState === 'LISTENING' ? '#ef4444' : micState === 'SPEAKING' ? '#0284c7' : '#1e293b',
              color: '#fff', border: '1px solid #475569', padding: '8px 16px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontWeight: 700, fontSize: '13px', transition: 'all .2s', whiteSpace: 'nowrap',
            }}
          >
            {micState === 'LISTENING' ? <MicOff size={16} /> : <Mic size={16} />}
            {micState === 'LISTENING' ? t('stopListening', 'Stop Listening')
              : micState === 'SPEAKING' ? t('aiSpeaking', 'AI Speaking…')
              : t('aiVoiceInput', 'Voice Input')}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          STEP 1 — IDENTIFY
      ══════════════════════════════════════════════════════ */}
      {step === 'IDENTIFY' && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            👋 {t('welcomeTitle','Welcome to Hospital Clinical Intake')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
            {t('welcomeSub','Confirm your identity or search using UHID, Patient ID, Phone or ABHA ID.')}
          </p>

          {/* Active patient banner */}
          {selectedPatient && (
            <div style={{
              maxWidth: '640px', margin: '0 auto 24px',
              background: 'rgba(13,148,136,.08)', border: '2px solid var(--primary)',
              borderRadius: '12px', padding: '18px', textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {t('activeProfile','Active Patient Profile')}
                  </span>
                  <h3 style={{ margin: '6px 0 2px', fontSize: '18px', fontWeight: 800 }}>{selectedPatient.name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    ID: {selectedPatient.patient_id} &bull; UHID: {selectedPatient.uhid} &bull; Age: {selectedPatient.age} ({selectedPatient.gender})
                  </p>
                </div>
                <button onClick={() => setStep('LANGUAGE')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {t('proceedProfile','Proceed with this Profile')} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder={t('searchPlaceholder','Enter UHID, Phone, ABHA or Name…')}
                value={patientLookupQuery}
                onChange={(e) => setPatientLookupQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                style={{ flex: 1, padding: '14px 18px', fontSize: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a' }}
              />
              <button onClick={handleSearchPatient} className="btn-primary" style={{ padding: '0 24px' }} disabled={searchLoading}>
                {searchLoading ? '…' : t('search','Search')}
              </button>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                {searchResults.map((pt) => (
                  <div
                    key={pt.patient_id}
                    onClick={() => { setSelectedPatient(pt); setStep('LANGUAGE'); }}
                    style={{
                      padding: '12px', borderRadius: '8px', background: '#fff',
                      border: '1px solid #cbd5e1', marginBottom: '8px',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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

            {/* No results + register prompt */}
            {searchResults.length === 0 && patientLookupQuery && !searchLoading && (
              <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#92400e' }}>
                ⚠️ No patient record found for "<strong>{patientLookupQuery}</strong>".
              </div>
            )}

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center' }}>
              {user ? (
                <>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Need to update your clinical or contact information?
                  </span>
                  <button
                    onClick={() => onEditPatient ? onEditPatient(selectedPatient || user) : alert('You can update details in Profile Settings.')}
                    style={{
                      display: 'block', margin: '12px auto 0',
                      background: 'transparent', border: '1px solid var(--primary)',
                      color: 'var(--primary)', padding: '10px 24px', borderRadius: '8px',
                      fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                    }}
                  >
                    ✏️ Edit Patient Details
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {t('firstTime','First time visiting this hospital?')}
                  </span>
                  <button
                    onClick={() => onGoToRegister ? onGoToRegister() : alert('Please use the Patient Portal registration page.')}
                    style={{
                      display: 'block', margin: '12px auto 0',
                      background: 'transparent', border: '1px solid var(--primary)',
                      color: 'var(--primary)', padding: '10px 24px', borderRadius: '8px',
                      fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                    }}
                  >
                    {t('registerNew','➕ Register as New Patient')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 2 — LANGUAGE
      ══════════════════════════════════════════════════════ */}
      {step === 'LANGUAGE' && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🌐</span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
              {t('selectLang','Select Your Preferred Language')}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
            {t('patient','Patient')}: <strong>{selectedPatient?.name || user?.name || 'Patient'}</strong> ({selectedPatient?.patient_id || user?.patient_id || 'PT-1001'})
          </p>

          <div style={{ maxWidth: '900px', margin: '0 auto 32px' }}>
            {/* ── Indian languages ── */}
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              🇮🇳 Indian Languages
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '10px', marginBottom: '24px' }}>
              {INDIAN_LANGUAGES.filter((l) => l.group === 'Indian').map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang);
                    playTTSInLang(`Welcome ${selectedPatient?.name || user?.name || 'Patient'}. Please confirm your clinical consent.`, lang);
                  }}
                  style={{
                    padding: '14px 8px', borderRadius: '12px',
                    border: selectedLanguage.code === lang.code ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                    background: selectedLanguage.code === lang.code ? 'rgba(13,148,136,.1)' : '#fff',
                    cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{lang.flag}</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: selectedLanguage.code === lang.code ? 'var(--primary)' : '#0f172a' }}>
                    {lang.native}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{lang.name}</div>
                  {selectedLanguage.code === lang.code && (
                    <div style={{ marginTop: '4px' }}><CheckCircle size={14} color="var(--primary)" /></div>
                  )}
                </button>
              ))}
            </div>

            {/* ── International languages ── */}
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              🌐 International Languages
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '10px' }}>
              {INDIAN_LANGUAGES.filter((l) => l.group === 'International').map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang);
                    playTTSInLang(`Welcome ${selectedPatient?.name || user?.name || 'Patient'}. Please confirm your clinical consent.`, lang);
                  }}
                  style={{
                    padding: '14px 8px', borderRadius: '12px',
                    border: selectedLanguage.code === lang.code ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: selectedLanguage.code === lang.code ? 'rgba(2,132,199,.08)' : '#fff',
                    cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{lang.flag}</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: selectedLanguage.code === lang.code ? '#0284c7' : '#0f172a' }}>
                    {lang.native}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{lang.name}</div>
                  {selectedLanguage.code === lang.code && (
                    <div style={{ marginTop: '4px' }}><CheckCircle size={14} color="#0284c7" /></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '840px', margin: '0 auto' }}>
            <button onClick={() => setStep('IDENTIFY')} className="btn-secondary">
              <ArrowLeft size={16} /> {t('backBtn','Back')}
            </button>
            <button onClick={() => setStep('CONSENT')} className="btn-primary" style={{ padding: '12px 28px', fontSize: '16px' }}>
              {t('continuBtn','Continue')} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 3 — CONSENT
      ══════════════════════════════════════════════════════ */}
      {step === 'CONSENT' && (
        <div className="card" style={{ padding: '32px', maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#0284c7', color: '#fff', padding: '10px', borderRadius: '10px' }}>
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {t('consentTitle','Digital Health Intake Consent')}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {t('consentSub','Consent-First Architecture & Patient Privacy Protection')}
              </span>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.7', color: '#334155', marginBottom: '20px' }}>
            <p style={{ marginTop: 0 }}>
              <strong>{t('consentWhat','What information is collected?')}</strong>{' '}
              {t('consentWhatAns','Your reported symptoms, previous medical history, uploaded prescriptions and vital parameters.')}
            </p>
            <p>
              <strong>{t('consentHow','How AI is used?')}</strong>{' '}
              {t('consentHowAns','AI structures your conversation into a draft summary for your attending doctor. AI does NOT diagnose your condition.')}
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>{t('consentWho','Who accesses it?')}</strong>{' '}
              {t('consentWhoAns','Only licensed attending hospital physicians, triage nurses and certified pharmacists.')}
            </p>
          </div>

          {/* Audio consent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', background: 'rgba(2,132,199,.08)', padding: '12px 16px', borderRadius: '10px' }}>
            <button
              onClick={() => {
                setAudioConsentActive(true);
                playTTS('This hospital uses an AI intake assistant to help prepare your clinical file for the doctor. Your information remains strictly private.');
              }}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
            >
              <Volume2 size={16} /> {t('listenAudio','Listen to Audio Consent')}
            </button>
            <span style={{ fontSize: '13px', color: '#0369a1' }}>
              {t('audioPlaying','Audio explanation playing in')} <strong>{selectedLanguage.native}</strong> {t('lowLiteracy','for low-literacy guidance.')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep('LANGUAGE')} className="btn-secondary">
              <ArrowLeft size={16} /> {t('changeLang','Change Language')}
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleConsentSubmit(false)}
                style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {t('declineConsent','Decline')}
              </button>
              <button onClick={() => handleConsentSubmit(true)} className="btn-primary" style={{ padding: '10px 24px' }} disabled={loading}>
                {loading ? '…' : t('grantConsent','✓ Grant Consent & Start Intake')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 4 — INTAKE TYPE (chief complaint)
      ══════════════════════════════════════════════════════ */}
      {step === 'INTAKE_TYPE' && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            {t('visitReason','What is your primary reason for visiting today?')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
            {t('visitReasonSub','Select your main complaint or speak using the microphone.')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '16px', marginBottom: '32px' }}>
            {translatedComplaints.map((item) => (
              <button
                key={item.id}
                onClick={() => handleChiefComplaintSelect(item)}
                style={{
                  padding: '20px 16px', borderRadius: '16px',
                  border: item.emergency ? '1px solid #f87171' : '1px solid #cbd5e1',
                  background: item.isAyush ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : item.emergency ? '#fff1f2' : '#fff',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'all .2s',
                }}
              >
                <div style={{ fontSize: '30px' }}>{item.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: item.emergency ? '#be123c' : item.isAyush ? '#15803d' : '#0f172a' }}>
                  {item.labelTx || item.label}
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  {t('dept','Dept')}: {item.dept} {item.emergency && `• ⚠️ ${t('urgent','Urgent')}`}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button onClick={() => setStep('CONSENT')} className="btn-secondary">
              <ArrowLeft size={16} /> {t('backBtn','Back')}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 5 — HISTORY (Q&A)
      ══════════════════════════════════════════════════════ */}
      {step === 'HISTORY' && (
        <div className="card" style={{ padding: '32px' }}>
          {/* Emergency banner */}
          {isEmergencyBypass && (
            <div style={{
              background: 'linear-gradient(135deg,#ef4444,#b91c1c)', color: '#fff',
              padding: '16px 20px', borderRadius: '12px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 14px rgba(239,68,68,.4)',
            }}>
              <AlertOctagon size={32} />
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{t('emergencyTitle','🚨 Potential Emergency Indicator Detected')}</h4>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{t('emergencySub','These symptoms may require urgent medical assessment.')}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Section {activeQuestionIdx + 1}: {consultationType === 'AYUSH' ? t('ayushHistory','🌿 AYUSH Dashavidha Pariksha') : t('clinicalHistory','🩺 Clinical History')}
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                {QUESTIONS[Math.min(activeQuestionIdx, QUESTIONS.length - 1)]}
              </h3>
            </div>
            <button
              onClick={() => playTTS(QUESTIONS[Math.min(activeQuestionIdx, QUESTIONS.length - 1)])}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Volume2 size={15} /> {t('repeatQuestion','Repeat Question')}
            </button>
          </div>

          {/* Touch option buttons */}
          {activeQuestionIdx < OPTIONS.length && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px', marginBottom: '24px' }}>
              {OPTIONS[activeQuestionIdx].map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => {
                    setVoiceTranscript(opt);
                    if (opt.includes('nbear') || opt.includes('9-10')) setIsEmergencyBypass(true);
                  }}
                  className="btn-secondary"
                  style={{ padding: '14px', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Voice input area */}
          <div style={{
            background: '#f8fafc',
            border: micState === 'LISTENING' ? '2px solid #ef4444' : '1px solid #cbd5e1',
            padding: '18px', borderRadius: '12px', marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                {micState === 'LISTENING' ? t('listeningLabel','🎙️ Listening to your voice…') : t('answerLabel','Speech / Selected Answer:')}
              </span>
              <button
                onClick={handleMicToggle}
                style={{
                  background: micState === 'LISTENING' ? '#ef4444' : '#0d9488',
                  color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {micState === 'LISTENING' ? <MicOff size={14} /> : <Mic size={14} />}
                {micState === 'LISTENING' ? t('stopListening','Stop Listening') : t('speakAnswer','Speak Answer')}
              </button>
            </div>
            <textarea
              rows={3}
              value={voiceTranscript}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              placeholder={t('typeDirectly','Your answer will appear here as you speak, or type directly…')}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: '15px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('INTAKE_TYPE')} className="btn-secondary">
              <ArrowLeft size={16} /> {t('backBtn','Back')}
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep('DOCUMENTS')} className="btn-secondary" style={{ color: '#0284c7' }}>
                {t('skipDocs','Skip to Document Scan ➔')}
              </button>
              <button onClick={handleVoiceAnswerSubmit} className="btn-primary">
                {t('saveNext','Save & Next Question')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 6 — DOCUMENTS
      ══════════════════════════════════════════════════════ */}
      {step === 'DOCUMENTS' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#0d9488', color: '#fff', padding: '10px', borderRadius: '10px' }}>
              <Upload size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                {t('uploadTitle','Scan or Upload Previous Medical Documents')}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                {t('uploadSub','Upload old prescriptions, lab reports or discharge summaries.')}
              </p>
            </div>
          </div>

          {/* Drop zone */}
          <div style={{ border: '2px dashed #94a3b8', borderRadius: '16px', padding: '40px', textAlign: 'center', background: '#f8fafc', marginBottom: '24px', cursor: 'pointer' }}>
            <input type="file" id="kiosk-file-upload" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            <label htmlFor="kiosk-file-upload" style={{ cursor: 'pointer' }}>
              <FileText size={44} color="#0d9488" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {isUploading ? t('extracting','Extracting clinical text with OCR…') : t('uploadClick','Click to Upload Prescription / Lab Report')}
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{t('uploadFormats','Supports PDF, Images (PNG, JPG) & Text files')}</span>
            </label>
          </div>

          {/* Uploaded docs list */}
          {uploadedDocs.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                {t('extractedDocs','Extracted Documents & Timeline Events')} ({uploadedDocs.length}):
              </h4>
              {uploadedDocs.map((doc) => (
                <div key={doc.document_id} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>{doc.filename}</strong>
                      <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Year {doc.timeline_year}</span>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>✓ OCR Extracted</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {doc.document_type} — {doc.extracted_data?.clinical_impression || 'Clinical notes captured'}
                    </div>
                  </div>
                  <CheckCircle size={20} color="#10b981" />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('HISTORY')} className="btn-secondary">
              <ArrowLeft size={16} /> {t('backBtn','Back')}
            </button>
            <button onClick={handleGenerateSummary} className="btn-primary" style={{ padding: '12px 28px', fontSize: '16px' }} disabled={loading}>
              {loading ? <><Activity size={16} /> Generating…</> : <>{t('generateBtn','Generate AI Summary & Issue Token')} <ArrowRight size={16} /></>}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 7 — TOKEN PASS
      ══════════════════════════════════════════════════════ */}
      {step === 'SUMMARY_TOKEN' && finalToken && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(16,185,129,.1)', color: '#059669', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px' }}>
            {t('intakeComplete','Intake Completed Successfully!')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
            {t('summaryTransmit','Your clinical summary has been transmitted to attending physician')}{' '}
            <strong>{finalToken.assigned_doctor}</strong>.
          </p>

          {/* Token card */}
          <div style={{
            maxWidth: '500px', margin: '0 auto 28px',
            background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: '#fff',
            padding: '28px', borderRadius: '20px', textAlign: 'left',
            boxShadow: '0 12px 30px rgba(0,0,0,.3)', border: '1px solid #334155',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #475569', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>CareEase AI Hospital Pass</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800 }}>{selectedPatient?.name}</h3>
                <span style={{ fontSize: '12px', color: '#38bdf8' }}>
                  ID: {selectedPatient?.patient_id} | UHID: {selectedPatient?.uhid}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Queue Ticket</span>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#38bdf8' }}>{finalToken.ticket_number}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px', marginBottom: '16px' }}>
              <div><span style={{ color: '#94a3b8' }}>Department:</span><div style={{ fontWeight: 700 }}>{finalToken.department}</div></div>
              <div><span style={{ color: '#94a3b8' }}>Doctor:</span><div style={{ fontWeight: 700 }}>{finalToken.assigned_doctor}</div></div>
              <div>
                <span style={{ color: '#94a3b8' }}>Triage Priority:</span>
                <div style={{ fontWeight: 700, color: finalToken.is_emergency ? '#f87171' : '#34d399' }}>● {finalToken.priority}</div>
              </div>
              <div><span style={{ color: '#94a3b8' }}>Est. Wait:</span><div style={{ fontWeight: 700 }}>{finalToken.estimated_wait_minutes} mins</div></div>
            </div>

            <div style={{ background: 'rgba(255,255,255,.05)', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', border: '1px solid #334155' }}>
              📱 Please proceed to <strong>{finalToken.department}</strong> when your ticket is announced.
            </div>
          </div>

          {/* ── ABDM FHIR Integration Badge & Actions (Ministry of Ayush / AIIA Compliance) ── */}
          <div style={{
            maxWidth: '500px', margin: '0 auto 28px',
            background: 'linear-gradient(135deg, rgba(2,132,199,.08) 0%, rgba(13,148,136,.08) 100%)',
            border: '1px solid #38bdf8',
            borderRadius: '16px', padding: '18px 22px', textAlign: 'left',
            boxShadow: '0 4px 20px rgba(2,132,199,.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#0284c7" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1' }}>
                  ABDM FHIR R4 Standardized Record
                </span>
              </div>
              <span style={{ fontSize: '10px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                NRCES Validated
              </span>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
              Clinical history and Dashavidha Pariksha encoded according to Ayushman Bharat Digital Mission (ABDM) FHIR <code>QuestionnaireResponse</code> specifications.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownloadFhir()}
                style={{
                  flex: 1, minWidth: '180px',
                  background: 'linear-gradient(135deg,#0284c7,#0d9488)', color: '#fff',
                  border: 'none', borderRadius: '10px', padding: '10px 14px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  boxShadow: '0 2px 10px rgba(2,132,199,.3)'
                }}
              >
                <FileText size={15} /> Download FHIR JSON
              </button>
              <button
                onClick={() => handleOpenFhirModal()}
                style={{
                  background: '#fff', color: '#0369a1',
                  border: '1px solid #bae6fd', borderRadius: '10px', padding: '10px 16px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                👁️ View FHIR
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => playTTS(`Your OPD token is ${finalToken.ticket_number}. Please go to ${finalToken.department}.`)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Volume2 size={16} /> Hear Token Info
            </button>
            <button
              onClick={() => {
                setStep('IDENTIFY');
                setSelectedPatient(user ? {
                  patient_id: user.patient_id || 'PT-1001',
                  uhid: user.uhid || 'UHID-2026-001001',
                  name: user.name, age: user.age || 35, gender: user.gender || 'Male',
                  phone: user.phone || '', blood_group: user.blood_group || 'O+', allergies: 'None',
                } : null);
                setSummaryDraft(null); setFinalToken(null);
                setActiveQuestionIdx(0); setRedFlagsDetected([]); setIsEmergencyBypass(false);
                setVoiceTranscript(''); setUploadedDocs([]); setSessionId(null);
                if (onComplete) onComplete();
              }}
              className="btn-primary"
              style={{ padding: '12px 32px', fontSize: '16px' }}
            >
              {t('doneBtn','Done / Return to Dashboard')}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: ABDM FHIR JSON Preview ── */}
      {fhirModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.75)', backdropFilter: 'blur(6px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid #334155', borderRadius: '16px',
            width: '100%', maxWidth: '750px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,.5)', color: '#f8fafc'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  HL7 FHIR R4 QuestionnaireResponse (ABDM Compliant)
                </h3>
              </div>
              <button
                onClick={() => setFhirModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontSize: '12px', fontFamily: 'monospace', background: '#020617', color: '#38bdf8', lineHeight: '1.5' }}>
              {fhirLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Generating FHIR Resource…</div>
              ) : (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(fhirData, null, 2)}
                </pre>
              )}
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderTop: '1px solid #334155', background: '#0f172a'
            }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Profile: nrces.in/ndhm/fhir/r4/StructureDefinition/QuestionnaireResponse
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(fhirData, null, 2));
                    setCopiedFhir(true);
                    setTimeout(() => setCopiedFhir(false), 2000);
                  }}
                  style={{
                    background: copiedFhir ? '#10b981' : '#334155', color: '#fff',
                    border: 'none', borderRadius: '8px', padding: '8px 14px',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {copiedFhir ? '✓ Copied' : 'Copy JSON'}
                </button>
                <button
                  onClick={() => handleDownloadFhir()}
                  style={{
                    background: '#0284c7', color: '#fff',
                    border: 'none', borderRadius: '8px', padding: '8px 16px',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Download .json
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
