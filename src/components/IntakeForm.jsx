import React from 'react';
import { User, Phone, Car, Gauge, Search, Sparkles, Hash } from 'lucide-react';
import { searchCustomerByMobile } from '../utils/storage';

export default function IntakeForm({ customerData, setCustomerData, paymentMethod, setPaymentMethod }) {
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

  return (
    <div className="card-container">
      <div className="card-header">
        <User className="card-icon" size={22} />
        <h2>01. Customer & Vehicle Details</h2>
        {customerData.mobile.length === 10 && searchCustomerByMobile(customerData.mobile) && (
          <span className="badge-chip success">
            <Sparkles size={12} /> Auto-Fetched Returning Customer
          </span>
        )}
      </div>

      <div className="grid-form">
        <div className="form-group">
          <label><Phone size={14} /> Mobile Number *</label>
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
          <span className="input-hint">Type 10 digits to search past customer records</span>
        </div>

        <div className="form-group">
          <label><User size={14} /> Customer Name *</label>
          <input
            type="text"
            placeholder="e.g. Rajesh Kumar"
            value={customerData.name}
            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label><Car size={14} /> Vehicle Model / Name *</label>
          <input
            type="text"
            placeholder="e.g. Hyundai Creta (White)"
            value={customerData.vehicle}
            onChange={(e) => setCustomerData({ ...customerData, vehicle: e.target.value })}
            required
          />
        </div>

        {/* NEW VEHICLE REGISTRATION NUMBER FIELD */}
        <div className="form-group">
          <label><Hash size={14} /> Vehicle Reg. Number *</label>
          <input
            type="text"
            placeholder="e.g. MH-12-AB-1234"
            value={customerData.vehicleNumber || ''}
            onChange={(e) => setCustomerData({ ...customerData, vehicleNumber: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Year / Model</label>
          <input
            type="text"
            placeholder="e.g. 2023"
            value={customerData.year}
            onChange={(e) => setCustomerData({ ...customerData, year: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label><Gauge size={14} /> Kilometer (Odometer)</label>
          <input
            type="text"
            placeholder="e.g. 34,500 KM"
            value={customerData.odometer}
            onChange={(e) => setCustomerData({ ...customerData, odometer: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Payment Method</label>
          <div className="radio-group-segmented">
            <button
              type="button"
              className={`segmented-btn ${paymentMethod === 'UPI / QR Code' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('UPI / QR Code')}
            >
              📱 UPI / QR Code
            </button>
            <button
              type="button"
              className={`segmented-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('Cash')}
            >
              💵 Cash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
