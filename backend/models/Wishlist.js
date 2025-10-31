import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
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
});

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [wishlistItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update timestamp whenever items change
wishlistSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
