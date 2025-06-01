
// make router
import express from "express";
import { addProduct, deleteProduct, getAllProducts, getProductById, updateProduct, productSeed } from "./product.controller.js";
import { authenticateToken } from "../middlewares/private/authenticate.js";
import Product from "./product.model.js";


const router = express.Router();


// Products route
router.get("/products", getAllProducts);
router.post("/product/create",authenticateToken, addProduct);
router.get("/product/:id", getProductById);
router.put("/product/:id",authenticateToken, updateProduct); 
router.delete("/product/:id",authenticateToken, deleteProduct);
router.get("/products-seed", productSeed);

export default router;