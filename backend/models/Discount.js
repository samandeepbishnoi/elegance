import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  scope: { 
    type: String, 
    enum: ['global', 'category', 'product'], 
    required: true 
  },
  category: { 
    type: String,
    // Required only when scope is 'category'
    validate: {
      validator: function(value) {
        return this.scope !== 'category' || (value && value.trim().length > 0);
      },
      message: 'Category is required when scope is "category"'
    }
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    // Required only when scope is 'product'
    validate: {
      validator: function(value) {
        return this.scope !== 'product' || value != null;
      },
      message: 'Product ID is required when scope is "product"'
    }
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'flat'], 
    required: true 
  },
  discountValue: { 
    type: Number, 
    required: true,
    min: [0, 'Discount value cannot be negative'],
    validate: {
      validator: function(value) {
        // Percentage discounts should be between 0 and 100
        if (this.discountType === 'percentage') {
          return value >= 0 && value <= 100;
        }
        return value >= 0;
      },
      message: 'Percentage discount must be between 0 and 100'
    }
  },
  startDate: { 
    type: Date,
    default: null
  },
  endDate: { 
    type: Date,
    default: null,
    validate: {
      validator: function(value) {
        // If both dates are set, endDate should be after startDate
        if (value && this.startDate) {
          return value > this.startDate;
        }
        return true;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  priority: {
    type: Number,
    default: function() {
      // Product-specific: highest priority (3)
      // Category: medium priority (2)
      // Global: lowest priority (1)
      switch(this.scope) {
        case 'product': return 3;
        case 'category': return 2;
        case 'global': return 1;
        default: return 0;
      }
    }
  },
  description: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true 
});

// Virtual to check if discount is currently valid
discountSchema.virtual('isValid').get(function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  // Check if started (if startDate is set)
  if (this.startDate && now < this.startDate) {
    return false;
  }
  
  // Check if expired (if endDate is set)
  if (this.endDate && now > this.endDate) {
    return false;
  }
  
  return true;
});

// Method to calculate discounted price
discountSchema.methods.calculateDiscountedPrice = function(originalPrice) {
  if (!this.isValid) {
    return originalPrice;
  }

  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (originalPrice * this.discountValue) / 100;
  } else if (this.discountType === 'flat') {
    discountAmount = this.discountValue;
  }
  
  // Ensure the discounted price doesn't go below 0
  const discountedPrice = Math.max(0, originalPrice - discountAmount);
  
  return {
    originalPrice,
    discountAmount: Math.min(discountAmount, originalPrice),
    finalPrice: discountedPrice,
    discountPercentage: originalPrice > 0 ? ((discountAmount / originalPrice) * 100).toFixed(2) : 0
  };
};

// Method to get discount label for display
discountSchema.methods.getDiscountLabel = function() {
  if (this.discountType === 'percentage') {
    return `${this.discountValue}% OFF`;
  } else {
    return `₹${this.discountValue} OFF`;
  }
};

// Index for efficient querying
discountSchema.index({ scope: 1, isActive: 1 });
discountSchema.index({ category: 1, isActive: 1 });
discountSchema.index({ productId: 1, isActive: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

// Enable virtuals in JSON
discountSchema.set('toJSON', { virtuals: true });
discountSchema.set('toObject', { virtuals: true });

const Discount = mongoose.model('Discount', discountSchema);

export default Discount;
