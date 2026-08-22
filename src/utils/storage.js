import { DEFAULT_SERVICES, INITIAL_JOB_CARDS, INITIAL_INVENTORY } from '../data/mockData';

const KEYS = {
  JOB_CARDS: 'stop_go_job_cards_v2',
  INVENTORY: 'stop_go_inventory_v2',
  SERVICE_PRICES: 'stop_go_service_prices',
  ADMIN_AUTH: 'stop_go_admin_auth'
};

export const getJobCards = () => {
  const data = localStorage.getItem(KEYS.JOB_CARDS);
  if (!data) {
    localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(INITIAL_JOB_CARDS));
    return INITIAL_JOB_CARDS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_JOB_CARDS;
  }
};

export const saveJobCard = (newCard) => {
  const current = getJobCards();
  const updated = [newCard, ...current];
  localStorage.setItem(KEYS.JOB_CARDS, JSON.stringify(updated));
  
  // Deduct Inventory automatically
  deductInventoryForJobCard(newCard);
  
  return updated;
};

export const getInventory = () => {
  const data = localStorage.getItem(KEYS.INVENTORY);
  if (!data) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    return INITIAL_INVENTORY;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_INVENTORY;
  }
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
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SERVICES;
  }
};

export const saveServicePrices = (newPrices) => {
  localStorage.setItem(KEYS.SERVICE_PRICES, JSON.stringify(newPrices));
  return newPrices;
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
      year: match.year,
      odometer: match.odometer
    };
  }
  return null;
};
