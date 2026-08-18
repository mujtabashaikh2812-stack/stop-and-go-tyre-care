import React from 'react';
import { DollarSign, TrendingUp, Car, CreditCard, Award } from 'lucide-react';

export default function Analytics({ jobCards }) {
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Today stats
  const todayCards = jobCards.filter(c => c.date === todayStr);
  const todayRevenue = todayCards.reduce((sum, c) => sum + c.total, 0);
  const totalRevenue = jobCards.reduce((sum, c) => sum + c.total, 0);
  const avgBill = jobCards.length ? Math.round(totalRevenue / jobCards.length) : 0;

  // Payment method split
  const upiTotal = jobCards.filter(c => c.paymentMethod.includes('UPI')).reduce((sum, c) => sum + c.total, 0);
  const cashTotal = jobCards.filter(c => c.paymentMethod.includes('Cash')).reduce((sum, c) => sum + c.total, 0);
  const upiPercent = totalRevenue ? Math.round((upiTotal / totalRevenue) * 100) : 0;
  const cashPercent = totalRevenue ? Math.round((cashTotal / totalRevenue) * 100) : 0;

  // Most performed services count
  const serviceCounts = {};
  jobCards.forEach(c => {
    c.services.forEach(s => {
      const cleanName = s.name.split('(')[0].trim();
      serviceCounts[cleanName] = (serviceCounts[cleanName] || 0) + 1;
    });
  });

  const sortedServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Garage Business Analytics & Revenue</h2>
          <p className="section-desc">Real-time performance metrics, payment mode splits, and service popularity leaderboard</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-cards-grid">
        <div className="stat-card featured">
          <div className="stat-card-header">
            <span className="stat-label">Today's Revenue</span>
            <DollarSign size={20} className="stat-icon" />
          </div>
          <span className="stat-value text-emerald">₹{todayRevenue.toLocaleString('en-IN')}</span>
          <span className="stat-sub">{todayCards.length} Vehicles Serviced Today</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Revenue</span>
            <TrendingUp size={20} className="stat-icon" />
          </div>
          <span className="stat-value text-gold">₹{totalRevenue.toLocaleString('en-IN')}</span>
          <span className="stat-sub">Across All Time Records</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Vehicles Serviced</span>
            <Car size={20} className="stat-icon" />
          </div>
          <span className="stat-value">{jobCards.length}</span>
          <span className="stat-sub">Total Job Cards Created</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Average Ticket Size</span>
            <CreditCard size={20} className="stat-icon" />
          </div>
          <span className="stat-value">₹{avgBill.toLocaleString('en-IN')}</span>
          <span className="stat-sub">Per Vehicle Revenue</span>
        </div>
      </div>

      {/* Payment Split & Service Leaderboard Grid */}
      <div className="analytics-two-col">
        
        {/* Payment Split */}
        <div className="card-container">
          <div className="card-header">
            <CreditCard className="card-icon" size={20} />
            <h2>Payment Method Breakdown</h2>
          </div>

          <div className="payment-split-box">
            <div className="split-row">
              <div className="split-meta">
                <span>📱 UPI / QR Code Online</span>
                <span className="split-val">₹{upiTotal.toLocaleString('en-IN')} ({upiPercent}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill cyan" style={{ width: `${upiPercent}%` }}></div>
              </div>
            </div>

            <div className="split-row">
              <div className="split-meta">
                <span>💵 Cash Payments</span>
                <span className="split-val">₹{cashTotal.toLocaleString('en-IN')} ({cashPercent}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill emerald" style={{ width: `${cashPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Services Leaderboard */}
        <div className="card-container">
          <div className="card-header">
            <Award className="card-icon text-gold" size={20} />
            <h2>Most Requested Tyre Services</h2>
          </div>

          <div className="leaderboard-list">
            {sortedServices.map(([name, count], index) => (
              <div key={name} className="leaderboard-item">
                <div className="item-rank">{index + 1}</div>
                <div className="item-name">{name}</div>
                <div className="item-count-badge">{count} times</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
