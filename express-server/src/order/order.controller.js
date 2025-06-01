// BUGS IDENTIFIED AND FIXED:

import { catchAsyncError } from "../middlewares/common/catch.async.error.js";
import { createOrderSchema, updateOrderSchema } from './order.validation.js';
import { Order } from './order.model.js';
import Product from "../product/product.model.js";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createOrder = catchAsyncError(async (req, res) => {
    try {
        const { error, value: orderData } = createOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const validatedItems = [];
        let calculatedTotal = 0;

        for (const item of orderData.items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
            }

            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product "${product.name}". Requested: ${item.quantity}, Available: ${product.stockQuantity}`
                });
            }

            // Append validated product with safe data
            validatedItems.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });

            calculatedTotal += product.price * item.quantity;
        }

        // Optional: compare calculated total with submitted totalAmount
        if (calculatedTotal !== orderData.totalAmount) {
            return res.status(400).json({
                success: false,
                message: `Total amount mismatch. Expected: ${calculatedTotal}, Received: ${orderData.totalAmount}`
            });
        }

        const newOrder = await Order.create({
            userId: req.user.id,
            items: validatedItems,
            shippingAddress: orderData.shippingAddress,
            totalAmount: calculatedTotal,
            paymentStatus: orderData.paymentStatus || 'Pending',
            orderStatus: orderData.orderStatus || 'Pending'
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: newOrder
        });
    } catch (err) {
        console.error('🚨 Error creating order:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


export const getAllOrders = catchAsyncError(async (req, res) => {
    try {
        console.log('🚨 getAllOrders called by user:', req.user)
        
        // Check if user is admin
        console.log('🚨 User role:', req.user.role);
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
        }

        // FIXED: Remove userId filter to get ALL orders for admin
        const orders = await Order.find({}).populate('items.productId', 'name price');
        
        res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        console.error('🚨 Error fetching orders:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


export const getOrderById = catchAsyncError(async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.productId', 'name price');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // SECURITY FIX: Check if user owns the order or is admin
        if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        
        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        console.error('🚨 Error fetching order:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export const updateOrder = catchAsyncError(async (req, res) => {
    try {
        const { error, value: orderData } = updateOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // SECURITY FIX: Check ownership before updating
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (existingOrder.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { ...orderData },
            { new: true }
        ).populate('items.productId', 'name price');

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            order: updatedOrder
        });
    } catch (err) {
        console.error('🚨 Error updating order:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


export const deleteOrder = catchAsyncError(async (req, res) => {
    try {
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (existingOrder.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await Order.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (err) {
        console.error('🚨 Error deleting order:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export const getUserOrders = catchAsyncError(async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        console.error('🚨 Error fetching all orders for authenticated user:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export const getFilteredOrders = catchAsyncError(async (req, res) => {
    const { status, paymentStatus } = req.query;

    const filter = { userId: req.user.id };

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter).populate('items.productId', 'name price');

    res.status(200).json({
        success: true,
        orders
    });
});

