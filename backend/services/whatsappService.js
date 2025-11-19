import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * WhatsApp notification service for order cancellations
 * Uses WhatsApp Business API or third-party services like Twilio, MessageBird, etc.
 * 
 * Note: Configure your WhatsApp service credentials in .env file:
 * - WHATSAPP_API_URL
 * - WHATSAPP_API_KEY
 * - WHATSAPP_PHONE_NUMBER
 * - ADMIN_WHATSAPP_NUMBER
 */

const WHATSAPP_CONFIG = {
  apiUrl: process.env.WHATSAPP_API_URL || '',
  apiKey: process.env.WHATSAPP_API_KEY || '',
  phoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '',
  adminNumber: process.env.ADMIN_WHATSAPP_NUMBER || '919896076856',
  enabled: process.env.WHATSAPP_ENABLED === 'true' || false
};

/**
 * Generic function to send WhatsApp message
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} message - Message text
 * @returns {Promise<Object>}
 */
const sendWhatsAppMessage = async (to, message) => {
  // If WhatsApp is not configured, log the message instead
  if (!WHATSAPP_CONFIG.enabled || !WHATSAPP_CONFIG.apiUrl) {
    console.log('📱 WhatsApp Message (Not Sent - Service Disabled):');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('---');
    return {
      success: true,
      message: 'WhatsApp service disabled',
      logged: true
    };
  }

  try {
    // Example implementation for generic WhatsApp API
    // Adjust based on your WhatsApp service provider (Twilio, MessageBird, etc.)
    const response = await axios.post(
      WHATSAPP_CONFIG.apiUrl,
      {
        to: to,
        message: message,
        // Add other required fields based on your provider
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp message sent successfully to:', to);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ WhatsApp message failed:', error.message);
    // Log the message for manual follow-up
    console.log('📱 Failed WhatsApp Message:');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('---');
    
    return {
      success: false,
      error: error.message,
      logged: true
    };
  }
};

/**
 * Send cancellation notification to admin for prepaid orders (refund request)
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
export const sendAdminCancellationPrepaidNotification = async (order) => {
  const message = `
🔴 *Cancel & Refund Request – Order #${order.orderNumber}*

👤 *Customer:* ${order.customerName}
📦 *Order Number:* ${order.orderNumber}
💳 *Payment Method:* Prepaid
❌ *Cancel Reason:* ${order.cancelReason || order.customCancelReason || 'Not specified'}
💰 *Total Amount:* ₹${order.finalAmount.toFixed(2)}

⚠️ *Refund Requested*

Please process the refund as soon as possible.

Order Details: ${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/admin/orders
  `.trim();

  return await sendWhatsAppMessage(WHATSAPP_CONFIG.adminNumber, message);
};

/**
 * Send cancellation notification to admin for COD orders
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
export const sendAdminCancellationCODNotification = async (order) => {
  const message = `
🔴 *Order Cancelled – Order #${order.orderNumber}*

👤 *Customer:* ${order.customerName}
📦 *Order Number:* ${order.orderNumber}
💳 *Payment Method:* COD
❌ *Cancel Reason:* ${order.cancelReason || order.customCancelReason || 'Not specified'}

Order Details: ${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/admin/orders
  `.trim();

  return await sendWhatsAppMessage(WHATSAPP_CONFIG.adminNumber, message);
};

/**
 * Send cancellation confirmation to customer (prepaid order)
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
export const sendCustomerCancellationPrepaidConfirmation = async (order) => {
  const customerPhone = order.customerPhone.startsWith('+') 
    ? order.customerPhone 
    : `+91${order.customerPhone}`;

  const message = `
✅ *Order Cancelled Successfully*

Dear ${order.customerName},

Your order #${order.orderNumber} has been cancelled.

💰 *Refund Status:* Processing
Your refund request is under review. You will receive your refund within 5-7 business days.

If you have any questions, please contact us on WhatsApp.

Thank you!
*Parika Jewels*
  `.trim();

  return await sendWhatsAppMessage(customerPhone, message);
};

/**
 * Send cancellation confirmation to customer (COD order)
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
export const sendCustomerCancellationCODConfirmation = async (order) => {
  const customerPhone = order.customerPhone.startsWith('+') 
    ? order.customerPhone 
    : `+91${order.customerPhone}`;

  const message = `
✅ *Order Cancelled Successfully*

Dear ${order.customerName},

Your order #${order.orderNumber} has been cancelled successfully.

If you have any questions, please contact us on WhatsApp.

Thank you!
*Parika Jewels*
  `.trim();

  return await sendWhatsAppMessage(customerPhone, message);
};

/**
 * Send refund status update notification to customer
 * @param {Object} order - Order object
 * @param {string} status - Refund status (processing, completed)
 * @returns {Promise<Object>}
 */
export const sendRefundStatusUpdate = async (order, status) => {
  const customerPhone = order.customerPhone.startsWith('+') 
    ? order.customerPhone 
    : `+91${order.customerPhone}`;

  let message = '';
  
  if (status === 'processing') {
    message = `
🔄 *Refund Update – Order #${order.orderNumber}*

Dear ${order.customerName},

Your refund is now being processed.

💰 *Refund Amount:* ₹${order.refundAmount.toFixed(2)}
⏱️ *Expected Time:* 5-7 business days

You will receive a confirmation once the refund is completed.

*Parika Jewels*
    `.trim();
  } else if (status === 'completed') {
    message = `
✅ *Refund Completed – Order #${order.orderNumber}*

Dear ${order.customerName},

Your refund has been completed successfully!

💰 *Refund Amount:* ₹${order.refundAmount.toFixed(2)}
📅 *Completed On:* ${new Date().toLocaleDateString('en-IN')}

The amount should reflect in your account within 2-3 business days depending on your bank.

Thank you for your patience!
*Parika Jewels*
    `.trim();
  }

  return await sendWhatsAppMessage(customerPhone, message);
};

/**
 * Send admin notification when refund status changes
 * @param {Object} order - Order object
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @returns {Promise<Object>}
 */
export const sendAdminRefundStatusUpdate = async (order, oldStatus, newStatus) => {
  const message = `
📊 *Refund Status Updated – Order #${order.orderNumber}*

👤 *Customer:* ${order.customerName}
📦 *Order Number:* ${order.orderNumber}
💰 *Refund Amount:* ₹${order.refundAmount.toFixed(2)}

*Status Change:* ${oldStatus} → ${newStatus}

Order Details: ${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/admin/orders
  `.trim();

  return await sendWhatsAppMessage(WHATSAPP_CONFIG.adminNumber, message);
};

export default {
  sendWhatsAppMessage,
  sendAdminCancellationPrepaidNotification,
  sendAdminCancellationCODNotification,
  sendCustomerCancellationPrepaidConfirmation,
  sendCustomerCancellationCODConfirmation,
  sendRefundStatusUpdate,
  sendAdminRefundStatusUpdate
};
