export const DEFAULT_SERVICES = {
  wheelAlignment: { id: 'wheelAlignment', name: 'Wheel Alignment', price: 350, enabled: false },
  wheelBalancing: { id: 'wheelBalancing', name: 'Wheel Balancing (Tyre Testing)', type: 'four', priceTwo: 180, priceFour: 300, enabled: false },
  weight: { id: 'weight', name: 'Wheel Weight', weightType: 'sticker', grams: 0, pricePerGram: 3, enabled: false },
  tyreFitting: { id: 'tyreFitting', name: 'Tyre Fitting & Valves', fittingQty: 1, fittingRate: 50, newValve: false, valveQty: 1, valveRate: 60, enabled: false },
  tyreRotation: { id: 'tyreRotation', name: 'Tyre Rotation', price: 150, enabled: false },
  headlightBuffing: { id: 'headlightBuffing', name: 'Head Light Buffing (Cleaning)', price: 350, enabled: false },
  airFilling: { id: 'airFilling', name: 'Air Filling', airType: 'nitrogen', price: 80, enabled: false },
  tubelessPuncher: { id: 'tubelessPuncher', name: 'Tubeless Puncher (Puncture Repair)', qty: 1, pricePerPuncher: 120, enabled: false },
  camberSetting: { id: 'camberSetting', name: 'Camber Setting', position: 'front', priceFront: 300, priceRear: 300, priceBoth: 550, enabled: false }
};

// Zero fake job cards - Production Clean Slate State
export const INITIAL_JOB_CARDS = [];

// Production Inventory Items - Ready for real-time tracking
export const INITIAL_INVENTORY = [
  { id: 'sticker_weights', name: 'Sticker Wheel Weights', unit: 'Grams', inStock: 0, minAlert: 500 },
  { id: 'brass_weights', name: 'Brass Wheel Weights', unit: 'Grams', inStock: 0, minAlert: 500 },
  { id: 'tyre_valves', name: 'Tubeless Tyre Valves', unit: 'Pieces', inStock: 0, minAlert: 20 },
  { id: 'nitrogen_tank', name: 'Nitrogen Air Cylinder', unit: 'Bar Pressure', inStock: 0, minAlert: 20 }
];
