import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Loader, MessageCircle } from 'lucide-react';

interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  orderId,
  orderNumber,
  onClose,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919896076856';

  const predefinedReasons = [
    'Ordered by mistake',
    'Found cheaper elsewhere',
    'Delivery taking too long',
    'Changed my mind',
    'Other'
  ];

  const handleContactWhatsApp = () => {
    const message = `Hello! I have a query about my order before cancelling.

Order Number: ${orderNumber}

I would like to discuss my order before proceeding with cancellation.`;
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCancel = async () => {
    // Validate that a reason is selected
    if (!reason) {
      setError('Please select a cancellation reason');
      return;
    }

    // If "Other" is selected, custom reason must be provided
    if (reason === 'Other' && !customReason.trim()) {
      setError('Please specify your reason for cancellation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/payment/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reason: reason === 'Other' ? 'Other' : reason,
          customReason: reason === 'Other' ? customReason : '',
          cancelledBy: 'customer'
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        console.error('Cancel order failed:', data);
        setError(data.message || 'Failed to cancel order. Please try again.');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      setError('Failed to cancel order. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200 dark:border-red-700 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Cancel Order</h2>
                  <p className="text-red-100 text-sm">{orderNumber}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Need Help Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                    Need help before cancelling?
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                    Talk to us on WhatsApp! We can help resolve any issues or answer questions about your order.
                  </p>
                  <button
                    onClick={handleContactWhatsApp}
                    type="button"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact Us on WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Once you cancel this order, you cannot undo this action. If payment was made, a refund will be processed within 5-7 business days.
              </p>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Why are you cancelling this order? <span className="text-red-500">*</span>
              </label>
              
              <div className="space-y-2 mb-4">
                {predefinedReasons.map((predefinedReason) => (
                  <button
                    key={predefinedReason}
                    type="button"
                    onClick={() => {
                      setReason(predefinedReason);
                      if (predefinedReason !== 'Other') {
                        setCustomReason('');
                      }
                      setError('');
                    }}
                    className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                      reason === predefinedReason
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-600'
                    }`}
                  >
                    {predefinedReason}
                  </button>
                ))}
              </div>

              {/* Custom Reason Input */}
              {reason === 'Other' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Please specify your reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your reason for cancellation..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
              <button
                onClick={handleCancel}
                disabled={loading || !reason || (reason === 'Other' && !customReason.trim())}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CancelOrderModal;
