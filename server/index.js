import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Atlas Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://stopandgo_admin:stopandgo2026@cluster0.mongodb.net/stop_and_go_tyre_care?retryWrites=true&w=majority';

// Mongoose Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🍃 Connected to MongoDB Atlas Cloud Database: stop_and_go_tyre_care'))
.catch(err => console.error('⚠️ MongoDB Connection Error:', err));

// 1. JobCard Schema
const JobCardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: String,
  time: String,
  customerName: String,
  mobile: String,
  vehicleName: String,
  vehicleNumber: String,
  year: String,
  odometer: String,
  services: Array,
  subtotal: Number,
  discount: Number,
  total: Number,
  paymentMethod: String,
  status: String,
  synced: { type: Boolean, default: true }
}, { timestamps: true });

// 2. Inventory Schema
const InventorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  inStock: Number,
  unit: String,
  reorderLevel: Number
}, { timestamps: true });

// 3. Booking Schema
const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: String,
  mobile: String,
  vehicleName: String,
  vehicleNumber: String,
  date: String,
  timeSlot: String,
  serviceType: String,
  status: String
}, { timestamps: true });

// 4. Expense Schema
const ExpenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: String,
  category: String,
  amount: Number,
  note: String
}, { timestamps: true });

// 5. Salary Schema
const SalarySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: String,
  staffName: String,
  baseSalary: Number,
  advance: Number,
  netPayout: Number
}, { timestamps: true });

// 6. ScrapSale Schema
const ScrapSaleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: String,
  itemType: String,
  quantity: Number,
  ratePerUnit: Number,
  totalAmount: Number
}, { timestamps: true });

// Models
const JobCard = mongoose.model('JobCard', JobCardSchema);
const Inventory = mongoose.model('Inventory', InventorySchema);
const Booking = mongoose.model('Booking', BookingSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);
const Salary = mongoose.model('Salary', SalarySchema);
const ScrapSale = mongoose.model('ScrapSale', ScrapSaleSchema);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'MongoDB Atlas', dbState: mongoose.connection.readyState });
});

// POST /api/sync - Batch Cloud Sync Endpoint for Offline-First Data
app.post('/api/sync', async (req, res) => {
  try {
    const { jobCards = [], inventory = [], bookings = [], expenses = [], salaries = [], scrapSales = [] } = req.body;

    // Sync Job Cards
    for (const card of jobCards) {
      await JobCard.updateOne({ id: card.id }, { $set: { ...card, synced: true } }, { upsert: true });
    }

    // Sync Inventory
    for (const item of inventory) {
      await Inventory.updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    // Sync Bookings
    for (const b of bookings) {
      await Booking.updateOne({ id: b.id }, { $set: b }, { upsert: true });
    }

    // Sync Expenses
    for (const exp of expenses) {
      await Expense.updateOne({ id: exp.id }, { $set: exp }, { upsert: true });
    }

    // Sync Salaries
    for (const sal of salaries) {
      await Salary.updateOne({ id: sal.id }, { $set: sal }, { upsert: true });
    }

    // Sync Scrap Sales
    for (const s of scrapSales) {
      await ScrapSale.updateOne({ id: s.id }, { $set: s }, { upsert: true });
    }

    res.status(200).json({
      success: true,
      message: 'Cloud Sync Completed Successfully!',
      syncedCounts: {
        jobCards: jobCards.length,
        inventory: inventory.length,
        bookings: bookings.length,
        expenses: expenses.length,
        salaries: salaries.length,
        scrapSales: scrapSales.length
      }
    });
  } catch (error) {
    console.error('Error during MongoDB sync:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/data - Fetch Cloud Database Records for Multi-Device Sync
app.get('/api/data', async (req, res) => {
  try {
    const jobCards = await JobCard.find().sort({ createdAt: -1 });
    const inventory = await Inventory.find();
    const bookings = await Booking.find().sort({ createdAt: -1 });
    const expenses = await Expense.find().sort({ createdAt: -1 });
    const salaries = await Salary.find().sort({ createdAt: -1 });
    const scrapSales = await ScrapSale.find().sort({ createdAt: -1 });

    res.status(200).json({
      jobCards,
      inventory,
      bookings,
      expenses,
      salaries,
      scrapSales
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 STOP & GO MongoDB API Server running on port ${PORT}`);
});
