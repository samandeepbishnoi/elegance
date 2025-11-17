import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Home, ShoppingBag, Star, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LocationState {
  orderId: string;
  orderNumber: string;
  amount: number;
  paymentId?: string;
  paymentMethod?: 'razorpay' | 'cod';
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  const isCOD = state?.paymentMethod === 'cod';

  // Trigger confetti animation
  useEffect(() => {
    // Initial confetti burst
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Gold confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#FFD700', '#FFA500', '#FF8C00']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#FFD700', '#FFA500', '#FF8C00']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Fetch order details
  useEffect(() => {
    if (!state?.orderId) {
      navigate('/');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/payment/orders/${state.orderId}`);
        const data = await response.json();
        
        if (data.success) {
          setOrderDetails(data.order);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [state, navigate, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-semibold">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gold-50/20 to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl shadow-green-500/50 mb-4 relative">
            <CheckCircle className="h-14 w-14 text-white" strokeWidth={3} />
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ 
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-green-400 opacity-20"
            />
          </div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {isCOD ? 'Order Placed Successfully! 🎉' : 'Payment Successful! 🎉'}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            {isCOD 
              ? 'Your order has been confirmed. Pay with cash on delivery!' 
              : 'Your order has been confirmed and is being processed'}
          </motion.p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gold-200 dark:border-gold-800 overflow-hidden mb-6"
        >
          {/* Gold Header */}
          <div className="bg-gradient-to-r from-gold-500 to-amber-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Order Number</p>
                <p className="text-2xl font-bold tracking-wide">{state.orderNumber}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <ShoppingBag className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-6 space-y-4">
            {!isCOD && state.paymentId && (
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Payment ID</span>
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100 font-semibold">{state.paymentId}</span>
              </div>
            )}

            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {isCOD ? 'Amount to Pay on Delivery' : 'Amount Paid'}
              </span>
              <span className="text-2xl font-bold text-gold-600 dark:text-gold-400">
                ₹{state.amount.toLocaleString()}
              </span>
            </div>

            {orderDetails && (
              <>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Items</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{orderDetails.items?.length || 0} product(s)</span>
                </div>

                {orderDetails.totalSavings > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-300">You Saved</span>
                    </div>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      ₹{orderDetails.totalSavings.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/20 rounded-xl p-4 flex items-start gap-3">
              <Star className="h-5 w-5 text-gold-600 dark:text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gold-900 dark:text-gold-100 mb-1">
                  Thank you for your purchase!
                </p>
                <p className="text-sm text-gold-700 dark:text-gold-300 leading-relaxed">
                  Your jewelry order is now confirmed. We'll send you updates about your order status via email.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl font-semibold hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="h-5 w-5" />
            View Orders
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </motion.div>

        {/* Decorative Elements */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-gold-600 dark:text-gold-400 mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Elegance Jewelry</span>
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Thank you for choosing luxury. We're honored to serve you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
