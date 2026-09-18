import React, { useState, useEffect, useRef } from 'react';
import { translateText } from '../utils/translate';

const ENGLISH_SAMPLE = "Please take your Aspirin 75 milligram daily after breakfast and avoid high salt food.";

export default function VoiceAssistantView() {
  const [language, setLanguage] = useState('Hindi');
  const [displayText, setDisplayText] = useState(ENGLISH_SAMPLE);
  const [translating, setTranslating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  // Stop any active audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(false);
  };

  // Translate sample text whenever the user picks a new language
  useEffect(() => {
    let isMounted = true;
    stopAudio();

    if (language === 'English') {
      setDisplayText(ENGLISH_SAMPLE);
      return;
    }

    setTranslating(true);
    translateText(ENGLISH_SAMPLE, language)
      .then((translated) => {
        if (isMounted) {
          setDisplayText(translated || ENGLISH_SAMPLE);
        }
      })
      .catch(() => {
        if (isMounted) setDisplayText(ENGLISH_SAMPLE);
      })
      .finally(() => {
        if (isMounted) setTranslating(false);
      });

    return () => {
      isMounted = false;
      stopAudio();
    };
  }, [language]);

  const handlePlayAudio = () => {
    if (playing) {
      stopAudio();
      return;
    }

    stopAudio();
    setPlaying(true);

    const textToSpeak = displayText || ENGLISH_SAMPLE;
    const audioUrl = `http://localhost:8000/api/tts?text=${encodeURIComponent(textToSpeak)}&language=${encodeURIComponent(language)}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.error('Audio playback error:', err);
      setPlaying(false);
    });
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
            {/* ── Indian languages ── */}
            <optgroup label="🇮🇳 Indian Languages">
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Malayalam">Malayalam (മലയാളം)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Urdu">Urdu (اردو)</option>
              <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
              <option value="Assamese">Assamese (অসমীয়া)</option>
              <option value="Nepali">Nepali (नेपाली)</option>
              <option value="Sinhala">Sinhala (සිංহල)</option>
            </optgroup>
            {/* ── International languages ── */}
            <optgroup label="🌐 International Languages">
              <option value="Arabic">Arabic (العربية)</option>
              <option value="French">French (Français)</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="German">German (Deutsch)</option>
              <option value="Portuguese">Portuguese (Português)</option>
              <option value="Russian">Russian (Русский)</option>
              <option value="Japanese">Japanese (日本語)</option>
              <option value="Korean">Korean (한국어)</option>
              <option value="Chinese (Simplified)">Chinese Simplified (中文简体)</option>
              <option value="Chinese (Traditional)">Chinese Traditional (中文繁體)</option>
              <option value="Italian">Italian (Italiano)</option>
              <option value="Turkish">Turkish (Türkçe)</option>
              <option value="Indonesian">Indonesian (Bahasa Indonesia)</option>
              <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
              <option value="Thai">Thai (ภาษาไทย)</option>
              <option value="Swahili">Swahili (Kiswahili)</option>
            </optgroup>
          </select>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Discharge Instruction Summary ({language}):</h4>
            {translating && <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>Translating...</span>}
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
            "{displayText}"
          </p>
          {language !== 'English' && (
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0, fontStyle: 'italic' }}>
              Original (English): "{ENGLISH_SAMPLE}"
            </p>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handlePlayAudio}
          disabled={translating}
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', opacity: translating ? 0.7 : 1 }}
        >
          {playing ? '⏹️ Stop Audio' : `🔊 Listen in ${language}`}
        </button>
      </div>
    </div>
  );
}
