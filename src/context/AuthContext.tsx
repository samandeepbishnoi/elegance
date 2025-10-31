import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { userAPI } from '../utils/api';
import { getGuestCart, getGuestWishlist, clearGuestData, hasGuestData } from '../utils/syncUtils';
import toast from 'react-hot-toast';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any;
}

interface UserAuthContextType {
  // Clerk user authentication
  isAuthenticated: boolean;
  isLoaded: boolean;
  user: any;
  signOut: () => void;
  syncGuestData: () => Promise<void>;
  isSyncing: boolean;
  
  // Admin authentication (existing)
  auth: AuthState;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<UserAuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clerk hooks for user authentication
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  
  // Track sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const hasSynced = useRef(false);
  
  // Existing admin auth state
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  // Load admin auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (token && adminUser) {
      setAuth({
        isAuthenticated: true,
        token,
        user: JSON.parse(adminUser),
      });
    }
  }, []);

  // Function to sync guest data with user account
  const syncGuestData = async () => {
    if (!isSignedIn || !user || isSyncing || hasSynced.current) return;
    
    // Check if there's guest data to sync
    if (!hasGuestData()) {
      hasSynced.current = true;
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const guestCart = getGuestCart();
      const guestWishlist = getGuestWishlist();
      
      // Call sync API
      const response = await userAPI.syncGuestData(
        user.id,
        guestCart,
        guestWishlist,
        user.primaryEmailAddress?.emailAddress,
        user.firstName || undefined,
        user.lastName || undefined
      );
      
      if (response.data?.success) {
        // Clear guest data after successful sync
        clearGuestData();
        hasSynced.current = true;
        
        if (response.data.cartMerged || response.data.wishlistMerged) {
          const items = [];
          if (response.data.cartMerged) items.push('cart');
          if (response.data.wishlistMerged) items.push('wishlist');
          
          // Use toast ID to prevent duplicates (uses global success duration of 2500ms)
          toast.success(`Your ${items.join(' and ')} has been synced with your account!`, {
            icon: '✨',
            id: 'data-sync-success', // Prevents duplicate toasts
          });
        }
        
        // Trigger a reload of cart and wishlist by updating localStorage flag
        localStorage.setItem('data_synced', Date.now().toString());
      }
    } catch (error) {
      console.error('Error syncing guest data:', error);
      toast.error('Failed to sync your data. Your items are saved locally.', {
        id: 'data-sync-error', // Prevents duplicate error toasts
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when user logs in
  useEffect(() => {
    if (isLoaded && isSignedIn && user && !hasSynced.current) {
      // Small delay to ensure contexts are ready
      const timer = setTimeout(() => {
        syncGuestData();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, user]);

  // Reset sync flag when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      hasSynced.current = false;
    }
  }, [isLoaded, isSignedIn]);

  // Admin login function
  const login = (token: string, user: any) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAuth({
      isAuthenticated: true,
      token,
      user,
    });
  };

  // Admin logout function
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAuth({
      isAuthenticated: false,
      token: null,
      user: null,
    });
  };

  // User signout (Clerk)
  const signOut = async () => {
    hasSynced.current = false;
    await clerkSignOut();
  };

  const value: UserAuthContextType = {
    // Clerk user auth
    isAuthenticated: isSignedIn || false,
    isLoaded,
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
    } : null,
    signOut,
    syncGuestData,
    isSyncing,
    
    // Admin auth (existing)
    auth,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};