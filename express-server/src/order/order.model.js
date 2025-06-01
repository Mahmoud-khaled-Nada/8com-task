// FIXED ORDER MODEL - Removed duplicate orderItem model

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product'
                },
                name: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        shippingAddress: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            addressLine: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending'
        },
        orderStatus: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending'
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paidAt: {
            type: Date
        },
        deliveredAt: {
            type: Date
        },
        // ADDITION: Add stripeSessionId for payment tracking
        stripeSessionId: {
            type: String
        }
    },
    { timestamps: true }
);

// Add indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ stripeSessionId: 1 });

const Order = mongoose.model('Order', orderSchema);
export { Order };
export default Order;