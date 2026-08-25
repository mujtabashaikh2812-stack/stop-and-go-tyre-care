export const DEFAULT_SERVICES = {
  wheelAlignment: { id: 'wheelAlignment', name: 'Wheel Alignment', price: 350, enabled: false },
  wheelBalancing: { id: 'wheelBalancing', name: 'Wheel Balancing (Tyre Testing)', tyresCount: 4, pricePerTyre: 50, enabled: false },
  weight: { id: 'weight', name: 'Wheel Weight', weightType: 'brass', grams: 0, stickerRate: 4, brassRate: 2, enabled: false },
  tyreFitting: { id: 'tyreFitting', name: 'Tyre Fitting & Valves', rimSize: 'small', smallRimRate: 100, largeRimRate: 125, fittingQty: 1, newValve: false, valveQty: 1, valveRate: 60, enabled: false },
  tyreRotation: { id: 'tyreRotation', name: 'Tyre Rotation', tyresCount: 4, ratePerTyre: 50, rotationPattern: 'Cross Pattern', enabled: false },
  headlightBuffing: { id: 'headlightBuffing', name: 'Head Light Buffing (Cleaning)', price: 700, enabled: false },
  airFilling: { id: 'airFilling', name: 'Air Filling', airType: 'nitrogen_full', nitrogenFullPrice: 150, nitrogenTopupPrice: 50, normalPrice: 20, enabled: false },
  tubelessPuncher: { id: 'tubelessPuncher', name: 'Tubeless Puncher (Repair)', qty: 1, pricePerPuncher: 100, enabled: false },
  camberSetting: { id: 'camberSetting', name: 'Camber Setting (Bolt & Sims Add/Remove)', price: 1200, enabled: false },
  carWashing: { id: 'carWashing', name: 'Car Washing (Future Service)', price: 350, enabled: false },
  internalCleaning: { id: 'internalCleaning', name: 'Internal Cleaning (Future Service)', price: 800, enabled: false },
  oilChange: { id: 'oilChange', name: 'Engine Oil Change (Future Service)', price: 1500, enabled: false }
};

// Production Clean Slate Data Structures
export const INITIAL_JOB_CARDS = [];
export const INITIAL_BOOKINGS = [];
export const INITIAL_EXPENSES = [];
export const INITIAL_SALARIES = [];
export const INITIAL_SCRAP_SALES = [];

export const INITIAL_INVENTORY = [
  { id: 'sticker_weights', name: 'Sticker Wheel Weights', unit: 'Grams', inStock: 0 },
  { id: 'brass_weights', name: 'Brass Wheel Weights', unit: 'Grams', inStock: 0 },
  { id: 'tyre_valves', name: 'Tubeless Tyre Valves', unit: 'Pieces', inStock: 0 },
  { id: 'nitrogen_tank', name: 'Nitrogen Air Tank', unit: 'Bar Pressure', inStock: 0 }
];
