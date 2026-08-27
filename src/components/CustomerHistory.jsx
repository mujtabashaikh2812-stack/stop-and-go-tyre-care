import React, { useState } from 'react';
import { User, Phone, Car, Calendar, Search, Trash2, Edit3, MessageSquare, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { deleteJobCard, deleteCustomerByMobile } from '../utils/storage';
import { TRANSLATIONS } from '../utils/i18n';

export default function CustomerHistory({ jobCards, setJobCards, onEditBill, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Group Job Cards by Customer Mobile Number
  const customerMap = {};

  jobCards.forEach(card => {
    const key = card.mobile || 'UNKNOWN';
    if (!customerMap[key]) {
      customerMap[key] = {
        mobile: card.mobile,
        customerName: card.customerName,
        vehicleName: card.vehicleName,
        vehicleNumber: card.vehicleNumber || 'N/A',
        year: card.year,
        lastVisitDate: card.date,
        lastOdometer: card.odometer,
        totalSpent: 0,
        visitCount: 0,
        bills: []
      };
    }

    customerMap[key].totalSpent += card.total;
    customerMap[key].visitCount += 1;
    customerMap[key].bills.push(card);

    // Keep latest visit details
    if (card.date >= customerMap[key].lastVisitDate) {
      customerMap[key].lastVisitDate = card.date;
      customerMap[key].lastOdometer = card.odometer;
      customerMap[key].customerName = card.customerName; // Sync latest name
      customerMap[key].vehicleName = card.vehicleName; // Sync latest car
      customerMap[key].vehicleNumber = card.vehicleNumber || customerMap[key].vehicleNumber;
    }
  });

  const customerList = Object.values(customerMap);

  // Filter customers by search term
  const filteredCustomers = customerList.filter(cust => {
    const term = searchTerm.toLowerCase();
    return (
      cust.customerName.toLowerCase().includes(term) ||
      cust.mobile.includes(term) ||
      cust.vehicleName.toLowerCase().includes(term) ||
      cust.vehicleNumber.toLowerCase().includes(term)
    );
  });

  // Service Reminder Calculation (+5,000 KM rule or 166 days @ 30 km/day)
  const calculateReminderStatus = (lastOdometerStr, lastVisitDateStr) => {
    if (!lastOdometerStr || lastOdometerStr === 'N/A') return { status: 'OK', text: '5,000 KM Reminder Active' };
    
    const lastKm = parseInt(lastOdometerStr.replace(/\D/g, ''), 10);
    if (isNaN(lastKm)) return { status: 'OK', text: '5,000 KM Reminder Active' };

    const dueKm = lastKm + 5000;
    
    // Estimate days elapsed
    const visitDate = new Date(lastVisitDateStr);
    const now = new Date();
    const diffDays = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));
    
    // Estimated current KM assuming 30 km/day
    const estCurrentKm = lastKm + (diffDays * 30);

    if (estCurrentKm >= dueKm || diffDays >= 150) {
      return {
        status: 'DUE_SOON',
        text: `⚠️ Alignment Due Soon! (Est. ${estCurrentKm.toLocaleString('en-IN')} KM / ${dueKm.toLocaleString('en-IN')} KM Target)`,
        dueKm
      };
    }

    return {
      status: 'OK',
      text: `Next Alignment Due at ${dueKm.toLocaleString('en-IN')} KM`,
      dueKm
    };
  };

  const sendWhatsAppReminder = (cust, reminderInfo) => {
    const lines = [
      `*STOP & GO TOTAL TYRE CARE CENTRE*`,
      `Beside Solapur Steel, Oppo Chroma Showroom Hotgi road, Solapur.`,
      `Ph: +91 95455 50087, +91 94031 36311`,
      `------------------------------------`,
      `Hello ${cust.customerName}! 👋`,
      ``,
      `This is a friendly 5,000 KM Wheel Alignment & Balancing service reminder for your *${cust.vehicleName}* (${cust.vehicleNumber}).`,
      ``,
      `📟 *Last Visit Odometer:* ${cust.lastOdometer} KM`,
      `🔄 *Suggested Next Service Due:* ${reminderInfo.dueKm ? reminderInfo.dueKm.toLocaleString('en-IN') : '5,000 KM later'} KM`,
      ``,
      `Regular alignment saves tyre life by 40% and ensures smooth highway driving!`,
      `Visit us today for quick 15-min precision servicing. Drive safe! 🚗💨`
    ].join('\n');

    const cleanMobile = cust.mobile.replace(/\D/g, '');
    const encodedText = encodeURIComponent(lines);
    window.open(`https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodedText}`, '_blank');
  };

  const handleDeleteBill = (billId) => {
    if (window.confirm(`Are you sure you want to delete Bill #${billId}?`)) {
      const updatedCards = deleteJobCard(billId);
      setJobCards(updatedCards);
      if (selectedCustomer) {
        const remaining = selectedCustomer.bills.filter(b => b.id !== billId);
        if (remaining.length === 0) {
          setSelectedCustomer(null);
        } else {
          setSelectedCustomer({ ...selectedCustomer, bills: remaining });
        }
      }
    }
  };

  const handleDeleteEntireCustomer = (mobile, name) => {
    if (window.confirm(`Are you sure you want to delete ALL customer records for ${name} (${mobile})?`)) {
      const updatedCards = deleteCustomerByMobile(mobile);
      setJobCards(updatedCards);
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">{t.customerDirectory}</h2>
          <p className="section-desc">{t.customerDirectoryDesc}</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="search-box-wide">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Customer Cards Grid */}
      <div className="customers-cards-grid">
        {filteredCustomers.length === 0 ? (
          <div className="no-results-card">
            <User size={36} className="text-muted" />
            <p>No customer visit records match your search criteria.</p>
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const reminderInfo = calculateReminderStatus(cust.lastOdometer, cust.lastVisitDate);
            const isDueSoon = reminderInfo.status === 'DUE_SOON';

            return (
              <div key={cust.mobile} className={`customer-card ${isDueSoon ? 'due-reminder' : ''}`}>
                
                <div className="customer-card-header">
                  <div>
                    <h3 className="cust-name">{cust.customerName}</h3>
                    <div className="cust-phone"><Phone size={13} /> +91 {cust.mobile}</div>
                  </div>
                  <span className="visit-badge">{cust.visitCount} {cust.visitCount === 1 ? 'Visit' : 'Visits'}</span>
                </div>

                <div className="customer-card-details">
                  <div className="detail-line">
                    <Car size={14} className="detail-icon" />
                    <span><strong>{cust.vehicleName}</strong> ({cust.vehicleNumber})</span>
                  </div>
                  <div className="detail-line">
                    <Calendar size={14} className="detail-icon" />
                    <span>Last Visit: {cust.lastVisitDate} ({cust.lastOdometer} KM)</span>
                  </div>
                </div>

                {/* 5,000 KM Auto Service Reminder Badge */}
                <div className={`reminder-pill ${isDueSoon ? 'alert' : 'ok'}`}>
                  <span>{reminderInfo.text}</span>
                </div>

                <div className="customer-card-footer">
                  <div>
                    <span className="total-label">Total Garage Spent:</span>
                    <strong className="total-spent-val">₹{cust.totalSpent.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="card-actions-group">
                    <button
                      className="btn-whatsapp-sm"
                      onClick={() => sendWhatsAppReminder(cust, reminderInfo)}
                      title="Send 5,000 KM Service Reminder on WhatsApp"
                    >
                      <MessageSquare size={14} />
                      <span>Send Reminder</span>
                    </button>

                    <button
                      className="btn-details-sm"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      <span>History</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      className="btn-delete-icon"
                      onClick={() => handleDeleteEntireCustomer(cust.mobile, cust.customerName)}
                      title={t.deleteCustomer}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Customer Full Visit History Drawer Modal */}
      {selectedCustomer && (
        <div className="modal-backdrop">
          <div className="modal-content drawer-style">
            
            <div className="modal-header-bar">
              <div className="modal-title">
                <User style={{ color: 'var(--yellow-primary)' }} size={22} />
                <span>Visit History: <strong>{selectedCustomer.customerName}</strong> (+91 {selectedCustomer.mobile})</span>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedCustomer(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="history-modal-body">
              <div className="history-summary-strip">
                <div><span>Vehicle:</span> <strong>{selectedCustomer.vehicleName} ({selectedCustomer.vehicleNumber})</strong></div>
                <div><span>Total Visits:</span> <strong>{selectedCustomer.visitCount}</strong></div>
                <div><span>Lifetime Spent:</span> <strong className="text-gold">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</strong></div>
              </div>

              <h3 className="section-subtitle">All Job Card Slips ({selectedCustomer.bills.length})</h3>

              <div className="bills-history-list">
                {selectedCustomer.bills.map(bill => (
                  <div key={bill.id} className="bill-history-card">
                    
                    <div className="bill-card-top">
                      <div>
                        <span className="bill-id-tag">Bill #{bill.id}</span>
                        <span className="bill-date-tag">{bill.date} at {bill.time}</span>
                      </div>
                      <div className="bill-price-tag">₹{bill.total.toLocaleString('en-IN')}</div>
                    </div>

                    <div className="bill-meta-info">
                      <span>Vehicle: {bill.vehicleName} ({bill.vehicleNumber || 'N/A'})</span>
                      <span>Odometer: {bill.odometer} KM</span>
                      <span>Payment: {bill.paymentMethod}</span>
                    </div>

                    <div className="bill-services-list">
                      <strong>Services Performed:</strong>
                      <ul>
                        {bill.services.map((serv, i) => (
                          <li key={i}>{serv.name} — ₹{serv.amount.toLocaleString('en-IN')}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bill-card-actions">
                      {/* EDIT BILL BUTTON */}
                      {onEditBill && (
                        <button
                          type="button"
                          className="btn-secondary-sm"
                          onClick={() => {
                            setSelectedCustomer(null);
                            onEditBill(bill);
                          }}
                          style={{
                            background: 'rgba(250, 204, 21, 0.15)',
                            color: 'var(--yellow-primary)',
                            border: '1px solid rgba(250, 204, 21, 0.4)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                          title="Edit details or services for this bill"
                        >
                          <Edit3 size={14} />
                          <span>Edit Bill</span>
                        </button>
                      )}

                      <button
                        className="btn-delete-bill"
                        onClick={() => handleDeleteBill(bill.id)}
                        title="Delete Bill Entry"
                      >
                        <Trash2 size={14} />
                        <span>Delete Bill Entry</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
