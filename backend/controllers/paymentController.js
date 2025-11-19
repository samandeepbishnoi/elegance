import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import {
  sendAdminCancellationPrepaidNotification,
  sendAdminCancellationCODNotification,
  sendCustomerCancellationPrepaidConfirmation,
  sendCustomerCancellationCODConfirmation,
  sendRefundStatusUpdate
} from '../services/whatsappService.js';
// Note: Product model not currently used - inventory managed on frontend

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      pincode,
      notes,
      items,
      subtotal,
      productDiscount,
      couponCode,
      couponDiscount,
      finalAmount
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all customer details'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount'
      });
    }

    // Note: Product inventory is managed on the frontend via StoreContext
    // The backend stores product information but doesn't manage stock

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        customerName,
        customerEmail,
        customerPhone,
        couponCode: couponCode || 'none'
      }
    });

    // Create order in database
    const order = new Order({
      customerName,
      customerEmail,
      customerPhone,
      address,
      pincode,
      notes: notes || '',
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
        productDiscount: item.productDiscount || 0,
        finalPrice: item.finalPrice
      })),
      subtotal,
      productDiscount: productDiscount || 0,
      couponCode: couponCode || '',
      couponDiscount: couponDiscount || 0,
      finalAmount,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: finalAmount,
        currency: 'INR',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Create COD (Cash on Delivery) order
export const createCODOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      pincode,
      notes,
      structuredAddress,
      items,
      subtotal,
      productDiscount,
      couponCode,
      couponDiscount,
      codCharge,
      finalAmount
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all customer details'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount'
      });
    }

    // Create order in database with COD payment method
    const order = new Order({
      customerName,
      customerEmail,
      customerPhone,
      address,
      pincode,
      notes: notes || '',
      structuredAddress: structuredAddress || null,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
        productDiscount: item.productDiscount || 0,
        finalPrice: item.finalPrice
      })),
      subtotal,
      productDiscount: productDiscount || 0,
      couponCode: couponCode || '',
      couponDiscount: couponDiscount || 0,
      codCharge: codCharge || 0,
      finalAmount,
      paymentMethod: 'cod',
      paymentStatus: 'pending', // Will be marked as success when payment is collected on delivery
      orderStatus: 'confirmed' // COD orders are auto-confirmed
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'COD order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        address: order.address,
        pincode: order.pincode,
        items: order.items,
        subtotal: order.subtotal,
        productDiscount: order.productDiscount,
        couponCode: order.couponCode,
        couponDiscount: order.couponDiscount,
        codCharge: order.codCharge,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Create COD order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create COD order',
      error: error.message
    });
  }
};

