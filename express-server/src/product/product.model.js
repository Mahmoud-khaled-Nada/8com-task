import mongoose from "mongoose";
import { getCategoryById } from "../categories/categories.model.js";

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: {type: Number,required: true,min: [0, 'Price cannot be negative']},
    imageUrl: { type: String, required: true, trim: true },
    categoryId: { type: String, required: true, trim: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number, default: null },
}, {
    timestamps: true,
});

productSchema.methods.getCategory = function () {
    return getCategoryById(this.categoryId);
};

const Product = mongoose.model("Product", productSchema);
export { Product };
export default Product;
