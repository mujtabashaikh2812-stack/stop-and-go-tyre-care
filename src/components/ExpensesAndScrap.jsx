import React, { useState } from 'react';
import { Coffee, DollarSign, Users, RefreshCw, Plus, CheckCircle2 } from 'lucide-react';
import { addExpense, addSalaryRecord, addScrapSale } from '../utils/storage';
import { TRANSLATIONS } from '../utils/i18n';

export default function ExpensesAndScrap({
  expenses, setExpenses,
  salaries, setSalaries,
  scrapSales, setScrapSales,
  currentLang = 'en'
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  // Expense Form State
  const [expCategory, setExpCategory] = useState('Tea & Snacks');
  const [expAmount, setExpAmount] = useState('');
  const [expNote, setExpNote] = useState('');
  const [expSuccess, setExpSuccess] = useState('');

  // Salary Form State
  const [staffName, setStaffName] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [advanceAmt, setAdvanceAmt] = useState('');
  const [salSuccess, setSalSuccess] = useState('');

  // Scrap Sale Form State
  const [scrapQty, setScrapQty] = useState('');
  const [scrapRate, setScrapRate] = useState('');
  const [scrapType, setScrapType] = useState('Scrap Rubber Tyres');
  const [scrapSuccess, setScrapSuccess] = useState('');

  const handleAddExpense = (e) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newExp = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      amount: amt,
      note: expNote || expCategory
    };

    const updated = addExpense(newExp);
    setExpenses(updated);
    setExpAmount('');
    setExpNote('');
    setExpSuccess('Expense Logged Successfully!');
    setTimeout(() => setExpSuccess(''), 3000);
  };

  const handleAddSalary = (e) => {
    e.preventDefault();
    if (!staffName || !baseSalary) return;

    const base = parseFloat(baseSalary) || 0;
    const adv = parseFloat(advanceAmt) || 0;
    const net = Math.max(0, base - adv);

    const newSal = {
      id: `SAL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      staffName,
      baseSalary: base,
      advance: adv,
      netPayout: net
    };

    const updated = addSalaryRecord(newSal);
    setSalaries(updated);
    setStaffName('');
    setBaseSalary('');
    setAdvanceAmt('');
    setSalSuccess('Staff Salary Record Saved!');
    setTimeout(() => setSalSuccess(''), 3000);
  };

  const handleAddScrapSale = (e) => {
    e.preventDefault();
    const q = parseInt(scrapQty, 10);
    const r = parseFloat(scrapRate);
    if (isNaN(q) || isNaN(r)) return;

    const total = q * r;
    const newScrap = {
      id: `SCRAP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      itemType: scrapType,
      quantity: q,
      ratePerUnit: r,
      totalAmount: total
    };

    const updated = addScrapSale(newScrap);
    setScrapSales(updated);
    setScrapQty('');
    setScrapRate('');
    setScrapSuccess('Scrap Sale Income Logged!');
    setTimeout(() => setScrapSuccess(''), 3000);
  };

  return (
    <div className="tab-content-container">
      
      <div className="section-header-row">
        <div>
          <h2 className="section-title">{t.expensesTitle}</h2>
          <p className="section-desc">{t.expensesDesc}</p>
        </div>
      </div>

      <div className="analytics-two-col">

        {/* 1. Daily Shop Expenses Card */}
        <div className="card-container">
          <div className="card-header">
            <Coffee className="card-icon" size={22} />
            <h2>{t.logExpense}</h2>
            {expSuccess && (
              <span className="badge-chip success">
                <CheckCircle2 size={12} /> {expSuccess}
              </span>
            )}
          </div>

          <form onSubmit={handleAddExpense} className="grid-form">
            <div className="form-group">
              <label>Expense Category</label>
              <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                <option value="Tea & Snacks">{t.categoryTea}</option>
                <option value="Shop Maintenance">{t.categoryMaintenance}</option>
                <option value="Tools & Spares">{t.categorySpares}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t.expenseAmount}</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Notes / Description</label>
              <input
                type="text"
                placeholder="e.g. Evening tea for staff and customers"
                value={expNote}
                onChange={(e) => setExpNote(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={18} />
                <span>{t.addExpenseBtn}</span>
              </button>
            </div>
          </form>

          {/* Expense Log History */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>Recent Expenses</h3>
            {expenses.slice(0, 5).map(e => (
              <div key={e.id} className="history-log-row">
                <div>
                  <span className="log-id">{e.id}</span>
                  <span className="service-tag">{e.category}</span>
                  <span className="log-date">{e.date}</span>
                </div>
                <span className="log-amount" style={{ color: 'var(--ruby-primary)' }}>-₹{e.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Staff Monthly Salary Manager */}
        <div className="card-container">
          <div className="card-header">
            <Users className="card-icon" size={22} />
            <h2>{t.staffSalaries}</h2>
            {salSuccess && (
              <span className="badge-chip success">
                <CheckCircle2 size={12} /> {salSuccess}
              </span>
            )}
          </div>

          <form onSubmit={handleAddSalary} className="grid-form">
            <div className="form-group">
              <label>Staff Member Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Worker"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Monthly Base Salary (₹)</label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Advance Taken (₹)</label>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={advanceAmt}
                onChange={(e) => setAdvanceAmt(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={18} />
                <span>Save Salary Payout</span>
              </button>
            </div>
          </form>

          {/* Salary Records List */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>Recent Salary Payouts</h3>
            {salaries.slice(0, 5).map(s => (
              <div key={s.id} className="history-log-row">
                <div>
                  <strong style={{ color: 'var(--text-white)' }}>{s.staffName}</strong>
                  <span className="log-date" style={{ marginLeft: '10px' }}>Adv: ₹{s.advance}</span>
                </div>
                <span className="log-amount text-gold">Net Payout: ₹{s.netPayout.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Scrap Tyre & Resale Income Register */}
      <div className="card-container margin-top">
        <div className="card-header">
          <RefreshCw className="card-icon" size={22} />
          <h2>{t.scrapSales}</h2>
          {scrapSuccess && (
            <span className="badge-chip success">
              <CheckCircle2 size={12} /> {scrapSuccess}
            </span>
          )}
        </div>

        <form onSubmit={handleAddScrapSale} className="grid-form">
          <div className="form-group">
            <label>Item / Tyre Type</label>
            <select value={scrapType} onChange={(e) => setScrapType(e.target.value)}>
              <option value="Scrap Rubber Tyres">Scrap Rubber Bulk Tyres</option>
              <option value="Old Used Tyre Resale">Old Used Tyre Resale</option>
              <option value="Scrap Brass & Lead Weights">Scrap Brass & Lead Weights</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantity / Weight (Qty or kg)</label>
            <input
              type="number"
              placeholder="e.g. 25"
              value={scrapQty}
              onChange={(e) => setScrapQty(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Rate Per Unit (₹)</label>
            <input
              type="number"
              placeholder="e.g. 120"
              value={scrapRate}
              onChange={(e) => setScrapRate(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} />
              <span>Record Scrap Income (+₹{(parseInt(scrapQty, 10) || 0) * (parseFloat(scrapRate) || 0)})</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
