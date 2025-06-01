
import express from "express";

const router = express.Router();

import { login, refreshToken, logout, me } from "./auth.controller.js";
import { authenticateToken } from "../middlewares/private/authenticate.js";

// Register route
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get('/me', authenticateToken, me);
router.post("/logout", logout);



export default router;