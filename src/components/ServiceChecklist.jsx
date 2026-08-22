import React from 'react';
import { CheckSquare, Square, FileText, Send } from 'lucide-react';

export default function ServiceChecklist({ services, setServices, discount, setDiscount, onGenerateInvoice }) {
  
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

  // Compute itemized prices
  const getItemPrice = (key, item) => {
    if (!item?.enabled) return 0;

    switch (key) {
      case 'wheelAlignment':
        return item.price;
      case 'wheelBalancing':
        return item.type === 'two' ? item.priceTwo : item.priceFour;
      case 'weight':
        return (parseInt(item.grams, 10) || 0) * item.pricePerGram;
      case 'tyreFitting':
        const fitAmt = (parseInt(item.fittingQty, 10) || 0) * item.fittingRate;
        const valveAmt = item.newValve ? (parseInt(item.valveQty, 10) || 0) * (parseInt(item.valveRate, 10) || 0) : 0;
        return fitAmt + valveAmt;
      case 'tyreRotation':
        return item.price;
      case 'headlightBuffing':
        return item.price;
      case 'airFilling':
        return item.airType === 'nitrogen' ? item.price : 40;
      case 'tubelessPuncher':
        return (parseInt(item.qty, 10) || 0) * item.pricePerPuncher;
      case 'camberSetting':
        if (item.position === 'both') return item.priceBoth;
        return item.priceFront;
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
        <h2>02. Tyre Care Service Selection (Exact Receipt Slip Items)</h2>
        <span className="badge-chip info">9 Official Services</span>
      </div>

      <div className="services-grid">

        {/* 1. Wheel Alignment */}
        <div className={`service-item-card ${services.wheelAlignment?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('wheelAlignment')}>
            <div className="checkbox-title">
              {services.wheelAlignment?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">1. Wheel Alignment</span>
            </div>
            <span className="service-price">₹{services.wheelAlignment?.price || 350}</span>
          </div>
        </div>

        {/* 2. Wheel Balancing */}
        <div className={`service-item-card ${services.wheelBalancing?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('wheelBalancing')}>
            <div className="checkbox-title">
              {services.wheelBalancing?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">2. Wheel Balancing (Tyre Testing)</span>
            </div>
            <span className="service-price">
              ₹{services.wheelBalancing?.type === 'two' ? services.wheelBalancing?.priceTwo : services.wheelBalancing?.priceFour}
            </span>
          </div>
          {services.wheelBalancing?.enabled && (
            <div className="service-options-row">
              <label className={`option-pill ${services.wheelBalancing?.type === 'two' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="balancingType"
                  checked={services.wheelBalancing?.type === 'two'}
                  onChange={() => updateServiceDetail('wheelBalancing', 'type', 'two')}
                />
                Two Tyre (₹{services.wheelBalancing?.priceTwo})
              </label>
              <label className={`option-pill ${services.wheelBalancing?.type === 'four' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="balancingType"
                  checked={services.wheelBalancing?.type === 'four'}
                  onChange={() => updateServiceDetail('wheelBalancing', 'type', 'four')}
                />
                Four Tyre (₹{services.wheelBalancing?.priceFour})
              </label>
            </div>
          )}
        </div>

        {/* 3. Weight */}
        <div className={`service-item-card ${services.weight?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('weight')}>
            <div className="checkbox-title">
              {services.weight?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">3. Wheel Weight</span>
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
                  Sticker Weight
                </button>
                <button
                  type="button"
                  className={`sub-pill ${services.weight?.weightType === 'brass' ? 'active' : ''}`}
                  onClick={() => updateServiceDetail('weight', 'weightType', 'brass')}
                >
                  Brass Weight
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
                <span className="unit-tag">g (@ ₹{services.weight?.pricePerGram}/g)</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Tyre Fitting & Valves */}
        <div className={`service-item-card ${services.tyreFitting?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('tyreFitting')}>
            <div className="checkbox-title">
              {services.tyreFitting?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">4. Tyre Fitting & Valves</span>
            </div>
            <span className="service-price">₹{getItemPrice('tyreFitting', services.tyreFitting)}</span>
          </div>
          {services.tyreFitting?.enabled && (
            <div className="service-options-row vertical">
              <div className="input-inline">
                <span>Fitting Qty:</span>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={services.tyreFitting?.fittingQty || 1}
                  onChange={(e) => updateServiceDetail('tyreFitting', 'fittingQty', e.target.value)}
                />
                <span className="unit-tag">tyres (@ ₹{services.tyreFitting?.fittingRate}/tyre)</span>
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
                    <span>Amt: ₹{(parseInt(services.tyreFitting?.valveQty, 10) || 0) * services.tyreFitting?.valveRate}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5. Tyre Rotation */}
        <div className={`service-item-card ${services.tyreRotation?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('tyreRotation')}>
            <div className="checkbox-title">
              {services.tyreRotation?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">5. Tyre Rotation</span>
            </div>
            <span className="service-price">₹{services.tyreRotation?.price || 150}</span>
          </div>
        </div>

        {/* 6. Head Light Buffing */}
        <div className={`service-item-card ${services.headlightBuffing?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('headlightBuffing')}>
            <div className="checkbox-title">
              {services.headlightBuffing?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">6. Head Light Buffing (Cleaning)</span>
            </div>
            <span className="service-price">₹{services.headlightBuffing?.price || 350}</span>
          </div>
        </div>

        {/* 7. Air Filling */}
        <div className={`service-item-card ${services.airFilling?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('airFilling')}>
            <div className="checkbox-title">
              {services.airFilling?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">7. Air Filling</span>
            </div>
            <span className="service-price">₹{getItemPrice('airFilling', services.airFilling)}</span>
          </div>
          {services.airFilling?.enabled && (
            <div className="service-options-row">
              <label className={`option-pill ${services.airFilling?.airType === 'nitrogen' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="airType"
                  checked={services.airFilling?.airType === 'nitrogen'}
                  onChange={() => updateServiceDetail('airFilling', 'airType', 'nitrogen')}
                />
                Nitrogen Air (₹{services.airFilling?.price || 80})
              </label>
              <label className={`option-pill ${services.airFilling?.airType === 'normal' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="airType"
                  checked={services.airFilling?.airType === 'normal'}
                  onChange={() => updateServiceDetail('airFilling', 'airType', 'normal')}
                />
                Normal Air (₹40)
              </label>
            </div>
          )}
        </div>

        {/* 8. Tubeless Puncher */}
        <div className={`service-item-card ${services.tubelessPuncher?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('tubelessPuncher')}>
            <div className="checkbox-title">
              {services.tubelessPuncher?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">8. Tubeless Puncher (Puncture Repair)</span>
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
                <span className="unit-tag">repairs (@ ₹{services.tubelessPuncher?.pricePerPuncher}/each)</span>
              </div>
            </div>
          )}
        </div>

        {/* 9. Camber Setting */}
        <div className={`service-item-card ${services.camberSetting?.enabled ? 'active' : ''}`}>
          <div className="service-card-top" onClick={() => toggleService('camberSetting')}>
            <div className="checkbox-title">
              {services.camberSetting?.enabled ? <CheckSquare className="check-icon active" size={20} /> : <Square className="check-icon" size={20} />}
              <span className="service-title">9. Camber Setting</span>
            </div>
            <span className="service-price">₹{getItemPrice('camberSetting', services.camberSetting)}</span>
          </div>
          {services.camberSetting?.enabled && (
            <div className="service-options-row">
              <label className={`option-pill ${services.camberSetting?.position === 'front' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="camberPos"
                  checked={services.camberSetting?.position === 'front'}
                  onChange={() => updateServiceDetail('camberSetting', 'position', 'front')}
                />
                Front R/L (₹{services.camberSetting?.priceFront})
              </label>
              <label className={`option-pill ${services.camberSetting?.position === 'rear' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="camberPos"
                  checked={services.camberSetting?.position === 'rear'}
                  onChange={() => updateServiceDetail('camberSetting', 'position', 'rear')}
                />
                Rear R/L (₹{services.camberSetting?.priceRear})
              </label>
              <label className={`option-pill ${services.camberSetting?.position === 'both' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="camberPos"
                  checked={services.camberSetting?.position === 'both'}
                  onChange={() => updateServiceDetail('camberSetting', 'position', 'both')}
                />
                Both Front & Rear (₹{services.camberSetting?.priceBoth})
              </label>
            </div>
          )}
        </div>

      </div>

      {/* Billing Summary Footer with 2 Distinct Action Buttons */}
      <div className="billing-summary-footer">
        <div className="summary-totals-group">
          <div className="summary-col">
            <span className="summary-label">Subtotal:</span>
            <span className="summary-val">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-col">
            <span className="summary-label">Discount:</span>
            <input
              type="number"
              className="discount-input"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="summary-col grand-total-col">
            <span className="summary-label">Grand Total:</span>
            <span className="grand-total-val">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* TWO SEPARATE BILLING OPTIONS REQUIRED BY USER */}
        <div className="dual-billing-buttons">
          <button
            type="button"
            onClick={() => onGenerateInvoice('bill')}
            className="btn-generate-bill"
            disabled={subtotal === 0}
          >
            <FileText size={18} />
            <span>Generate Bill</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateInvoice('whatsapp')}
            className="btn-generate-whatsapp"
            disabled={subtotal === 0}
          >
            <Send size={18} />
            <span>Generate Digital Receipt & WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
