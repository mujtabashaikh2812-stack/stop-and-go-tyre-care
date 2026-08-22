import React, { useState, useEffect } from 'react';
import { Wrench, ClipboardList, Users, BarChart3, Package, Calendar, Clock, Lock, LogOut, Settings } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, todayStats, isAdminLoggedIn, onOpenAdminLogin, onAdminLogout }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'billing', label: 'New Job Card', icon: ClipboardList },
    { id: 'customers', label: 'Customers & History', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inventory', label: 'Stock & Inventory', icon: Package }
  ];

  if (isAdminLoggedIn) {
    navItems.push({ id: 'price_settings', label: 'Master Price Settings', icon: Settings });
  }

  return (
    <header className="header-container">
      <div className="header-top">
        <div className="brand-badge">
          <div className="logo-icon-bg">
            <Wrench className="brand-icon" size={24} />
          </div>
          <div>
            <h1 className="brand-title">STOP & GO</h1>
            <p className="brand-subtitle">TOTAL TYRE CARE CENTRE</p>
          </div>
        </div>

        <div className="header-right-info">
          <div className="info-chip">
            <Calendar size={15} className="chip-icon" />
            <span>{time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="info-chip">
            <Clock size={15} className="chip-icon" />
            <span>{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="revenue-chip">
            <span className="chip-label">Today:</span>
            <span className="chip-value">₹{todayStats.totalRevenue.toLocaleString('en-IN')}</span>
            <span className="chip-count">({todayStats.jobCount} Cars)</span>
          </div>

          {/* Admin Login / Logout Controls */}
          {isAdminLoggedIn ? (
            <button
              onClick={onAdminLogout}
              className="info-chip"
              style={{ background: 'var(--yellow-bg)', borderColor: 'var(--yellow-primary)', color: 'var(--yellow-primary)', fontWeight: '700', cursor: 'pointer' }}
              title="Click to Log Out as Admin"
            >
              <LogOut size={15} />
              <span>Admin Logout</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="info-chip"
              style={{ cursor: 'pointer', borderColor: 'var(--border-medium)' }}
            >
              <Lock size={15} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>

      <nav className="nav-tabs">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
