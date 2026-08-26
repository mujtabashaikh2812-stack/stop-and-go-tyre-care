import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const port = Number(process.env.PORT) || 5000;
const collectionNames = ['jobCards', 'inventory', 'bookings', 'expenses', 'salaries', 'scrapSales', 'servicePrices', 'partnerGarages', 'partnerBatches', 'tyreWarranties'];

const recordSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }
  },
  {
    strict: false,
    timestamps: true
  }
);
recordSchema.index({ id: 1 }, { unique: true });

const models = Object.fromEntries(
  collectionNames.map((collectionName) => [
    collectionName,
    mongoose.model(collectionName, recordSchema, collectionName.toLowerCase())
  ])
);

// Allow CORS from Vercel Web App, Localhost, Android Capacitor Apps, and Mobile Browsers
app.use(cors({
  origin: true, // Echoes the requesting origin (e.g. https://stop-and-go-tyre-care.vercel.app)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '2mb' }));

// 🏥 Uptime Monitor Health Check Routes (Render Keep-Alive Endpoints)
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

app.get('/api/data', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        jobCards: [], inventory: [], bookings: [], expenses: [], salaries: [], scrapSales: [], servicePrices: {}, partnerGarages: [], partnerBatches: [], tyreWarranties: []
      });
    }
    const data = await Promise.all(
      collectionNames.map(async (collectionName) => [
        collectionName,
        collectionName === 'servicePrices'
          ? (await models[collectionName].findOne({ id: 'current' }).lean())?.value || {}
          : await models[collectionName].find().sort({ createdAt: -1 }).lean()
      ])
    );
    res.json(Object.fromEntries(data));
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch data', details: error.message });
  }
});

app.post('/api/save-item', async (req, res) => {
  const { collectionName, record } = req.body;
  if (!collectionName || !record || !record.id || !models[collectionName]) {
    return res.status(400).json({ error: 'Invalid collectionName or record payload' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const { _id, __v, ...safeRecord } = record;
      await models[collectionName].updateOne(
        { id: String(safeRecord.id) },
        { $set: safeRecord },
        { upsert: true }
      );
      console.log(`🍃 Saved ${collectionName} item ${safeRecord.id} to MongoDB Atlas`);
    }
    res.json({ success: true, collectionName, id: record.id });
  } catch (error) {
    console.error(`❌ Failed to save ${collectionName}:`, error.message);
    res.status(500).json({ error: 'Failed to save item to MongoDB', details: error.message });
  }
});

app.post('/api/delete-item', async (req, res) => {
  const { collectionName, id } = req.body;
  if (!collectionName || !id || !models[collectionName]) {
    return res.status(400).json({ error: 'Invalid collectionName or id payload' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      await models[collectionName].deleteOne({ id: String(id) });
      console.log(`🗑️ Deleted ${collectionName} item ${id} from MongoDB Atlas`);
    }
    res.json({ success: true, collectionName, id });
  } catch (error) {
    console.error(`❌ Failed to delete ${collectionName}:`, error.message);
    res.status(500).json({ error: 'Failed to delete item from MongoDB', details: error.message });
  }
});

app.post('/api/sync', async (req, res) => {
  const payload = req.body;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ error: 'Request body must be an object of record arrays' });
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: 'Saved in LocalStorage; MongoDB reconnecting.' });
    }

    const counts = {};

    await Promise.all(
      collectionNames.map(async (collectionName) => {
        const records = collectionName === 'servicePrices'
          ? [{ id: 'current', value: payload[collectionName] || {} }]
          : payload[collectionName] || [];
        if (!Array.isArray(records)) {
          throw new Error(`${collectionName} must be an array`);
        }

        const operations = records
          .filter((record) => record && typeof record === 'object' && record.id)
          .map((record) => {
            const { _id, __v, ...safeRecord } = record;
            return {
              updateOne: {
                filter: { id: String(safeRecord.id) },
                update: { $set: safeRecord },
                upsert: true
              }
            };
          });

        if (operations.length > 0) {
          await models[collectionName].bulkWrite(operations, { ordered: false });
        }
        counts[collectionName] = operations.length;
      })
    );

    res.json({ success: true, counts });
  } catch (error) {
    res.status(500).json({ error: 'Unable to sync data', details: error.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Express Server immediately so Render Health Check passes 100%
app.listen(port, () => {
  console.log(`🚀 STOP & GO backend listening on port ${port}`);

  if (process.env.MONGODB_URI) {
    console.log('🍃 Connecting to MongoDB Atlas...');
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ MongoDB Atlas Database Connected Successfully!'))
      .catch(err => console.error('⚠️ MongoDB Connection Notice (Ensure 0.0.0.0/0 IP Whitelist in MongoDB Atlas):', err.message));
  } else {
    console.warn('⚠️ MONGODB_URI not found in environment variables.');
  }
});
