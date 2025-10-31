import express from 'express';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

// Get user's wishlist
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      // Create empty wishlist if doesn't exist
      wishlist = new Wishlist({
        userId,
        items: []
      });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Update entire wishlist
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;
    
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items });
    } else {
      wishlist.items = items;
    }
    
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

// Add item to wishlist
router.post('/:userId/items', async (req, res) => {
  try {
    const { userId } = req.params;
    const item = req.body;
    
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        items: [item]
      });
    } else {
      // Check if item already exists
      const existingItem = wishlist.items.find(
        i => i.productId === item.productId
      );
      
      if (!existingItem) {
        wishlist.items.push(item);
      }
    }
    
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }
    
    wishlist.items = wishlist.items.filter(i => i.productId !== productId);
    
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

// Clear wishlist
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }
    
    wishlist.items = [];
    
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

// Toggle item in wishlist (add if not exists, remove if exists)
router.post('/:userId/toggle/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const item = req.body;
    
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        items: [item]
      });
    } else {
      const existingItemIndex = wishlist.items.findIndex(
        i => i.productId === productId
      );
      
      if (existingItemIndex > -1) {
        // Remove item
        wishlist.items.splice(existingItemIndex, 1);
      } else {
        // Add item
        wishlist.items.push(item);
      }
    }
    
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    res.status(500).json({ error: 'Failed to toggle wishlist item' });
  }
});

export default router;
