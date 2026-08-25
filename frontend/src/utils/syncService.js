import { getJobCards, getInventory, getServicePrices, getBookings, getExpenses, getSalaries, getScrapSales } from './storage';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = (configuredApiUrl || '/api').replace(/\/+$/, '');
let syncInProgress = false;

const reportSyncFailure = (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`MongoDB sync failed for ${API_URL}. Set VITE_API_URL to the deployed backend URL.`, message);
  window.dispatchEvent(new CustomEvent('cloud-sync-status', {
    detail: { connected: false, message }
  }));
};

export const triggerCloudSync = async () => {
  if (syncInProgress) return false;

  // Check if phone/device is online
  if (!navigator.onLine) {
    console.log('Device is offline. Data is queued in Local Storage for the next sync.');
    return false;
  }

  syncInProgress = true;
  try {
    const jobCards = getJobCards();
    const inventory = getInventory();
    const servicePrices = getServicePrices();
    const bookings = getBookings();
    const expenses = getExpenses();
    const salaries = getSalaries();
    const scrapSales = getScrapSales();

    const payload = {
      jobCards,
      inventory,
      servicePrices,
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
      console.log('MongoDB cloud sync completed:', data);
      window.dispatchEvent(new CustomEvent('cloud-sync-status', {
        detail: { connected: true, counts: data.counts }
      }));
      return true;
    }

    const details = await response.text();
    throw new Error(`HTTP ${response.status}: ${details || response.statusText}`);
  } catch (error) {
    reportSyncFailure(error);
  } finally {
    syncInProgress = false;
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
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    reportSyncFailure(error);
  }
  return null;
};
