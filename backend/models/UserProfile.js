import mongoose from 'mongoose';

// Cart item sub-schema
const cartItemSchema = new mongoose.Schema({
  _id: {
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
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  category: String,
  tags: [String],
  variant: {
    size: String,
    color: String,
    material: String
  }
}, { _id: false });

// Wishlist item sub-schema
const wishlistItemSchema = new mongoose.Schema({
  _id: {
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
  image: {
    type: String,
    required: true
  },
  category: String,
  tags: [String],
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const userProfileSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  phoneNumber: String,
  
  // Cart stored directly in user profile
  cart: {
    items: [cartItemSchema],
    total: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Wishlist stored directly in user profile
  wishlist: {
    items: [wishlistItemSchema],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  addresses: [{
    type: {
      type: String,
      enum: ['shipping', 'billing', 'both'],
      default: 'both'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update cart total whenever cart items change
userProfileSchema.pre('save', function(next) {
  if (this.cart && this.cart.items) {
    this.cart.total = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.cart.lastUpdated = new Date();
  }
  if (this.wishlist && this.wishlist.items) {
    this.wishlist.lastUpdated = new Date();
  }
  next();
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
