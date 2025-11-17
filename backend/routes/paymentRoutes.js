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

// Admin routes (require authentication)
router.get('/admin/orders', authenticateMainAdmin, paymentController.getAllOrders);
router.get('/admin/statistics', authenticateMainAdmin, paymentController.getOrderStatistics);
router.put('/admin/orders/:id/status', authenticateMainAdmin, paymentController.updateOrderStatus);
router.post('/admin/orders/:id/refund', authenticateMainAdmin, paymentController.processRefund);

export default router;
