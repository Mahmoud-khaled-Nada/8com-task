import { ErrorHandler } from "../../helpers/error.handler.js";

export const ErrorMiddleware = (err, req, res, next) => {
    // Ensure err is at least an object
    if (!err || typeof err !== "object") {
        err = new Error("Unknown error");
    }

    // Default values
    err.statusCode = parseInt(err.statusCode) || 500;
    err.message = err.message || "Internal Server Error";

    // Duplicate key error (MongoDB)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        err = new ErrorHandler(`Duplicate value for field: ${field}`, 400);
    }

    // JWT invalid signature
    if (err.name === "JsonWebTokenError") {
        err = new ErrorHandler("Invalid token. Please login again.", 401);
    }

    // JWT expired
    if (err.name === "TokenExpiredError") {
        err = new ErrorHandler("Token has expired. Please login again.", 401);
    }

    res.status(Number.isInteger(err.statusCode) ? err.statusCode : 500).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
