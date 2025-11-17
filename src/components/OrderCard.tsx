import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Tag, Gift, Calendar, CreditCard } from 'lucide-react';

interface OrderCardProps {
  order: any;
  index: number;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, index, getStatusIcon }) => {
  const orderNumber = order.orderNumber || `ELG-${order._id.slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Get payment method display text
  const getPaymentMethodText = () => {
    if (!order.paymentMethod) return 'Online';
    if (order.paymentMethod.toLowerCase() === 'cod') return 'Cash on Delivery';
    return 'Online Payment';
  };

  // Get payment status text
  const getPaymentStatusText = () => {
    if (order.paymentStatus === 'success') return 'Paid';
    if (order.paymentStatus === 'pending') return 'Payment Pending';
    if (order.paymentStatus === 'failed') return 'Payment Failed';
    if (order.paymentStatus === 'refunded') return 'Refunded';
    return order.paymentStatus;
  };

  // Get order status display
  const getOrderStatusDisplay = () => {
    switch (order.orderStatus) {
      case 'pending': return { text: 'Pending', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'confirmed': return { text: 'Confirmed', color: 'text-blue-600 dark:text-blue-400' };
      case 'processing': return { text: 'Processing', color: 'text-purple-600 dark:text-purple-400' };
      case 'shipped': return { text: 'Shipped', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'delivered': return { text: 'Delivered', color: 'text-green-600 dark:text-green-400' };
      case 'cancelled': return { text: 'Cancelled', color: 'text-red-600 dark:text-red-400' };
      default: return { text: order.orderStatus, color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const orderStatus = getOrderStatusDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.02 }}
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gold-200 dark:hover:border-gold-700 transition-all duration-300 overflow-hidden hover:shadow-lg"
    >
      <Link to={`/orders/${order._id}`} className="block">
        <div className="p-3 sm:p-4">
          {/* Compact Header */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {orderNumber}
                </h3>
                {/* Order Status Badge */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/50">
                  {getStatusIcon(order.orderStatus)}
                  <span className={`text-xs font-semibold whitespace-nowrap ${orderStatus.color}`}>
                    {orderStatus.text}
                  </span>
                </div>
              </div>
              
              {/* Date and Payment Info - Stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{orderDate}</span>
                </span>
                
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{getPaymentMethodText()}</span>
                  </span>
                  <span>•</span>
                  <span className={`font-medium whitespace-nowrap ${order.paymentStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {getPaymentStatusText()}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-all group-hover:translate-x-0.5 flex-shrink-0" />
          </div>

          {/* Compact Product Grid */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/50 gap-3">
            <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0">
              {order.items.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {item.quantity > 1 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {item.quantity}
                    </div>
                  )}
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    +{order.items.length - 3}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          {/* Compact Summary Section - Vertical stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {order.totalSavings > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <Gift className="h-3 w-3 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                    ₹{order.totalSavings.toLocaleString()} saved
                  </span>
                </div>
              )}

              {order.couponCode && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <Tag className="h-3 w-3 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                    {order.couponCode}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end sm:text-right">
              <p className="text-[10px] sm:hidden text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Total Amount</p>
              <p className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide sm:mb-0.5">Total</p>
              <p className="text-lg sm:text-lg font-bold text-gray-900 dark:text-gray-100 ml-auto sm:ml-0">
                ₹{order.finalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default OrderCard;
