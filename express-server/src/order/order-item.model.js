// import mongoose from 'mongoose';

// const Schema = mongoose.Schema;

// const orderItemSchema = new Schema(
//     {
//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: true,
//             ref: 'User'
//         },
//         items: [
//             {
//                 productId: {
//                     type: mongoose.Schema.Types.ObjectId,
//                     required: true,
//                     ref: 'Product'
//                 },
//                 name: {
//                     type: String,
//                     required: true
//                 },
//                 quantity: {
//                     type: Number,
//                     required: true,
//                     min: 1
//                 },
//                 price: {
//                     type: Number,
//                     required: true,
//                     min: 0
//                 }
//             }
//         ],
//         shippingAddress: {
//             fullName: { type: String, required: true },
//             email: { type: String, required: true },
//             addressLine: { type: String, required: true },
//             city: { type: String, required: true },
//             postalCode: { type: String, required: true },
//         },
//         totalAmount: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         paymentStatus: {
//             type: String,
//             enum: ['Pending', 'Paid', 'Failed'],
//             default: 'Pending'
//         },
//         orderStatus: {
//             type: String,
//             enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
//             default: 'Pending'
//         },
//         isPaid: {
//             type: Boolean,
//             default: false
//         },
//         paidAt: {
//             type: Date
//         },
//         deliveredAt: {
//             type: Date
//         }
//     },
//     { timestamps: true }
// );


// const orderItem = mongoose.model('OrderItem', orderItemSchema);
// export { orderItem };
// export default orderItem;
