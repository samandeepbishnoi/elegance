// Manual order cleanup script
// Run this script manually to cancel pending orders older than 2 days
// Usage: node cleanupOrders.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runOrderCleanup } from './utils/orderCleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const cleanup = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-catalog';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    await runOrderCleanup();

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

cleanup();
