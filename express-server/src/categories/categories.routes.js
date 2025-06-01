
import express from "express";
import { getAllCategories, getCategoryById } from "./categories.model.js";

const router = express.Router();


// categories route
router.get("/categories", getAllCategories);
router.get("/category/:id", getCategoryById);

export default router;