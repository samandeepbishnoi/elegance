import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticateToken, authenticateMainAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/create-order', paymentController.createOrder);
router.post('/create-cod-order', paymentController.createCODOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/orders/:id/payment-failed', paymentController.markPaymentFailed);

// Customer routes (require customer email)
router.get('/orders', paymentController.getCustomerOrders);
router.get('/orders/:id', paymentController.getOrderById);
router.post('/orders/:id/cancel', paymentController.cancelOrder);

// Admin routes (require authentication - works for all approved admins)
router.get('/admin/orders', authenticateToken, paymentController.getAllOrders);
router.get('/admin/statistics', authenticateToken, paymentController.getOrderStatistics);
router.put('/admin/orders/:id/status', authenticateToken, paymentController.updateOrderStatus);
router.put('/admin/orders/:id/refund-status', authenticateToken, paymentController.updateRefundStatus);
router.post('/admin/orders/:id/refund', authenticateToken, paymentController.processRefund);

export default router;
