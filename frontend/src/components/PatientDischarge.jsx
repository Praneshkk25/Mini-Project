import React, { useState, useEffect } from 'react';

const BACKEND_URL = "http://127.0.0.1:8000";

// Translation Labels for UI elements in different languages
const UI_LABELS = {
    "English": {
        medTimeline: "Daily Medicine Schedule",
        warnings: "Emergency Warning Signs",
        warningsSub: "Return to the hospital immediately if you experience any of these:",
        diet: "Diet & Activity Guide",
        dietDo: "What to Eat / Do",
        dietDont: "What to Avoid",
        followUp: "Next Doctor Visit",
        audioGuide: "Multilingual Voice Guide",
        audioStatus: "Listen to this summary in English",
        diagTitle: "Simplified Medical Diagnosis",
        addReminders: "Add Reminders"
    },
    "Hindi": {
        medTimeline: "दवाइयों की दैनिक समय सारणी",
        warnings: "आपातकालीन चेतावनी के लक्षण",
        warningsSub: "यदि इनमें से कोई भी लक्षण महसूस हो तो तुरंत अस्पताल जाएं:",
        diet: "खान-पान और गतिविधियों की सलाह",
        dietDo: "क्या खाएं / क्या करें",
        dietDont: "किन चीज़ों से परहेज़ करें",
        followUp: "डॉक्टर से अगली मुलाक़ात",
        audioGuide: "बहुभाषी वॉयस गाइड",
        audioStatus: "इस सारांश को हिंदी में सुनें",
        diagTitle: "सरल शब्दों में बीमारी की जानकारी",
        addReminders: "रिमाइंडर जोड़ें"
    },
    "Tamil": {
        medTimeline: "தினசரி மருந்து அட்டவணை",
        warnings: "அவசര எச்சரிக்கை அறிகுறிகள்",
        warningsSub: "இவற்றில் ஏதேனும் ஏற்பட்டால் உடனடியாக மருத்துவமனைக்குத் திரும்பவும்:",
        diet: "உணவு & செயல்முறை வழிகாட்டி",
        dietDo: "உண்ண வேண்டியவை / செய்ய வேண்டியவை",
        dietDont: "தவிர்க்க வேண்டியவை",
        followUp: "அடுத்த மருத்துவர் வருகை",
        audioGuide: "பல்மொழி குரல் வழிகாட்டி",
        audioStatus: "இந்த சுരുക്കத்தை தமிழில் கேளுங்கள்",
        diagTitle: "எளிமைப்படுத்தப்பட்ட மருத்துவ நோயறிதல்",
        addReminders: "நினைവൂറ്റൽ ചേർക്കുക"
    },
    "Telugu": {
        medTimeline: "రోజువారీ మందుల సమయ పట్టిక",
        warnings: "అత్యవసర హెచ్చరిక సంకేతాలు",
        warningsSub: "వీటిలో ఏదైనా సంభవిస్తే వెంటనే ఆసుപత్రికి తిరిగి వెళ్ళండి:",
        diet: "ఆহారం & జీవనశైలి మార్గదర్శిని",
        dietDo: "తినవలసినవి / చేయవలసినవి",
        dietDont: "తినకూడనివి / నివారించవలసినవి",
        followUp: "తదుపరి వైద్యుల సందర్శన",
        audioGuide: "బహుభాషా వాయిస్ గైడ్",
        audioStatus: "ఈ సారాంశాన్ని తెలుగులో వినండి",
        diagTitle: "సులभమైన అనారోగ్య వివరణ",
        addReminders: "రిమైండర్ పెట్టుకోండి"
    },
    "Kannada": {
        medTimeline: "ದೈನಂದಿನ ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ",
        warnings: "ತುರ್ತು ಎಚ್ಚರಿಕೆಯ ಲಕ್ಷಣಗಳು",
        warningsSub: "ಈ ಕೆಳಗಿನ ಯಾವುದೇ ಲക്ഷണಗಳು ಕಂಡುಬಂದರೆ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ:",
        diet: "ಆಹಾರ ಮತ್ತು ಚಟುವಟಿಕೆ ಮಾರ್ಗದರ್ಶಿ",
        dietDo: "ತಿನ್ನಬೇಕಾದ ಆಹಾರ / ಮಾಡಬೇಕಾದ ಕೆಲಸಗಳು",
        dietDont: "ವರ್ಜಿಸಬೇಕಾದ ಆಹಾರಗಳು",
        followUp: "ಮುಂದಿನ ವೈದ್ಯರ ಭേಟಿ",
        audioGuide: "ಬಹುಭಾಷಾ ಧ್ವനി ಮಾರ್ಗದರ್ശി",
        audioStatus: "ಈ ಸಾರಾಂಶವನ್ನು ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ",
        diagTitle: "ಸರಳೀಕೃತ ಕಾಯಿಲೆಯ ವಿವರ",
        addReminders: "ನೆನಪೋಲೆ ಸೇರಿಸಿ"
    },
    "Bengali": {
        medTimeline: "দৈনিক ওষুধের সময়সূচী",
        warnings: "জরুরী সতর্কতামূলক লক্ষণ",
        warningsSub: "নিম্নলিখিত কোনো লক্ষণ দেখা দিলে অবিলম্বে হাসপাতালে যোগাযোগ করুন:",
        diet: "পথ্য ও জীবনযাত্রা নির্দেশিকা",
        dietDo: "যা খাবেন / যা করবেন",
        dietDont: "যা বর্জন করবেন",
        followUp: "পরবর্তী ডাক্তার ভিজিট",
        audioGuide: "বহুভাষী ভয়েস গাইড",
        audioStatus: "এই সারাংশটি বাংলায় শুনুন",
        diagTitle: "সহজ ভাষায় রোগ নির্ণয়ের বিবরণ",
        addReminders: "রিমাইন্ডার যোগ করুন"
    },
    "Marathi": {
        medTimeline: "रोजच्या औषधांचे वेळापत्रक",
        warnings: "तातडीच्या धोक्याची लक्षणे",
        warningsSub: "खालीलपैकी कोणतेही लक्षण दिसल्यास त्वरित रुग्णालयात जा:",
        diet: "आहार व जीवनशैली सल्ला",
        dietDo: "काय खावे / काय करावे",
        dietDont: "काय टाळावे",
        followUp: "पुढील डॉक्टरांची भेट",
        audioGuide: "बहुभाषिक व्हॉइस गाईड",
        audioStatus: "हा सारांश मराठीत ऐका",
        diagTitle: "आजाराची सोप्या भाषेतील माहिती",
        addReminders: "स्मरणपत्र जोडा"
    },
    "Malayalam": {
        medTimeline: "ദിനചര്യ മരുന്ന് സമയവിവരം",
        warnings: "അടിയന്തിര മുന്നറിയിപ്പ് ലക്ഷണങ്ങൾ",
        warningsSub: "താഴെ പറയുന്നവയിൽ എന്തെങ്കിലും അനുഭവപ്പെട്ടാൽ ഉടൻ ആശുപത്രിയിൽ എത്തുക:",
        diet: "ഭക്ഷണക്രമവും ജീവിതചര്യ നിർദ്ദേശങ്ങളും",
        dietDo: "കഴിക്കേണ്ടവ / ചെയ്യേണ്ടവ",
        dietDont: "ഒഴിവാക്കേണ്ടവ",
        followUp: "അടുത്ത ഡോക്ടർ സന്ദർശനം",
        audioGuide: "ബഹുഭാഷാ വോയ്‌സ് ഗൈഡ്",
        audioStatus: "ഈ വിവരണം മലയാളത്തിൽ കേൾക്കൂ",
        diagTitle: "ലളിതമായ രോഗവിവരം",
        addReminders: "ഓർമ്മപ്പെടുത്തൽ ചേർക്കുക"
    }
};

