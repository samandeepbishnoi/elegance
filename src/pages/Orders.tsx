import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, RefreshCw, Truck, AlertCircle, ArrowLeft, Filter, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProtectedContent from '../components/ProtectedContent';
import OrderCard from '../components/OrderCard';

interface Order {
  _id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  subtotal: number;
  productDiscount: number;
  couponCode?: string;
  couponDiscount: number;
  finalAmount: number;
  totalSavings: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

const Orders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/payment/orders?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'processing':
      case 'confirmed':
        return <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'refunded':
        return <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'refunded':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filter !== 'all') {
      if (filter === 'paid' && order.paymentStatus !== 'success') return false;
      if (filter === 'pending' && order.paymentStatus !== 'pending') return false;
      if (filter === 'failed' && order.paymentStatus !== 'failed') return false;
      if (filter === 'cancelled' && order.orderStatus !== 'cancelled') return false;
      if (filter === 'refunded' && order.paymentStatus !== 'refunded') return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const orderNumber = order.orderNumber || `ELG-${order._id.slice(-8).toUpperCase()}`;
      return (
        orderNumber.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query)) ||
        order.finalAmount.toString().includes(query)
      );
    }

    return true;
  });

  return (
    <ProtectedContent message="Sign in to view your orders">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header with Gradient Accent */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  My Orders
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage and track your purchases</p>
              </div>
            </div>
          </div>

          {/* Modern Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Filters with Pills Design */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <Filter className="h-4 w-4" />
                  <span>Filter:</span>
                </div>
                {['all', 'paid', 'pending', 'failed', 'cancelled', 'refunded'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                      filter === filterOption
                        ? 'bg-gold-500 text-white shadow-md shadow-gold-500/30'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>

              {/* Modern Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order number or product..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Loading your orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery || filter !== 'all' ? 'No orders found' : 'No orders yet'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your filters or search query to find what you\'re looking for'
                  : 'Start exploring our collection and place your first order'}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-xl font-medium text-sm hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/30 hover:shadow-xl"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse Products
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, index) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    index={index}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </ProtectedContent>
  );
};

export default Orders;
