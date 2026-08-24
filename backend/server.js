import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const port = Number(process.env.PORT) || 5000;
const collectionNames = ['jobCards', 'inventory', 'bookings', 'expenses', 'salaries', 'scrapSales', 'servicePrices'];

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

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    ok: connected,
    database: connected ? 'connected' : 'disconnected'
  });
});

app.get('/api/data', async (_req, res) => {
  try {
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

app.post('/api/sync', async (req, res) => {
  const payload = req.body;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ error: 'Request body must be an object of record arrays' });
  }

  try {
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
        const ids = operations.map(({ updateOne }) => updateOne.filter.id);
        await models[collectionName].deleteMany({ id: { $nin: ids } });
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

const start = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Add it to backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`STOP & GO backend listening on http://localhost:${port}`);
  });
};

start().catch((error) => {
  console.error(`Backend startup failed: ${error.message}`);
  process.exit(1);
});
