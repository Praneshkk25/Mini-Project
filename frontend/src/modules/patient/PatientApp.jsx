import React, { useState, useEffect } from 'react';
import { MOCK_CITY_HOSPITALS, MOCK_DISCHARGE_SAMPLE } from '../../data/mockData';
import DocumentPreview from '../../components/common/DocumentPreview';
import StatusBadge from '../../components/common/StatusBadge';

export default function PatientApp() {
  const [activeTab, setActiveTab] = useState('token'); // 'token' | 'beds' | 'summary'
  const [language, setLanguage] = useState('English'); // English | Tamil | Hindi

  // OPD Token Tracker State with 5s Auto Refresh
  const [currentTokenIndex, setCurrentTokenIndex] = useState(2); // e.g., Serving A-012
  const [userToken] = useState('A-015');
  const tokens = ['A-010', 'A-011', 'A-012', 'A-013', 'A-014', 'A-015', 'A-016'];
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTokenIndex((prev) => (prev + 1) % tokens.length);
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentlyServing = tokens[currentTokenIndex];
  const tokensAhead = Math.max(0, tokens.indexOf(userToken) - currentTokenIndex);
  const estimatedWaitMins = tokensAhead * 8;

  // Bed Finder Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All'); // All | ICU | General | Maternity
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const filteredHospitals = MOCK_CITY_HOSPITALS.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.address.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (specialtyFilter === 'ICU') return h.icuAvail > 0;
    if (specialtyFilter === 'General') return h.generalAvail > 0;
    if (specialtyFilter === 'Maternity') return h.maternityAvail > 0;
    return true;
  });

  // Translations dictionary for language toggle UI
  const t = {
    English: {
      opdTracker: 'OPD Token Tracker',
      bedFinder: 'Bed Finder',
      mySummary: 'My Discharge Summary',
      servingNow: 'Currently Serving',
      yourToken: 'Your Token Number',
      estWait: 'Estimated Wait Time',
      tokensAhead: 'Tokens Ahead of You',
      autoRefresh: 'Auto-refreshes every 5 seconds',
      searchHospitals: 'Search hospitals by name or location...',
      specialty: 'Specialty Filter',
      icu: 'ICU Beds',
      general: 'General Beds',
      maternity: 'Maternity Beds',
    },
    Tamil: {
      opdTracker: 'OPD டோக்கன் கண்காணிப்பு',
      bedFinder: 'படுக்கை தேடல்',
      mySummary: 'எனது டிஸ்சார்ஜ் சுருக்கம்',
      servingNow: 'தற்போது சேவை செய்யப்படுகிறது',
      yourToken: 'உங்கள் டோக்கன் எண்',
      estWait: 'எதிர்பார்க்கப்படும் காத்திருப்பு நேரம்',
      tokensAhead: 'உங்களுக்கு முன்னால் உள்ள டோக்கன்கள்',
      autoRefresh: 'ஒவ்வொரு 5 விநாடிக்கும் தானாகப் புதுப்பிக்கப்படும்',
      searchHospitals: 'மருத்துவமனைகளைத் தேடுங்கள்...',
      specialty: 'சிறப்பு வடிகட்டி',
      icu: 'ICU படுக்கைகள்',
      general: 'பொது படுக்கைகள்',
      maternity: 'மகப்பேறு படுக்கைகள்',
    },
    Hindi: {
      opdTracker: 'ओपीडी टोकन ट्रैकर',
      bedFinder: 'बेड खोजें',
      mySummary: 'मेरा डिस्चार्ज सारांश',
      servingNow: 'वर्तमान में सेवा जारी',
      yourToken: 'आपका टोकन नंबर',
      estWait: 'अनुमानित प्रतीक्षा समय',
      tokensAhead: 'आपके आगे टोकन संख्या',
      autoRefresh: 'हर 5 सेकंड में स्वतः रीफ्रेश',
      searchHospitals: 'अस्पताल खोजें...',
      specialty: 'विशेषज्ञता फ़िल्टर',
      icu: 'आईसीयू बेड',
      general: 'सामान्य बेड',
      maternity: 'मातृत्व बेड',
    }
  }[language];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
      
      {/* Patient Header & Language Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
            👤 Patient Care Companion
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
            Real-time OPD token status, nearby bed availability, and medical summary.
          </p>
        </div>

        {/* Language Selector UI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '6px 12px', borderRadius: '12px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '14px' }}>🌐 Language:</span>
          {['English', 'Tamil', 'Hindi'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                background: language === lang ? '#06b6d4' : 'transparent',
                color: language === lang ? '#ffffff' : '#94a3b8'
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className={`tab-btn ${activeTab === 'token' ? 'active' : ''}`} onClick={() => setActiveTab('token')}>
          🎟️ {t.opdTracker}
        </button>
        <button className={`tab-btn ${activeTab === 'beds' ? 'active' : ''}`} onClick={() => setActiveTab('beds')}>
          🏥 {t.bedFinder}
        </button>
        <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
          📄 {t.mySummary}
        </button>
      </div>

      {/* 1. OPD Token Tracker View */}
      {activeTab === 'token' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '28px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' }}>
            
            <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              {t.autoRefresh} ({lastRefreshed})
            </div>

            <span style={{ fontSize: '13px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', fontWeight: '600' }}>
              {t.servingNow}
            </span>
            
            <div style={{ fontSize: '64px', fontWeight: '900', color: '#38bdf8', margin: '8px 0', letterSpacing: '-2px' }}>
              {currentlyServing}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #334155' }}>
              <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{t.yourToken}</span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{userToken}</div>
              </div>
              <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{t.estWait}</span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
                  ~{estimatedWaitMins} mins
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#cbd5e1' }}>
              {t.tokensAhead}: <strong style={{ color: '#38bdf8' }}>{tokensAhead} Patients</strong>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (currentTokenIndex / (tokens.length - 1)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #06b6d4)', transition: 'width 0.5s ease' }}></div>
            </div>

          </div>
        </div>
      )}

      {/* 2. Bed Finder View */}
      {activeTab === 'beds' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <input 
              type="text" 
              placeholder={t.searchHospitals} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="form-input" 
              style={{ maxWidth: '350px' }} 
            />

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)} className="form-input">
                <option value="All">All Specialties</option>
                <option value="ICU">{t.icu}</option>
                <option value="General">{t.general}</option>
                <option value="Maternity">{t.maternity}</option>
              </select>

              <div style={{ display: 'flex', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setViewMode('list')} style={{ padding: '8px 12px', background: viewMode === 'list' ? '#06b6d4' : '#0f172a', color: '#fff', border: 'none', cursor: 'pointer' }}>📋 List</button>
                <button onClick={() => setViewMode('map')} style={{ padding: '8px 12px', background: viewMode === 'map' ? '#06b6d4' : '#0f172a', color: '#fff', border: 'none', cursor: 'pointer' }}>🗺️ Map</button>
              </div>
            </div>
          </div>

          {/* List View */}
          {viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredHospitals.map(h => (
                <div key={h.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>{h.name}</h4>
                      <StatusBadge status={h.status} />
                    </div>
                    <p style={{ margin: '4px 0 8px 0', fontSize: '13px', color: '#94a3b8' }}>📍 {h.address} • 📍 Distance: <strong>{h.distance}</strong></p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                      <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '6px' }}>
                        🔴 ICU Avail: {h.icuAvail}
                      </span>
                      <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px' }}>
                        🛏️ General: {h.generalAvail}
                      </span>
                      <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '6px' }}>
                        👶 Maternity: {h.maternityAvail}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: h.availBeds > 0 ? '#10b981' : '#ef4444' }}>
                      {h.availBeds} Beds Free
                    </div>
                    <button style={{ marginTop: '8px', padding: '8px 14px', background: 'linear-gradient(135deg, #0284c7, #06b6d4)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                      📞 Call Emergency ({h.contact})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Map View Simulation */
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
              <h4 style={{ margin: 0, color: '#f8fafc' }}>Interactive Hospital Bed GIS Map</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Showing {filteredHospitals.length} nearby healthcare centers with live bed heat indicators.</p>
            </div>
          )}

        </div>
      )}

      {/* 3. My Discharge Summary View */}
      {activeTab === 'summary' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <DocumentPreview 
            demographics={MOCK_DISCHARGE_SAMPLE.demographics}
            chiefComplaint={MOCK_DISCHARGE_SAMPLE.chiefComplaint}
            primaryDx={MOCK_DISCHARGE_SAMPLE.primaryDx}
            secondaryDx={MOCK_DISCHARGE_SAMPLE.secondaryDx}
            riskClass={MOCK_DISCHARGE_SAMPLE.riskClass}
            vitals={MOCK_DISCHARGE_SAMPLE.vitals}
            investigations={MOCK_DISCHARGE_SAMPLE.investigations}
            procedures={MOCK_DISCHARGE_SAMPLE.procedures}
            medications={MOCK_DISCHARGE_SAMPLE.medications}
            followUpDate={MOCK_DISCHARGE_SAMPLE.followUpDate}
            followUpDept={MOCK_DISCHARGE_SAMPLE.followUpDept}
            conditionAtDischarge={MOCK_DISCHARGE_SAMPLE.conditionAtDischarge}
            rawNotes={MOCK_DISCHARGE_SAMPLE.rawNotes}
          />
        </div>
      )}

    </div>
  );
}
