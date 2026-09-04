import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  X,
  CheckCheck,
  Trash2,
  AlertTriangle,
  HeartPulse,
  FileCheck,
  Pill,
  Send,
  ArrowLeft,
  User,
  Building2,
  Settings,
  Lock,
  LogOut,
  ShieldCheck,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [];

const INITIAL_CHATS = [];

const SEARCHABLE_ITEMS = [];

export default function TopBar() {
  // Popover toggle states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState('all');

  // Interactive state
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [doctorStatus, setDoctorStatus] = useState('On Duty');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'dept' | 'settings' | 'lock'
  const [toastMessage, setToastMessage] = useState(null);

  // References for outside click
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowMessages(false);
        setShowProfile(false);
        setIsSearchFocused(false);
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside clicks to close popovers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (msgRef.current && !msgRef.current.contains(e.target)) {
        setShowMessages(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeChatId) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, chats]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Notification handlers
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('All notifications cleared');
  };

  const toggleNotificationRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const deleteNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeNotificationTab === 'alerts') return n.category === 'alerts';
    if (activeNotificationTab === 'updates') return n.category === 'updates';
    return true;
  });

  // Message chat handlers
  const activeChat = chats.find((c) => c.id === activeChatId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMessage: newMsg.text,
              time: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setMessageInput('');

    // Simulate instant doctor reply after 1.2s
    setTimeout(() => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            const replies = [
              'Acknowledged Dr. Jenkins, proceeding immediately.',
              'Confirmed. Order noted on the patient chart.',
              'Updated the EHR clinical record accordingly.',
              'Received. Will monitor and keep you updated.',
            ];
            const replyMsg = {
              id: Date.now() + 1,
              sender: 'them',
              text: replies[Math.floor(Math.random() * replies.length)],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            return {
              ...c,
              lastMessage: replyMsg.text,
              time: 'Just now',
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  // Search filtering
  const filteredSearch = SEARCHABLE_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="topbar" id="main-topbar">
        {/* Global Search */}
        <div className="topbar-popover-anchor" ref={searchRef}>
          <div className="topbar-search">
            <Search size={18} className="topbar-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              id="global-search"
              className="topbar-search-input"
              placeholder="Search patients, records, or staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            ) : (
              <span className="topbar-search-shortcut">⌘K</span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchFocused && searchQuery.trim() !== '' && (
            <div className="search-results-dropdown">
              {filteredSearch.length === 0 ? (
                <div className="empty-state-p">No matching patients, staff, or records found</div>
              ) : (
                ['Patients', 'Staff', 'Departments', 'Records'].map((category) => {
                  const items = filteredSearch.filter((i) => i.type === category);
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="search-result-group">
                      <div className="search-result-group-title">{category}</div>
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="search-result-row"
                          onClick={() => {
                            showToast(`Selected ${item.title} (${item.sub})`);
                            setIsSearchFocused(false);
                          }}
                        >
                          <div className="search-result-main">
                            <div>
                              <div className="search-result-title">{item.title}</div>
                              <div className="search-result-sub">{item.sub}</div>
                            </div>
                          </div>
                          <span className="search-result-badge">{item.badge}</span>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="topbar-actions">
          {/* Notifications Button & Popover */}
          <div className="topbar-popover-anchor" ref={notifRef}>
            <button
              className={`topbar-icon-btn${showNotifications ? ' active' : ''}`}
              id="btn-notifications"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMessages(false);
                setShowProfile(false);
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="topbar-dropdown notifications-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-header-title">
                    <span>Clinical Notifications</span>
                    {unreadCount > 0 && <span className="dropdown-badge-count">{unreadCount} new</span>}
                  </div>
                  <div className="dropdown-header-actions">
                    <button className="dropdown-text-btn" onClick={markAllAsRead}>
                      <CheckCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
                      Mark read
                    </button>
                    <button className="dropdown-text-btn" onClick={clearAllNotifications} style={{ color: 'var(--text-light)' }}>
                      Clear
                    </button>
                  </div>
                </div>

                <div className="dropdown-filter-pills">
                  <button
                    className={`dropdown-pill${activeNotificationTab === 'all' ? ' active' : ''}`}
                    onClick={() => setActiveNotificationTab('all')}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    className={`dropdown-pill${activeNotificationTab === 'alerts' ? ' active' : ''}`}
                    onClick={() => setActiveNotificationTab('alerts')}
                  >
                    Alerts
                  </button>
                  <button
                    className={`dropdown-pill${activeNotificationTab === 'updates' ? ' active' : ''}`}
                    onClick={() => setActiveNotificationTab('updates')}
                  >
                    Updates
                  </button>
                </div>

                <div className="notifications-list">
                  {filteredNotifications.length === 0 ? (
                    <div className="empty-state-p">No notifications in this category</div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const IconComponent = n.icon;
                      return (
                        <div
                          key={n.id}
                          className={`notification-item${n.unread ? ' unread' : ''}`}
                          onClick={() => toggleNotificationRead(n.id)}
                        >
                          <div className={`notification-icon-box ${n.type}`}>
                            <IconComponent size={18} />
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{n.title}</div>
                            <div className="notification-desc">{n.desc}</div>
                            <div className="notification-meta">
                              <span>{n.time}</span>
                              <span style={{ textTransform: 'capitalize' }}>{n.category}</span>
                            </div>
                          </div>
                          {n.unread && <span className="notification-unread-dot" />}
                          <button
                            className="dropdown-text-btn"
                            style={{ position: 'absolute', right: 10, bottom: 8, padding: 2, color: '#94a3b8' }}
                            onClick={(e) => deleteNotification(e, n.id)}
                            title="Dismiss"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages Button & Popover */}
          <div className="topbar-popover-anchor" ref={msgRef}>
            <button
              className={`topbar-icon-btn${showMessages ? ' active' : ''}`}
              id="btn-messages"
              aria-label="Messages"
              onClick={() => {
                setShowMessages(!showMessages);
                setShowNotifications(false);
                setShowProfile(false);
              }}
            >
              <MessageSquare size={20} />
            </button>

            {showMessages && (
              <div className="topbar-dropdown messages-dropdown">
                {activeChatId ? (
                  // Active Chat Conversation View
                  <div className="chat-conversation-view">
                    <div className="chat-convo-header">
                      <button className="chat-back-btn" onClick={() => setActiveChatId(null)} title="Back to chats">
                        <ArrowLeft size={18} />
                      </button>
                      <div className="message-contact-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {activeChat?.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeChat?.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>{activeChat?.role}</div>
                      </div>
                      <span className={`message-status-dot ${activeChat?.status}`} style={{ position: 'static', width: 8, height: 8 }} />
                    </div>

                    <div className="chat-convo-body">
                      {activeChat?.messages.map((m) => (
                        <div key={m.id} className={`chat-bubble ${m.sender}`}>
                          <div>{m.text}</div>
                          <div className="chat-bubble-time">{m.time}</div>
                        </div>
                      ))}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-convo-input-box">
                      <input
                        type="text"
                        className="chat-convo-input"
                        placeholder={`Message ${activeChat?.name?.split(' ')[1] || 'Colleague'}...`}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="chat-send-btn" disabled={!messageInput.trim()}>
                        <Send size={15} />
                      </button>
                    </form>
                  </div>
                ) : (
                  // Contact List View
                  <>
                    <div className="dropdown-header">
                      <div className="dropdown-header-title">
                        <span>Clinical Communications</span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', fontWeight: 600 }}>{chats.length} Active Staff</span>
                    </div>

                    <div className="messages-chat-list">
                      {chats.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>No active clinical conversations</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>Direct messages between on-duty staff will appear here.</p>
                        </div>
                      ) : (
                        chats.map((chat) => (
                          <div
                            key={chat.id}
                            className="message-chat-item"
                            onClick={() => setActiveChatId(chat.id)}
                          >
                            <div className="message-contact-avatar">
                              {chat.avatar}
                              <span className={`message-status-dot ${chat.status}`} />
                            </div>
                            <div className="message-contact-info">
                              <div className="message-contact-name">
                                <span>{chat.name}</span>
                                <span className="message-contact-time">{chat.time}</span>
                              </div>
                              <div className="message-contact-role">{chat.role}</div>
                              <div className="message-contact-last">{chat.lastMessage}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="topbar-divider" />

          {/* User Profile Button & Dropdown */}
          <div className="topbar-popover-anchor" ref={profileRef}>
            <button
              className={`topbar-profile${showProfile ? ' active' : ''}`}
              id="btn-profile"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
                setShowMessages(false);
              }}
            >
              <div className="topbar-avatar" style={{ background: '#0d9488', color: '#fff', fontWeight: 800 }}>
                <span>DK</span>
              </div>
              <div className="topbar-profile-info">
                <span className="topbar-profile-name">David Kim</span>
                <span className="topbar-profile-role">Chief Clinical Pharmacist</span>
              </div>
              <ChevronDown size={16} className={`topbar-profile-chevron${showProfile ? ' open' : ''}`} />
            </button>

            {showProfile && (
              <div className="topbar-dropdown profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar" style={{ background: '#0d9488', color: '#fff', fontWeight: 800 }}>DK</div>
                  <div>
                    <div className="profile-dropdown-name">David Kim</div>
                    <div className="profile-dropdown-role">Chief Clinical Pharmacist • PharmD, BCPS</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>
                      AuraPharmacy Lic #PHARM-IND-88421
                    </div>
                  </div>
                </div>

                {/* Duty Status Selector */}
                <div className="profile-dropdown-status-box">
                  <div className="profile-status-title">Dispensary Duty Status</div>
                  <div className="profile-status-chips">
                    {[
                      { key: 'On Duty', label: '🟢 On Duty' },
                      { key: 'Dispensing', label: '🟡 In Dispensing' },
                      { key: 'Verification', label: '🔵 Verification' },
                      { key: 'Off Duty', label: '⚪ Off Duty' },
                    ].map((status) => (
                      <button
                        key={status.key}
                        className={`profile-status-chip${doctorStatus === status.key ? ' active' : ''}`}
                        onClick={() => {
                          setDoctorStatus(status.key);
                          showToast(`Status updated to: ${status.label}`);
                        }}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu items */}
                <div className="profile-menu-list">
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setActiveModal('profile');
                      setShowProfile(false);
                    }}
                  >
                    <User size={16} style={{ color: 'var(--primary)' }} />
                    <span>My Pharmacy Profile</span>
                  </button>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setActiveModal('credentials');
                      setShowProfile(false);
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                    <span>Pharmacy Credentials</span>
                  </button>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setActiveModal('settings');
                      setShowProfile(false);
                    }}
                  >
                    <Settings size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Pharmacy Settings & Rules</span>
                  </button>

                  <button
                    className="profile-menu-item danger"
                    onClick={() => {
                      setActiveModal('lock');
                      setShowProfile(false);
                    }}
                  >
                    <Lock size={16} />
                    <span>Lock Workstation / Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 76,
            right: 28,
            background: '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: '0.82rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'topbarDropIn 0.2s ease',
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--primary-light)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals for Profile Actions */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: 480 }}>
            {activeModal === 'profile' && (
              <>
                <h3>Physician Profile & Credentials</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div className="topbar-avatar" style={{ width: 54, height: 54, fontSize: '1.2rem' }}>SJ</div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Dr. Sarah Jenkins, MD</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cardiovascular Medicine & Intensive Care</p>
                    <span style={{ fontSize: '0.72rem', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                      Board Certified • Fellow of ACC
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem', marginBottom: 20 }}>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.7rem', fontWeight: 700 }}>NPI NUMBER</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>1948201948</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.7rem', fontWeight: 700 }}>STATE LICENSE</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>CA-MD-994021-A</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.7rem', fontWeight: 700 }}>HOSPITAL PRIVILEGES</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>Full Attending Privileges</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.7rem', fontWeight: 700 }}>CURRENT SHIFT</div>
                    <div style={{ fontWeight: 700, marginTop: 4, color: 'var(--success)' }}>07:00 - 19:00 (Day Shift)</div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
                  <button className="tab-btn active" onClick={() => { setActiveModal(null); showToast('Profile credentials refreshed'); }}>
                    Verify With National Registry
                  </button>
                </div>
              </>
            )}

            {activeModal === 'dept' && (
              <>
                <h3>Switch Active Department</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Select the primary clinical department you are providing coverage for today:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { name: 'Cardiology & Telemetry Unit', beds: '24 Beds • Floor 2', active: true },
                    { name: 'Intensive Care Unit (ICU)', beds: '20 Beds • Floor 3', active: false },
                    { name: 'Emergency OPD & Triage', beds: '32 Bays • Ground Floor', active: false },
                    { name: 'Internal Medicine General Ward', beds: '40 Beds • Floor 4', active: false },
                  ].map((dept, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: dept.active ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: dept.active ? 'var(--primary-bg)' : '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setActiveModal(null);
                        showToast(`Switched coverage to: ${dept.name}`);
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{dept.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>{dept.beds}</div>
                      </div>
                      {dept.active && <Check size={18} style={{ color: 'var(--primary)' }} />}
                    </div>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                </div>
              </>
            )}

            {activeModal === 'settings' && (
              <>
                <h3>System & Alert Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20, fontSize: '0.82rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Audible Critical Vitals Alert Sound</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} />
                  </label>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>EHR Auto-Save Draft Summaries (every 30s)</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} />
                  </label>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Real-Time Telemetry High-Frequency Pulse</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} />
                  </label>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Clinical Push Notifications on Mobile Device</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} />
                  </label>
                </div>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button className="tab-btn active" onClick={() => { setActiveModal(null); showToast('Preferences saved successfully'); }}>
                    Save Preferences
                  </button>
                </div>
              </>
            )}

            {activeModal === 'lock' && (
              <>
                <h3>Lock Clinical Workstation</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                  Are you sure you want to lock this terminal session for Dr. Sarah Jenkins? Patient records will remain securely cached.
                </p>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button
                    className="tab-btn"
                    style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }}
                    onClick={() => {
                      setActiveModal(null);
                      showToast('Terminal session locked. Re-authentication required.');
                    }}
                  >
                    Lock Session Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
