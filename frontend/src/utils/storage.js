import { DEFAULT_SERVICES, INITIAL_JOB_CARDS, INITIAL_INVENTORY, INITIAL_BOOKINGS, INITIAL_EXPENSES, INITIAL_SALARIES, INITIAL_SCRAP_SALES } from '../data/mockData';
import { saveItemToCloud, deleteItemFromCloud } from './syncService';

const KEYS = {
  JOB_CARDS: 'stop_go_job_cards_v3',
  INVENTORY: 'stop_go_inventory_v4',
  SERVICE_PRICES: 'stop_go_service_prices_v4',
  ADMIN_PASSWORD: 'stop_go_admin_password',
  BOOKINGS: 'stop_go_bookings',
  EXPENSES: 'stop_go_expenses',
  SALARIES: 'stop_go_salaries',
  SCRAP_SALES: 'stop_go_scrap_sales',
  LANGUAGE: 'stop_go_language',
  PARTNER_GARAGES: 'stop_go_partner_garages_v1',
  PARTNER_BATCHES: 'stop_go_partner_batches_v1',
  TYRE_WARRANTIES: 'stop_go_tyre_warranties_v1'
};

const CLEAN_INITIAL_INVENTORY = [
  { id: 'sticker_weights', name: 'Sticker Wheel Weights', unit: 'Grams', inStock: 0, reorderLevel: 500 },
  { id: 'brass_weights', name: 'Brass Wheel Weights', unit: 'Grams', inStock: 0, reorderLevel: 500 },
  { id: 'tyre_valves', name: 'Tubeless Tyre Valves', unit: 'Pieces', inStock: 0, reorderLevel: 25 }
];

export const getLanguage = () => {
  return localStorage.getItem(KEYS.LANGUAGE) || 'en';
};

export const setLanguage = (lang) => {
  localStorage.setItem(KEYS.LANGUAGE, lang);
  return lang;
};

export const getAdminPassword = () => {
  return localStorage.getItem(KEYS.ADMIN_PASSWORD) || 'admin123';
};

export const saveAdminPassword = (newPassword) => {
  localStorage.setItem(KEYS.ADMIN_PASSWORD, newPassword);
  return newPassword;
};

export const getJobCards = () => {
  const data = localStorage.getItem(KEYS.JOB_CARDS);
  if (!data) {
    localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(INITIAL_JOB_CARDS));
    return INITIAL_JOB_CARDS;
  }
  try { return JSON.parse(data); } catch (e) { return INITIAL_JOB_CARDS; }
};

export const saveJobCard = (newCard) => {
  const current = getJobCards();
  const updated = [newCard, ...current];
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  deductInventoryForJobCard(newCard);
  saveItemToCloud('jobCards', newCard);
  return updated;
};

// UPDATE / OVERWRITE EXISTING BILL (NO DUPLICATE)
export const updateExistingJobCard = (updatedCard) => {
  const current = getJobCards();
  const updated = current.map(c => c.id === updatedCard.id ? updatedCard : c);
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  saveItemToCloud('jobCards', updatedCard);
  return updated;
};

export const deleteJobCard = (id) => {
  const current = getJobCards();
  const updated = current.filter(c => c.id !== id);
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  deleteItemFromCloud('jobCards', id);
  return updated;
};

export const deleteCustomerByMobile = (mobile) => {
  const current = getJobCards();
  const updated = current.filter(c => c.mobile !== mobile);
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  return updated;
};

// INVENTORY STORAGE & MANAGEMENT
export const getInventory = () => {
  const data = localStorage.getItem(KEYS.INVENTORY);
  if (!data) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(CLEAN_INITIAL_INVENTORY));
    return CLEAN_INITIAL_INVENTORY;
  }
  try {
    const parsed = JSON.parse(data);
    const filtered = parsed.filter(item => item.id !== 'nitrogen_tank');
    return filtered.length > 0 ? filtered : CLEAN_INITIAL_INVENTORY;
  } catch (e) {
    return CLEAN_INITIAL_INVENTORY;
  }
};

export const updateInventoryItem = (id, newStock) => {
  const inventory = getInventory();
  const updated = inventory.map(item => item.id === id ? { ...item, inStock: newStock } : item);
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(updated));
  const target = updated.find(i => i.id === id);
  if (target) saveItemToCloud('inventory', target);
  return updated;
};

