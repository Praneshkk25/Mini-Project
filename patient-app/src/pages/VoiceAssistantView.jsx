import React, { useState } from 'react';

export default function VoiceAssistantView() {
  const [language, setLanguage] = useState('Hindi');
  const [playing, setPlaying] = useState(false);

  const sampleText = "Please take your Aspirin 75 milligram daily after breakfast and avoid high salt food.";

  const handlePlayAudio = () => {
    setPlaying(true);
    const audioUrl = `http://localhost:8000/api/tts?text=${encodeURIComponent(sampleText)}&language=${encodeURIComponent(language)}`;
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🔊 Multilingual Voice Assistant</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Listen to clear verbal instructions in your preferred Indian regional language
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Select Preferred Audio Language:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
          >
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Tamil">Tamil (தமிழ்)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Bengali">Bengali (বাংলা)</option>
            <option value="Marathi">Marathi (मराठी)</option>
            <option value="Gujarati">Gujarati (ગુજરાતી)</option>
            <option value="Malayalam">Malayalam (മലയാളം)</option>
            <option value="English">English</option>
          </select>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Discharge Instruction Summary:</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            "{sampleText}"
          </p>
        </div>

        <button className="btn-primary" onClick={handlePlayAudio} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
          {playing ? '🔊 Playing Regional Audio Stream...' : `▶️ Listen in ${language}`}
        </button>
      </div>
    </div>
  );
}
