import React from 'react';
import StatusBadge from './StatusBadge';

export default function DocumentPreview({ 
  demographics = {}, 
  chiefComplaint = '', 
  primaryDx = '', 
  secondaryDx = '', 
  riskClass = 'Low', 
  vitals = {}, 
  investigations = [], 
  procedures = [], 
  medications = [], 
  followUpDate = '', 
  followUpDept = '', 
  conditionAtDischarge = 'Stable', 
  rawNotes = '',
  onDownloadPdf,
  onExportJson
}) {

  const handlePrint = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      window.print();
    }
  };

  const handleJsonExport = () => {
    if (onExportJson) {
      onExportJson();
    } else {
      const summaryData = {
        demographics,
        chiefComplaint,
        primaryDx,
        secondaryDx,
        riskClass,
        vitals,
        investigations,
        procedures,
        medications,
        followUpDate,
        followUpDept,
        conditionAtDischarge,
        rawNotes,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Discharge_Summary_${demographics.uhid || 'Patient'}.json`;
      a.click();
    }
  };

  // Derive home care & warning signs
  const homeCareList = [
    'Take all prescribed medications strictly as instructed in the table below.',
    'Maintain adequate hydration with 2–3 liters of water daily unless fluid restricted.',
    'Rest adequately and avoid heavy physical exertion until your follow-up evaluation.',
    'Keep surgical/procedure sites clean and dry; follow dressing change guidelines.',
    'Monitor blood pressure and pulse rate daily if recommended by your cardiologist/physician.'
  ];

  const warningSignsList = [
    'Sudden onset of severe chest pain, pressure, or tightness',
    'Severe dyspnea (shortness of breath) or rapid breathing at rest',
    'High fever above 38.5°C (101.3°F) persistent despite antipyretics',
    'Sudden neurological weakness, facial drooping, or speech difficulty',
    'Uncontrolled bleeding, severe dizziness, or syncope (fainting)'
  ];

  return (
    <div className="doc-preview-wrapper" style={{ width: '100%', background: '#0f172a', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
      
      {/* Top Action Toolbar */}
      <div className="no-print" style={{ padding: '16px 24px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📄</span>
          <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '15px' }}>Official Discharge Document Preview</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleJsonExport}
            style={{
              padding: '8px 14px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📥 Export JSON
          </button>
          <button 
            onClick={handlePrint}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
            }}
          >
            🖨️ Download / Print PDF
          </button>
        </div>
      </div>

      {/* Styled Printable Hospital Document Body */}
      <div id="printable-summary-document" style={{ padding: '32px', background: '#ffffff', color: '#1e293b', fontFamily: "'Inter', sans-serif", minHeight: '800px' }}>
        
        {/* Hospital Header & Logo Placeholder */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', background: '#0284c7', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                🏥
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.5px' }}>
                  CITY CENTRAL MULTISPECIALTY HOSPITAL
                </h1>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  JCI & NABH Accredited Tertiary Care Center • 24x7 Emergency Line: +91 80 2345 6789
                </p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0284c7', textTransform: 'uppercase', tracking: '1px' }}>
              DISCHARGE SUMMARY
            </h2>
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
              UHID: <strong style={{ color: '#0f172a' }}>{demographics.uhid || 'UHID-000000'}</strong>
            </div>
          </div>
        </div>

        {/* Patient Demographics Banner Block */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
            <div><span style={{ color: '#64748b' }}>Patient Name:</span> <strong style={{ color: '#0f172a' }}>{demographics.name || '—'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Age / Gender:</span> <strong style={{ color: '#0f172a' }}>{demographics.age ? `${demographics.age} yrs` : '—'} / {demographics.gender || '—'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Adm Date:</span> <strong style={{ color: '#0f172a' }}>{demographics.admDate || '—'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Discharge Date:</span> <strong style={{ color: '#0f172a' }}>{demographics.disDate || '—'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Attending Doctor:</span> <strong style={{ color: '#0f172a' }}>{demographics.doctor || '—'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Ward / Bed:</span> <strong style={{ color: '#0f172a' }}>{demographics.ward || '—'}</strong></div>
            <div>
              <span style={{ color: '#64748b' }}>Risk Level: </span>
              <strong style={{ 
                color: riskClass === 'High' ? '#dc2626' : riskClass === 'Medium' ? '#d97706' : '#16a34a',
                padding: '2px 8px', borderRadius: '4px', background: riskClass === 'High' ? '#fee2e2' : riskClass === 'Medium' ? '#fef3c7' : '#dcfce7'
              }}>
                {riskClass} Risk
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Condition at Discharge: </span>
              <strong style={{ color: '#0284c7' }}>{conditionAtDischarge}</strong>
            </div>
          </div>
        </div>

        {/* Diagnosis Summary & Chief Complaint */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#0284c7', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
            1. Diagnosis & Chief Complaint
          </h3>
          <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '4px' }}><strong>Chief Complaint:</strong> {chiefComplaint || '—'}</div>
            <div style={{ marginBottom: '4px' }}><strong>Primary Diagnosis:</strong> <span style={{ color: '#0f172a', fontWeight: '600' }}>{primaryDx || '—'}</span></div>
            {secondaryDx && <div><strong>Secondary Diagnosis:</strong> {secondaryDx}</div>}
          </div>
        </div>

        {/* Vitals on Admission vs Discharge */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#0284c7', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
            2. Vital Signs (Admission vs. Discharge)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Stage</th>
                <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Blood Pressure (mmHg)</th>
                <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Heart Rate (bpm)</th>
                <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>SpO2 (%)</th>
                <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Temperature (°C)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#fff1f2', color: '#e11d48' }}>Admission</td>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{vitals.bpAdm || '—'}</td>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{vitals.hrAdm || '—'}</td>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{vitals.spO2Adm || '—'}</td>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{vitals.tempAdm || '—'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f0fdf4', color: '#16a34a' }}>Discharge</td>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{vitals.bpDis || '—'}</td>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{vitals.hrDis || '—'}</td>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{vitals.spO2Dis || '—'}</td>
                <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{vitals.tempDis || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Hospital Course Narrative */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#0284c7', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
            3. Hospital Course & AI Summary
          </h3>
          <p style={{ fontSize: '13px', lineHeight: '1.6', background: '#f8fafc', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #0284c7', fontStyle: rawNotes ? 'normal' : 'italic', color: rawNotes ? '#1e293b' : '#64748b' }}>
            {rawNotes || `Patient ${demographics.name || 'admitted'} presented with ${chiefComplaint || 'clinical symptoms'}. Evaluated and diagnosed with ${primaryDx || 'underlying condition'}. Received appropriate inpatient management and treatment course. Hemodynamically stable at the time of discharge.`}
          </p>
        </div>

        {/* Formatted Investigations Table */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#0284c7', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
            4. Key Investigations & Diagnostic Results
          </h3>
          {investigations.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>No key investigation records appended.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Test Name</th>
                  <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Result</th>
                  <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Reference Range</th>
                </tr>
              </thead>
              <tbody>
                {investigations.map((inv, idx) => (
                  <tr key={inv.id || idx}>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: '500' }}>{inv.test}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#0284c7', fontWeight: 'bold' }}>{inv.result}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b' }}>{inv.normal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Procedures Performed */}
        {procedures.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#0284c7', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
              5. Surgical / Clinical Procedures Performed
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {procedures.map((proc, idx) => (
                <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '14px', fontSize: '12px', fontWeight: '500' }}>
                  ✓ {proc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formatted Discharge Medications Table */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#0284c7', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
            6. Discharge Medication Schedule
          </h3>
          {medications.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>No discharge medications prescribed.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Drug Name</th>
                  <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Dosage</th>
                  <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Frequency</th>
                  <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med, idx) => (
                  <tr key={med.id || idx}>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#0f172a' }}>{med.drug}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{med.dose}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{med.frequency}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Follow Up Plan */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#0284c7', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
            7. Follow-Up Schedule
          </h3>
          <div style={{ fontSize: '13px', background: '#f0f9ff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
            📅 <strong>Follow-up Date:</strong> {followUpDate || 'As advised'} &nbsp;|&nbsp; 🏢 <strong>Department / Clinic:</strong> {followUpDept || 'Outpatient Department'}
          </div>
        </div>

        {/* Home Care Instructions */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#0284c7', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
            8. General Home Care Advice
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', lineHeight: '1.6', color: '#334155' }}>
            {homeCareList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Red Highlighted Warning Signs Box */}
        <div style={{ background: '#fff1f2', border: '2px solid #f43f5e', borderRadius: '8px', padding: '14px', marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 6px 0', color: '#be123c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚠️ URGENT WARNING SIGNS (Seek Immediate Emergency Care If Experienced)
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#9f1239', lineHeight: '1.5' }}>
            {warningSignsList.map((sign, idx) => (
              <li key={idx}>{sign}</li>
            ))}
          </ul>
        </div>

        {/* Signature Line */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Generated via AI Hospital Discharge Assistant</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>System Timestamp: {new Date().toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: '22px', color: '#0284c7', marginBottom: '4px' }}>
              {demographics.doctor ? demographics.doctor.split(' ')[1] || 'Dr. Signature' : 'Dr. Sarah Smith'}
            </div>
            <div style={{ borderTop: '1px solid #0f172a', width: '200px', paddingTop: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              Attending Physician Signature
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
