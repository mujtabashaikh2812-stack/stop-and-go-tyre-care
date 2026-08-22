import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, DollarSign } from 'lucide-react';
import { saveServicePrices } from '../utils/storage';

export default function ServicePriceEditor({ services, setServices }) {
  const [editedServices, setEditedServices] = useState({ ...services });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePriceChange = (serviceKey, field, val) => {
    const num = parseFloat(val) || 0;
    setEditedServices(prev => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey],
        [field]: num
      }
    }));
  };

  const handleSavePrices = (e) => {
    e.preventDefault();
    const updated = saveServicePrices(editedServices);
    setServices(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">⚙️ Master Service Price Settings (Admin Control)</h2>
          <p className="section-desc">Edit base pricing and rates for all 9 Tyre Care services. Changes apply immediately to new bills.</p>
        </div>

        {savedSuccess && (
          <div className="badge-chip success" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            <CheckCircle2 size={16} /> Prices Updated Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSavePrices} className="card-container">
        
        <div className="services-grid" style={{ marginBottom: '24px' }}>

          {/* 1. Wheel Alignment */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              1. Wheel Alignment Price
            </h3>
            <div className="form-group">
              <label>Standard Alignment Rate (₹)</label>
              <input
                type="number"
                value={editedServices.wheelAlignment?.price || ''}
                onChange={(e) => handlePriceChange('wheelAlignment', 'price', e.target.value)}
                required
              />
            </div>
          </div>

          {/* 2. Wheel Balancing */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              2. Wheel Balancing Rates
            </h3>
            <div className="grid-form">
              <div className="form-group">
                <label>Two Tyre Rate (₹)</label>
                <input
                  type="number"
                  value={editedServices.wheelBalancing?.priceTwo || ''}
                  onChange={(e) => handlePriceChange('wheelBalancing', 'priceTwo', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Four Tyre Rate (₹)</label>
                <input
                  type="number"
                  value={editedServices.wheelBalancing?.priceFour || ''}
                  onChange={(e) => handlePriceChange('wheelBalancing', 'priceFour', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Weight */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              3. Wheel Weight Pricing
            </h3>
            <div className="form-group">
              <label>Rate Per Gram (₹/g)</label>
              <input
                type="number"
                step="0.5"
                value={editedServices.weight?.pricePerGram || ''}
                onChange={(e) => handlePriceChange('weight', 'pricePerGram', e.target.value)}
                required
              />
            </div>
          </div>

          {/* 4. Tyre Fitting & Valves */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              4. Fitting & Valve Rates
            </h3>
            <div className="grid-form">
              <div className="form-group">
                <label>Fitting Rate Per Tyre (₹)</label>
                <input
                  type="number"
                  value={editedServices.tyreFitting?.fittingRate || ''}
                  onChange={(e) => handlePriceChange('tyreFitting', 'fittingRate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Tubeless Valve Rate (₹)</label>
                <input
                  type="number"
                  value={editedServices.tyreFitting?.valveRate || ''}
                  onChange={(e) => handlePriceChange('tyreFitting', 'valveRate', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* 5. Tyre Rotation */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              5. Tyre Rotation Rate
            </h3>
            <div className="form-group">
              <label>Rotation Price (₹)</label>
              <input
                type="number"
                value={editedServices.tyreRotation?.price || ''}
                onChange={(e) => handlePriceChange('tyreRotation', 'price', e.target.value)}
                required
              />
            </div>
          </div>

          {/* 6. Head Light Buffing */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              6. Head Light Buffing Rate
            </h3>
            <div className="form-group">
              <label>Buffing & Cleaning Price (₹)</label>
              <input
                type="number"
                value={editedServices.headlightBuffing?.price || ''}
                onChange={(e) => handlePriceChange('headlightBuffing', 'price', e.target.value)}
                required
              />
            </div>
          </div>

          {/* 7. Air Filling */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              7. Air Filling Rates
            </h3>
            <div className="form-group">
              <label>Nitrogen Air Rate (₹)</label>
              <input
                type="number"
                value={editedServices.airFilling?.price || ''}
                onChange={(e) => handlePriceChange('airFilling', 'price', e.target.value)}
                required
              />
            </div>
          </div>

          {/* 8. Tubeless Puncher */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              8. Tubeless Puncher Repair
            </h3>
            <div className="form-group">
              <label>Rate Per Puncture (₹)</label>
              <input
                type="number"
                value={editedServices.tubelessPuncher?.pricePerPuncher || ''}
                onChange={(e) => handlePriceChange('tubelessPuncher', 'pricePerPuncher', e.target.value)}
                required
              />
            </div>
          </div>

          {/* 9. Camber Setting */}
          <div className="service-item-card active">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--yellow-primary)' }}>
              9. Camber Setting Rates
            </h3>
            <div className="grid-form">
              <div className="form-group">
                <label>Front R/L Rate (₹)</label>
                <input
                  type="number"
                  value={editedServices.camberSetting?.priceFront || ''}
                  onChange={(e) => handlePriceChange('camberSetting', 'priceFront', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Both Front & Rear Rate (₹)</label>
                <input
                  type="number"
                  value={editedServices.camberSetting?.priceBoth || ''}
                  onChange={(e) => handlePriceChange('camberSetting', 'priceBoth', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

        </div>

        <div className="billing-summary-footer" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-generate-bill" style={{ fontSize: '1rem', padding: '14px 28px' }}>
            <Save size={20} />
            <span>Save All Service Prices</span>
          </button>
        </div>

      </form>

    </div>
  );
}
