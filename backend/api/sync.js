import { connectToDatabase } from '../db/connect.js';
import { JobCard, Inventory, Booking, Expense, Salary, ScrapSale } from '../db/models.js';

// Vercel Serverless Function — POST /api/sync
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectToDatabase();

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

    return res.status(200).json({
      success: true,
      message: 'MongoDB Atlas Sync Successful!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
