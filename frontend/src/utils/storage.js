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
  TYRE_WARRANTIES: 'stop_go_tyre_warranties_v1',
  DELETED_ITEMS: 'stop_go_deleted_items_v1'
};

const CLEAN_INITIAL_INVENTORY = [
  { id: 'sticker_weights', name: 'Sticker Wheel Weights', unit: 'Grams', inStock: 0, reorderLevel: 500 },
  { id: 'brass_weights', name: 'Brass Wheel Weights', unit: 'Grams', inStock: 0, reorderLevel: 500 },
  { id: 'tyre_valves', name: 'Tubeless Tyre Valves', unit: 'Pieces', inStock: 0, reorderLevel: 25 }
];

// ==========================================
// PERSISTENT TOMBSTONE DELETION MANAGEMENT
// ==========================================

export const getDeletedItems = () => {
  const data = localStorage.getItem(KEYS.DELETED_ITEMS);
  if (!data) return [];
  try { return JSON.parse(data); } catch (e) { return []; }
};

export const recordDeletedItem = (collectionName, id) => {
  if (!collectionName || !id) return;
  const current = getDeletedItems();
  const idStr = String(id);
  const exists = current.some(item => item.collectionName === collectionName && String(item.id) === idStr);
  if (!exists) {
    const updated = [...current, { collectionName, id: idStr, deletedAt: new Date().toISOString() }];
    localStorage.setItem(KEYS.DELETED_ITEMS, JSON.stringify(updated));
  }
};

export const clearDeletedItem = (collectionName, id) => {
  if (!collectionName || !id) return;
  const current = getDeletedItems();
  const idStr = String(id);
  const updated = current.filter(item => !(item.collectionName === collectionName && String(item.id) === idStr));
  localStorage.setItem(KEYS.DELETED_ITEMS, JSON.stringify(updated));
};

const filterOutDeleted = (collectionName, items) => {
  if (!Array.isArray(items)) return [];
  const tombstones = getDeletedItems();
  const tombSet = new Set(tombstones.filter(t => t.collectionName === collectionName).map(t => String(t.id)));
  return items.filter(item => item && item.id && !tombSet.has(String(item.id)));
};

// ==========================================
// LANGUAGE & ADMIN AUTH
// ==========================================

export const getLanguage = () => {
  return localStorage.getItem(KEYS.LANGUAGE) || 'en';
};

export const setLanguage = (lang) => {
  localStorage.setItem(KEYS.LANGUAGE, lang);
  return lang;
};

export const getAdminPassword = () => {
  return localStorage.getItem(KEYS.ADMIN_PASSWORD) || 'stopandgo';
};

export const saveAdminPassword = (newPassword) => {
  localStorage.setItem(KEYS.ADMIN_PASSWORD, newPassword);
  saveItemToCloud('adminPassword', { id: 'current', value: newPassword });
  return newPassword;
};

// ==========================================
// JOB CARDS MANAGEMENT
// ==========================================

export const getJobCards = () => {
  const data = localStorage.getItem(KEYS.JOB_CARDS);
  let parsed = [];
  if (data) {
    try { parsed = JSON.parse(data); } catch (e) { parsed = INITIAL_JOB_CARDS; }
  } else {
    parsed = INITIAL_JOB_CARDS;
  }
  return filterOutDeleted('jobCards', parsed);
};

export const saveJobCard = (newCard) => {
  clearDeletedItem('jobCards', newCard.id);
  const current = getJobCards();
  const updated = [newCard, ...current];
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  deductInventoryForJobCard(newCard);
  saveItemToCloud('jobCards', newCard);
  return updated;
};

export const updateExistingJobCard = (updatedCard) => {
  clearDeletedItem('jobCards', updatedCard.id);
  const current = getJobCards();
  const updated = current.map(c => c.id === updatedCard.id ? updatedCard : c);
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  saveItemToCloud('jobCards', updatedCard);
  return updated;
};

export const deleteJobCard = (id) => {
  recordDeletedItem('jobCards', id);
  const current = getJobCards();
  const updated = current.filter(c => String(c.id) !== String(id));
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  deleteItemFromCloud('jobCards', id);
  return updated;
};

export const deleteCustomerByMobile = (mobile) => {
  const current = getJobCards();
  const cardsToDelete = current.filter(c => c.mobile === mobile);
  cardsToDelete.forEach(card => {
    recordDeletedItem('jobCards', card.id);
    deleteItemFromCloud('jobCards', card.id);
  });
  const updated = current.filter(c => c.mobile !== mobile);
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  return updated;
};

