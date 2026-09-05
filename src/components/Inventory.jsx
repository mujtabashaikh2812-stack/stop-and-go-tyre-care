import React, { useState } from 'react';
import { Package, AlertCircle, Plus, RefreshCw, CheckCircle2, Trash2, Sparkles } from 'lucide-react';
import { updateInventoryItem, addInventoryItem, deleteInventoryItem } from '../utils/storage';
import { TRANSLATIONS } from '../utils/i18n';

export default function Inventory({ inventory, setInventory, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  // Restock Form State
  const [selectedItem, setSelectedItem] = useState(inventory[0]?.id || '');
  const [restockQty, setRestockQty] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('Pieces');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemReorder, setNewItemReorder] = useState('10');
  const [addSuccessMsg, setAddSuccessMsg] = useState('');

  const handleUpdateStock = (e) => {
    e.preventDefault();
    const qty = parseFloat(restockQty);
    if (isNaN(qty)) return;

    const targetId = selectedItem || inventory[0]?.id;
    const currentItem = inventory.find(i => i.id === targetId);
    const newStock = Math.max(0, (currentItem?.inStock || 0) + qty);
    
    const updated = updateInventoryItem(targetId, newStock);
    setInventory(updated);
    setRestockQty('');
    setSuccessMsg(`Successfully updated stock for ${currentItem?.name || 'Item'}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newItemName) return;

    const updated = addInventoryItem(newItemName, newItemUnit, newItemStock, newItemReorder);
    setInventory(updated);
    setNewItemName('');
    setNewItemStock('');
    setAddSuccessMsg(`New stock item "${newItemName}" added successfully!`);
    setTimeout(() => setAddSuccessMsg(''), 3000);
  };

  const handleDeleteItem = (id, name) => {
    if (window.confirm(`Are you sure you want to delete stock item "${name}"?`)) {
      const updated = deleteInventoryItem(id);
      setInventory(updated);
      if (selectedItem === id && updated.length > 0) {
        setSelectedItem(updated[0].id);
      }
    }
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
          const isLowStock = item.inStock <= (item.reorderLevel || 10);
          return (
            <div key={item.id} className={`inventory-card ${isLowStock ? 'low-stock' : ''}`} style={{ position: 'relative' }}>
              
              <div className="inventory-card-top" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package className="inv-icon" size={24} />
                  {isLowStock && (
                    <span className="low-badge">
                      <AlertCircle size={12} /> Low Stock Alert
                    </span>
                  )}
                </div>

                {/* DELETE INVENTORY ITEM BUTTON */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id, item.name)}
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
                  title="Delete this stock item"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

              <h3 className="inv-name">{item.name}</h3>
              <div className="inv-qty-row">
                <span className="inv-qty">{item.inStock.toLocaleString('en-IN')}</span>
                <span className="inv-unit">{item.unit}</span>
              </div>
              <p className="inv-alert-info">Reorder alert trigger at {item.reorderLevel || 10} {item.unit}</p>
            </div>
          );
        })}
      </div>

      {/* TWO COLUMN CARDS: 1. ADD NEW STOCK ITEM | 2. RESTOCK ITEM */}
      <div className="analytics-two-col margin-top">
        
        {/* CARD 1: ADD NEW STOCK ITEM */}
        <div className="card-container" style={{ border: '1px dashed var(--yellow-primary)' }}>
          <div className="card-header">
            <Plus className="card-icon" size={22} />
            <h2>➕ Add New Inventory Item</h2>
            {addSuccessMsg && (
              <span className="badge-chip success" style={{ marginLeft: 'auto' }}>
                <Sparkles size={12} /> {addSuccessMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleAddNewItem} className="grid-form">
            <div className="form-group">
              <label>Stock Item Name *</label>
              <input
                type="text"
                placeholder="e.g. 14 Inch Inner Tubes, Tyre Polish Spray"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t.unitOfMeasurement || 'Unit of Measurement'} *</label>
              <select value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)}>
                <option value="Pieces">🧩 {t.unitPieces || 'Pieces (pcs)'}</option>
                <option value="Grams">⚖️ {t.unitGrams || 'Grams (g)'}</option>
                <option value="kg">🏋️ {t.unitKg || 'Kilograms (kg)'}</option>
                <option value="Boxes">📦 {t.unitBoxes || 'Boxes (box)'}</option>
                <option value="Liters">🧴 {t.unitLiters || 'Liters (L)'}</option>
                <option value="Units">🏷️ {t.unitUnits || 'Units (units)'}</option>
              </select>
            </div>

            <div className="form-group">
              <label>Initial Stock Quantity</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={newItemStock}
                onChange={(e) => setNewItemStock(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Low Stock Alert Trigger Level</label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={newItemReorder}
                onChange={(e) => setNewItemReorder(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={18} />
                <span>Create & Add Stock Item</span>
              </button>
            </div>
          </form>
        </div>

        {/* CARD 2: RESTOCK / UPDATE EXISTING STOCK LEVEL */}
        <div className="card-container">
          <div className="card-header">
            <RefreshCw className="card-icon" size={22} />
            <h2>{t.restockItem}</h2>
            {successMsg && (
              <span className="badge-chip success" style={{ marginLeft: 'auto' }}>
                <CheckCircle2 size={12} /> {successMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateStock} className="grid-form">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>{t.selectInventoryItem || 'Select Inventory Item'}</label>
              <select
                value={selectedItem || inventory[0]?.id}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    📦 {item.name} ({t.itemInStock || 'In Stock'}: {item.inStock} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Quantity to Add (Use negative number to deduct)</label>
              <input
                type="number"
                placeholder="e.g. 500 or -100"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={18} />
                <span>{t.updateStockBtn}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
