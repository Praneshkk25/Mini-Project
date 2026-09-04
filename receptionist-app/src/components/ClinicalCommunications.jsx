import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Circle } from 'lucide-react';

const DEFAULT_STAFF = [
  { id: 'dr_sarah', name: 'Dr. Sarah Jenkins', role: 'Chief of Cardiology', avatar: 'SJ', status: 'online' },
  { id: 'dr_michael', name: 'Dr. Michael Chang', role: 'Cardiology Fellow', avatar: 'MC', status: 'online' },
  { id: 'nurse_claire', name: 'Nurse Claire Dupont', role: 'ICU Charge Nurse', avatar: 'CD', status: 'online' },
  { id: 'dr_marcus', name: 'Dr. Marcus Vance', role: 'Radiology Lead', avatar: 'MV', status: 'away' },
  { id: 'pharmacy', name: 'Central Pharmacy', role: 'Inpatient Dispense', avatar: 'RX', status: 'online' }
];

export default function ClinicalCommunications({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStaffId, setActiveStaffId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load from shared storage
  useEffect(() => {
    const loadMessages = () => {
      const stored = localStorage.getItem('careease_clinical_chats');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMessages(parsed);
        } catch (e) {}
      }
    };

    loadMessages();
    const handleStorage = () => loadMessages();
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(loadMessages, 2000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeStaffId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeStaffId]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || !activeStaffId) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      senderName: currentUser?.name || 'Reception Desk (Elena)',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    const currentChat = messages[activeStaffId] || [];
    const updated = {
      ...messages,
      [activeStaffId]: [...currentChat, newMsg]
    };

    setMessages(updated);
    localStorage.setItem('careease_clinical_chats', JSON.stringify(updated));

    // Also broadcast a doctor notification
    const currentAlerts = JSON.parse(localStorage.getItem('careease_doctor_alerts') || '[]');
    currentAlerts.unshift({
      id: Date.now(),
      title: `Desk Message: ${currentUser?.name || 'Elena'}`,
      desc: messageInput.trim(),
      time: 'Just now',
      type: 'info',
      unread: true
    });
    localStorage.setItem('careease_doctor_alerts', JSON.stringify(currentAlerts));

    setMessageInput('');
  };

  const activeStaff = DEFAULT_STAFF.find((s) => s.id === activeStaffId);
  const activeChatMessages = (activeStaffId && messages[activeStaffId]) || [];

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? '#f1f5f9' : '#ffffff',
          border: '1px solid var(--border-color)',
          padding: '8px 14px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '13px',
          color: '#334155',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <MessageSquare size={16} color="var(--primary)" />
        <span>Clinical Communications</span>
        <span style={{ fontSize: '11px', background: 'var(--primary)', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
          {DEFAULT_STAFF.length}
        </span>
      </button>

      {/* Flyout Dropdown Window */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '380px',
            background: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {activeStaff ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setActiveStaffId(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: '13px', padding: 0 }}
                >
                  &larr; Back
                </button>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{activeStaff.name}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{activeStaff.role}</span>
                </div>
              </div>
            ) : (
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Clinical Communications</h4>
                <span style={{ fontSize: '11px', color: '#64748b' }}>4 Active Staff On Duty</span>
              </div>
            )}
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          </div>

          {/* Body: Staff List or Active Conversation */}
          {!activeStaffId ? (
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {DEFAULT_STAFF.map((staff) => {
                const staffMsgs = messages[staff.id] || [];
                const lastMsg = staffMsgs.length > 0 ? staffMsgs[staffMsgs.length - 1].text : 'Click to start clinical chat';
                const lastTime = staffMsgs.length > 0 ? staffMsgs[staffMsgs.length - 1].time : '';

                return (
                  <div
                    key={staff.id}
                    onClick={() => setActiveStaffId(staff.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                        {staff.avatar}
                      </div>
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: staff.status === 'online' ? '#10b981' : '#f59e0b',
                          border: '2px solid #fff'
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{staff.name}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{lastTime || 'now'}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{staff.role}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {lastMsg}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {/* Chat Messages */}
              <div style={{ height: '260px', overflowY: 'auto', padding: '14px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeChatMessages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', margin: 'auto' }}>
                    No messages yet with {activeStaff.name}.<br />Type a note below.
                  </p>
                ) : (
                  activeChatMessages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.sender === 'me' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: m.sender === 'me' ? 'var(--primary)' : '#ffffff',
                        color: m.sender === 'me' ? '#ffffff' : '#0f172a',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        border: m.sender === 'me' ? 'none' : '1px solid #e2e8f0'
                      }}
                    >
                      <div>{m.text}</div>
                      <div style={{ fontSize: '10px', opacity: 0.75, textAlign: 'right', marginTop: '2px' }}>
                        {m.time}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                <button
                  onClick={() => setMessageInput('⚠️ Patient checked in at OPD Desk and waiting for consultation.')}
                  style={{ fontSize: '11px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap', cursor: 'pointer' }}
                >
                  + Patient Checked In
                </button>
                <button
                  onClick={() => setMessageInput('📋 Vitals recorded and uploaded to patient chart.')}
                  style={{ fontSize: '11px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap', cursor: 'pointer' }}
                >
                  + Vitals Ready
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder={`Message ${activeStaff.name.split(' ')[1]}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 14px', borderRadius: '8px' }}
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
