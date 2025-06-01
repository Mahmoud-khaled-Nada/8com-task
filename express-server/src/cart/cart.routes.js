// cart.routes.js
import express from "express";
import {
    createCart,
    emptyCart,
    getCart,
    getTotalPrice,
    removeFromCart,
    updateQuantity
} from "./cart.controller.js";

const router = express.Router();

router.post("/carts", createCart);
router.get("/carts", getCart);
router.post("/carts/empty", emptyCart);
router.get("/carts/total-price", getTotalPrice);
router.post("/carts/update-quantity", updateQuantity);
router.post("/carts/remove-from-cart", removeFromCart);


export default router;
