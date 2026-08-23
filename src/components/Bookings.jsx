import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Car, Plus, Send, CheckCircle2 } from 'lucide-react';
import { addBooking } from '../utils/storage';
import { TRANSLATIONS } from '../utils/i18n';

export default function Bookings({ bookings, setBookings, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    mobile: '',
    vehicleName: '',
    vehicleNumber: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    serviceType: 'Wheel Alignment & Balancing'
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!newBooking.customerName || !newBooking.mobile || !newBooking.vehicleName) return;

    const bookingItem = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newBooking,
      status: 'Confirmed'
    };

    const updated = addBooking(bookingItem);
    setBookings(updated);
    setNewBooking({
      customerName: '',
      mobile: '',
      vehicleName: '',
      vehicleNumber: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:00 AM',
      serviceType: 'Wheel Alignment & Balancing'
    });
    setSuccessMsg('Service Booking Created & Saved Successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const sendWhatsAppConfirmation = (b) => {
    const msg =
      `*STOP %26 GO TOTAL TYRE CARE CENTRE*%0A` +
      `Appointment Confirmation %23${b.id}%0A` +
      `------------------------------------%0A` +
      `👤 *Customer:* ${b.customerName}%0A` +
      `🚘 *Vehicle:* ${b.vehicleName} (${b.vehicleNumber || 'N/A'})%0A` +
      `📅 *Date:* ${b.date}%0A` +
      `⏰ *Time Slot:* ${b.timeSlot}%0A` +
      `🛠️ *Service:* ${b.serviceType}%0A` +
      `------------------------------------%0A` +
      `Your appointment is confirmed! We look forward to servicing your vehicle. Drive safe! 🚗💨`;

    const cleanMobile = b.mobile.replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanMobile}?text=${msg}`, '_blank');
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">{t.bookingsTitle}</h2>
          <p className="section-desc">{t.bookingsDesc}</p>
        </div>
      </div>

      {/* New Booking Form */}
      <div className="card-container">
        <div className="card-header">
          <Calendar className="card-icon" size={22} />
          <h2>{t.newBooking}</h2>
          {successMsg && (
            <span className="badge-chip success">
              <CheckCircle2 size={12} /> {successMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleCreateBooking} className="grid-form">
          <div className="form-group">
            <label><User size={14} /> {t.customerName}</label>
            <input
              type="text"
              placeholder="e.g. Mahesh Patil"
              value={newBooking.customerName}
              onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><Phone size={14} /> {t.mobileNumber}</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={newBooking.mobile}
              onChange={(e) => setNewBooking({ ...newBooking, mobile: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><Car size={14} /> {t.vehicleModel}</label>
            <input
              type="text"
              placeholder="e.g. Mahindra Thar (Black)"
              value={newBooking.vehicleName}
              onChange={(e) => setNewBooking({ ...newBooking, vehicleName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t.vehicleRegNo}</label>
            <input
              type="text"
              placeholder="e.g. MH-14-GH-5678"
              value={newBooking.vehicleNumber}
              onChange={(e) => setNewBooking({ ...newBooking, vehicleNumber: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><Calendar size={14} /> {t.bookingDate}</label>
            <input
              type="date"
              value={newBooking.date}
              onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><Clock size={14} /> {t.bookingTime}</label>
            <select
              value={newBooking.timeSlot}
              onChange={(e) => setNewBooking({ ...newBooking, timeSlot: e.target.value })}
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="01:00 PM">01:00 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="05:00 PM">05:00 PM</option>
              <option value="06:30 PM">06:30 PM</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} />
              <span>{t.confirmBookingBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Booking List Table */}
      <div className="card-container">
        <div className="card-header">
          <Clock className="card-icon" size={22} />
          <h2>Upcoming Service Appointments ({bookings.length})</h2>
        </div>

        <div>
          {bookings.map(b => (
            <div key={b.id} className="history-log-row" style={{ padding: '16px 0' }}>
              <div>
                <span className="log-id">{b.id}</span>
                <strong style={{ color: 'var(--text-white)', marginRight: '14px' }}>{b.customerName}</strong>
                <span className="log-date">{b.date} ({b.timeSlot})</span>
              </div>
              <div>
                <span className="service-tag" style={{ color: 'var(--yellow-primary)', fontWeight: '700' }}>
                  {b.vehicleName} ({b.vehicleNumber || 'N/A'})
                </span>
                <span className="service-tag">{b.serviceType}</span>
              </div>
              <div>
                <button
                  className="btn-whatsapp-sm"
                  onClick={() => sendWhatsAppConfirmation(b)}
                  title="Send Appointment Confirmation on WhatsApp"
                >
                  <Send size={14} />
                  <span>Send Confirmation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
