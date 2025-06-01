
import Joi from 'joi';
import { Product } from './product.model.js';
import { categoryById, categoryByName, getCategoryById } from '../categories/categories.model.js';
import { initialProducts } from './product.fake.js';
import { logger } from '../utils/logger.js';
import { createNotification } from '../notifications/notifications.controller.js';
import { emitter } from "../utils/emitter.js";


const addProductSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(10).max(1000).trim().required(),
    price: Joi.number().min(0).required(),
    imageUrl: Joi.string().uri().required(),
    category: Joi.string().required(),
    stockQuantity: Joi.number().integer().min(0).default(0),
    onSale: Joi.boolean().default(false),
    salePrice: Joi.number().min(0).when('onSale', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden()
    })
});


export const updateProductSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    description: Joi.string().min(10).max(1000).trim(),
    price: Joi.number().min(0),
    imageUrl: Joi.string().uri(),
    category: Joi.string(),
    stockQuantity: Joi.number().integer().min(0),
    onSale: Joi.boolean().default(false),
    salePrice: Joi.number().min(0).when('onSale', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden()
    })
}).min(1);


export const addProduct = async (req, res) => {
    try {
        const { error, value: productData } = addProductSchema.validate(req.body);

        if (error)
            return res.status(400).json({ success: false, message: error.details[0].message });

        const category = categoryByName(productData.category).id;
        if (!category)
            return res.status(404).json({ success: false, message: "Category not found" });

        productData.categoryId = category;

        const newProduct = await Product.create(productData);

        if (!newProduct) {
            return res.status(500).json({ success: false, message: "Failed to create product" });
        }
        logger.info(`Product with ID ${newProduct._id} add successfully`);

        if (newProduct.onSale) {
            const notification = {
                title: "Big Sale Today!",
                message: `Check out our new product on sale: ${newProduct.name} for just $${newProduct.salePrice}!`,
                sender: req.user.id,
                isGlobal: true,
                type: "info",
            }
            emitter.emit("notification.onsale", notification);
            await createNotification(notification);
        }


        res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: newProduct
        });

    } catch (err) {
        console.error("🚨 Error adding product:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const search = req.query.search?.toString().toLowerCase() || "";
        const categoryFilter = req.query.category?.toString() || "";

        logger.info(`Category: ${categoryFilter}`);

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (categoryFilter && categoryFilter !== "All") {
            const category = categoryByName(categoryFilter);
            query.categoryId = category ? category.id : null;
        }

        logger.info(`Query: ${JSON.stringify(query)}`);

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .where({
                stockQuantity: { $gt: 0 }
            })
            .skip(skip).limit(limit);

        const enhancedProducts = await Promise.all(
            products.map(async (product) => {
                const category = categoryById(product.categoryId);
                return {
                    ...product.toObject(),
                    category: category?.name || "Unknown",
                };
            })
        );

        res.status(200).json({
            data: enhancedProducts,
            page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// get product by id
export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// update product

export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const productData = req.body;

        // ✅ Validate input before updating
        const { error, value: validatedData } = updateProductSchema.validate(productData);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Optional: validate categoryId
        if (validatedData.category) {
            const category = categoryByName(validatedData.category).id;
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, validatedData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        logger.info(`Product with ID ${productId} updated successfully`);

        if (updatedProduct.onSale) {
             const notification = {
                title: "Big Sale Today!",
                message: `Check out our new product on sale: ${updatedProduct.name} for just $${updatedProduct.salePrice}!`,
                sender: req.user.id,
                isGlobal: true,
                type: "info",
            }
            emitter.emit("notification.onsale", notification);
            await createNotification(notification);
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error) {
        console.error("🚨 Error updating product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// delete product    
export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        logger.info(`Product with ID ${productId} deleted successfully`);
        // Optionally, you can also delete the product from the cache if you're using one
        res.status(200).json({
            message: "Product deleted successfully",
            success: true,
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const productSeed = async (req, res) => {
    try {

        // Clear and insert fresh data
        await Product.deleteMany({});
        await Product.insertMany(initialProducts);


        return true;
    } catch (err) {
        console.error("Error seeding products:", err);

        return res.status(500).json({
            success: false,
            message: "Error seeding products",
            error: err instanceof Error ? err.message : String(err),
        });
    }
};