import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IntakeForm from './components/IntakeForm';
import ServiceChecklist from './components/ServiceChecklist';
import ReceiptModal from './components/ReceiptModal';
import CustomerHistory from './components/CustomerHistory';
import Analytics from './components/Analytics';
import Inventory from './components/Inventory';
import ServicePriceEditor from './components/ServicePriceEditor';
import AdminLoginGate from './components/AdminLoginGate';

import { getJobCards, saveJobCard, getInventory, getServicePrices } from './utils/storage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('stop_go_auth') === 'true';
  });

  const [activeTab, setActiveTab] = useState('billing');
  const [jobCards, setJobCards] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [services, setServices] = useState({});

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
  const [billingMode, setBillingMode] = useState('bill'); // 'bill' | 'whatsapp'

  useEffect(() => {
    setJobCards(getJobCards());
    setInventory(getInventory());
    setServices(getServicePrices());
  }, []);

  // Compute Today Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCards = jobCards.filter(c => c.date === todayStr);
  const todayStats = {
    totalRevenue: todayCards.reduce((sum, c) => sum + c.total, 0),
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

    // Build selected services list
    const selectedList = [];

    if (services.wheelAlignment?.enabled) {
      selectedList.push({ name: 'Wheel Alignment', amount: services.wheelAlignment.price });
    }
    if (services.wheelBalancing?.enabled) {
      const typeLabel = services.wheelBalancing.type === 'two' ? '2 Tyres' : '4 Tyres';
      const amt = services.wheelBalancing.type === 'two' ? services.wheelBalancing.priceTwo : services.wheelBalancing.priceFour;
      selectedList.push({ name: `Wheel Balancing (${typeLabel})`, amount: amt });
    }
    if (services.weight?.enabled) {
      const g = parseInt(services.weight.grams, 10) || 0;
      const label = services.weight.weightType === 'brass' ? 'Brass Weight' : 'Sticker Weight';
      const amt = g * services.weight.pricePerGram;
      selectedList.push({ name: `Wheel Weight (${label} - ${g}g)`, amount: amt });
    }
    if (services.tyreFitting?.enabled) {
      const fQty = parseInt(services.tyreFitting.fittingQty, 10) || 0;
      const fitAmt = fQty * services.tyreFitting.fittingRate;
      let label = `Tyre Fitting (${fQty} Tyres)`;
      let totalAmt = fitAmt;
      
      if (services.tyreFitting.newValve) {
        const vQty = parseInt(services.tyreFitting.valveQty, 10) || 0;
        const vRate = parseInt(services.tyreFitting.valveRate, 10) || 0;
        const vAmt = vQty * vRate;
        label += ` + ${vQty} New Valves`;
        totalAmt += vAmt;
      }
      selectedList.push({ name: label, amount: totalAmt });
    }
    if (services.tyreRotation?.enabled) {
      selectedList.push({ name: 'Tyre Rotation', amount: services.tyreRotation.price });
    }
    if (services.headlightBuffing?.enabled) {
      selectedList.push({ name: 'Head Light Buffing (Cleaning)', amount: services.headlightBuffing.price });
    }
    if (services.airFilling?.enabled) {
      const label = services.airFilling.airType === 'nitrogen' ? 'Nitrogen Air Filling' : 'Normal Air Filling';
      const amt = services.airFilling.airType === 'nitrogen' ? services.airFilling.price : 40;
      selectedList.push({ name: label, amount: amt });
    }
    if (services.tubelessPuncher?.enabled) {
      const qty = parseInt(services.tubelessPuncher.qty, 10) || 0;
      const amt = qty * services.tubelessPuncher.pricePerPuncher;
      selectedList.push({ name: `Tubeless Puncher (${qty} Repairs)`, amount: amt });
    }
    if (services.camberSetting?.enabled) {
      let label = 'Camber Setting (Front R/L)';
      let amt = services.camberSetting.priceFront;
      if (services.camberSetting.position === 'rear') {
        label = 'Camber Setting (Rear R/L)';
        amt = services.camberSetting.priceRear;
      } else if (services.camberSetting.position === 'both') {
        label = 'Camber Setting (Front & Rear R/L)';
        amt = services.camberSetting.priceBoth;
      }
      selectedList.push({ name: label, amount: amt });
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
    // Reset Form
    setCustomerData({ name: '', mobile: '', vehicle: '', year: '', odometer: '' });
    setDiscount(0);
    setServices(getServicePrices());
  };

  // MANDATORY LOGIN GATE: If not authenticated, render Login Gate ONLY!
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
              />
            )}
          </>
        )}

        {activeTab === 'customers' && (
          <CustomerHistory jobCards={jobCards} />
        )}

        {activeTab === 'analytics' && (
          <Analytics jobCards={jobCards} />
        )}

        {activeTab === 'inventory' && (
          <Inventory inventory={inventory} setInventory={setInventory} />
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
