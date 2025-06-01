


// make router
import express from "express";
import { productSeed } from "../product/product.controller.js";
import { userSeed } from "../users/user.controller.js";

const router = express.Router();


router.get("/", async (req, res) => {
    await productSeed();

    await userSeed();

    res.status(200).json({
        success: true,
        message: "Database seeded successfully",
    });

});



export default router;