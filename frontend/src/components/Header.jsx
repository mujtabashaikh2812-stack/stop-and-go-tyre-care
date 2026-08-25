import React from 'react';
import { FileText, Users, BarChart3, Package, Calendar, Coffee, Settings, Lock, Building2, ShieldCheck } from 'lucide-react';
import LogoBanner from './LogoBanner';
import { TRANSLATIONS } from '../utils/i18n';

export default function Header({ activeTab, setActiveTab, todayStats, onLogout, currentLang = 'en', setLanguage }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  // Realtime Live Ticking Clock State (Updates every 1000ms)
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="app-header-container">
      
      {/* Top Utility & Brand Strip */}
      <div className="header-top-bar">
        <div className="brand-logo-area">
          <LogoBanner height="46px" useVector={true} />
        </div>

        {/* Global Controls & Metrics Header */}
        <div className="header-actions">
          
          {/* Language Switcher Dropdown */}
          <div className="lang-switcher">
            <select value={currentLang} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">🌐 English (GB)</option>
              <option value="mr">🇮🇳 मराठी (MR)</option>
              <option value="hi">🇮🇳 हिंदी (HI)</option>
            </select>
          </div>

          {/* Realtime Ticking Date & Time Indicator */}
          <div className="datetime-chip">
            <span>📅 {now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span style={{ color: 'var(--yellow-primary)', fontWeight: '700' }}>
              🕒 {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>

          {/* Quick Metrics Badge */}
          <div className="metrics-pill">
            <span className="label">{t.todayRevenue}:</span>
            <span className="value">₹{todayStats.netProfit.toLocaleString('en-IN')}</span>
            <span className="sub-count">({todayStats.jobCount} Cars)</span>
          </div>

          {/* Lock / Logout Button */}
          <button className="btn-logout" onClick={onLogout} title="Lock App Session">
            <Lock size={14} />
            <span>{t.adminLogout}</span>
          </button>

        </div>
      </div>

      {/* Main Navigation Tabs Bar */}
      <nav className="header-tabs-nav">
        
        {/* 1. New Job Card Tab */}
        <button
          className={`nav-tab-item ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <FileText className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.newJobCard}</span>
            <span className="tab-sub">{t.newJobCardSub}</span>
          </div>
        </button>

        {/* 2. Partner Batches Tab (B2B Bulk Contracts) */}
        <button
          className={`nav-tab-item ${activeTab === 'partner_batches' ? 'active' : ''}`}
          onClick={() => setActiveTab('partner_batches')}
        >
          <Building2 className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.partnerBatches}</span>
            <span className="tab-sub">{t.partnerBatchesSub}</span>
          </div>
        </button>

        {/* 3. Customers & History Tab */}
        <button
          className={`nav-tab-item ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.customers}</span>
            <span className="tab-sub">{t.customersSub}</span>
          </div>
        </button>

        {/* 4. Analytics Tab */}
        <button
          className={`nav-tab-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.analytics}</span>
            <span className="tab-sub">{t.analyticsSub}</span>
          </div>
        </button>

        {/* 5. Inventory Tab */}
        <button
          className={`nav-tab-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.inventory}</span>
            <span className="tab-sub">{t.inventorySub}</span>
          </div>
        </button>

        {/* 6. Bookings Tab */}
        <button
          className={`nav-tab-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.bookings}</span>
            <span className="tab-sub">{t.bookingsSub}</span>
          </div>
        </button>

        {/* 7. Expenses & Salaries Tab */}
        <button
          className={`nav-tab-item ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <Coffee className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.expenses}</span>
            <span className="tab-sub">{t.expensesSub}</span>
          </div>
        </button>

        {/* 8. Master Prices Settings Tab */}
        <button
          className={`nav-tab-item ${activeTab === 'price_settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('price_settings')}
        >
          <Settings className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.priceSettings}</span>
            <span className="tab-sub">{t.priceSettingsSub}</span>
          </div>
        </button>

        {/* 9. Tyre Warranty Registration Tab */}
        <button
          className={`nav-tab-item ${activeTab === 'tyre_warranty' ? 'active' : ''}`}
          onClick={() => setActiveTab('tyre_warranty')}
        >
          <ShieldCheck className="nav-icon" size={18} />
          <div className="tab-text-group">
            <span className="tab-title">{t.tyreWarranty || 'Tyre Warranty'}</span>
            <span className="tab-sub">{t.tyreWarrantySub || 'Specs & Cards'}</span>
          </div>
        </button>

      </nav>

    </header>
  );
}
