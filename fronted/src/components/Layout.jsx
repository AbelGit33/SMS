import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'fa-chart-pie' },
  { path: '/students', label: 'Students', icon: 'fa-user-graduate' },
  { path: '/courses', label: 'Courses', icon: 'fa-book' },
  { path: '/attendance', label: 'Attendance', icon: 'fa-calendar-check' },
  { path: '/fees', label: 'Fees', icon: 'fa-money-bill-wave' },
];

export default function Layout({ children, currentPath, onNavigate }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNav = (path) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  return (
    <div className={`layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand" onClick={() => handleNav('/')}>
          <div className="brand-icon"><i className="fas fa-graduation-cap"></i></div>
          <span className="brand-text">SMS Admin</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || 'A'}</div>
            <div className="user-info">
              <span className="user-name">{user?.username || 'Admin'}</span>
              <span className="user-role">{user?.role || 'Administrator'}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={logout} title="Sign Out">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>}

      <div className="main-area">
        <header className="topbar">
          <button className="btn-toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="fas fa-bars"></i>
          </button>
          <button className="btn-mobile-menu" onClick={() => setMobileOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="topbar-right">
            <span className="topbar-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
