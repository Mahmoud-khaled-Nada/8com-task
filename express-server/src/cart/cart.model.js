import mongoose from "mongoose";
import { generateUUID } from "../utils/uuid.js";

const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cookieId: {
      type: String,
      required: true,
      default: generateUUID,
      index: true,
      sparse: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        description: { type: String },
        imageUrl: { type: String },
        categoryId: { type: String },
        stockQuantity: { type: Number, default: 0 },
        onSale: { type: Boolean, default: false },
        salePrice: { type: Number },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    txt: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: index for faster lookup
cartSchema.index({ userId: 1, cookieId: 1 }, { unique: true, sparse: true });

// Auto-generate cookieId if missing
cartSchema.pre("save", function (next) {
  if (!this.cookieId) {
    this.cookieId = generateUUID();
  }
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export { Cart };
export default Cart;
