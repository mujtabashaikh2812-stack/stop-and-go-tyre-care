import React from 'react';
import { CheckSquare, Square, FileText, Send, Sparkles, RefreshCw } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

export default function ServiceChecklist({ services, setServices, discount, setDiscount, onGenerateInvoice, currentLang }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  const toggleService = (key) => {
    setServices(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const updateServiceDetail = (key, field, value) => {
    setServices(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  // Compute itemized prices according to client specifications
  const getItemPrice = (key, item) => {
    if (!item?.enabled) return 0;

    switch (key) {
      case 'wheelAlignment':
        return item.price || 350;
      case 'wheelBalancing':
        const tyresB = parseInt(item.tyresCount, 10) || 4;
        const rateB = item.pricePerTyre || 50;
        return tyresB * rateB;
      case 'weight':
        const g = parseInt(item.grams, 10) || 0;
        const rateW = item.weightType === 'sticker' ? (item.stickerRate || 4) : (item.brassRate || 2);
        return g * rateW;
      case 'tyreFitting':
        const fQty = parseInt(item.fittingQty, 10) || 1;
        const fRate = item.rimSize === 'large' ? (item.largeRimRate || 125) : (item.smallRimRate || 100);
        const fitAmt = fQty * fRate;
        const valveAmt = item.newValve ? (parseInt(item.valveQty, 10) || 0) * (parseInt(item.valveRate, 10) || 60) : 0;
        return fitAmt + valveAmt;
      case 'tyreRotation':
        const tyresR = parseInt(item.tyresCount, 10) || 4;
        const rateR = item.ratePerTyre || 50;
        return tyresR * rateR;
      case 'headlightBuffing':
        return item.price || 700;
      case 'airFilling':
        if (item.airType === 'nitrogen_full') return item.nitrogenFullPrice || 150;
        if (item.airType === 'nitrogen_topup') return item.nitrogenTopupPrice || 50;
        return item.normalPrice || 20;
      case 'tubelessPuncher':
        return (parseInt(item.qty, 10) || 0) * (item.pricePerPuncher || 100);
      case 'camberSetting':
        return item.price || 1200;
      case 'carWashing':
        return item.price || 350;
      case 'internalCleaning':
        return item.price || 800;
      case 'oilChange':
        return item.price || 1500;
      default:
        return 0;
    }
  };

  // Compute Subtotal
  const subtotal = Object.keys(services).reduce((sum, key) => sum + getItemPrice(key, services[key]), 0);
  const grandTotal = Math.max(0, subtotal - (parseInt(discount, 10) || 0));

  return (
    <div className="card-container">
      <div className="card-header">
        <CheckSquare className="card-icon" size={22} />
        <h2>{t.serviceChecklist}</h2>
        <span className="badge-chip info">Updated Shop Rates</span>
      </div>

      <div className="services-grid">

        {/* 1. Wheel Alignment */}
        <div className={`service-item-card ${services.wheelAlignment?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('wheelAlignment')}>
            <div className="checkbox-title">
              {services.wheelAlignment?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.wheelAlignment}</span>
            </div>
            <span className="service-price">₹{services.wheelAlignment?.price || 350}</span>
          </div>
        </div>

        {/* 2. Wheel Balancing (₹50 per tyre) */}
        <div className={`service-item-card ${services.wheelBalancing?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('wheelBalancing')}>
            <div className="checkbox-title">
              {services.wheelBalancing?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.wheelBalancing}</span>
            </div>
            <span className="service-price">₹{getItemPrice('wheelBalancing', services.wheelBalancing)}</span>
          </div>
          {services.wheelBalancing?.enabled && (
            <div className="service-options-row">
              <label className={`option-pill ${services.wheelBalancing?.tyresCount === 2 ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="balancingCount"
                  checked={services.wheelBalancing?.tyresCount === 2}
                  onChange={() => updateServiceDetail('wheelBalancing', 'tyresCount', 2)}
                />
                2 Tyres (₹100 @ ₹50/tyre)
              </label>
              <label className={`option-pill ${services.wheelBalancing?.tyresCount === 4 ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="balancingCount"
                  checked={services.wheelBalancing?.tyresCount === 4}
                  onChange={() => updateServiceDetail('wheelBalancing', 'tyresCount', 4)}
                />
                4 Tyres (₹200 @ ₹50/tyre)
              </label>
            </div>
          )}
        </div>

        {/* 3. Weight (Sticker ₹4/g | Brass ₹2/g) */}
        <div className={`service-item-card ${services.weight?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('weight')}>
            <div className="checkbox-title">
              {services.weight?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.wheelWeight}</span>
            </div>
            <span className="service-price">₹{getItemPrice('weight', services.weight)}</span>
          </div>
          {services.weight?.enabled && (
            <div className="service-options-row vertical">
              <div className="pill-selector">
                <button
                  type="button"
                  className={`sub-pill ${services.weight?.weightType === 'sticker' ? 'active' : ''}`}
                  onClick={() => updateServiceDetail('weight', 'weightType', 'sticker')}
                >
                  Sticker Weight (₹4/g)
                </button>
                <button
                  type="button"
                  className={`sub-pill ${services.weight?.weightType === 'brass' ? 'active' : ''}`}
                  onClick={() => updateServiceDetail('weight', 'weightType', 'brass')}
                >
                  Brass Weight (₹2/g)
                </button>
              </div>
              <div className="input-inline">
                <span>Total Grams:</span>
                <input
                  type="number"
                  min="0"
                  value={services.weight?.grams || 0}
                  onChange={(e) => updateServiceDetail('weight', 'grams', e.target.value)}
                />
                <span className="unit-tag">g (@ ₹{services.weight?.weightType === 'sticker' ? 4 : 2}/g)</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Tyre Fitting (Rim 12-15 ₹100 | Rim 16-18 ₹125) */}
        <div className={`service-item-card ${services.tyreFitting?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('tyreFitting')}>
            <div className="checkbox-title">
              {services.tyreFitting?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.tyreFitting}</span>
            </div>
            <span className="service-price">₹{getItemPrice('tyreFitting', services.tyreFitting)}</span>
          </div>
          {services.tyreFitting?.enabled && (
            <div className="service-options-row vertical">
              <div className="pill-selector">
                <button
                  type="button"
                  className={`sub-pill ${services.tyreFitting?.rimSize === 'small' ? 'active' : ''}`}
                  onClick={() => updateServiceDetail('tyreFitting', 'rimSize', 'small')}
                >
                  Rim Size 12, 13, 14, 15 (₹100/tyre)
                </button>
                <button
                  type="button"
                  className={`sub-pill ${services.tyreFitting?.rimSize === 'large' ? 'active' : ''}`}
                  onClick={() => updateServiceDetail('tyreFitting', 'rimSize', 'large')}
                >
                  Rim Size 16, 17, 18 (₹125/tyre)
                </button>
              </div>
              <div className="input-inline">
                <span>Fitting Qty:</span>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={services.tyreFitting?.fittingQty || 1}
                  onChange={(e) => updateServiceDetail('tyreFitting', 'fittingQty', e.target.value)}
                />
                <span className="unit-tag">tyres</span>
              </div>
              <div className="checkbox-inline">
                <label className="toggle-checkbox">
                  <input
                    type="checkbox"
                    checked={services.tyreFitting?.newValve || false}
                    onChange={(e) => updateServiceDetail('tyreFitting', 'newValve', e.target.checked)}
                  />
                  <span>New Tubeless Valve</span>
                </label>
                {services.tyreFitting?.newValve && (
                  <div className="inline-valve-qty">
                    <span>Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={services.tyreFitting?.valveQty || 1}
                      onChange={(e) => updateServiceDetail('tyreFitting', 'valveQty', e.target.value)}
                    />
                    <span>Amt: ₹{(parseInt(services.tyreFitting?.valveQty, 10) || 0) * (services.tyreFitting?.valveRate || 60)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5. Tyre Rotation (₹50 per tyre) */}
        <div className={`service-item-card ${services.tyreRotation?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('tyreRotation')}>
            <div className="checkbox-title">
              {services.tyreRotation?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.tyreRotation}</span>
            </div>
            <span className="service-price">₹{getItemPrice('tyreRotation', services.tyreRotation)}</span>
          </div>
          {services.tyreRotation?.enabled && (
            <div className="service-options-row vertical">
              <div className="input-inline">
                <span>Tyres Count:</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={services.tyreRotation?.tyresCount || 4}
                  onChange={(e) => updateServiceDetail('tyreRotation', 'tyresCount', e.target.value)}
                />
                <span className="unit-tag">(@ ₹50/tyre)</span>
              </div>
              <div className="pill-selector">
                <button
                  type="button"
                  className={`sub-pill ${services.tyreRotation?.rotationPattern === 'Cross Pattern' ? 'active' : ''}`}
                  onClick={() => updateServiceDetail('tyreRotation', 'rotationPattern', 'Cross Pattern')}
                >
                  Cross Pattern
                </button>
                <button
                  type="button"
                  className={`sub-pill ${services.tyreRotation?.rotationPattern === 'Front to Rear' ? 'active' : ''}`}
                  onClick={() => updateServiceDetail('tyreRotation', 'rotationPattern', 'Front to Rear')}
                >
                  Front to Rear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 6. Head Light Buffing (₹700) */}
        <div className={`service-item-card ${services.headlightBuffing?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('headlightBuffing')}>
            <div className="checkbox-title">
              {services.headlightBuffing?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.headlightBuffing}</span>
            </div>
            <span className="service-price">₹700</span>
          </div>
        </div>

        {/* 7. Air Filling (Nitrogen ₹150 | Top-Up ₹50 | Normal ₹20) */}
        <div className={`service-item-card ${services.airFilling?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('airFilling')}>
            <div className="checkbox-title">
              {services.airFilling?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.airFilling}</span>
            </div>
            <span className="service-price">₹{getItemPrice('airFilling', services.airFilling)}</span>
          </div>
          {services.airFilling?.enabled && (
            <div className="service-options-row">
              <label className={`option-pill ${services.airFilling?.airType === 'nitrogen_full' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="airType"
                  checked={services.airFilling?.airType === 'nitrogen_full'}
                  onChange={() => updateServiceDetail('airFilling', 'airType', 'nitrogen_full')}
                />
                Nitrogen Full (₹150)
              </label>
              <label className={`option-pill ${services.airFilling?.airType === 'nitrogen_topup' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="airType"
                  checked={services.airFilling?.airType === 'nitrogen_topup'}
                  onChange={() => updateServiceDetail('airFilling', 'airType', 'nitrogen_topup')}
                />
                Nitrogen Top-Up (₹50)
              </label>
              <label className={`option-pill ${services.airFilling?.airType === 'normal' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="airType"
                  checked={services.airFilling?.airType === 'normal'}
                  onChange={() => updateServiceDetail('airFilling', 'airType', 'normal')}
                />
                Normal Air (₹20)
              </label>
            </div>
          )}
        </div>

        {/* 8. Tubeless Puncher (₹100 per puncture) */}
        <div className={`service-item-card ${services.tubelessPuncher?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('tubelessPuncher')}>
            <div className="checkbox-title">
              {services.tubelessPuncher?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.tubelessPuncher}</span>
            </div>
            <span className="service-price">₹{getItemPrice('tubelessPuncher', services.tubelessPuncher)}</span>
          </div>
          {services.tubelessPuncher?.enabled && (
            <div className="service-options-row">
              <div className="input-inline">
                <span>Puncture Qty:</span>
                <input
                  type="number"
                  min="1"
                  value={services.tubelessPuncher?.qty || 1}
                  onChange={(e) => updateServiceDetail('tubelessPuncher', 'qty', e.target.value)}
                />
                <span className="unit-tag">repairs (@ ₹100/each)</span>
              </div>
            </div>
          )}
        </div>

        {/* 9. Camber Setting (Bolt & Sims Add/Remove - ₹1,200) */}
        <div className={`service-item-card ${services.camberSetting?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('camberSetting')}>
            <div className="checkbox-title">
              {services.camberSetting?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.camberSetting}</span>
            </div>
            <span className="service-price">₹1,200</span>
          </div>
        </div>

        {/* 10. Car Washing (Future Service) */}
        <div className={`service-item-card ${services.carWashing?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('carWashing')}>
            <div className="checkbox-title">
              {services.carWashing?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.carWashing}</span>
            </div>
            <span className="service-price">₹350</span>
          </div>
        </div>

        {/* 11. Internal Cleaning (Future Service) */}
        <div className={`service-item-card ${services.internalCleaning?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('internalCleaning')}>
            <div className="checkbox-title">
              {services.internalCleaning?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.internalCleaning}</span>
            </div>
            <span className="service-price">₹800</span>
          </div>
        </div>

        {/* 12. Engine Oil Change (Future Service) */}
        <div className={`service-item-card ${services.oilChange?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('oilChange')}>
            <div className="checkbox-title">
              {services.oilChange?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">{t.oilChange}</span>
            </div>
            <span className="service-price">₹1,500</span>
          </div>
        </div>

      </div>

      {/* Billing Summary Footer */}
      <div className="billing-summary-footer">
        <div className="summary-totals-group">
          <div className="summary-col">
            <span className="summary-label">{t.subtotal}:</span>
            <span className="summary-val">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-col">
            <span className="summary-label">{t.discount}:</span>
            <input
              type="number"
              className="discount-input"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="summary-col grand-total-col">
            <span className="summary-label">{t.grandTotal}:</span>
            <span className="grand-total-val">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="dual-billing-buttons">
          <button
            type="button"
            onClick={() => onGenerateInvoice('bill')}
            className="btn-generate-bill"
            disabled={subtotal === 0}
          >
            <FileText size={18} />
            <span>{t.generateBill}</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateInvoice('whatsapp')}
            className="btn-generate-whatsapp"
            disabled={subtotal === 0}
          >
            <Send size={18} />
            <span>{t.generateWhatsApp}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
