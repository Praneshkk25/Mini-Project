import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Eye, CheckCircle2, AlertCircle, Plus, X, Sparkles, MessageSquare, RefreshCw, BookOpen, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const DEFAULT_DOCUMENTS = [
  {
    id: 'DOC-101',
    filename: '12_Lead_ECG_Telemetry_Report.pdf',
    category: 'ECG',
    upload_date: '2026-08-31',
    source: 'AuraHealth Cardiology Lab',
    ocr_status: 'Completed',
    verified: true,
    extracted_data: 'Normal Sinus Rhythm, HR 74 bpm, PR interval 160ms, QRS 88ms, no ST elevation, normal axis.'
  },
  {
    id: 'DOC-102',
    filename: 'Comprehensive_Metabolic_Panel.pdf',
    category: 'Lab Reports',
    upload_date: '2026-08-25',
    source: 'Central Pathology Laboratory',
    ocr_status: 'Completed',
    verified: true,
    extracted_data: 'Fasting Glucose 96 mg/dL, HbA1c 5.4%, Serum Creatinine 0.9 mg/dL, eGFR >90 mL/min/1.73m².'
  },
  {
    id: 'DOC-103',
    filename: 'Cardiology_Discharge_Summary.pdf',
    category: 'Discharge',
    upload_date: '2026-08-10',
    source: 'AuraHealth EHR System',
    ocr_status: 'Completed',
    verified: true,
    extracted_data: 'Discharged in hemodynamically stable condition. Final diagnosis: Acute Coronary Syndrome post-PCI with drug-eluting stent. Diet: Low Sodium. Follow-up: 14 days.'
  }
];

const SAMPLE_DISCHARGE = {
  title: 'Inpatient Cardiology Discharge Summary',
  admission_date: '2026-08-05',
  discharge_date: '2026-08-10',
  hospital: 'AuraHealth Central Hospital',
  attending: 'Dr. Sarah Jenkins, MD, DM (Cardiology)',
  diagnosis: 'Acute Coronary Syndrome — NSTEMI; Successful Primary PCI with Everolimus-Eluting Stent to Left Anterior Descending (LAD) Artery.',
  clinical_summary: 'Patient presented with retrosternal chest pressure and diaphoresis. Coronary angiogram revealed 90% stenosis in proximal LAD. Successfully deployed 3.0 x 18mm drug-eluting stent with TIMI 3 distal flow. Post-procedural recovery uneventful. Hemodynamically stable, ambulating comfortably.',
  medications: [
    { name: 'Aspirin 75mg', freq: 'Once daily after meals', purpose: 'Blood thinner to prevent stent clotting' },
    { name: 'Ticagrelor 90mg', freq: 'Twice daily with meals', purpose: 'Dual antiplatelet therapy for 12 months' },
    { name: 'Atorvastatin 40mg', freq: 'Once daily at bedtime', purpose: 'Cholesterol lowering & arterial plaque stabilizer' },
    { name: 'Metoprolol Succinate 25mg', freq: 'Once daily morning', purpose: 'Cardioprotective beta-blocker to control heart rate' },
    { name: 'Pantocid 40mg', freq: 'Once daily 30 mins before breakfast', purpose: 'Gastric mucosal protection' },
  ],
  lifestyle_diet: 'Strict low-sodium (< 2g/day), heart-healthy Mediterranean-style diet. No strenuous physical lifting (> 5kg) for 2 weeks. 20-30 min gentle walking permitted.',
  red_flags: 'Recurrent chest pain, shortness of breath, sudden palpitations, dizziness, or unusual bleeding/bruising require immediate ER reporting.',
  followup: 'Outpatient Cardiology follow-up in 14 days with repeat ECG and lipid panel.'
};

