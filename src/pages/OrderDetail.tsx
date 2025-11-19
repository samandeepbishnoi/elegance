import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, CheckCircle, XCircle, Clock, Truck, MapPin, User, Mail, Phone, Tag, Gift, CreditCard, FileText, AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CancelOrderModal from '../components/CancelOrderModal';
import OrderTrackingTimeline from '../components/OrderTrackingTimeline';

interface Order {
  _id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  pincode: string;
  notes?: string;
  items: any[];
  subtotal: number;
  productDiscount: number;
  couponCode?: string;
  couponDiscount: number;
  finalAmount: number;
  totalSavings: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  canCancel?: boolean;
  cancelledBy?: string;
  cancelReason?: string;
  customCancelReason?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  refundStatus?: string;
  refundId?: string;
  refundAmount?: number;
  refundDate?: string;
  timeline?: Array<{
    event: string;
    date: string;
    description?: string;
  }>;
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919896076856';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchOrderDetails();

    // Auto-refresh every 30 seconds to show admin updates
    const interval = setInterval(() => {
      fetchOrderDetails(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [id, isAuthenticated]);

  const fetchOrderDetails = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch(`${backendUrl}/api/payment/orders/${id}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (!silent) {
        navigate('/orders');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrderDetails(true);
  };

  const handleCancelSuccess = () => {
    setShowCancelModal(false);
    fetchOrderDetails();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'delivered':
        return <CheckCircle className="h-6 w-6" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-6 w-6" />;
      case 'pending':
        return <Clock className="h-6 w-6" />;
      case 'processing':
      case 'confirmed':
        return <Package className="h-6 w-6" />;
      case 'shipped':
        return <Truck className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'delivered':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'processing':
      case 'confirmed':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'shipped':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const contactWhatsApp = () => {
    if (!order) return;

    const message = `
Hello! I have a query regarding my order:

Order Number: ${order.orderNumber || `ELG-${order._id.slice(-8).toUpperCase()}`}
Payment ID: ${order.razorpayPaymentId || 'N/A'}

Please assist me with my order.
    `.trim();

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-20 w-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Order Not Found</h2>
          <Link to="/orders" className="text-gold-600 dark:text-gold-400 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber || `ELG-${order._id.slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Order Details
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{orderNumber}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              title="Refresh order status"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Cancel Order Button */}
            {order.orderStatus !== 'cancelled' && (
              <div className="relative group">
                <button
                  onClick={() => order.canCancel && setShowCancelModal(true)}
                  disabled={!order.canCancel}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                    order.canCancel
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer'
                      : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                  title={!order.canCancel ? 'This order can no longer be cancelled' : 'Cancel this order'}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </button>
                
                {/* Tooltip for disabled button */}
                {!order.canCancel && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    This order can no longer be cancelled
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={contactWhatsApp}
              className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Contact
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Tracking Timeline */}
            <OrderTrackingTimeline
              orderStatus={order.orderStatus}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
              shippedAt={order.shippedAt}
              deliveredAt={order.deliveredAt}
              cancelledAt={order.cancelledAt}
            />

            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${getStatusColor(order.paymentStatus)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.paymentStatus)}
                  <div>
                    <h3 className="text-sm font-semibold">Payment {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</h3>
                    <p className="text-xs opacity-80">Order {order.orderStatus}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">Placed on</p>
                  <p className="text-xs font-medium">{orderDate}</p>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className="text-xs mb-1">Tracking Number</p>
                  <p className="font-mono text-xs font-semibold">{order.trackingNumber}</p>
                </div>
              )}
            </motion.div>

            {/* Cancellation/Refund Info */}
            {order.orderStatus === 'cancelled' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 dark:bg-red-900/40 rounded-full p-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                      Order Cancelled
                    </h3>
                    
                    <div className="space-y-2 text-sm text-red-800 dark:text-red-300">
                      {order.cancelledBy && (
                        <p>
                          <span className="font-medium">Cancelled By:</span>{' '}
                          {order.cancelledBy === 'customer' ? 'Customer' : order.cancelledBy === 'admin' ? 'Admin' : 'System'}
                        </p>
                      )}
                      
                      {(order.cancelReason || order.customCancelReason || order.cancellationReason) && (
                        <p>
                          <span className="font-medium">Reason:</span>{' '}
                          {order.customCancelReason || order.cancelReason || order.cancellationReason}
                        </p>
                      )}
                      
                      {order.cancelledAt && (
                        <p>
                          <span className="font-medium">Cancelled On:</span>{' '}
                          {new Date(order.cancelledAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}

                      {/* WhatsApp Contact Button */}
                      <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-700">
                        <button
                          onClick={() => {
                            const refundText = order.paymentMethod === 'online' ? '\n\nI need information about my refund.' : '';
                            const cancelMessage = `Hello! I have cancelled my order and need assistance.

Order Number: ${order.orderNumber || `ELG-${order._id.slice(-8).toUpperCase()}`}
Cancelled On: ${order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}) : 'Recently'}
Reason: ${order.customCancelReason || order.cancelReason || order.cancellationReason || 'N/A'}${refundText}

Please assist me with this cancellation.`;
                            
                            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(cancelMessage)}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                        >
                          <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          Contact Admin on WhatsApp
                        </button>
                        <p className="text-xs text-center text-red-700 dark:text-red-400 mt-2">
                          Get instant support for your cancelled order
                        </p>
                      </div>
                    </div>

                    {/* Refund Information */}
                    {order.refundStatus && order.refundStatus !== 'none' && (
                      <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                        <p className="font-semibold mb-2 text-sm text-red-800 dark:text-red-300">Refund Information</p>
                        <div className="space-y-1 text-sm text-red-800 dark:text-red-300">
                          <p>
                            <span className="font-medium">Status:</span>{' '}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              order.refundStatus === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                                : order.refundStatus === 'processing'
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                                : order.refundStatus === 'pending' || order.refundStatus === 'requested'
                                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {order.refundStatus.charAt(0).toUpperCase() + order.refundStatus.slice(1)}
                            </span>
                          </p>
                          {order.refundAmount && (
                            <p>
                              <span className="font-medium">Amount:</span> ₹{order.refundAmount.toLocaleString()}
                            </p>
                          )}
                          {order.refundId && (
                            <p>
                              <span className="font-medium">Refund ID:</span>{' '}
                              <span className="font-mono text-xs">{order.refundId}</span>
                            </p>
                          )}
                          {order.refundDate && (
                            <p>
                              <span className="font-medium">Refund Date:</span>{' '}
                              {new Date(order.refundDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-red-700 dark:text-red-400">
                          {order.refundStatus === 'completed' 
                            ? 'Your refund has been processed and should reflect in your account within 2-3 business days.'
                            : order.refundStatus === 'processing'
                            ? 'Your refund is being processed and will be completed within 5-7 business days.'
                            : 'Your refund request is under review. We will process it shortly.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                Order Items ({order.items.length})
              </h3>
              
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quantity: {item.quantity}</p>
                      {item.productDiscount > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          Saved ₹{(item.productDiscount * item.quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ₹{(item.finalPrice * item.quantity).toLocaleString()}
                      </p>
                      {item.productDiscount > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Price Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">₹{order.subtotal.toLocaleString()}</span>
                </div>

                {order.productDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Gift className="h-3 w-3" />
                      Product Discounts
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">-₹{order.productDiscount.toLocaleString()}</span>
                  </div>
                )}

                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                      <Tag className="h-3 w-3" />
                      Coupon ({order.couponCode})
                    </span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">-₹{order.couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total Paid</span>
                  <span className="text-lg font-bold text-gold-600 dark:text-gold-400">₹{order.finalAmount.toLocaleString()}</span>
                </div>

                {order.totalSavings > 0 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      You saved ₹{order.totalSavings.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                Payment Details
              </h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Payment Method</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{order.paymentMethod}</p>
                </div>

                {order.razorpayPaymentId && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Payment ID</p>
                    <p className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all">{order.razorpayPaymentId}</p>
                  </div>
                )}

                {order.razorpayOrderId && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Transaction ID</p>
                    <p className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all">{order.razorpayOrderId}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                Delivery Address
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100 text-xs">{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100 text-xs">{order.customerEmail}</span>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 dark:text-gray-100 text-xs">{order.address}</p>
                    <p className="text-gray-900 dark:text-gray-100 text-xs mt-1">PIN: {order.pincode}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <FileText className="h-3 w-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-0.5">Notes</p>
                      <p className="text-gray-900 dark:text-gray-100 text-xs">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <CancelOrderModal
            orderId={order._id}
            orderNumber={orderNumber}
            onClose={() => setShowCancelModal(false)}
            onSuccess={handleCancelSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetail;
