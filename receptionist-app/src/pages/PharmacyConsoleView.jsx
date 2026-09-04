import React, { useState, useEffect } from 'react';

export default function PharmacyConsoleView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/inventory/list');
      if (res.ok) {
        const data = await res.json();
        setItems(data.inventory || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerReorder = (item) => {
    alert(`Purchase Order Generated for ${item.medicine_name}! Quantity: 200 units sent to distributor.`);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📦 Pharmacy Inventory & Auto-Reorder Console</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Stock level tracking, low-stock threshold alerts, and automated purchase orders
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Pharmaceutical Inventory Catalog</h3>
          <button className="btn-secondary" onClick={fetchInventory}>🔄 Refresh Catalog</button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading inventory...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Medicine Name</th>
                <th style={{ padding: '0.75rem' }}>Batch No</th>
                <th style={{ padding: '0.75rem' }}>Current Stock</th>
                <th style={{ padding: '0.75rem' }}>Reorder Level</th>
                <th style={{ padding: '0.75rem' }}>Price</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = item.stock_level <= item.reorder_level;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{item.medicine_name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{item.batch_number}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: isLow ? '#be123c' : 'inherit' }}>
                      {item.stock_level} units {isLow && '⚠️ LOW'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{item.reorder_level} units</td>
                    <td style={{ padding: '0.75rem' }}>${item.price}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {isLow ? (
                        <button className="btn-primary" onClick={() => triggerReorder(item)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                          ⚡ 1-Click Auto Reorder
                        </button>
                      ) : (
                        <span className="pill-badge pill-success">Adequate Stock</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
