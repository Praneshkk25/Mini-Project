import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Mic, Send, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

const BACKEND_URL = "http://127.0.0.1:8000";

export default function AIChatCompanionView({ patient }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Care Companion powered by AuraHealth MedGemma AI. You can ask me any follow-up questions about your diagnosis, diet, medicines, or follow-up schedule.'
    }
  ]);
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => setIsListening(true);
      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setQueryText(text);
        submitChatQuery(text);
      };
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const handleVoiceInput = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }
    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (e) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const submitChatQuery = async (text) => {
    const userMsg = (text || queryText).trim();
    if (!userMsg) return;

    setQueryText('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          patient_id: patient?.patient_id || 'PT-1001',
          role: 'patient',
          history: newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: 'assistant', content: data.response }]);
      } else {
        const fallbackRes = await fetch(`${BACKEND_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary_json: { patient_name: patient?.name || 'Patient' },
            full_text_context: 'Patient care companion instructions.',
            chat_history: newMessages,
            user_query: userMsg,
            language: 'English'
          })
        });
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          setMessages([...newMessages, { role: 'assistant', content: fbData.response }]);
        } else {
          throw new Error('Failed');
        }
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'You can take your prescribed medicines with water after meals. If symptoms persist or you experience discomfort, please contact your physician or visit the hospital triage counter.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d9488'
          }}
        >
          <Stethoscope size={24} strokeWidth={2.5} color="#6366f1" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Care Companion</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0 0' }}>
            Ask follow-up questions regarding your diagnosis, diet, medicines, or follow-up schedule.
          </p>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="card" style={{ height: '580px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Messages Body */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '14px 18px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? '#0d9488' : '#f0f4f9',
                  color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  boxShadow: msg.role === 'user' ? '0 2px 8px rgba(13, 148, 136, 0.2)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '5px', padding: '10px 14px', background: '#f0f4f9', width: 'fit-content', borderRadius: '12px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div
          style={{
            padding: '10px 18px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff'
          }}
        >
          {[
            'Can I eat rice?',
            'Fever comes back?',
            'Why probiotics?',
            'When is my next appointment?',
            'Explain my prescriptions in INR (₹)'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => submitChatQuery(chip)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '12px',
                color: '#475569',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#ffffff'
          }}
        >
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitChatQuery(queryText)}
            placeholder="Type a follow-up question..."
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '24px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a'
            }}
          />

          <button
            onClick={handleVoiceInput}
            style={{
              background: isListening ? '#fee2e2' : '#f1f5f9',
              border: 'none',
              color: isListening ? '#ef4444' : '#64748b',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Voice Input"
          >
            <Mic size={19} />
          </button>

          <button
            onClick={() => submitChatQuery(queryText)}
            disabled={!queryText.trim() || loading}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#5eead4',
              color: '#0f766e',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: queryText.trim() ? 'pointer' : 'default',
              opacity: queryText.trim() ? 1 : 0.6
            }}
          >
            <Send size={16} color="#0f766e" />
          </button>
        </div>
      </div>
    </div>
  );
}
