import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

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
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Discover our beautiful jewelry collection and add some sparkle to your cart!
          </p>
          <Link
            to="/"
            className="bg-gold-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {productsWithDiscounts.map((item) => {
                const itemDiscountInfo = (item as any).discountInfo;
                const hasDiscount = itemDiscountInfo?.hasDiscount;
                const pricePerUnit = hasDiscount ? itemDiscountInfo.finalPrice : item.price;
                const originalPricePerUnit = hasDiscount ? itemDiscountInfo.originalPrice : item.price;
                const itemTotal = pricePerUnit * item.quantity;
                const originalItemTotal = originalPricePerUnit * item.quantity;

                return (
                  <div key={item._id} className="p-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg mr-4"
                        />
                        {hasDiscount && itemDiscountInfo.discountLabel && (
                          <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            {itemDiscountInfo.discountLabel}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 capitalize mb-2">{item.category}</p>
                        
                        {hasDiscount ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xl font-bold text-gold-600">
                                ₹{pricePerUnit.toLocaleString()}
                              </p>
                              <span className="text-sm text-gray-500 line-through">
                                ₹{originalPricePerUnit.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              Save ₹{itemDiscountInfo.discountAmount.toLocaleString()} per item
                            </p>
                          </div>
                        ) : (
                          <p className="text-xl font-bold text-gold-600">
                            ₹{item.price.toLocaleString()}
                          </p>
                        )}
                        
                        {item.quantity > 1 && (
                          <div className="mt-2 text-sm text-gray-600">
                            {hasDiscount ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gold-600">
                                  Item Total: ₹{itemTotal.toLocaleString()}
                                </span>
                                <span className="text-gray-500 line-through">
                                  ₹{originalItemTotal.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold">
                                Item Total: ₹{itemTotal.toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 ml-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({state.items.length})</span>
                  <span className="font-medium">₹{state.total.toLocaleString()}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-semibold">Discount Savings</span>
                    <span className="font-bold">-₹{totalSavings.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                
                <div className="border-t pt-3">
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-gray-500 text-sm mb-2">
                      <span>Subtotal (before discount)</span>
                      <span className="line-through">₹{state.total.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gold-600">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-sm text-green-600 font-semibold mt-2 text-right">
                      You're saving ₹{totalSavings.toLocaleString()}!
                    </p>
                  )}
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-gold-500 text-white py-4 rounded-lg font-medium hover:bg-gold-600 transition-colors block text-center"
              >
                Proceed to Checkout
              </Link>
              
              <Link
                to="/"
                className="w-full mt-3 bg-white text-gold-600 py-3 rounded-lg font-medium border border-gold-600 hover:bg-gold-50 transition-colors block text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;