import React from 'react';
import { CheckCircle, Circle, Package, Truck, Home, XCircle, Clock } from 'lucide-react';

interface OrderTrackingTimelineProps {
  orderStatus: string;
  createdAt: string;
  updatedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  orderStatus,
  createdAt,
  updatedAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
}) => {
  const statuses = [
    {
      key: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: Package,
      date: createdAt,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      description: 'Order confirmed and being prepared',
      icon: CheckCircle,
      date: orderStatus !== 'pending' ? (updatedAt || createdAt) : null,
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Your order is being packed',
      icon: Package,
      date: ['processing', 'shipped', 'delivered'].includes(orderStatus) ? (updatedAt || createdAt) : null,
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'Your order is on the way',
      icon: Truck,
      date: shippedAt || (['shipped', 'delivered'].includes(orderStatus) ? (updatedAt || createdAt) : null),
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Order delivered successfully',
      icon: Home,
      date: deliveredAt || (orderStatus === 'delivered' ? (updatedAt || createdAt) : null),
    },
  ];

  // Handle cancelled status
  if (orderStatus === 'cancelled') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Order Status
        </h3>
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-900 dark:text-red-100">Order Cancelled</h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              {cancelledAt
                ? `Cancelled on ${new Date(cancelledAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'Your order has been cancelled'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentStatusIndex = () => {
    const statusMap: { [key: string]: number } = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
    };
    return statusMap[orderStatus] || 0;
  };

  const currentIndex = getCurrentStatusIndex();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Order Tracking
      </h3>

      <div className="relative">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = status.icon;

          return (
            <div
              key={status.key}
              className="relative flex gap-3 pb-6 last:pb-0"
            >
              {/* Vertical Line */}
              {index < statuses.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700">
                  {isCompleted && (
                    <div className="w-full bg-[#D4AF37]" style={{ height: '100%' }} />
                  )}
                </div>
              )}

              {/* Icon Circle */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-[#D4AF37] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <Icon className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {status.label}
                    </h4>
                    {status.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(status.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium rounded">
                      Current
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated Delivery */}
      {orderStatus !== 'delivered' && orderStatus !== 'cancelled' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {orderStatus === 'shipped'
                  ? 'Expected within 2-3 business days'
                  : 'We\'ll update you once your order ships'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingTimeline;
