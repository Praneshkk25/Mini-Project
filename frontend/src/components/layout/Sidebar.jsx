import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Pill,
  CheckCircle2,
  Package,
  AlertTriangle,
  Activity,
  History,
  ShoppingCart,
  Truck,
  ArrowRightLeft,
  RotateCcw,
  UserCheck,
  BarChart3,
  Bell,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

const PHARMACY_OPERATIONS_MENU = [
  { key: 'dashboard', label: '1. Pharmacy Dashboard', icon: LayoutDashboard },
  { key: 'prescriptions', label: '2. Prescription Queue', icon: ClipboardList },
  { key: 'formulary', label: '3. Pharmacy & Formulary', icon: Pill },
  { key: 'dispensing', label: '4. Dispensing Station', icon: CheckCircle2 },
  { key: 'inventory', label: '5. Stock Inventory', icon: Package },
  { key: 'low_stock', label: '6. Low Stock & Expiry', icon: AlertTriangle },
  { key: 'city_network', label: '7. City-Wide Drug Network', icon: Activity },
  { key: 'history', label: '8. Dispensing History', icon: History }
];

const MANAGEMENT_MENU = [
  { key: 'procurement', label: '9. Procurement & Orders', icon: ShoppingCart },
  { key: 'suppliers', label: '10. Suppliers & Vendors', icon: Truck },
  { key: 'transfers', label: '11. Stock Transfers', icon: ArrowRightLeft },
  { key: 'returns', label: '12. Returns & Recall', icon: RotateCcw },
  { key: 'patient_profile', label: '13. Patient Medication Profile', icon: UserCheck },
  { key: 'reports', label: '14. Pharmacy Reports', icon: BarChart3 },
  { key: 'notifications', label: '15. Notifications', icon: Bell },
  { key: 'audit_logs', label: '16. Pharmacy Audit Logs', icon: ShieldCheck }
];

export default function Sidebar({ activeRole, onNavigate }) {
  return (
    <aside className="sidebar" id="main-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #0d9488, #0284c7)' }}>
          <Pill size={22} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="sidebar-brand-text" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>AuraPharmacy</span>
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>DISPENSARY & FORMULARY</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">PHARMACY OPERATIONS</p>
        <ul className="sidebar-menu">
          {PHARMACY_OPERATIONS_MENU.map((item) => {
            const Icon = item.icon;
            const isActive = activeRole === item.key;
            return (
              <li key={item.key}>
                <button
                  id={`nav-${item.key}`}
                  className={`sidebar-menu-btn${isActive ? ' active' : ''}`}
                  onClick={() => onNavigate(item.key)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="sidebar-section-label">MANAGEMENT</p>
        <ul className="sidebar-menu">
          {MANAGEMENT_MENU.map((item) => {
            const Icon = item.icon;
            const isActive = activeRole === item.key;
            return (
              <li key={item.key}>
                <button
                  id={`nav-${item.key}`}
                  className={`sidebar-menu-btn${isActive ? ' active' : ''}`}
                  onClick={() => onNavigate(item.key)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Help & Support footer */}
      <div className="sidebar-footer">
        <button className="sidebar-menu-btn" id="nav-help" onClick={() => onNavigate('dashboard')}>
          <HelpCircle size={18} />
          <span>Dispensary Hub v2.4</span>
        </button>
      </div>
    </aside>
  );
}
