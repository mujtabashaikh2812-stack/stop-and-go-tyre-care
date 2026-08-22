import React, { useState } from 'react';
import { Search, Phone, Car, Calendar, History, MessageSquare, ChevronDown, ChevronUp, Users } from 'lucide-react';

export default function CustomerHistory({ jobCards }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  // Group job cards by mobile number
  const customerMap = jobCards.reduce((acc, card) => {
    const key = card.mobile || 'UNKNOWN';
    if (!acc[key]) {
      acc[key] = {
        mobile: card.mobile,
        customerName: card.customerName,
        vehicleName: card.vehicleName,
        year: card.year,
        lastVisit: card.date,
        lastOdometer: card.odometer,
        totalVisits: 0,
        totalSpent: 0,
        history: []
      };
    }
    acc[key].totalVisits += 1;
    acc[key].totalSpent += card.total;
    acc[key].history.push(card);
    return acc;
  }, {});

  const customersList = Object.values(customerMap).filter(c => 
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm) ||
    c.vehicleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendWhatsAppReminder = (customer) => {
    const message = 
      `Hi *${customer.customerName}*! 👋%0A%0A` +
      `This is a friendly reminder from *STOP %26 GO Total Tyre Care Centre*.%0A` +
      `Your vehicle *${customer.vehicleName}* was last serviced on *${customer.lastVisit}* (Odometer: ${customer.lastOdometer} KM).%0A%0A` +
      `Tyre manufacturers recommend *Wheel Alignment %26 Balancing every 5,000 KM* for smooth driving and longer tyre life.%0A%0A` +
      `Visit us today for a quick tyre health checkup! 🚗🔧`;

    const cleanMobile = customer.mobile.replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanMobile}?text=${message}`, '_blank');
  };

  return (
    <div className="tab-content-container">
      
      {/* Top Search Bar & Summary Stats */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Customer History & Service Records</h2>
          <p className="section-desc">Search past customer visits, view job history, and send 5,000 km alignment reminders</p>
        </div>

        <div className="search-box-wide">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Mobile, Customer Name, or Vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="stats-cards-grid trio">
        <div className="stat-card">
          <span className="stat-label">Total Unique Customers</span>
          <span className="stat-value">{Object.keys(customerMap).length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Jobs Serviced</span>
          <span className="stat-value">{jobCards.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Lifetime Garage Revenue</span>
          <span className="stat-value text-gold">
            ₹{jobCards.reduce((sum, c) => sum + c.total, 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Customer Directory List */}
      <div className="customer-list-container">
        {jobCards.length === 0 ? (
          <div className="card-container" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Users size={48} className="card-icon" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-white)', marginBottom: '8px' }}>No Customer Records Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              Your customer directory is clean and ready. As customers visit the shop and job cards are saved, their profiles and service histories will automatically appear here in real-time.
            </p>
          </div>
        ) : customersList.length === 0 ? (
          <div className="card-container" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <History size={40} className="card-icon" style={{ marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No customer records found matching "{searchTerm}"</p>
          </div>
        ) : (
          customersList.map((customer) => {
            const isExpanded = expandedCustomer === customer.mobile;
            return (
              <div key={customer.mobile} className="customer-card">
                
                <div className="customer-card-header" onClick={() => setExpandedCustomer(isExpanded ? null : customer.mobile)}>
                  <div className="customer-main-info">
                    <div className="customer-avatar-badge">
                      {customer.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="customer-name">{customer.customerName}</h3>
                      <div className="customer-sub-meta">
                        <span><Phone size={13} /> {customer.mobile}</span>
                        <span><Car size={13} /> {customer.vehicleName} ({customer.year})</span>
                      </div>
                    </div>
                  </div>

                  <div className="customer-stats-summary">
                    <div className="stat-badge-small">
                      <span className="badge-label">Visits</span>
                      <span className="badge-val">{customer.totalVisits}</span>
                    </div>
                    <div className="stat-badge-small">
                      <span className="badge-label">Total Spent</span>
                      <span className="badge-val text-gold">₹{customer.totalSpent.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <button
                      className="btn-whatsapp-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendWhatsAppReminder(customer);
                      }}
                      title="Send 5,000 km Service Reminder"
                    >
                      <MessageSquare size={14} />
                      <span>Send Reminder</span>
                    </button>

                    <button className="btn-expand-toggle">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible History Logs */}
                {isExpanded && (
                  <div className="customer-history-drawer">
                    <h4 className="drawer-title"><History size={15} /> Past Visit History & Invoices</h4>
                    <div className="history-logs-table">
                      {customer.history.map((card) => (
                        <div key={card.id} className="history-log-row">
                          <div className="log-col-date">
                            <span className="log-id">{card.id}</span>
                            <span className="log-date"><Calendar size={12} /> {card.date} {card.time}</span>
                          </div>
                          
                          <div className="log-col-services">
                            <span className="odometer-pill">KM: {card.odometer}</span>
                            <div className="services-tag-list">
                              {card.services.map((s, idx) => (
                                <span key={idx} className="service-tag">{s.name}</span>
                              ))}
                            </div>
                          </div>

                          <div className="log-col-total">
                            <span className="log-amount">₹{card.total}</span>
                            <span className="payment-tag">{card.paymentMethod}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
