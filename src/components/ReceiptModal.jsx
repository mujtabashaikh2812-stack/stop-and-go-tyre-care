import React from 'react';
import { X, Printer, Send, CheckCircle } from 'lucide-react';
import LogoBanner from './LogoBanner';
import { TRANSLATIONS } from '../utils/i18n';

export default function ReceiptModal({ activeReceipt, mode = 'bill', onClose, currentLang = 'en' }) {
  if (!activeReceipt) return null;
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const {
    id,
    date,
    time,
    customerName,
    mobile,
    vehicleName,
    vehicleNumber = 'N/A',
    year,
    odometer = '0',
    services = [],
    subtotal = 0,
    discount = 0,
    total = 0,
    paymentMethod = 'Cash'
  } = activeReceipt;

  // Calculate Next Alignment KM (+5,000 KM rule)
  const calculateNextAlignmentKm = (odometerStr) => {
    if (!odometerStr) return null;
    const numsOnly = odometerStr.replace(/\D/g, '');
    if (!numsOnly) return null;
    const currentKm = parseInt(numsOnly, 10);
    const nextKm = currentKm + 5000;
    return nextKm.toLocaleString('en-IN');
  };

  const nextAlignmentKm = calculateNextAlignmentKm(odometer);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const itemLines = services.map(s => `* ${s.name}: ₹${s.amount.toLocaleString('en-IN')}`).join('%0A');
    
    const messageText = 
      `*STOP %26 GO TOTAL TYRE CARE CENTRE*%0A` +
      `Beside Solapur Steel, Near Multani bakery, Hotgi road, Solapur.%0A` +
      `Ph: +91 95455 50087, +91 94031 36311%0A` +
      `------------------------------------%0A` +
      `Official Digital Receipt %23${id}%0A` +
      `------------------------------------%0A` +
      `👤 *Customer:* ${customerName}%0A` +
      `📱 *Mobile:* ${mobile}%0A` +
      `🚘 *Vehicle:* ${vehicleName} (${year})%0A` +
      `🔢 *Reg No:* ${vehicleNumber}%0A` +
      `📟 *Odometer:* ${odometer} KM%0A` +
      (nextAlignmentKm ? `🔄 *Next Alignment Due:* ${nextAlignmentKm} KM%0A` : '') +
      `📅 *Date:* ${date} ${time}%0A` +
      `------------------------------------%0A` +
      `*SERVICES PERFORMED:*%0A` +
      `${itemLines}%0A` +
      `------------------------------------%0A` +
      `Subtotal: ₹${subtotal.toLocaleString('en-IN')}%0A` +
      (discount > 0 ? `Discount: -₹${discount.toLocaleString('en-IN')}%0A` : '') +
      `*GRAND TOTAL: ₹${total.toLocaleString('en-IN')}*%0A` +
      `Paid via: ${paymentMethod}%0A%0A` +
      (nextAlignmentKm ? `*Suggested Next Alignment Service at ${nextAlignmentKm} KM*%0A%0A` : '') +
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
            <span>{mode === 'whatsapp' ? t.digitalReceiptTitle : t.officialInvoiceTitle}</span>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Printable 80mm Thermal & A4/A5 Paper Receipt Area */}
        <div className="printable-receipt-area" id="printable-receipt">
          
          <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '12px' }}>
            <LogoBanner height="50px" useVector={false} forPrint={true} />
            <div className="receipt-address" style={{ marginTop: '8px', fontWeight: '600', fontSize: '0.85rem' }}>
              Beside Solapur Steel, Near Multani bakery, Hotgi road, Solapur.
            </div>
            <div className="receipt-address" style={{ fontWeight: '700', fontSize: '0.88rem', marginTop: '2px' }}>
              Ph: +91 95455 50087, +91 94031 36311
            </div>
          </div>

          <div className="receipt-divider">---------------------------------------------</div>

          <div className="receipt-meta">
            <div className="meta-row"><span>Bill No: <strong>{id}</strong></span><span>Date: {date}</span></div>
            <div className="meta-row"><span>Time: {time}</span><span>Pay Mode: {paymentMethod}</span></div>
            <div className="meta-row"><span>Customer: <strong>{customerName}</strong></span><span>Mob: {mobile}</span></div>
            <div className="meta-row"><span>Vehicle: {vehicleName}</span><span>Reg No: <strong>{vehicleNumber}</strong></span></div>
            <div className="meta-row">
              <span>Current KM: {odometer}</span>
              {nextAlignmentKm && <span style={{ fontWeight: '800' }}>Next Align: {nextAlignmentKm} KM</span>}
            </div>
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
            {nextAlignmentKm ? (
              <p style={{ fontWeight: '800', marginTop: '4px' }}>Next Alignment Due at {nextAlignmentKm} KM</p>
            ) : (
              <p>Next Service Suggested at +5,000 KM</p>
            )}
          </div>

        </div>

        {/* Action Buttons inside Modal */}
        <div className="modal-actions-bar">
          <button className="btn-whatsapp-large" onClick={handleSendWhatsApp}>
            <Send size={18} />
            <span>{t.sendWhatsAppBtn} (+91 {mobile})</span>
          </button>

          <button className="btn-print-large" onClick={handlePrint}>
            <Printer size={18} />
            <span>{t.printReceiptBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
