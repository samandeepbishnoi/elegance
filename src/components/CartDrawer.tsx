import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Gift, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
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
  quantity: number;
  discountInfo?: DiscountInfo;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useCart();
  const { isSyncing } = useAuth();
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

    if (isOpen) {
      fetchDiscountedProducts();
    }
  }, [state.items, backendUrl, isOpen]);

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
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
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-gold-600 dark:text-gold-400" />
                <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100">
                  Shopping Cart
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
                aria-label="Close cart"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Items count */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {state.items.length} {state.items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <ShoppingBag className="h-24 w-24 text-gray-300 dark:text-gray-600 mb-4" strokeWidth={1.5} />
                  <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Your Cart is Empty
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Add some beautiful jewelry to get started!
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
                      const itemDiscountInfo = (item as any).discountInfo;
                      const hasDiscount = itemDiscountInfo?.hasDiscount;
                      const pricePerUnit = hasDiscount ? itemDiscountInfo.finalPrice : item.price;
                      const originalPricePerUnit = hasDiscount ? itemDiscountInfo.originalPrice : item.price;

                      return (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex gap-3">
                            {/* Product Image */}
                            <div className="relative flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              {hasDiscount && itemDiscountInfo.discountLabel && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                  {itemDiscountInfo.discountLabel}
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                                {item.name}
                              </h3>
                              
                              {/* Price */}
                              <div className="mb-2">
                                {hasDiscount ? (
                                  <div className="space-y-0.5">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-base font-bold text-gold-600 dark:text-gold-400">
                                        ₹{pricePerUnit.toLocaleString()}
                                      </span>
                                      <span className="text-xs text-gray-400 line-through">
                                        ₹{originalPricePerUnit.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-base font-bold text-gold-600 dark:text-gold-400">
                                    ₹{item.price.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center bg-white dark:bg-gray-700 rounded-full p-0.5 border border-gray-200 dark:border-gray-600">
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-8 text-center font-semibold text-sm">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeItem(item._id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Summary and Checkout */}
            {state.items.length > 0 && (
              <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                {/* Savings */}
                {totalSavings > 0 && (
                  <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-1">
                        <Gift className="h-4 w-4" />
                        Discount Savings
                      </span>
                      <span className="font-bold text-green-700 dark:text-green-400">
                        -₹{totalSavings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Subtotal</span>
                    {totalSavings > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{state.total.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gold-600 dark:text-gold-400">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-right font-semibold mt-1">
                      You save ₹{totalSavings.toLocaleString()}!
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-2">
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="block w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white py-3 rounded-full font-semibold hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Checkout
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="block w-full bg-white dark:bg-gray-700 text-gold-600 dark:text-gold-400 py-3 rounded-full font-semibold border-2 border-gold-600 dark:border-gold-500 hover:bg-gold-50 dark:hover:bg-gray-600 transition-all text-center"
                  >
                    View Full Cart
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

export default CartDrawer;