export const addInventoryItem = (name, unit, initialStock = 0, reorderLevel = 10) => {
  const inventory = getInventory();
  const newItem = {
    id: `inv_${Date.now()}`,
    name,
    unit: unit || 'Pieces',
    inStock: parseFloat(initialStock) || 0,
    reorderLevel: parseFloat(reorderLevel) || 10
  };
  const updated = [...inventory, newItem];
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(updated));
  saveItemToCloud('inventory', newItem);
  return updated;
};

export const deleteInventoryItem = (id) => {
  const inventory = getInventory();
  const updated = inventory.filter(item => item.id !== id);
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(updated));
  deleteItemFromCloud('inventory', id);
  return updated;
};

const deductInventoryForJobCard = (jobCard) => {
  if (!jobCard || !jobCard.services) return;
  const inventory = getInventory();
  const services = jobCard.services;
  let changed = false;

  const updated = inventory.map(item => {
    let copy = { ...item };

    if (item.id === 'sticker_weights' && services.weight?.enabled && services.weight?.weightType === 'sticker') {
      const grams = parseInt(services.weight.grams, 10) || 0;
      if (grams > 0) {
        copy.inStock = Math.max(0, copy.inStock - grams);
        changed = true;
      }
    }

    if (item.id === 'brass_weights' && services.weight?.enabled && services.weight?.weightType === 'brass') {
      const grams = parseInt(services.weight.grams, 10) || 0;
      if (grams > 0) {
        copy.inStock = Math.max(0, copy.inStock - grams);
        changed = true;
      }
    }

    if (item.id === 'tyre_valves' && services.tyreFitting?.enabled && services.tyreFitting?.newValve) {
      const qty = parseInt(services.tyreFitting.valveQty, 10) || 0;
      if (qty > 0) {
        copy.inStock = Math.max(0, copy.inStock - qty);
        changed = true;
      }
    }

    return copy;
  });

  if (changed) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(updated));
  }
};

export const getServicePrices = () => {
  const data = localStorage.getItem(KEYS.SERVICE_PRICES);
  if (!data) {
    localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(DEFAULT_SERVICES));
    return DEFAULT_SERVICES;
  }
  try { 
    const parsed = JSON.parse(data);
    return { ...DEFAULT_SERVICES, ...parsed };
  } catch (e) { return DEFAULT_SERVICES; }
};

export const saveServicePrices = (prices) => {
  localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(prices));
  saveItemToCloud('servicePrices', { id: 'current', value: prices });
  return prices;
};

export const resetDefaultServicePrices = () => {
  localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(DEFAULT_SERVICES));
  return DEFAULT_SERVICES;
};

export const addCustomService = (serviceName, defaultPrice) => {
  const current = getServicePrices();
  const key = `custom_${Date.now()}`;
  const updated = {
    ...current,
    [key]: {
      id: key,
      name: serviceName,
      price: parseFloat(defaultPrice) || 0,
      enabled: false,
      isCustom: true
    }
  };
  saveServicePrices(updated);
  return updated;
};

export const deleteCustomService = (serviceKey) => {
  const current = getServicePrices();
  const updated = { ...current };
  delete updated[serviceKey];
  saveServicePrices(updated);
  return updated;
};

// Bookings
export const getBookings = () => {
  const data = localStorage.getItem(KEYS.BOOKINGS);
  if (!data) return INITIAL_BOOKINGS;
  try { return JSON.parse(data); } catch (e) { return INITIAL_BOOKINGS; }
};

export const saveBooking = (booking) => {
  const current = getBookings();
  const updated = [booking, ...current];
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(updated));
  saveItemToCloud('bookings', booking);
  return updated;
};

export const addBooking = saveBooking;

export const deleteBooking = (id) => {
  const current = getBookings();
  const updated = current.filter(b => b.id !== id);
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(updated));
  deleteItemFromCloud('bookings', id);
  return updated;
};

export const updateBookingStatus = (id, status) => {
  const current = getBookings();
  const updated = current.map(b => b.id === id ? { ...b, status } : b);
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(updated));
  const target = updated.find(b => b.id === id);
  if (target) saveItemToCloud('bookings', target);
  return updated;
};

