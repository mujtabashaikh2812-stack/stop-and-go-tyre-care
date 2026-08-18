export const DEFAULT_SERVICES = {
  wheelAlignment: { id: 'wheelAlignment', name: 'Wheel Alignment', price: 350, enabled: true },
  wheelBalancing: { id: 'wheelBalancing', name: 'Wheel Balancing (Tyre Testing)', type: 'four', priceTwo: 180, priceFour: 300, enabled: true },
  weight: { id: 'weight', name: 'Wheel Weight', weightType: 'sticker', grams: 40, pricePerGram: 3, enabled: true },
  tyreFitting: { id: 'tyreFitting', name: 'Tyre Fitting & Valves', fittingQty: 4, fittingRate: 50, newValve: true, valveQty: 4, valveRate: 60, enabled: true },
  tyreRotation: { id: 'tyreRotation', name: 'Tyre Rotation', price: 150, enabled: true },
  headlightBuffing: { id: 'headlightBuffing', name: 'Head Light Buffing (Cleaning)', price: 350, enabled: true },
  airFilling: { id: 'airFilling', name: 'Air Filling', airType: 'nitrogen', price: 80, enabled: true },
  tubelessPuncher: { id: 'tubelessPuncher', name: 'Tubeless Puncher (Puncture Repair)', qty: 1, pricePerPuncher: 120, enabled: true },
  camberSetting: { id: 'camberSetting', name: 'Camber Setting', position: 'front', priceFront: 300, priceRear: 300, priceBoth: 550, enabled: true }
};

export const INITIAL_JOB_CARDS = [
  {
    id: 'SG-2026-1001',
    date: '2026-08-18',
    time: '14:30',
    customerName: 'Rajesh Sharma',
    mobile: '9876543210',
    vehicleName: 'Hyundai Creta (White)',
    year: '2023',
    odometer: '28,450',
    services: [
      { name: 'Wheel Alignment', amount: 350 },
      { name: 'Wheel Balancing (4 Tyres)', amount: 300 },
      { name: 'Wheel Weight (Brass Weight - 45g)', amount: 135 },
      { name: 'Tyre Rotation', amount: 150 },
      { name: 'Nitrogen Air Filling', amount: 80 }
    ],
    subtotal: 1015,
    discount: 50,
    total: 965,
    paymentMethod: 'UPI / QR Code',
    status: 'Completed'
  },
  {
    id: 'SG-2026-1002',
    date: '2026-08-18',
    time: '11:15',
    customerName: 'Vikram Singh',
    mobile: '9811223344',
    vehicleName: 'Mahindra Thar (Black)',
    year: '2022',
    odometer: '41,200',
    services: [
      { name: 'Wheel Alignment', amount: 350 },
      { name: 'Wheel Balancing (4 Tyres)', amount: 300 },
      { name: 'Tyre Fitting (4 Tyres) + 4 New Valves', amount: 440 },
      { name: 'Camber Setting (Front R/L)', amount: 300 },
      { name: 'Head Light Buffing (Cleaning)', amount: 350 }
    ],
    subtotal: 1740,
    discount: 100,
    total: 1640,
    paymentMethod: 'Cash',
    status: 'Completed'
  },
  {
    id: 'SG-2026-1003',
    date: '2026-08-17',
    time: '16:45',
    customerName: 'Amit Verma',
    mobile: '9988776655',
    vehicleName: 'Maruti Swift (Red)',
    year: '2021',
    odometer: '53,100',
    services: [
      { name: 'Wheel Alignment', amount: 350 },
      { name: 'Tubeless Puncher (2 Repairs)', amount: 240 },
      { name: 'Normal Air Filling', amount: 40 }
    ],
    subtotal: 630,
    discount: 30,
    total: 600,
    paymentMethod: 'UPI / QR Code',
    status: 'Completed'
  }
];

export const INITIAL_INVENTORY = [
  { id: 'sticker_weights', name: 'Sticker Wheel Weights', unit: 'Grams', inStock: 4500, minAlert: 1000 },
  { id: 'brass_weights', name: 'Brass Wheel Weights', unit: 'Grams', inStock: 2800, minAlert: 800 },
  { id: 'tyre_valves', name: 'Tubeless Tyre Valves', unit: 'Pieces', inStock: 120, minAlert: 30 },
  { id: 'nitrogen_tank', name: 'Nitrogen Air Cylinder', unit: 'Bar Pressure', inStock: 140, minAlert: 30 }
];
