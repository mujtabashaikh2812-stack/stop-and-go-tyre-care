import { connectToDatabase } from '../db/connect.js';
import { JobCard, Inventory, Booking, Expense, Salary, ScrapSale } from '../db/models.js';

// Vercel Serverless Function — GET /api/data
export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const [jobCards, inventory, bookings, expenses, salaries, scrapSales] = await Promise.all([
      JobCard.find().sort({ createdAt: -1 }),
      Inventory.find(),
      Booking.find().sort({ createdAt: -1 }),
      Expense.find().sort({ createdAt: -1 }),
      Salary.find().sort({ createdAt: -1 }),
      ScrapSale.find().sort({ createdAt: -1 })
    ]);

    return res.status(200).json({ jobCards, inventory, bookings, expenses, salaries, scrapSales });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
