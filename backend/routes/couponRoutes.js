import express from 'express';
import jwt from 'jsonwebtoken';
import Coupon from '../models/Coupon.js';
import sseManager from '../utils/sseManager.js';

const router = express.Router();

// JWT middleware for admin authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

/**
 * @route   POST /api/coupons
 * @desc    Create a new coupon
 * @access  Admin
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
      isActive,
      usageLimit,
      applicableCategories,
      description
    } = req.body;

    // Validate required fields
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: code, discountType, and discountValue are required'
      });
    }

    // Validate discount type
    if (!['percentage', 'flat'].includes(discountType)) {
      return res.status(400).json({
        message: 'Discount type must be either "percentage" or "flat"'
      });
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({
        message: 'Percentage discount must be between 0 and 100'
      });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        message: 'Discount value must be greater than 0'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return res.status(400).json({
        message: 'Coupon code already exists'
      });
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      expiryDate: expiryDate || null,
      isActive: isActive !== undefined ? isActive : true,
      usageLimit: usageLimit || null,
      applicableCategories: applicableCategories || [],
      description: description || ''
    });

    await coupon.save();

    // Broadcast SSE event for new coupon
    sseManager.broadcast('coupon_update', {
      action: 'created',
      coupon: coupon.toObject(),
      message: `New coupon created: ${coupon.code}`,
    });

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      message: 'Failed to create coupon',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/coupons
 * @desc    Get all coupons
 * @access  Admin
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 });

    res.json({
      count: coupons.length,
      coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/coupons/:id
 * @desc    Get a single coupon by ID
 * @access  Admin
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: 'Coupon not found'
      });
    }

    res.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      message: 'Failed to fetch coupon',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/coupons/:id
 * @desc    Update coupon details
 * @access  Admin
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
      isActive,
      usageLimit,
      applicableCategories,
      description
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: 'Coupon not found'
      });
    }

    // Validate discount type if provided
    if (discountType && !['percentage', 'flat'].includes(discountType)) {
      return res.status(400).json({
        message: 'Discount type must be either "percentage" or "flat"'
      });
    }

    // Validate discount value if provided
    if (discountValue !== undefined) {
      if (discountValue <= 0) {
        return res.status(400).json({
          message: 'Discount value must be greater than 0'
        });
      }

      const type = discountType || coupon.discountType;
      if (type === 'percentage' && (discountValue < 0 || discountValue > 100)) {
        return res.status(400).json({
          message: 'Percentage discount must be between 0 and 100'
        });
      }
    }

    // Check if new code already exists (if code is being updated)
    if (code && code.toUpperCase().trim() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
      if (existingCoupon) {
        return res.status(400).json({
          message: 'Coupon code already exists'
        });
      }
    }

    // Update fields (partial update)
    if (code !== undefined) coupon.code = code.toUpperCase().trim();
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (applicableCategories !== undefined) coupon.applicableCategories = applicableCategories;
    if (description !== undefined) coupon.description = description;

    await coupon.save();

    // Broadcast SSE event for coupon update
    sseManager.broadcast('coupon_update', {
      action: 'updated',
      coupon: coupon.toObject(),
      message: `Coupon updated: ${coupon.code}`,
    });

    res.json({
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      message: 'Failed to update coupon',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Delete a coupon
 * @access  Admin
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: 'Coupon not found'
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    // Broadcast SSE event for coupon deletion
    sseManager.broadcast('coupon_update', {
      action: 'deleted',
      couponId: req.params.id,
      couponCode: coupon.code,
      message: `Coupon deleted: ${coupon.code}`,
    });

    res.json({
      message: 'Coupon deleted successfully',
      coupon
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
});

// ============================================
// CUSTOMER ROUTES (Public)
// ============================================

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate coupon for checkout
 * @access  Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal, cartCategories, cartItems } = req.body;

    // Validate input
    if (!code) {
      return res.status(400).json({
        valid: false,
        message: 'Coupon code is required'
      });
    }

    if (!cartTotal || cartTotal <= 0) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid cart total'
      });
    }

    // Find coupon by code (case-insensitive)
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        valid: false,
        message: 'This coupon is currently inactive'
      });
    }

    // Check if coupon has started
    if (coupon.startDate && new Date() < new Date(coupon.startDate)) {
      return res.status(400).json({
        valid: false,
        message: 'This coupon is not yet active'
      });
    }

    // Check if coupon is expired
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        valid: false,
        message: 'This coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        valid: false,
        message: 'Usage limit reached for this coupon'
      });
    }

    // Calculate eligible items total (only items matching coupon categories)
    let eligibleTotal = cartTotal;
    let eligibleItemsCount = 0;
    
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      // Filter cart items to only those in applicable categories
      if (cartItems && Array.isArray(cartItems)) {
        eligibleTotal = cartItems
          .filter(item => coupon.applicableCategories.includes(item.category))
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        eligibleItemsCount = cartItems.filter(item => 
          coupon.applicableCategories.includes(item.category)
        ).length;
      } else {
        // Fallback: check if cart has any matching category
        const hasApplicableCategory = cartCategories && cartCategories.some(
          category => coupon.applicableCategories.includes(category)
        );

        if (!hasApplicableCategory) {
          return res.status(400).json({
            valid: false,
            message: `This coupon is only applicable to: ${coupon.applicableCategories.join(', ')}`
          });
        }
      }
      
      // Check if there are any eligible items
      if (eligibleTotal === 0) {
        return res.status(400).json({
          valid: false,
          message: `This coupon is only applicable to: ${coupon.applicableCategories.join(', ')}`
        });
      }
    }

    // Check minimum purchase requirement (based on eligible items only)
    if (coupon.minPurchase && eligibleTotal < coupon.minPurchase) {
      return res.status(400).json({
        valid: false,
        message: `Minimum purchase of ₹${coupon.minPurchase.toLocaleString('en-IN')} required on eligible items to use this coupon`
      });
    }

    // Calculate discount amount (based on eligible items only)
    let discountAmount;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((eligibleTotal * coupon.discountValue) / 100);
    } else {
      // Flat discount - cannot exceed eligible items total
      discountAmount = Math.min(coupon.discountValue, eligibleTotal);
    }

    // NOTE: Usage count will be incremented when order is confirmed, not during validation
    // This allows users to validate/preview coupons without affecting usage count

    // Return success response
    res.json({
      valid: true,
      discountAmount,
      eligibleTotal,
      finalAmount: cartTotal - discountAmount,
      message: coupon.applicableCategories.length > 0 
        ? `Coupon applied to ${coupon.applicableCategories.join(', ')} items only!`
        : 'Coupon applied successfully!',
      couponDetails: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        applicableCategories: coupon.applicableCategories
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      valid: false,
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/coupons/confirm-usage
 * @desc    Confirm coupon usage (increment usage count when order is placed)
 * @access  Public
 */
