import { DEFAULT_SERVICES, INITIAL_JOB_CARDS, INITIAL_INVENTORY, INITIAL_BOOKINGS, INITIAL_EXPENSES, INITIAL_SALARIES, INITIAL_SCRAP_SALES } from '../data/mockData';

const KEYS = {
  JOB_CARDS: 'stop_go_job_cards_v3',
  INVENTORY: 'stop_go_inventory_v3',
  SERVICE_PRICES: 'stop_go_service_prices_v4',
  ADMIN_PASSWORD: 'stop_go_admin_password',
  BOOKINGS: 'stop_go_bookings',
  EXPENSES: 'stop_go_expenses',
  SALARIES: 'stop_go_salaries',
  SCRAP_SALES: 'stop_go_scrap_sales',
  LANGUAGE: 'stop_go_language'
};

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
  return updated;
};

export const deleteJobCard = (id) => {
  const current = getJobCards();
  const updated = current.filter(c => c.id !== id);
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  return updated;
};

export const deleteCustomerByMobile = (mobile) => {
  const current = getJobCards();
  const updated = current.filter(c => c.mobile !== mobile);
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  return updated;
};

export const getInventory = () => {
  const data = localStorage.getItem(KEYS.INVENTORY);
  if (!data) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    return INITIAL_INVENTORY;
  }
  try { return JSON.parse(data); } catch (e) { return INITIAL_INVENTORY; }
};

export const updateInventoryItem = (id, newStock) => {
  const inventory = getInventory();
  const updated = inventory.map(item => item.id === id ? { ...item, inStock: newStock } : item);
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(updated));
  return updated;
};

const deductInventoryForJobCard = (jobCard) => {
  const inventory = getInventory();
  let updated = [...inventory];
  
  jobCard.services.forEach(serv => {
    if (serv.name.includes('Weight')) {
      const matchGrams = serv.name.match(/(\d+)g/);
      if (matchGrams) {
        const grams = parseInt(matchGrams[1], 10);
        const itemKey = serv.name.includes('Brass') ? 'brass_weights' : 'sticker_weights';
        updated = updated.map(item => item.id === itemKey ? { ...item, inStock: Math.max(0, item.inStock - grams) } : item);
      }
    }
    if (serv.name.includes('Valves')) {
      const matchValves = serv.name.match(/(\d+) New Valves/);
      if (matchValves) {
        const count = parseInt(matchValves[1], 10);
        updated = updated.map(item => item.id === 'tyre_valves' ? { ...item, inStock: Math.max(0, item.inStock - count) } : item);
      }
    }
  });

  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(updated));
};

export const getServicePrices = () => {
  const data = localStorage.getItem(KEYS.SERVICE_PRICES);
  if (!data) {
    localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(DEFAULT_SERVICES));
    return DEFAULT_SERVICES;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_SERVICES; }
};

export const saveServicePrices = (newPrices) => {
  localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(newPrices));
  return newPrices;
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

// DELETE SERVICE FROM MASTER PRICES
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

export const addBooking = (booking) => {
  const current = getBookings();
  const updated = [booking, ...current];
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(updated));
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
  return updated;
};

export const deleteExpense = (id) => {
  const current = getExpenses();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
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
  return updated;
};

export const deleteSalaryRecord = (id) => {
  const current = getSalaries();
  const updated = current.filter(s => s.id !== id);
  localStorage.setItem(KEYS.SALARIES, JSON.stringify(updated));
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
  return updated;
};

export const deleteScrapSale = (id) => {
  const current = getScrapSales();
  const updated = current.filter(s => s.id !== id);
  localStorage.setItem(KEYS.SCRAP_SALES, JSON.stringify(updated));
  return updated;
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
