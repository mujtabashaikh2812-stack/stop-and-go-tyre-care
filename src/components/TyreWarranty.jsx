import React, { useState } from 'react';
import {
  ShieldCheck, Plus, Search, Calendar, Phone, User, Car, Tag,
  FileText, Send, Printer, Trash2, CheckCircle2, Clock, AlertTriangle, X
} from 'lucide-react';
import LogoBanner from './LogoBanner';
import { TRANSLATIONS } from '../utils/i18n';
import { saveTyreWarranty, deleteTyreWarranty } from '../utils/storage';

export default function TyreWarranty({
  warranties = [],
  setWarranties,
  currentLang = 'en'
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Active' | 'Expired'
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(null); // Selected warranty object for thermal/whatsapp print

  // New Warranty Form State
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    vehicleNumber: '',
    vehicleName: '',
    brand: 'Bridgestone',
    customBrand: '',
    sizeSpec: '185/65 R15',
    customSize: '',
    serialNumber: '',
    quantity: 4,
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyYears: 3,
    warrantyType: 'Unconditional Warranty',
    notes: ''
  });

  // Common Tyre Brands & Sizes Options
  const TYRE_BRANDS = ['Bridgestone', 'MRF', 'Apollo', 'CEAT', 'Goodyear', 'Yokohama', 'Continental', 'JK Tyre', 'TVS Eurogrip', 'Custom'];
  const TYRE_SIZES = ['185/65 R15', '205/55 R16', '145/80 R12', '155/70 R13', '165/70 R14', '195/60 R15', '215/60 R17', '235/65 R17', 'Custom'];

  // Calculate Expiry Date & Status
  const getWarrantyDetails = (warranty) => {
    const pDate = new Date(warranty.purchaseDate);
    const expDate = new Date(pDate);
    expDate.setFullYear(expDate.getFullYear() + Number(warranty.warrantyYears || 3));

    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status = 'Active';
    if (diffDays <= 0) status = 'Expired';
    else if (diffDays <= 30) status = 'Expiring Soon';

    return {
      expiryDateStr: expDate.toISOString().split('T')[0],
      diffDays,
      status
    };
  };

  // Save Warranty Handler
  const handleSaveWarranty = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobile || !formData.vehicleNumber) {
      alert('Please fill customer name, mobile, and vehicle number!');
      return;
    }

    const brandName = formData.brand === 'Custom' ? formData.customBrand : formData.brand;
    const sizeSpec = formData.sizeSpec === 'Custom' ? formData.customSize : formData.sizeSpec;

    const newWarrantyObj = {
      id: `WAR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: formData.customerName,
      mobile: formData.mobile,
      vehicleNumber: formData.vehicleNumber.toUpperCase(),
      vehicleName: formData.vehicleName || 'Car',
      brand: brandName || 'Bridgestone',
      sizeSpec: sizeSpec || '185/65 R15',
      serialNumber: formData.serialNumber.toUpperCase() || `DOT-${Math.floor(1000 + Math.random() * 9000)}`,
      quantity: Number(formData.quantity) || 4,
      purchaseDate: formData.purchaseDate,
      warrantyYears: Number(formData.warrantyYears) || 3,
      warrantyType: formData.warrantyType,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    const updated = saveTyreWarranty(newWarrantyObj);
    setWarranties(updated);
    setShowAddModal(false);

    // Auto-Open Digital Certificate Modal
    setActiveCertificate(newWarrantyObj);

    // Reset Form
    setFormData({
      customerName: '',
      mobile: '',
      vehicleNumber: '',
      vehicleName: '',
      brand: 'Bridgestone',
      customBrand: '',
      sizeSpec: '185/65 R15',
      customSize: '',
      serialNumber: '',
      quantity: 4,
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyYears: 3,
      warrantyType: 'Unconditional Warranty',
      notes: ''
    });
  };

  const handleDeleteWarranty = (id) => {
    if (window.confirm('Are you sure you want to delete this warranty record?')) {
      const updated = deleteTyreWarranty(id);
      setWarranties(updated);
    }
  };

  // Filtered Warranties
  const filteredWarranties = warranties.filter(w => {
    const details = getWarrantyDetails(w);
    const matchesFilter = filterStatus === 'All' || details.status === filterStatus;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      w.customerName.toLowerCase().includes(term) ||
      w.mobile.includes(term) ||
      w.vehicleNumber.toLowerCase().includes(term) ||
      w.serialNumber.toLowerCase().includes(term) ||
      w.brand.toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  // WhatsApp Sender
  const sendWhatsAppWarranty = (warranty) => {
    const details = getWarrantyDetails(warranty);
    const msg =
      `*STOP %26 GO TOTAL TYRE CARE CENTRE*%0A` +
      `Beside Solapur Steel, Near Multani bakery, Hotgi road, Solapur.%0A` +
      `Ph: +91 95455 50087, +91 94031 36311%0A` +
      `------------------------------------%0A` +
      `🛡️ *OFFICIAL TYRE WARRANTY CERTIFICATE*%0A` +
      `------------------------------------%0A` +
      `📌 *Certificate No:* #${warranty.id}%0A` +
      `👤 *Customer:* ${warranty.customerName}%0A` +
      `🚘 *Vehicle:* ${warranty.vehicleName} (${warranty.vehicleNumber})%0A` +
      `🏷️ *Tyre Brand:* *${warranty.brand}*%0A` +
      `📏 *Size Spec:* ${warranty.sizeSpec}%0A` +
      `🔢 *Serial / DOT Code:* *${warranty.serialNumber}*%0A` +
      `📦 *Quantity:* ${warranty.quantity} Tyres%0A` +
      `📅 *Purchase Date:* ${warranty.purchaseDate}%0A` +
      `⏱️ *Warranty Period:* ${warranty.warrantyYears} Years (${warranty.warrantyType})%0A` +
      `🔴 *Warranty Expiry:* *${details.expiryDateStr}*%0A` +
      (warranty.notes ? `📝 *Note:* ${warranty.notes}%0A` : '') +
      `------------------------------------%0A` +
      `Thank you for trusting STOP %26 GO Tyre Care! 🚗💨`;

    const cleanMobile = warranty.mobile.replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanMobile}?text=${msg}`, '_blank');
  };

  return (
    <div className="tab-content-container">
      
      {/* Header & Controls Bar */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">🛡️ Tyre Spec & Warranty Tracker</h2>
          <p className="section-desc">Register tyre serial numbers, track manufacturer & unconditional warranties, and issue instant digital warranty slips</p>
        </div>

        <button
          type="button"
          className="btn-generate-bill"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          <span>Register Tyre Warranty</span>
        </button>
      </div>

      {/* Filter & Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Active', 'Expiring Soon', 'Expired'].map(st => (
            <button
              key={st}
              type="button"
              className={`sub-pill ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="search-box-wide" style={{ width: '300px', margin: 0 }}>
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search Customer, Reg No, Serial No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* Warranty Records Cards Grid */}
      <div className="customers-cards-grid">
        {filteredWarranties.length === 0 ? (
          <div className="no-results-card" style={{ gridColumn: '1 / -1' }}>
            <ShieldCheck size={40} className="text-muted" />
            <p>No tyre warranty registrations found.</p>
            <button type="button" className="btn-generate-bill" onClick={() => setShowAddModal(true)}>
              ➕ Register First Tyre Warranty
            </button>
          </div>
        ) : (
          filteredWarranties.map(warranty => {
            const details = getWarrantyDetails(warranty);

            return (
              <div key={warranty.id} className="customer-card">
                
                <div className="customer-card-header">
                  <div>
                    <span className="badge-chip info" style={{ marginBottom: '6px' }}>#{warranty.id}</span>
                    <h3 className="cust-name">👤 {warranty.customerName}</h3>
                    <div className="cust-phone"><Phone size={13} /> +91 {warranty.mobile}</div>
                  </div>

                  <span className={`visit-badge ${details.status === 'Active' ? 'ok' : details.status === 'Expiring Soon' ? 'warning' : 'danger'}`}>
                    {details.status === 'Active' && '🟢 Active'}
                    {details.status === 'Expiring Soon' && `🟡 Expires in ${details.diffDays} Days`}
                    {details.status === 'Expired' && '🔴 Expired'}
                  </span>
                </div>

                <div className="customer-card-details" style={{ marginTop: '12px' }}>
                  <div className="detail-line">
                    <Car size={14} className="detail-icon" />
                    <span>Vehicle: <strong>{warranty.vehicleName} ({warranty.vehicleNumber})</strong></span>
                  </div>

                  <div className="detail-line">
                    <Tag size={14} className="detail-icon" />
                    <span>Tyre: <strong style={{ color: 'var(--yellow-primary)' }}>{warranty.brand} {warranty.sizeSpec}</strong> ({warranty.quantity} Tyres)</span>
                  </div>

                  <div className="detail-line">
                    <FileText size={14} className="detail-icon" />
                    <span>Serial / DOT Code: <strong style={{ fontFamily: 'var(--font-mono)' }}>{warranty.serialNumber}</strong></span>
                  </div>

                  <div className="detail-line">
                    <Calendar size={14} className="detail-icon" />
                    <span>Purchase: <strong>{warranty.purchaseDate}</strong> (Valid till <strong>{details.expiryDateStr}</strong>)</span>
                  </div>

                  {warranty.notes && <div className="detail-line"><span style={{ color: 'var(--text-muted)' }}>Note: {warranty.notes}</span></div>}
                </div>

                {/* Card Action Buttons */}
                <div className="customer-card-footer" style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn-delete-icon"
                    onClick={() => handleDeleteWarranty(warranty.id)}
                    title="Delete Warranty Record"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => setActiveCertificate(warranty)}
                    >
                      <FileText size={13} /> View Slip
                    </button>

                    <button
                      type="button"
                      className="btn-whatsapp-sm"
                      onClick={() => sendWhatsAppWarranty(warranty)}
                    >
                      <Send size={13} /> WhatsApp
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW TYRE WARRANTY MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header-bar">
              <div className="modal-title">
                <ShieldCheck style={{ color: 'var(--yellow-primary)' }} size={22} />
                <span>Register Tyre Warranty & Serial Number</span>
              </div>
              <button className="close-modal-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveWarranty} className="grid-form" style={{ padding: '20px' }}>
              
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Aslam Khan"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9822011223"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Reg Number *</label>
                <input
                  type="text"
                  placeholder="e.g. MH-13-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Make / Model</label>
                <input
                  type="text"
                  placeholder="e.g. Maruti Swift / Creta"
                  value={formData.vehicleName}
                  onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Tyre Brand *</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                >
                  {TYRE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {formData.brand === 'Custom' && (
                <div className="form-group">
                  <label>Custom Brand Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Michelin / Falken"
                    value={formData.customBrand}
                    onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Tyre Size Spec *</label>
                <select
                  value={formData.sizeSpec}
                  onChange={(e) => setFormData({ ...formData, sizeSpec: e.target.value })}
                >
                  {TYRE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {formData.sizeSpec === 'Custom' && (
                <div className="form-group">
                  <label>Custom Size Spec *</label>
                  <input
                    type="text"
                    placeholder="e.g. 245/45 R18"
                    value={formData.customSize}
                    onChange={(e) => setFormData({ ...formData, customSize: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Serial / DOT Code Number *</label>
                <input
                  type="text"
                  placeholder="e.g. DOT-3824-AP9901"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity of Tyres *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Date *</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Warranty Duration *</label>
                <select
                  value={formData.warrantyYears}
                  onChange={(e) => setFormData({ ...formData, warrantyYears: Number(e.target.value) })}
                >
                  <option value={1}>1 Year Warranty</option>
                  <option value={2}>2 Years Warranty</option>
                  <option value={3}>3 Years Warranty (Standard)</option>
                  <option value={5}>5 Years Warranty (Unconditional)</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Warranty Coverage Type</label>
                <select
                  value={formData.warrantyType}
                  onChange={(e) => setFormData({ ...formData, warrantyType: e.target.value })}
                >
                  <option value="Unconditional Warranty">🛡️ Unconditional Warranty (Includes Cuts & Bulges)</option>
                  <option value="Manufacturing Defect Warranty">⚙️ Manufacturing Defect Warranty Only</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Special Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Registered with manufacturer bill #SG-2026-9901"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                  <ShieldCheck size={18} /> Register Warranty & Generate Slip
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DIGITAL WARRANTY CERTIFICATE (80mm Thermal Print & WhatsApp) */}
      {/* ========================================================================= */}
      {activeCertificate && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header-bar">
              <div className="modal-title">
                <ShieldCheck style={{ color: 'var(--yellow-primary)' }} size={22} />
                <span>Official Tyre Warranty Certificate</span>
              </div>
              <button className="close-modal-btn" onClick={() => setActiveCertificate(null)}><X size={20} /></button>
            </div>

            {/* Printable Thermal Receipt Area */}
            <div className="printable-receipt-area" id="printable-warranty-certificate">
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
              <div style={{ textAlign: 'center', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '1px' }}>
                🛡️ TYRE WARRANTY CERTIFICATE
              </div>
              <div className="receipt-divider">---------------------------------------------</div>

              <div className="receipt-meta">
                <div className="meta-row"><span>Certificate Ref: <strong>#{activeCertificate.id}</strong></span><span>Date: {activeCertificate.purchaseDate}</span></div>
                <div className="meta-row"><span>Customer: <strong>{activeCertificate.customerName}</strong></span><span>Ph: {activeCertificate.mobile}</span></div>
                <div className="meta-row"><span>Vehicle: <strong>{activeCertificate.vehicleName}</strong></span><span>Reg: <strong>{activeCertificate.vehicleNumber}</strong></span></div>
              </div>

              <div className="receipt-divider">---------------------------------------------</div>

              <div style={{ padding: '8px 0' }}>
                <div style={{ fontSize: '0.85rem' }}>TYRE BRAND & SPECIFICATION:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{activeCertificate.brand} {activeCertificate.sizeSpec}</div>
                <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>Serial / DOT Code: <strong style={{ fontFamily: 'var(--font-mono)' }}>{activeCertificate.serialNumber}</strong></div>
                <div style={{ fontSize: '0.88rem' }}>Quantity: <strong>{activeCertificate.quantity} Tyres</strong></div>
              </div>

              <div className="receipt-divider">---------------------------------------------</div>

              <div className="receipt-totals">
                <div className="total-row"><span>Warranty Coverage:</span><span>{activeCertificate.warrantyYears} Years ({activeCertificate.warrantyType})</span></div>
                <div className="total-row grand-total"><span>WARRANTY EXPIRY:</span><span>{getWarrantyDetails(activeCertificate).expiryDateStr}</span></div>
              </div>

              <div className="receipt-divider">---------------------------------------------</div>
              <div className="receipt-footer">
                <p>*** Keep This Slip For Warranty Claims ***</p>
                <p style={{ marginTop: '4px', fontSize: '0.75rem' }}>STOP & GO Total Tyre Care Centre, Solapur</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions-bar">
              <button
                className="btn-whatsapp-large"
                onClick={() => sendWhatsAppWarranty(activeCertificate)}
              >
                <Send size={18} />
                <span>Send Certificate via WhatsApp</span>
              </button>

              <button
                className="btn-print-large"
                onClick={() => window.print()}
              >
                <Printer size={18} />
                <span>Print Thermal Certificate</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
