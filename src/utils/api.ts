import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cart API
export const cartAPI = {
  getCart: (userId: string) => api.get(`/cart/${userId}`),
  updateCart: (userId: string, items: any[]) => api.post(`/cart/${userId}`, { items }),
  addItem: (userId: string, item: any) => api.post(`/cart/${userId}/items`, item),
  updateItemQuantity: (userId: string, productId: string, quantity: number) => 
    api.put(`/cart/${userId}/items/${productId}`, { quantity }),
  removeItem: (userId: string, productId: string) => 
    api.delete(`/cart/${userId}/items/${productId}`),
  clearCart: (userId: string) => api.delete(`/cart/${userId}`),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: (userId: string) => api.get(`/wishlist/${userId}`),
  updateWishlist: (userId: string, items: any[]) => 
    api.post(`/wishlist/${userId}`, { items }),
  addItem: (userId: string, item: any) => 
    api.post(`/wishlist/${userId}/items`, item),
  removeItem: (userId: string, productId: string) => 
    api.delete(`/wishlist/${userId}/items/${productId}`),
  toggleItem: (userId: string, productId: string, item: any) => 
    api.post(`/wishlist/${userId}/toggle/${productId}`, item),
  clearWishlist: (userId: string) => api.delete(`/wishlist/${userId}`),
};

// User Profile API
export const userAPI = {
  getProfile: (clerkUserId: string, email?: string, firstName?: string, lastName?: string) => 
    api.get(`/users/${clerkUserId}`, { 
      params: { email, firstName, lastName } 
    }),
  updateProfile: (clerkUserId: string, updates: any) => 
    api.put(`/users/${clerkUserId}`, updates),
  addAddress: (clerkUserId: string, address: any) => 
    api.post(`/users/${clerkUserId}/addresses`, address),
  updateAddress: (clerkUserId: string, addressId: string, updates: any) => 
    api.put(`/users/${clerkUserId}/addresses/${addressId}`, updates),
  deleteAddress: (clerkUserId: string, addressId: string) => 
    api.delete(`/users/${clerkUserId}/addresses/${addressId}`),
  
  // Sync guest data on login
  syncGuestData: (clerkUserId: string, guestCart: any[], guestWishlist: any[], email?: string, firstName?: string, lastName?: string) =>
    api.post(`/users/${clerkUserId}/sync`, { 
      guestCart, 
      guestWishlist,
      email,
      firstName,
      lastName 
    }),
  
  // Cart operations
  getCart: (clerkUserId: string) => api.get(`/users/${clerkUserId}/cart`),
  updateCart: (clerkUserId: string, items: any[]) => 
    api.post(`/users/${clerkUserId}/cart`, { items }),
  addToCart: (clerkUserId: string, item: any) => 
    api.post(`/users/${clerkUserId}/cart/add`, item),
  removeFromCart: (clerkUserId: string, itemId: string) => 
    api.delete(`/users/${clerkUserId}/cart/${itemId}`),
  clearCart: (clerkUserId: string) => 
    api.delete(`/users/${clerkUserId}/cart`),
  
  // Wishlist operations
  getWishlist: (clerkUserId: string) => api.get(`/users/${clerkUserId}/wishlist`),
  updateWishlist: (clerkUserId: string, items: any[]) => 
    api.post(`/users/${clerkUserId}/wishlist`, { items }),
  addToWishlist: (clerkUserId: string, item: any) => 
    api.post(`/users/${clerkUserId}/wishlist/add`, item),
  removeFromWishlist: (clerkUserId: string, itemId: string) => 
    api.delete(`/users/${clerkUserId}/wishlist/${itemId}`),
  clearWishlist: (clerkUserId: string) => 
    api.delete(`/users/${clerkUserId}/wishlist`),
};

export default api;
