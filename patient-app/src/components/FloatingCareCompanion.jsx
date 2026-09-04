import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, X, Mic, Send, MessageSquare } from 'lucide-react';

const BACKEND_URL = "http://127.0.0.1:8000";

export default function FloatingCareCompanion({ patient }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Care Companion. You can ask me any follow-up questions about your diagnosis, diet, medicines, or follow-up schedule.'
    }
  ]);
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setQueryText(text);
        submitChatQuery(text);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error('Speech Recognition Error:', e);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleVoiceInput = () => {
    // Stop any ongoing browser speech synthesis immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
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
      // First try MedGemma AI endpoint
      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          patient_id: patient?.patient_id || 'PT-1001',
          role: 'patient'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: 'assistant', content: data.response }]);
      } else {
        // Fallback to general chat endpoint
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
          throw new Error('Chat failed');
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
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: "'Inter', sans-serif" }}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          title="Open Care Companion AI"
        >
          <MessageSquare size={26} color="#ffffff" strokeWidth={2.2} />
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div
          style={{
            width: '360px',
            height: '520px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.25s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d9488'
                }}
              >
                <Stethoscope size={20} strokeWidth={2.5} color="#6366f1" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Care Companion</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Ask follow-up questions</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user' ? '#0d9488' : '#f1f5f9',
                    color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    boxShadow: msg.role === 'user' ? '0 2px 8px rgba(13, 148, 136, 0.25)' : 'none'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '4px', padding: '10px 14px', background: '#f1f5f9', width: 'fit-content', borderRadius: '12px' }}>
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
              padding: '8px 12px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              borderTop: '1px solid #f1f5f9',
              background: '#ffffff',
              scrollbarWidth: 'none'
            }}
          >
            {[
              'Can I eat rice?',
              'Fever comes back?',
              'Why probiotics?'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => submitChatQuery(chip)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '11px',
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
              padding: '12px 14px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff'
            }}
          >
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitChatQuery(queryText)}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a'
              }}
            />

            <button
              onClick={handleVoiceInput}
              style={{
                background: isListening ? '#fee2e2' : 'none',
                border: 'none',
                color: isListening ? '#ef4444' : '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Voice Input"
            >
              <Mic size={18} />
            </button>

            <button
              onClick={() => submitChatQuery(queryText)}
              disabled={!queryText.trim() || loading}
              style={{
                width: '32px',
                height: '32px',
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
              <Send size={15} color="#0f766e" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
