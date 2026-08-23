import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://stopandgo_admin:stopandgo2026@cluster0.mongodb.net/stop_and_go_tyre_care?retryWrites=true&w=majority';

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  const db = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  isConnected = db.connections[0].readyState === 1;
}

const JobCardSchema = new mongoose.Schema({ id: { type: String, unique: true }, date: String, time: String, customerName: String, mobile: String, vehicleName: String, vehicleNumber: String, year: String, odometer: String, services: Array, subtotal: Number, discount: Number, total: Number, paymentMethod: String, status: String }, { timestamps: true });
const InventorySchema = new mongoose.Schema({ id: { type: String, unique: true }, name: String, inStock: Number, unit: String, reorderLevel: Number }, { timestamps: true });
const BookingSchema = new mongoose.Schema({ id: { type: String, unique: true }, customerName: String, mobile: String, vehicleName: String, vehicleNumber: String, date: String, timeSlot: String, serviceType: String, status: String }, { timestamps: true });
const ExpenseSchema = new mongoose.Schema({ id: { type: String, unique: true }, date: String, category: String, amount: Number, note: String }, { timestamps: true });
const SalarySchema = new mongoose.Schema({ id: { type: String, unique: true }, date: String, staffName: String, baseSalary: Number, advance: Number, netPayout: Number }, { timestamps: true });
const ScrapSaleSchema = new mongoose.Schema({ id: { type: String, unique: true }, date: String, itemType: String, quantity: Number, ratePerUnit: Number, totalAmount: Number }, { timestamps: true });

const JobCard = mongoose.models.JobCard || mongoose.model('JobCard', JobCardSchema);
const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const Salary = mongoose.models.Salary || mongoose.model('Salary', SalarySchema);
const ScrapSale = mongoose.models.ScrapSale || mongoose.model('ScrapSale', ScrapSaleSchema);

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    const jobCards = await JobCard.find().sort({ createdAt: -1 });
    const inventory = await Inventory.find();
    const bookings = await Booking.find().sort({ createdAt: -1 });
    const expenses = await Expense.find().sort({ createdAt: -1 });
    const salaries = await Salary.find().sort({ createdAt: -1 });
    const scrapSales = await ScrapSale.find().sort({ createdAt: -1 });

    return res.status(200).json({
      jobCards,
      inventory,
      bookings,
      expenses,
      salaries,
      scrapSales
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
