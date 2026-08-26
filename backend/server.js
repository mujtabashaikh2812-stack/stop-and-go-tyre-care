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

// Tombstone Schema for Persistent Deletion Tracking across all devices
const deletedItemSchema = new mongoose.Schema(
  {
    collectionName: { type: String, required: true },
    id: { type: String, required: true },
    deletedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
deletedItemSchema.index({ collectionName: 1, id: 1 }, { unique: true });
const DeletedItem = mongoose.models.DeletedItem || mongoose.model('DeletedItem', deletedItemSchema, 'deleteditems');

// Allow CORS from Vercel Web App, Localhost, Android Capacitor Apps, and Mobile Browsers
app.use(cors({
  origin: true, // Echoes requesting origin (e.g. https://stop-and-go-tyre-care.vercel.app)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '2mb' }));

// 🏥 Uptime Monitor & Favicon Route Handlers
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
app.get('/api', handleHealthCheck);
app.get('/api/health', handleHealthCheck);
app.get('/ping', handleHealthCheck);
app.get('/favicon.ico', (_req, res) => res.status(204).end());
app.get('/robots.txt', (_req, res) => res.status(200).send('User-agent: *\nDisallow:'));

app.get('/api/data', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        jobCards: [], inventory: [], bookings: [], expenses: [], salaries: [], scrapSales: [], servicePrices: {}, partnerGarages: [], partnerBatches: [], tyreWarranties: [], deletedItems: []
      });
    }

    const tombstones = await DeletedItem.find().lean();
    const tombstoneSet = new Set(tombstones.map(t => `${t.collectionName}:${String(t.id)}`));

    const data = await Promise.all(
      collectionNames.map(async (collectionName) => {
        if (collectionName === 'servicePrices') {
          const doc = await models[collectionName].findOne({ id: 'current' }).lean();
          return [collectionName, doc?.value || {}];
        }
        const docs = await models[collectionName].find().sort({ createdAt: -1 }).lean();
        const filteredDocs = docs.filter(doc => !tombstoneSet.has(`${collectionName}:${String(doc.id)}`));
        return [collectionName, filteredDocs];
      })
    );

    const result = Object.fromEntries(data);
    result.deletedItems = tombstones.map(t => ({
      collectionName: t.collectionName,
      id: String(t.id),
      deletedAt: t.deletedAt || t.createdAt
    }));

    res.json(result);
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
      const idStr = String(record.id);

      // Remove from tombstone collection if record is explicitly re-created
      await DeletedItem.deleteOne({ collectionName, id: idStr });

      const { _id, __v, ...safeRecord } = record;
      await models[collectionName].updateOne(
        { id: idStr },
        { $set: safeRecord },
        { upsert: true }
      );
      console.log(`🍃 Saved ${collectionName} item ${idStr} to MongoDB Atlas`);
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
      const idStr = String(id);
      await models[collectionName].deleteOne({ id: idStr });

      // Record tombstone to prevent resurrection from stale sync payloads/clients
      await DeletedItem.updateOne(
        { collectionName, id: idStr },
        { $set: { collectionName, id: idStr, deletedAt: new Date() } },
        { upsert: true }
      );
      console.log(`🗑️ Permanently deleted ${collectionName} item ${idStr} & recorded tombstone`);
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

    // 1. Process explicit tombstones / deletedItems from client payload
    const incomingDeleted = payload.deletedItems || [];
    if (Array.isArray(incomingDeleted) && incomingDeleted.length > 0) {
      await Promise.all(
        incomingDeleted.map(async (del) => {
          if (del && del.collectionName && del.id && models[del.collectionName]) {
            const idStr = String(del.id);
            await models[del.collectionName].deleteOne({ id: idStr });
            await DeletedItem.updateOne(
              { collectionName: del.collectionName, id: idStr },
              { $set: { collectionName: del.collectionName, id: idStr, deletedAt: del.deletedAt ? new Date(del.deletedAt) : new Date() } },
              { upsert: true }
            );
          }
        })
      );
    }

    // 2. Fetch all persistent tombstones from MongoDB Atlas
    const allTombstones = await DeletedItem.find().lean();
    const tombstoneSet = new Set(allTombstones.map(t => `${t.collectionName}:${String(t.id)}`));

    const counts = {};

    // 3. Perform bulkWrite upserts ONLY for records NOT in tombstoneSet
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
          .filter((record) => !tombstoneSet.has(`${collectionName}:${String(record.id)}`)) // SERVER-SIDE DELETION PRECEDENCE!
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

app.use((req, res) => {
  console.warn(`⚠️ 404 Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', path: req.url, method: req.method });
});

// Start Express Server
app.listen(port, () => {
  console.log(`🚀 STOP & GO backend listening on port ${port}`);

  if (process.env.MONGODB_URI) {
    console.log('🍃 Connecting to MongoDB Atlas...');
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ MongoDB Atlas Database Connected Successfully!'))
      .catch(err => console.error('⚠️ MongoDB Connection Notice:', err.message));
  } else {
    console.warn('⚠️ MONGODB_URI not found in environment variables.');
  }
});
