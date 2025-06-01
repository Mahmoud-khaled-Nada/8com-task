
import express from "express";

const router = express.Router();

import { register, getUsers, updateUserProfile } from "./user.controller.js";
import { authenticateToken } from "../middlewares/private/authenticate.js";

// Register route
router.get("/", getUsers);
router.post("/register", register);
router.post("/update-user-profile", authenticateToken ,updateUserProfile)


export default router;