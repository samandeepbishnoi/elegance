import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Tag, X, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  notes: string;
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  discountType: string;
  discountValue: number;
}

const Checkout: React.FC = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const { isOnline } = useStore();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    pincode: '',
    notes: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  // Fetch available coupons based on cart
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        // Get unique categories from cart
        const cartCategories = [...new Set(state.items.map(item => item.category))];
        
        const res = await fetch(`${backendUrl}/api/coupons/active/list`);
        if (res.ok) {
          const data = await res.json();
          // Filter coupons that are applicable to cart
          const eligible = data.coupons.filter((coupon: any) => {
            // If no category restriction or cart has matching category
            if (coupon.applicableCategories.length === 0) return true;
            return coupon.applicableCategories.some((cat: string) => 
              cartCategories.includes(cat)
            );
          });
          setAvailableCoupons(eligible);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    if (state.items.length > 0) {
      fetchAvailableCoupons();
    }
  }, [state.items, backendUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      // Get unique categories from cart items
      const cartCategories = [...new Set(state.items.map(item => item.category))];
      
      // Map cart items to send to backend
      const cartItems = state.items.map(item => ({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      }));

      const res = await fetch(`${backendUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          cartTotal: state.total,
          cartCategories,
          cartItems,
        }),
      });

      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({
          code: data.couponDetails.code,
          discountAmount: data.discountAmount,
          discountType: data.couponDetails.discountType,
          discountValue: data.couponDetails.discountValue,
        });
        setCouponError('');
        setCouponCode('');
        setShowCouponDropdown(false);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      setCouponError('Failed to validate coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleSelectCoupon = (code: string) => {
    setCouponCode(code);
    // Auto-apply the coupon immediately
    handleApplyCoupon(code);
  };

  const calculateFinalTotal = () => {
    if (appliedCoupon) {
      return state.total - appliedCoupon.discountAmount;
    }
    return state.total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      alert('Store is currently offline. Please try again later.');
      return;
    }

    // Confirm coupon usage if a coupon was applied
    if (appliedCoupon) {
      try {
        await fetch(`${backendUrl}/api/coupons/confirm-usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: appliedCoupon.code
          }),
        });
      } catch (error) {
        console.error('Error confirming coupon usage:', error);
        // Continue with order even if coupon confirmation fails
      }
    }

    // Create WhatsApp message
    const orderDetails = state.items.map(item => 
      `${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');
    
    const finalTotal = calculateFinalTotal();
    const couponInfo = appliedCoupon 
      ? `\n💎 *Coupon Applied:* ${appliedCoupon.code}\n💰 *Discount:* -₹${appliedCoupon.discountAmount.toLocaleString()}\n`
      : '';
    
    const message = `
🌟 *NEW JEWELRY ORDER*

📦 *Order Details:*
${orderDetails}

💵 *Subtotal:* ₹${state.total.toLocaleString()}${couponInfo}
✨ *Final Total: ₹${finalTotal.toLocaleString()}*

👤 *Customer Information:*
Name: ${customerInfo.name}
Phone: ${customerInfo.phone}
Email: ${customerInfo.email}
Address: ${customerInfo.address}
Pin Code: ${customerInfo.pincode}
${customerInfo.notes ? `Notes: ${customerInfo.notes}` : ''}

Thank you for choosing Elegance Jewelry! 💍
    `.trim();

    // WhatsApp business number (replace with actual number)
    const whatsappNumber = '919896076856';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and coupon after successful order
    dispatch({ type: 'CLEAR_CART' });
    setAppliedCoupon(null);
    
    // Navigate to success page or home
    navigate('/');
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            No Items to Checkout
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Add some beautiful jewelry pieces to your cart first!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gold-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cart
        </button>

        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Customer Information Form */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Customer Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your complete address"
                  />
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pin Code *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    required
                    value={customerInfo.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your pin code"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Special Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ring size, special instructions, etc."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isOnline}
                  className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    isOnline
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-400 cursor-not-allowed text-gray-200'
                  }`}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {isOnline ? 'Place Order via WhatsApp' : 'Store Offline - Orders Paused'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item._id} className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{item.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t dark:border-gray-700 pt-4 mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Have a Coupon?</h3>
                
                {!appliedCoupon ? (
                  <>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase font-mono"
                        disabled={validatingCoupon}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {validatingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    
                    {/* Available Coupons Dropdown */}
                    {availableCoupons.length > 0 && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowCouponDropdown(!showCouponDropdown)}
                          className="text-sm text-gold-600 dark:text-gold-400 hover:underline flex items-center"
                        >
                          <Tag className="h-4 w-4 mr-1" />
                          {showCouponDropdown ? 'Hide' : 'View'} available coupons ({availableCoupons.length})
                        </button>
                        
                        {showCouponDropdown && (
                          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                            {availableCoupons.map((coupon: any) => (
                              <div
                                key={coupon._id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                                onClick={() => handleSelectCoupon(coupon.code)}
                              >
                                <div className="flex-1">
                                  <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                                    {coupon.code}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {coupon.discountType === 'percentage' 
                                      ? `${coupon.discountValue}% off` 
                                      : `₹${coupon.discountValue} off`}
                                    {coupon.minPurchase > 0 && ` on orders above ₹${coupon.minPurchase.toLocaleString()}`}
                                  </p>
                                  {coupon.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {coupon.description}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="ml-3 px-3 py-1 bg-gold-500 text-white text-xs rounded hover:bg-gold-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCoupon(coupon.code);
                                  }}
                                >
                                  Use
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center text-green-700 dark:text-green-300">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <div>
                        <p className="font-mono font-bold">{appliedCoupon.code}</p>
                        <p className="text-xs">
                          {appliedCoupon.discountType === 'percentage' 
                            ? `${appliedCoupon.discountValue}% off` 
                            : `₹${appliedCoupon.discountValue} off`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
                
                {couponError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{couponError}</p>
                )}
              </div>

              <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{state.total.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Coupon Discount
                    </span>
                    <span className="font-medium">-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-gold-600">₹{calculateFinalTotal().toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 dark:text-green-400 text-right">
                    You saved ₹{appliedCoupon.discountAmount.toLocaleString()}!
                  </p>
                )}
              </div>

              <div className={`mt-6 p-4 rounded-lg ${
                isOnline
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <p className={`text-sm mb-2 ${
                  isOnline
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  <strong>{isOnline ? 'WhatsApp Checkout:' : 'Store Offline:'}</strong>
                </p>
                <p className={`text-sm ${
                  isOnline
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {isOnline
                    ? 'Your order details will be sent directly to our WhatsApp for quick processing. We\'ll confirm availability and provide payment options.'
                    : 'The store is currently offline. Orders are temporarily paused. Please check back later.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;