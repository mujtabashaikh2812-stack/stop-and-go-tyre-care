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
    const parsedVal = typeof value === 'string' && !isNaN(value) && value !== '' ? parseFloat(value) : value;
    setServices(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: parsedVal }
    }));
  };

  // Compute itemized prices according to client specifications
  const getItemPrice = (key, item) => {
    if (!item?.enabled) return 0;

    switch (key) {
      case 'wheelAlignment':
        return parseFloat(item.price) || 0;
      case 'wheelBalancing':
        const tyresB = parseInt(item.tyresCount, 10) || 4;
        const rateB = parseFloat(item.pricePerTyre) || 50;
        return tyresB * rateB;
      case 'weight':
        const g = parseInt(item.grams, 10) || 0;
        const rateW = item.weightType === 'sticker' ? (parseFloat(item.stickerRate) || 4) : (parseFloat(item.brassRate) || 2);
        return g * rateW;
      case 'tyreFitting':
        const fQty = parseInt(item.fittingQty, 10) || 1;
        const fRate = item.rimSize === 'large' ? (parseFloat(item.largeRimRate) || 125) : (parseFloat(item.smallRimRate) || 100);
        const fitAmt = fQty * fRate;
        const valveAmt = item.newValve ? (parseInt(item.valveQty, 10) || 0) * (parseFloat(item.valveRate) || 60) : 0;
        return fitAmt + valveAmt;
      case 'tyreRotation':
        const tyresR = parseInt(item.tyresCount, 10) || 4;
        const rateR = parseFloat(item.ratePerTyre) || 50;
        return tyresR * rateR;
      case 'headlightBuffing':
        return parseFloat(item.price) || 0;
      case 'airFilling':
        if (item.airType === 'nitrogen_full') return parseFloat(item.nitrogenFullPrice) || 150;
        if (item.airType === 'nitrogen_topup') return parseFloat(item.nitrogenTopupPrice) || 50;
        return parseFloat(item.normalPrice) || 20;
      case 'tubelessPuncher':
        return (parseInt(item.qty, 10) || 0) * (parseFloat(item.pricePerPuncher) || 100);
      case 'camberSetting':
        return parseFloat(item.price) || 0;
      case 'carWashing':
        return parseFloat(item.price) || 0;
      case 'internalCleaning':
        return parseFloat(item.price) || 0;
      case 'oilChange':
        return parseFloat(item.price) || 0;
      default:
        return parseFloat(item?.price) || 0;
    }
  };

  // Compute Subtotal
  const subtotal = Object.keys(services).reduce((sum, key) => sum + getItemPrice(key, services[key]), 0);
  const grandTotal = Math.max(0, subtotal - (parseInt(discount, 10) || 0));

  const serviceKeys = Object.keys(services);

  return (
    <div className="card-container">
      <div className="card-header">
        <CheckSquare className="card-icon" size={22} />
        <h2>{t.serviceChecklist}</h2>
        <span className="badge-chip info">✏️ Edit Prices Live Below</span>
      </div>

      <div className="services-grid">

        {serviceKeys.map(key => {
          const item = services[key] || {};
          const isEnabled = !!item.enabled;
          const displayName = item.name || key;

          // Standard Tiered Services vs Direct Rate Services
          if (key === 'wheelBalancing') {
            return (
              <div key={key} className={`service-item-card ${isEnabled ? 'active' : ''}`}>
                <div className="service-card-top" onClick={() => toggleService('wheelBalancing')}>
                  <div className="checkbox-title">
                    {isEnabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
                    <span className="service-title">{t.wheelBalancing}</span>
                  </div>
                  <span className="service-price">₹{getItemPrice('wheelBalancing', item)}</span>
                </div>
                {isEnabled && (
                  <div className="service-options-row vertical">
                    <div className="input-inline">
                      <span>Rate / Tyre (₹):</span>
                      <input
                        type="number"
                        className="inline-price-input"
                        value={item.pricePerTyre ?? 50}
                        onChange={(e) => updateServiceDetail('wheelBalancing', 'pricePerTyre', e.target.value)}
                      />
                    </div>
                    <div className="service-options-row">
                      <label className={`option-pill ${item.tyresCount === 2 ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="balancingCount"
                          checked={item.tyresCount === 2}
                          onChange={() => updateServiceDetail('wheelBalancing', 'tyresCount', 2)}
                        />
                        2 Tyres (₹{(item.pricePerTyre || 50) * 2})
                      </label>
                      <label className={`option-pill ${item.tyresCount === 4 ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="balancingCount"
                          checked={item.tyresCount === 4}
                          onChange={() => updateServiceDetail('wheelBalancing', 'tyresCount', 4)}
                        />
                        4 Tyres (₹{(item.pricePerTyre || 50) * 4})
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (key === 'weight') {
            return (
              <div key={key} className={`service-item-card ${isEnabled ? 'active' : ''}`}>
                <div className="service-card-top" onClick={() => toggleService('weight')}>
                  <div className="checkbox-title">
                    {isEnabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
                    <span className="service-title">{t.wheelWeight}</span>
                  </div>
                  <span className="service-price">₹{getItemPrice('weight', item)}</span>
                </div>
                {isEnabled && (
                  <div className="service-options-row vertical">
                    <div className="pill-selector">
                      <button
                        type="button"
                        className={`sub-pill ${item.weightType === 'sticker' ? 'active' : ''}`}
                        onClick={() => updateServiceDetail('weight', 'weightType', 'sticker')}
                      >
                        Sticker (₹{item.stickerRate || 4}/g)
                      </button>
                      <button
                        type="button"
                        className={`sub-pill ${item.weightType === 'brass' ? 'active' : ''}`}
                        onClick={() => updateServiceDetail('weight', 'weightType', 'brass')}
                      >
                        Brass (₹{item.brassRate || 2}/g)
                      </button>
                    </div>
                    <div className="input-inline">
                      <span>Total Grams:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.grams || 0}
                        onChange={(e) => updateServiceDetail('weight', 'grams', e.target.value)}
                      />
                      <span className="unit-tag">g</span>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (key === 'tyreFitting') {
            return (
              <div key={key} className={`service-item-card ${isEnabled ? 'active' : ''}`}>
                <div className="service-card-top" onClick={() => toggleService('tyreFitting')}>
                  <div className="checkbox-title">
                    {isEnabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
                    <span className="service-title">{t.tyreFitting}</span>
                  </div>
                  <span className="service-price">₹{getItemPrice('tyreFitting', item)}</span>
                </div>
                {isEnabled && (
                  <div className="service-options-row vertical">
                    <div className="pill-selector">
                      <button
                        type="button"
                        className={`sub-pill ${item.rimSize === 'small' ? 'active' : ''}`}
                        onClick={() => updateServiceDetail('tyreFitting', 'rimSize', 'small')}
                      >
                        Rim 12-15 (₹{item.smallRimRate || 100}/tyre)
                      </button>
                      <button
                        type="button"
                        className={`sub-pill ${item.rimSize === 'large' ? 'active' : ''}`}
                        onClick={() => updateServiceDetail('tyreFitting', 'rimSize', 'large')}
                      >
                        Rim 16-18 (₹{item.largeRimRate || 125}/tyre)
                      </button>
                    </div>
                    <div className="input-inline">
                      <span>Fitting Qty:</span>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={item.fittingQty || 1}
                        onChange={(e) => updateServiceDetail('tyreFitting', 'fittingQty', e.target.value)}
                      />
                      <span className="unit-tag">tyres</span>
                    </div>
                    <div className="checkbox-inline">
                      <label className="toggle-checkbox">
                        <input
                          type="checkbox"
                          checked={item.newValve || false}
                          onChange={(e) => updateServiceDetail('tyreFitting', 'newValve', e.target.checked)}
                        />
                        <span>New Tubeless Valve</span>
                      </label>
                      {item.newValve && (
                        <div className="inline-valve-qty">
                          <span>Qty:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.valveQty || 1}
                            onChange={(e) => updateServiceDetail('tyreFitting', 'valveQty', e.target.value)}
                          />
                          <span>Amt: ₹{(parseInt(item.valveQty, 10) || 0) * (item.valveRate || 60)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (key === 'airFilling') {
            return (
              <div key={key} className={`service-item-card ${isEnabled ? 'active' : ''}`}>
                <div className="service-card-top" onClick={() => toggleService('airFilling')}>
                  <div className="checkbox-title">
                    {isEnabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
                    <span className="service-title">{t.airFilling}</span>
                  </div>
                  <span className="service-price">₹{getItemPrice('airFilling', item)}</span>
                </div>
                {isEnabled && (
                  <div className="service-options-row">
                    <label className={`option-pill ${item.airType === 'nitrogen_full' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="airType"
                        checked={item.airType === 'nitrogen_full'}
                        onChange={() => updateServiceDetail('airFilling', 'airType', 'nitrogen_full')}
                      />
                      Nitrogen Full (₹{item.nitrogenFullPrice || 150})
                    </label>
                    <label className={`option-pill ${item.airType === 'nitrogen_topup' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="airType"
                        checked={item.airType === 'nitrogen_topup'}
                        onChange={() => updateServiceDetail('airFilling', 'airType', 'nitrogen_topup')}
                      />
                      Nitrogen Top-Up (₹{item.nitrogenTopupPrice || 50})
                    </label>
                    <label className={`option-pill ${item.airType === 'normal' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="airType"
                        checked={item.airType === 'normal'}
                        onChange={() => updateServiceDetail('airFilling', 'airType', 'normal')}
                      />
                      Normal Air (₹{item.normalPrice || 20})
                    </label>
                  </div>
                )}
              </div>
            );
          }

          if (key === 'tubelessPuncher') {
            return (
              <div key={key} className={`service-item-card ${isEnabled ? 'active' : ''}`}>
                <div className="service-card-top" onClick={() => toggleService('tubelessPuncher')}>
                  <div className="checkbox-title">
                    {isEnabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
                    <span className="service-title">{t.tubelessPuncher}</span>
                  </div>
                  <span className="service-price">₹{getItemPrice('tubelessPuncher', item)}</span>
                </div>
                {isEnabled && (
                  <div className="service-options-row vertical">
                    <div className="input-inline">
                      <span>Rate / Puncture (₹):</span>
                      <input
                        type="number"
                        className="inline-price-input"
                        value={item.pricePerPuncher ?? 100}
                        onChange={(e) => updateServiceDetail('tubelessPuncher', 'pricePerPuncher', e.target.value)}
                      />
                    </div>
                    <div className="input-inline">
                      <span>Puncture Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.qty || 1}
                        onChange={(e) => updateServiceDetail('tubelessPuncher', 'qty', e.target.value)}
                      />
                      <span className="unit-tag">repairs</span>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (key === 'tyreRotation') {
            return (
              <div key={key} className={`service-item-card ${isEnabled ? 'active' : ''}`}>
                <div className="service-card-top" onClick={() => toggleService('tyreRotation')}>
                  <div className="checkbox-title">
                    {isEnabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
                    <span className="service-title">{t.tyreRotation}</span>
                  </div>
                  <span className="service-price">₹{getItemPrice('tyreRotation', item)}</span>
                </div>
                {isEnabled && (
                  <div className="service-options-row vertical">
                    <div className="input-inline">
                      <span>Rate / Tyre (₹):</span>
                      <input
                        type="number"
                        className="inline-price-input"
                        value={item.ratePerTyre ?? 50}
                        onChange={(e) => updateServiceDetail('tyreRotation', 'ratePerTyre', e.target.value)}
                      />
                    </div>
                    <div className="input-inline">
                      <span>Tyres Count:</span>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={item.tyresCount || 4}
                        onChange={(e) => updateServiceDetail('tyreRotation', 'tyresCount', e.target.value)}
                      />
                      <span className="unit-tag">tyres</span>
                    </div>
                    <div className="pill-selector">
                      <button
                        type="button"
                        className={`sub-pill ${item.rotationPattern === 'Cross Pattern' ? 'active' : ''}`}
                        onClick={() => updateServiceDetail('tyreRotation', 'rotationPattern', 'Cross Pattern')}
                      >
                        Cross Pattern
                      </button>
                      <button
                        type="button"
                        className={`sub-pill ${item.rotationPattern === 'Front to Rear' ? 'active' : ''}`}
                        onClick={() => updateServiceDetail('tyreRotation', 'rotationPattern', 'Front to Rear')}
                      >
                        Front to Rear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Direct Flat Rate Services (Wheel Alignment, Camber, Buffing, Wash, Clean, Oil Change, Custom Services)
          return (
            <div key={key} className={`service-item-card ${isEnabled ? 'active' : ''}`}>
              <div className="service-card-top" onClick={() => toggleService(key)}>
                <div className="checkbox-title">
                  {isEnabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
                  <span className="service-title">
                    {displayName} {item.isCustom ? '⭐' : ''}
                  </span>
                </div>

                {/* SLEEK INLINE EDITABLE PRICE INPUT */}
                <div className="inline-price-edit-badge" onClick={(e) => e.stopPropagation()}>
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    className="inline-price-input"
                    value={item.price ?? 0}
                    onChange={(e) => updateServiceDetail(key, 'price', e.target.value)}
                    title="Click to edit rate for this bill"
                  />
                </div>
              </div>
            </div>
          );
        })}

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
