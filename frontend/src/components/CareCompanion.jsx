import React, { useState, useEffect, useRef } from 'react';

const BACKEND_URL = "http://127.0.0.1:8000";

const BCP47_LANG_CODES = {
    "English": "en-IN",
    "Hindi": "hi-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Kannada": "kn-IN",
    "Bengali": "bn-IN",
    "Marathi": "mr-IN",
    "Malayalam": "ml-IN"
};

export default function CareCompanion({ parsedSummaryEnglish, activeLanguage }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! I am your Care Companion. You can ask me any follow-up questions about your diagnosis, diet, medicines, or follow-up schedule."
        }
    ]);
    const [chatHistory, setChatHistory] = useState([]);
    const [queryText, setQueryText] = useState("");
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

    // Setup speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;

            rec.onstart = () => {
                setIsListening(true);
                setQueryText("Listening to you...");
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
                console.error("Speech Recognition Error:", e);
                setIsListening(false);
                setQueryText("");
            };

            recognitionRef.current = rec;
        }
    }, [parsedSummaryEnglish, chatHistory, activeLanguage]);

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert("Voice recognition is not supported in this browser. Please type your query.");
            return;
        }

        try {
            recognitionRef.current.lang = BCP47_LANG_CODES[activeLanguage] || "en-IN";
            if (isListening) {
                recognitionRef.current.stop();
            } else {
                recognitionRef.current.start();
            }
        } catch (e) {
            recognitionRef.current.stop();
        }
    };

    const submitChatQuery = async (text) => {
        if (!text || !text.trim() || !parsedSummaryEnglish) return;
        
        const userMsg = text.trim();
        setQueryText("");
        
        // Append user message
        const updatedMsgs = [...messages, { role: "user", content: userMsg }];
        setMessages(updatedMsgs);
        
        // Append to raw chat history state for LLM
        const updatedHistory = [...chatHistory, { role: "user", content: userMsg }];
        setChatHistory(updatedHistory);
        setLoading(true);

        try {
            const res = await fetch(`${BACKEND_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    summary_json: parsedSummaryEnglish,
                    full_text_context: parsedSummaryEnglish._full_text_context || "",
                    chat_history: updatedHistory,
                    user_query: userMsg,
                    language: activeLanguage
                })
            });

            if (!res.ok) throw new Error("Chat request failed");
            const data = await res.json();

            // Append bot message
            setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
            setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble answering that. Please verify your connection." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-widget">
            {/* Floating Trigger Button */}
            <button className="chat-trigger" onClick={() => setIsOpen(!isOpen)}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {parsedSummaryEnglish && <span className="pulse-indicator"></span>}
            </button>

            {/* Chat Drawer Window */}
            {isOpen && (
                <div className="chat-drawer">
                    <div className="chat-header">
                        <div className="chat-bot-profile">
                            <div className="bot-avatar">🩺</div>
                            <div>
                                <h4>Care Companion</h4>
                                <p>Ask follow-up questions</p>
                            </div>
                        </div>
                        <button className="icon-btn" onClick={() => setIsOpen(false)}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="chat-body">
                        {messages.map((msg, i) => (
                            <div 
                                key={i} 
                                className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Suggestion Chips */}
                    <div className="chat-suggestions">
                        <button 
                            className="suggest-chip" 
                            disabled={!parsedSummaryEnglish}
                            onClick={() => submitChatQuery("Can I eat normal white rice?")}
                        >
                            Can I eat rice?
                        </button>
                        <button 
                            className="suggest-chip" 
                            disabled={!parsedSummaryEnglish}
                            onClick={() => submitChatQuery("What should I do if my fever comes back?")}
                        >
                            Fever comes back?
                        </button>
                        <button 
                            className="suggest-chip" 
                            disabled={!parsedSummaryEnglish}
                            onClick={() => submitChatQuery("Why did the doctor prescribe the probiotic?")}
                        >
                            Why probiotic?
                        </button>
                    </div>

                    {/* Input box */}
                    <div className="chat-input-area">
                        <input 
                            type="text" 
                            value={queryText}
                            onChange={(e) => setQueryText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submitChatQuery(queryText)}
                            placeholder={parsedSummaryEnglish ? "Type a follow-up question..." : "Upload a document first..."} 
                            disabled={!parsedSummaryEnglish || loading}
                        />
                        <button 
                            className="icon-btn" 
                            onClick={handleVoiceInput}
                            style={{ color: isListening ? 'var(--danger)' : 'var(--text-muted)' }}
                            disabled={!parsedSummaryEnglish || loading}
                            title="Ask using voice"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </button>
                        <button 
                            className="send-btn" 
                            onClick={() => submitChatQuery(queryText)}
                            disabled={!parsedSummaryEnglish || !queryText.trim() || loading}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
