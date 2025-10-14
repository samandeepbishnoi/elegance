import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
      const [state, dispatch] = useReducer(wishlistReducer, (() => {
      const stored = localStorage.getItem('wishlistState');
      return stored ? JSON.parse(stored) : { items: [] };
    })());

    useEffect(() => {
      localStorage.setItem('wishlistState', JSON.stringify(state));
    }, [state]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      dispatch({ type: 'LOAD_WISHLIST', payload: JSON.parse(savedWishlist) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.items));
  }, [state.items]);

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