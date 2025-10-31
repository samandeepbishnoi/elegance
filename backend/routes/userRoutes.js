import express from 'express';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// Get or create user profile
router.get('/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      // Create profile with minimal data
      profile = new UserProfile({
        clerkUserId,
        email: req.query.email || '',
        firstName: req.query.firstName || '',
        lastName: req.query.lastName || ''
      });
      await profile.save();
    }
    
    // Update last login
    profile.lastLogin = new Date();
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const updates = req.body;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      profile = new UserProfile({ clerkUserId, ...updates });
    } else {
      Object.assign(profile, updates);
    }
    
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Add address
router.post('/:clerkUserId/addresses', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const address = req.body;
    
    const profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // If this is set as default, unset others
    if (address.isDefault) {
      profile.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    profile.addresses.push(address);
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update address
router.put('/:clerkUserId/addresses/:addressId', async (req, res) => {
  try {
    const { clerkUserId, addressId } = req.params;
    const updates = req.body;
    
    const profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const address = profile.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    
    // If setting as default, unset others
    if (updates.isDefault) {
      profile.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }
    
    Object.assign(address, updates);
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/:clerkUserId/addresses/:addressId', async (req, res) => {
  try {
    const { clerkUserId, addressId } = req.params;
    
    const profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    profile.addresses.id(addressId).remove();
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// ============================================
// CART & WISHLIST SYNC ENDPOINTS
// ============================================

// Sync guest cart and wishlist on login/signup
router.post('/:clerkUserId/sync', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { guestCart, guestWishlist, email, firstName, lastName } = req.body;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    // Create profile if doesn't exist
    if (!profile) {
      profile = new UserProfile({
        clerkUserId,
        email: email || '',
        firstName: firstName || '',
        lastName: lastName || '',
        cart: { items: [], total: 0 },
        wishlist: { items: [] }
      });
    }
    
    // Initialize cart and wishlist if they don't exist
    if (!profile.cart) {
      profile.cart = { items: [], total: 0, lastUpdated: new Date() };
    }
    if (!profile.wishlist) {
      profile.wishlist = { items: [], lastUpdated: new Date() };
    }
    
    let cartMerged = false;
    let wishlistMerged = false;
    
    // Merge guest cart with existing cart (avoid duplicates)
    if (guestCart && Array.isArray(guestCart) && guestCart.length > 0) {
      guestCart.forEach(guestItem => {
        const existingIndex = profile.cart.items.findIndex(
          item => item._id === guestItem._id
        );
        
        if (existingIndex > -1) {
          // Item exists, increase quantity
          profile.cart.items[existingIndex].quantity += guestItem.quantity;
        } else {
          // New item, add to cart
          profile.cart.items.push(guestItem);
        }
      });
      cartMerged = true;
    }
    
    // Merge guest wishlist with existing wishlist (avoid duplicates)
    if (guestWishlist && Array.isArray(guestWishlist) && guestWishlist.length > 0) {
      guestWishlist.forEach(guestItem => {
        const exists = profile.wishlist.items.some(
          item => item._id === guestItem._id
        );
        
        if (!exists) {
          profile.wishlist.items.push({
            ...guestItem,
            addedAt: guestItem.addedAt || new Date()
          });
        }
      });
      wishlistMerged = true;
    }
    
    // Update last login
    profile.lastLogin = new Date();
    
    await profile.save();
    
    res.json({
      success: true,
      profile,
      cartMerged,
      wishlistMerged,
      message: cartMerged || wishlistMerged ? 'Data synced successfully' : 'No data to sync'
    });
  } catch (error) {
    console.error('Error syncing user data:', error);
    res.status(500).json({ error: 'Failed to sync user data' });
  }
});

// Get user's cart
router.get('/:clerkUserId/cart', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.json({ items: [], total: 0 });
    }
    
    if (!profile.cart) {
      profile.cart = { items: [], total: 0, lastUpdated: new Date() };
      await profile.save();
    }
    
    res.json(profile.cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Update user's cart
router.post('/:clerkUserId/cart', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { items } = req.body;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    profile.cart = {
      items: items || [],
      total: 0,
      lastUpdated: new Date()
    };
    
    await profile.save();
    
    res.json({ success: true, cart: profile.cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Add item to cart
router.post('/:clerkUserId/cart/add', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const item = req.body;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!profile.cart) {
      profile.cart = { items: [], total: 0, lastUpdated: new Date() };
    }
    
    const existingIndex = profile.cart.items.findIndex(i => i._id === item._id);
    
    if (existingIndex > -1) {
      profile.cart.items[existingIndex].quantity += item.quantity || 1;
    } else {
      profile.cart.items.push(item);
    }
    
    await profile.save();
    
    res.json({ success: true, cart: profile.cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Remove item from cart
router.delete('/:clerkUserId/cart/:itemId', async (req, res) => {
  try {
    const { clerkUserId, itemId } = req.params;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile || !profile.cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    profile.cart.items = profile.cart.items.filter(item => item._id !== itemId);
    
    await profile.save();
    
    res.json({ success: true, cart: profile.cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
router.delete('/:clerkUserId/cart', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    profile.cart = { items: [], total: 0, lastUpdated: new Date() };
    
    await profile.save();
    
    res.json({ success: true, cart: profile.cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Get user's wishlist
router.get('/:clerkUserId/wishlist', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.json({ items: [] });
    }
    
    if (!profile.wishlist) {
      profile.wishlist = { items: [], lastUpdated: new Date() };
      await profile.save();
    }
    
    res.json(profile.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Update user's wishlist
router.post('/:clerkUserId/wishlist', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { items } = req.body;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    profile.wishlist = {
      items: items || [],
      lastUpdated: new Date()
    };
    
    await profile.save();
    
    res.json({ success: true, wishlist: profile.wishlist });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

// Add item to wishlist
router.post('/:clerkUserId/wishlist/add', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const item = req.body;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!profile.wishlist) {
      profile.wishlist = { items: [], lastUpdated: new Date() };
    }
    
    const exists = profile.wishlist.items.some(i => i._id === item._id);
    
    if (!exists) {
      profile.wishlist.items.push({
        ...item,
        addedAt: new Date()
      });
    }
    
    await profile.save();
    
    res.json({ success: true, wishlist: profile.wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/:clerkUserId/wishlist/:itemId', async (req, res) => {
  try {
    const { clerkUserId, itemId } = req.params;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile || !profile.wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }
    
    profile.wishlist.items = profile.wishlist.items.filter(item => item._id !== itemId);
    
    await profile.save();
    
    res.json({ success: true, wishlist: profile.wishlist });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Clear wishlist
router.delete('/:clerkUserId/wishlist', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    
    let profile = await UserProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    profile.wishlist = { items: [], lastUpdated: new Date() };
    
    await profile.save();
    
    res.json({ success: true, wishlist: profile.wishlist });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

export default router;
