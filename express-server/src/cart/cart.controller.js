

// create a new cart
import { Cart } from './cart.model.js';

import { catchAsyncError } from "../middlewares/common/catch.async.error.js";
import { Product } from '../product/product.model.js';

import Joi from "joi";
import { Cache } from '../utils/redis.js';
import { logger } from '../utils/logger.js';
import { generateUUID } from '../utils/uuid.js';
import { logAction } from '../audit-log/audit-log.js';

export const addCartSchema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1),
    isActive: Joi.boolean().default(true),
});



export const createCart = catchAsyncError(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ message: "Valid productId and quantity are required." });
    }

    const cartCookieId = req.cookies.cartCookieId || generateUUID();
    await Cache.del(`cart:${cartCookieId}`);

    let existingCart = await Cart.findOne({ cookieId: cartCookieId });
    if (existingCart) {
        logger.info(`Cart already exists: ${cartCookieId}`);
        const updatedCart = await updateCart(cartCookieId, { productId, quantity }, res);
        return res.status(200).json(updatedCart);
    }

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found." });
    }

    const enrichedProduct = {
        productId: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        description: product.description,
        categoryId: product.categoryId,
        stockQuantity: product.stockQuantity,
        onSale: product.onSale,
        salePrice: product.salePrice,
        quantity,
        price: product.onSale ? product.salePrice : product.price,
    };

    const subtotal = enrichedProduct.price * enrichedProduct.quantity;
    const tax = subtotal * 0.12;
    const shipping = subtotal * 0.05;
    const total = subtotal + tax + shipping;

    const cart = await Cart.create({
        userId: req?.user?._id || null,
        cookieId: cartCookieId,
        products: [enrichedProduct],
        totalPrice: parseFloat(total.toFixed(2)),
        totalQuantity: enrichedProduct.quantity,
        txt: `Subtotal: $${subtotal.toFixed(2)}, Tax: $${tax.toFixed(2)}, Shipping: $${shipping.toFixed(2)}, Total: $${total.toFixed(2)}`,
        isActive: true,
    });

    logger.info(`Created cart for cookie: ${cart.cookieId}`);



    await logAction({
        userId: cartCookieId,
        action: "CREATE_CART",
        metadata: { cartCookieId, name: enrichedProduct.name },
        ipAddress: req.ip,
    });

    res.cookie("cartCookieId", cart.cookieId, {
        httpOnly: true,
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "Lax",
    });

    return res.status(201).json(cart);
});



export const getCart = catchAsyncError(async (req, res) => {
    const cartCookieId = req.cookies.cartCookieId;
    let cart = null;

    const cached = await Cache.get(`cart:${cartCookieId}`);
    if (cached) return res.status(200).json(JSON.parse(cached));

    if (req.user) {
        cart = await Cart.findOne({ userId: req.user._id });
    }

    if (!cart && cartCookieId) {
        cart = await Cart.findOne({ cookieId: cartCookieId });
    }


    if (!cart) return res.status(200).json({
        success: true,
        message: "Cart retrieved successfully.",
        data: [],
    });
    // if (!cart) return res.status(404).json({ message: "Cart not found." });

    await Cache.set(`cart:${cartCookieId}`, JSON.stringify(cart), "EX", 86400);

    return res.status(200).json({
        success: true,
        message: "Cart retrieved successfully.",
        data: cart,
    });
});



export const updateCart = async (cartCookieId, data, res) => {
    const { productId, quantity } = data;

    if (!productId || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ message: "Valid productId and quantity are required." });
    }

    const cart = await Cart.findOne({ cookieId: cartCookieId });
    if (!cart) return res.status(404).json({ message: "Cart not found." });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const enrichedProduct = {
        productId: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        description: product.description,
        categoryId: product.categoryId,
        stockQuantity: product.stockQuantity,
        onSale: product.onSale,
        salePrice: product.salePrice,
        quantity,
        price: product.onSale ? product.salePrice : product.price,
    };

    const index = cart.products.findIndex(p => p.productId.toString() === productId);
    if (index >= 0) {
        const existing = cart.products[index];
        existing.quantity = Math.max(1, existing.quantity + quantity);
        Object.assign(existing, enrichedProduct);
        cart.products[index] = existing;
    } else {
        cart.products.push(enrichedProduct);
    }

    const subtotal = cart.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const totalQuantity = cart.products.reduce((sum, p) => sum + p.quantity, 0);
    const tax = subtotal * 0.12;
    const shipping = subtotal * 0.05;
    const total = subtotal + tax + shipping;

    cart.totalPrice = parseFloat(total.toFixed(2));
    cart.totalQuantity = totalQuantity;
    cart.txt = `Subtotal: $${subtotal.toFixed(2)}, Tax: $${tax.toFixed(2)}, Shipping: $${shipping.toFixed(2)}, Total: $${total.toFixed(2)}`;

    await cart.save();


    await logAction({
        userId: cartCookieId,
        action: "UPDATE_CART",
        metadata: { cartCookieId, name: enrichedProduct.name },
        ipAddress: req.ip,
    });

    res.cookie("cartCookieId", cart.cookieId, {
        httpOnly: true,
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "Lax",
    });

    await Cache.set(`cart:${cartCookieId}`, JSON.stringify(cart), "EX", 86400);
    return cart;
};



