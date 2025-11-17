import express from 'express';
import Address from '../models/Address.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all addresses for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.userId })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
});

// Get default address
router.get('/default', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      userId: req.user.userId,
      isDefault: true 
    });
    
    res.status(200).json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default address',
      error: error.message
    });
  }
});

// Create new address
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      addressType,
      fullName,
      phone,
      flatNumber,
      street,
      landmark,
      city,
      state,
      pincode,
      isDefault
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // If this is the first address or marked as default, set it as default
    const addressCount = await Address.countDocuments({ userId: req.user.userId });
    const shouldBeDefault = isDefault || addressCount === 0;

    // If setting as default, remove default from other addresses
    if (shouldBeDefault) {
      await Address.updateMany(
        { userId: req.user.userId },
        { $set: { isDefault: false } }
      );
    }

    const newAddress = new Address({
      userId: req.user.userId,
      addressType: addressType || 'home',
      fullName,
      phone,
      flatNumber,
      street,
      landmark,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
});

// Update address
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify the address belongs to the user
    const address = await Address.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, remove default from other addresses
    if (updateData.isDefault) {
      await Address.updateMany(
        { userId: req.user.userId, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, updateData);
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
});

// Delete address
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId: req.user.userId });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
});

// Set address as default
router.patch('/:id/default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.setAsDefault();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      address
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
});

// Pincode lookup API - Get city and state from pincode
router.get('/pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;

    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    // Use India Post API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0];
      
      res.status(200).json({
        success: true,
        data: {
          city: postOffice.District,
          state: postOffice.State,
          country: postOffice.Country,
          region: postOffice.Region,
          pincode: pincode
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Pincode not found or invalid'
      });
    }
  } catch (error) {
    console.error('Error looking up pincode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lookup pincode',
      error: error.message
    });
  }
});

// Clerk-based routes (userId as parameter instead of JWT)
// Get all addresses for a user by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
});

// Create new address for a user by userId
router.post('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      addressType,
      fullName,
      phone,
      flatNumber,
      street,
      landmark,
      city,
      state,
      pincode,
      isDefault
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // If this is the first address or marked as default, set it as default
    const addressCount = await Address.countDocuments({ userId });
    const shouldBeDefault = isDefault || addressCount === 0;

    // If setting as default, remove default from other addresses
    if (shouldBeDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    const newAddress = new Address({
      userId,
      addressType: addressType || 'home',
      fullName,
      phone,
      flatNumber,
      street,
      landmark,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
});

// Update address for a user by userId
router.put('/user/:userId/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const updateData = req.body;

    // Verify the address belongs to the user
    const address = await Address.findOne({ 
      _id: addressId, 
      userId 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, remove default from other addresses
    if (updateData.isDefault) {
      await Address.updateMany(
        { userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, updateData);
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
});

// Delete address for a user by userId
router.delete('/user/:userId/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const address = await Address.findOne({ 
      _id: addressId, 
      userId 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await Address.deleteOne({ _id: addressId });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
});

export default router;