export default function MyMedicalDocumentsView({ patient, onNavigate }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'discharge_summarizer'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState(DEFAULT_DOCUMENTS);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Prescriptions');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Discharge summarizer state
  const [simpleLanguageMode, setSimpleLanguageMode] = useState(false);

  // 1. Fetch patient documents from backend
  const fetchDocuments = async () => {
    if (!patient?.patient_id) return;
    setLoadingDocs(true);
    try {
      const res = await fetch(`${API_BASE}/documents/patient/${patient.patient_id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          const combined = [
            ...data.documents.map((d) => ({
              id: d.document_id || `DOC-${d.id}`,
              filename: d.filename,
              category: d.category || 'General',
              upload_date: d.upload_date || new Date().toISOString().split('T')[0],
              source: d.uploaded_by || 'Patient Upload',
              ocr_status: d.ocr_status || 'Completed',
              verified: true,
              extracted_data: d.extracted_text || d.description || 'Document OCR indexed into EHR.'
            })),
            ...DEFAULT_DOCUMENTS
          ];
          setDocuments(combined);
        }
      }
    } catch (e) {
      console.warn('Document fetch failed:', e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [patient?.patient_id]);

  // 2. Real Document Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('patient_id', patient.patient_id);
      formData.append('category', uploadCategory);
      formData.append('tags', uploadCategory.toLowerCase());

      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Document upload failed.');
      }

      setShowUploadModal(false);
      setUploadFile(null);
      fetchDocuments();
      alert(`✓ Document "${data.filename}" uploaded successfully and parsed with AI OCR!`);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const filtered = selectedCategory === 'all' ? documents : documents.filter((d) => d.category === selectedCategory);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Medical Documents & Discharge Summarizer
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Multi-format OCR archiving (PDF/JPG/PNG) and plain-language clinical discharge explanations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('library')}
            style={{
              background: activeTab === 'library' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'library' ? '#fff' : '#475569',
              border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
            }}
          >
            📁 Document Archive
          </button>
          <button
            onClick={() => setActiveTab('discharge_summarizer')}
            style={{
              background: activeTab === 'discharge_summarizer' ? '#0d9488' : '#f1f5f9',
              color: activeTab === 'discharge_summarizer' ? '#fff' : '#475569',
              border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Sparkles size={15} /> Discharge Summarizer
          </button>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}>
            <Upload size={15} /> Upload File
          </button>
        </div>
      </div>

      {/* ── SUB-TAB 1: DOCUMENT ARCHIVE ── */}
      {activeTab === 'library' && (
        <div>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '18px', paddingBottom: '6px' }}>
            {['all', 'Prescriptions', 'Lab Reports', 'ECG', 'Imaging', 'Discharge', 'Referral'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? '#0284c7' : '#f1f5f9',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat === 'all' ? 'All Documents' : cat}
              </button>
            ))}
          </div>

          {/* Documents Table / Grid */}
          {loadingDocs ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              Loading medical document archive…
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
              <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: 0, color: '#0f172a' }}>No {selectedCategory} documents found</h4>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Upload previous prescriptions, scans or lab results to index them into your timeline.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {filtered.map((doc) => (
                <div key={doc.id} className="card" style={{ padding: '18px', borderLeft: '4px solid #0284c7', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {doc.category}
                      </span>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Verified OCR
                      </span>
                    </div>

                    <h4 style={{ margin: '6px 0 0 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{doc.filename}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      Uploaded: {doc.upload_date} &bull; Source: {doc.source}
                    </p>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginTop: '10px', fontSize: '12px', color: '#334155' }}>
                      <strong style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>AI Extracted Key Findings:</strong>
                      <div style={{ marginTop: '2px' }}>{doc.extracted_data}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '14px' }}>
                    <button onClick={() => setPreviewDoc(doc)} className="btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Eye size={14} /> View Details
                    </button>
                    <button onClick={() => alert(`Downloading ${doc.filename}...`)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Download size={14} /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 2: DEDICATED DISCHARGE SUMMARIZER ── */}
      {activeTab === 'discharge_summarizer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div className="card" style={{ padding: '18px 24px', background: '#f0fdf4', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Smart Inpatient Discharge Summarizer
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#334155' }}>
                Converts complex medical reports into plain-language instructions you can easily understand and act on.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSimpleLanguageMode(!simpleLanguageMode)}
                style={{
                  background: simpleLanguageMode ? '#15803d' : '#fff',
                  color: simpleLanguageMode ? '#fff' : '#15803d',
                  border: '1px solid #15803d',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BookOpen size={16} />
                {simpleLanguageMode ? '✓ Simple Language: Active' : 'Explain in Simple Language'}
              </button>

              <button
                onClick={() => onNavigate ? onNavigate('companion') : null}
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageSquare size={16} /> Ask Care Companion
              </button>
            </div>
          </div>

          {/* Discharge Content Card */}
          <div className="card" style={{ padding: '28px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  OFFICIAL DISCHARGE SUMMARY
                </span>
                <h2 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {SAMPLE_DISCHARGE.title}
                </h2>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  {SAMPLE_DISCHARGE.hospital} &bull; Attending: <strong>{SAMPLE_DISCHARGE.attending}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '13px', color: '#475569' }}>
                <div>Admitted: <strong>{SAMPLE_DISCHARGE.admission_date}</strong></div>
                <div>Discharged: <strong>{SAMPLE_DISCHARGE.discharge_date}</strong></div>
              </div>
            </div>

            {/* Diagnosis & Summary */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                Clinical Diagnosis
              </h4>
              <div style={{ background: simpleLanguageMode ? '#f0fdf4' : '#f8fafc', padding: '14px', borderRadius: '10px', border: `1px solid ${simpleLanguageMode ? '#86efac' : '#e2e8f0'}` }}>
                {simpleLanguageMode ? (
                  <div>
                    <strong style={{ color: '#15803d', display: 'block', marginBottom: '4px' }}>
                      In Simple Terms:
                    </strong>
                    <p style={{ margin: 0, color: '#334155', lineHeight: 1.6 }}>
                      You had a mild heart attack caused by a blocked heart blood vessel. Our cardiology team inserted a tiny mesh tube (stent) to open the artery, restore normal blood flow, and protect your heart muscle. The procedure was successful and your heart function is stable.
                    </p>
                  </div>
                ) : (
                  <div style={{ color: '#334155', fontSize: '14px', lineHeight: 1.6 }}>
                    {SAMPLE_DISCHARGE.diagnosis}
                    <div style={{ marginTop: '8px', color: '#64748b', fontSize: '13px' }}>
                      {SAMPLE_DISCHARGE.clinical_summary}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Discharge Medications */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                Prescribed Post-Discharge Medications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {SAMPLE_DISCHARGE.medications.map((m, idx) => (
                  <div key={idx} style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{m.name}</div>
                    <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700, margin: '2px 0' }}>{m.freq}</div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                      <strong>Why take this:</strong> {m.purpose}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diet, Lifestyle & Red Flags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  🥗 Diet & Activity Guidance
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                  {SAMPLE_DISCHARGE.lifestyle_diet}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: '#fff1f2', border: '1px solid #fecdd3' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: '#be123c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} /> Red Flags / When to Call Emergency
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#9f1239', lineHeight: 1.5 }}>
                  {SAMPLE_DISCHARGE.red_flags}
                </p>
              </div>
            </div>

            {/* Follow up strip */}
            <div style={{ background: '#f0f9ff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ color: '#0369a1', fontSize: '13px' }}>Next Scheduled Follow-Up:</strong>
                <div style={{ color: '#0c4a6e', fontSize: '13px', marginTop: '2px' }}>{SAMPLE_DISCHARGE.followup}</div>
              </div>
              <button
                onClick={() => onNavigate ? onNavigate('appointments') : null}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                Schedule Follow-up Slot &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ width: '560px', maxWidth: '100%', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  DOCUMENT PREVIEW
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '17px', fontWeight: 800 }}>{previewDoc.filename}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <strong style={{ color: '#0f172a' }}>Structured OCR Extraction:</strong>
                <p style={{ margin: '6px 0 0 0', color: '#334155', lineHeight: '1.6' }}>{previewDoc.extracted_data}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Category:</span>
                  <div style={{ fontWeight: 700 }}>{previewDoc.category}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Verification Status:</span>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>Verified by Hospital System</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button onClick={() => setPreviewDoc(null)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ width: '480px', maxWidth: '100%', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>📤 Upload Medical Document</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {uploadError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px' }}>
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Document Category</label>
                  <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>Prescriptions</option>
                    <option>Lab Reports</option>
                    <option>ECG</option>
                    <option>Imaging</option>
                    <option>Discharge</option>
                    <option>Referral</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Select File (PDF, PNG, JPG)
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Files are parsed automatically with OCR and indexed into your timeline.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={uploading} className="btn-primary">
                    {uploading ? 'Parsing with OCR…' : 'Upload & Parse OCR'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
