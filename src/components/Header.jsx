import React, { useState, useEffect } from 'react';
import { Wrench, ClipboardList, Users, BarChart3, Package, Calendar, Clock, Lock, LogOut, Settings, ChevronRight } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, todayStats, isAdminLoggedIn, onOpenAdminLogin, onAdminLogout }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    {
      id: 'billing',
      label: 'New Job Card',
      subtitle: 'Create Billing Slip',
      icon: ClipboardList
    },
    {
      id: 'customers',
      label: 'Customers & History',
      subtitle: 'CRM & Visit Logs',
      icon: Users
    },
    {
      id: 'analytics',
      label: 'Analytics',
      subtitle: 'Sales & Revenue Insights',
      icon: BarChart3
    },
    {
      id: 'inventory',
      label: 'Stock & Inventory',
      subtitle: 'Consumables Tracker',
      icon: Package
    }
  ];

  if (isAdminLoggedIn) {
    navItems.push({
      id: 'price_settings',
      label: 'Master Price Settings',
      subtitle: 'Admin Rate Configurator',
      icon: Settings
    });
  }

  return (
    <header className="header-container">
      {/* Top Garage Brand & Action Bar */}
      <div className="header-top">
        <div className="brand-badge">
          <div className="logo-icon-bg">
            <Wrench className="brand-icon" size={26} />
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

      {/* Unique Automotive Dashboard Control Hub (Interactive Tiles) */}
      <div className="nav-control-hub">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-hub-tile ${isActive ? 'active' : ''}`}
            >
              <div className="tile-icon-box">
                <Icon size={22} />
              </div>
              <div className="tile-content">
                <h3 className="tile-title">{item.label}</h3>
                <p className="tile-sub">{item.subtitle}</p>
              </div>
              <ChevronRight size={16} className="tile-arrow" />
            </div>
          );
        })}
      </div>
    </header>
  );
}
