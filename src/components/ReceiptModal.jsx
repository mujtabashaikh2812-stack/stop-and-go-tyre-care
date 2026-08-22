import React from 'react';
import { X, Printer, Send, CheckCircle } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function ReceiptModal({ activeReceipt, mode = 'bill', onClose }) {
  if (!activeReceipt) return null;

  const {
    id,
    date,
    time,
    customerName,
    mobile,
    vehicleName,
    year,
    odometer,
    services = [],
    subtotal = 0,
    discount = 0,
    total = 0,
    paymentMethod = 'Cash'
  } = activeReceipt;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    // Generate WhatsApp deep-link message
    const itemLines = services.map(s => `• ${s.name}: ₹${s.amount.toLocaleString('en-IN')}`).join('%0A');
    
    const messageText = 
      `*STOP %26 GO TOTAL TYRE CARE CENTRE*%0A` +
      `Official Digital Receipt %23${id}%0A` +
      `------------------------------------%0A` +
      `👤 *Customer:* ${customerName}%0A` +
      `📱 *Mobile:* ${mobile}%0A` +
      `🚘 *Vehicle:* ${vehicleName} (${year})%0A` +
      `📟 *Odometer:* ${odometer} KM%0A` +
      `📅 *Date:* ${date} ${time}%0A` +
      `------------------------------------%0A` +
      `*SERVICES PERFORMED:*%0A` +
      `${itemLines}%0A` +
      `------------------------------------%0A` +
      `Subtotal: ₹${subtotal.toLocaleString('en-IN')}%0A` +
      (discount > 0 ? `Discount: -₹${discount.toLocaleString('en-IN')}%0A` : '') +
      `*GRAND TOTAL: ₹${total.toLocaleString('en-IN')}*%0A` +
      `Paid via: ${paymentMethod}%0A%0A` +
      `Thank you for trusting STOP %26 GO! Drive safe! 🚗💨`;

    const cleanMobile = mobile.replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanMobile}?text=${messageText}`, '_blank');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        
        <div className="modal-header-bar">
          <div className="modal-title">
            <CheckCircle style={{ color: 'var(--emerald-primary)' }} size={22} />
            <span>{mode === 'whatsapp' ? 'Digital Receipt & WhatsApp Share' : 'Official Garage Invoice'}</span>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Printable 80mm Thermal Receipt Area */}
        <div className="printable-receipt-area" id="printable-receipt">
          
          <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '12px' }}>
            <img
              src={logoImg}
              alt="STOP & GO Total Tyre Care Centre"
              style={{ height: '54px', maxWidth: '280px', objectFit: 'contain', margin: '0 auto 6px display: block' }}
            />
            <div className="receipt-address">Shop #4, Tyre Care Hub, Main Highway Road</div>
            <div className="receipt-address">Ph: +91 98765 43210</div>
          </div>

          <div className="receipt-divider">---------------------------------------------</div>

          <div className="receipt-meta">
            <div className="meta-row"><span>Bill No: <strong>{id}</strong></span><span>Date: {date}</span></div>
            <div className="meta-row"><span>Time: {time}</span><span>Pay Mode: {paymentMethod}</span></div>
            <div className="meta-row"><span>Customer: <strong>{customerName}</strong></span><span>Mob: {mobile}</span></div>
            <div className="meta-row"><span>Vehicle: {vehicleName}</span><span>KM: {odometer}</span></div>
          </div>

          <div className="receipt-divider">---------------------------------------------</div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th className="align-left">Service Item</th>
                <th className="align-right">Amt (₹)</th>
              </tr>
            </thead>
            <tbody>
              {services.map((item, i) => (
                <tr key={i}>
                  <td className="align-left">{item.name}</td>
                  <td className="align-right">{item.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-divider">---------------------------------------------</div>

          <div className="receipt-totals">
            <div className="total-row"><span>Subtotal:</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            {discount > 0 && (
              <div className="total-row"><span>Discount:</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>
            )}
            <div className="total-row grand-total"><span>NET TOTAL:</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          </div>

          <div className="receipt-divider">---------------------------------------------</div>

          <div className="receipt-footer">
            <p>*** Thank You! Visit Again ***</p>
            <p>Next Service Suggested at 5,000 KM</p>
          </div>

        </div>

        {/* Action Buttons inside Modal */}
        <div className="modal-actions-bar">
          <button className="btn-whatsapp-large" onClick={handleSendWhatsApp}>
            <Send size={18} />
            <span>Send Receipt to Customer WhatsApp (+91 {mobile})</span>
          </button>

          <button className="btn-print-large" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print 80mm Thermal Receipt Slip</span>
          </button>
        </div>

      </div>
    </div>
  );
}