// Verify payment and update order
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      // Update order as failed
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.paymentStatus = 'success';
    order.orderStatus = 'confirmed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // Note: Product inventory is managed on the frontend via StoreContext
    // If you need backend inventory management, create a Product model

    // Update coupon usage if coupon was used
    if (order.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode },
        {
          $inc: { usedCount: 1 }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        finalAmount: order.finalAmount
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    
    // Update order status to failed if orderId is available
    if (req.body.orderId) {
      try {
        await Order.findByIdAndUpdate(req.body.orderId, {
          paymentStatus: 'failed',
          orderStatus: 'cancelled',
          canCancel: false
        });
      } catch (updateError) {
        console.error('Failed to update order status:', updateError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Get customer orders
export const getCustomerOrders = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const orders = await Order.find({ customerEmail: email })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Increment view count
    order.viewCount += 1;
    await order.save();

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Mark payment as failed
export const markPaymentFailed = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only update if payment is still pending
    if (order.paymentStatus === 'pending') {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      order.canCancel = false;
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated to failed',
      order
    });
  } catch (error) {
    console.error('Mark payment failed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, customReason, cancelledBy = 'customer' } = req.body;

    console.log('Cancel order request:', { orderId: id, reason, customReason, cancelledBy });

    const order = await Order.findById(id);
    if (!order) {
      console.log('Order not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order found:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      canCancel: order.canCancel,
      createdAt: order.createdAt,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod
    });

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      console.log('Order cannot be cancelled:', {
        canCancel: order.canCancel,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      });
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled. Either it has been shipped, delivered, or the cancellation window has expired.'
      });
    }

    // Validate reason
    if (!reason && !customReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a cancellation reason'
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.cancelledBy = cancelledBy;
    order.cancelReason = reason;
    order.customCancelReason = customReason;
    order.cancellationReason = customReason || reason; // For backward compatibility
    order.cancelledAt = new Date();
    order.canCancel = false;

    // Add timeline entry
    if (!order.timeline) {
      order.timeline = [];
    }
    order.timeline.push({
      event: 'Order Cancelled',
      date: new Date(),
      description: `Order cancelled by ${cancelledBy}. Reason: ${customReason || reason}`
    });

    // Note: Product inventory restoration skipped - inventory managed on frontend
    // If you implement backend Product model, uncomment below:
    /*
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }
    */

    // Restore coupon usage if coupon was used
    if (order.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode },
        {
          $inc: { usedCount: -1 }
        }
      );
    }

    const isPrepaid = order.paymentMethod === 'razorpay' && order.paymentStatus === 'success';
    const isCOD = order.paymentMethod === 'cod' || order.paymentMethod === 'whatsapp';

    // Initiate refund if payment was successful (prepaid)
    if (isPrepaid && order.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(order.finalAmount * 100), // Full refund in paise
          speed: 'normal',
          notes: {
            reason: customReason || reason || 'Customer requested cancellation',
            order_id: order._id.toString()
          }
        });

        order.refundStatus = 'pending';
        order.refundId = refund.id;
        order.refundAmount = order.finalAmount;
        order.refundReason = customReason || reason || 'Customer requested cancellation';
        order.refundDate = new Date();
        
        // Add timeline entry for refund
        order.timeline.push({
          event: 'Refund Initiated',
          date: new Date(),
          description: `Refund of ₹${order.finalAmount} initiated automatically`
        });

        console.log('✅ Refund initiated:', refund.id);
      } catch (refundError) {
        console.error('Refund error:', refundError);
        order.refundStatus = 'pending';
        order.refundAmount = order.finalAmount;
        order.refundReason = customReason || reason || 'Customer requested cancellation';
        
        // Add timeline entry for refund failure
        order.timeline.push({
          event: 'Refund Failed',
          date: new Date(),
          description: 'Automatic refund failed. Manual processing required.'
        });
      }
    }

    await order.save();

    console.log('✅ Order cancelled successfully. Sending WhatsApp notifications...');
    console.log('   - isPrepaid:', isPrepaid);
    console.log('   - isCOD:', isCOD);
    console.log('   - Payment Method:', order.paymentMethod);

    // Send WhatsApp notifications
    try {
      if (isPrepaid) {
        console.log('📱 Sending prepaid cancellation notifications...');
        // Send admin notification for prepaid order
        const adminResult = await sendAdminCancellationPrepaidNotification(order);
        console.log('   - Admin notification result:', adminResult);
        
        // Send customer confirmation
        const customerResult = await sendCustomerCancellationPrepaidConfirmation(order);
        console.log('   - Customer notification result:', customerResult);
        
        // Add timeline entry for notifications
        order.timeline.push({
          event: 'Notifications Sent',
          date: new Date(),
          description: 'WhatsApp notifications sent to admin and customer'
        });
      } else if (isCOD) {
        console.log('📱 Sending COD cancellation notifications...');
        // Send admin notification for COD order
        const adminResult = await sendAdminCancellationCODNotification(order);
        console.log('   - Admin notification result:', adminResult);
        
        // Send customer confirmation
        const customerResult = await sendCustomerCancellationCODConfirmation(order);
        console.log('   - Customer notification result:', customerResult);
        
        // Add timeline entry for notifications
        order.timeline.push({
          event: 'Notifications Sent',
          date: new Date(),
          description: 'WhatsApp notifications sent to admin and customer'
        });
      }
      
      await order.save();
      console.log('✅ WhatsApp notifications completed');
    } catch (notificationError) {
      console.error('❌ WhatsApp notification error:', notificationError);
      console.error('   Stack:', notificationError.stack);
      // Don't fail the cancellation if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Process refund (admin only)
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    console.log(`\n🔄 ========== REFUND DEBUG START ==========`);
    console.log(`🔄 Initiating refund for order: ${id}`);

    // Don't populate 'user' - it doesn't exist in Order schema
    const order = await Order.findById(id);
    if (!order) {
      console.log(`❌ Order not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`✅ Order found: ${order.orderNumber}`);
    console.log(`📊 Order Details:`);
    console.log(`   - Payment Method: ${order.paymentMethod}`);
    console.log(`   - Payment Status: ${order.paymentStatus}`);
    console.log(`   - Refund Status: ${order.refundStatus || 'none'}`);
    console.log(`   - Payment ID: ${order.razorpayPaymentId || 'NOT FOUND'}`);
    console.log(`   - Final Amount: ₹${order.finalAmount}`);

    // Admin can initiate refund for any prepaid order (no need to be cancelled)
    // Check if payment was successful (works for both 'online' and 'razorpay' payment methods)
    if (order.paymentStatus !== 'success') {
      console.log(`❌ Payment not successful. Status: ${order.paymentStatus}`);
      return res.status(400).json({
        success: false,
        message: `Only successful prepaid orders can be refunded. Current payment status: ${order.paymentStatus}`
      });
    }

    // Check if this is actually a paid order (not COD or WhatsApp)
    if (order.paymentMethod === 'cod' || order.paymentMethod === 'whatsapp') {
      console.log(`❌ Cannot refund ${order.paymentMethod} orders`);
      return res.status(400).json({
        success: false,
        message: `COD and WhatsApp orders cannot be refunded through this system. Payment method: ${order.paymentMethod}`
      });
    }

    // Check if refund already initiated
    if (order.refundStatus && order.refundStatus !== 'none') {
      console.log(`❌ Refund already initiated. Status: ${order.refundStatus}`);
      return res.status(400).json({
        success: false,
        message: `Refund already ${order.refundStatus}. Current status: ${order.refundStatus}`
      });
    }

    // For prepaid orders, initiate payment gateway refund
    const paymentId = order.razorpayPaymentId || order.paymentId;
    
    console.log(`🔍 Checking payment ID: ${paymentId ? 'FOUND' : 'NOT FOUND'}`);
    
    if (order.paymentStatus === 'success' && paymentId) {
      try {
        // Process refund via payment gateway (currently Razorpay)
        const refundAmount = amount || order.finalAmount;
        console.log(`💰 Processing payment gateway refund: ₹${refundAmount}`);
        console.log(`💳 Using payment ID: ${paymentId}`);
        
        const refund = await razorpay.payments.refund(paymentId, {
          amount: Math.round(refundAmount * 100), // Convert to paise
          speed: 'normal',
          notes: {
            reason: reason || 'Refund initiated by admin',
            order_id: order._id.toString()
          }
        });

        console.log(`✅ Payment gateway refund created: ${refund.id}`);

        // Set refund to PENDING (not completed immediately)
        order.refundStatus = 'pending';
        order.refundId = refund.id;
        order.refundAmount = refundAmount;
        order.refundReason = reason || 'Refund initiated by admin';
        order.refundInitiatedAt = new Date();

        // Automatically cancel the order when refund is initiated
        order.orderStatus = 'cancelled';

        // Add timeline entry
        if (!order.timeline) order.timeline = [];
        order.timeline.push({
          event: 'Refund initiated',
          date: new Date(),
          description: `Admin initiated refund of ₹${refundAmount}. Refund ID: ${refund.id}`
        });
        order.timeline.push({
          event: 'Order cancelled',
          date: new Date(),
          description: 'Order automatically cancelled due to refund initiation'
        });

        await order.save();

        console.log(`✅ Order updated with refund status: pending and orderStatus: cancelled`);

        res.status(200).json({
          success: true,
          message: 'Refund initiated successfully. Order has been cancelled.',
          refund: {
            refundId: refund.id,
            amount: refundAmount,
            status: 'pending',
            razorpayStatus: refund.status
          },
          order: {
            refundStatus: order.refundStatus,
            refundAmount: order.refundAmount,
            orderStatus: order.orderStatus,
            refundInitiatedAt: order.refundInitiatedAt
          }
        });

      } catch (paymentGatewayError) {
        console.error('❌ Payment gateway refund failed:', paymentGatewayError);
        console.error('❌ Error details:', paymentGatewayError.message);
        console.log(`🔄 Marking refund as pending for manual processing`);
        
        // Still mark as pending even if payment gateway fails (can be processed manually)
        order.refundStatus = 'pending';
        order.refundAmount = amount || order.finalAmount;
        order.refundReason = reason || 'Refund initiated by admin';
        order.refundInitiatedAt = new Date();
        order.refundError = paymentGatewayError.message;

        // Automatically cancel the order when refund is initiated
        order.orderStatus = 'cancelled';

        if (!order.timeline) order.timeline = [];
        order.timeline.push({
          event: 'Refund initiated (manual processing required)',
          date: new Date(),
          description: `Payment gateway refund failed: ${paymentGatewayError.message}. Manual processing required.`
        });
        order.timeline.push({
          event: 'Order cancelled',
          date: new Date(),
          description: 'Order automatically cancelled due to refund initiation'
        });

        await order.save();

        console.log(`✅ Order saved with pending refund status and orderStatus: cancelled`);
        console.log(`🔄 ========== REFUND DEBUG END (GATEWAY ERROR) ==========\n`);

        return res.status(200).json({
          success: true,
          message: 'Refund marked as pending. Order has been cancelled. Payment gateway processing failed - manual action required.',
          warning: paymentGatewayError.message,
          order: {
            refundStatus: order.refundStatus,
            refundAmount: order.refundAmount,
            orderStatus: order.orderStatus,
            refundInitiatedAt: order.refundInitiatedAt
          }
        });
      }

    } else {
      // Order doesn't have payment ID
      console.log(`❌ No payment ID found. Cannot process refund.`);
      console.log(`🔄 ========== REFUND DEBUG END (NO PAYMENT ID) ==========\n`);
      return res.status(400).json({
        success: false,
        message: 'Payment ID not found. Cannot process refund for this order.'
      });
    }

  } catch (error) {
    console.error('💥 Process refund error:', error);
    console.error('💥 Error stack:', error.stack);
    console.log(`🔄 ========== REFUND DEBUG END (EXCEPTION) ==========\n`);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      orderStatus,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } } // Search by order number
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, orderStatus, trackingNumber } = req.body;
    
    // Accept both 'status' and 'orderStatus' for flexibility
    const newStatus = status || orderStatus;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.orderStatus = newStatus;
    order.updatedAt = new Date();

    // Set timestamps and canCancel flag based on status
    if (newStatus === 'shipped') {
      order.shippedAt = new Date();
      order.canCancel = false;
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
    } else if (newStatus === 'delivered') {
      order.deliveredAt = new Date();
      order.canCancel = false;
    } else if (newStatus === 'cancelled') {
      order.cancelledAt = new Date();
      order.canCancel = false;
    } else {
      // For any other status (pending, confirmed, processing), allow cancellation
      order.canCancel = true;
    }

    await order.save();

    console.log(`✅ Order ${id} status updated to: ${newStatus}`);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get order statistics (admin only)
export const getOrderStatistics = async (req, res) => {
  try {
    const stats = await Order.getStatistics();

    // Get recent orders count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    // Get this month's revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          paymentStatus: 'success'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        ...stats,
        todayOrders,
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Update refund status (admin only)
export const updateRefundStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundStatus } = req.body;

    if (!refundStatus) {
      return res.status(400).json({
        success: false,
        message: 'Refund status is required'
      });
    }

    const validStatuses = ['none', 'pending', 'requested', 'processing', 'completed', 'rejected'];
    if (!validStatuses.includes(refundStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund status'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.refundStatus;
    order.refundStatus = refundStatus;
    order.updatedAt = new Date();

    // Add timeline entry
    if (!order.timeline) {
      order.timeline = [];
    }
    order.timeline.push({
      event: 'Refund Status Updated',
      date: new Date(),
      description: `Refund status changed from ${oldStatus} to ${refundStatus}`
    });

    // Handle status-specific updates
    if (refundStatus === 'completed') {
      // Mark refund as completed
      order.paymentStatus = 'refunded';
      order.refundDate = new Date();
      
      order.timeline.push({
        event: 'Refund Completed',
        date: new Date(),
        description: `Refund of ₹${order.refundAmount || order.finalAmount} completed`
      });
    } else if (oldStatus === 'completed' && refundStatus === 'processing') {
      // Undo completion - revert payment status back to success
      order.paymentStatus = 'success';
      order.refundDate = null;
      
      order.timeline.push({
        event: 'Refund Completion Undone',
        date: new Date(),
        description: `Refund completion reverted. Status changed back to processing by admin.`
      });
      
      console.log(`⚠️ Order ${id} refund completion undone. Payment status reverted to 'success'`);
    }

    await order.save();

    // Send WhatsApp notification to customer
    try {
      if (refundStatus === 'processing' || refundStatus === 'completed') {
        await sendRefundStatusUpdate(order, refundStatus);
        
        order.timeline.push({
          event: 'Customer Notified',
          date: new Date(),
          description: `Customer notified about refund status: ${refundStatus}`
        });
        
        await order.save();
      }
    } catch (notificationError) {
      console.error('WhatsApp notification error:', notificationError);
      // Don't fail the update if notification fails
    }

    console.log(`✅ Order ${id} refund status updated to: ${refundStatus}`);

    res.status(200).json({
      success: true,
      message: 'Refund status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update refund status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update refund status',
      error: error.message
    });
  }
};
