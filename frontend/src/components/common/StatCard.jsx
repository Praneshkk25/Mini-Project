import React from 'react';

export default function StatCard({ icon, label, value, subtext, trend, color = '#38bdf8' }) {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #334155',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Accent glow bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color}, transparent)`
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>{label}</span>
        {icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `${color}18`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '28px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.5px' }}>{value}</span>
        {trend && (
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: trend.startsWith('+') || trend.includes('up') ? '#10b981' : '#f59e0b',
            background: trend.startsWith('+') || trend.includes('up') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <span style={{ fontSize: '12px', color: '#64748b' }}>{subtext}</span>
      )}
    </div>
  );
}
