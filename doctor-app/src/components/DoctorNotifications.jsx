import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X, AlertTriangle, UserCheck, MessageSquare } from 'lucide-react';

export default function DoctorNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const loadNotifications = () => {
    const stored = localStorage.getItem('careease_doctor_alerts');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {}
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const handleStorage = () => loadNotifications();
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(loadNotifications, 2000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    localStorage.setItem('careease_doctor_alerts', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem('careease_doctor_alerts', JSON.stringify([]));
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllAsRead();
        }}
        style={{
          background: isOpen ? '#f1f5f9' : '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <Bell size={18} color={unreadCount > 0 ? '#ef4444' : '#64748b'} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            background: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Clinical Notifications</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={markAllAsRead}
                title="Mark all as read"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Check size={12} /> Mark Read
              </button>
              <button
                onClick={clearAll}
                title="Clear all"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>No pending alerts</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px' }}>Check-ins and triage messages from Reception Desk appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    background: n.unread ? 'rgba(2,132,199,0.04)' : '#ffffff',
                    display: 'flex',
                    gap: '10px'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {n.type === 'critical' ? (
                      <AlertTriangle size={16} color="#ef4444" />
                    ) : (
                      <UserCheck size={16} color="#0284c7" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{n.title}</strong>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{n.time}</span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>{n.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
