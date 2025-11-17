import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  flatNumber: {
    type: String,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
addressSchema.index({ userId: 1, isDefault: 1 });

// Method to set this address as default
addressSchema.methods.setAsDefault = async function() {
  // Remove default from all other addresses of this user
  await mongoose.model('Address').updateMany(
    { userId: this.userId, _id: { $ne: this._id } },
    { $set: { isDefault: false } }
  );
  this.isDefault = true;
  await this.save();
};

const Address = mongoose.model('Address', addressSchema);

export default Address;
