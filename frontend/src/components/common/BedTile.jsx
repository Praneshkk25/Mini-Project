import React from 'react';
import StatusBadge from './StatusBadge';

export default function BedTile({ bed, onStatusChange }) {
  const colorMap = {
    available: { bg: 'rgba(16, 185, 129, 0.08)', border: '#10b981', hover: 'rgba(16, 185, 129, 0.2)' },
    occupied: { bg: 'rgba(239, 68, 68, 0.08)', border: '#ef4444', hover: 'rgba(239, 68, 68, 0.2)' },
    cleaning: { bg: 'rgba(245, 158, 11, 0.08)', border: '#f59e0b', hover: 'rgba(245, 158, 11, 0.2)' },
    reserved: { bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', hover: 'rgba(59, 130, 246, 0.2)' },
  };

  const theme = colorMap[bed.status] || colorMap.available;

  return (
    <div 
      onClick={() => onStatusChange && onStatusChange(bed.id)}
      title="Click to toggle status (Available → Occupied → Cleaning → Reserved)"
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}44`,
        borderTop: `4px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', fontSize: '15px', color: '#f8fafc' }}>{bed.bedNo}</span>
        <StatusBadge status={bed.status} />
      </div>

      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
        <div>Ward: <strong style={{ color: '#cbd5e1' }}>{bed.ward}</strong></div>
        {bed.patientName ? (
          <div style={{ marginTop: '4px', color: '#f1f5f9' }}>
            Patient: <strong>{bed.patientName}</strong> ({bed.age}y/{bed.gender})
          </div>
        ) : (
          <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#64748b' }}>No patient assigned</div>
        )}
      </div>

      <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right', marginTop: 'auto' }}>
        Click to change
      </div>
    </div>
  );
}
