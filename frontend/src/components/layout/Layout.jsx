import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ activeRole, onNavigate, children }) {
  return (
    <div className="layout" id="app-layout">
      <Sidebar activeRole={activeRole} onNavigate={onNavigate} />
      <div className="layout-main">
        <TopBar />
        <main className="layout-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
