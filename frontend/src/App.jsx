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
  getLanguage, setLanguage as saveLanguage, saveCloudData
} from './utils/storage';
import { triggerCloudSync, fetchCloudData } from './utils/syncService';

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
    const loadData = async () => {
      const cloudData = await fetchCloudData();
      const hasCloudData = cloudData && (
        Object.values(cloudData).some(value => Array.isArray(value) && value.length > 0) ||
        (cloudData.servicePrices && Object.keys(cloudData.servicePrices).length > 0)
      );

      if (hasCloudData) {
        Object.entries(cloudData).forEach(([name, value]) => {
          if (name === 'jobCards') setJobCards(value);
          if (name === 'inventory') setInventory(value);
          if (name === 'servicePrices') setServices(value);
          if (name === 'bookings') setBookings(value);
          if (name === 'expenses') setExpenses(value);
          if (name === 'salaries') setSalaries(value);
          if (name === 'scrapSales') setScrapSales(value);
        });
        saveCloudData(cloudData);
      } else {
        setJobCards(getJobCards());
        setInventory(getInventory());
        setServices(getServicePrices());
        setBookings(getBookings());
        setExpenses(getExpenses());
        setSalaries(getSalaries());
        setScrapSales(getScrapSales());
        triggerCloudSync();
      }
    };

    loadData();

    const handleDataChanged = () => triggerCloudSync();
    window.addEventListener('storage-data-changed', handleDataChanged);

    const handleOnline = () => {
      console.log('🌐 Device is online. Initiating MongoDB Atlas Cloud Sync...');
      triggerCloudSync();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('storage-data-changed', handleDataChanged);
      window.removeEventListener('online', handleOnline);
    };
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
    if (!customerData.name || !customerData.mobile || !customerData.vehicle || !customerData.vehicleNumber) {
      alert('Please fill in Customer Name, Mobile Number, Vehicle Model, and Vehicle Reg. Number before generating.');
      return;
    }

    const selectedList = [];

    Object.entries(services).forEach(([key, serv]) => {
      if (!serv?.enabled) return;

      if (key === 'wheelAlignment') {
        selectedList.push({ name: 'Wheel Alignment', amount: serv.price || 350 });
      } else if (key === 'wheelBalancing') {
        const count = parseInt(serv.tyresCount, 10) || 4;
        const rate = serv.pricePerTyre || 50;
        selectedList.push({ name: `Wheel Balancing (${count} Tyres @ ₹${rate}/tyre)`, amount: count * rate });
      } else if (key === 'weight') {
        const g = parseInt(serv.grams, 10) || 0;
        const typeLabel = serv.weightType === 'sticker' ? 'Sticker Weight (₹4/g)' : 'Brass Weight (₹2/g)';
        const rate = serv.weightType === 'sticker' ? (serv.stickerRate || 4) : (serv.brassRate || 2);
        selectedList.push({ name: `Wheel Weight (${typeLabel} - ${g}g)`, amount: g * rate });
      } else if (key === 'tyreFitting') {
        const fQty = parseInt(serv.fittingQty, 10) || 1;
        const fRate = serv.rimSize === 'large' ? (serv.largeRimRate || 125) : (serv.smallRimRate || 100);
        const rimLabel = serv.rimSize === 'large' ? 'Rim 16-18' : 'Rim 12-15';
        let label = `Tyre Fitting (${rimLabel} - ${fQty} Tyres @ ₹${fRate}/tyre)`;
        let totalAmt = fQty * fRate;
        
        if (serv.newValve) {
          const vQty = parseInt(serv.valveQty, 10) || 0;
          const vRate = parseInt(serv.valveRate, 10) || 60;
          const vAmt = vQty * vRate;
          label += ` + ${vQty} New Valves (₹${vAmt})`;
          totalAmt += vAmt;
        }
        selectedList.push({ name: label, amount: totalAmt });
      } else if (key === 'tyreRotation') {
        const count = parseInt(serv.tyresCount, 10) || 4;
        const rate = serv.ratePerTyre || 50;
        const pattern = serv.rotationPattern || 'Cross Pattern';
        selectedList.push({ name: `Tyre Rotation (${pattern} - ${count} Tyres @ ₹${rate}/tyre)`, amount: count * rate });
      } else if (key === 'airFilling') {
        let label = 'Normal Air Filling';
        let amt = serv.normalPrice || 20;
        if (serv.airType === 'nitrogen_full') {
          label = 'Nitrogen Air Full Fill';
          amt = serv.nitrogenFullPrice || 150;
        } else if (serv.airType === 'nitrogen_topup') {
          label = 'Nitrogen Air Top-Up';
          amt = serv.nitrogenTopupPrice || 50;
        }
        selectedList.push({ name: label, amount: amt });
      } else if (key === 'tubelessPuncher') {
        const qty = parseInt(serv.qty, 10) || 0;
        const rate = serv.pricePerPuncher || 100;
        selectedList.push({ name: `Tubeless Puncher Repair (${qty} Repairs @ ₹${rate}/each)`, amount: qty * rate });
      } else {
        selectedList.push({ name: serv.name, amount: serv.price || 0 });
      }
    });

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

    const updatedJobCards = saveJobCard(newCard);
    setJobCards(updatedJobCards);
    setInventory(getInventory());
    setBillingMode(mode);
    setActiveReceipt(newCard);

    // Auto-trigger background MongoDB Atlas sync
    triggerCloudSync();
  };

  const handleCloseReceiptModal = () => {
    setActiveReceipt(null);
    setCustomerData({ name: '', mobile: '', vehicle: '', vehicleNumber: '', year: '', odometer: '' });
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
              currentLang={currentLang}
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
          <CustomerHistory jobCards={jobCards} setJobCards={setJobCards} currentLang={currentLang} />
        )}

        {activeTab === 'analytics' && (
          <Analytics jobCards={jobCards} expenses={expenses} scrapSales={scrapSales} currentLang={currentLang} />
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
            services={services}
            setServices={setServices}
            currentLang={currentLang}
          />
        )}
      </main>

      <ReceiptModal
        activeReceipt={activeReceipt}
        mode={billingMode}
        onClose={handleCloseReceiptModal}
        currentLang={currentLang}
      />
    </div>
  );
}