router.post('/confirm-usage', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    // Find and increment usage count
    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase().trim() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      message: 'Coupon usage confirmed',
      usedCount: coupon.usedCount
    });
  } catch (error) {
    console.error('Error confirming coupon usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm coupon usage',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/coupons/active/list
 * @desc    Get all active coupons (for display to customers)
 * @access  Public
 */
router.get('/active/list', async (req, res) => {
  try {
    const now = new Date();
    
    const activeCoupons = await Coupon.find({
      isActive: true,
      $or: [
        { startDate: null },
        { startDate: { $lte: now } }
      ],
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ],
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    })
    .select('code discountType discountValue minPurchase startDate expiryDate description applicableCategories')
    .sort({ createdAt: -1 });

    res.json({
      count: activeCoupons.length,
      coupons: activeCoupons
    });
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    res.status(500).json({
      message: 'Failed to fetch active coupons',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/coupons/category/:category
 * @desc    Get active coupons for a specific category
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const now = new Date();
    
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { startDate: null },
        { startDate: { $lte: now } }
      ],
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ],
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ],
      $or: [
        { applicableCategories: { $size: 0 } },
        { applicableCategories: category }
      ]
    })
    .select('code discountType discountValue minPurchase description')
    .sort({ discountValue: -1 })
    .limit(3);

    res.json({
      count: coupons.length,
      coupons
    });
  } catch (error) {
    console.error('Error fetching category coupons:', error);
    res.status(500).json({
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
});

export default router;
