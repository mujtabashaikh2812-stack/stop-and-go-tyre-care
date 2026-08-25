import React, { useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Car, Coffee, QrCode, Banknote } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

export default function Analytics({ jobCards, expenses = [], scrapSales = [], partnerBatches = [], currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  const [filterPeriod, setFilterPeriod] = useState('month'); // 'today' | 'month' | 'year' | 'all'

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const currentYearStr = todayStr.substring(0, 4); // YYYY

  // Filter Data by Time Period
  const filterByDate = (dateStr) => {
    if (!dateStr) return false;
    if (filterPeriod === 'today') return dateStr === todayStr;
    if (filterPeriod === 'month') return dateStr.startsWith(currentMonthStr);
    if (filterPeriod === 'year') return dateStr.startsWith(currentYearStr);
    return true;
  };

  const filteredCards = jobCards.filter(c => filterByDate(c.date));
  const filteredExpenses = expenses.filter(e => filterByDate(e.date));
  const filteredScrap = scrapSales.filter(s => filterByDate(s.date));

  // Compute Partner Batch Payments in this period
  let partnerPaymentsSum = 0;
  let partnerPaymentsCount = 0;

  // Payment Method Aggregation (UPI vs Cash)
  let upiTotal = 0;
  let cashTotal = 0;

  // 1. Job Cards Payment Mode Breakdown
  filteredCards.forEach(c => {
    const amt = parseFloat(c.total) || 0;
    if (c.paymentMethod === 'Cash') {
      cashTotal += amt;
    } else {
      upiTotal += amt;
    }
  });

  // 2. Partner Batch Payments Mode Breakdown
  partnerBatches.forEach(batch => {
    (batch.payments || []).forEach(p => {
      if (filterByDate(p.date)) {
        const amt = parseFloat(p.amount) || 0;
        partnerPaymentsSum += amt;
        partnerPaymentsCount += 1;
        if (p.paymentMethod === 'Cash') {
          cashTotal += amt;
        } else {
          upiTotal += amt;
        }
      }
    });
  });

  // 3. Scrap Sales (Default Cash/UPI)
  const scrapRevenue = filteredScrap.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  cashTotal += scrapRevenue; // Scrap sales added to cash

  // Calculate Aggregates
  const walkInRevenue = filteredCards.reduce((sum, c) => sum + (c.total || 0), 0);
  const grossRevenue = walkInRevenue + scrapRevenue + partnerPaymentsSum;

  const totalShopExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netGarageProfit = Math.max(0, grossRevenue - totalShopExpenses);

  const totalCarsServiced = filteredCards.length;

  // Calculate Service Frequency Breakdown
  const serviceCounts = {};
  filteredCards.forEach(c => {
    (c.services || []).forEach(s => {
      const name = s.name.split(' (')[0];
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });
  });

  const sortedServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">{t.analyticsTitle}</h2>
          <p className="section-desc">{t.analyticsDesc}</p>
        </div>

        {/* Filter Period Buttons */}
        <div className="filter-pill-group">
          <button
            className={`filter-pill ${filterPeriod === 'today' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('today')}
          >
            {t.filterToday}
          </button>
          <button
            className={`filter-pill ${filterPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('month')}
          >
            {t.filterMonth}
          </button>
          <button
            className={`filter-pill ${filterPeriod === 'year' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('year')}
          >
            {t.filterYear}
          </button>
          <button
            className={`filter-pill ${filterPeriod === 'all' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('all')}
          >
            {t.filterAll}
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards Grid */}
      <div className="analytics-kpi-grid">
        
        {/* 1. Gross Revenue */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap yellow">
            <DollarSign size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">{t.grossRevenue}</span>
            <span className="kpi-value text-gold">₹{grossRevenue.toLocaleString('en-IN')}</span>
            <span className="kpi-subtext">Walk-in + B2B + Scrap Sales</span>
          </div>
        </div>

        {/* 2. Shop Expenses */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap ruby">
            <Coffee size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">{t.shopExpenses}</span>
            <span className="kpi-value text-ruby">₹{totalShopExpenses.toLocaleString('en-IN')}</span>
            <span className="kpi-subtext">Deducted Tea, Spares & Supplies</span>
          </div>
        </div>

        {/* 3. Net Garage Profit */}
        <div className="kpi-card highlight">
          <div className="kpi-icon-wrap emerald">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">{t.netProfit}</span>
            <span className="kpi-value text-emerald">₹{netGarageProfit.toLocaleString('en-IN')}</span>
            <span className="kpi-subtext">Actual Bankable Revenue</span>
          </div>
        </div>

        {/* 4. Total Cars Serviced */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap info">
            <Car size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">{t.totalJobs}</span>
            <span className="kpi-value">{totalCarsServiced}</span>
            <span className="kpi-subtext">Completed Job Cards</span>
          </div>
        </div>

      </div>

      {/* PAYMENT METHOD BREAKDOWN: UPI VS CASH CARDS */}
      <div className="analytics-kpi-grid" style={{ marginTop: '20px' }}>
        <div className="kpi-card" style={{ border: '1px solid rgba(59, 130, 246, 0.4)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, var(--bg-card) 100%)' }}>
          <div className="kpi-icon-wrap info">
            <QrCode size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label" style={{ color: '#3b82f6' }}>📱 UPI / QR CODE PAYMENTS</span>
            <span className="kpi-value" style={{ color: '#3b82f6' }}>₹{upiTotal.toLocaleString('en-IN')}</span>
            <span className="kpi-subtext">Digital Bank Collection</span>
          </div>
        </div>

        <div className="kpi-card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 100%)' }}>
          <div className="kpi-icon-wrap emerald">
            <Banknote size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label" style={{ color: 'var(--emerald-primary)' }}>💵 CASH PAYMENTS RECEIVED</span>
            <span className="kpi-value text-emerald">₹{cashTotal.toLocaleString('en-IN')}</span>
            <span className="kpi-subtext">Physical Cash In Register</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: REVENUE BREAKDOWN & TOP SERVICES */}
      <div className="analytics-two-col margin-top">
        
        {/* Left Column: Income Stream Breakdown */}
        <div className="card-container">
          <div className="card-header">
            <ShoppingBag className="card-icon" size={22} />
            <h2>Income Stream Breakdown</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-white)' }}>🚗 Walk-In Job Cards Revenue</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filteredCards.length} Retail Customer Bills</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.1rem', color: 'var(--yellow-primary)' }}>
                ₹{walkInRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-white)' }}>🏢 B2B Partner Garage Payments</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{partnerPaymentsCount} Installment Collections</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.1rem', color: 'var(--emerald-primary)' }}>
                ₹{partnerPaymentsSum.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-white)' }}>♻️ Scrap Rubber & Tyre Sales</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filteredScrap.length} Scrap Resale Log Entries</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-white)' }}>
                ₹{scrapRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Top Garage Services */}
        <div className="card-container">
          <div className="card-header">
            <TrendingUp className="card-icon" size={22} />
            <h2>{t.topServices}</h2>
          </div>

          {sortedServices.length === 0 ? (
            <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>
              No service job cards completed for the selected period.
            </p>
          ) : (
            <div className="top-services-list">
              {sortedServices.map(([sName, sCount], idx) => {
                const percent = Math.min(100, Math.round((sCount / (totalCarsServiced || 1)) * 100));
                return (
                  <div key={idx} className="top-service-row">
                    <div className="service-name-count">
                      <span>{idx + 1}. {sName}</span>
                      <strong>{sCount} times ({percent}%)</strong>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
