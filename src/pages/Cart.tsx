import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Gift, Sparkles } from 'lucide-react';
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
  quantity: number;
  discountInfo?: DiscountInfo;
}

const Cart: React.FC = () => {
  const { state, dispatch } = useCart();
  const [productsWithDiscounts, setProductsWithDiscounts] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      if (state.items.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch each product with discount information
        const productsPromises = state.items.map(async (item) => {
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

        // Calculate totals
        let savings = 0;
        let total = 0;

        products.forEach((product: ProductWithDiscount) => {
          if (product.discountInfo?.hasDiscount) {
            savings += product.discountInfo.discountAmount * product.quantity;
            total += product.discountInfo.finalPrice * product.quantity;
          } else {
            total += product.price * product.quantity;
          }
        });

        setTotalSavings(savings);
        setFinalTotal(total);
      } catch (error) {
        console.error('Error fetching discounted products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, [state.items, backendUrl]);

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative inline-block mb-6"
          >
            <div className="absolute inset-0 bg-gold-200/30 dark:bg-gold-500/10 rounded-full blur-2xl"></div>
            <ShoppingBag className="h-32 w-32 text-gold-300 dark:text-gold-600 mx-auto relative" strokeWidth={1.5} />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Your Cart is Empty
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-300 mb-8 text-lg"
          >
            Discover our beautiful jewelry collection and add some sparkle to your cart!
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
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gold-200/30 dark:bg-gold-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gold-200 dark:border-gray-700 border-t-gold-500 dark:border-t-gold-500 relative"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 text-gold-600 dark:text-gold-400" />
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {state.items.length} {state.items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {productsWithDiscounts.map((item, index) => {
                  const itemDiscountInfo = (item as any).discountInfo;
                  const hasDiscount = itemDiscountInfo?.hasDiscount;
                  const pricePerUnit = hasDiscount ? itemDiscountInfo.finalPrice : item.price;
                  const originalPricePerUnit = hasDiscount ? itemDiscountInfo.originalPrice : item.price;
                  const itemTotal = pricePerUnit * item.quantity;
                  const originalItemTotal = originalPricePerUnit * item.quantity;

                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                    >
                      <div className="p-3 sm:p-4">
                        <div className="flex flex-row gap-3">
                          {/* Product Image */}
                          <div className="relative flex-shrink-0 self-start">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              {hasDiscount && itemDiscountInfo.discountLabel && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-0 right-0 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-bl-lg rounded-tr-lg font-bold shadow-lg flex items-center gap-1 z-10"
                                >
                                  <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  <span>{itemDiscountInfo.discountLabel}</span>
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            {/* Product Name and Category */}
                            <div className="mb-1.5">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-0.5 line-clamp-2 leading-tight">
                                {item.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-gold-500 dark:text-gold-400 flex-shrink-0" />
                                <span className="truncate">{item.category}</span>
                              </p>
                            </div>

                            {/* Price Section */}
                            <div className="mb-2">
                              {hasDiscount ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-baseline gap-2 flex-wrap">
                                    <p className="text-base sm:text-lg font-bold text-gold-600 dark:text-gold-400">
                                      ₹{pricePerUnit.toLocaleString()}
                                    </p>
                                    <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 line-through">
                                      ₹{originalPricePerUnit.toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                    <Gift className="h-3 w-3 flex-shrink-0" />
                                    <span className="line-clamp-1">Save ₹{itemDiscountInfo.discountAmount.toLocaleString()}</span>
                                  </p>
                                </div>
                              ) : (
                                <p className="text-base sm:text-lg font-bold text-gold-600 dark:text-gold-400">
                                  ₹{item.price.toLocaleString()}
                                </p>
                              )}

                              {item.quantity > 1 && (
                                <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-700">
                                  {hasDiscount ? (
                                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                      <span className="text-gray-600 dark:text-gray-300">Total:</span>
                                      <span className="font-bold text-gold-600 dark:text-gold-400">
                                        ₹{itemTotal.toLocaleString()}
                                      </span>
                                      <span className="text-gray-400 dark:text-gray-500 line-through">
                                        ₹{originalItemTotal.toLocaleString()}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <span className="text-gray-600 dark:text-gray-300">Total:</span>
                                      <span className="font-bold text-gold-600 dark:text-gold-400">
                                        ₹{itemTotal.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-auto">
                              <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-full p-0.5 border border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  className="p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                                </button>
                                <span className="w-8 text-center font-semibold text-sm text-gray-900 dark:text-gray-100">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeItem(item._id)}
                                className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                title="Remove item"
                                aria-label="Remove item from cart"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-6 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 lg:sticky lg:top-24 border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-500 dark:text-gold-400" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Subtotal ({state.items.length} {state.items.length === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ₹{state.total.toLocaleString()}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-between items-center py-2 bg-green-50 dark:bg-green-900/20 -mx-5 px-5 border-y border-green-100 dark:border-green-800"
                  >
                    <span className="font-semibold text-sm text-green-700 dark:text-green-400 flex items-center gap-1">
                      <Gift className="h-4 w-4 flex-shrink-0" />
                      <span>Discount Savings</span>
                    </span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      -₹{totalSavings.toLocaleString()}
                    </span>
                  </motion.div>
                )}

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 text-sm">
                    <Sparkles className="h-3 w-3" />
                    Free
                  </span>
                </div>

                <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span>Original Total</span>
                      <span className="line-through">
                        ₹{state.total.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Total Amount
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gold-600 dark:text-gold-400">
                        ₹{finalTotal.toLocaleString()}
                      </span>
                      {totalSavings > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">
                          You save ₹{totalSavings.toLocaleString()}!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  to="/checkout"
                  className="group w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white py-3 rounded-full font-semibold hover:from-gold-600 hover:to-gold-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/catalog"
                  className="w-full bg-white dark:bg-gray-700 text-gold-600 dark:text-gold-400 py-3 rounded-full font-semibold border-2 border-gold-600 dark:border-gold-500 hover:bg-gold-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="h-8 w-8 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>100% Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="h-8 w-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Fast & Free Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="h-8 w-8 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span>Certified Authenticity</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;