// src/socket/io.js
import { Server } from "socket.io";
import cookie from "cookie";
import { verifyToken } from "../utils/jwt.js";
import { emitter } from "../utils/emitter.js";
import { logger } from "../utils/logger.js";
import {
    setUserSocket,
    removeUserSocket,
    getUserSocket,
    broadcastToAll,
    getConnectedUsers,
    getAllSockets,
} from "./sessionManager.js";

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true,
        },
    });

    // Authentication Middleware
    io.use((socket, next) => {
        try {
            const cookies = socket.handshake.headers.cookie || "";
            const { token } = cookie.parse(cookies);

            if (!token) throw new Error("No token provided");

            const user = verifyToken(token, process.env.JWT_SECRET);
            socket.user = user;

            next();
        } catch (error) {
            next(new Error("Authentication failed"));
        }
    });

    // Socket connection
    io.on("connection", (socket) => {
        const { id: userId, email } = socket.user;

        console.log(`✅ User connected: ${email}`);
        setUserSocket(userId, socket);
        socket.join(`user_${userId}`);

        socket.emit("connected", {
            message: "Connected successfully",
            user: socket.user,
        });

        // Private message
        socket.on("private_message", ({ targetUserId, message }) => {
            const targetSocket = getUserSocket(targetUserId);
            if (targetSocket) {
                targetSocket.emit("private_message", {
                    from: socket.user,
                    message,
                    timestamp: new Date(),
                });
                socket.emit("message_sent", { success: true });
            } else {
                socket.emit("error", { message: "User not online" });
            }
        });

        // Room handling
        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            socket.emit("room_joined", { roomId });
        });

        socket.on("leave_room", (roomId) => {
            socket.leave(roomId);
            socket.emit("room_left", { roomId });
        });

        socket.on("room_message", ({ roomId, message }) => {
            socket.to(roomId).emit("room_message", {
                from: socket.user,
                message,
                timestamp: new Date(),
            });
        });

        // Disconnect handling
        socket.on("disconnect", () => {
            removeUserSocket(userId);
            console.log(`❌ User disconnected: ${email}`);
        });
    });

    logger.info("✅ WebSocket initialized");

    // Handle external events
    emitter.on("test.sockert", (payload) => {
        broadcastToAll("testMessage", payload);
    });


    emitter.on("notification.onsale", (payload) => {
        logger.info("notification.onsale");

        const sockets = getAllSockets();
        sockets.forEach((socket) => {
            logger.info(socket.user);
            if (socket.user?.role !== "admin") {
                socket.emit("notificationOnSale", payload);
            }
        });
    });


    emitter.on("admin.notification.create.checkout", (payload) => {
        logger.info("admin.notification.create.checkout");

        const sockets = getAllSockets();
        sockets.forEach((socket) => {
            logger.info(socket.user);
            if (socket.user?.role === "admin") {
                socket.emit("adminNotificationCreateCheckout", payload);
            }
        });
    });

    //


    
    emitter.on("admin.notification.confirm.order", (payload) => {
        logger.info("admin.notification.confirm.order");

        const sockets = getAllSockets();
        sockets.forEach((socket) => {
            logger.info(socket.user);
            if (socket.user?.role === "admin") {
                socket.emit("adminNotificationConfirmOrder", payload);
            }
        });
    });


    return io;
};









