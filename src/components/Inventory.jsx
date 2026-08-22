import React, { useState } from 'react';
import { Package, Plus, RefreshCw } from 'lucide-react';
import { updateInventoryItem } from '../utils/storage';

export default function Inventory({ inventory, setInventory }) {
  const [selectedItem, setSelectedItem] = useState(inventory[0]?.id || 'sticker_weights');
  const [addQty, setAddQty] = useState('');

  const handleRestock = (e) => {
    e.preventDefault();
    if (!selectedItem || !addQty || parseInt(addQty, 10) <= 0) return;

    const currentItem = inventory.find(i => i.id === selectedItem);
    const newStock = (currentItem?.inStock || 0) + parseInt(addQty, 10);
    
    const updated = updateInventoryItem(selectedItem, newStock);
    setInventory(updated);
    setAddQty('');
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Consumables & Tyre Shop Inventory</h2>
          <p className="section-desc">Track wheel weights, valves, and nitrogen gas levels in real-time. Stock auto-deducts as job cards are saved.</p>
        </div>
      </div>

      {/* Clean Inventory Stock Cards Grid */}
      <div className="inventory-cards-grid">
        {inventory.map(item => (
          <div key={item.id} className="inventory-card">
            <div className="inventory-card-top">
              <Package size={24} className="inv-icon" />
            </div>
            <h3 className="inv-name">{item.name}</h3>
            <div className="inv-qty-row">
              <span className="inv-qty">{item.inStock.toLocaleString('en-IN')}</span>
              <span className="inv-unit">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sleek Restock Form */}
      <div className="card-container margin-top">
        <div className="card-header">
          <RefreshCw className="card-icon" size={22} />
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

          <div className="form-group">
            <label style={{ visibility: 'hidden' }}>Submit</label>
            <button type="submit" className="btn-generate-bill" style={{ width: '100%', padding: '13px 20px' }}>
              <Plus size={18} />
              <span>Update Stock Level</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
