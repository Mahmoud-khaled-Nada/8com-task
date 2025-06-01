
import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getUserOrders,
  getFilteredOrders,
} from './order.controller.js';

import { createCheckoutSession, confirmOrder } from '../checkout/checkout.session.js';
import { authenticateToken, isAdmin } from '../middlewares/private/authenticate.js';

const router = express.Router();


// User routes
router.post('/order/create', authenticateToken, createOrder);
router.get('/user/orders', authenticateToken, getUserOrders);
router.get('/orders/filtered', authenticateToken, getFilteredOrders); // ?paymentStatus=Paid &&  ?status=Cancelled
router.get('/order/:id', authenticateToken, getOrderById);
router.put('/order/:id', authenticateToken, updateOrder);
router.delete('/order/:id', authenticateToken, deleteOrder);

// Admin only routes
router.get('/orders', isAdmin, getAllOrders);

router.post('/checkout/create-session', createCheckoutSession);
// Public routes (if any)
router.post('/order/confirm/:sessionId', authenticateToken ,confirmOrder);

export default router;
