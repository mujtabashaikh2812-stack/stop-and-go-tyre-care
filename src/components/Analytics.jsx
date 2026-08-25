import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Wrench, BarChart2, ArrowUpRight, ArrowDownRight, Award, Coffee, RefreshCw } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

export default function Analytics({ jobCards, expenses, scrapSales, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [timeFilter, setTimeFilter] = useState('all'); // 'today', 'month', 'year', 'all'

  // Helper date filters
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = `${now.getFullYear()}`;

  const filterItemByTime = (dateStr) => {
    if (!dateStr) return false;
    if (timeFilter === 'today') return dateStr === todayStr;
    if (timeFilter === 'month') return dateStr.startsWith(currentMonthStr);
    if (timeFilter === 'year') return dateStr.startsWith(currentYearStr);
    return true; // 'all'
  };

  const filteredCards = jobCards.filter(c => filterItemByTime(c.date));
  const filteredExp = expenses.filter(e => filterItemByTime(e.date));
  const filteredScrap = scrapSales.filter(s => filterItemByTime(s.date));

  // Computations
  const grossRevenue = filteredCards.reduce((sum, c) => sum + c.total, 0) + filteredScrap.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalShopExpenses = filteredExp.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = Math.max(0, grossRevenue - totalShopExpenses);
  const totalCarsServiced = filteredCards.length;

  // Compute Service Popularity
  const serviceCountMap = {};
  filteredCards.forEach(card => {
    card.services.forEach(serv => {
      // Group by base service title
      const baseName = serv.name.split('(')[0].trim();
      serviceCountMap[baseName] = (serviceCountMap[baseName] || 0) + 1;
    });
  });

  const sortedServices = Object.entries(serviceCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">{t.analyticsTitle}</h2>
          <p className="section-desc">{t.analyticsDesc}</p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="radio-group-segmented" style={{ maxWidth: '380px' }}>
          <button
            type="button"
            className={`segmented-btn ${timeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setTimeFilter('today')}
          >
            {t.filterToday}
          </button>
          <button
            type="button"
            className={`segmented-btn ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('month')}
          >
            {t.filterMonth}
          </button>
          <button
            type="button"
            className={`segmented-btn ${timeFilter === 'year' ? 'active' : ''}`}
            onClick={() => setTimeFilter('year')}
          >
            {t.filterYear}
          </button>
          <button
            type="button"
            className={`segmented-btn ${timeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            {t.filterAll}
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="stats-cards-grid">
        
        <div className="stat-card featured">
          <div className="stat-card-header">
            <span>{t.netProfit}</span>
            <TrendingUp size={18} className="text-gold" />
          </div>
          <div className="stat-value text-gold">₹{netProfit.toLocaleString('en-IN')}</div>
          <div className="stat-sub">({t.grossRevenue} - {t.shopExpenses})</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>{t.grossRevenue}</span>
            <ArrowUpRight size={18} className="text-emerald" />
          </div>
          <div className="stat-value text-emerald">₹{grossRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-sub">Bills & Scrap Sales</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>{t.shopExpenses}</span>
            <ArrowDownRight size={18} style={{ color: 'var(--ruby-primary)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--ruby-primary)' }}>₹{totalShopExpenses.toLocaleString('en-IN')}</div>
          <div className="stat-sub">Tea, Spares & Maintenance</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>{t.totalJobs}</span>
            <Wrench size={18} className="text-gold" />
          </div>
          <div className="stat-value">{totalCarsServiced}</div>
          <div className="stat-sub">Completed Job Cards</div>
        </div>

      </div>

      {/* Two-Column Analytics Layout */}
      <div className="analytics-two-col">
        
        {/* Left: Financial Breakdown */}
        <div className="card-container">
          <div className="card-header">
            <DollarSign className="card-icon" size={22} />
            <h2>Revenue vs Expense Split</h2>
          </div>

          <div className="split-row">
            <div className="split-meta">
              <span>{t.grossRevenue}</span>
              <span className="split-val">₹{grossRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill cyan" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="split-row">
            <div className="split-meta">
              <span>{t.shopExpenses}</span>
              <span className="split-val" style={{ color: 'var(--ruby-primary)' }}>₹{totalShopExpenses.toLocaleString('en-IN')}</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${grossRevenue > 0 ? Math.min(100, (totalShopExpenses / grossRevenue) * 100) : 0}%`, background: 'var(--ruby-primary)' }} />
            </div>
          </div>

          <div className="split-row">
            <div className="split-meta">
              <span>{t.netProfit}</span>
              <span className="split-val text-gold">₹{netProfit.toLocaleString('en-IN')}</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill emerald" style={{ width: `${grossRevenue > 0 ? Math.min(100, (netProfit / grossRevenue) * 100) : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Right: Service Popularity Leaderboard */}
        <div className="card-container">
          <div className="card-header">
            <Award className="card-icon" size={22} />
            <h2>{t.topServices}</h2>
          </div>

          <div className="leaderboard-list">
            {sortedServices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No services performed in this time period.</p>
            ) : (
              sortedServices.slice(0, 5).map((serv, index) => (
                <div key={serv.name} className="leaderboard-item">
                  <span className="item-rank">#{index + 1}</span>
                  <span className="item-name">{serv.name}</span>
                  <span className="item-count-badge">{serv.count} Jobs</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
