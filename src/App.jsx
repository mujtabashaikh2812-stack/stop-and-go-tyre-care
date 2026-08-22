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
import AdminLoginGate from './components/AdminLoginGate';

import {
  getJobCards, saveJobCard, getInventory, getServicePrices,
  getBookings, getExpenses, getSalaries, getScrapSales,
  getLanguage, setLanguage as saveLanguage
} from './utils/storage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('stop_go_auth') === 'true';
  });

  const [currentLang, setCurrentLang] = useState(() => getLanguage());
  const [activeTab, setActiveTab] = useState('billing');
  
  // Data States
  const [jobCards, setJobCards] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [services, setServices] = useState({});
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [scrapSales, setScrapSales] = useState([]);

  // Form State
  const [customerData, setCustomerData] = useState({
    name: '',
    mobile: '',
    vehicle: '',
    year: '',
    odometer: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');
  const [discount, setDiscount] = useState(0);

  // Modal State
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [billingMode, setBillingMode] = useState('bill');

  useEffect(() => {
    setJobCards(getJobCards());
    setInventory(getInventory());
    setServices(getServicePrices());
    setBookings(getBookings());
    setExpenses(getExpenses());
    setSalaries(getSalaries());
    setScrapSales(getScrapSales());
  }, []);

  const handleLanguageChange = (lang) => {
    saveLanguage(lang);
    setCurrentLang(lang);
  };

  // Compute Today Stats (Net Profit = Gross Revenue - Daily Expenses)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCards = jobCards.filter(c => c.date === todayStr);
  const todayExp = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
  const todayScrap = scrapSales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.totalAmount, 0);
  const todayGross = todayCards.reduce((sum, c) => sum + c.total, 0) + todayScrap;
  const todayNetProfit = Math.max(0, todayGross - todayExp);

  const todayStats = {
    netProfit: todayNetProfit,
    jobCount: todayCards.length
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem('stop_go_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('stop_go_auth');
    setIsAuthenticated(false);
    setActiveTab('billing');
  };

  const handleGenerateInvoice = (mode = 'bill') => {
    if (!customerData.name || !customerData.mobile || !customerData.vehicle) {
      alert('Please fill in Customer Name, Mobile Number, and Vehicle details before generating.');
      return;
    }

    // Build selected services list according to client rate rules
    const selectedList = [];

    if (services.wheelAlignment?.enabled) {
      selectedList.push({ name: 'Wheel Alignment', amount: services.wheelAlignment.price || 350 });
    }
    if (services.wheelBalancing?.enabled) {
      const count = parseInt(services.wheelBalancing.tyresCount, 10) || 4;
      const rate = services.wheelBalancing.pricePerTyre || 50;
      selectedList.push({ name: `Wheel Balancing (${count} Tyres @ ₹${rate}/tyre)`, amount: count * rate });
    }
    if (services.weight?.enabled) {
      const g = parseInt(services.weight.grams, 10) || 0;
      const typeLabel = services.weight.weightType === 'sticker' ? 'Sticker Weight (₹4/g)' : 'Brass Weight (₹2/g)';
      const rate = services.weight.weightType === 'sticker' ? (services.weight.stickerRate || 4) : (services.weight.brassRate || 2);
      selectedList.push({ name: `Wheel Weight (${typeLabel} - ${g}g)`, amount: g * rate });
    }
    if (services.tyreFitting?.enabled) {
      const fQty = parseInt(services.tyreFitting.fittingQty, 10) || 1;
      const fRate = services.tyreFitting.rimSize === 'large' ? (services.tyreFitting.largeRimRate || 125) : (services.tyreFitting.smallRimRate || 100);
      const rimLabel = services.tyreFitting.rimSize === 'large' ? 'Rim 16-18' : 'Rim 12-15';
      let label = `Tyre Fitting (${rimLabel} - ${fQty} Tyres @ ₹${fRate}/tyre)`;
      let totalAmt = fQty * fRate;
      
      if (services.tyreFitting.newValve) {
        const vQty = parseInt(services.tyreFitting.valveQty, 10) || 0;
        const vRate = parseInt(services.tyreFitting.valveRate, 10) || 60;
        const vAmt = vQty * vRate;
        label += ` + ${vQty} New Valves (₹${vAmt})`;
        totalAmt += vAmt;
      }
      selectedList.push({ name: label, amount: totalAmt });
    }
    if (services.tyreRotation?.enabled) {
      const count = parseInt(services.tyreRotation.tyresCount, 10) || 4;
      const rate = services.tyreRotation.ratePerTyre || 50;
      const pattern = services.tyreRotation.rotationPattern || 'Cross Pattern';
      selectedList.push({ name: `Tyre Rotation (${pattern} - ${count} Tyres @ ₹${rate}/tyre)`, amount: count * rate });
    }
    if (services.headlightBuffing?.enabled) {
      selectedList.push({ name: 'Head Light Buffing (Cleaning)', amount: services.headlightBuffing.price || 700 });
    }
    if (services.airFilling?.enabled) {
      let label = 'Normal Air Filling';
      let amt = services.airFilling.normalPrice || 20;
      if (services.airFilling.airType === 'nitrogen_full') {
        label = 'Nitrogen Air Full Fill';
        amt = services.airFilling.nitrogenFullPrice || 150;
      } else if (services.airFilling.airType === 'nitrogen_topup') {
        label = 'Nitrogen Air Top-Up';
        amt = services.airFilling.nitrogenTopupPrice || 50;
      }
      selectedList.push({ name: label, amount: amt });
    }
    if (services.tubelessPuncher?.enabled) {
      const qty = parseInt(services.tubelessPuncher.qty, 10) || 0;
      const rate = services.tubelessPuncher.pricePerPuncher || 100;
      selectedList.push({ name: `Tubeless Puncher Repair (${qty} Repairs @ ₹${rate}/each)`, amount: qty * rate });
    }
    if (services.camberSetting?.enabled) {
      selectedList.push({ name: 'Camber Setting (Bolt & Sims Add/Remove)', amount: services.camberSetting.price || 1200 });
    }
    if (services.carWashing?.enabled) {
      selectedList.push({ name: 'Car Washing (Future Service)', amount: services.carWashing.price || 350 });
    }
    if (services.internalCleaning?.enabled) {
      selectedList.push({ name: 'Internal Cleaning (Future Service)', amount: services.internalCleaning.price || 800 });
    }
    if (services.oilChange?.enabled) {
      selectedList.push({ name: 'Engine Oil Change (Future Service)', amount: services.oilChange.price || 1500 });
    }

    const subtotal = selectedList.reduce((sum, s) => sum + s.amount, 0);
    const discNum = parseInt(discount, 10) || 0;
    const finalTotal = Math.max(0, subtotal - discNum);

    const now = new Date();
    const newCard = {
      id: `SG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      customerName: customerData.name,
      mobile: customerData.mobile,
      vehicleName: customerData.vehicle,
      year: customerData.year || '2024',
      odometer: customerData.odometer || 'N/A',
      services: selectedList,
      subtotal: subtotal,
      discount: discNum,
      total: finalTotal,
      paymentMethod: paymentMethod,
      status: 'Completed'
    };

    const updatedJobCards = saveJobCard(newCard);
    setJobCards(updatedJobCards);
    setInventory(getInventory());
    setBillingMode(mode);
    setActiveReceipt(newCard);
  };

  const handleCloseReceiptModal = () => {
    setActiveReceipt(null);
    setCustomerData({ name: '', mobile: '', vehicle: '', year: '', odometer: '' });
    setDiscount(0);
    setServices(getServicePrices());
  };

  // MANDATORY LOGIN GATE
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
            />
            {Object.keys(services).length > 0 && (
              <ServiceChecklist
                services={services}
                setServices={setServices}
                discount={discount}
                setDiscount={setDiscount}
                onGenerateInvoice={handleGenerateInvoice}
                currentLang={currentLang}
              />
            )}
          </>
        )}

        {activeTab === 'customers' && (
          <CustomerHistory jobCards={jobCards} />
        )}

        {activeTab === 'analytics' && (
          <Analytics jobCards={jobCards} expenses={expenses} scrapSales={scrapSales} />
        )}

        {activeTab === 'inventory' && (
          <Inventory inventory={inventory} setInventory={setInventory} />
        )}

        {activeTab === 'bookings' && (
          <Bookings bookings={bookings} setBookings={setBookings} />
        )}

        {activeTab === 'expenses' && (
          <ExpensesAndScrap
            expenses={expenses}
            setExpenses={setExpenses}
            salaries={salaries}
            setSalaries={setSalaries}
            scrapSales={scrapSales}
            setScrapSales={setScrapSales}
          />
        )}

        {activeTab === 'price_settings' && (
          <ServicePriceEditor
            services={services}
            setServices={setServices}
          />
        )}
      </main>

      <ReceiptModal
        activeReceipt={activeReceipt}
        mode={billingMode}
        onClose={handleCloseReceiptModal}
      />
    </div>
  );
}