// ==========================================
// INVENTORY MANAGEMENT
// ==========================================

export const getInventory = () => {
  const data = localStorage.getItem(KEYS.INVENTORY);
  let parsed = CLEAN_INITIAL_INVENTORY;
  if (data) {
    try {
      const read = JSON.parse(data);
      const filtered = read.filter(item => item.id !== 'nitrogen_tank');
      parsed = filtered.length > 0 ? filtered : CLEAN_INITIAL_INVENTORY;
    } catch (e) {
      parsed = CLEAN_INITIAL_INVENTORY;
    }
  }
  return filterOutDeleted('inventory', parsed);
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
  clearDeletedItem('inventory', newItem.id);
  const updated = [...inventory, newItem];
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(updated));
  saveItemToCloud('inventory', newItem);
  return updated;
};

export const deleteInventoryItem = (id) => {
  recordDeletedItem('inventory', id);
  const inventory = getInventory();
  const updated = inventory.filter(item => String(item.id) !== String(id));
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

// ==========================================
// SERVICE MASTER PRICES
// ==========================================

export const getServicePrices = () => {
  const data = localStorage.getItem(KEYS.SERVICE_PRICES);
  if (!data) {
    localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(DEFAULT_SERVICES));
    return DEFAULT_SERVICES;
  }
  try { 
    const parsed = JSON.parse(data);
    const merged = { ...DEFAULT_SERVICES, ...parsed };
    Object.keys(merged).forEach(k => {
      if (merged[k] && typeof merged[k].name === 'string') {
        merged[k].name = merged[k].name.replace(' (Future Service)', '');
      }
    });
    return merged;
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

// ==========================================
// BOOKINGS MANAGEMENT
// ==========================================

export const getBookings = () => {
  const data = localStorage.getItem(KEYS.BOOKINGS);
  let parsed = INITIAL_BOOKINGS;
  if (data) {
    try { parsed = JSON.parse(data); } catch (e) { parsed = INITIAL_BOOKINGS; }
  }
  return filterOutDeleted('bookings', parsed);
};

export const saveBooking = (booking) => {
  clearDeletedItem('bookings', booking.id);
  const current = getBookings();
  const updated = [booking, ...current];
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(updated));
  saveItemToCloud('bookings', booking);
  return updated;
};

export const addBooking = saveBooking;

export const deleteBooking = (id) => {
  recordDeletedItem('bookings', id);
  const current = getBookings();
  const updated = current.filter(b => String(b.id) !== String(id));
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

// ==========================================
// EXPENSES & SALARIES & SCRAP SALES
// ==========================================

export const getExpenses = () => {
  const data = localStorage.getItem(KEYS.EXPENSES);
  let parsed = INITIAL_EXPENSES;
  if (data) {
    try { parsed = JSON.parse(data); } catch (e) { parsed = INITIAL_EXPENSES; }
  }
  return filterOutDeleted('expenses', parsed);
};

export const addExpense = (exp) => {
  clearDeletedItem('expenses', exp.id);
  const current = getExpenses();
  const updated = [exp, ...current];
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
  saveItemToCloud('expenses', exp);
  return updated;
};

export const deleteExpense = (id) => {
  recordDeletedItem('expenses', id);
  const current = getExpenses();
  const updated = current.filter(e => String(e.id) !== String(id));
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
  deleteItemFromCloud('expenses', id);
  return updated;
};

export const getSalaries = () => {
  const data = localStorage.getItem(KEYS.SALARIES);
  let parsed = INITIAL_SALARIES;
  if (data) {
    try { parsed = JSON.parse(data); } catch (e) { parsed = INITIAL_SALARIES; }
  }
  return filterOutDeleted('salaries', parsed);
};

export const addSalaryRecord = (sal) => {
  clearDeletedItem('salaries', sal.id);
  const current = getSalaries();
  const updated = [sal, ...current];
  localStorage.setItem(KEYS.SALARIES, JSON.stringify(updated));
  saveItemToCloud('salaries', sal);
  return updated;
};

export const deleteSalaryRecord = (id) => {
  recordDeletedItem('salaries', id);
  const current = getSalaries();
  const updated = current.filter(s => String(s.id) !== String(id));
  localStorage.setItem(KEYS.SALARIES, JSON.stringify(updated));
  deleteItemFromCloud('salaries', id);
  return updated;
};

export const getScrapSales = () => {
  const data = localStorage.getItem(KEYS.SCRAP_SALES);
  let parsed = INITIAL_SCRAP_SALES;
  if (data) {
    try { parsed = JSON.parse(data); } catch (e) { parsed = INITIAL_SCRAP_SALES; }
  }
  return filterOutDeleted('scrapSales', parsed);
};

export const addScrapSale = (sale) => {
  clearDeletedItem('scrapSales', sale.id);
  const current = getScrapSales();
  const updated = [sale, ...current];
  localStorage.setItem(KEYS.SCRAP_SALES, JSON.stringify(updated));
  saveItemToCloud('scrapSales', sale);
  return updated;
};

export const deleteScrapSale = (id) => {
  recordDeletedItem('scrapSales', id);
  const current = getScrapSales();
  const updated = current.filter(s => String(s.id) !== String(id));
  localStorage.setItem(KEYS.SCRAP_SALES, JSON.stringify(updated));
  deleteItemFromCloud('scrapSales', id);
  return updated;
};

// ==========================================
// B2B PARTNER GARAGES & BATCHES MANAGEMENT
// ==========================================

export const getPartnerGarages = () => {
  const data = localStorage.getItem(KEYS.PARTNER_GARAGES);
  let parsed = [];
  if (data) {
    try { parsed = JSON.parse(data); } catch (e) { parsed = []; }
  } else {
    parsed = [
      { id: 'pg_1', name: 'Sahara Motors', contactPerson: 'Aslam Khan', mobile: '9822011223', address: 'Hotgi Road Industrial Estate, Solapur', notes: 'Primary bulk drop-off garage client' }
    ];
  }
  return filterOutDeleted('partnerGarages', parsed);
};

export const savePartnerGarage = (garage) => {
  const newGarage = {
    ...garage,
    id: garage.id || `pg_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  clearDeletedItem('partnerGarages', newGarage.id);
  const current = getPartnerGarages();
  const updated = [newGarage, ...current];
  localStorage.setItem(KEYS.PARTNER_GARAGES, JSON.stringify(updated));
  saveItemToCloud('partnerGarages', newGarage);
  return updated;
};

export const deletePartnerGarage = (id) => {
  recordDeletedItem('partnerGarages', id);
  const current = getPartnerGarages();
  const updated = current.filter(g => String(g.id) !== String(id));
  localStorage.setItem(KEYS.PARTNER_GARAGES, JSON.stringify(updated));
  deleteItemFromCloud('partnerGarages', id);
  return updated;
};

export const getPartnerBatches = () => {
  const data = localStorage.getItem(KEYS.PARTNER_BATCHES);
  let parsed = [];
  if (data) {
    try { parsed = JSON.parse(data); } catch (e) { parsed = []; }
  }
  return filterOutDeleted('partnerBatches', parsed);
};

export const savePartnerBatch = (batch) => {
  const newBatch = {
    ...batch,
    id: batch.id || `SGB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: batch.status || 'Active',
    vehicles: batch.vehicles || [],
    payments: batch.payments || [],
    createdAt: new Date().toISOString()
  };
  clearDeletedItem('partnerBatches', newBatch.id);
  const current = getPartnerBatches();
  const updated = [newBatch, ...current];
  localStorage.setItem(KEYS.PARTNER_BATCHES, JSON.stringify(updated));
  saveItemToCloud('partnerBatches', newBatch);
  return updated;
};

export const updatePartnerBatch = (updatedBatch) => {
  clearDeletedItem('partnerBatches', updatedBatch.id);
  const current = getPartnerBatches();
  const updated = current.map(b => b.id === updatedBatch.id ? updatedBatch : b);
  localStorage.setItem(KEYS.PARTNER_BATCHES, JSON.stringify(updated));
  saveItemToCloud('partnerBatches', updatedBatch);
  return updated;
};

export const deletePartnerBatch = (id) => {
  recordDeletedItem('partnerBatches', id);
  const current = getPartnerBatches();
  const updated = current.filter(b => String(b.id) !== String(id));
  localStorage.setItem(KEYS.PARTNER_BATCHES, JSON.stringify(updated));
  deleteItemFromCloud('partnerBatches', id);
  return updated;
};

export const getTyreWarranties = () => {
  const data = localStorage.getItem(KEYS.TYRE_WARRANTIES);
  let parsed = [];
  if (data) {
    try { parsed = JSON.parse(data); } catch (e) { parsed = []; }
  }
  return filterOutDeleted('tyreWarranties', parsed);
};

export const saveTyreWarranty = (warranty) => {
  const newObj = {
    ...warranty,
    id: warranty.id || `WAR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString()
  };
  clearDeletedItem('tyreWarranties', newObj.id);
  const current = getTyreWarranties();
  const updated = [newObj, ...current];
  localStorage.setItem(KEYS.TYRE_WARRANTIES, JSON.stringify(updated));
  saveItemToCloud('tyreWarranties', newObj);
  return updated;
};

export const deleteTyreWarranty = (id) => {
  recordDeletedItem('tyreWarranties', id);
  const current = getTyreWarranties();
  const updated = current.filter(w => String(w.id) !== String(id));
  localStorage.setItem(KEYS.TYRE_WARRANTIES, JSON.stringify(updated));
  deleteItemFromCloud('tyreWarranties', id);
  return updated;
};

export const saveCloudData = (cloudData) => {
  if (!cloudData) return;

  // 1. Merge incoming tombstones into LocalStorage
  if (Array.isArray(cloudData.deletedItems) && cloudData.deletedItems.length > 0) {
    const currentTombstones = getDeletedItems();
    const map = new Map();
    currentTombstones.forEach(t => map.set(`${t.collectionName}:${String(t.id)}`, t));
    cloudData.deletedItems.forEach(t => {
      if (t && t.collectionName && t.id) {
        map.set(`${t.collectionName}:${String(t.id)}`, {
          collectionName: t.collectionName,
          id: String(t.id),
          deletedAt: t.deletedAt || new Date().toISOString()
        });
      }
    });
    localStorage.setItem(KEYS.DELETED_ITEMS, JSON.stringify(Array.from(map.values())));
  }

  const deletedItems = getDeletedItems();
  const deletedSet = new Set(deletedItems.map(item => `${item.collectionName}:${String(item.id)}`));
  const isNotDeleted = (collectionName, id) => !deletedSet.has(`${collectionName}:${String(id)}`);

  if (Array.isArray(cloudData.jobCards)) {
    const valid = cloudData.jobCards.filter(item => isNotDeleted('jobCards', item.id));
    localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(valid));
  }
  if (Array.isArray(cloudData.inventory)) {
    const valid = cloudData.inventory.filter(item => isNotDeleted('inventory', item.id));
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(valid));
  }
  if (Array.isArray(cloudData.bookings)) {
    const valid = cloudData.bookings.filter(item => isNotDeleted('bookings', item.id));
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(valid));
  }
  if (Array.isArray(cloudData.expenses)) {
    const valid = cloudData.expenses.filter(item => isNotDeleted('expenses', item.id));
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(valid));
  }
  if (Array.isArray(cloudData.salaries)) {
    const valid = cloudData.salaries.filter(item => isNotDeleted('salaries', item.id));
    localStorage.setItem(KEYS.SALARIES, JSON.stringify(valid));
  }
  if (Array.isArray(cloudData.scrapSales)) {
    const valid = cloudData.scrapSales.filter(item => isNotDeleted('scrapSales', item.id));
    localStorage.setItem(KEYS.SCRAP_SALES, JSON.stringify(valid));
  }
  if (Array.isArray(cloudData.partnerGarages)) {
    const valid = cloudData.partnerGarages.filter(item => isNotDeleted('partnerGarages', item.id));
    localStorage.setItem(KEYS.PARTNER_GARAGES, JSON.stringify(valid));
  }
  if (Array.isArray(cloudData.partnerBatches)) {
    const valid = cloudData.partnerBatches.filter(item => isNotDeleted('partnerBatches', item.id));
    localStorage.setItem(KEYS.PARTNER_BATCHES, JSON.stringify(valid));
  }
  if (Array.isArray(cloudData.tyreWarranties)) {
    const valid = cloudData.tyreWarranties.filter(item => isNotDeleted('tyreWarranties', item.id));
    localStorage.setItem(KEYS.TYRE_WARRANTIES, JSON.stringify(valid));
  }
  if (cloudData.servicePrices && Object.keys(cloudData.servicePrices).length > 0) {
    localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(cloudData.servicePrices));
  }
  if (Array.isArray(cloudData.adminPassword) && cloudData.adminPassword.length > 0) {
    const pwdObj = cloudData.adminPassword[0];
    if (pwdObj && pwdObj.value) {
      localStorage.setItem(KEYS.ADMIN_PASSWORD, pwdObj.value);
    }
  } else if (cloudData.adminPassword && typeof cloudData.adminPassword === 'object' && cloudData.adminPassword.value) {
    localStorage.setItem(KEYS.ADMIN_PASSWORD, cloudData.adminPassword.value);
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
