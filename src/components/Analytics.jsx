import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Calendar, Coffee, Users, Award, ShieldAlert } from 'lucide-react';

export default function Analytics({ jobCards, expenses = [], scrapSales = [] }) {
  const [timeFilter, setTimeFilter] = useState('month'); // 'today' | 'month' | 'year' | 'all'

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentYearStr = new Date().toISOString().slice(0, 4); // YYYY

  // Filter job cards, expenses, and scrap sales by time filter
  const filterByTime = (items, dateField = 'date') => {
    return items.filter(item => {
      const itemDate = item[dateField] || todayStr;
      if (timeFilter === 'today') return itemDate === todayStr;
      if (timeFilter === 'month') return itemDate.startsWith(currentMonthStr);
      if (timeFilter === 'year') return itemDate.startsWith(currentYearStr);
      return true;
    });
  };

  const filteredCards = filterByTime(jobCards, 'date');
  const filteredExpenses = filterByTime(expenses, 'date');
  const filteredScrap = filterByTime(scrapSales, 'date');

  // Financial Calculations
  const grossBillingRevenue = filteredCards.reduce((sum, c) => sum + c.total, 0);
  const scrapIncome = filteredScrap.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalGrossRevenue = grossBillingRevenue + scrapIncome;

  const totalShopExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netGarageProfit = totalGrossRevenue - totalShopExpenses;

  // Payment Breakdown
  const upiTotal = filteredCards.filter(c => c.paymentMethod === 'UPI / QR Code').reduce((sum, c) => sum + c.total, 0);
  const cashTotal = filteredCards.filter(c => c.paymentMethod === 'Cash').reduce((sum, c) => sum + c.total, 0);

  // Top Performing Services
  const serviceFrequencyMap = {};
  filteredCards.forEach(card => {
    card.services.forEach(serv => {
      serviceFrequencyMap[serv.name] = (serviceFrequencyMap[serv.name] || 0) + 1;
    });
  });

  const sortedServices = Object.entries(serviceFrequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">📊 Revenue & Profit Analytics</h2>
          <p className="section-desc">Track Gross Billing, Daily Shop Expenses, Scrap Sales, and Net Garage Profit</p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="pill-selector">
          <button
            className={`sub-pill ${timeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setTimeFilter('today')}
          >
            Today
          </button>
          <button
            className={`sub-pill ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('month')}
          >
            This Month
          </button>
          <button
            className={`sub-pill ${timeFilter === 'year' ? 'active' : ''}`}
            onClick={() => setTimeFilter('year')}
          >
            This Year
          </button>
          <button
            className={`sub-pill ${timeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="stats-cards-grid">
        
        <div className="stat-card featured">
          <div className="stat-card-header">
            <span>Net Garage Profit</span>
            <TrendingUp size={20} className="text-gold" />
          </div>
          <div className="stat-value text-gold">₹{netGarageProfit.toLocaleString('en-IN')}</div>
          <div className="stat-sub">Gross Revenue minus Shop Expenses</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Gross Revenue</span>
            <DollarSign size={20} className="text-emerald" />
          </div>
          <div className="stat-value text-emerald">₹{totalGrossRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-sub">Bills: ₹{grossBillingRevenue} | Scrap: ₹{scrapIncome}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Shop Expenditures</span>
            <Coffee size={20} style={{ color: 'var(--ruby-primary)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--ruby-primary)' }}>₹{totalShopExpenses.toLocaleString('en-IN')}</div>
          <div className="stat-sub">Tea, snacks, spares & maintenance</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Cars Serviced</span>
            <BarChart3 size={20} className="chip-icon" />
          </div>
          <div className="stat-value">{filteredCards.length}</div>
          <div className="stat-sub">Total completed job cards</div>
        </div>

      </div>

      {/* Two Column Section */}
      <div className="analytics-two-col margin-top">
        
        {/* Payment Methods Split */}
        <div className="card-container">
          <div className="card-header">
            <DollarSign className="card-icon" size={22} />
            <h2>Payment Method Split</h2>
          </div>

          <div className="split-row">
            <div className="split-meta">
              <span>📱 UPI / QR Code</span>
              <span className="split-val">₹{upiTotal.toLocaleString('en-IN')} ({totalGrossRevenue ? Math.round((upiTotal / totalGrossRevenue) * 100) : 0}%)</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill cyan"
                style={{ width: `${totalGrossRevenue ? (upiTotal / totalGrossRevenue) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="split-row">
            <div className="split-meta">
              <span>💵 Cash Payment</span>
              <span className="split-val">₹{cashTotal.toLocaleString('en-IN')} ({totalGrossRevenue ? Math.round((cashTotal / totalGrossRevenue) * 100) : 0}%)</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill emerald"
                style={{ width: `${totalGrossRevenue ? (cashTotal / totalGrossRevenue) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Top Services Leaderboard */}
        <div className="card-container">
          <div className="card-header">
            <Award className="card-icon" size={22} />
            <h2>Top Services Leaderboard</h2>
          </div>

          {sortedServices.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No service data available for selected period.</p>
          ) : (
            <div className="leaderboard-list">
              {sortedServices.map(([sName, count], index) => (
                <div key={sName} className="leaderboard-item">
                  <span className="item-rank">#{index + 1}</span>
                  <span className="item-name">{sName}</span>
                  <span className="item-count-badge">{count} Times</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
