import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Sparkles, Tag, X, Gift } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

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

const Wishlist: React.FC = () => {
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const [productsWithDiscounts, setProductsWithDiscounts] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  // Fetch discount information for wishlist items
  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      if (wishlistState.items.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const productsPromises = wishlistState.items.map(async (item) => {
          try {
            const res = await fetch(`${backendUrl}/api/products/${item._id}`);
            if (res.ok) {
              const productData = await res.json();
              return {
                ...item,
                discountInfo: productData.discountInfo
              } as ProductWithDiscount;
            }
          } catch (error) {
            console.error(`Error fetching product ${item._id}:`, error);
          }
          return item as ProductWithDiscount;
        });

        const products = await Promise.all(productsPromises);
        setProductsWithDiscounts(products);
      } catch (error) {
        console.error('Error fetching discounts:', error);
        setProductsWithDiscounts(wishlistState.items as ProductWithDiscount[]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, [wishlistState.items, backendUrl]);

  const removeFromWishlist = (id: string) => {
    wishlistDispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const addToCart = (item: any) => {
    cartDispatch({ type: 'ADD_ITEM', payload: item });
  };

  if (wishlistState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative inline-block mb-6"
          >
            <div className="absolute inset-0 bg-gold-200/30 dark:bg-gold-500/10 rounded-full blur-2xl"></div>
            <Heart className="h-32 w-32 text-gold-300 dark:text-gold-600 mx-auto relative" strokeWidth={1.5} />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Your Wishlist is Empty
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-300 mb-8 text-lg"
          >
            Save your favorite jewelry pieces and never lose track of them!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/catalog"
              className="group bg-gradient-to-r from-gold-500 to-gold-600 text-white px-10 py-4 rounded-full font-medium hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Explore Collection
              <Sparkles className="h-5 w-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-100 dark:bg-gold-900/30 rounded-xl">
                <Heart className="h-6 w-6 text-gold-600 dark:text-gold-400 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">
                  My Wishlist
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                  {wishlistState.items.length} {wishlistState.items.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>
            
            {wishlistState.items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/20 px-4 py-2 rounded-full border border-gold-200 dark:border-gold-700"
              >
                <Sparkles className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                <span className="text-sm font-medium text-gold-700 dark:text-gold-300">
                  Your favorites
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Wishlist Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: wishlistState.items.length }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  <div className="h-56 sm:h-64 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              productsWithDiscounts.map((item, index) => {
                const itemDiscountInfo = item.discountInfo;
                const hasDiscount = itemDiscountInfo?.hasDiscount;
                const displayPrice = hasDiscount ? itemDiscountInfo.finalPrice : item.price;
                const originalPrice = hasDiscount ? itemDiscountInfo.originalPrice : item.price;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                  >
                    <Link to={`/product/${item._id}`}>
                      <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-56 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Discount Badge */}
                        {hasDiscount && itemDiscountInfo.discountLabel && (
                          <div className="absolute top-3 left-3 bg-gradient-to-br from-red-500 to-red-600 text-white px-2.5 py-1 rounded-full shadow-lg">
                            <span className="text-xs font-bold flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              {itemDiscountInfo.discountLabel}
                            </span>
                          </div>
                        )}
                        
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Remove from Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromWishlist(item._id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-red-500 dark:text-red-400 rounded-full shadow-lg hover:bg-red-500 hover:dark:bg-red-600 hover:text-white transition-all hover:scale-110"
                          title="Remove from wishlist"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>

                        {/* Category Badge */}
                        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="p-4">
                      <Link to={`/product/${item._id}`}>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                          {item.name}
                        </h3>
                        
                        {/* Price Section with Discount */}
                        <div className="mb-4">
                          {hasDiscount ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-gold-600 dark:text-gold-400">
                                  ₹{displayPrice.toLocaleString()}
                                </p>
                                <Sparkles className="h-4 w-4 text-gold-400" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  ₹{originalPrice.toLocaleString()}
                                </span>
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                  Save ₹{itemDiscountInfo.discountAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <p className="text-xl font-bold text-gold-600 dark:text-gold-400">
                                ₹{displayPrice.toLocaleString()}
                              </p>
                              <Sparkles className="h-4 w-4 text-gold-400" />
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            addToCart(item);
                            removeFromWishlist(item._id);
                          }}
                          className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white py-2.5 px-3 rounded-lg font-medium hover:from-gold-600 hover:to-gold-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Add to Cart
                        </button>
                        
                        <button
                          onClick={() => removeFromWishlist(item._id)}
                          className="p-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:border-red-500 dark:hover:border-red-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </AnimatePresence>

        {/* Bottom Action */}
        {wishlistState.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 sm:mt-12 text-center"
          >
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Continue Shopping
              <Sparkles className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;