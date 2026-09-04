import React from 'react';

export default function StatusBadge({ status, type = 'general' }) {
  let badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.3px',
    textTransform: 'capitalize',
  };

  const statusMap = {
    // Bed status colors
    available: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', dot: '#10b981' },
    occupied: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', dot: '#ef4444' },
    cleaning: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },
    reserved: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', dot: '#3b82f6' },

    // Queue statuses
    'In Consultation': { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)', dot: '#06b6d4' },
    'Waiting': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },
    'Completed': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', dot: '#10b981' },
    'Skipped': { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.3)', dot: '#9ca3af' },
    'No Show': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', dot: '#ef4444' },

    // Risk Classification
    Low: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', dot: '#10b981' },
    Medium: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },
    High: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', dot: '#ef4444' },

    // Condition at discharge
    Stable: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', dot: '#10b981' },
    Improved: { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)', dot: '#06b6d4' },
    Referred: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },

    // Sync status
    online: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', dot: '#10b981' },
    offline: { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.3)', dot: '#9ca3af' }
  };

  const current = statusMap[status] || {
    bg: 'rgba(107, 114, 128, 0.15)',
    color: '#cbd5e1',
    border: '1px solid rgba(107, 114, 128, 0.3)',
    dot: '#9ca3af'
  };

  return (
    <span style={{ ...badgeStyle, background: current.bg, color: current.color, border: current.border }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: current.dot, display: 'inline-block' }}></span>
      {status}
    </span>
  );
}
