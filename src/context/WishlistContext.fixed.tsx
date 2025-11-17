import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '../utils/api';
import { 
  getGuestWishlist, 
  saveGuestWishlist, 
  clearGuestData,
  clearLocalWishlist,
  isWishlistSynced,
  markWishlistAsSynced,
  resetSyncFlags,
  retryOperation, 
  isOnline 
} from '../utils/syncUtils';
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
  const hasPerformedInitialSync = useRef(false);
  
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  /**
   * ONE-TIME merge operation when user logs in
   * This merges localStorage wishlist with server wishlist and then clears localStorage
   */
  const performOneTimeMerge = async (userId: string) => {
    // Check if we've already synced for this session
    if (isWishlistSynced()) {
      console.log('⏭️  Wishlist already synced, skipping merge');
      return;
    }

    const guestWishlist = getGuestWishlist();
    
    if (guestWishlist.length === 0) {
      console.log('ℹ️  No guest wishlist items to merge');
      markWishlistAsSynced();
      return;
    }

    try {
      console.log(`🔄 Merging ${guestWishlist.length} guest wishlist items...`);
      
      // Call backend merge endpoint
      const response = await userAPI.getWishlist(userId); // Get current server wishlist first
      const serverWishlist = response.data?.items || [];
      
      // Merge locally to send to server (avoid duplicates)
      const mergedItems = [...serverWishlist];
      guestWishlist.forEach(guestItem => {
        const exists = mergedItems.some(item => item._id === guestItem._id);
        if (!exists) {
          mergedItems.push(guestItem);
        }
      });
      
      // Update server with merged wishlist
      await userAPI.updateWishlist(userId, mergedItems);
      
      // CRITICAL: Clear localStorage wishlist after successful merge
      clearGuestData();
      
      // Mark as synced to prevent duplicate merges
      markWishlistAsSynced();
      
      console.log('✅ Wishlist merged and localStorage cleared');
      
      if (guestWishlist.length > 0) {
        toast.success('Wishlist items synced successfully!', {
          id: 'wishlist-merge-success',
          duration: 2000,
        });
      }
      
      return mergedItems;
    } catch (error) {
      console.error('❌ Error merging wishlist:', error);
      throw error;
    }
  };

  /**
   * Load wishlist - called on mount and when auth state changes
   */
  useEffect(() => {
    if (!isLoaded) return;

    // Prevent multiple simultaneous loads
    if (hasPerformedInitialSync.current) return;
    hasPerformedInitialSync.current = true;

    const loadWishlist = async () => {
      setIsSyncing(true);
      
      try {
        if (isAuthenticated && user) {
          console.log('👤 User authenticated, loading wishlist from server...');
          
          // First, perform one-time merge if needed
          try {
            await performOneTimeMerge(user.id);
          } catch (mergeError) {
            console.error('Error during merge, but continuing...', mergeError);
          }
          
          // Now load the wishlist from server (which includes merged items)
          try {
            const response = await retryOperation(() => userAPI.getWishlist(user.id));
            
            if (response.data?.items && Array.isArray(response.data.items)) {
              dispatch({ type: 'LOAD_WISHLIST', payload: response.data.items });
              console.log(`✅ Loaded ${response.data.items.length} items from server`);
            } else {
              dispatch({ type: 'LOAD_WISHLIST', payload: [] });
            }
          } catch (error) {
            console.error('Error loading wishlist from server:', error);
            
            // IMPORTANT: For logged-in users, never fallback to localStorage
            // The server is the single source of truth
            dispatch({ type: 'LOAD_WISHLIST', payload: [] });
            
            if (!isOnline()) {
              toast.error('Offline: Unable to load wishlist', {
                id: 'wishlist-load-error',
              });
            }
          }
        } else {
          // Guest user - load from localStorage
          console.log('👤 Guest user, loading wishlist from localStorage...');
          const guestWishlist = getGuestWishlist();
          dispatch({ type: 'LOAD_WISHLIST', payload: guestWishlist });
          console.log(`✅ Loaded ${guestWishlist.length} guest items`);
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
   * Save wishlist whenever it changes
   * - For logged-in users: save to server ONLY
   * - For guests: save to localStorage ONLY
   */
  useEffect(() => {
    // Don't save during initial load or sync
    if (!isInitialized || isSyncing) return;

    const saveWishlist = async () => {
      if (isAuthenticated && user) {
        // Logged-in user - save ONLY to server
        try {
          if (isOnline()) {
            await retryOperation(() => userAPI.updateWishlist(user.id, state.items));
            console.log('💾 Wishlist saved to server');
          } else {
            // User is offline - they'll sync when back online
            console.log('⚠️  Offline: Wishlist changes not saved');
          }
        } catch (error) {
          console.error('Error saving wishlist to server:', error);
          toast.error('Failed to save wishlist. Please try again.', {
            id: 'wishlist-save-error',
          });
        }
      } else {
        // Guest user - save ONLY to localStorage
        saveGuestWishlist(state.items);
        console.log('💾 Wishlist saved to localStorage (guest)');
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
