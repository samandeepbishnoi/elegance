import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, X, CheckCircle, ShoppingBag, Sparkles, Gift, User, Mail, Phone, MapPin, FileText, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedContent from '../components/ProtectedContent';
import AddressSelector from '../components/AddressSelector';
import toast from 'react-hot-toast';

interface SavedAddress {
  _id: string;
  addressType: 'home' | 'work' | 'other';
  fullName: string;
  phone: string;
  flatNumber?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

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

const Checkout: React.FC = () => {
  const { state, dispatch, clearCartAfterCheckout } = useCart();
  const navigate = useNavigate();
  const { isOnline } = useStore();
  const { isAuthenticated, user } = useAuth();
  
  // Selected saved address
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    pincode: '',
    notes: '',
  });
  
  // Update customerInfo when address is selected
  useEffect(() => {
    if (selectedAddress) {
      const fullAddress = [
        selectedAddress.flatNumber,
        selectedAddress.street,
        selectedAddress.landmark,
        selectedAddress.city,
        selectedAddress.state
      ].filter(Boolean).join(', ');
      
      setCustomerInfo(prev => ({
        ...prev,
        name: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: fullAddress,
        pincode: selectedAddress.pincode
      }));
    }
  }, [selectedAddress]);
  
  // Pre-fill customer info if user is logged in
  useEffect(() => {
    if (isAuthenticated && user && !selectedAddress) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || prev.email,
      }));
    }
  }, [isAuthenticated, user, selectedAddress]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  
  // Product discount states
  const [productsWithDiscounts, setProductsWithDiscounts] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDiscountTotal, setProductDiscountTotal] = useState(0);
  const [subtotalAfterProductDiscounts, setSubtotalAfterProductDiscounts] = useState(0);
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Store settings state
  const [storeSettings, setStoreSettings] = useState({
    codEnabled: true,
    razorpayEnabled: true,
    codMinimumOrder: 0,
    codMaximumOrder: 100000,
    codExtraCharge: 0
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  // Fetch store settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setStoreSettings(data.settings);
            // Set default payment method based on available options
            if (!data.settings.razorpayEnabled && data.settings.codEnabled) {
              setPaymentMethod('cod');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
      }
    };

    fetchStoreSettings();
  }, [backendUrl]);

  // Fetch product discount information
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

        // Calculate totals with product discounts
        let totalProductDiscount = 0;
        let subtotal = 0;

        products.forEach((product: ProductWithDiscount) => {
          if (product.discountInfo?.hasDiscount) {
            totalProductDiscount += product.discountInfo.discountAmount * product.quantity;
            subtotal += product.discountInfo.finalPrice * product.quantity;
          } else {
            subtotal += product.price * product.quantity;
          }
        });

        setProductDiscountTotal(totalProductDiscount);
        setSubtotalAfterProductDiscounts(subtotal);
      } catch (error) {
        console.error('Error fetching discounted products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, [state.items, backendUrl]);

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
      
      // Map cart items to send to backend with discounted prices
      const cartItems = productsWithDiscounts.map(item => {
        const finalPrice = item.discountInfo?.hasDiscount 
          ? item.discountInfo.finalPrice 
          : item.price;
        
        return {
          id: item._id,
          name: item.name,
          price: finalPrice, // Use discounted price if available
          originalPrice: item.price, // Include original price for reference
          quantity: item.quantity,
          category: item.category,
        };
      });

      const res = await fetch(`${backendUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          cartTotal: subtotalAfterProductDiscounts, // Use discounted subtotal
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
    let total = subtotalAfterProductDiscounts; // Start with product-discounted price
    if (appliedCoupon) {
      total -= appliedCoupon.discountAmount; // Then apply coupon discount
    }
    return total;
  };

  // Handle Razorpay Payment
  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error('Store is currently offline. Please try again later.', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    setProcessingPayment(true);

    try {
      const finalTotal = calculateFinalTotal();

      // Create Razorpay order
      const orderResponse = await fetch(`${backendUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          address: customerInfo.address,
          pincode: customerInfo.pincode,
          notes: customerInfo.notes,
          // Include structured address if available
          structuredAddress: selectedAddress ? {
            addressType: selectedAddress.addressType,
            flatNumber: selectedAddress.flatNumber,
            street: selectedAddress.street,
            landmark: selectedAddress.landmark,
            city: selectedAddress.city,
            state: selectedAddress.state,
          } : null,
          items: productsWithDiscounts.map(item => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            category: item.category,
            productDiscount: item.discountInfo?.discountAmount || 0,
            finalPrice: item.discountInfo?.finalPrice || item.price
          })),
          subtotal: state.total,
          productDiscount: productDiscountTotal,
          couponCode: appliedCoupon?.code || '',
          couponDiscount: appliedCoupon?.discountAmount || 0,
          finalAmount: finalTotal
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderData.order.razorpayKeyId,
          amount: orderData.order.amount * 100,
          currency: orderData.order.currency,
          name: 'Parika Jewels',
          description: 'Premium Imitation Jewellery Order',
          order_id: orderData.order.razorpayOrderId,
          theme: {
            color: '#D4AF37' // Gold theme
          },
          prefill: {
            name: customerInfo.name,
            email: customerInfo.email,
            contact: customerInfo.phone
          },
          handler: async function (response: any) {
            // Verify payment
            try {
              const verifyResponse = await fetch(`${backendUrl}/api/payment/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderData.order.orderId
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                // Clear cart from both server and localStorage
                await clearCartAfterCheckout();
                
                // Navigate to success page with order details
                navigate('/payment-success', {
                  state: {
                    orderId: verifyData.order.orderId,
                    orderNumber: verifyData.order.orderNumber,
                    amount: verifyData.order.finalAmount,
                    paymentId: response.razorpay_payment_id
                  }
                });
              } else {
                // Update order status to failed on backend
                try {
                  await fetch(`${backendUrl}/api/payment/orders/${orderData.order.orderId}/payment-failed`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                } catch (err) {
                  console.error('Failed to update payment status:', err);
                }
                toast.error('Payment verification failed. Please contact support.', {
                  duration: 5000,
                  position: 'top-center',
                });
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              // Update order status to failed on backend
              try {
                await fetch(`${backendUrl}/api/payment/orders/${orderData.order.orderId}/payment-failed`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
              } catch (err) {
                console.error('Failed to update payment status:', err);
              }
              toast.error('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id, {
                duration: 6000,
                position: 'top-center',
              });
            } finally {
              setProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: async function() {
              // Mark payment as cancelled/failed when user closes modal
              try {
                await fetch(`${backendUrl}/api/payment/orders/${orderData.order.orderId}/payment-failed`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
              } catch (err) {
                console.error('Failed to update payment status:', err);
              }
              setProcessingPayment(false);
              toast('Payment cancelled. Your cart has been saved.', {
                duration: 4000,
                position: 'top-center',
                icon: 'ℹ️',
              });
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        setProcessingPayment(false);
        toast.error('Failed to load payment gateway. Please try again.', {
          duration: 4000,
          position: 'top-center',
        });
      };

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment. Please try again.', {
        duration: 4000,
        position: 'top-center',
      });
      setProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error('Store is currently offline. Please try again later.', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    // Validate COD order amount
    const finalTotal = calculateFinalTotal() + storeSettings.codExtraCharge;
    if (finalTotal < storeSettings.codMinimumOrder) {
      toast.error(`Minimum order amount for COD is ₹${storeSettings.codMinimumOrder.toLocaleString()}`, {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }
    if (finalTotal > storeSettings.codMaximumOrder) {
      toast.error(`Maximum order amount for COD is ₹${storeSettings.codMaximumOrder.toLocaleString()}. Please use online payment.`, {
        duration: 5000,
        position: 'top-center',
      });
      return;
    }

    setProcessingPayment(true);

    try {
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
        }
      }

      // Create COD order
      const orderResponse = await fetch(`${backendUrl}/api/payment/create-cod-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          address: customerInfo.address,
          pincode: customerInfo.pincode,
          notes: customerInfo.notes,
          // Include structured address if available
          structuredAddress: selectedAddress ? {
            addressType: selectedAddress.addressType,
            flatNumber: selectedAddress.flatNumber,
            street: selectedAddress.street,
            landmark: selectedAddress.landmark,
            city: selectedAddress.city,
            state: selectedAddress.state,
          } : null,
          items: productsWithDiscounts.map(item => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            category: item.category,
            productDiscount: item.discountInfo?.discountAmount || 0,
            finalPrice: item.discountInfo?.finalPrice || item.price
          })),
          subtotal: state.total,
          productDiscount: productDiscountTotal,
          couponCode: appliedCoupon?.code || '',
          couponDiscount: appliedCoupon?.discountAmount || 0,
          codCharge: storeSettings.codExtraCharge,
          finalAmount: finalTotal
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.success) {
        // Clear cart from both server and localStorage
        await clearCartAfterCheckout();
        
        // Navigate to success page with order details
        navigate('/payment-success', {
          state: {
            orderId: orderData.order._id,
            orderNumber: orderData.order.orderNumber,
            amount: orderData.order.finalAmount,
            paymentMethod: 'cod'
          }
        });
      } else {
        throw new Error(orderData.message || 'Failed to create COD order');
      }
    } catch (error: any) {
      console.error('COD order error:', error);
      toast.error('Failed to place order. Please try again.', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (state.items.length === 0) {
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
            <ShoppingBag className="h-32 w-32 text-gold-300 dark:text-gold-600 mx-auto relative" strokeWidth={1.5} />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            No Items to Checkout
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-300 mb-8 text-lg"
          >
            Add some beautiful jewelry pieces to your cart first!
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/catalog')}
            className="group bg-gradient-to-r from-gold-500 to-gold-600 text-white px-10 py-4 rounded-full font-medium hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Explore Collection
            <ArrowLeft className="h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <ProtectedContent message="Sign in to proceed with your order">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate('/cart')}
              className="group flex items-center text-gray-600 dark:text-gray-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Back to Cart</span>
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-gold-100 dark:bg-gold-900/30 rounded-lg">
              <CreditCard className="h-5 w-5 text-gold-600 dark:text-gold-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">Secure Checkout</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-10">Complete your order in just a few steps</p>
        </motion.div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Customer Information Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 mb-6 lg:mb-0"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 bg-gold-50 dark:bg-gold-900/30 rounded-lg">
                  <User className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-gray-100">Customer Information</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <User className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone Number */}
                <div className="group">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Email Address */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Advanced Address Selector */}
                {isAuthenticated ? (
                  <div className="group">
                    <AddressSelector
                      selectedAddress={selectedAddress}
                      onSelectAddress={(address) => setSelectedAddress(address)}
                      onAddressAdded={() => {
                        // Optionally refresh or handle new address added
                      }}
                      customerName={customerInfo.name}
                      customerPhone={customerInfo.phone}
                      userId={user?.id}
                    />
                  </div>
                ) : (
                  <>
                    {/* Manual Address Input for Guest Users */}
                    <div className="group">
                      <label htmlFor="address" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                        Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        required
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Enter your complete address"
                      />
                    </div>

                    {/* Pin Code */}
                    <div className="group">
                      <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                        Pin Code *
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        required
                        value={customerInfo.pincode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Enter your pin code"
                      />
                    </div>
                  </>
                )}

                {/* Special Notes */}
                <div className="group">
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                    Special Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                    placeholder="Ring size, special instructions, etc."
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="border-t-2 border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payment Method</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Razorpay Option */}
                    <motion.button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === 'razorpay'
                          ? 'border-gold-500 bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gold-300 dark:hover:border-gold-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          paymentMethod === 'razorpay'
                            ? 'bg-gold-100 dark:bg-gold-900/30'
                            : 'bg-gray-100 dark:bg-gray-600'
                        }`}>
                          <CreditCard className={`h-5 w-5 ${
                            paymentMethod === 'razorpay'
                              ? 'text-gold-600 dark:text-gold-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold text-sm ${
                              paymentMethod === 'razorpay'
                                ? 'text-gold-900 dark:text-gold-100'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              Pay Online
                            </h4>
                            {paymentMethod === 'razorpay' && (
                              <CheckCircle className="h-5 w-5 text-gold-600 dark:text-gold-400" />
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${
                            paymentMethod === 'razorpay'
                              ? 'text-gold-700 dark:text-gold-300'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            Instant confirmation with secure payment
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              Recommended
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>

                    {/* Cash on Delivery Option */}
                    {storeSettings.codEnabled && (
                      <motion.button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          paymentMethod === 'cod'
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-green-300 dark:hover:border-green-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            paymentMethod === 'cod'
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-gray-100 dark:bg-gray-600'
                          }`}>
                            <Banknote className={`h-5 w-5 ${
                              paymentMethod === 'cod'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-bold text-sm ${
                                paymentMethod === 'cod'
                                  ? 'text-green-900 dark:text-green-100'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                Cash on Delivery
                              </h4>
                              {paymentMethod === 'cod' && (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <p className={`text-xs leading-relaxed ${
                              paymentMethod === 'cod'
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              Pay with cash when your order is delivered
                              {storeSettings.codExtraCharge > 0 && (
                                <span className="block mt-1 font-medium">
                                  +₹{storeSettings.codExtraCharge} COD charge
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (paymentMethod === 'razorpay') {
                      handleRazorpayPayment(e);
                    } else {
                      handleSubmit(e);
                    }
                  }}
                  disabled={!isOnline || processingPayment}
                  whileHover={{ scale: (isOnline && !processingPayment) ? 1.02 : 1 }}
                  whileTap={{ scale: (isOnline && !processingPayment) ? 0.98 : 1 }}
                  className={`w-full py-3.5 rounded-full font-bold transition-all flex items-center justify-center gap-2.5 text-base shadow-lg ${
                    !isOnline || processingPayment
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : paymentMethod === 'razorpay'
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-gold-500/30 hover:shadow-xl'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30 hover:shadow-xl'
                  }`}
                >
                  {processingPayment ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : !isOnline ? (
                    <>
                      <X className="h-5 w-5" />
                      Store Offline - Orders Paused
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pay ₹{calculateFinalTotal().toLocaleString()} Securely
                    </>
                  ) : (
                    <>
                      <Banknote className="h-5 w-5" />
                      Place COD Order - ₹{(calculateFinalTotal() + storeSettings.codExtraCharge).toLocaleString()}
                    </>
                  )}
                </motion.button>

                {/* Security Badge */}
                {isOnline && !processingPayment && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>
                      {paymentMethod === 'razorpay' 
                        ? 'Secure online payment gateway' 
                        : 'Pay cash on delivery - No advance payment required'}
                    </span>
                  </div>
                )}
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 lg:sticky lg:top-24 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 bg-gold-50 dark:bg-gold-900/30 rounded-lg">
                  <ShoppingBag className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-gray-100">Order Summary</h2>
              </div>
              
              {/* Products List */}
              <div className="space-y-2.5 mb-5 max-h-64 overflow-y-auto scrollbar-thin">
                {loading ? (
                  <div className="text-center py-6">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gold-200/30 dark:bg-gold-500/10 rounded-full blur-xl animate-pulse"></div>
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gold-200 dark:border-gray-700 border-t-gold-500 relative"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Loading products...</p>
                  </div>
                ) : (
                  productsWithDiscounts.map((item, index) => {
                    const itemDiscountInfo = item.discountInfo;
                    const hasDiscount = itemDiscountInfo?.hasDiscount;
                    const pricePerUnit = hasDiscount ? itemDiscountInfo.finalPrice : item.price;
                    const originalPricePerUnit = hasDiscount ? itemDiscountInfo.originalPrice : item.price;
                    const itemTotal = pricePerUnit * item.quantity;

                    return (
                      <motion.div 
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                          />
                          {hasDiscount && itemDiscountInfo.discountLabel && (
                            <span className="absolute top-0 right-0 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg font-bold shadow-md">
                              {itemDiscountInfo.discountLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1 mb-0.5">{item.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Quantity: {item.quantity}</p>
                          {hasDiscount && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              Save ₹{(itemDiscountInfo.discountAmount * item.quantity).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex flex-col justify-center">
                          {hasDiscount ? (
                            <>
                              <span className="font-bold text-gold-600 dark:text-gold-400 text-sm">
                                ₹{itemTotal.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                ₹{(originalPricePerUnit * item.quantity).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                              ₹{itemTotal.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Coupon Section */}
              <div className="border-t-2 border-gray-100 dark:border-gray-700 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Have a Coupon?</h3>
                </div>
                
                {!appliedCoupon ? (
                  <>
                    <div className="flex gap-2 mb-2.5">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 uppercase font-mono text-sm placeholder-gray-400 dark:placeholder-gray-500"
                        disabled={validatingCoupon}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-semibold shadow-md text-sm"
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    
                    {/* Available Coupons Dropdown */}
                    {availableCoupons.length > 0 && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowCouponDropdown(!showCouponDropdown)}
                          className="text-xs text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 font-medium flex items-center gap-1 hover:underline"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {showCouponDropdown ? 'Hide' : 'View'} {availableCoupons.length} available {availableCoupons.length === 1 ? 'coupon' : 'coupons'}
                        </button>
                        
                        <AnimatePresence>
                          {showCouponDropdown && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2.5 space-y-2 max-h-48 overflow-y-auto scrollbar-thin"
                            >
                              {availableCoupons.map((coupon: any, idx: number) => (
                                <motion.div
                                  key={coupon._id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="group relative bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/20 border-2 border-gold-200 dark:border-gold-700 rounded-lg p-2.5 hover:border-gold-400 dark:hover:border-gold-500 cursor-pointer transition-all hover:shadow-md"
                                  onClick={() => handleSelectCoupon(coupon.code)}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <Tag className="h-3 w-3 text-gold-600 dark:text-gold-400" />
                                        <p className="font-mono font-bold text-xs text-gray-900 dark:text-gray-100">
                                          {coupon.code}
                                        </p>
                                      </div>
                                      <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                                        {coupon.discountType === 'percentage' 
                                          ? `${coupon.discountValue}% OFF` 
                                          : `₹${coupon.discountValue} OFF`}
                                        {coupon.minPurchase > 0 && ` · Min ₹${coupon.minPurchase.toLocaleString()}`}
                                      </p>
                                      {coupon.description && (
                                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                          {coupon.description}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      className="px-2.5 py-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-semibold rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all shadow-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectCoupon(coupon.code);
                                      }}
                                    >
                                      Apply
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-sm text-green-900 dark:text-green-100">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {appliedCoupon.discountType === 'percentage' 
                            ? `${appliedCoupon.discountValue}% discount applied` 
                            : `₹${appliedCoupon.discountValue} off applied`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Remove coupon"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
                
                {couponError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-lg"
                  >
                    {couponError}
                  </motion.p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t-2 border-gray-100 dark:border-gray-700 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{state.total.toLocaleString()}</span>
                </div>
                
                {productDiscountTotal > 0 && (
                  <>
                    <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 -mx-5 px-5 py-1.5">
                      <span className="flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
                        <Gift className="h-3.5 w-3.5" />
                        Product Discounts
                      </span>
                      <span className="font-bold text-green-700 dark:text-green-400">-₹{productDiscountTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">After Discounts</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">₹{subtotalAfterProductDiscounts.toLocaleString()}</span>
                    </div>
                  </>
                )}
                
                {appliedCoupon && (
                  <div className="flex justify-between text-sm bg-purple-50 dark:bg-purple-900/20 -mx-5 px-5 py-1.5">
                    <span className="flex items-center gap-1 text-purple-700 dark:text-purple-400 font-medium">
                      <Tag className="h-3.5 w-3.5" />
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span className="font-bold text-purple-700 dark:text-purple-400">-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Free
                  </span>
                </div>
                
                <div className="flex justify-between items-baseline pt-2.5 border-t-2 border-gray-200 dark:border-gray-700">
                  <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Total Amount</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gold-600 dark:text-gold-400">
                      ₹{calculateFinalTotal().toLocaleString()}
                    </span>
                    {(productDiscountTotal > 0 || appliedCoupon) && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">
                        🎉 You save ₹{(productDiscountTotal + (appliedCoupon?.discountAmount || 0)).toLocaleString()}!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Info Box */}
              <div className={`mt-5 p-4 rounded-lg border-2 ${
                isOnline
                  ? paymentMethod === 'razorpay'
                    ? 'bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/20 border-gold-200 dark:border-gold-700'
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700'
              }`}>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg ${
                    isOnline 
                      ? paymentMethod === 'razorpay'
                        ? 'bg-gold-100 dark:bg-gold-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {isOnline ? (
                      paymentMethod === 'razorpay' ? (
                        <CreditCard className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                      ) : (
                        <Banknote className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )
                    ) : (
                      <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold mb-0.5 ${
                      isOnline 
                        ? paymentMethod === 'razorpay'
                          ? 'text-gold-900 dark:text-gold-100'
                          : 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {!isOnline 
                        ? '⚠️ Store Currently Offline' 
                        : paymentMethod === 'razorpay'
                        ? '✅ Online Payment Available'
                        : '✅ Cash on Delivery Available'}
                    </p>
                    <p className={`text-xs leading-relaxed ${
                      isOnline 
                        ? paymentMethod === 'razorpay'
                          ? 'text-gold-700 dark:text-gold-300'
                          : 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {!isOnline
                        ? 'Orders are temporarily paused. Please check back later or contact us for assistance.'
                        : paymentMethod === 'razorpay'
                        ? 'Complete your payment instantly with credit/debit cards, UPI, or net banking. Your order will be confirmed immediately.'
                        : 'Pay with cash when your order is delivered. No advance payment required!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </ProtectedContent>
  );
};

export default Checkout;