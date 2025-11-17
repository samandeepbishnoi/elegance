import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Package,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  RefreshCw,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  productDiscount?: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  pincode: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  productDiscount: number;
  finalAmount: number;
  paymentStatus: 'pending' | 'success' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRefunds: number;
  refundedAmount: number;
  refundedOrders: number;
  totalProductDiscount: number;
  totalCouponDiscount: number;
  totalSavingsGiven: number;
  todayOrders?: number;
  monthlyRevenue?: number;
}

const AdminOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  const token = localStorage.getItem('adminToken');

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/payment/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/payment/admin/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      setStatistics(data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, []);

  // Filter and search orders
  useEffect(() => {
    let filtered = [...orders];

    // Search filter - more robust with null/undefined checks
    if (searchTerm && searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        const orderNumber = order.orderNumber?.toLowerCase() || '';
        const customerName = order.customerName?.toLowerCase() || '';
        const customerEmail = order.customerEmail?.toLowerCase() || '';
        const paymentId = order.razorpayPaymentId?.toLowerCase() || '';
        const orderId = order.razorpayOrderId?.toLowerCase() || '';
        const phone = order.customerPhone?.toLowerCase() || '';
        
        return (
          orderNumber.includes(search) ||
          customerName.includes(search) ||
          customerEmail.includes(search) ||
          paymentId.includes(search) ||
          orderId.includes(search) ||
          phone.includes(search)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate >= yesterday && orderDate < today;
          }
          case 'last7days': {
            const last7Days = new Date(today);
            last7Days.setDate(last7Days.getDate() - 7);
            return orderDate >= last7Days;
          }
          case 'last30days': {
            const last30Days = new Date(today);
            last30Days.setDate(last30Days.getDate() - 30);
            return orderDate >= last30Days;
          }
          case 'thisMonth': {
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return orderDate >= firstDayOfMonth;
          }
          case 'lastMonth': {
            const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return orderDate >= firstDayOfLastMonth && orderDate < firstDayOfThisMonth;
          }
          case 'custom':
            if (customStartDate && customEndDate) {
              const startDate = new Date(customStartDate);
              const endDate = new Date(customEndDate);
              endDate.setHours(23, 59, 59, 999); // Include the entire end date
              return orderDate >= startDate && orderDate <= endDate;
            }
            return true;
          default:
            return true;
        }
      });
    }

    console.log('Search term:', searchTerm);
    console.log('Orders count:', orders.length);
    console.log('Filtered count:', filtered.length);
    
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, customStartDate, customEndDate, orders]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`${backendUrl}/api/payment/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      await response.json();
      
      // Update local state
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, orderStatus: newStatus as Order['orderStatus'] } : order))
      );
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as Order['orderStatus'] });
      }

      toast.success('Order status updated successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Initiate refund
  const initiateRefund = async (orderId: string) => {
    if (!confirm('Are you sure you want to initiate a refund for this order?')) return;

    try {
      const response = await fetch(`${backendUrl}/api/payment/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to initiate refund');

      await response.json();
      toast.success('Refund initiated successfully!', {
        duration: 3000,
        position: 'top-center',
      });
      fetchOrders();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error initiating refund:', error);
      toast.error(error.message || 'Failed to initiate refund', {
        duration: 4000,
        position: 'top-center',
      });
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string; type: 'order' | 'payment' }> = ({ status, type }) => {
    const getColors = () => {
      if (type === 'order') {
        switch (status) {
          case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
          case 'confirmed':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
          case 'processing':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
          case 'shipped':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
          case 'delivered':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
          case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
      } else {
        switch (status) {
          case 'success':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
          case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
          case 'failed':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
          case 'refunded':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
      }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColors()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Manage and track all customer orders
          </p>
        </div>
        <button
          onClick={() => {
            fetchOrders();
            fetchStatistics();
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#D4AF37] text-white rounded-lg hover:bg-[#C5A028] transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Total Orders</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {statistics.totalOrders}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingBag className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  ₹{statistics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Pending Orders</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {statistics.pendingOrders}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Delivered</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {statistics.deliveredOrders}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by order number, name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
          </div>

          {/* Order Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent appearance-none"
            >
              <option value="all">All Order Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent appearance-none"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#D4AF37]">
                        {order.orderNumber || `ELG-${order._id.slice(-8).toUpperCase()}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₹{order.finalAmount.toLocaleString()}
                      </p>
                      {(order.couponDiscount > 0 || order.productDiscount > 0) && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Saved ₹{(order.couponDiscount + order.productDiscount).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.orderStatus} type="order" />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetail(true);
                        }}
                        className="flex items-center gap-2 text-[#D4AF37] hover:text-[#C5A028] font-medium"
                      >
                        <Eye size={18} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showOrderDetail && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowOrderDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full my-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order Details
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-lg font-semibold text-[#D4AF37]">
                      {selectedOrder.orderNumber || `ELG-${selectedOrder._id.slice(-8).toUpperCase()}`}
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      •
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOrderDetail(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle size={24} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Status Update Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Update Order Status
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder._id, status)}
                          disabled={updatingStatus || selectedOrder.orderStatus === status}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedOrder.orderStatus === status
                              ? 'bg-[#D4AF37] text-white cursor-not-allowed'
                              : 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-[#D4AF37] hover:text-white'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedOrder.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedOrder.customerEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedOrder.customerPhone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedOrder.address}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          PIN: {selectedOrder.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                      <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
                    </div>
                    {selectedOrder.razorpayPaymentId && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID</p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                          {selectedOrder.razorpayPaymentId}
                        </p>
                      </div>
                    )}
                    {selectedOrder.razorpayOrderId && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Razorpay Order ID</p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                          {selectedOrder.razorpayOrderId}
                        </p>
                      </div>
                    )}
                    {selectedOrder.refundId && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Refund ID</p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                          {selectedOrder.refundId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancellation Information (if order is cancelled) */}
                {selectedOrder.orderStatus === 'cancelled' && selectedOrder.cancellationReason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                      <XCircle size={20} className="text-red-600 dark:text-red-400" />
                      Cancellation Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                          Cancellation Reason
                        </p>
                        <p className="text-red-900 dark:text-red-100 bg-white dark:bg-red-900/30 px-3 py-2 rounded-lg">
                          {selectedOrder.cancellationReason}
                        </p>
                      </div>
                      {selectedOrder.cancelledAt && (
                        <div>
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                            Cancelled On
                          </p>
                          <p className="text-red-900 dark:text-red-100">
                            {new Date(selectedOrder.cancelledAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </p>
                        </div>
                      )}
                      <div className="pt-2 border-t border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-300 italic">
                          Status: Cancelled by Customer
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Package size={20} />
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Price Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{selectedOrder.subtotal.toLocaleString()}
                      </span>
                    </div>
                    {selectedOrder.productDiscount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Product Discount</span>
                        <span>-₹{selectedOrder.productDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Coupon Discount ({selectedOrder.couponCode})</span>
                        <span>-₹{selectedOrder.couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Final Amount
                      </span>
                      <span className="font-bold text-[#D4AF37] text-lg">
                        ₹{selectedOrder.finalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refund Section */}
                {selectedOrder.paymentStatus === 'success' &&
                  selectedOrder.orderStatus !== 'cancelled' &&
                  selectedOrder.orderStatus !== 'delivered' && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertCircle size={20} className="text-orange-600" />
                            Refund Management
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Initiate a refund for this order
                          </p>
                        </div>
                        <button
                          onClick={() => initiateRefund(selectedOrder._id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                          Initiate Refund
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrderManagement;
