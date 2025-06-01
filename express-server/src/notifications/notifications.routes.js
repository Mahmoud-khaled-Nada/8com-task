
import express from "express";
import { getNotifications, markAllAsRead , markAsRead, deleteNotification, getNotificationsAsAdmin} from "./notifications.controller.js";
import { authenticateToken } from "../middlewares/private/authenticate.js";
import Notification from "./notifications.model.js";

const router = express.Router();

router.get("/notifications", authenticateToken, getNotifications)
router.get("/notifications/mark-all-as-read", authenticateToken, markAllAsRead)
router.get("/notifications/mark-as-read/:id", authenticateToken, markAsRead)
//delete
router.delete("/notifications/:id", authenticateToken, deleteNotification)
router.get("/notifications-as-admin", authenticateToken, getNotificationsAsAdmin)


// routes/productRoutes.js (or wherever your route is defined)
router.get("/n", async (req, res) => {
  try {
    const result = await Notification.deleteMany({});

    res.json({
      message: "deleteMany",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error updating products:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;