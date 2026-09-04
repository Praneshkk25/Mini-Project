import React from 'react';

export default function DataTable({ columns, data, emptyText = 'No data available', renderActions }) {
  return (
    <div style={{ overflowX: 'auto', width: '100%', borderRadius: '12px', border: '1px solid #334155' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: '#e2e8f0' }}>
        <thead>
          <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{ padding: '12px 16px', fontWeight: '600', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {col.header}
              </th>
            ))}
            {renderActions && <th style={{ padding: '12px 16px', fontWeight: '600', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr key={row.id || rIdx} style={{ borderBottom: rIdx === data.length - 1 ? 'none' : '1px solid #1e293b', transition: 'background 0.2s' }}>
                {columns.map((col, cIdx) => (
                  <td key={cIdx} style={{ padding: '14px 16px' }}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {renderActions && (
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
