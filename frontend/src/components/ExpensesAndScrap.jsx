import React, { useState } from 'react';
import { Coffee, DollarSign, Users, RefreshCw, Plus, CheckCircle2, Trash2 } from 'lucide-react';
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
      
      {/* Header Title Banner */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">{t.expensesTitle}</h2>
          <p className="section-desc">{t.expensesDesc}</p>
        </div>
      </div>

      {/* CARD 1: DAILY SHOP EXPENSES LOGGER (FULL WIDTH) */}
      <div className="card-container">
        <div className="card-header">
          <Coffee className="card-icon" size={22} />
          <h2>1. {t.logExpense}</h2>
          {expSuccess && (
            <span className="badge-chip success" style={{ marginLeft: 'auto' }}>
              <CheckCircle2 size={14} /> {expSuccess}
            </span>
          )}
        </div>

        <form onSubmit={handleAddExpense} className="grid-form">
          <div className="form-group">
            <label>Expense Category *</label>
            <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
              <option value="Tea & Snacks">{t.categoryTea}</option>
              <option value="Shop Maintenance">{t.categoryMaintenance}</option>
              <option value="Tools & Spares">{t.categorySpares}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t.expenseAmount} *</label>
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
              placeholder="e.g. Evening tea & snacks for staff and customers"
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

        {/* Recent Expenses List */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            📋 Recent Daily Shop Expenses ({expenses.length})
          </h3>
          <div>
            {expenses.map(e => (
              <div key={e.id} className="history-log-row" style={{ padding: '12px 0' }}>
                <div>
                  <span className="log-id">{e.id}</span>
                  <span className="service-tag" style={{ marginRight: '10px' }}>{e.category}</span>
                  <span className="log-date">{e.date}</span>
                  {e.note && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '10px' }}>({e.note})</span>}
                </div>
                <span className="log-amount" style={{ color: 'var(--ruby-primary)' }}>-₹{e.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD 2: STAFF MONTHLY SALARY MANAGER (FULL WIDTH) */}
      <div className="card-container">
        <div className="card-header">
          <Users className="card-icon" size={22} />
          <h2>2. {t.staffSalaries}</h2>
          {salSuccess && (
            <span className="badge-chip success" style={{ marginLeft: 'auto' }}>
              <CheckCircle2 size={14} /> {salSuccess}
            </span>
          )}
        </div>

        <form onSubmit={handleAddSalary} className="grid-form">
          <div className="form-group">
            <label>Staff Member Name *</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Worker"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Monthly Base Salary (₹) *</label>
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

          <div className="form-group">
            <label>Net Payable Amount</label>
            <input
              type="text"
              value={`₹${Math.max(0, (parseFloat(baseSalary) || 0) - (parseFloat(advanceAmt) || 0)).toLocaleString('en-IN')}`}
              readOnly
              style={{ background: 'var(--bg-surface-elevated)', color: 'var(--yellow-primary)', fontWeight: '800' }}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} />
              <span>Save Salary Record</span>
            </button>
          </div>
        </form>

        {/* Recent Salary Payouts List */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            👥 Recent Staff Salary Payouts ({salaries.length})
          </h3>
          <div>
            {salaries.map(s => (
              <div key={s.id} className="history-log-row" style={{ padding: '12px 0' }}>
                <div>
                  <span className="log-id">{s.id}</span>
                  <strong style={{ color: 'var(--text-white)', marginRight: '14px' }}>{s.staffName}</strong>
                  <span className="log-date">{s.date}</span>
                </div>
                <div>
                  <span className="service-tag" style={{ marginRight: '10px' }}>Base: ₹{s.baseSalary.toLocaleString('en-IN')}</span>
                  <span className="service-tag" style={{ marginRight: '10px', color: 'var(--ruby-primary)' }}>Adv: ₹{s.advance.toLocaleString('en-IN')}</span>
                </div>
                <span className="log-amount text-gold">Net Payout: ₹{s.netPayout.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD 3: SCRAP TYRE & RESALE INCOME REGISTER (FULL WIDTH) */}
      <div className="card-container">
        <div className="card-header">
          <RefreshCw className="card-icon" size={22} />
          <h2>3. {t.scrapSales}</h2>
          {scrapSuccess && (
            <span className="badge-chip success" style={{ marginLeft: 'auto' }}>
              <CheckCircle2 size={14} /> {scrapSuccess}
            </span>
          )}
        </div>

        <form onSubmit={handleAddScrapSale} className="grid-form">
          <div className="form-group">
            <label>Item / Tyre Category *</label>
            <select value={scrapType} onChange={(e) => setScrapType(e.target.value)}>
              <option value="Scrap Rubber Tyres">Scrap Rubber Bulk Tyres</option>
              <option value="Old Used Tyre Resale">Old Used Tyre Resale</option>
              <option value="Scrap Brass & Lead Weights">Scrap Brass & Lead Weights</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantity / Weight (Qty or kg) *</label>
            <input
              type="number"
              placeholder="e.g. 25"
              value={scrapQty}
              onChange={(e) => setScrapQty(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Rate Per Unit (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 120"
              value={scrapRate}
              onChange={(e) => setScrapRate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Total Income</label>
            <input
              type="text"
              value={`+₹${((parseInt(scrapQty, 10) || 0) * (parseFloat(scrapRate) || 0)).toLocaleString('en-IN')}`}
              readOnly
              style={{ background: 'var(--bg-surface-elevated)', color: 'var(--emerald-primary)', fontWeight: '800' }}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} />
              <span>Record Scrap Income (+₹{((parseInt(scrapQty, 10) || 0) * (parseFloat(scrapRate) || 0)).toLocaleString('en-IN')})</span>
            </button>
          </div>
        </form>

        {/* Recent Scrap Sales List */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            ♻️ Recent Scrap Sales Income ({scrapSales.length})
          </h3>
          <div>
            {scrapSales.map(s => (
              <div key={s.id} className="history-log-row" style={{ padding: '12px 0' }}>
                <div>
                  <span className="log-id">{s.id}</span>
                  <span className="service-tag" style={{ color: 'var(--emerald-primary)', fontWeight: '700', marginRight: '10px' }}>{s.itemType}</span>
                  <span className="log-date">{s.date}</span>
                </div>
                <div>
                  <span className="service-tag">{s.quantity} units @ ₹{s.ratePerUnit}/unit</span>
                </div>
                <span className="log-amount" style={{ color: 'var(--emerald-primary)' }}>+₹{s.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
