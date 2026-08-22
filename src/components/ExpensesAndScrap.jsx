import React, { useState } from 'react';
import { DollarSign, Coffee, Users, RefreshCw, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { addExpense, addSalaryRecord, addScrapSale } from '../utils/storage';

export default function ExpensesAndScrap({ expenses, setExpenses, salaries, setSalaries, scrapSales, setScrapSales }) {
  const [activeSubTab, setActiveSubTab] = useState('expenses'); // 'expenses' | 'salaries' | 'scrap'

  // Expense Form State
  const [expCategory, setExpCategory] = useState('Tea & Snacks');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Salary Form State
  const [staffName, setStaffName] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');

  // Scrap Form State
  const [scrapType, setScrapType] = useState('Scrap Rubber Tyres');
  const [scrapQty, setScrapQty] = useState('');
  const [scrapTotalAmount, setScrapTotalAmount] = useState('');

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expAmount || parseFloat(expAmount) <= 0) return;

    const newExp = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      category: expCategory,
      amount: parseFloat(expAmount),
      description: expDesc || expCategory,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = addExpense(newExp);
    setExpenses(updated);
    setExpAmount('');
    setExpDesc('');
  };

  const handleAddSalary = (e) => {
    e.preventDefault();
    if (!staffName || !baseSalary) return;

    const base = parseFloat(baseSalary) || 0;
    const adv = parseFloat(advanceAmount) || 0;

    const newSal = {
      id: `SAL-${Math.floor(1000 + Math.random() * 9000)}`,
      staffName,
      baseSalary: base,
      advanceTaken: adv,
      netPayout: Math.max(0, base - adv),
      month: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    };

    const updated = addSalaryRecord(newSal);
    setSalaries(updated);
    setStaffName('');
    setBaseSalary('');
    setAdvanceAmount('');
  };

  const handleAddScrapSale = (e) => {
    e.preventDefault();
    if (!scrapQty || !scrapTotalAmount) return;

    const newSale = {
      id: `SCRAP-${Math.floor(1000 + Math.random() * 9000)}`,
      type: scrapType,
      qty: parseInt(scrapQty, 10) || 1,
      totalAmount: parseFloat(scrapTotalAmount) || 0,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = addScrapSale(newSale);
    setScrapSales(updated);
    setScrapQty('');
    setScrapTotalAmount('');
  };

  // Today Expenses Total
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpTotal = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">💸 Expenses, Salaries & Scrap Tyre Sales</h2>
          <p className="section-desc">Track daily tea/snack expenses, staff monthly salaries, and old scrap tyre sales</p>
        </div>

        <div className="pill-selector">
          <button
            className={`sub-pill ${activeSubTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('expenses')}
          >
            ☕ Daily Expenses
          </button>
          <button
            className={`sub-pill ${activeSubTab === 'salaries' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('salaries')}
          >
            👥 Staff Salaries
          </button>
          <button
            className={`sub-pill ${activeSubTab === 'scrap' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('scrap')}
          >
            ♻️ Scrap & Used Tyres
          </button>
        </div>
      </div>

      {/* 1. DAILY SHOP EXPENSES TAB */}
      {activeSubTab === 'expenses' && (
        <>
          <div className="card-container">
            <div className="card-header">
              <Coffee className="card-icon" size={22} />
              <h2>Log Daily Shop Expenditure (Tea, Snacks, Spares)</h2>
            </div>

            <form onSubmit={handleAddExpense} className="grid-form">
              <div className="form-group">
                <label>Expense Category</label>
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                  <option value="Tea & Snacks">☕ Tea & Snacks</option>
                  <option value="Shop Maintenance">🔧 Shop Maintenance</option>
                  <option value="Tools & Spares">🛠️ Tools & Spares</option>
                  <option value="Electricity & Water">⚡ Electricity & Water</option>
                  <option value="Miscellaneous">📦 Miscellaneous</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expense Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Evening tea for 4 staff"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={18} />
                  <span>Save Expense Record</span>
                </button>
              </div>
            </form>
          </div>

          <div className="card-container margin-top">
            <div className="card-header">
              <FileText className="card-icon" size={22} />
              <h2>Daily Expenses Log History</h2>
              <span className="badge-chip info">Today's Expense: ₹{todayExpTotal.toLocaleString('en-IN')}</span>
            </div>

            {expenses.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No shop expenses logged yet.</p>
            ) : (
              <div className="leaderboard-list">
                {expenses.map((exp) => (
                  <div key={exp.id} className="history-log-row" style={{ background: 'var(--bg-app)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-white)' }}>{exp.category}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{exp.description} • {exp.date} {exp.time}</p>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--ruby-primary)', fontSize: '1.05rem' }}>
                      - ₹{exp.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 2. STAFF MONTHLY SALARIES TAB */}
      {activeSubTab === 'salaries' && (
        <>
          <div className="card-container">
            <div className="card-header">
              <Users className="card-icon" size={22} />
              <h2>Staff Monthly Salary & Advance Tracker</h2>
            </div>

            <form onSubmit={handleAddSalary} className="grid-form">
              <div className="form-group">
                <label>Staff / Mechanic Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma (Senior Mechanic)"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Base Monthly Salary (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 18000"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Advance Taken This Month (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={18} />
                  <span>Save Staff Salary Record</span>
                </button>
              </div>
            </form>
          </div>

          <div className="card-container margin-top">
            <div className="card-header">
              <Users className="card-icon" size={22} />
              <h2>Monthly Payroll Summary</h2>
              <span className="badge-chip info">{salaries.length} Staff Members</span>
            </div>

            {salaries.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No staff salary records created yet.</p>
            ) : (
              <div className="leaderboard-list">
                {salaries.map((sal) => (
                  <div key={sal.id} className="history-log-row" style={{ background: 'var(--bg-app)', padding: '14px 18px', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-white)', fontSize: '1rem' }}>{sal.staffName}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Month: {sal.month} • Base: ₹{sal.baseSalary} • Advance: ₹{sal.advanceTaken}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="summary-label">Net Payable: </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--yellow-primary)', fontSize: '1.1rem' }}>
                        ₹{sal.netPayout.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 3. SCRAP & USED TYRE SALES TAB */}
      {activeSubTab === 'scrap' && (
        <>
          <div className="card-container">
            <div className="card-header">
              <RefreshCw className="card-icon" size={22} />
              <h2>Record Scrap Tyre & Resale Tyre Income</h2>
            </div>

            <form onSubmit={handleAddScrapSale} className="grid-form">
              <div className="form-group">
                <label>Sale Category</label>
                <select value={scrapType} onChange={(e) => setScrapType(e.target.value)}>
                  <option value="Scrap Rubber Tyres">♻️ Scrap Rubber Tyres (Bulk)</option>
                  <option value="Resale Usable Old Tyre">🚗 Resale Usable Old Tyre</option>
                  <option value="Old Metal Rims">⚙️ Old Metal Rims / Scrap Steel</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity Sold *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10 tyres / 25 kg"
                  value={scrapQty}
                  onChange={(e) => setScrapQty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Revenue Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={scrapTotalAmount}
                  onChange={(e) => setScrapTotalAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={18} />
                  <span>Save Scrap Sale Income</span>
                </button>
              </div>
            </form>
          </div>

          <div className="card-container margin-top">
            <div className="card-header">
              <RefreshCw className="card-icon" size={22} />
              <h2>Scrap & Used Tyre Revenue History</h2>
              <span className="badge-chip success">Total Income: ₹{scrapSales.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString('en-IN')}</span>
            </div>

            {scrapSales.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No scrap tyre sales logged yet.</p>
            ) : (
              <div className="leaderboard-list">
                {scrapSales.map((s) => (
                  <div key={s.id} className="history-log-row" style={{ background: 'var(--bg-app)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-white)' }}>{s.type}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {s.qty} • Date: {s.date}</p>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--emerald-primary)', fontSize: '1.05rem' }}>
                      + ₹{s.totalAmount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
