import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Order Number - Unique identifier for tracking
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
    // Note: index is created via unique constraint, no need for separate index
  },

  // Customer Information
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },

  // Order Items
  items: [{
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String
    },
    category: {
      type: String
    },
    // Product-specific discount applied
    productDiscount: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      required: true
    }
  }],

  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'whatsapp', 'cod'],
    default: 'razorpay'
  },
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },

  // Pricing Breakdown
  subtotal: {
    type: Number,
    required: true
  },
  productDiscount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: ''
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  codCharge: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  totalSavings: {
    type: Number,
    default: 0
  },

  // Order Status
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // Refund Information
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'requested', 'processing', 'completed', 'rejected'],
    default: 'none'
  },
  refundId: {
    type: String
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundDate: {
    type: Date
  },
  refundInitiatedAt: {
    type: Date
  },
  refundError: {
    type: String
  },

  // Cancellation
  cancelledBy: {
    type: String,
    enum: ['customer', 'admin', 'system'],
    default: null
  },
  cancelReason: {
    type: String
  },
  customCancelReason: {
    type: String
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  canCancel: {
    type: Boolean,
    default: true
  },

  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },

  // Timeline tracking
  timeline: [{
    event: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String
    }
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Delivery tracking
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  trackingNumber: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ customerEmail: 1, createdAt: -1 });
// Note: razorpayOrderId index is created automatically via unique constraint in schema
orderSchema.index({ razorpayPaymentId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
// Note: orderNumber index is created automatically via unique constraint in schema

// Pre-save hook to generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Generate a unique order number
    const generateOrderNumber = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'ELG-';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Keep trying until we get a unique order number
    let orderNumber;
    let isUnique = false;
    while (!isUnique) {
      orderNumber = generateOrderNumber();
      const existing = await mongoose.model('Order').findOne({ orderNumber });
      if (!existing) {
        isUnique = true;
      }
    }
    this.orderNumber = orderNumber;
  }
  next();
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  // Order can be cancelled if:
  // 1. canCancel flag is true
  // 2. Order status is not shipped, delivered, or already cancelled
  // 3. Payment is not already refunded
  return (
    this.canCancel &&
    this.orderStatus !== 'shipped' &&
    this.orderStatus !== 'delivered' &&
    this.orderStatus !== 'cancelled' &&
    this.paymentStatus !== 'refunded'
  );
};

// Method to calculate total savings
orderSchema.methods.calculateSavings = function() {
  return this.productDiscount + this.couponDiscount;
};

// Pre-save middleware to update timestamps and calculations
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.totalSavings = this.productDiscount + this.couponDiscount;
  
  // Auto-disable cancellation after 24 hours
  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24) {
    this.canCancel = false;
  }
  
  // Auto-disable cancellation if shipped or delivered
  if (this.orderStatus === 'shipped' || this.orderStatus === 'delivered') {
    this.canCancel = false;
  }
  
  next();
});

// Static method to get order statistics
orderSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { 
          $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'success'] },
              '$finalAmount',
              0
            ]
          }
        },
        successfulPayments: {
          $sum: { 
            $cond: [{ $eq: ['$paymentStatus', 'success'] }, 1, 0]
          }
        },
        failedPayments: {
          $sum: { 
            $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0]
          }
        },
        refundedOrders: {
          $sum: { 
            $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 1, 0]
          }
        },
        // Order status counts
        pendingOrders: {
          $sum: { 
            $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0]
          }
        },
        confirmedOrders: {
          $sum: { 
            $cond: [{ $eq: ['$orderStatus', 'confirmed'] }, 1, 0]
          }
        },
        processingOrders: {
          $sum: { 
            $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0]
          }
        },
        shippedOrders: {
          $sum: { 
            $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0]
          }
        },
        deliveredOrders: {
          $sum: { 
            $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0]
          }
        },
        cancelledOrders: {
          $sum: { 
            $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0]
          }
        },
        totalProductDiscount: {
          $sum: '$productDiscount'
        },
        totalCouponDiscount: {
          $sum: '$couponDiscount'
        },
        totalSavingsGiven: {
          $sum: { $add: ['$productDiscount', '$couponDiscount'] }
        },
        // Calculate total refunded amount
        totalRefunds: {
          $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'refunded'] },
              1,
              0
            ]
          }
        },
        refundedAmount: {
          $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'refunded'] },
              '$refundAmount',
              0
            ]
          }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalOrders: 0,
    totalRevenue: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundedOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalProductDiscount: 0,
    totalCouponDiscount: 0,
    totalSavingsGiven: 0,
    totalRefunds: 0,
    refundedAmount: 0
  };
};

export default mongoose.model('Order', orderSchema);
