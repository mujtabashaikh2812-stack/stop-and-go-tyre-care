import React, { useState, useEffect } from 'react';
import { ClipboardList, Users, BarChart3, Package, Calendar, Clock, LogOut, Settings, ChevronRight, Globe, Coffee } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';
import logoImg from '../assets/logo.jpg';

export default function Header({ activeTab, setActiveTab, todayStats, onLogout, currentLang, setLanguage }) {
  const [time, setTime] = useState(new Date());
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    {
      id: 'billing',
      label: t.newJobCard,
      subtitle: t.newJobCardSub,
      icon: ClipboardList
    },
    {
      id: 'customers',
      label: t.customers,
      subtitle: t.customersSub,
      icon: Users
    },
    {
      id: 'analytics',
      label: t.analytics,
      subtitle: t.analyticsSub,
      icon: BarChart3
    },
    {
      id: 'inventory',
      label: t.inventory,
      subtitle: t.inventorySub,
      icon: Package
    },
    {
      id: 'bookings',
      label: t.bookings,
      subtitle: t.bookingsSub,
      icon: Calendar
    },
    {
      id: 'expenses',
      label: t.expenses,
      subtitle: t.expensesSub,
      icon: Coffee
    },
    {
      id: 'price_settings',
      label: t.priceSettings,
      subtitle: t.priceSettingsSub,
      icon: Settings
    }
  ];

  return (
    <header className="header-container">
      {/* Top Garage Brand & Action Bar */}
      <div className="header-top">
        <div className="brand-badge" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('billing')}>
          <img
            src={logoImg}
            alt="STOP & GO Total Tyre Care Centre"
            style={{ height: '56px', maxWidth: '320px', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>

        <div className="header-right-info">
          {/* Language Selector Dropdown */}
          <div className="info-chip" style={{ border: '1px solid var(--yellow-primary)' }}>
            <Globe size={15} style={{ color: 'var(--yellow-primary)' }} />
            <select
              value={currentLang}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--yellow-primary)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              <option value="en" style={{ background: '#000', color: '#fff' }}>English 🇬🇧</option>
              <option value="mr" style={{ background: '#000', color: '#fff' }}>मराठी 🇮🇳</option>
              <option value="hi" style={{ background: '#000', color: '#fff' }}>हिंदी 🇮🇳</option>
            </select>
          </div>

          <div className="info-chip">
            <Calendar size={15} className="chip-icon" />
            <span>{time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="info-chip">
            <Clock size={15} className="chip-icon" />
            <span>{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="revenue-chip">
            <span className="chip-label">{t.todayRevenue}:</span>
            <span className="chip-value">₹{todayStats.netProfit.toLocaleString('en-IN')}</span>
            <span className="chip-count">({todayStats.jobCount} Cars)</span>
          </div>

          {/* Admin Lock & Logout Control */}
          <button
            onClick={onLogout}
            className="info-chip"
            style={{ background: 'var(--yellow-bg)', borderColor: 'var(--yellow-primary)', color: 'var(--yellow-primary)', fontWeight: '700', cursor: 'pointer' }}
            title="Lock app & Logout"
          >
            <LogOut size={15} />
            <span>{t.adminLogout}</span>
          </button>
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
