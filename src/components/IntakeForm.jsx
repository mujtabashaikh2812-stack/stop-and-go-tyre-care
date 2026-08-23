import React from 'react';
import { User, Phone, Car, Gauge, Search, Sparkles, Hash } from 'lucide-react';
import { searchCustomerByMobile } from '../utils/storage';
import { TRANSLATIONS } from '../utils/i18n';

export default function IntakeForm({ customerData, setCustomerData, paymentMethod, setPaymentMethod, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handleMobileChange = (e) => {
    const val = e.target.value;
    setCustomerData(prev => ({ ...prev, mobile: val }));
    
    if (val.length === 10) {
      const found = searchCustomerByMobile(val);
      if (found) {
        setCustomerData({
          name: found.customerName,
          mobile: found.mobile,
          vehicle: found.vehicleName,
          vehicleNumber: found.vehicleNumber || '',
          year: found.year,
          odometer: found.odometer
        });
      }
    }
  };

  // Live Next Alignment KM calculation (+5,000 KM rule)
  const calculateNextKm = (odo) => {
    if (!odo) return null;
    const numsOnly = odo.replace(/\D/g, '');
    if (!numsOnly) return null;
    const current = parseInt(numsOnly, 10);
    return (current + 5000).toLocaleString('en-IN');
  };

  const nextKmVal = calculateNextKm(customerData.odometer);

  return (
    <div className="card-container">
      <div className="card-header">
        <User className="card-icon" size={22} />
        <h2>{t.intakeHeader}</h2>
        {customerData.mobile.length === 10 && searchCustomerByMobile(customerData.mobile) && (
          <span className="badge-chip success">
            <Sparkles size={12} /> {t.returningCustomer}
          </span>
        )}
      </div>

      <div className="grid-form">
        <div className="form-group">
          <label><Phone size={14} /> {t.mobileNumber}</label>
          <div className="input-with-icon">
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={customerData.mobile}
              onChange={handleMobileChange}
              maxLength={10}
              required
            />
            <Search className="input-icon" size={16} />
          </div>
          <span className="input-hint">{t.mobileHint}</span>
        </div>

        <div className="form-group">
          <label><User size={14} /> {t.customerName}</label>
          <input
            type="text"
            placeholder="e.g. Rajesh Kumar"
            value={customerData.name}
            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label><Car size={14} /> {t.vehicleModel}</label>
          <input
            type="text"
            placeholder="e.g. Hyundai Creta (White)"
            value={customerData.vehicle}
            onChange={(e) => setCustomerData({ ...customerData, vehicle: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label><Hash size={14} /> {t.vehicleRegNo}</label>
          <input
            type="text"
            placeholder="e.g. MH-12-AB-1234"
            value={customerData.vehicleNumber || ''}
            onChange={(e) => setCustomerData({ ...customerData, vehicleNumber: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>{t.yearModel}</label>
          <input
            type="text"
            placeholder="e.g. 2023"
            value={customerData.year}
            onChange={(e) => setCustomerData({ ...customerData, year: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label><Gauge size={14} /> {t.odometer}</label>
          <input
            type="text"
            placeholder="e.g. 106000 KM"
            value={customerData.odometer}
            onChange={(e) => setCustomerData({ ...customerData, odometer: e.target.value })}
          />
          {nextKmVal && (
            <span className="input-hint" style={{ color: 'var(--yellow-primary)', fontWeight: '700' }}>
              🔄 {t.nextAlignDue}: {nextKmVal} KM (+5,000 KM)
            </span>
          )}
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
