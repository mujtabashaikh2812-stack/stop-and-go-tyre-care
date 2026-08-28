import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IntakeForm from './components/IntakeForm';
import ServiceChecklist from './components/ServiceChecklist';
import ReceiptModal from './components/ReceiptModal';
import CustomerHistory from './components/CustomerHistory';
import Analytics from './components/Analytics';
import Inventory from './components/Inventory';
import ServicePriceEditor from './components/ServicePriceEditor';
import Bookings from './components/Bookings';
import ExpensesAndScrap from './components/ExpensesAndScrap';
import PartnerBatches from './components/PartnerBatches';
import TyreWarranty from './components/TyreWarranty';
import AdminLoginGate from './components/AdminLoginGate';

import {
  getJobCards, saveJobCard, updateExistingJobCard, getInventory, getServicePrices,
  getBookings, getExpenses, getSalaries, getScrapSales,
  getPartnerGarages, getPartnerBatches, getTyreWarranties, saveCloudData,
  getLanguage, setLanguage as saveLanguage
} from './utils/storage';
import { triggerCloudSync, fetchCloudData } from './utils/syncService';

const AUTH_KEY = 'stop_go_auth_token';
const AUTH_TIME_KEY = 'stop_go_auth_timestamp';
const ONE_HOUR_MS = 60 * 60 * 1000; // 1 Hour Session Window

const checkAuthStatus = () => {
  const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
  const loginTime = parseInt(localStorage.getItem(AUTH_TIME_KEY), 10) || 0;
  const now = Date.now();

  if (isAuth && (now - loginTime) < ONE_HOUR_MS) {
    return true;
  }
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_TIME_KEY);
  sessionStorage.removeItem('stop_go_auth');
  return false;
};

