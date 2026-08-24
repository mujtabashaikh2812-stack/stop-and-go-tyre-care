import mongoose from 'mongoose';

// ── 1. Job Card ───────────────────────────────────────────────────────────────
const JobCardSchema = new mongoose.Schema(
  {
    id:            { type: String, required: true, unique: true },
    date:          String,
    time:          String,
    customerName:  String,
    mobile:        String,
    vehicleName:   String,
    vehicleNumber: String,
    year:          String,
    odometer:      String,
    services:      Array,
    subtotal:      Number,
    discount:      Number,
    total:         Number,
    paymentMethod: String,
    status:        String,
    synced:        { type: Boolean, default: true }
  },
  { timestamps: true }
);

// ── 2. Inventory ──────────────────────────────────────────────────────────────
const InventorySchema = new mongoose.Schema(
  {
    id:           { type: String, required: true, unique: true },
    name:         String,
    inStock:      Number,
    unit:         String,
    reorderLevel: Number
  },
  { timestamps: true }
);

// ── 3. Booking ────────────────────────────────────────────────────────────────
const BookingSchema = new mongoose.Schema(
  {
    id:            { type: String, required: true, unique: true },
    customerName:  String,
    mobile:        String,
    vehicleName:   String,
    vehicleNumber: String,
    date:          String,
    timeSlot:      String,
    serviceType:   String,
    status:        String
  },
  { timestamps: true }
);

// ── 4. Expense ────────────────────────────────────────────────────────────────
const ExpenseSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true, unique: true },
    date:     String,
    category: String,
    amount:   Number,
    note:     String
  },
  { timestamps: true }
);

// ── 5. Salary ─────────────────────────────────────────────────────────────────
const SalarySchema = new mongoose.Schema(
  {
    id:           { type: String, required: true, unique: true },
    date:         String,
    staffName:    String,
    baseSalary:   Number,
    advance:      Number,
    netPayout:    Number
  },
  { timestamps: true }
);

// ── 6. Scrap Sale ─────────────────────────────────────────────────────────────
const ScrapSaleSchema = new mongoose.Schema(
  {
    id:          { type: String, required: true, unique: true },
    date:        String,
    itemType:    String,
    quantity:    Number,
    ratePerUnit: Number,
    totalAmount: Number
  },
  { timestamps: true }
);

export const JobCard   = mongoose.models.JobCard   || mongoose.model('JobCard',   JobCardSchema);
export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
export const Booking   = mongoose.models.Booking   || mongoose.model('Booking',   BookingSchema);
export const Expense   = mongoose.models.Expense   || mongoose.model('Expense',   ExpenseSchema);
export const Salary    = mongoose.models.Salary    || mongoose.model('Salary',    SalarySchema);
export const ScrapSale = mongoose.models.ScrapSale || mongoose.model('ScrapSale', ScrapSaleSchema);
