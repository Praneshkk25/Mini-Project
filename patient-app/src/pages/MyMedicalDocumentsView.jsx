import React, { useState } from 'react';
import { FileText, Upload, Download, Eye, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';

export default function MyMedicalDocumentsView({ patient }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState([
    {
      id: 'DOC-101',
      filename: '12_Lead_ECG_Telemetry_Report.pdf',
      category: 'ECG',
      upload_date: '2026-08-31',
      source: 'Uploaded via MediKiosk',
      ocr_status: 'Completed',
      verified: true,
      extracted_data: 'Normal Sinus Rhythm, HR 74 bpm, PR 160ms, QRS 88ms, no ST elevation.'
    },
    {
      id: 'DOC-102',
      filename: 'Comprehensive_Metabolic_Panel.pdf',
      category: 'Lab Reports',
      upload_date: '2026-08-25',
      source: 'Central Pathology Laboratory',
      ocr_status: 'Completed',
      verified: true,
      extracted_data: 'Fasting Glucose 96 mg/dL, HbA1c 5.4%, Serum Creatinine 0.9 mg/dL.'
    },
    {
      id: 'DOC-103',
      filename: 'Cardiology_Discharge_Summary.pdf',
      category: 'Discharge',
      upload_date: '2026-08-10',
      source: 'Hospital EHR System',
      ocr_status: 'Completed',
      verified: true,
      extracted_data: 'Discharged in stable condition. Diet: Low Sodium. Follow-up: 14 days.'
    }
  ]);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Prescriptions');

  const handleUpload = (e) => {
    e.preventDefault();
    const newDoc = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      filename: `Patient_Record_${Date.now().toString().slice(-4)}.pdf`,
      category: uploadCategory,
      upload_date: new Date().toISOString().split('T')[0],
      source: 'Patient Self-Upload',
      ocr_status: 'Completed',
      verified: true,
      extracted_data: 'Document verified and indexed into patient health timeline.'
    };
    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    alert('✓ Document uploaded and processed through AI OCR parser.');
  };

  const filtered = selectedCategory === 'all' ? documents : documents.filter((d) => d.category === selectedCategory);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Medical Documents & OCR Library
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Structured document archive, AI extracted reports, and verified medical records.
          </p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}>
          <Upload size={16} /> Upload Document
        </button>
      </div>

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
                <Download size={14} /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '560px', padding: '24px', background: '#fff' }}>
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>📤 Upload Medical Document</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
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
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Select File (PDF, PNG, JPG)</label>
                  <input type="file" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Upload & Parse OCR</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
