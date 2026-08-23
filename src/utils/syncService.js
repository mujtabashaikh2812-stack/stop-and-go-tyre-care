import { getJobCards, getInventory, getBookings, getExpenses, getSalaries, getScrapSales } from './storage';

// Configurable API endpoint (Vercel Serverless Function or Node.js backend)
const API_URL = import.meta.env.VITE_API_URL || 'https://stop-and-go-tyre-care.vercel.app/api';

export const triggerCloudSync = async () => {
  // Check if phone/device is online
  if (!navigator.onLine) {
    console.log('⚡ Device is offline. Data safely stored in Local Storage.');
    return false;
  }

  try {
    const jobCards = getJobCards();
    const inventory = getInventory();
    const bookings = getBookings();
    const expenses = getExpenses();
    const salaries = getSalaries();
    const scrapSales = getScrapSales();

    const payload = {
      jobCards,
      inventory,
      bookings,
      expenses,
      salaries,
      scrapSales
    };

    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('🍃 MongoDB Cloud Sync Completed:', data);
      return true;
    }
  } catch (error) {
    console.log('⚠️ MongoDB Cloud Sync postponed (server offline/unreachable). Local data intact.');
  }
  return false;
};

export const fetchCloudData = async () => {
  if (!navigator.onLine) return null;

  try {
    const response = await fetch(`${API_URL}/data`);
    if (response.ok) {
      const cloudData = await response.json();
      return cloudData;
    }
  } catch (error) {
    console.log('⚠️ Cloud fetch postponed. Using local cache.');
  }
  return null;
};
