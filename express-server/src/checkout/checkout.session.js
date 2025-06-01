import Stripe from "stripe";
import { Product } from "../product/product.model.js";
import { Order } from "../order/order.model.js";
import { catchAsyncError } from "../middlewares/common/catch.async.error.js";
import { createAdminNotification, createNotification } from "../notifications/notifications.controller.js";
import { emitter } from "../utils/emitter.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = catchAsyncError(async (req, res) => {
    try {
        const { items, shippingAddress, userId, totalPrice } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required and cannot be empty'
            });
        }

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required'
            });
        }


        const requiredFields = ['name', 'email', 'addressLine', 'city', 'postalCode'];

        for (const field of requiredFields) {
            if (!shippingAddress[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Shipping address ${field} is required`
                });
            }
        }

        const validatedItems = [];
        const lineItems = [];


        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have productId and valid quantity'
                });
            }

            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }


            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product "${product.name}". Requested: ${item.quantity}, Available: ${product.stockQuantity}`
                });
            }


            validatedItems.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });


            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description || '',
                        images: product.images ? [product.images[0]] : []
                    },
                    unit_amount: Math.round(totalPrice * 100)
                },
                quantity: item.quantity
            });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/order/cancel`,
            metadata: {
                userId: userId,
                orderData: JSON.stringify({
                    items: validatedItems,
                    shippingAddress,
                    totalAmount: totalPrice
                })
            },

            customer_email: shippingAddress.email,
        });


        const pendingOrder = await Order.create({
            userId: userId,
            items: validatedItems,
            shippingAddress,
            totalAmount: totalPrice,
            paymentStatus: 'Pending',
            orderStatus: 'Pending',
            stripeSessionId: session.id
        });

        const notifications = {
            title: "New Order Created",
            message: `Order #${pendingOrder._id} has been created successfully.`,
            sender: userId,
            receiver: userId,
            type: "info"
        };

        createNotification(notifications, userId)

        createAdminNotification(notifications);

        emitter.emit("admin.notification.create.checkout", notifications);

        res.status(200).json({
            success: true,
            sessionId: session.id,
            sessionUrl: session.url,
            orderId: pendingOrder._id
        });

    } catch (error) {
        console.error('🚨 Error creating checkout session:', error);

        // Handle specific Stripe errors
        if (error.type === 'StripeCardError') {
            return res.status(400).json({
                success: false,
                message: 'Payment processing error: ' + error.message
            });
        }

        if (error.type === 'StripeInvalidRequestError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment request: ' + error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create checkout session'
        });
    }
});


export const confirmOrder = catchAsyncError(async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed'
            });
        }

        // Find and update the order
        const order = await Order.findOneAndUpdate(
            { stripeSessionId: session.id },
            {
                paymentStatus: 'Paid',
                orderStatus: 'Processing',
                isPaid: true,
                paidAt: new Date()
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // IMPROVEMENT: Reduce stock quantities after successful payment
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stockQuantity: -item.quantity } },
                { new: true }
            );
        }

        const notifications = {
            title: "Order Confirmed",
            message: `Your order #${order._id} has been confirmed successfully with payment status: ${order.paymentStatus}.`,
            sender: order.userId,
            receiver: order.userId,
            type: "info"
        };


        createNotification(notifications, order.userId)

        createAdminNotification(notifications);

        emitter.emit("admin.notification.confirm.order", notifications);

        res.status(200).json({
            success: true,
            message: 'Order confirmed successfully',
            data: order
        });

    } catch (error) {
        console.error('🚨 Error confirming order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm order'
        });
    }
});
