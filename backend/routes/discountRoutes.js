import express from 'express';
import Discount from '../models/Discount.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all discounts (PUBLIC - for displaying on website)
router.get('/', async (req, res) => {
  try {
    const { scope, category, isActive, includeExpired } = req.query;
    
    let query = {};
    
    if (scope) {
      query.scope = scope;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    let discounts = await Discount.find(query)
      .populate('productId', 'name price image category')
      .sort({ priority: -1, createdAt: -1 });
    
    // Filter out expired discounts unless specifically requested
    if (includeExpired !== 'true') {
      const now = new Date();
      discounts = discounts.filter(discount => {
        if (!discount.isActive) return false;
        if (discount.startDate && now < discount.startDate) return false;
        if (discount.endDate && now > discount.endDate) return false;
        return true;
      });
    }
    
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ message: 'Error fetching discounts', error: error.message });
  }
});

// GET single discount by ID (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id)
      .populate('productId', 'name price image category');
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    res.json(discount);
  } catch (error) {
    console.error('Error fetching discount:', error);
    res.status(500).json({ message: 'Error fetching discount', error: error.message });
  }
});

// GET active discounts for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const now = new Date();
    
    // Find all applicable discounts (product-specific, category, and global)
    const discounts = await Discount.find({
      isActive: true,
      $or: [
        { scope: 'global' },
        { scope: 'product', productId: productId }
      ],
      $or: [
        { startDate: null },
        { startDate: { $lte: now } }
      ],
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).sort({ priority: -1 });
    
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching product discounts:', error);
    res.status(500).json({ message: 'Error fetching product discounts', error: error.message });
  }
});

// CREATE a new discount (admin only - PROTECTED)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      scope,
      category,
      productId,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive,
      description
    } = req.body;
    
    // Validation
    if (!name || !scope || !discountType || discountValue === undefined) {
      return res.status(400).json({ 
        message: 'Name, scope, discount type, and discount value are required' 
      });
    }
    
    if (scope === 'category' && !category) {
      return res.status(400).json({ 
        message: 'Category is required when scope is "category"' 
      });
    }
    
    if (scope === 'product' && !productId) {
      return res.status(400).json({ 
        message: 'Product ID is required when scope is "product"' 
      });
    }
    
    const discount = new Discount({
      name,
      scope,
      category: scope === 'category' ? category : undefined,
      productId: scope === 'product' ? productId : undefined,
      discountType,
      discountValue,
      startDate: startDate || null,
      endDate: endDate || null,
      isActive: isActive !== undefined ? isActive : true,
      description: description || ''
    });
    
    await discount.save();
    
    // Populate productId if it exists
    if (discount.productId) {
      await discount.populate('productId', 'name price image category');
    }
    
    res.status(201).json({
      message: 'Discount created successfully',
      discount
    });
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({ 
      message: 'Error creating discount', 
      error: error.message 
    });
  }
});

// UPDATE a discount (admin only - PROTECTED)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validation for scope-specific fields
    if (updateData.scope === 'category' && !updateData.category) {
      return res.status(400).json({ 
        message: 'Category is required when scope is "category"' 
      });
    }
    
    if (updateData.scope === 'product' && !updateData.productId) {
      return res.status(400).json({ 
        message: 'Product ID is required when scope is "product"' 
      });
    }
    
    // Clean up fields based on scope
    if (updateData.scope === 'global') {
      updateData.category = undefined;
      updateData.productId = undefined;
    } else if (updateData.scope === 'category') {
      updateData.productId = undefined;
    } else if (updateData.scope === 'product') {
      updateData.category = undefined;
    }
    
    const discount = await Discount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('productId', 'name price image category');
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    res.json({
      message: 'Discount updated successfully',
      discount
    });
  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({ 
      message: 'Error updating discount', 
      error: error.message 
    });
  }
});

// DELETE a discount (admin only - PROTECTED)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const discount = await Discount.findByIdAndDelete(id);
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    res.json({ 
      message: 'Discount deleted successfully',
      discount
    });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ 
      message: 'Error deleting discount', 
      error: error.message 
    });
  }
});

// TOGGLE discount active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const discount = await Discount.findById(id);
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    discount.isActive = !discount.isActive;
    await discount.save();
    
    await discount.populate('productId', 'name price image category');
    
    res.json({
      message: `Discount ${discount.isActive ? 'activated' : 'deactivated'} successfully`,
      discount
    });
  } catch (error) {
    console.error('Error toggling discount:', error);
    res.status(500).json({ 
      message: 'Error toggling discount status', 
      error: error.message 
    });
  }
});

export default router;