const createBlankDraftServices = (masterList) => {
  const draft = {};
  if (masterList && typeof masterList === 'object') {
    Object.keys(masterList).forEach(k => {
      draft[k] = { ...masterList[k], enabled: false };
    });
  }
  return draft;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuthStatus());

  const [currentLang, setCurrentLang] = useState(() => getLanguage());
  const [activeTab, setActiveTab] = useState('billing');
  
  // Edit Bill Mode State
  const [editingBillId, setEditingBillId] = useState(null);

  // Data States
  const [jobCards, setJobCards] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [masterServices, setMasterServices] = useState(() => getServicePrices());
  const [activeServices, setActiveServices] = useState(() => createBlankDraftServices(getServicePrices()));
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [scrapSales, setScrapSales] = useState([]);
  const [partnerGarages, setPartnerGarages] = useState([]);
  const [partnerBatches, setPartnerBatches] = useState([]);
  const [warranties, setWarranties] = useState([]);

  // Form State
  const [customerData, setCustomerData] = useState({
    name: '',
    mobile: '',
    vehicle: '',
    vehicleNumber: '',
    year: '',
    odometer: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');
  const [discount, setDiscount] = useState(0);

  // Modal State
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [billingMode, setBillingMode] = useState('bill');

  useEffect(() => {
    // 1. Initial render from local cache
    const initialMaster = getServicePrices();
    setJobCards(getJobCards());
    setInventory(getInventory());
    setMasterServices(initialMaster);
    setActiveServices(prev => Object.keys(prev).length > 0 ? prev : createBlankDraftServices(initialMaster));
    setBookings(getBookings());
    setExpenses(getExpenses());
    setSalaries(getSalaries());
    setScrapSales(getScrapSales());
    setPartnerGarages(getPartnerGarages());
    setPartnerBatches(getPartnerBatches());
    setWarranties(getTyreWarranties());

    // 2. Sync local data & fetch live MongoDB Cloud data to refresh React state
    const loadCloudData = async () => {
      await triggerCloudSync();
      const cloudData = await fetchCloudData();
      if (cloudData) {
        saveCloudData(cloudData);
        setJobCards(getJobCards());
        setInventory(getInventory());
        setMasterServices(getServicePrices()); // Updates master prices list only; NEVER touches active draft!
        setBookings(getBookings());
        setExpenses(getExpenses());
        setSalaries(getSalaries());
        setScrapSales(getScrapSales());
        setPartnerGarages(getPartnerGarages());
        setPartnerBatches(getPartnerBatches());
        setWarranties(getTyreWarranties());
      }
    };

    loadCloudData();

    const checkSessionExpiry = () => {
      if (!checkAuthStatus()) {
        setIsAuthenticated(false);
      }
    };

    // 3. Live 10-second Polling: Auto-syncs database & verifies 1-hour session validity
    const interval = setInterval(() => {
      checkSessionExpiry();
      loadCloudData();
    }, 10000);

    const handleFocus = () => {
      checkSessionExpiry();
    };

    const handleOnline = () => {
      loadCloudData();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleLanguageChange = (lang) => {
    saveLanguage(lang);
    setCurrentLang(lang);
  };

  // Compute Today Stats (Including Partner Payments, Salaries, & Shop Rent Deductions)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCards = jobCards.filter(c => c.date === todayStr);
  const todayExp = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const todaySalaries = salaries.filter(s => s.date === todayStr).reduce((sum, s) => sum + (parseFloat(s.netPayout) || 0), 0);
  const todayScrap = scrapSales.filter(s => s.date === todayStr).reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0);

  let todayPartnerPayments = 0;
  partnerBatches.forEach(b => {
    (b.payments || []).forEach(p => {
      if (p.date === todayStr) todayPartnerPayments += parseFloat(p.amount) || 0;
    });
  });

  const todayGross = todayCards.reduce((sum, c) => sum + (parseFloat(c.total) || 0), 0) + todayScrap + todayPartnerPayments;
  const todayTotalDeductions = todayExp + todaySalaries;
  const todayNetProfit = Math.max(0, todayGross - todayTotalDeductions);

  const todayStats = {
    netProfit: todayNetProfit,
    jobCount: todayCards.length
  };

  const handleLoginSuccess = () => {
    const now = Date.now();
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(AUTH_TIME_KEY, String(now));
    sessionStorage.setItem('stop_go_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TIME_KEY);
    sessionStorage.removeItem('stop_go_auth');
    setIsAuthenticated(false);
    setActiveTab('billing');
  };

  // 🔄 HANDLE EDIT BILL: Pre-fills customer info & services into form
  const handleEditBill = (billCard) => {
    if (!billCard) return;

    setEditingBillId(billCard.id);
    setCustomerData({
      name: billCard.customerName || '',
      mobile: billCard.mobile || '',
      vehicle: billCard.vehicleName || '',
      vehicleNumber: billCard.vehicleNumber || '',
      year: billCard.year || '',
      odometer: billCard.odometer || ''
    });
    setPaymentMethod(billCard.paymentMethod || 'UPI / QR Code');
    setDiscount(billCard.discount || 0);

    // Pre-select & fill services from the existing bill
    const masterServices = getServicePrices();
    const activeServicesState = { ...masterServices };

    // Reset all enabled flags first
    Object.keys(activeServicesState).forEach(k => {
      activeServicesState[k] = { ...activeServicesState[k], enabled: false };
    });

    // Match bill services into checklist state
    billCard.services.forEach(billServ => {
      const nameLower = billServ.name.toLowerCase();

      if (nameLower.includes('wheel alignment')) {
        activeServicesState.wheelAlignment = { ...activeServicesState.wheelAlignment, enabled: true, price: billServ.amount };
      } else if (nameLower.includes('balancing')) {
        const tyresMatch = billServ.name.match(/(\d+) Tyres/);
        const tyres = tyresMatch ? parseInt(tyresMatch[1], 10) : 4;
        activeServicesState.wheelBalancing = { ...activeServicesState.wheelBalancing, enabled: true, tyresCount: tyres };
      } else if (nameLower.includes('weight')) {
        const gMatch = billServ.name.match(/(\d+)g/);
        const g = gMatch ? parseInt(gMatch[1], 10) : 0;
        const isSticker = nameLower.includes('sticker');
        activeServicesState.weight = { ...activeServicesState.weight, enabled: true, weightType: isSticker ? 'sticker' : 'brass', grams: g };
      } else if (nameLower.includes('fitting')) {
        activeServicesState.tyreFitting = { ...activeServicesState.tyreFitting, enabled: true };
      } else if (nameLower.includes('rotation')) {
        activeServicesState.tyreRotation = { ...activeServicesState.tyreRotation, enabled: true };
      } else if (nameLower.includes('buffing')) {
        activeServicesState.headlightBuffing = { ...activeServicesState.headlightBuffing, enabled: true, price: billServ.amount };
      } else if (nameLower.includes('air filling') || nameLower.includes('nitrogen')) {
        activeServicesState.airFilling = { ...activeServicesState.airFilling, enabled: true };
      } else if (nameLower.includes('puncher') || nameLower.includes('puncture')) {
        const qtyMatch = billServ.name.match(/(\d+) Repairs/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        activeServicesState.tubelessPuncher = { ...activeServicesState.tubelessPuncher, enabled: true, qty: qty };
      } else if (nameLower.includes('camber')) {
        activeServicesState.camberSetting = { ...activeServicesState.camberSetting, enabled: true, price: billServ.amount };
      } else if (nameLower.includes('washing')) {
        activeServicesState.carWashing = { ...activeServicesState.carWashing, enabled: true, price: billServ.amount };
      } else if (nameLower.includes('cleaning')) {
        activeServicesState.internalCleaning = { ...activeServicesState.internalCleaning, enabled: true, price: billServ.amount };
      } else if (nameLower.includes('oil')) {
        activeServicesState.oilChange = { ...activeServicesState.oilChange, enabled: true, price: billServ.amount };
      } else {
        const customKey = Object.keys(activeServicesState).find(k => activeServicesState[k].name === billServ.name);
        if (customKey) {
          activeServicesState[customKey] = { ...activeServicesState[customKey], enabled: true, price: billServ.amount };
        }
      }
    });

    setActiveServices(activeServicesState);
    setActiveTab('billing');
    setActiveReceipt(null);
  };

  const handleCancelEdit = () => {
    setEditingBillId(null);
    setCustomerData({ name: '', mobile: '', vehicle: '', vehicleNumber: '', year: '', odometer: '' });
    setDiscount(0);
    setActiveServices(createBlankDraftServices(masterServices));
  };

  const handleGenerateInvoice = (mode = 'bill') => {
    if (!customerData.name || !customerData.mobile || !customerData.vehicle || !customerData.vehicleNumber) {
      alert('Please fill in Customer Name, Mobile Number, Vehicle Model, and Vehicle Reg. Number before generating.');
      return;
    }

    const selectedList = [];

    Object.entries(activeServices).forEach(([key, serv]) => {
      if (!serv?.enabled) return;

      if (key === 'wheelAlignment') {
        selectedList.push({ name: 'Wheel Alignment', amount: parseFloat(serv.price) || 350 });
      } else if (key === 'wheelBalancing') {
        const count = parseInt(serv.tyresCount, 10) || 4;
        const rate = parseFloat(serv.pricePerTyre) || 50;
        selectedList.push({ name: `Wheel Balancing (${count} Tyres @ ₹${rate}/tyre)`, amount: count * rate });
      } else if (key === 'weight') {
        const g = parseInt(serv.grams, 10) || 0;
        const rateW = serv.weightType === 'sticker' ? (parseFloat(serv.stickerRate) || 4) : (parseFloat(serv.brassRate) || 2);
        const typeLabel = serv.weightType === 'sticker' ? `Sticker Weight (₹${rateW}/g)` : `Brass Weight (₹${rateW}/g)`;
        selectedList.push({ name: `Wheel Weight (${typeLabel} - ${g}g)`, amount: g * rateW });
      } else if (key === 'tyreFitting') {
        const fQty = parseInt(serv.fittingQty, 10) || 1;
        const fRate = serv.rimSize === 'large' ? (parseFloat(serv.largeRimRate) || 125) : (parseFloat(serv.smallRimRate) || 100);
        const rimLabel = serv.rimSize === 'large' ? 'Rim 16-18' : 'Rim 12-15';
        let label = `Tyre Fitting (${rimLabel} - ${fQty} Tyres @ ₹${fRate}/tyre)`;
        let totalAmt = fQty * fRate;
        
        if (serv.newValve) {
          const vQty = parseInt(serv.valveQty, 10) || 0;
          const vRate = parseFloat(serv.valveRate) || 60;
          const vAmt = vQty * vRate;
          label += ` + ${vQty} New Valves (₹${vAmt})`;
          totalAmt += vAmt;
        }
        selectedList.push({ name: label, amount: totalAmt });
      } else if (key === 'tyreRotation') {
        const count = parseInt(serv.tyresCount, 10) || 4;
        const rate = parseFloat(serv.ratePerTyre) || 50;
        const pattern = serv.rotationPattern || 'Cross Pattern';
        selectedList.push({ name: `Tyre Rotation (${pattern} - ${count} Tyres @ ₹${rate}/tyre)`, amount: count * rate });
      } else if (key === 'airFilling') {
        let label = 'Normal Air Filling';
        let amt = parseFloat(serv.normalPrice) || 20;
        if (serv.airType === 'nitrogen_full') {
          label = 'Nitrogen Air Full Fill';
          amt = parseFloat(serv.nitrogenFullPrice) || 150;
        } else if (serv.airType === 'nitrogen_topup') {
          label = 'Nitrogen Air Top-Up';
          amt = parseFloat(serv.nitrogenTopupPrice) || 50;
        }
        selectedList.push({ name: label, amount: amt });
      } else if (key === 'tubelessPuncher') {
        const qty = parseInt(serv.qty, 10) || 0;
        const rate = parseFloat(serv.pricePerPuncher) || 100;
        selectedList.push({ name: `Tubeless Puncher Repair (${qty} Repairs @ ₹${rate}/each)`, amount: qty * rate });
      } else {
        selectedList.push({ name: serv.name || key, amount: parseFloat(serv.price) || 0 });
      }
    });

    const subtotal = selectedList.reduce((sum, s) => sum + s.amount, 0);
    const discNum = parseInt(discount, 10) || 0;
    const finalTotal = Math.max(0, subtotal - discNum);

    const now = new Date();
    const cardId = editingBillId ? editingBillId : `SG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCard = {
      id: cardId,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      customerName: customerData.name,
      mobile: customerData.mobile,
      vehicleName: customerData.vehicle,
      vehicleNumber: customerData.vehicleNumber,
      year: customerData.year || '2024',
      odometer: customerData.odometer || 'N/A',
      services: selectedList,
      subtotal: subtotal,
      discount: discNum,
      total: finalTotal,
      paymentMethod: paymentMethod,
      status: 'Completed'
    };

    let updatedJobCards;
    if (editingBillId) {
      updatedJobCards = updateExistingJobCard(newCard);
      setEditingBillId(null);
    } else {
      updatedJobCards = saveJobCard(newCard);
    }

    setJobCards(updatedJobCards);
    setInventory(getInventory());
    setBillingMode(mode);
    setActiveReceipt(newCard);
    setActiveServices(createBlankDraftServices(masterServices));

    triggerCloudSync();
  };

  const handleCloseReceiptModal = () => {
    setActiveReceipt(null);
    setCustomerData({ name: '', mobile: '', vehicle: '', vehicleNumber: '', year: '', odometer: '' });
    setDiscount(0);
    setEditingBillId(null);
    setActiveServices(createBlankDraftServices(masterServices));
  };

  if (!isAuthenticated) {
    return <AdminLoginGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-wrapper">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        todayStats={todayStats}
        onLogout={handleLogout}
        currentLang={currentLang}
        setLanguage={handleLanguageChange}
      />

      <main className="app-main-body">
        {activeTab === 'billing' && (
          <>
            <IntakeForm
              customerData={customerData}
              setCustomerData={setCustomerData}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              currentLang={currentLang}
              editingBillId={editingBillId}
              onCancelEdit={handleCancelEdit}
            />
            {Object.keys(activeServices).length > 0 && (
              <ServiceChecklist
                services={activeServices}
                setServices={setActiveServices}
                discount={discount}
                setDiscount={setDiscount}
                onGenerateInvoice={handleGenerateInvoice}
                currentLang={currentLang}
              />
            )}
          </>
        )}

        {activeTab === 'partner_batches' && (
          <PartnerBatches
            partnerGarages={partnerGarages}
            setPartnerGarages={setPartnerGarages}
            partnerBatches={partnerBatches}
            setPartnerBatches={setPartnerBatches}
            masterServices={masterServices}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerHistory
            jobCards={jobCards}
            setJobCards={setJobCards}
            onEditBill={handleEditBill}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            jobCards={jobCards}
            expenses={expenses}
            salaries={salaries}
            scrapSales={scrapSales}
            partnerBatches={partnerBatches}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'inventory' && (
          <Inventory inventory={inventory} setInventory={setInventory} currentLang={currentLang} />
        )}

        {activeTab === 'bookings' && (
          <Bookings bookings={bookings} setBookings={setBookings} currentLang={currentLang} />
        )}

        {activeTab === 'expenses' && (
          <ExpensesAndScrap
            expenses={expenses}
            setExpenses={setExpenses}
            salaries={salaries}
            setSalaries={setSalaries}
            scrapSales={scrapSales}
            setScrapSales={setScrapSales}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'price_settings' && (
          <ServicePriceEditor
            services={masterServices}
            setServices={setMasterServices}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'tyre_warranty' && (
          <TyreWarranty
            warranties={warranties}
            setWarranties={setWarranties}
            currentLang={currentLang}
          />
        )}
      </main>

      <ReceiptModal
        activeReceipt={activeReceipt}
        mode={billingMode}
        onClose={handleCloseReceiptModal}
        onEditBill={handleEditBill}
        currentLang={currentLang}
      />
    </div>
  );
}
