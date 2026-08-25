import React, { useState } from 'react';
import { User, Phone, Car, Hash, Calendar, Shield, Search, CheckCircle, Edit3, X } from 'lucide-react';
import { searchCustomerByMobile } from '../utils/storage';
import { TRANSLATIONS } from '../utils/i18n';

export default function IntakeForm({
  customerData, setCustomerData,
  paymentMethod, setPaymentMethod,
  currentLang = 'en',
  editingBillId = null,
  onCancelEdit = null
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  const [autoFetchedMsg, setAutoFetchedMsg] = useState(false);

  const handleMobileChange = (e) => {
    const val = e.target.value;
    setCustomerData(prev => ({ ...prev, mobile: val }));

    if (val.length === 10) {
      const existing = searchCustomerByMobile(val);
      if (existing) {
        setCustomerData(prev => ({
          ...prev,
          name: existing.customerName || prev.name,
          vehicle: existing.vehicleName || prev.vehicle,
          vehicleNumber: existing.vehicleNumber || prev.vehicleNumber || 'MH-12-AB-1234',
          year: existing.year || prev.year,
          odometer: existing.odometer || prev.odometer
        }));
        setAutoFetchedMsg(true);
        setTimeout(() => setAutoFetchedMsg(false), 4000);
      }
    }
  };

  // Live Next Alignment Due (+5,000 KM rule)
  const calculateNextAlignmentKm = (currentOdometer) => {
    if (!currentOdometer) return 'Auto-Calculated (+5,000 KM)';
    const numsOnly = currentOdometer.replace(/\D/g, '');
    if (!numsOnly) return 'Auto-Calculated (+5,000 KM)';
    const currentKm = parseInt(numsOnly, 10);
    const nextKm = currentKm + 5000;
    return `${nextKm.toLocaleString('en-IN')} KM Target`;
  };

  return (
    <div className="card-container">
      
      {/* EDIT MODE GOLD ALERT BANNER */}
      {editingBillId && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.1) 100%)',
          border: '1px solid var(--yellow-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit3 size={20} style={{ color: 'var(--yellow-primary)' }} />
            <div>
              <strong style={{ color: 'var(--yellow-primary)', fontSize: '0.95rem' }}>
                Editing Bill #{editingBillId}
              </strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Fix customer details or service checklist below, then click Update Bill to overwrite.
              </div>
            </div>
          </div>

          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-white)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={14} />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>
      )}

      <div className="card-header">
        <User className="card-icon" size={22} />
        <h2>{t.intakeHeader}</h2>
        {autoFetchedMsg && (
          <span className="badge-chip success" style={{ animation: 'fadeIn 0.3s ease' }}>
            <CheckCircle size={14} /> {t.returningCustomer}
          </span>
        )}
      </div>

      <div className="grid-form">
        
        {/* Mobile Number */}
        <div className="form-group">
          <label>
            <Phone size={14} /> {t.mobileNumber}
          </label>
          <input
            type="tel"
            placeholder={t.mobileHint}
            maxLength={10}
            value={customerData.mobile}
            onChange={handleMobileChange}
            required
          />
        </div>

        {/* Customer Name */}
        <div className="form-group">
          <label>
            <User size={14} /> {t.customerName}
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Patil"
            value={customerData.name}
            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
            required
          />
        </div>

        {/* Vehicle Model */}
        <div className="form-group">
          <label>
            <Car size={14} /> {t.vehicleModel}
          </label>
          <input
            type="text"
            placeholder="e.g. Maruti Swift / Creta"
            value={customerData.vehicle}
            onChange={(e) => setCustomerData({ ...customerData, vehicle: e.target.value })}
            required
          />
        </div>

        {/* Vehicle Registration Number */}
        <div className="form-group">
          <label>
            <Hash size={14} /> {t.vehicleRegNo}
          </label>
          <input
            type="text"
            placeholder="e.g. MH-12-AB-1234"
            value={customerData.vehicleNumber}
            onChange={(e) => setCustomerData({ ...customerData, vehicleNumber: e.target.value })}
            required
          />
        </div>

        {/* Year / Model */}
        <div className="form-group">
          <label>
            <Calendar size={14} /> {t.yearModel}
          </label>
          <input
            type="text"
            placeholder="e.g. 2024"
            value={customerData.year}
            onChange={(e) => setCustomerData({ ...customerData, year: e.target.value })}
          />
        </div>

        {/* Odometer (KM) */}
        <div className="form-group">
          <label>
            <Hash size={14} /> {t.odometer}
          </label>
          <input
            type="text"
            placeholder="e.g. 106000"
            value={customerData.odometer}
            onChange={(e) => setCustomerData({ ...customerData, odometer: e.target.value })}
          />
        </div>

        {/* Live Next Alignment Due (+5,000 KM Rule) */}
        <div className="form-group">
          <label style={{ color: 'var(--yellow-primary)', fontWeight: '700' }}>
            🔄 {t.nextAlignDue} (+5,000 KM)
          </label>
          <input
            type="text"
            value={calculateNextAlignmentKm(customerData.odometer)}
            readOnly
            style={{
              background: 'var(--bg-surface-elevated)',
              color: 'var(--yellow-primary)',
              fontWeight: '800',
              border: '1px solid rgba(250, 204, 21, 0.4)'
            }}
          />
        </div>

        {/* Payment Method Selector */}
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label>{t.paymentMethod}</label>
          <div className="radio-group-segmented">
            <button
              type="button"
              className={`segmented-btn ${paymentMethod === 'UPI / QR Code' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('UPI / QR Code')}
            >
              {t.upiQr}
            </button>
            <button
              type="button"
              className={`segmented-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('Cash')}
            >
              {t.cash}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