export const updateQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cartId = req.cookies.cartCookieId || req.params.cartId;

        if (!cartId) return res.status(400).json({ message: "Cart ID is required." });
        if (!productId || typeof quantity !== "number") return res.status(400).json({ message: "Invalid input." });
        if (quantity === 0) return res.status(400).json({ message: "Quantity cannot be zero." });

        let cart = await Cart.findOne({ cookieId: cartId });
        if (!cart) {
            cart = new Cart({ userId: req.user?._id || null, cookieId: cartId, products: [] });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found." });

        const index = cart.products.findIndex(p => p.productId.toString() === productId);
        if (index >= 0) {
            cart.products[index].quantity = quantity;
            if (quantity <= 0) cart.products.splice(index, 1);
        } else {
            cart.products.push({ productId, quantity, price: product.price });
        }

        await recalculateCart(cart);
        await cart.save();
        await Cache.del(`cart:${cartId}`);

        await logAction({
            userId: cartCookieId,
            action: "UPDATE_CART",
            metadata: { cartCookieId, name: product.name },
            ipAddress: req.ip,
        });

        return res.status(200).json(cart);
    } catch (error) {
        logger.error("Error updating cart quantity:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


export const removeFromCart = catchAsyncError(async (req, res) => {
    const { productId } = req.body;
    const cartId = req.cookies.cartCookieId;

    if (!cartId) return res.status(400).json({ message: "Cart ID is required." });
    if (!productId) return res.status(400).json({ message: "Product ID is required." });

    let cart = await Cart.findOne({ cookieId: cartId });
    if (!cart) return res.status(404).json({ message: "Cart not found." });

    const index = cart.products.findIndex(p => p.productId.toString() === productId);
    if (index < 0) return res.status(404).json({ message: "Product not found in cart." });

    cart.products.splice(index, 1);
    await recalculateCart(cart);
    await cart.save();

    await Cache.del(`cart:${cartId}`);
    return res.status(200).json(cart);
}
);



export const emptyCart = catchAsyncError(async (req, res) => {
    const cartId = req.cookies.cartCookieId;

    const cart = await Cart.findOneAndUpdate(
        { cookieId: cartId },
        { products: [], totalPrice: 0, totalQuantity: 0, txt: "", isActive: true },
        { new: true }
    );

    await Cache.del(`cart:${cartId}`);
    res.clearCookie("cartCookieId");

    if (!cart) return res.status(404).json({ message: "Cart not found." });

    return res.status(200).json(cart);
});



// totalPrice
export const getTotalPrice = catchAsyncError(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
        return res.status(404).json({ message: "Cart not found." });
    }
    res.status(200).json({ totalPrice: cart.totalPrice });
});



const recalculateCart = async (cart) => {
    const subtotal = cart.products.reduce((sum, p) => sum + ((p.price || 0) * p.quantity), 0);
    const totalQuantity = cart.products.reduce((sum, p) => sum + p.quantity, 0);
    const tax = subtotal * 0.12;
    const shipping = subtotal * 0.05;
    const total = subtotal + tax + shipping;

    cart.totalPrice = parseFloat(total.toFixed(2));
    cart.totalQuantity = totalQuantity;
    cart.txt = `Subtotal: $${subtotal.toFixed(2)}, Tax: $${tax.toFixed(2)}, Shipping: $${shipping.toFixed(2)}, Total: $${total.toFixed(2)}`;
    await cart.save();
};
