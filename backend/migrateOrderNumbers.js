// Migration script to add unique order numbers to existing orders
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from './models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const generateOrderNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ELG-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const migrateOrderNumbers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-catalog';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all orders without order numbers
    const ordersWithoutNumbers = await Order.find({ 
      $or: [
        { orderNumber: { $exists: false } },
        { orderNumber: null },
        { orderNumber: '' }
      ]
    });

    console.log(`Found ${ordersWithoutNumbers.length} orders without order numbers`);

    if (ordersWithoutNumbers.length === 0) {
      console.log('All orders already have order numbers!');
      await mongoose.disconnect();
      return;
    }

    const usedNumbers = new Set();
    
    // Get all existing order numbers
    const ordersWithNumbers = await Order.find({ 
      orderNumber: { $exists: true, $ne: null, $ne: '' } 
    }).select('orderNumber');
    
    ordersWithNumbers.forEach(order => {
      if (order.orderNumber) {
        usedNumbers.add(order.orderNumber);
      }
    });

    console.log(`Found ${usedNumbers.size} existing order numbers`);

    let updated = 0;
    let failed = 0;

    for (const order of ordersWithoutNumbers) {
      try {
        let orderNumber;
        let attempts = 0;
        const maxAttempts = 100;

        // Generate a unique order number
        do {
          orderNumber = generateOrderNumber();
          attempts++;
          if (attempts > maxAttempts) {
            throw new Error('Could not generate unique order number');
          }
        } while (usedNumbers.has(orderNumber));

        usedNumbers.add(orderNumber);

        // Update the order
        await Order.findByIdAndUpdate(order._id, { 
          $set: { orderNumber } 
        });

        updated++;
        console.log(`✓ Updated order ${order._id} with order number ${orderNumber}`);
      } catch (error) {
        failed++;
        console.error(`✗ Failed to update order ${order._id}:`, error.message);
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total processed: ${ordersWithoutNumbers.length}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the migration
migrateOrderNumbers();
