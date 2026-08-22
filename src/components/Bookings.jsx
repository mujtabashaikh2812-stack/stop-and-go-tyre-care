import React, { useState } from 'react';
import { Calendar, Clock, Plus, Phone, User, Car, CheckCircle2, MessageSquare } from 'lucide-react';
import { addBooking } from '../utils/storage';

export default function Bookings({ bookings, setBookings }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [service, setService] = useState('Wheel Alignment & Balancing');

  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!name || !mobile || !vehicle || !date) return;

    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: name,
      mobile,
      vehicleName: vehicle,
      bookingDate: date,
      bookingTime: time || '10:00 AM',
      requestedService: service,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    const updated = addBooking(newBooking);
    setBookings(updated);
    setName('');
    setMobile('');
    setVehicle('');
    setDate('');
    setTime('');
  };

  const sendWhatsAppBookingMsg = (b) => {
    const msg = 
      `Hi *${b.customerName}*! 🚗%0A` +
      `Your appointment at *STOP %26 GO Total Tyre Care Centre* is *CONFIRMED*!%0A%0A` +
      `📅 *Date:* ${b.bookingDate}%0A` +
      `⏰ *Time:* ${b.bookingTime}%0A` +
      `🚘 *Vehicle:* ${b.vehicleName}%0A` +
      `🔧 *Service:* ${b.requestedService}%0A%0A` +
      `Thank you! See you at the garage.`;

    const cleanMobile = b.mobile.replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanMobile}?text=${msg}`, '_blank');
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">📅 Service Bookings & Advance Appointments</h2>
          <p className="section-desc">Schedule advance customer visits and send 1-tap WhatsApp booking confirmations</p>
        </div>
      </div>

      {/* Booking Form */}
      <div className="card-container">
        <div className="card-header">
          <Calendar className="card-icon" size={22} />
          <h2>Schedule New Service Appointment</h2>
        </div>

        <form onSubmit={handleCreateBooking} className="grid-form">
          <div className="form-group">
            <label><User size={14} /> Customer Name *</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Phone size={14} /> Mobile Number *</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
              required
            />
          </div>

          <div className="form-group">
            <label><Car size={14} /> Vehicle Name / Reg *</label>
            <input
              type="text"
              placeholder="e.g. Maruti Swift"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Calendar size={14} /> Appointment Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Clock size={14} /> Preferred Time</label>
            <input
              type="text"
              placeholder="e.g. 11:30 AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Requested Service</label>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              <option value="Wheel Alignment & Balancing">Wheel Alignment & Balancing</option>
              <option value="Tyre Fitting & Valves">Tyre Fitting & Valves</option>
              <option value="Tyre Rotation">Tyre Rotation</option>
              <option value="Nitrogen Air Refill">Nitrogen Air Refill</option>
              <option value="Headlight Buffing">Headlight Buffing</option>
              <option value="Camber Setting">Camber Setting</option>
              <option value="Car Washing">Car Washing (Future Service)</option>
              <option value="Internal Cleaning">Internal Cleaning</option>
              <option value="Engine Oil Change">Engine Oil Change</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} />
              <span>Confirm & Save Appointment</span>
            </button>
          </div>
        </form>
      </div>

      {/* Bookings List */}
      <div className="card-container margin-top">
        <div className="card-header">
          <Clock className="card-icon" size={22} />
          <h2>Scheduled Appointments List</h2>
          <span className="badge-chip info">{bookings.length} Bookings</span>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary)' }}>
            <Calendar size={40} className="card-icon" style={{ marginBottom: '12px' }} />
            <p>No appointments booked yet. Use the form above to schedule advance service slots!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {bookings.map((b) => (
              <div key={b.id} className="customer-card" style={{ padding: '16px 20px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-white)' }}>{b.customerName} ({b.mobile})</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      🚘 {b.vehicleName} • 🔧 {b.requestedService}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge-chip info" style={{ fontSize: '0.75rem' }}>{b.bookingDate} @ {b.bookingTime}</span>
                    </div>
                    <button
                      className="btn-whatsapp-sm"
                      onClick={() => sendWhatsAppBookingMsg(b)}
                    >
                      <MessageSquare size={14} />
                      <span>Send Confirm WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
