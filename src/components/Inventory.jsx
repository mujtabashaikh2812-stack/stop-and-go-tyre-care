import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { updateInventoryItem } from '../utils/storage';

export default function Inventory({ inventory, setInventory }) {
  const [selectedItem, setSelectedItem] = useState(inventory[0]?.id || '');
  const [addQty, setAddQty] = useState('');

  const handleRestock = (e) => {
    e.preventDefault();
    if (!selectedItem || !addQty || parseInt(addQty, 10) <= 0) return;

    const currentItem = inventory.find(i => i.id === selectedItem);
    const newStock = currentItem.inStock + parseInt(addQty, 10);
    
    const updated = updateInventoryItem(selectedItem, newStock);
    setInventory(updated);
    setAddQty('');
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Consumables & Tyre Shop Inventory</h2>
          <p className="section-desc">Track wheel weights, valves, and nitrogen gas levels. Stock auto-deducts when bills are saved.</p>
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="inventory-cards-grid">
        {inventory.map(item => {
          const isLow = item.inStock <= item.minAlert;
          return (
            <div key={item.id} className={`inventory-card ${isLow ? 'low-stock' : ''}`}>
              <div className="inventory-card-top">
                <Package size={22} className="inv-icon" />
                {isLow && (
                  <span className="low-badge">
                    <AlertTriangle size={12} /> Low Stock Alert
                  </span>
                )}
              </div>
              <h3 className="inv-name">{item.name}</h3>
              <div className="inv-qty-row">
                <span className="inv-qty">{item.inStock.toLocaleString('en-IN')}</span>
                <span className="inv-unit">{item.unit}</span>
              </div>
              <p className="inv-alert-info">Minimum Alert Level: {item.minAlert} {item.unit}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Restock Form */}
      <div className="card-container margin-top">
        <div className="card-header">
          <RefreshCw className="card-icon" size={20} />
          <h2>Restock Consumable Inventory</h2>
        </div>

        <form onSubmit={handleRestock} className="restock-form">
          <div className="form-group">
            <label>Select Item to Restock</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Current: {item.inStock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity to Add</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 500"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-action-primary glow inline-btn">
            <Plus size={18} />
            <span>Update Stock Level</span>
          </button>
        </form>
      </div>

    </div>
  );
}
