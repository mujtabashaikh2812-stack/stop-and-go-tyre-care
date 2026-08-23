import React, { useState } from 'react';
import { Package, AlertCircle, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { updateInventoryItem } from '../utils/storage';
import { TRANSLATIONS } from '../utils/i18n';

export default function Inventory({ inventory, setInventory, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  const [selectedItem, setSelectedItem] = useState(inventory[0]?.id || 'sticker_weights');
  const [restockQty, setRestockQty] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateStock = (e) => {
    e.preventDefault();
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty)) return;

    const currentItem = inventory.find(i => i.id === selectedItem);
    const newStock = Math.max(0, (currentItem?.inStock || 0) + qty);
    
    const updated = updateInventoryItem(selectedItem, newStock);
    setInventory(updated);
    setRestockQty('');
    setSuccessMsg(`Successfully updated stock for ${currentItem?.name}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">{t.inventoryTitle}</h2>
          <p className="section-desc">{t.inventoryDesc}</p>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="inventory-cards-grid">
        {inventory.map(item => {
          const isLowStock = item.inStock <= item.reorderLevel;
          return (
            <div key={item.id} className={`inventory-card ${isLowStock ? 'low-stock' : ''}`}>
              <div className="inventory-card-top">
                <Package className="inv-icon" size={24} />
                {isLowStock && (
                  <span className="low-badge">
                    <AlertCircle size={12} /> Low Stock Alert
                  </span>
                )}
              </div>
              <h3 className="inv-name">{item.name}</h3>
              <div className="inv-qty-row">
                <span className="inv-qty">{item.inStock.toLocaleString('en-IN')}</span>
                <span className="inv-unit">{item.unit}</span>
              </div>
              <p className="inv-alert-info">Reorder alert trigger at {item.reorderLevel} {item.unit}</p>
            </div>
          );
        })}
      </div>

      {/* Restock & Inventory Update Form */}
      <div className="card-container margin-top">
        <div className="card-header">
          <RefreshCw className="card-icon" size={22} />
          <h2>{t.restockItem}</h2>
          {successMsg && (
            <span className="badge-chip success">
              <CheckCircle2 size={12} /> {successMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateStock} className="restock-form">
          <div className="form-group">
            <label>Select Inventory Item</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({t.itemInStock}: {item.inStock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity to Add (Use negative number to deduct)</label>
            <input
              type="number"
              placeholder="e.g. 500 or -100"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <button type="submit" className="btn-generate-bill" style={{ padding: '12px 24px' }}>
              <Plus size={18} />
              <span>{t.updateStockBtn}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
