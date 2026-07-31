import React, { useState, useRef, useCallback } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).substr(2, 9);

const today = () => new Date().toISOString().split('T')[0];

const riskColors = {
    Low: { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#10b981' },
    Medium: { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: '#f59e0b' },
    High: { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#ef4444' },
};

const conditionColors = {
    Stable: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
    Improved: { bg: 'rgba(6,182,212,0.1)', text: '#06b6d4' },
    Referred: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
};

// Derive home care & warning signs from diagnosis / chief complaint
function deriveHomeCare(diagnosis, chiefComplaint, risk) {
    const base = [
        'Take all prescribed medications at the correct time every day.',
        'Drink at least 8 glasses of water per day unless restricted by your doctor.',
        'Rest adequately — avoid strenuous activity until follow-up.',
        'Keep all wounds or surgical sites clean and dry.',
        'Attend your follow-up appointment on the scheduled date.',
    ];
    if (risk === 'High') base.push('Monitor your condition closely and contact emergency services if symptoms worsen.');
    return base;
}

function deriveWarningSigns(diagnosis, risk) {
    const signs = [
        'Sudden severe chest pain or difficulty breathing',
        'High fever (above 38.5°C / 101.3°F) that does not subside',
        'Excessive bleeding or discharge from wound sites',
        'Sudden confusion, fainting, or loss of consciousness',
        'Severe or worsening pain not relieved by prescribed medications',
    ];
    if (risk === 'High') signs.push('Any rapid deterioration of your condition — call emergency immediately.');
    return signs;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }) {
    return (
        <div className="dsa-section-header">
            <span className="dsa-section-icon">{icon}</span>
            <div>
                <h3>{title}</h3>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </div>
    );
}

function FormField({ label, children, required }) {
    return (
        <div className="dsa-field">
            <label className="dsa-label">{label}{required && <span className="dsa-required">*</span>}</label>
            {children}
        </div>
    );
}

function VitalPair({ label, admKey, disKey, vitals, onChange }) {
    return (
        <div className="dsa-vital-pair">
            <span className="dsa-vital-label">{label}</span>
            <div className="dsa-vital-inputs">
                <div className="dsa-vital-input-wrap">
                    <span className="dsa-vital-badge adm">ADM</span>
                    <input
                        type="text"
                        placeholder="—"
                        value={vitals[admKey]}
                        onChange={e => onChange(admKey, e.target.value)}
                        className="dsa-input dsa-vital-input"
                    />
                </div>
                <span className="dsa-vital-arrow">→</span>
                <div className="dsa-vital-input-wrap">
                    <span className="dsa-vital-badge dis">DIS</span>
                    <input
                        type="text"
                        placeholder="—"
                        value={vitals[disKey]}
                        onChange={e => onChange(disKey, e.target.value)}
                        className="dsa-input dsa-vital-input"
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DischargeSummaryAssistant() {
    // ── Demographics ──
    const [demographics, setDemographics] = useState({
        name: '', age: '', gender: 'Male', uhid: '',
        admDate: today(), disDate: today(),
        doctor: '', ward: '',
    });

    // ── Clinical ──
    const [chiefComplaint, setChiefComplaint] = useState('');
    const [primaryDx, setPrimaryDx] = useState('');
    const [secondaryDx, setSecondaryDx] = useState('');
    const [riskClass, setRiskClass] = useState('Low');
    const [conditionAtDischarge, setConditionAtDischarge] = useState('Stable');

    // ── Vitals ──
    const [vitals, setVitals] = useState({
        bpAdm: '', bpDis: '',
        hrAdm: '', hrDis: '',
        spo2Adm: '', spo2Dis: '',
        tempAdm: '', tempDis: '',
    });
    const handleVital = (key, val) => setVitals(v => ({ ...v, [key]: val }));

    // ── Investigations table ──
    const [investigations, setInvestigations] = useState([
        { id: generateId(), test: '', result: '', normal: '' },
    ]);
    const addInv = () => setInvestigations(prev => [...prev, { id: generateId(), test: '', result: '', normal: '' }]);
    const removeInv = id => setInvestigations(prev => prev.filter(r => r.id !== id));
    const updateInv = (id, key, val) => setInvestigations(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));

    // ── Procedures ──
    const [procedures, setProcedures] = useState([]);
    const [procedureInput, setProcedureInput] = useState('');
    const addProcedure = () => {
        const trimmed = procedureInput.trim();
        if (trimmed) { setProcedures(prev => [...prev, trimmed]); setProcedureInput(''); }
    };
    const removeProcedure = idx => setProcedures(prev => prev.filter((_, i) => i !== idx));

    // ── Medications table ──
    const [medications, setMedications] = useState([
        { id: generateId(), drug: '', dose: '', frequency: '', duration: '' },
    ]);
    const addMed = () => setMedications(prev => [...prev, { id: generateId(), drug: '', dose: '', frequency: '', duration: '' }]);
    const removeMed = id => setMedications(prev => prev.filter(r => r.id !== id));
    const updateMed = (id, key, val) => setMedications(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));

    // ── Follow-up ──
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpDept, setFollowUpDept] = useState('');

    // ── Raw notes ──
    const [rawNotes, setRawNotes] = useState('');

    // ── Generated state ──
    const [isGenerating, setIsGenerating] = useState(false);
    const [summaryGenerated, setSummaryGenerated] = useState(false);

    // ── Preview panel ref (for PDF) ──
    const previewRef = useRef(null);

    // ── Generate handler ──
    const handleGenerate = useCallback(() => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setSummaryGenerated(true);
        }, 1800);
    }, []);

    // ── Export JSON ──
    const handleExportJSON = () => {
        const payload = {
            demographics, chiefComplaint, primaryDx, secondaryDx,
            riskClass, conditionAtDischarge, vitals,
            investigations, procedures, medications,
            followUp: { date: followUpDate, department: followUpDept },
            rawNotes, generatedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `discharge_summary_${demographics.uhid || 'unknown'}_${today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Download PDF (print) ──
    const handleDownloadPDF = () => {
        window.print();
    };

    // ── Derived display values ──
    const hospitalCourse = (() => {
        const parts = [];
        if (demographics.name) parts.push(`${demographics.name}`);
        else parts.push('The patient');
        if (demographics.age && demographics.gender) parts[0] += `, a ${demographics.age}-year-old ${demographics.gender},`;
        if (chiefComplaint) parts.push(`presented with ${chiefComplaint.toLowerCase()}.`);
        if (primaryDx) parts.push(`The patient was diagnosed with ${primaryDx}.`);
        if (secondaryDx) parts.push(`Secondary conditions noted: ${secondaryDx}.`);
        if (procedures.length > 0) parts.push(`During the hospital stay, the following procedures were performed: ${procedures.join(', ')}.`);
        parts.push(`The patient was monitored closely and responded to treatment.`);
        if (conditionAtDischarge) parts.push(`At the time of discharge, the patient's condition was ${conditionAtDischarge.toLowerCase()}.`);
        if (rawNotes && summaryGenerated) {
            parts.push(`\n\nAdditional clinical notes: ${rawNotes.substring(0, 250)}${rawNotes.length > 250 ? '...' : ''}`);
        }
        return parts.join(' ');
    })();

    const riskStyle = riskColors[riskClass] || riskColors.Low;
    const condStyle = conditionColors[conditionAtDischarge] || conditionColors.Stable;

    const stayDays = (() => {
        try {
            const d1 = new Date(demographics.admDate);
            const d2 = new Date(demographics.disDate);
            const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
            return diff >= 0 ? diff : 0;
        } catch { return 0; }
    })();

    const homeCare = deriveHomeCare(primaryDx, chiefComplaint, riskClass);
    const warningSigns = deriveWarningSigns(primaryDx, riskClass);

    return (
        <div className="dsa-root">
            {/* Page Title */}
            <div className="dsa-page-header">
                <div className="dsa-page-title-wrap">
                    <div className="dsa-page-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                    </div>
                    <div>
                        <h2 className="dsa-page-title">Discharge Summary Assistant</h2>
                        <p className="dsa-page-sub">AI-powered clinical documentation with live structured preview</p>
                    </div>
                </div>
                <div className="dsa-risk-badge-display" style={{ background: riskStyle.bg, border: `1px solid ${riskStyle.border}`, color: riskStyle.text }}>
                    <span className="dsa-risk-dot" style={{ background: riskStyle.text }} />
                    Risk: {riskClass}
                </div>
            </div>

            {/* Split Layout */}
            <div className="dsa-split">
                {/* ══════════════ LEFT PANEL — INPUT FORM ══════════════ */}
                <div className="dsa-left-panel">
                    <div className="dsa-panel-label">Input Form</div>

                    {/* 1. Demographics */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="👤" title="Patient Demographics" />
                        <div className="dsa-grid-2">
                            <FormField label="Full Name" required>
                                <input className="dsa-input" type="text" placeholder="e.g. Ramesh Kumar"
                                    value={demographics.name} onChange={e => setDemographics(d => ({ ...d, name: e.target.value }))} />
                            </FormField>
                            <FormField label="UHID / MRN" required>
                                <input className="dsa-input" type="text" placeholder="e.g. MRN-2024-001"
                                    value={demographics.uhid} onChange={e => setDemographics(d => ({ ...d, uhid: e.target.value }))} />
                            </FormField>
                            <FormField label="Age">
                                <input className="dsa-input" type="number" placeholder="Years"
                                    value={demographics.age} onChange={e => setDemographics(d => ({ ...d, age: e.target.value }))} />
                            </FormField>
                            <FormField label="Gender">
                                <select className="dsa-input dsa-select" value={demographics.gender}
                                    onChange={e => setDemographics(d => ({ ...d, gender: e.target.value }))}>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </FormField>
                            <FormField label="Admission Date">
                                <input className="dsa-input" type="date" value={demographics.admDate}
                                    onChange={e => setDemographics(d => ({ ...d, admDate: e.target.value }))} />
                            </FormField>
                            <FormField label="Discharge Date">
                                <input className="dsa-input" type="date" value={demographics.disDate}
                                    onChange={e => setDemographics(d => ({ ...d, disDate: e.target.value }))} />
                            </FormField>
                            <FormField label="Attending Doctor">
                                <input className="dsa-input" type="text" placeholder="Dr. Name + Specialisation"
                                    value={demographics.doctor} onChange={e => setDemographics(d => ({ ...d, doctor: e.target.value }))} />
                            </FormField>
                            <FormField label="Ward / Bed">
                                <input className="dsa-input" type="text" placeholder="e.g. Ward 3 / Bed 12"
                                    value={demographics.ward} onChange={e => setDemographics(d => ({ ...d, ward: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>

                    {/* 2. Chief Complaint */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="🩺" title="Chief Complaint" />
                        <textarea className="dsa-textarea" rows={3} placeholder="Describe the primary reason for admission..."
                            value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} />
                    </div>

                    {/* 3. Diagnosis */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="📋" title="Diagnosis" />
                        <FormField label="Primary Diagnosis" required>
                            <input className="dsa-input" type="text" placeholder="e.g. Acute Myocardial Infarction"
                                value={primaryDx} onChange={e => setPrimaryDx(e.target.value)} />
                        </FormField>
                        <FormField label="Secondary Diagnosis / Comorbidities">
                            <input className="dsa-input" type="text" placeholder="e.g. Type-2 Diabetes, Hypertension"
                                value={secondaryDx} onChange={e => setSecondaryDx(e.target.value)} />
                        </FormField>
                    </div>

                    {/* 4. Risk Classification */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="⚠️" title="Risk Classification" subtitle="Simulates XGBoost / CNN model output" />
                        <div className="dsa-risk-selector">
                            {['Low', 'Medium', 'High'].map(level => (
                                <button key={level}
                                    className={`dsa-risk-btn ${riskClass === level ? 'active' : ''}`}
                                    style={riskClass === level ? { background: riskColors[level].bg, borderColor: riskColors[level].border, color: riskColors[level].text } : {}}
                                    onClick={() => setRiskClass(level)}>
                                    <span className="dsa-risk-dot" style={{ background: riskColors[level].text }} />
                                    {level} Risk
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 5. Vitals */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="💓" title="Vitals on Admission vs Discharge" />
                        <div className="dsa-vitals-grid">
                            <VitalPair label="Blood Pressure (mmHg)" admKey="bpAdm" disKey="bpDis" vitals={vitals} onChange={handleVital} />
                            <VitalPair label="Heart Rate (bpm)" admKey="hrAdm" disKey="hrDis" vitals={vitals} onChange={handleVital} />
                            <VitalPair label="SpO₂ (%)" admKey="spo2Adm" disKey="spo2Dis" vitals={vitals} onChange={handleVital} />
                            <VitalPair label="Temperature (°C)" admKey="tempAdm" disKey="tempDis" vitals={vitals} onChange={handleVital} />
                        </div>
                    </div>

                    {/* 6. Investigations */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="🔬" title="Investigations" />
                        <div className="dsa-table-wrap">
                            <div className="dsa-table-header dsa-inv-header">
                                <span>Test Name</span><span>Result</span><span>Normal Range</span><span></span>
                            </div>
                            {investigations.map(row => (
                                <div key={row.id} className="dsa-table-row dsa-inv-row">
                                    <input className="dsa-input dsa-table-input" placeholder="e.g. HbA1c"
                                        value={row.test} onChange={e => updateInv(row.id, 'test', e.target.value)} />
                                    <input className="dsa-input dsa-table-input" placeholder="e.g. 7.2%"
                                        value={row.result} onChange={e => updateInv(row.id, 'result', e.target.value)} />
                                    <input className="dsa-input dsa-table-input" placeholder="e.g. 4-5.7%"
                                        value={row.normal} onChange={e => updateInv(row.id, 'normal', e.target.value)} />
                                    <button className="dsa-remove-btn" onClick={() => removeInv(row.id)} title="Remove row">×</button>
                                </div>
                            ))}
                        </div>
                        <button className="dsa-add-row-btn" onClick={addInv}>
                            <span>+</span> Add Investigation
                        </button>
                    </div>

                    {/* 7. Procedures */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="🏥" title="Procedures Performed" />
                        <div className="dsa-tag-input-wrap">
                            <input className="dsa-input dsa-tag-input" type="text" placeholder="Type a procedure and press Enter..."
                                value={procedureInput}
                                onChange={e => setProcedureInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProcedure(); } }}
                            />
                            <button className="dsa-tag-add-btn" onClick={addProcedure}>Add</button>
                        </div>
                        {procedures.length > 0 && (
                            <div className="dsa-tags-list">
                                {procedures.map((p, i) => (
                                    <span key={i} className="dsa-tag">
                                        {p}
                                        <button onClick={() => removeProcedure(i)} className="dsa-tag-remove">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 8. Discharge Medications */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="💊" title="Discharge Medications" />
                        <div className="dsa-table-wrap">
                            <div className="dsa-table-header dsa-med-header">
                                <span>Drug</span><span>Dose</span><span>Frequency</span><span>Duration</span><span></span>
                            </div>
                            {medications.map(row => (
                                <div key={row.id} className="dsa-table-row dsa-med-row">
                                    <input className="dsa-input dsa-table-input" placeholder="e.g. Metformin"
                                        value={row.drug} onChange={e => updateMed(row.id, 'drug', e.target.value)} />
                                    <input className="dsa-input dsa-table-input" placeholder="500mg"
                                        value={row.dose} onChange={e => updateMed(row.id, 'dose', e.target.value)} />
                                    <input className="dsa-input dsa-table-input" placeholder="BD"
                                        value={row.frequency} onChange={e => updateMed(row.id, 'frequency', e.target.value)} />
                                    <input className="dsa-input dsa-table-input" placeholder="30 days"
                                        value={row.duration} onChange={e => updateMed(row.id, 'duration', e.target.value)} />
                                    <button className="dsa-remove-btn" onClick={() => removeMed(row.id)} title="Remove row">×</button>
                                </div>
                            ))}
                        </div>
                        <button className="dsa-add-row-btn" onClick={addMed}>
                            <span>+</span> Add Medication
                        </button>
                    </div>

                    {/* 9. Follow-up */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="📅" title="Follow-Up Plan" />
                        <div className="dsa-grid-2">
                            <FormField label="Follow-Up Date">
                                <input className="dsa-input" type="date" value={followUpDate}
                                    onChange={e => setFollowUpDate(e.target.value)} />
                            </FormField>
                            <FormField label="Department">
                                <input className="dsa-input" type="text" placeholder="e.g. Cardiology OPD"
                                    value={followUpDept} onChange={e => setFollowUpDept(e.target.value)} />
                            </FormField>
                        </div>
                    </div>

                    {/* 10. Condition at Discharge */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="📊" title="Condition at Discharge" />
                        <select className="dsa-input dsa-select dsa-wide-select" value={conditionAtDischarge}
                            onChange={e => setConditionAtDischarge(e.target.value)}>
                            <option>Stable</option>
                            <option>Improved</option>
                            <option>Referred</option>
                        </select>
                    </div>

                    {/* 11. Raw Doctor Notes */}
                    <div className="dsa-form-section">
                        <SectionHeader icon="🤖" title="Doctor Notes" subtitle="AI will summarize this" />
                        <div className="dsa-notes-label-wrap">
                            <span className="dsa-ai-badge">
                                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                AI-powered summarisation
                            </span>
                        </div>
                        <textarea className="dsa-textarea dsa-notes-area" rows={6}
                            placeholder="Paste raw clinical notes here. The AI will synthesize a coherent hospital course narrative from these notes when you click Generate Summary..."
                            value={rawNotes} onChange={e => setRawNotes(e.target.value)} />
                    </div>

                    {/* Generate Button */}
                    <button
                        className={`dsa-generate-btn ${isGenerating ? 'generating' : ''}`}
                        onClick={handleGenerate}
                        disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <span className="dsa-btn-spinner" />
                                Generating Summary…
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                                Generate Summary
                            </>
                        )}
                    </button>
                </div>

                {/* ══════════════ RIGHT PANEL — LIVE PREVIEW ══════════════ */}
                <div className="dsa-right-panel">
                    <div className="dsa-panel-label">Live Preview</div>
                    <div className="dsa-preview" ref={previewRef}>

                        {/* Hospital Header */}
                        <div className="dsa-hosp-header">
                            <div className="dsa-hosp-logo">
                                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </div>
                            <div className="dsa-hosp-info">
                                <h1 className="dsa-hosp-name">CareEase Medical Centre</h1>
                                <p className="dsa-hosp-address">NH-48, Medical District • Contact: +91-80-4400-0000</p>
                                <p className="dsa-hosp-address">NABH Accredited | ISO 9001:2015 Certified</p>
                            </div>
                            <div className="dsa-doc-title-block">
                                <p className="dsa-doc-type">DISCHARGE SUMMARY</p>
                                <p className="dsa-doc-date">Date: {demographics.disDate || today()}</p>
                            </div>
                        </div>
                        <div className="dsa-hosp-divider" />

                        {/* Patient Info Block */}
                        <div className="dsa-preview-section">
                            <div className="dsa-prev-section-title">Patient Information</div>
                            <div className="dsa-patient-grid">
                                <div className="dsa-patient-field">
                                    <span className="dsa-pf-label">Patient Name</span>
                                    <span className="dsa-pf-value">{demographics.name || '—'}</span>
                                </div>
                                <div className="dsa-patient-field">
                                    <span className="dsa-pf-label">UHID / MRN</span>
                                    <span className="dsa-pf-value">{demographics.uhid || '—'}</span>
                                </div>
                                <div className="dsa-patient-field">
                                    <span className="dsa-pf-label">Age / Gender</span>
                                    <span className="dsa-pf-value">{demographics.age ? `${demographics.age} yrs` : '—'} / {demographics.gender}</span>
                                </div>
                                <div className="dsa-patient-field">
                                    <span className="dsa-pf-label">Ward / Bed</span>
                                    <span className="dsa-pf-value">{demographics.ward || '—'}</span>
                                </div>
                                <div className="dsa-patient-field">
                                    <span className="dsa-pf-label">Admission Date</span>
                                    <span className="dsa-pf-value">{demographics.admDate || '—'}</span>
                                </div>
                                <div className="dsa-patient-field">
                                    <span className="dsa-pf-label">Discharge Date</span>
                                    <span className="dsa-pf-value">{demographics.disDate || '—'}</span>
                                </div>
                                <div className="dsa-patient-field">
                                    <span className="dsa-pf-label">Length of Stay</span>
                                    <span className="dsa-pf-value">{stayDays} day{stayDays !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="dsa-patient-field">
                                    <span className="dsa-pf-label">Attending Physician</span>
                                    <span className="dsa-pf-value">{demographics.doctor || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Diagnosis Summary */}
                        <div className="dsa-preview-section">
                            <div className="dsa-prev-section-title">Diagnosis Summary</div>
                            <div className="dsa-dx-block">
                                <div className="dsa-dx-row">
                                    <span className="dsa-dx-label">Primary Diagnosis</span>
                                    <span className="dsa-dx-value primary">{primaryDx || 'Not specified'}</span>
                                </div>
                                {secondaryDx && (
                                    <div className="dsa-dx-row">
                                        <span className="dsa-dx-label">Secondary / Comorbidities</span>
                                        <span className="dsa-dx-value secondary">{secondaryDx}</span>
                                    </div>
                                )}
                                <div className="dsa-dx-badges">
                                    <span className="dsa-badge"
                                        style={{ background: riskStyle.bg, border: `1px solid ${riskStyle.border}`, color: riskStyle.text }}>
                                        <span className="dsa-risk-dot" style={{ background: riskStyle.text }} />
                                        {riskClass} Risk
                                    </span>
                                    <span className="dsa-badge"
                                        style={{ background: condStyle.bg, color: condStyle.text }}>
                                        {conditionAtDischarge}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hospital Course */}
                        <div className="dsa-preview-section">
                            <div className="dsa-prev-section-title">Hospital Course</div>
                            <p className="dsa-narrative">
                                {hospitalCourse || 'Fill in patient details to auto-generate the hospital course narrative.'}
                            </p>
                            {summaryGenerated && rawNotes && (
                                <div className="dsa-ai-summary-badge">
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                    AI-synthesized from doctor notes
                                </div>
                            )}
                        </div>

                        {/* Vitals Comparison */}
                        {(vitals.bpAdm || vitals.hrAdm || vitals.spo2Adm || vitals.tempAdm) && (
                            <div className="dsa-preview-section">
                                <div className="dsa-prev-section-title">Vitals Comparison</div>
                                <table className="dsa-prev-table">
                                    <thead>
                                        <tr>
                                            <th>Parameter</th>
                                            <th>On Admission</th>
                                            <th>At Discharge</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vitals.bpAdm && <tr><td>Blood Pressure</td><td>{vitals.bpAdm} mmHg</td><td>{vitals.bpDis || '—'} mmHg</td></tr>}
                                        {vitals.hrAdm && <tr><td>Heart Rate</td><td>{vitals.hrAdm} bpm</td><td>{vitals.hrDis || '—'} bpm</td></tr>}
                                        {vitals.spo2Adm && <tr><td>SpO₂</td><td>{vitals.spo2Adm}%</td><td>{vitals.spo2Dis || '—'}%</td></tr>}
                                        {vitals.tempAdm && <tr><td>Temperature</td><td>{vitals.tempAdm} °C</td><td>{vitals.tempDis || '—'} °C</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Investigations */}
                        {investigations.some(r => r.test) && (
                            <div className="dsa-preview-section">
                                <div className="dsa-prev-section-title">Investigations</div>
                                <table className="dsa-prev-table">
                                    <thead>
                                        <tr><th>Test</th><th>Result</th><th>Normal Range</th></tr>
                                    </thead>
                                    <tbody>
                                        {investigations.filter(r => r.test).map(r => (
                                            <tr key={r.id}>
                                                <td>{r.test}</td>
                                                <td><strong>{r.result || '—'}</strong></td>
                                                <td className="dsa-prev-muted">{r.normal || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Procedures */}
                        {procedures.length > 0 && (
                            <div className="dsa-preview-section">
                                <div className="dsa-prev-section-title">Procedures Performed</div>
                                <ul className="dsa-prev-list">
                                    {procedures.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Discharge Medications */}
                        {medications.some(r => r.drug) && (
                            <div className="dsa-preview-section">
                                <div className="dsa-prev-section-title">Discharge Medications</div>
                                <table className="dsa-prev-table dsa-med-table">
                                    <thead>
                                        <tr><th>#</th><th>Drug</th><th>Dose</th><th>Frequency</th><th>Duration</th></tr>
                                    </thead>
                                    <tbody>
                                        {medications.filter(r => r.drug).map((r, i) => (
                                            <tr key={r.id}>
                                                <td className="dsa-prev-muted">{i + 1}</td>
                                                <td><strong>{r.drug}</strong></td>
                                                <td>{r.dose || '—'}</td>
                                                <td>{r.frequency || '—'}</td>
                                                <td>{r.duration || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Follow-Up Plan */}
                        <div className="dsa-preview-section">
                            <div className="dsa-prev-section-title">Follow-Up Plan</div>
                            <div className="dsa-followup-block">
                                <div className="dsa-followup-item">
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span>{followUpDate ? `Follow-up on: ${followUpDate}` : 'Follow-up date not specified'}</span>
                                </div>
                                {followUpDept && (
                                    <div className="dsa-followup-item">
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                        </svg>
                                        <span>Department: {followUpDept}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Home Care Instructions */}
                        <div className="dsa-preview-section">
                            <div className="dsa-prev-section-title">Home Care Instructions</div>
                            <ul className="dsa-prev-list dsa-homecare-list">
                                {homeCare.map((item, i) => (
                                    <li key={i}>
                                        <span className="dsa-homecare-check">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Warning Signs */}
                        <div className="dsa-preview-section dsa-warning-section">
                            <div className="dsa-prev-section-title dsa-warning-title">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                Warning Signs — Seek Immediate Care
                            </div>
                            <p className="dsa-warning-subtext">Return to the Emergency Department immediately if you experience:</p>
                            <ul className="dsa-warning-list">
                                {warningSigns.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>

                        {/* Doctor Signature */}
                        <div className="dsa-signature-block">
                            <div className="dsa-sig-line">
                                <div className="dsa-sig-entry">
                                    <div className="dsa-sig-blank" />
                                    <span className="dsa-sig-name">{demographics.doctor || 'Attending Physician'}</span>
                                    <span className="dsa-sig-role">Signature & Stamp</span>
                                </div>
                                <div className="dsa-sig-entry">
                                    <div className="dsa-sig-blank" />
                                    <span className="dsa-sig-name">Authorized Signatory</span>
                                    <span className="dsa-sig-role">Medical Records Dept.</span>
                                </div>
                            </div>
                            <p className="dsa-doc-footer">
                                This document is generated by CareEase AI and must be countersigned by the attending physician before official use.
                                Generated: {new Date().toLocaleString()}
                            </p>
                        </div>

                        {/* Export Buttons */}
                        <div className="dsa-export-bar">
                            <button className="dsa-export-btn dsa-pdf-btn" onClick={handleDownloadPDF}>
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Download as PDF
                            </button>
                            <button className="dsa-export-btn dsa-json-btn" onClick={handleExportJSON}>
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <polyline points="16 18 22 12 16 6"/>
                                    <polyline points="8 6 2 12 8 18"/>
                                </svg>
                                Export JSON
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
