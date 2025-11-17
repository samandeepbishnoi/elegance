// Automatic order cleanup utility
// Cancels orders with pending payment after 2 days

import Order from '../models/Order.js';

/**
 * Cancel orders with pending payment older than 2 days
 * @returns {Object} Statistics about cancelled orders
 */
export const cancelPendingOrders = async () => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Find orders that are:
    // 1. Payment status is 'pending' or 'created'
    // 2. Created more than 2 days ago
    // 3. Not already cancelled
    const pendingOrders = await Order.find({
      paymentStatus: { $in: ['pending', 'created'] },
      orderStatus: { $ne: 'cancelled' },
      createdAt: { $lt: twoDaysAgo }
    });

    const results = {
      found: pendingOrders.length,
      cancelled: 0,
      failed: 0,
      errors: []
    };

    for (const order of pendingOrders) {
      try {
        // Update order status
        order.orderStatus = 'cancelled';
        order.paymentStatus = 'failed';
        order.canCancel = false;
        order.cancellationReason = 'Automatically cancelled - Payment not received within 2 days';
        order.cancelledAt = new Date();

        await order.save();
        results.cancelled++;
        
        console.log(`✓ Auto-cancelled order ${order.orderNumber || order._id} - Created: ${order.createdAt}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          error: error.message
        });
        console.error(`✗ Failed to cancel order ${order.orderNumber || order._id}:`, error.message);
      }
    }

    return results;
  } catch (error) {
    console.error('Error in cancelPendingOrders:', error);
    throw error;
  }
};

/**
 * Run cleanup and log results
 */
export const runOrderCleanup = async () => {
  console.log('\n🧹 Running order cleanup job...');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    const results = await cancelPendingOrders();
    
    console.log('\n📊 Cleanup Results:');
    console.log(`   Orders checked: ${results.found}`);
    console.log(`   Successfully cancelled: ${results.cancelled}`);
    console.log(`   Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(err => {
        console.log(`   Order ${err.orderNumber || err.orderId}: ${err.error}`);
      });
    }
    
    console.log('\n✅ Order cleanup completed\n');
    return results;
  } catch (error) {
    console.error('\n❌ Order cleanup failed:', error);
    throw error;
  }
};

export default {
  cancelPendingOrders,
  runOrderCleanup
};