// Daily Expenses
export const getExpenses = () => {
  const data = localStorage.getItem(KEYS.EXPENSES);
  if (!data) return INITIAL_EXPENSES;
  try { return JSON.parse(data); } catch (e) { return INITIAL_EXPENSES; }
};

export const addExpense = (exp) => {
  const current = getExpenses();
  const updated = [exp, ...current];
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
  saveItemToCloud('expenses', exp);
  return updated;
};

export const deleteExpense = (id) => {
  const current = getExpenses();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
  deleteItemFromCloud('expenses', id);
  return updated;
};

// Staff Salaries
export const getSalaries = () => {
  const data = localStorage.getItem(KEYS.SALARIES);
  if (!data) return INITIAL_SALARIES;
  try { return JSON.parse(data); } catch (e) { return INITIAL_SALARIES; }
};

export const addSalaryRecord = (sal) => {
  const current = getSalaries();
  const updated = [sal, ...current];
  localStorage.setItem(KEYS.SALARIES, JSON.stringify(updated));
  saveItemToCloud('salaries', sal);
  return updated;
};

export const deleteSalaryRecord = (id) => {
  const current = getSalaries();
  const updated = current.filter(s => s.id !== id);
  localStorage.setItem(KEYS.SALARIES, JSON.stringify(updated));
  deleteItemFromCloud('salaries', id);
  return updated;
};

// Scrap Tyre Sales
export const getScrapSales = () => {
  const data = localStorage.getItem(KEYS.SCRAP_SALES);
  if (!data) return INITIAL_SCRAP_SALES;
  try { return JSON.parse(data); } catch (e) { return INITIAL_SCRAP_SALES; }
};

export const addScrapSale = (sale) => {
  const current = getScrapSales();
  const updated = [sale, ...current];
  localStorage.setItem(KEYS.SCRAP_SALES, JSON.stringify(updated));
  saveItemToCloud('scrapSales', sale);
  return updated;
};

export const deleteScrapSale = (id) => {
  const current = getScrapSales();
  const updated = current.filter(s => s.id !== id);
  localStorage.setItem(KEYS.SCRAP_SALES, JSON.stringify(updated));
  deleteItemFromCloud('scrapSales', id);
  return updated;
};

// ==========================================
// B2B PARTNER GARAGES & BATCHES MANAGEMENT
// ==========================================

export const getPartnerGarages = () => {
  const data = localStorage.getItem(KEYS.PARTNER_GARAGES);
  if (!data) {
    const initialGarages = [
      { id: 'pg_1', name: 'Sahara Motors', contactPerson: 'Aslam Khan', mobile: '9822011223', address: 'Hotgi Road Industrial Estate, Solapur', notes: 'Primary bulk drop-off garage client' }
    ];
    localStorage.setItem(KEYS.PARTNER_GARAGES, JSON.stringify(initialGarages));
    return initialGarages;
  }
  try { return JSON.parse(data); } catch (e) { return []; }
};

export const savePartnerGarage = (garage) => {
  const current = getPartnerGarages();
  const newGarage = {
    ...garage,
    id: garage.id || `pg_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newGarage, ...current];
  localStorage.setItem(KEYS.PARTNER_GARAGES, JSON.stringify(updated));
  saveItemToCloud('partnerGarages', newGarage);
  return updated;
};

export const deletePartnerGarage = (id) => {
  const current = getPartnerGarages();
  const updated = current.filter(g => g.id !== id);
  localStorage.setItem(KEYS.PARTNER_GARAGES, JSON.stringify(updated));
  deleteItemFromCloud('partnerGarages', id);
  return updated;
};

export const getPartnerBatches = () => {
  const data = localStorage.getItem(KEYS.PARTNER_BATCHES);
  if (!data) return [];
  try { return JSON.parse(data); } catch (e) { return []; }
};

export const savePartnerBatch = (batch) => {
  const current = getPartnerBatches();
  const newBatch = {
    ...batch,
    id: batch.id || `SGB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: batch.status || 'Active',
    vehicles: batch.vehicles || [],
    payments: batch.payments || [],
    createdAt: new Date().toISOString()
  };
  const updated = [newBatch, ...current];
  localStorage.setItem(KEYS.PARTNER_BATCHES, JSON.stringify(updated));
  saveItemToCloud('partnerBatches', newBatch);
  return updated;
};

