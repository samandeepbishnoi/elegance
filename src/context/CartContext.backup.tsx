import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '../utils/api';
import { getGuestCart, saveGuestCart, retryOperation, isOnline } from '../utils/syncUtils';
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
  
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  // Load cart when component mounts or user changes
  useEffect(() => {
    if (!isLoaded) return;

    const loadCart = async () => {
      setIsSyncing(true);
      
      try {
        if (isAuthenticated && user) {
          // User is logged in - fetch from backend
          try {
            const response = await retryOperation(() => userAPI.getCart(user.id));
            
            if (response.data?.items && Array.isArray(response.data.items)) {
              dispatch({ type: 'LOAD_CART', payload: response.data.items });
            } else {
              dispatch({ type: 'LOAD_CART', payload: [] });
            }
          } catch (error) {
            console.error('Error loading cart from backend:', error);
            
            // Fallback to localStorage - Only show toast if there's actual data to notify about
            const guestCart = getGuestCart();
            if (guestCart.length > 0) {
              dispatch({ type: 'LOAD_CART', payload: guestCart });
              // Only show error toast if network issue persists - IMPROVED UX
              if (!isOnline()) {
                toast.error('Using offline cart data', {
                  id: 'cart-sync-error',
                });
              }
            } else {
              dispatch({ type: 'LOAD_CART', payload: [] });
            }
          }
        } else {
          // Guest user - load from localStorage
          const guestCart = getGuestCart();
          dispatch({ type: 'LOAD_CART', payload: guestCart });
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
  
  // Listen for sync events to reload cart after guest data sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'data_synced' && isAuthenticated && user) {
        // Reload cart from backend after sync
        const reloadCart = async () => {
          try {
            const response = await userAPI.getCart(user.id);
            if (response.data?.items) {
              dispatch({ type: 'LOAD_CART', payload: response.data.items });
            }
          } catch (error) {
            console.error('Error reloading cart after sync:', error);
          }
        };
        reloadCart();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, user]);

  // Save cart to backend or localStorage whenever it changes
  useEffect(() => {
    // Don't save during initial load or sync
    if (!isInitialized || isSyncing) return;

    const saveCart = async () => {
      if (isAuthenticated && user) {
        try {
          // Check if online before attempting to save
          if (isOnline()) {
            await retryOperation(() => userAPI.updateCart(user.id, state.items));
          } else {
            // Save to localStorage as backup when offline
            saveGuestCart(state.items);
          }
        } catch (error) {
          console.error('Error saving cart to backend:', error);
          
          // Fallback to localStorage
          saveGuestCart(state.items);
          toast.error('Cart saved locally. Will sync when online.', {
            id: 'cart-save-offline', // Prevents duplicate toasts
          });
        }
      } else {
        // Guest user - save to localStorage
        saveGuestCart(state.items);
      }
    };

    // Debounce save operation
    const timeoutId = setTimeout(saveCart, 500);
    return () => clearTimeout(timeoutId);
  }, [state.items, isAuthenticated, user, isSyncing, isInitialized]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
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