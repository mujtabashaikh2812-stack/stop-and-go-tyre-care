import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB Atlas.
 * Safe to call multiple times — reuses existing connection.
 */
export async function connectToDatabase() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  const db = await mongoose.connect(uri);
  isConnected = db.connections[0].readyState === 1;
  console.log('🍃 Connected to MongoDB Atlas — stop_and_go_tyre_care');
}
