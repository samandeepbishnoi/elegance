#!/usr/bin/env node

/**
 * Database Index Migration Script
 * 
 * This script ensures all necessary indexes are created for optimal performance.
 * Run this after updating the server.js file with index definitions.
 * 
 * Usage: node backend/scripts/createIndexes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-catalog';

// Product Schema (must match server.js)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  description: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  discountType: { 
    type: String, 
    enum: ['none', 'percentage', 'flat'], 
    default: 'none' 
  },
  discountValue: { 
    type: Number, 
    default: 0,
    min: 0
  },
}, { timestamps: true });

// Add indexes
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Creating indexes...');
    await Product.createIndexes();
    console.log('✅ All indexes created successfully!');

    console.log('\n📋 Existing indexes:');
    const indexes = await Product.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    console.log('\n✨ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

// Run the migration
createIndexes();
