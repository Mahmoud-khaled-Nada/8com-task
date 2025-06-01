import { catchAsyncError } from "../middlewares/common/catch.async.error.js";
import User from "../users/user.model.js";
import Notification from "./notifications.model.js";





export async function createNotification(data, receiver = null) {
    if (data.isGlobal) {
        const allUsers = await User.find({ role: "customer" }, "_id");

        const notifications = allUsers.map((user) => ({
            title: data.title,
            message: data.message,
            sender: data.sender,
            receiver: user._id,
            type: data.type || "info",
            isGlobal: true,
        }));

        await Notification.insertMany(notifications);
        return;
    }

    if (receiver) {

        await Notification.create({
            title: data.title,
            message: data.message,
            sender: data.sender,
            receiver: receiver,
            type: data.type || "info",
            isGlobal: true,
        });
        return;
    }

    await Notification.create({
        title: data.title,
        message: data.message,
        sender: data.sender,
        receiver: data.receiver,
        type: data.type || "info",
    });

}

export async function createAdminNotification(data) {
    const admins = await User.find({
        role: "admin",
    }, "_id");

    const notifications = admins.map((admin) => ({
        title: data.title,
        message: data.message,
        sender: data.sender,
        receiver: admin._id,
        type: data.type || "info",
        isGlobal: false,
    }));

    await Notification.insertMany(notifications);
}

export const getNotifications = catchAsyncError(async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { receiver: req.user._id },
                { isGlobal: true },
            ],
        })
            .populate("sender", "name email avatar")
            .sort({ isRead: 1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});


// Mark all as read
export const markAllAsRead = catchAsyncError(async (req, res) => {
    try {
        await Notification.updateMany({ receiver: req.user.id }, { isRead: true });
        return res.status(200).json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});


// mark one
export const markAsRead = catchAsyncError(async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        return res.status(200).json({ success: true, message: "Notification marked as read." });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// deleteNotification

export const deleteNotification = catchAsyncError(async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: "Notification deleted successfully." });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});


// get getNotificationsAsAdmin


export const getNotificationsAsAdmin = catchAsyncError(async (req, res) => {
    try {
        const currentUserId = req?.user.id;

        const notifications = await Notification.find({ isGlobal: false })
            .populate("sender", "name email avatar role")
            .sort({ isRead: 1, createdAt: -1 });

        const filtered = notifications.filter(
            (n) => n.sender && String(n.sender._id) !== String(currentUserId)
        );

        return res.status(200).json({
            success: true,
            data: filtered,
        });
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
