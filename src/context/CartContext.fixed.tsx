import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '../utils/api';
import { 
  getGuestCart, 
  saveGuestCart, 
  clearGuestData,
  clearLocalCart,
  isCartSynced,
  markCartAsSynced,
  resetSyncFlags,
  retryOperation, 
  isOnline 
} from '../utils/syncUtils';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  clearCartAfterCheckout: () => Promise<void>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      let newItems;
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { items: newItems, total };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item._id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { items: newItems, total };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item._id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { items: newItems, total };
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    
    case 'LOAD_CART': {
      const total = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { items: action.payload, total };
    }
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoaded } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasPerformedInitialSync = useRef(false);
  
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  /**
   * ONE-TIME merge operation when user logs in
   * This merges localStorage cart with server cart and then clears localStorage
   */
  const performOneTimeMerge = async (userId: string) => {
    // Check if we've already synced for this session
    if (isCartSynced()) {
      console.log('⏭️  Cart already synced, skipping merge');
      return;
    }

    const guestCart = getGuestCart();
    
    if (guestCart.length === 0) {
      console.log('ℹ️  No guest cart items to merge');
      markCartAsSynced();
      return;
    }

    try {
      console.log(`🔄 Merging ${guestCart.length} guest cart items...`);
      
      // Call backend merge endpoint
      const response = await userAPI.getCart(userId); // Get current server cart first
      const serverCart = response.data?.items || [];
      
      // Merge locally to send to server
      const mergedItems = [...serverCart];
      guestCart.forEach(guestItem => {
        const existingIndex = mergedItems.findIndex(item => item._id === guestItem._id);
        if (existingIndex > -1) {
          mergedItems[existingIndex].quantity += guestItem.quantity;
        } else {
          mergedItems.push(guestItem);
        }
      });
      
      // Update server with merged cart
      await userAPI.updateCart(userId, mergedItems);
      
      // CRITICAL: Clear localStorage cart after successful merge
      clearGuestData();
      
      // Mark as synced to prevent duplicate merges
      markCartAsSynced();
      
      console.log('✅ Cart merged and localStorage cleared');
      
      toast.success('Cart items synced successfully!', {
        id: 'cart-merge-success',
        duration: 2000,
      });
      
      return mergedItems;
    } catch (error) {
      console.error('❌ Error merging cart:', error);
      throw error;
    }
  };

  /**
   * Load cart - called on mount and when auth state changes
   */
  useEffect(() => {
    if (!isLoaded) return;

    // Prevent multiple simultaneous loads
    if (hasPerformedInitialSync.current) return;
    hasPerformedInitialSync.current = true;

    const loadCart = async () => {
      setIsSyncing(true);
      
      try {
        if (isAuthenticated && user) {
          console.log('👤 User authenticated, loading cart from server...');
          
          // First, perform one-time merge if needed
          try {
            await performOneTimeMerge(user.id);
          } catch (mergeError) {
            console.error('Error during merge, but continuing...', mergeError);
          }
          
          // Now load the cart from server (which includes merged items)
          try {
            const response = await retryOperation(() => userAPI.getCart(user.id));
            
            if (response.data?.items && Array.isArray(response.data.items)) {
              dispatch({ type: 'LOAD_CART', payload: response.data.items });
              console.log(`✅ Loaded ${response.data.items.length} items from server`);
            } else {
              dispatch({ type: 'LOAD_CART', payload: [] });
            }
          } catch (error) {
            console.error('Error loading cart from server:', error);
            
            // IMPORTANT: For logged-in users, never fallback to localStorage
            // The server is the single source of truth
            dispatch({ type: 'LOAD_CART', payload: [] });
            
            if (!isOnline()) {
              toast.error('Offline: Unable to load cart', {
                id: 'cart-load-error',
              });
            }
          }
        } else {
          // Guest user - load from localStorage
          console.log('👤 Guest user, loading cart from localStorage...');
          const guestCart = getGuestCart();
          dispatch({ type: 'LOAD_CART', payload: guestCart });
          console.log(`✅ Loaded ${guestCart.length} guest items`);
        }
      } catch (error) {
        console.error('Error in loadCart:', error);
      } finally {
        setIsSyncing(false);
        setIsInitialized(true);
      }
    };

    loadCart();
  }, [isAuthenticated, user, isLoaded]);
  
  /**
   * Reset sync flag when user logs out
   */
  useEffect(() => {
    if (!isAuthenticated && isLoaded) {
      console.log('👤 User logged out, resetting sync flags');
      resetSyncFlags();
      hasPerformedInitialSync.current = false;
    }
  }, [isAuthenticated, isLoaded]);

  /**
   * Save cart whenever it changes
   * - For logged-in users: save to server ONLY
   * - For guests: save to localStorage ONLY
   */
  useEffect(() => {
    // Don't save during initial load or sync
    if (!isInitialized || isSyncing) return;

    const saveCart = async () => {
      if (isAuthenticated && user) {
        // Logged-in user - save ONLY to server
        try {
          if (isOnline()) {
            await retryOperation(() => userAPI.updateCart(user.id, state.items));
            console.log('💾 Cart saved to server');
          } else {
            // User is offline - they'll sync when back online
            console.log('⚠️  Offline: Cart changes not saved');
          }
        } catch (error) {
          console.error('Error saving cart to server:', error);
          toast.error('Failed to save cart. Please try again.', {
            id: 'cart-save-error',
          });
        }
      } else {
        // Guest user - save ONLY to localStorage
        saveGuestCart(state.items);
        console.log('💾 Cart saved to localStorage (guest)');
      }
    };

    // Debounce save operation
    const timeoutId = setTimeout(saveCart, 500);
    return () => clearTimeout(timeoutId);
  }, [state.items, isAuthenticated, user, isSyncing, isInitialized]);

  /**
   * Clear cart after successful checkout
   * This clears both server and localStorage
   */
  const clearCartAfterCheckout = async () => {
    console.log('🧹 Clearing cart after checkout...');
    
    // Clear local state
    dispatch({ type: 'CLEAR_CART' });
    
    // Clear localStorage (for any stale data)
    clearLocalCart();
    
    // Clear server cart if user is logged in
    if (isAuthenticated && user) {
      try {
        await userAPI.clearCart(user.id);
        console.log('✅ Server cart cleared');
      } catch (error) {
        console.error('Error clearing server cart:', error);
      }
    }
    
    console.log('✅ Cart cleared completely');
  };

  return (
    <CartContext.Provider value={{ state, dispatch, clearCartAfterCheckout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
