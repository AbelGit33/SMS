import React from 'react';

export default function Header({ onShowDashboard }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left" onClick={onShowDashboard} style={{ cursor: 'pointer' }}>
          <div className="header-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div>
            <h1 className="header-title">Student Management System</h1>
            <p className="header-subtitle">Manage your students efficiently</p>
          </div>
        </div>
        <div className="header-right">
          <span className="header-badge">
            <i className="fas fa-users"></i> Admin Portal
          </span>
        </div>
      </div>
    </header>
  );
}
