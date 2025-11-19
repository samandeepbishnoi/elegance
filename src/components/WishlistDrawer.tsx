import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Sparkles, Gift, Tag, RefreshCw } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiscountInfo {
  hasDiscount: boolean;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountPercentage: number;
  discountLabel: string | null;
}

interface ProductWithDiscount {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discountInfo?: DiscountInfo;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const { isSyncing } = useAuth();
  const [productsWithDiscounts, setProductsWithDiscounts] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [cachedProducts, setCachedProducts] = useState<Map<string, ProductWithDiscount>>(new Map());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      if (wishlistState.items.length === 0) {
        setLoading(false);
        return;
      }

      const now = Date.now();
      const shouldRefetch = now - lastFetchTime > CACHE_DURATION;

      try {
        const productsPromises = wishlistState.items.map(async (item) => {
          // Check cache first
          const cached = cachedProducts.get(item._id);
          if (cached && !shouldRefetch) {
            return cached;
          }

          try {
            const res = await fetch(`${backendUrl}/api/products/${item._id}`);
            if (res.ok) {
              const productData = await res.json();
              const productWithDiscount = {
                ...item,
                discountInfo: productData.discountInfo
              } as ProductWithDiscount;
              
              // Update cache
              setCachedProducts(prev => new Map(prev).set(item._id, productWithDiscount));
              return productWithDiscount;
            }
          } catch (error) {
            // Silent error - use cached if available
            if (cached) return cached;
          }
          return item as ProductWithDiscount;
        });

        const products = await Promise.all(productsPromises);
        setProductsWithDiscounts(products);
        setLastFetchTime(now);
      } catch (error) {
        setProductsWithDiscounts(wishlistState.items as ProductWithDiscount[]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchDiscountedProducts();
    }
  }, [wishlistState.items, backendUrl, isOpen, cachedProducts, lastFetchTime]);

  const removeFromWishlist = (id: string) => {
    wishlistDispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const addToCart = (item: any) => {
    cartDispatch({ type: 'ADD_ITEM', payload: item });
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white dark:bg-gray-900 shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-gold-600 dark:text-gold-400 fill-current" />
                <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100">
                  My Wishlist
                </h2>
                {isSyncing && (
                  <div className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Syncing...</span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close wishlist"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Items count */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {wishlistState.items.length} {wishlistState.items.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {wishlistState.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Heart className="h-24 w-24 text-gray-300 dark:text-gray-600 mb-4" strokeWidth={1.5} />
                  <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Save your favorite items here!
                  </p>
                  <Link
                    to="/catalog"
                    onClick={onClose}
                    className="inline-block bg-gradient-to-r from-gold-500 to-gold-600 text-white px-8 py-3 rounded-full font-medium hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-200 dark:border-gray-700 border-t-gold-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {productsWithDiscounts.map((item) => {
                      const itemDiscountInfo = item.discountInfo;
                      const hasDiscount = itemDiscountInfo?.hasDiscount;
                      const displayPrice = hasDiscount ? itemDiscountInfo.finalPrice : item.price;
                      const originalPrice = hasDiscount ? itemDiscountInfo.originalPrice : item.price;

                      return (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <Link to={`/product/${item._id}`} onClick={onClose}>
                            <div className="relative">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-48 object-cover"
                              />
                              
                              {/* Discount Badge */}
                              {hasDiscount && itemDiscountInfo.discountLabel && (
                                <div className="absolute top-2 left-2 bg-gradient-to-br from-red-500 to-red-600 text-white px-2.5 py-1 rounded-full shadow-lg">
                                  <span className="text-xs font-bold flex items-center gap-1">
                                    <Gift className="h-3 w-3" />
                                    {itemDiscountInfo.discountLabel}
                                  </span>
                                </div>
                              )}

                              {/* Category Badge */}
                              <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          </Link>
                          
                          <div className="p-3">
                            <Link to={`/product/${item._id}`} onClick={onClose}>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                                {item.name}
                              </h3>
                              
                              {/* Price Section */}
                              <div className="mb-3">
                                {hasDiscount ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold text-gold-600 dark:text-gold-400">
                                        ₹{displayPrice.toLocaleString()}
                                      </span>
                                      <Sparkles className="h-3 w-3 text-gold-400" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                        ₹{originalPrice.toLocaleString()}
                                      </span>
                                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                        Save ₹{itemDiscountInfo.discountAmount.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-gold-600 dark:text-gold-400">
                                      ₹{displayPrice.toLocaleString()}
                                    </span>
                                    <Sparkles className="h-3 w-3 text-gold-400" />
                                  </div>
                                )}
                              </div>
                            </Link>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  addToCart(item);
                                  removeFromWishlist(item._id);
                                }}
                                className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white py-2 px-3 rounded-lg font-medium hover:from-gold-600 hover:to-gold-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                              >
                                <ShoppingBag className="h-4 w-4" />
                                Add to Cart
                              </button>
                              
                              <button
                                onClick={() => removeFromWishlist(item._id)}
                                className="p-2 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:border-red-500 dark:hover:border-red-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                title="Remove"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlistState.items.length > 0 && (
              <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-2">
                  <Link
                    to="/wishlist"
                    onClick={onClose}
                    className="block w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white py-3 rounded-full font-semibold hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg text-center"
                  >
                    View Full Wishlist
                  </Link>
                  <Link
                    to="/catalog"
                    onClick={onClose}
                    className="block w-full bg-white dark:bg-gray-700 text-gold-600 dark:text-gold-400 py-3 rounded-full font-semibold border-2 border-gold-600 dark:border-gold-500 hover:bg-gold-50 dark:hover:bg-gray-600 transition-all text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WishlistDrawer;
