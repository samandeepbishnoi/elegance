#!/usr/bin/env node

/**
 * WhatsApp Message Test Script
 * 
 * This script tests the WhatsApp notification service
 * Run: node testWhatsApp.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 WhatsApp Configuration Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Check environment variables
const config = {
  enabled: process.env.WHATSAPP_ENABLED,
  apiUrl: process.env.WHATSAPP_API_URL,
  apiKey: process.env.WHATSAPP_API_KEY ? '***' + process.env.WHATSAPP_API_KEY.slice(-4) : 'Not set',
  phoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
  adminNumber: process.env.ADMIN_WHATSAPP_NUMBER,
};

console.log('📋 Environment Variables:');
console.log('   WHATSAPP_ENABLED:', config.enabled || '❌ Not set (defaulting to false)');
console.log('   WHATSAPP_API_URL:', config.apiUrl || '❌ Not set');
console.log('   WHATSAPP_API_KEY:', config.apiKey);
console.log('   WHATSAPP_PHONE_NUMBER:', config.phoneNumber || '❌ Not set');
console.log('   ADMIN_WHATSAPP_NUMBER:', config.adminNumber || '❌ Not set');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Test the service
console.log('\n🧪 Testing WhatsApp Service...\n');

try {
  const { default: whatsappService } = await import('./services/whatsappService.js');
  
  // Test message
  const testOrder = {
    orderNumber: 'ELG-TEST123',
    customerName: 'Test Customer',
    customerPhone: '+919876543210',
    finalAmount: 5000,
    cancelReason: 'Testing cancellation',
    paymentMethod: 'cod'
  };

  console.log('📱 Sending test COD cancellation notification to admin...');
  const result = await whatsappService.sendAdminCancellationCODNotification(testOrder);
  
  if (result.success) {
    console.log('✅ Test message sent/logged successfully!');
    if (result.logged) {
      console.log('   ℹ️  Message was logged (WhatsApp service disabled)');
    } else {
      console.log('   ✉️  Message was sent via WhatsApp');
    }
  } else {
    console.log('❌ Test message failed:', result.error);
  }

} catch (error) {
  console.error('❌ Error loading WhatsApp service:', error.message);
  console.error('   Stack:', error.stack);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n💡 Tips:');
console.log('   - For development, set WHATSAPP_ENABLED=false in .env');
console.log('   - Messages will be logged to console when disabled');
console.log('   - Check backend logs when cancelling orders');
console.log('   - For production, set up Twilio or WhatsApp Business API');
console.log('\n📚 Setup Guide: See WHATSAPP_SETUP_GUIDE.md for details\n');
