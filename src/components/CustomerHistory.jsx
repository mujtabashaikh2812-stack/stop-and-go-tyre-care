import React, { useState } from 'react';
import { Search, Phone, Car, Gauge, Send, AlertTriangle, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';

export default function CustomerHistory({ jobCards }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group job cards by mobile number to build unique customer profiles
  const customerMap = {};
  jobCards.forEach(card => {
    if (!customerMap[card.mobile]) {
      customerMap[card.mobile] = {
        mobile: card.mobile,
        customerName: card.customerName,
        vehicleName: card.vehicleName,
        year: card.year,
        odometer: card.odometer,
        lastVisitDate: card.date,
        visitCount: 0,
        totalSpent: 0,
        history: []
      };
    }
    customerMap[card.mobile].visitCount += 1;
    customerMap[card.mobile].totalSpent += card.total;
    customerMap[card.mobile].history.push(card);
    
    // Keep most recent visit date
    if (new Date(card.date) > new Date(customerMap[card.mobile].lastVisitDate)) {
      customerMap[card.mobile].lastVisitDate = card.date;
      customerMap[card.mobile].odometer = card.odometer;
    }
  });

  const customersList = Object.values(customerMap);

  const filteredCustomers = customersList.filter(c => 
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm) ||
    c.vehicleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendServiceDueWhatsApp = (c) => {
    const msg = 
      `Hi *${c.customerName}*! 🚗%0A` +
      `Your *${c.vehicleName}* is due for its 5,000 KM routine Tyre Care %26 Wheel Alignment Service at *STOP %26 GO Total Tyre Care Centre*.%0A%0A` +
      `Regular alignment %26 balancing increases tyre life by up to 30%!%0A%0A` +
      `Visit us today or reply to book your slot. Thank you!`;

    const cleanMobile = c.mobile.replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanMobile}?text=${msg}`, '_blank');
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">👥 Customer Directory & 5,000 KM Auto-Reminders</h2>
          <p className="section-desc">Track customer visit history, vehicle odometers, and automatic 30 km/day service alerts</p>
        </div>

        <div className="search-box-wide">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by Customer Name, Mobile, or Car Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="card-container" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Car size={48} className="card-icon" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-white)', marginBottom: '8px' }}>No Customer Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto' }}>
            Customer records and visit history will automatically populate here in real-time as you generate bills for new customers!
          </p>
        </div>
      ) : (
        <div>
          {filteredCustomers.map(customer => {
            // Calculate 30 km/day estimated mileage running
            const lastDate = new Date(customer.lastVisitDate);
            const today = new Date();
            const diffDays = Math.max(0, Math.floor((today - lastDate) / (1000 * 60 * 60 * 24)));
            const estimatedKmAdded = diffDays * 30; // 30 km/day running rule
            const is5000KmDue = estimatedKmAdded >= 5000 || diffDays >= 166;

            return (
              <div key={customer.mobile} className="customer-card" style={{ marginBottom: '16px' }}>
                <div className="customer-card-header">
                  <div className="customer-main-info">
                    <div className="customer-avatar-badge">
                      {customer.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="customer-name">{customer.customerName}</h3>
                      <div className="customer-sub-meta">
                        <span><Phone size={12} /> {customer.mobile}</span>
                        <span><Car size={12} /> {customer.vehicleName} ({customer.year})</span>
                        <span><Gauge size={12} /> {customer.odometer} KM</span>
                      </div>
                    </div>
                  </div>

                  <div className="customer-stats-summary">
                    {/* Auto 5,000 KM Service Notification */}
                    {is5000KmDue && (
                      <span className="badge-chip info" style={{ background: 'rgba(250, 204, 21, 0.2)', border: '1px solid var(--yellow-primary)' }}>
                        🔔 5,000 KM Service Due (+{estimatedKmAdded} km)
                      </span>
                    )}

                    <div className="stat-badge-small">
                      <span className="badge-label">Visits</span>
                      <span className="badge-val">{customer.visitCount}</span>
                    </div>
                    <div className="stat-badge-small">
                      <span className="badge-label">Total Spent</span>
                      <span className="badge-val text-gold">₹{customer.totalSpent.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      className="btn-whatsapp-sm"
                      onClick={() => sendServiceDueWhatsApp(customer)}
                      title="Send 5,000 KM Service Reminder on WhatsApp"
                    >
                      <MessageSquare size={14} />
                      <span>Send 5,000 KM Reminder</span>
                    </button>
                  </div>
                </div>

                {/* Visit History Log Drawer */}
                <div className="customer-history-drawer">
                  <div className="drawer-title">
                    <span>Visit Log History ({customer.history.length})</span>
                  </div>
                  {customer.history.map(item => (
                    <div key={item.id} className="history-log-row">
                      <div>
                        <span className="log-id">{item.id}</span>
                        <span className="log-date">{item.date} {item.time}</span>
                        <span className="odometer-pill">{item.odometer} KM</span>
                      </div>
                      <div className="services-tag-list">
                        {item.services.map((s, idx) => (
                          <span key={idx} className="service-tag">{s.name}</span>
                        ))}
                      </div>
                      <div>
                        <span className="log-amount">₹{item.total.toLocaleString('en-IN')}</span>
                        <span className="payment-tag">({item.paymentMethod})</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
