import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  // There should only be one settings document
  settingsId: {
    type: String,
    default: 'store_settings',
    unique: true,
    required: true
  },
  
  // Payment method toggles
  codEnabled: {
    type: Boolean,
    default: true // Cash on Delivery enabled by default
  },
  
  razorpayEnabled: {
    type: Boolean,
    default: true // Online payment enabled by default
  },
  
  // Store operational status
  storeOpen: {
    type: Boolean,
    default: true
  },
  
  // COD specific settings
  codMinimumOrder: {
    type: Number,
    default: 0 // Minimum order amount for COD (0 means no minimum)
  },
  
  codMaximumOrder: {
    type: Number,
    default: 100000 // Maximum order amount for COD
  },
  
  codExtraCharge: {
    type: Number,
    default: 0 // Extra charge for COD orders (0 means no charge)
  },
  
  // Metadata
  lastUpdatedBy: {
    type: String,
    default: ''
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get or create settings
storeSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ settingsId: 'store_settings' });
  
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({
      settingsId: 'store_settings',
      codEnabled: true,
      razorpayEnabled: true,
      storeOpen: true,
      codMinimumOrder: 0,
      codMaximumOrder: 100000,
      codExtraCharge: 0
    });
  }
  
  return settings;
};

// Static method to update settings
storeSettingsSchema.statics.updateSettings = async function(updates, adminEmail) {
  const settings = await this.getSettings();
  
  Object.assign(settings, updates);
  settings.lastUpdatedBy = adminEmail;
  settings.updatedAt = new Date();
  
  await settings.save();
  return settings;
};

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

export default StoreSettings;
