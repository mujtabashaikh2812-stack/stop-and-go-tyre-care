import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Key, ShieldCheck, Plus, Sparkles, Trash2 } from 'lucide-react';
import { saveServicePrices, getAdminPassword, saveAdminPassword, addCustomService, deleteCustomService } from '../utils/storage';
import { TRANSLATIONS } from '../utils/i18n';

export default function ServicePriceEditor({ services, setServices, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  const [editedServices, setEditedServices] = useState({ ...services });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Custom Password State
  const [adminPwd, setAdminPwd] = useState(getAdminPassword());
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Add New Custom Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [customSuccess, setCustomSuccess] = useState('');

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

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!adminPwd || adminPwd.length < 4) {
      alert('Admin password must be at least 4 characters long.');
      return;
    }
    saveAdminPassword(adminPwd);
    setPwdSuccess('Admin Password updated successfully!');
    setTimeout(() => setPwdSuccess(''), 3000);
  };

  const handleAddCustomService = (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;

    const updatedMaster = addCustomService(newServiceName, newServicePrice);
    setServices(updatedMaster);
    setEditedServices(updatedMaster);
    setNewServiceName('');
    setNewServicePrice('');
    setCustomSuccess(`Custom Service "${newServiceName}" added successfully!`);
    setTimeout(() => setCustomSuccess(''), 3000);
  };

  const handleDeleteService = (serviceKey, serviceName) => {
    if (window.confirm(`Are you sure you want to delete service "${serviceName}" from Master Prices?`)) {
      const updatedMaster = deleteCustomService(serviceKey);
      setServices(updatedMaster);
      setEditedServices(updatedMaster);
    }
  };

  const serviceEntries = Object.entries(editedServices);

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">{t.masterPricesTitle}</h2>
          <p className="section-desc">{t.masterPricesDesc}</p>
        </div>

        {savedSuccess && (
          <div className="badge-chip success" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            <CheckCircle2 size={16} /> Prices Updated Successfully!
          </div>
        )}
      </div>

      {/* 🔐 Admin Password Customization Card */}
      <div className="card-container" style={{ border: '1px solid var(--yellow-primary)', marginBottom: '24px' }}>
        <div className="card-header">
          <Key className="card-icon" size={22} style={{ color: 'var(--yellow-primary)' }} />
          <h2>{t.changePassword}</h2>
          {pwdSuccess && (
            <span className="badge-chip success" style={{ marginLeft: 'auto' }}>
              <CheckCircle2 size={14} /> Password Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSavePassword} className="restock-form">
          <div className="form-group">
            <label><Key size={14} /> New Admin Password</label>
            <input
              type="text"
              placeholder="Enter new admin password"
              value={adminPwd}
              onChange={(e) => setAdminPwd(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ visibility: 'hidden' }}>Save Password</label>
            <button type="submit" className="btn-generate-bill" style={{ padding: '12px 20px' }}>
              <ShieldCheck size={18} />
              <span>Update Admin Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* ➕ ADD NEW CUSTOM SERVICE CARD */}
      <div className="card-container" style={{ border: '1px dashed var(--yellow-primary)', marginBottom: '24px' }}>
        <div className="card-header">
          <Plus className="card-icon" size={22} />
          <h2>{t.addCustomServiceTitle}</h2>
          {customSuccess && (
            <span className="badge-chip success" style={{ marginLeft: 'auto' }}>
              <Sparkles size={14} /> {customSuccess}
            </span>
          )}
        </div>

        <form onSubmit={handleAddCustomService} className="grid-form">
          <div className="form-group">
            <label>Custom Service Name *</label>
            <input
              type="text"
              placeholder="e.g. Brake Pad Replacement, 3D Wheel Alignment"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Base Price / Rate (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 850"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} />
              <span>Create & Save Custom Service</span>
            </button>
          </div>
        </form>
      </div>

      {/* Master Service Prices Editor Form (All Services with Delete Buttons) */}
      <form onSubmit={handleSavePrices} className="card-container">
        
        <div className="card-header">
          <Settings className="card-icon" size={22} />
          <h2>All Master Service Rates ({serviceEntries.length} Total Services)</h2>
        </div>

        <div className="services-grid" style={{ marginBottom: '24px' }}>

          {serviceEntries.map(([key, item]) => {
            const displayName = item.name || key;

            if (key === 'wheelBalancing') {
              return (
                <div key={key} className="service-item-card active">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--yellow-primary)' }}>
                      2. Wheel Balancing Rate (Per Tyre)
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(key, 'Wheel Balancing')}
                      style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--ruby-primary)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      title="Delete this service"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Fees Per Tyre (₹)</label>
                    <input
                      type="number"
                      value={item.pricePerTyre || 50}
                      onChange={(e) => handlePriceChange('wheelBalancing', 'pricePerTyre', e.target.value)}
                      required
                    />
                  </div>
                </div>
              );
            }

            if (key === 'weight') {
              return (
                <div key={key} className="service-item-card active">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--yellow-primary)' }}>
                      3. Wheel Weight Pricing (Per Gram)
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(key, 'Wheel Weight')}
                      style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--ruby-primary)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      title="Delete this service"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                  <div className="grid-form">
                    <div className="form-group">
                      <label>Sticker Weight (₹/g)</label>
                      <input
                        type="number"
                        value={item.stickerRate || 4}
                        onChange={(e) => handlePriceChange('weight', 'stickerRate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Brass Weight (₹/g)</label>
                      <input
                        type="number"
                        value={item.brassRate || 2}
                        onChange={(e) => handlePriceChange('weight', 'brassRate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            }

            if (key === 'tyreFitting') {
              return (
                <div key={key} className="service-item-card active">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--yellow-primary)' }}>
                      4. Tyre Fitting & Valve Rates
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(key, 'Tyre Fitting')}
                      style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--ruby-primary)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      title="Delete this service"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                  <div className="grid-form">
                    <div className="form-group">
                      <label>Rim 12, 13, 14, 15 Rate (₹)</label>
                      <input
                        type="number"
                        value={item.smallRimRate || 100}
                        onChange={(e) => handlePriceChange('tyreFitting', 'smallRimRate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Rim 16, 17, 18 Rate (₹)</label>
                      <input
                        type="number"
                        value={item.largeRimRate || 125}
                        onChange={(e) => handlePriceChange('tyreFitting', 'largeRimRate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            }

            if (key === 'airFilling') {
              return (
                <div key={key} className="service-item-card active">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--yellow-primary)' }}>
                      7. Air Filling Rates
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(key, 'Air Filling')}
                      style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--ruby-primary)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      title="Delete this service"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                  <div className="grid-form">
                    <div className="form-group">
                      <label>Nitrogen Full Fill (₹)</label>
                      <input
                        type="number"
                        value={item.nitrogenFullPrice || 150}
                        onChange={(e) => handlePriceChange('airFilling', 'nitrogenFullPrice', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Nitrogen Top-Up (₹)</label>
                      <input
                        type="number"
                        value={item.nitrogenTopupPrice || 50}
                        onChange={(e) => handlePriceChange('airFilling', 'nitrogenTopupPrice', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={key} className="service-item-card active">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--yellow-primary)' }}>
                    {displayName} {item.isCustom ? '⭐ (Custom Service)' : ''}
                  </h3>

                  {/* RED DELETE SERVICE BUTTON ON ALL SERVICE CARDS */}
                  <button
                    type="button"
                    onClick={() => handleDeleteService(key, displayName)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: 'var(--ruby-primary)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="Delete this service"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="form-group">
                  <label>Base Price Rate (₹)</label>
                  <input
                    type="number"
                    value={item.price || 0}
                    onChange={(e) => handlePriceChange(key, 'price', e.target.value)}
                    required
                  />
                </div>
              </div>
            );
          })}

        </div>

        <div className="billing-summary-footer" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-generate-bill" style={{ fontSize: '1rem', padding: '14px 28px' }}>
            <Save size={20} />
            <span>{t.saveAllPricesBtn}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
