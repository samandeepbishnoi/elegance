import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

// Get user's cart
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({
        userId,
        items: [],
        total: 0
      });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Update entire cart
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items });
    } else {
      cart.items = items;
    }
    
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Add item to cart
router.post('/:userId/items', async (req, res) => {
  try {
    const { userId } = req.params;
    const item = req.body;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({
        userId,
        items: [item]
      });
    } else {
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        i => i.productId === item.productId
      );
      
      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += item.quantity || 1;
      } else {
        // Add new item
        cart.items.push(item);
      }
    }
    
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update item quantity
router.put('/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(i => i.productId === productId);
    
    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.splice(itemIndex, 1);
      }
      
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: 'Failed to update item quantity' });
  }
});

// Remove item from cart
router.delete('/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(i => i.productId !== productId);
    
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = [];
    cart.total = 0;
    
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
