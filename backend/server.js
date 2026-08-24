import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase } from './db/connect.js';
import { JobCard, Inventory, Booking, Expense, Salary, ScrapSale } from './db/models.js';

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'STOP & GO Tyre Care API',
    database: 'MongoDB Atlas',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ── POST /api/sync ─────────────────────────────────────────────────────────────
// Offline-first batch upsert — syncs all local data to MongoDB Atlas
app.post('/api/sync', async (req, res) => {
  try {
    const {
      jobCards   = [],
      inventory  = [],
      bookings   = [],
      expenses   = [],
      salaries   = [],
      scrapSales = []
    } = req.body;

    const upsert = (Model, arr) =>
      Promise.all(arr.map(doc =>
        Model.updateOne({ id: doc.id }, { $set: doc }, { upsert: true })
      ));

    await Promise.all([
      upsert(JobCard,   jobCards),
      upsert(Inventory, inventory),
      upsert(Booking,   bookings),
      upsert(Expense,   expenses),
      upsert(Salary,    salaries),
      upsert(ScrapSale, scrapSales)
    ]);

    res.status(200).json({
      success: true,
      message: 'Cloud Sync Completed Successfully!',
      syncedCounts: {
        jobCards:   jobCards.length,
        inventory:  inventory.length,
        bookings:   bookings.length,
        expenses:   expenses.length,
        salaries:   salaries.length,
        scrapSales: scrapSales.length
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/data ──────────────────────────────────────────────────────────────
// Fetch all cloud records — used for multi-device sync on app startup
app.get('/api/data', async (req, res) => {
  try {
    const [jobCards, inventory, bookings, expenses, salaries, scrapSales] = await Promise.all([
      JobCard.find().sort({ createdAt: -1 }),
      Inventory.find(),
      Booking.find().sort({ createdAt: -1 }),
      Expense.find().sort({ createdAt: -1 }),
      Salary.find().sort({ createdAt: -1 }),
      ScrapSale.find().sort({ createdAt: -1 })
    ]);

    res.status(200).json({ jobCards, inventory, bookings, expenses, salaries, scrapSales });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 STOP & GO API Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
