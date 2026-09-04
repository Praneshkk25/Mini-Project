import React, { useState } from 'react';
import DocumentPreview from '../../components/common/DocumentPreview';
import { MOCK_DISCHARGE_SAMPLE } from '../../data/mockData';

export default function DischargeSummaryAssistant({ llmProvider }) {
  // Demographics
  const [demographics, setDemographics] = useState(MOCK_DISCHARGE_SAMPLE.demographics);

  // Clinical Details
  const [chiefComplaint, setChiefComplaint] = useState(MOCK_DISCHARGE_SAMPLE.chiefComplaint);
  const [primaryDx, setPrimaryDx] = useState(MOCK_DISCHARGE_SAMPLE.primaryDx);
  const [secondaryDx, setSecondaryDx] = useState(MOCK_DISCHARGE_SAMPLE.secondaryDx);
  const [riskClass, setRiskClass] = useState(MOCK_DISCHARGE_SAMPLE.riskClass);
  const [conditionAtDischarge, setConditionAtDischarge] = useState(MOCK_DISCHARGE_SAMPLE.conditionAtDischarge);

  // Vitals
  const [vitals, setVitals] = useState(MOCK_DISCHARGE_SAMPLE.vitals);

  // Dynamic Investigations Table
  const [investigations, setInvestigations] = useState(MOCK_DISCHARGE_SAMPLE.investigations);
  const [newInv, setNewInv] = useState({ test: '', result: '', normal: '' });

  // Dynamic Procedures Tag Input
  const [procedures, setProcedures] = useState(MOCK_DISCHARGE_SAMPLE.procedures);
  const [newProc, setNewProc] = useState('');

  // Dynamic Discharge Medications Table
  const [medications, setMedications] = useState(MOCK_DISCHARGE_SAMPLE.medications);
  const [newMed, setNewMed] = useState({ drug: '', dose: '', frequency: '', duration: '' });

  // Follow-Up Plan
  const [followUpDate, setFollowUpDate] = useState(MOCK_DISCHARGE_SAMPLE.followUpDate);
  const [followUpDept, setFollowUpDept] = useState(MOCK_DISCHARGE_SAMPLE.followUpDept);

  // Doctor Notes
  const [rawNotes, setRawNotes] = useState(MOCK_DISCHARGE_SAMPLE.rawNotes);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers for dynamic tables
  const handleAddInvestigation = () => {
    if (!newInv.test || !newInv.result) return;
    setInvestigations([...investigations, { id: Date.now(), ...newInv }]);
    setNewInv({ test: '', result: '', normal: '' });
  };

  const handleRemoveInvestigation = (id) => {
    setInvestigations(investigations.filter(item => item.id !== id));
  };

  const handleAddProcedure = () => {
    if (!newProc.trim()) return;
    setProcedures([...procedures, newProc.trim()]);
    setNewProc('');
  };

  const handleRemoveProcedure = (idx) => {
    setProcedures(procedures.filter((_, i) => i !== idx));
  };

  const handleAddMedication = () => {
    if (!newMed.drug || !newMed.dose) return;
    setMedications([...medications, { id: Date.now(), ...newMed }]);
    setNewMed({ drug: '', dose: '', frequency: '', duration: '' });
  };

  const handleRemoveMedication = (id) => {
    setMedications(medications.filter(item => item.id !== id));
  };

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`AI Discharge Summary generated using model (${llmProvider || 'Qwen 2.5:14b'})!`);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Discharge Summary Assistant
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Fill clinical details on the left — real-time hospital document preview updates automatically on the right.
          </p>
        </div>
        <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid #06b6d4', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', color: '#38bdf8' }}>
          🧠 Active AI Model: <strong>{llmProvider || 'Qwen 2.5:14b (Local Ollama)'}</strong>
        </div>
      </div>

      {/* Main 2-Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* LEFT PANEL — Input Form */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. Demographics */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              👤 Patient Demographics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  value={demographics.name} 
                  onChange={e => setDemographics({ ...demographics, name: e.target.value })}
                  className="form-input" 
                />
              </div>
              <div>
                <label className="form-label">UHID *</label>
                <input 
                  type="text" 
                  value={demographics.uhid} 
                  onChange={e => setDemographics({ ...demographics, uhid: e.target.value })}
                  className="form-input" 
                />
              </div>
              <div>
                <label className="form-label">Age & Gender</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number" 
                    placeholder="Age"
                    value={demographics.age} 
                    onChange={e => setDemographics({ ...demographics, age: e.target.value })}
                    className="form-input" 
                  />
                  <select 
                    value={demographics.gender} 
                    onChange={e => setDemographics({ ...demographics, gender: e.target.value })}
                    className="form-input"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Ward / Bed</label>
                <input 
                  type="text" 
                  value={demographics.ward} 
                  onChange={e => setDemographics({ ...demographics, ward: e.target.value })}
                  className="form-input" 
                />
              </div>
              <div>
                <label className="form-label">Admission Date</label>
                <input 
                  type="date" 
                  value={demographics.admDate} 
                  onChange={e => setDemographics({ ...demographics, admDate: e.target.value })}
                  className="form-input" 
                />
              </div>
              <div>
                <label className="form-label">Discharge Date</label>
                <input 
                  type="date" 
                  value={demographics.disDate} 
                  onChange={e => setDemographics({ ...demographics, disDate: e.target.value })}
                  className="form-input" 
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Attending Doctor</label>
                <input 
                  type="text" 
                  value={demographics.doctor} 
                  onChange={e => setDemographics({ ...demographics, doctor: e.target.value })}
                  className="form-input" 
                />
              </div>
            </div>
          </div>

          {/* 2. Clinical Findings & Risk */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              🩺 Clinical Diagnosis & Risk Assessment
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">Chief Complaint *</label>
                <textarea 
                  rows={2}
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  className="form-input"
                  placeholder="Describe patient presentation at admission..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Primary Diagnosis *</label>
                  <input 
                    type="text" 
                    value={primaryDx} 
                    onChange={e => setPrimaryDx(e.target.value)}
                    className="form-input" 
                  />
                </div>
                <div>
                  <label className="form-label">Secondary Diagnosis</label>
                  <input 
                    type="text" 
                    value={secondaryDx} 
                    onChange={e => setSecondaryDx(e.target.value)}
                    className="form-input" 
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">AI Risk Classification (XGBoost/CNN Model)</label>
                  <select 
                    value={riskClass}
                    onChange={e => setRiskClass(e.target.value)}
                    className="form-input"
                    style={{ fontWeight: 'bold', color: riskClass === 'High' ? '#ef4444' : riskClass === 'Medium' ? '#f59e0b' : '#10b981' }}
                  >
                    <option value="Low">🟢 Low Risk</option>
                    <option value="Medium">🟡 Medium Risk</option>
                    <option value="High">🔴 High Risk</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Condition at Discharge</label>
                  <select 
                    value={conditionAtDischarge}
                    onChange={e => setConditionAtDischarge(e.target.value)}
                    className="form-input"
                  >
                    <option value="Stable">Stable</option>
                    <option value="Improved">Improved</option>
                    <option value="Referred">Referred</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Vitals Paired Inputs */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              📊 Vital Signs (Admission vs. Discharge)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Blood Pressure (Adm / Dis)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" placeholder="Adm (e.g. 160/95)" value={vitals.bpAdm} onChange={e => setVitals({...vitals, bpAdm: e.target.value})} className="form-input" />
                  <input type="text" placeholder="Dis (e.g. 120/80)" value={vitals.bpDis} onChange={e => setVitals({...vitals, bpDis: e.target.value})} className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Heart Rate (bpm)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" placeholder="Adm (110)" value={vitals.hrAdm} onChange={e => setVitals({...vitals, hrAdm: e.target.value})} className="form-input" />
                  <input type="text" placeholder="Dis (72)" value={vitals.hrDis} onChange={e => setVitals({...vitals, hrDis: e.target.value})} className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">SpO2 (%)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" placeholder="Adm (91%)" value={vitals.spO2Adm} onChange={e => setVitals({...vitals, spO2Adm: e.target.value})} className="form-input" />
                  <input type="text" placeholder="Dis (98%)" value={vitals.spO2Dis} onChange={e => setVitals({...vitals, spO2Dis: e.target.value})} className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Temperature (°C)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" placeholder="Adm (37.8)" value={vitals.tempAdm} onChange={e => setVitals({...vitals, tempAdm: e.target.value})} className="form-input" />
                  <input type="text" placeholder="Dis (36.6)" value={vitals.tempDis} onChange={e => setVitals({...vitals, tempDis: e.target.value})} className="form-input" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Dynamic Investigations Table */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              🔬 Key Investigations (Add-Row Table)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {investigations.map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div>
                    <strong>{inv.test}:</strong> <span style={{ color: '#38bdf8' }}>{inv.result}</span> <span style={{ color: '#64748b', fontSize: '11px' }}>({inv.normal})</span>
                  </div>
                  <button onClick={() => handleRemoveInvestigation(inv.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr auto', gap: '6px' }}>
              <input type="text" placeholder="Test Name" value={newInv.test} onChange={e => setNewInv({...newInv, test: e.target.value})} className="form-input" />
              <input type="text" placeholder="Result" value={newInv.result} onChange={e => setNewInv({...newInv, result: e.target.value})} className="form-input" />
              <input type="text" placeholder="Normal Range" value={newInv.normal} onChange={e => setNewInv({...newInv, normal: e.target.value})} className="form-input" />
              <button onClick={handleAddInvestigation} className="btn-secondary" style={{ padding: '8px 12px' }}>+ Add</button>
            </div>
          </div>

          {/* 5. Procedures Performed Tag Input */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              🩹 Procedures Performed
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {procedures.map((proc, idx) => (
                <span key={idx} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {proc}
                  <span onClick={() => handleRemoveProcedure(idx)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>×</span>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Type procedure name..." 
                value={newProc} 
                onChange={e => setNewProc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddProcedure())}
                className="form-input" 
              />
              <button onClick={handleAddProcedure} className="btn-secondary">+ Add Tag</button>
            </div>
          </div>

          {/* 6. Dynamic Discharge Medications Table */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              💊 Discharge Medications (Add-Row Table)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {medications.map(med => (
                <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{med.drug}</strong> - {med.dose} | {med.frequency} ({med.duration})
                  </div>
                  <button onClick={() => handleRemoveMedication(med.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', gap: '6px' }}>
              <input type="text" placeholder="Drug Name" value={newMed.drug} onChange={e => setNewMed({...newMed, drug: e.target.value})} className="form-input" />
              <input type="text" placeholder="Dose" value={newMed.dose} onChange={e => setNewMed({...newMed, dose: e.target.value})} className="form-input" />
              <input type="text" placeholder="Freq" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="form-input" />
              <input type="text" placeholder="Duration" value={newMed.duration} onChange={e => setNewMed({...newMed, duration: e.target.value})} className="form-input" />
              <button onClick={handleAddMedication} className="btn-secondary" style={{ padding: '8px 12px' }}>+ Add</button>
            </div>
          </div>

          {/* 7. Follow-Up Plan & Raw Notes */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              📅 Follow-Up & AI Doctor Notes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label className="form-label">Follow-Up Date</label>
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Department / Clinic</label>
                <input type="text" value={followUpDept} onChange={e => setFollowUpDept(e.target.value)} className="form-input" />
              </div>
            </div>
            <div>
              <label className="form-label">Raw Clinical Doctor Notes (AI will structure & summarize this)</label>
              <textarea 
                rows={4}
                value={rawNotes}
                onChange={e => setRawNotes(e.target.value)}
                className="form-input"
                placeholder="Enter unstructured clinical notes..."
              />
            </div>
          </div>

          {/* AI Generate Summary Trigger Button */}
          <button 
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            style={{
              padding: '14px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {isGenerating ? '⚡ AI Synthesizing Discharge Document...' : '✨ Generate AI Discharge Summary Document'}
          </button>

        </div>

        {/* RIGHT PANEL — Live Preview Document */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <DocumentPreview 
            demographics={demographics}
            chiefComplaint={chiefComplaint}
            primaryDx={primaryDx}
            secondaryDx={secondaryDx}
            riskClass={riskClass}
            vitals={vitals}
            investigations={investigations}
            procedures={procedures}
            medications={medications}
            followUpDate={followUpDate}
            followUpDept={followUpDept}
            conditionAtDischarge={conditionAtDischarge}
            rawNotes={rawNotes}
          />
        </div>

      </div>
    </div>
  );
}
