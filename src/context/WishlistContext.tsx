import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '../utils/api';
import { getGuestWishlist, saveGuestWishlist, retryOperation, isOnline } from '../utils/syncUtils';
import toast from 'react-hot-toast';

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] };

const WishlistContext = createContext<{
  state: WishlistState;
  dispatch: React.Dispatch<WishlistAction>;
} | null>(null);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(item => item._id === action.payload._id);
      if (!exists) {
        return { items: [...state.items, action.payload] };
      }
      return state;
    }
    
    case 'REMOVE_ITEM':
      return { items: state.items.filter(item => item._id !== action.payload) };
    
    case 'LOAD_WISHLIST':
      return { items: action.payload };
    
    default:
      return state;
  }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoaded } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  // Load wishlist when component mounts or user changes
  useEffect(() => {
    if (!isLoaded) return;

    const loadWishlist = async () => {
      setIsSyncing(true);
      
      try {
        if (isAuthenticated && user) {
          // User is logged in - fetch from backend
          try {
            const response = await retryOperation(() => userAPI.getWishlist(user.id));
            
            if (response.data?.items && Array.isArray(response.data.items)) {
              dispatch({ type: 'LOAD_WISHLIST', payload: response.data.items });
            } else {
              dispatch({ type: 'LOAD_WISHLIST', payload: [] });
            }
          } catch (error) {
            console.error('Error loading wishlist from backend:', error);
            
            // Fallback to localStorage
            const guestWishlist = getGuestWishlist();
            if (guestWishlist.length > 0) {
              dispatch({ type: 'LOAD_WISHLIST', payload: guestWishlist });
              toast.error('Could not sync wishlist. Using local data.', {
                id: 'wishlist-sync-error', // Prevents duplicate toasts
              });
            }
          }
        } else {
          // Guest user - load from localStorage
          const guestWishlist = getGuestWishlist();
          dispatch({ type: 'LOAD_WISHLIST', payload: guestWishlist });
        }
      } catch (error) {
        console.error('Error in loadWishlist:', error);
      } finally {
        setIsSyncing(false);
        setIsInitialized(true);
      }
    };

    loadWishlist();
  }, [isAuthenticated, user, isLoaded]);
  
  // Listen for sync events to reload wishlist after guest data sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'data_synced' && isAuthenticated && user) {
        // Reload wishlist from backend after sync
        const reloadWishlist = async () => {
          try {
            const response = await userAPI.getWishlist(user.id);
            if (response.data?.items) {
              dispatch({ type: 'LOAD_WISHLIST', payload: response.data.items });
            }
          } catch (error) {
            console.error('Error reloading wishlist after sync:', error);
          }
        };
        reloadWishlist();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, user]);

  // Save wishlist to backend or localStorage whenever it changes
  useEffect(() => {
    // Don't save during initial load or sync
    if (!isInitialized || isSyncing) return;

    const saveWishlist = async () => {
      if (isAuthenticated && user) {
        try {
          // Check if online before attempting to save
          if (isOnline()) {
            await retryOperation(() => userAPI.updateWishlist(user.id, state.items));
          } else {
            // Save to localStorage as backup when offline
            saveGuestWishlist(state.items);
          }
        } catch (error) {
          console.error('Error saving wishlist to backend:', error);
          
          // Fallback to localStorage
          saveGuestWishlist(state.items);
          toast.error('Wishlist saved locally. Will sync when online.', {
            id: 'wishlist-save-offline', // Prevents duplicate toasts
          });
        }
      } else {
        // Guest user - save to localStorage
        saveGuestWishlist(state.items);
      }
    };

    // Debounce save operation
    const timeoutId = setTimeout(saveWishlist, 500);
    return () => clearTimeout(timeoutId);
  }, [state.items, isAuthenticated, user, isSyncing, isInitialized]);

  return (
    <WishlistContext.Provider value={{ state, dispatch }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};