const BCP47_LANG_CODES = {
    "English": "en-IN",
    "Hindi": "hi-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Kannada": "kn-IN",
    "Bengali": "bn-IN",
    "Marathi": "mr-IN",
    "Malayalam": "ml-IN"
};

export default function PatientDischarge({
    parsedSummaryEnglish,
    setParsedSummaryEnglish,
    parsedSummaryTranslated,
    setParsedSummaryTranslated,
    activeLanguage,
    setActiveLanguage
}) {
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [takenMeds, setTakenMeds] = useState({});
    
    // TTS controls
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [backendAudio, setBackendAudio] = useState(null);

    // Stop speaking if language or data changes
    useEffect(() => {
        stopSpeech();
    }, [activeLanguage, parsedSummaryEnglish]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            const ext = selected.name.split('.').pop().toLowerCase();
            if (ext === 'pdf' || ext === 'txt') {
                setFile(selected);
            } else {
                alert("Please select a PDF or TXT file.");
            }
        }
    };

    const triggerUpload = async () => {
        if (!file) return;
        setLoading(true);
        
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${BACKEND_URL}/api/upload`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Analysis failed");
            }

            const data = await res.json();
            setParsedSummaryEnglish(data);
            
            // Run translation if not English
            await runTranslation(data, activeLanguage);
        } catch (err) {
            alert(`Analysis Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const runTranslation = async (engData, lang) => {
        if (lang === "English") {
            setParsedSummaryTranslated(engData);
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/explain`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    summary_json: engData,
                    language: lang
                })
            });

            if (!res.ok) throw new Error("Translation failed");
            const data = await res.json();
            setParsedSummaryTranslated(data);
        } catch (e) {
            console.error(e);
            setParsedSummaryTranslated(engData); // Fallback
        }
    };

    const handleLanguageChange = async (lang) => {
        setActiveLanguage(lang);
        if (parsedSummaryEnglish) {
            setLoading(true);
            await runTranslation(parsedSummaryEnglish, lang);
            setLoading(false);
        }
    };

    // Construct speech script and play
    const startSpeech = () => {
        if (!parsedSummaryTranslated) return;
        stopSpeech();

        const labels = UI_LABELS[activeLanguage] || UI_LABELS["English"];
        const script = generateSpeechScript(parsedSummaryTranslated, labels);

        const localSynth = window.speechSynthesis;
        const localeCode = BCP47_LANG_CODES[activeLanguage];

        if (localSynth && localeCode) {
            try {
                localSynth.cancel();
                const utter = new SpeechSynthesisUtterance(script);
                utter.lang = localeCode;
                utter.rate = 0.9;

                const voices = localSynth.getVoices();
                const matchedVoice = voices.find(v => v.lang === localeCode || v.lang.startsWith(localeCode.split('-')[0]));
                if (matchedVoice) utter.voice = matchedVoice;

                utter.onstart = () => setIsSpeaking(true);
                utter.onend = () => setIsSpeaking(false);
                utter.onerror = () => fallbackToBackendSpeech(script);

                localSynth.speak(utter);
                return;
            } catch (e) {
                console.error("Local synth start failed:", e);
            }
        }

        fallbackToBackendSpeech(script);
    };

    const fallbackToBackendSpeech = (text) => {
        const url = `${BACKEND_URL}/api/tts?text=${encodeURIComponent(text)}&language=${encodeURIComponent(activeLanguage)}`;
        try {
            const audioObj = new Audio(url);
            audioObj.play()
                .then(() => {
                    setIsSpeaking(true);
                    setBackendAudio(audioObj);
                })
                .catch(() => {
                    setIsSpeaking(false);
                });
            
            audioObj.onended = () => setIsSpeaking(false);
        } catch (e) {
            console.error(e);
            setIsSpeaking(false);
        }
    };

    const stopSpeech = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (backendAudio) {
            backendAudio.pause();
            setBackendAudio(null);
        }
        setIsSpeaking(false);
    };

    const generateSpeechScript = (data, labels) => {
        let script = `${labels.diagTitle}: ${data.diagnosis?.summary_simple || ""}. `;
        const medicines = data.medicines || [];
        
        if (medicines.length > 0) {
            script += `${labels.medTimeline}: `;
            let morningList = medicines.filter(m => m.morning).map(m => `${m.name}, ${m.dosage}, ${m.instructions}.`);
            let afternoonList = medicines.filter(m => m.afternoon).map(m => `${m.name}, ${m.dosage}, ${m.instructions}.`);
            let nightList = medicines.filter(m => m.night).map(m => `${m.name}, ${m.dosage}, ${m.instructions}.`);
            
            if (morningList.length > 0) script += `Morning doses: ${morningList.join(" ")} `;
            if (afternoonList.length > 0) script += `Afternoon doses: ${afternoonList.join(" ")} `;
            if (nightList.length > 0) script += `Night doses: ${nightList.join(" ")} `;
        }
        
        const warnings = data.warning_signs || [];
        if (warnings.length > 0) {
            script += `${labels.warnings}: ${warnings.join(". ")}. `;
        }
        
        const followUp = data.follow_up || {};
        if (followUp.date) {
            script += `${labels.followUp}: ${followUp.date}. ${followUp.instructions || ""}`;
        }
        
        return script;
    };

    // Calendar reminders downloads
    const downloadICSFile = () => {
        if (!parsedSummaryEnglish) return;
        const medicines = parsedSummaryEnglish.medicines || [];
        const followUp = parsedSummaryEnglish.follow_up || {};
        
        let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CareEase AI//Medical Reminders//EN\n";
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');

        for (let day = 0; day < 7; day++) {
            const curDate = new Date(now);
            curDate.setDate(now.getDate() + day);
            const dateStr = `${curDate.getFullYear()}${pad(curDate.getMonth() + 1)}${pad(curDate.getDate())}`;

            medicines.forEach((med, idx) => {
                const times = [];
                if (med.morning) times.push({ lbl: "Morning", time: "080000" });
                if (med.afternoon) times.push({ lbl: "Lunch", time: "133000" });
                if (med.night) times.push({ lbl: "Dinner", time: "203000" });

                times.forEach(t => {
                    ics += "BEGIN:VEVENT\n";
                    ics += `UID:med-${idx}-${dateStr}-${t.time}@careease.ai\n`;
                    ics += `DTSTART:${dateStr}T${t.time}\n`;
                    ics += `DTEND:${dateStr}T${t.time.replace("00", "30")}\n`;
                    ics += `SUMMARY:Medicine Dose: ${med.name}\n`;
                    ics += `DESCRIPTION:Dosage: ${med.dosage}\\nInstructions: ${med.instructions}\\nPurpose: ${med.purpose_simple || 'Medication'}\n`;
                    ics += "END:VEVENT\n";
                });
            });
        }

        if (followUp.date && followUp.date !== "Not scheduled.") {
            try {
                const futDate = new Date(now);
                futDate.setDate(now.getDate() + 7);
                const futStr = `${futDate.getFullYear()}${pad(futDate.getMonth() + 1)}${pad(futDate.getDate())}`;
                
                ics += "BEGIN:VEVENT\n";
                ics += `UID:followup-${futStr}@careease.ai\n`;
                ics += `DTSTART:${futStr}T100000\n`;
                ics += `DTEND:${futStr}T110000\n`;
                ics += `SUMMARY:OPD Doctor Follow-up Appointment\n`;
                ics += `DESCRIPTION:Instructions: ${followUp.instructions || 'Review session.'}\n`;
                ics += "END:VEVENT\n";
            } catch(e) {}
        }
        
        ics += "END:VCALENDAR";
        
        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "careease_medication_schedule.ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleMedTaken = (slot, idx) => {
        const key = `${slot}-${idx}`;
        setTakenMeds(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Reset summaries
    const resetPortal = () => {
        setFile(null);
        setParsedSummaryEnglish(null);
        setParsedSummaryTranslated(null);
        setTakenMeds({});
        stopSpeech();
    };

    const labels = UI_LABELS[activeLanguage] || UI_LABELS["English"];

    // Render loading state
    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loader-content">
                    <div className="spinner"></div>
                    <h3>Processing Health Documents...</h3>
                    <p>Generating personalized multilingual guidelines.</p>
                </div>
            </div>
        );
    }

    // Render main portal
    return (
        <div id="patient-discharge-workspace" className="workspace-panel fade-in">
            {!parsedSummaryTranslated ? (
                // 1. Upload file screen
                <section className="card">
                    <div className="upload-header">
                        <h2>Translate & Simplify Your Discharge Summary</h2>
                        <p>Upload your hospital discharge summary or prescription (PDF or text). We will translate it into your preferred regional language and explain everything in plain, easy-to-understand words.</p>
                    </div>

                    <div 
                        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            if (e.dataTransfer.files.length > 0) handleFileChange({ target: { files: e.dataTransfer.files } });
                        }}
                        onClick={() => document.getElementById("hidden-file-picker").click()}
                    >
                        <div className="drop-zone-content">
                            <div className="upload-animated-icon">
                                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            </div>
                            <h3>Drag & drop document here</h3>
                            <p>Supports PDFs & TXT files up to 10MB</p>
                            <span className="btn-primary">Browse Files</span>
                            <input 
                                type="file" 
                                id="hidden-file-picker" 
                                onChange={handleFileChange}
                                accept=".pdf,.txt" 
                                style={{ display: 'none' }} 
                            />
                        </div>
                    </div>

                    {file && (
                        <div className="selected-file-indicator">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="file-icon">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span id="file-name">{file.name}</span>
                            <button className="icon-btn" onClick={() => setFile(null)}>
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="lang-selector-section">
                        <h3>Select Patient's Preferred Language</h3>
                        <div className="lang-grid">
                            {Object.keys(UI_LABELS).map(langKey => (
                                <button 
                                    key={langKey} 
                                    className={`lang-btn ${activeLanguage === langKey ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange(langKey)}
                                >
                                    <span className="lang-native">
                                        {langKey === 'English' ? 'English' : 
                                         langKey === 'Hindi' ? 'हिन्दी' : 
                                         langKey === 'Tamil' ? 'தமிழ்' : 
                                         langKey === 'Telugu' ? 'తెలుగు' : 
                                         langKey === 'Kannada' ? 'ಕನ್ನಡ' : 
                                         langKey === 'Bengali' ? 'বাংলা' : 
                                         langKey === 'Marathi' ? 'मराठी' : 'മലയാളം'}
                                    </span>
                                    <span className="lang-name">{langKey}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="action-footer">
                        <button 
                            className="btn-accent btn-large width-full" 
                            disabled={!file}
                            onClick={triggerUpload}
                        >
                            <span>Analyze & Simplify Summary</span>
                        </button>
                    </div>
                </section>
            ) : (
                // 2. Parsed dashboard layout
                <div>
                    <div className="patient-banner card">
                        <div className="patient-meta">
                            <div className="meta-item">
                                <span class="meta-label">Patient Name</span>
                                <span class="meta-value">{parsedSummaryTranslated.patient_info?.name || "Unknown"}</span>
                            </div>
                            <div className="meta-item">
                                <span class="meta-label">Age / Gender</span>
                                <span class="meta-value">
                                    {parsedSummaryTranslated.patient_info?.age || "Unknown"} / {parsedSummaryTranslated.patient_info?.gender || "Unknown"}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span class="meta-label">Hospital</span>
                                <span class="meta-value">{parsedSummaryTranslated.patient_info?.hospital_name || "Unknown"}</span>
                            </div>
                            <div className="meta-item">
                                <span class="meta-label">Consulting Doctor</span>
                                <span class="meta-value">{parsedSummaryTranslated.patient_info?.doctor_name || "Unknown"}</span>
                            </div>
                        </div>
                        <div className="diagnosis-summary">
                            <h4>{labels.diagTitle}</h4>
                            <p>{parsedSummaryTranslated.diagnosis?.summary_simple || "No diagnostic details available."}</p>
                        </div>
                    </div>

                    {/* Voice Guide controller widget */}
                    <div className="audio-guide-bar card">
                        <div className="audio-icon-holder">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className={isSpeaking ? 'pulse-animation' : ''}>
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        </div>
                        <div className="audio-text">
                            <h4>{labels.audioGuide}</h4>
                            <p>{isSpeaking ? `Speaking aloud in ${activeLanguage}...` : labels.audioStatus}</p>
                        </div>
                        <div className="audio-controls">
                            {!isSpeaking ? (
                                <button className="play-btn" onClick={startSpeech}>
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                    <span>Listen Now</span>
                                </button>
                            ) : (
                                <button className="pause-btn" onClick={stopSpeech}>
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <rect x="6" y="4" width="4" height="16"></rect>
                                        <rect x="14" y="4" width="4" height="16"></rect>
                                    </svg>
                                    <span>Stop</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* Timelines Column */}
                        <div className="grid-col-2">
                            <div className="card timeline-card">
                                <div className="card-header">
                                    <div className="header-title">
                                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="text-accent">
                                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                        <h3>{labels.medTimeline}</h3>
                                    </div>
                                    <button className="btn-secondary btn-small" onClick={downloadICSFile}>
                                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <span>{labels.addReminders}</span>
                                    </button>
                                </div>

                                {/* Schedule TIMELINE entries */}
                                {["morning", "afternoon", "night"].map(slot => {
                                    const slotMeds = (parsedSummaryTranslated.medicines || []).filter(m => m[slot]);
                                    const icon = slot === 'morning' ? '🌅' : slot === 'afternoon' ? '☀️' : '🌙';
                                    const slotName = slot.charAt(0).toUpperCase() + slot.slice(1);
                                    
                                    return (
                                        <div key={slot} className={`timeline-slot slot-${slot}`}>
                                            <div className="slot-header">
                                                <span className="slot-icon">{icon}</span>
                                                <h4>{slotName} Dose</h4>
                                            </div>
                                            <div className="slot-medicines">
                                                {slotMeds.length === 0 ? (
                                                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>No medications scheduled.</p>
                                                ) : (
                                                    slotMeds.map((med, idx) => {
                                                        const isChecked = !!takenMeds[`${slot}-${idx}`];
                                                        return (
                                                            <div 
                                                                key={idx} 
                                                                className={`med-card ${isChecked ? 'taken' : ''}`}
                                                                onClick={() => toggleMedTaken(slot, idx)}
                                                            >
                                                                <div className="med-checkbox-wrapper">
                                                                    <div className="med-checkbox">
                                                                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none">
                                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <div className="med-details">
                                                                    <div className="med-name-dosage">
                                                                        <span className="med-name">{med.name}</span>
                                                                        <span className="med-duration">{med.duration || "Continuous"}</span>
                                                                    </div>
                                                                    <div className="med-dosage-instructions">
                                                                        <span className="med-dosage">{med.dosage}</span>
                                                                        <span className="med-instructions">{med.instructions}</span>
                                                                    </div>
                                                                    <p className="med-purpose">{med.purpose_simple}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Column 2: Diet & warnings */}
                        <div className="grid-col-1">
                            {/* Warnings */}
                            <div className="card warning-card">
                                <div className="card-header danger">
                                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    <h3>{labels.warnings}</h3>
                                </div>
                                <p className="warning-subheader">{labels.warningsSub}</p>
                                <ul className="warning-list">
                                    {(parsedSummaryTranslated.warning_signs || []).map((warn, i) => (
                                        <li key={i}>{warn}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Diet splitting */}
                            <div className="card diet-card">
                                <div className="card-header">
                                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" className="text-success">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                    </svg>
                                    <h3>{labels.diet}</h3>
                                </div>
                                <div className="diet-split">
                                    <div className="diet-column diet-allowed">
                                        <h4>{labels.dietDo}</h4>
                                        <ul>
                                            {(parsedSummaryTranslated.diet_and_lifestyle?.allowed || []).map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="diet-column diet-restricted">
                                        <h4>{labels.dietDont}</h4>
                                        <ul>
                                            {(parsedSummaryTranslated.diet_and_lifestyle?.restricted || []).map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Followups */}
                            <div className="card follow-up-card">
                                <div className="follow-up-content">
                                    <div className="calendar-badge">
                                        <span className="cal-month">JULY</span>
                                        <span className="cal-day">20</span>
                                    </div>
                                    <div className="follow-up-details">
                                        <h3>{labels.followUp}</h3>
                                        <p className="follow-up-date">{parsedSummaryTranslated.follow_up?.date || "Not scheduled."}</p>
                                        <p className="follow-up-inst">{parsedSummaryTranslated.follow_up?.instructions || ""}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-footer text-center">
                        <button className="btn-secondary" onClick={resetPortal}>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            <span>Analyze Another Document</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
