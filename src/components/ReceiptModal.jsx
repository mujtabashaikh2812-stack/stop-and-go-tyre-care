import React, { useEffect } from 'react';
import { Printer, Share2, FileText, CheckCircle2, X } from 'lucide-react';

export default function ReceiptModal({ activeReceipt, mode, onClose }) {
  if (!activeReceipt) return null;

  const isWhatsAppMode = mode === 'whatsapp';

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const formattedServices = activeReceipt.services
      .map(s => `• ${s.name}: ₹${s.amount}`)
      .join('%0A');

    const message = 
      `*STOP %26 GO - TOTAL TYRE CARE CENTRE*%0A` +
      `----------------------------------------%0A` +
      `*Invoice No:* ${activeReceipt.id}%0A` +
      `*Date:* ${activeReceipt.date} ${activeReceipt.time}%0A` +
      `*Customer:* ${activeReceipt.customerName} (${activeReceipt.mobile})%0A` +
      `*Vehicle:* ${activeReceipt.vehicleName} | Odometer: ${activeReceipt.odometer} KM%0A%0A` +
      `*SERVICES PERFORMED:*%0A${formattedServices}%0A%0A` +
      `----------------------------------------%0A` +
      `*Subtotal:* ₹${activeReceipt.subtotal}%0A` +
      `*Discount:* ₹${activeReceipt.discount}%0A` +
      `*GRAND TOTAL:* ₹${activeReceipt.total}%0A` +
      `*Payment:* ${activeReceipt.paymentMethod}%0A%0A` +
      `Thank you for choosing Stop %26 Go Total Tyre Care! Drive safe! 🚗💨`;

    const cleanMobile = activeReceipt.mobile.replace(/\D/g, '');
    const targetUrl = cleanMobile.length === 10
      ? `https://wa.me/91${cleanMobile}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(targetUrl, '_blank');
  };

  // Auto-trigger WhatsApp if opened via "Generate Digital Receipt & WhatsApp"
  useEffect(() => {
    if (isWhatsAppMode) {
      const timer = setTimeout(() => {
        handleWhatsAppShare();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        
        <div className="modal-header-bar">
          <div className="modal-title">
            <CheckCircle2 className="success-icon" size={24} />
            <span>{isWhatsAppMode ? 'Digital Receipt & WhatsApp Ready' : 'Official Garage Bill Generated'}</span>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Thermal Receipt / Official Bill */}
        <div className="printable-receipt-area" id="printable-invoice">
          <div className="receipt-header">
            <h2 className="receipt-shop-name">STOP & GO</h2>
            <p className="receipt-shop-sub">TOTAL TYRE CARE CENTRE</p>
            <p className="receipt-address">Wheel Alignment | Balancing | Nitrogen Air | Puncture | Camber</p>
            <div className="receipt-divider">================================</div>
          </div>

          <div className="receipt-meta">
            <div className="meta-row">
              <span>{isWhatsAppMode ? 'Receipt No:' : 'Invoice No:'} <strong>{activeReceipt.id}</strong></span>
              <span>Date: <strong>{activeReceipt.date} {activeReceipt.time}</strong></span>
            </div>
            <div className="meta-row">
              <span>Customer: <strong>{activeReceipt.customerName}</strong></span>
              <span>Mob: <strong>{activeReceipt.mobile}</strong></span>
            </div>
            <div className="meta-row">
              <span>Vehicle: <strong>{activeReceipt.vehicleName}</strong></span>
              <span>KM: <strong>{activeReceipt.odometer}</strong></span>
            </div>
          </div>

          <div className="receipt-divider">--------------------------------</div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th className="align-left">Service Particulars</th>
                <th className="align-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {activeReceipt.services.map((serv, index) => (
                <tr key={index}>
                  <td className="align-left">{serv.name}</td>
                  <td className="align-right">{serv.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-divider">--------------------------------</div>

          <div className="receipt-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{activeReceipt.subtotal}</span>
            </div>
            {activeReceipt.discount > 0 && (
              <div className="total-row discount">
                <span>Discount:</span>
                <span>- ₹{activeReceipt.discount}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>GRAND TOTAL:</span>
              <span>₹{activeReceipt.total}</span>
            </div>
            <div className="total-row payment-method">
              <span>Payment Mode:</span>
              <span>{activeReceipt.paymentMethod}</span>
            </div>
          </div>

          <div className="receipt-footer">
            <div className="receipt-divider">================================</div>
            <p>Thank You For Your Visit!</p>
            <p className="small-text">Drive Safe • Check Tyre Pressure Every 15 Days</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="modal-actions-bar">
          {isWhatsAppMode ? (
            <button className="btn-whatsapp-large" onClick={handleWhatsAppShare}>
              <Share2 size={20} />
              <span>Resend via WhatsApp</span>
            </button>
          ) : (
            <button className="btn-print-large" onClick={handlePrint}>
              <Printer size={20} />
              <span>Print Official Bill / Thermal Slip</span>
            </button>
          )}

          <button className="btn-action-secondary" onClick={onClose}>
            <span>Done / Return to Counter</span>
          </button>
        </div>

      </div>
    </div>
  );
}
