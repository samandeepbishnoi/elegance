import express from 'express';
import StoreSettings from '../models/StoreSettings.js';
import { authenticateToken, authenticateMainAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get current store settings (public route - needed for checkout page)
router.get('/', async (req, res) => {
  try {
    const settings = await StoreSettings.getSettings();
    
    // Return only necessary public settings
    res.status(200).json({
      success: true,
      settings: {
        codEnabled: settings.codEnabled,
        razorpayEnabled: settings.razorpayEnabled,
        storeOpen: settings.storeOpen,
        codMinimumOrder: settings.codMinimumOrder,
        codMaximumOrder: settings.codMaximumOrder,
        codExtraCharge: settings.codExtraCharge
      }
    });
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store settings',
      error: error.message
    });
  }
});

// Get full settings details (admin only)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const settings = await StoreSettings.getSettings();
    
    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Update COD settings (main admin only)
router.put('/cod', authenticateMainAdmin, async (req, res) => {
  try {
    const { codEnabled, codMinimumOrder, codMaximumOrder, codExtraCharge } = req.body;
    
    const updates = {};
    if (typeof codEnabled === 'boolean') updates.codEnabled = codEnabled;
    if (typeof codMinimumOrder === 'number') updates.codMinimumOrder = codMinimumOrder;
    if (typeof codMaximumOrder === 'number') updates.codMaximumOrder = codMaximumOrder;
    if (typeof codExtraCharge === 'number') updates.codExtraCharge = codExtraCharge;
    
    const settings = await StoreSettings.updateSettings(updates, req.user.email);
    
    res.status(200).json({
      success: true,
      message: 'COD settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating COD settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update COD settings',
      error: error.message
    });
  }
});

// Update Razorpay settings (main admin only)
router.put('/razorpay', authenticateMainAdmin, async (req, res) => {
  try {
    const { razorpayEnabled } = req.body;
    
    if (typeof razorpayEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid razorpayEnabled value'
      });
    }
    
    const settings = await StoreSettings.updateSettings(
      { razorpayEnabled },
      req.user.email
    );
    
    res.status(200).json({
      success: true,
      message: 'Razorpay settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating Razorpay settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Razorpay settings',
      error: error.message
    });
  }
});

// Update all payment settings at once (main admin only)
router.put('/payment', authenticateMainAdmin, async (req, res) => {
  try {
    const {
      codEnabled,
      razorpayEnabled,
      codMinimumOrder,
      codMaximumOrder,
      codExtraCharge
    } = req.body;
    
    const updates = {};
    if (typeof codEnabled === 'boolean') updates.codEnabled = codEnabled;
    if (typeof razorpayEnabled === 'boolean') updates.razorpayEnabled = razorpayEnabled;
    if (typeof codMinimumOrder === 'number') updates.codMinimumOrder = codMinimumOrder;
    if (typeof codMaximumOrder === 'number') updates.codMaximumOrder = codMaximumOrder;
    if (typeof codExtraCharge === 'number') updates.codExtraCharge = codExtraCharge;
    
    const settings = await StoreSettings.updateSettings(updates, req.user.email);
    
    res.status(200).json({
      success: true,
      message: 'Payment settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment settings',
      error: error.message
    });
  }
});

// Update store open/close status (main admin only)
router.put('/store-status', authenticateMainAdmin, async (req, res) => {
  try {
    const { storeOpen } = req.body;
    
    if (typeof storeOpen !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid storeOpen value'
      });
    }
    
    const settings = await StoreSettings.updateSettings(
      { storeOpen },
      req.user.email
    );
    
    res.status(200).json({
      success: true,
      message: `Store ${storeOpen ? 'opened' : 'closed'} successfully`,
      settings
    });
  } catch (error) {
    console.error('Error updating store status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store status',
      error: error.message
    });
  }
});

export default router;
