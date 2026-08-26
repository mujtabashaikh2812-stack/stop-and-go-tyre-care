import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const port = Number(process.env.PORT) || 5000;
const collectionNames = [
  'jobCards', 'inventory', 'bookings', 'expenses', 'salaries',
  'scrapSales', 'servicePrices', 'partnerGarages', 'partnerBatches', 'tyreWarranties'
];

const recordSchema = new mongoose.Schema(
  { id: { type: String, required: true } },
  { strict: false, timestamps: true }
);
recordSchema.index({ id: 1 }, { unique: true });

const models = Object.fromEntries(
  collectionNames.map((name) => [
    name,
    mongoose.model(name, recordSchema, name.toLowerCase())
  ])
);

// ✅ Allow ALL origins — required for Vercel/Netlify frontend + Android APK
app.use(cors());
app.options('/(.*)' , cors());
app.use(express.json({ limit: '2mb' }));

// Health check
const handleHealthCheck = (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'healthy',
    message: 'STOP & GO Garage Management Backend Active & Healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: connected ? 'connected' : 'reconnecting_or_standalone'
  });
};

app.get('/', handleHealthCheck);
app.get('/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);
app.get('/ping', handleHealthCheck);

// GET all data from MongoDB
app.get('/api/data', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        jobCards: [], inventory: [], bookings: [], expenses: [],
        salaries: [], scrapSales: [], servicePrices: {},
        partnerGarages: [], partnerBatches: [], tyreWarranties: []
      });
    }
    const entries = await Promise.all(
      collectionNames.map(async (name) => [
        name,
        name === 'servicePrices'
          ? (await models[name].findOne({ id: 'current' }).lean())?.value || {}
          : await models[name].find().sort({ createdAt: -1 }).lean()
      ])
    );
    res.json(Object.fromEntries(entries));
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch data', details: error.message });
  }
});

// POST — upsert records into MongoDB (never deletes)
app.post('/api/sync', async (req, res) => {
  const payload = req.body;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ error: 'Request body must be an object' });
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: 'MongoDB reconnecting — data queued in localStorage.' });
    }

    const counts = {};

    await Promise.all(
      collectionNames.map(async (name) => {
        const records = name === 'servicePrices'
          ? [{ id: 'current', value: payload[name] || {} }]
          : payload[name] || [];

        if (!Array.isArray(records)) return;

        const ops = records
          .filter((r) => r && typeof r === 'object' && r.id)
          .map((r) => {
            const { _id, __v, ...safe } = r;
            return {
              updateOne: {
                filter: { id: String(safe.id) },
                update: { $set: safe },
                upsert: true
              }
            };
          });

        if (ops.length > 0) {
          await models[name].bulkWrite(ops, { ordered: false });
        }
        counts[name] = ops.length;
      })
    );

    res.json({ success: true, counts });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed', details: error.message });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Start server, then connect to MongoDB
app.listen(port, () => {
  console.log(`🚀 STOP & GO backend listening on port ${port}`);

  if (process.env.MONGODB_URI) {
    console.log('🍃 Connecting to MongoDB Atlas...');
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ MongoDB Atlas connected successfully!'))
      .catch((err) => console.error('⚠️ MongoDB connection error:', err.message));
  } else {
    console.warn('⚠️ MONGODB_URI not set in environment variables.');
  }
});