export const updatePartnerBatch = (updatedBatch) => {
  const current = getPartnerBatches();
  const updated = current.map(b => b.id === updatedBatch.id ? updatedBatch : b);
  localStorage.setItem(KEYS.PARTNER_BATCHES, JSON.stringify(updated));
  saveItemToCloud('partnerBatches', updatedBatch);
  return updated;
};

export const deletePartnerBatch = (id) => {
  const current = getPartnerBatches();
  const updated = current.filter(b => b.id !== id);
  localStorage.setItem(KEYS.PARTNER_BATCHES, JSON.stringify(updated));
  deleteItemFromCloud('partnerBatches', id);
  return updated;
};

export const getTyreWarranties = () => {
  const data = localStorage.getItem(KEYS.TYRE_WARRANTIES);
  if (!data) return [];
  try { return JSON.parse(data); } catch (e) { return []; }
};

export const saveTyreWarranty = (warranty) => {
  const current = getTyreWarranties();
  const newObj = {
    ...warranty,
    id: warranty.id || `WAR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newObj, ...current];
  localStorage.setItem(KEYS.TYRE_WARRANTIES, JSON.stringify(updated));
  saveItemToCloud('tyreWarranties', newObj);
  return updated;
};

export const deleteTyreWarranty = (id) => {
  const current = getTyreWarranties();
  const updated = current.filter(w => w.id !== id);
  localStorage.setItem(KEYS.TYRE_WARRANTIES, JSON.stringify(updated));
  deleteItemFromCloud('tyreWarranties', id);
  return updated;
};

export const saveCloudData = (cloudData) => {
  if (!cloudData) return;
  if (Array.isArray(cloudData.jobCards) && cloudData.jobCards.length > 0) {
    localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(cloudData.jobCards));
  }
  if (Array.isArray(cloudData.inventory) && cloudData.inventory.length > 0) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(cloudData.inventory));
  }
  if (Array.isArray(cloudData.bookings) && cloudData.bookings.length > 0) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(cloudData.bookings));
  }
  if (Array.isArray(cloudData.expenses) && cloudData.expenses.length > 0) {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(cloudData.expenses));
  }
  if (Array.isArray(cloudData.salaries) && cloudData.salaries.length > 0) {
    localStorage.setItem(KEYS.SALARIES, JSON.stringify(cloudData.salaries));
  }
  if (Array.isArray(cloudData.scrapSales) && cloudData.scrapSales.length > 0) {
    localStorage.setItem(KEYS.SCRAP_SALES, JSON.stringify(cloudData.scrapSales));
  }
  if (Array.isArray(cloudData.partnerGarages) && cloudData.partnerGarages.length > 0) {
    localStorage.setItem(KEYS.PARTNER_GARAGES, JSON.stringify(cloudData.partnerGarages));
  }
  if (Array.isArray(cloudData.partnerBatches) && cloudData.partnerBatches.length > 0) {
    localStorage.setItem(KEYS.PARTNER_BATCHES, JSON.stringify(cloudData.partnerBatches));
  }
  if (Array.isArray(cloudData.tyreWarranties) && cloudData.tyreWarranties.length > 0) {
    localStorage.setItem(KEYS.TYRE_WARRANTIES, JSON.stringify(cloudData.tyreWarranties));
  }
  if (cloudData.servicePrices && Object.keys(cloudData.servicePrices).length > 0) {
    localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(cloudData.servicePrices));
  }
};

export const searchCustomerByMobile = (mobile) => {
  if (!mobile || mobile.length < 3) return null;
  const cards = getJobCards();
  const match = cards.find(c => c.mobile.includes(mobile));
  if (match) {
    return {
      customerName: match.customerName,
      mobile: match.mobile,
      vehicleName: match.vehicleName,
      vehicleNumber: match.vehicleNumber || 'MH-12-AB-1234',
      year: match.year,
      odometer: match.odometer
    };
  }
  return null;
};
