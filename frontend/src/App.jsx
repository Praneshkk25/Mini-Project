import React, { useState } from 'react';
import HospitalOps from './components/HospitalOps';
import PatientDischarge from './components/PatientDischarge';
import CareCompanion from './components/CareCompanion';
import CityAPIs from './components/CityAPIs';

export default function App() {
    const [activeTab, setActiveTab] = useState("staff-ops"); // "staff-ops" or "patient-portal"
    const [llmProvider, setLlmProvider] = useState("qwen");  // "qwen", "qwen-local-ft", or "gemini"
    
    // Core shared patient portal states
    const [parsedSummaryEnglish, setParsedSummaryEnglish] = useState(null);
    const [parsedSummaryTranslated, setParsedSummaryTranslated] = useState(null);
    const [activeLanguage, setActiveLanguage] = useState("English");

    return (
        <div className="app">
            {/* Background glowing decorations */}
            <div className="bg-glow bg-glow-1"></div>
            <div className="bg-glow bg-glow-2"></div>

            <div className="app-container">
                {/* Header Brand */}
                <header className="app-header">
                    <div className="brand">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" className="heart-icon">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <div className="brand-text">
                            <h1>CareEase <span>AI</span></h1>
                            <p>Integrated Hospital Operations & Patient Discharge Hub</p>
                        </div>
                    </div>

                    <div className="provider-badge">
                        <label htmlFor="provider-select">Model:</label>
                        <select 
                            id="provider-select"
                            value={llmProvider}
                            onChange={(e) => setLlmProvider(e.target.value)}
                        >
                            <option value="qwen">Qwen 2.5:14b (Local Ollama)</option>
                            <option value="qwen-local-ft">Qwen 2.5 local fine-tuned (PEFT)</option>
                            <option value="gemini">Gemini 2.5 Flash</option>
                        </select>
                    </div>
                </header>

                {/* Workspace Navigation Tabs */}
                <div className="workspace-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'staff-ops' ? 'active' : ''}`}
                        onClick={() => setActiveTab("staff-ops")}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" className="tab-icon">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                        🏥 Hospital Operations Console
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'patient-portal' ? 'active' : ''}`}
                        onClick={() => setActiveTab("patient-portal")}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" className="tab-icon">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        🩺 Patient Discharge Portal
                    </button>
                </div>

                {/* Main Views Router */}
                <main className="main-content">
                    {activeTab === "staff-ops" ? (
                        <>
                            <HospitalOps llmProvider={llmProvider} />
                            <CityAPIs />
                        </>
                    ) : (
                        <PatientDischarge 
                            parsedSummaryEnglish={parsedSummaryEnglish}
                            setParsedSummaryEnglish={setParsedSummaryEnglish}
                            parsedSummaryTranslated={parsedSummaryTranslated}
                            setParsedSummaryTranslated={setParsedSummaryTranslated}
                            activeLanguage={activeLanguage}
                            setActiveLanguage={setActiveLanguage}
                        />
                    )}
                </main>

                {/* Floating grounded care chatbot */}
                <CareCompanion 
                    parsedSummaryEnglish={parsedSummaryEnglish}
                    activeLanguage={activeLanguage}
                />
            </div>
        </div>
    );
}
