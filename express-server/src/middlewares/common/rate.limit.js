import rateLimit from "express-rate-limit"

export const privateRouteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});


export const createCustomLimiter = (max, window) => {
    // Parse window like "1m", "30s"
    const match = window.match(/^(\d+)([smh])$/); // s=sec, m=min, h=hr
    const unit = { s: 1000, m: 60_000, h: 3_600_000 };

    const durationMs = match ? parseInt(match[1]) * unit[match[2]] : 60_000;

    return rateLimit({
        windowMs: durationMs,
        max,
        message: {
            success: false,
            message: "Too many requests. Please try again later.",
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

