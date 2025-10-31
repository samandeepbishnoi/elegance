// Utility functions for syncing cart and wishlist data

export const STORAGE_KEYS = {
  GUEST_CART: 'cart_guest',
  GUEST_WISHLIST: 'wishlist_guest',
  LEGACY_CART: 'cart',
  LEGACY_WISHLIST: 'wishlist',
};

/**
 * Get guest cart from localStorage
 */
export const getGuestCart = (): any[] => {
  try {
    const guestCart = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
    if (guestCart) {
      return JSON.parse(guestCart);
    }
    
    // Fallback to legacy key
    const legacyCart = localStorage.getItem(STORAGE_KEYS.LEGACY_CART);
    if (legacyCart) {
      return JSON.parse(legacyCart);
    }
    
    return [];
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return [];
  }
};

/**
 * Get guest wishlist from localStorage
 */
export const getGuestWishlist = (): any[] => {
  try {
    const guestWishlist = localStorage.getItem(STORAGE_KEYS.GUEST_WISHLIST);
    if (guestWishlist) {
      return JSON.parse(guestWishlist);
    }
    
    // Fallback to legacy key
    const legacyWishlist = localStorage.getItem(STORAGE_KEYS.LEGACY_WISHLIST);
    if (legacyWishlist) {
      return JSON.parse(legacyWishlist);
    }
    
    return [];
  } catch (error) {
    console.error('Error reading guest wishlist:', error);
    return [];
  }
};

/**
 * Save guest cart to localStorage
 */
export const saveGuestCart = (cart: any[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
    localStorage.setItem(STORAGE_KEYS.LEGACY_CART, JSON.stringify(cart)); // Backward compatibility
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

/**
 * Save guest wishlist to localStorage
 */
export const saveGuestWishlist = (wishlist: any[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST_WISHLIST, JSON.stringify(wishlist));
    localStorage.setItem(STORAGE_KEYS.LEGACY_WISHLIST, JSON.stringify(wishlist)); // Backward compatibility
  } catch (error) {
    console.error('Error saving guest wishlist:', error);
  }
};

/**
 * Clear guest data from localStorage after successful sync
 */
export const clearGuestData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
    localStorage.removeItem(STORAGE_KEYS.GUEST_WISHLIST);
    // Keep legacy keys for backward compatibility - they'll be overwritten
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
};

/**
 * Merge cart items, avoiding duplicates and summing quantities
 */
export const mergeCartItems = (existingItems: any[], newItems: any[]): any[] => {
  const merged = [...existingItems];
  
  newItems.forEach(newItem => {
    const existingIndex = merged.findIndex(item => item._id === newItem._id);
    
    if (existingIndex > -1) {
      // Item exists, add quantities
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: merged[existingIndex].quantity + newItem.quantity,
      };
    } else {
      // New item, add to array
      merged.push(newItem);
    }
  });
  
  return merged;
};

/**
 * Merge wishlist items, avoiding duplicates
 */
export const mergeWishlistItems = (existingItems: any[], newItems: any[]): any[] => {
  const merged = [...existingItems];
  
  newItems.forEach(newItem => {
    const exists = merged.some(item => item._id === newItem._id);
    
    if (!exists) {
      merged.push({
        ...newItem,
        addedAt: newItem.addedAt || new Date().toISOString(),
      });
    }
  });
  
  return merged;
};

/**
 * Check if there's guest data to sync
 */
export const hasGuestData = (): boolean => {
  const guestCart = getGuestCart();
  const guestWishlist = getGuestWishlist();
  
  return guestCart.length > 0 || guestWishlist.length > 0;
};

/**
 * Retry utility for failed API calls
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Check if user is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Wait for network to be available
 */
export const waitForNetwork = (timeout: number = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeout);
    
    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };
    
    window.addEventListener('online', onlineHandler);
  });
};
