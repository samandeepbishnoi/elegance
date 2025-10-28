import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  discountType: {
    type: String,
    required: [true, 'Discount type is required'],
    enum: {
      values: ['percentage', 'flat'],
      message: 'Discount type must be either percentage or flat'
    }
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value must be positive']
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase must be positive']
  },
  startDate: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [0, 'Usage limit must be positive']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  applicableCategories: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual to check if coupon has started
couponSchema.virtual('hasStarted').get(function() {
  if (!this.startDate) return true;
  return new Date() >= this.startDate;
});

// Virtual to check if usage limit is reached
couponSchema.virtual('isUsageLimitReached').get(function() {
  if (!this.usageLimit) return false;
  return this.usedCount >= this.usageLimit;
});

// Method to validate if coupon can be used
couponSchema.methods.canBeUsed = function() {
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }
  
  if (!this.hasStarted) {
    return { valid: false, message: 'Coupon is not yet active' };
  }
  
  if (this.isExpired) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  if (this.isUsageLimitReached) {
    return { valid: false, message: 'Usage limit reached for this coupon' };
  }
  
  return { valid: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(cartTotal) {
  if (this.discountType === 'percentage') {
    return Math.round((cartTotal * this.discountValue) / 100);
  } else {
    // Flat discount
    return Math.min(this.discountValue, cartTotal);
  }
};

// Middleware to uppercase code before saving
couponSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase().trim();
  }
  next();
});

// Middleware to uppercase code before updating
couponSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.code) {
    update.code = update.code.toUpperCase().trim();
  }
  next();
});

// Enable virtuals in JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
