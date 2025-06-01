import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Load environment variables first
dotenv.config();

import connectDB from './utils/db.js';
import { ErrorMiddleware } from "./middlewares/common/error.js";
import { initSocket } from './socket/io.js';
import { configurePassport, googleAuthHandler, googleCallbackHandler } from './utils/passport.js';
import { validateEnvironment, getConfig } from './utils/validation.js';

// Route imports
import userRoutes from "./users/user.routes.js";
import authRoutes from "./auth/auth.routes.js";
import productRoutes from "./product/product.router.js";
import categoriesRoutes from "./categories/categories.routes.js";
import orderRoutes from "./order/order.router.js";
import cartRoutes from "./cart/cart.routes.js";
import seedRoutes from "./seeder/seeder.router.js";
import notificationsRoutes from "./notifications/notifications.routes.js";
import { logger } from "./utils/logger.js";
// Get environment-specific configuration
const config = getConfig();

// Validate required environment variables
validateEnvironment();

const {
  PORT = 3000,
  NODE_ENV = 'development',
  CLIENT_URL,
  MONGO_URL,
  SESSION_SECRET,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX
} = process.env;

const app = express();
const server = http.createServer(app);

// Trust proxy for production deployments
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
app.use('/api/v1', rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: config.session.secure,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: config.session.sameSite
  }
};

// Use MongoDB store for sessions in production
if (NODE_ENV === 'production' && MONGO_URL) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: MONGO_URL,
    touchAfter: 24 * 3600
  });
}

app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport strategies
configurePassport();

// Health check route (before other routes)
app.get("/api/v1/healthz", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Up and running v1",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Google Auth Routes
app.get('/auth/google', googleAuthHandler);
app.get('/auth/google/callback', ...googleCallbackHandler);

// API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", categoriesRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", notificationsRoutes);
app.use("/api/v1/seed", seedRoutes);

// 404 handler for undefined routes - FIXED
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware - MOVED TO THE END
app.use(ErrorMiddleware);

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('\n🔄 Received shutdown signal, closing server gracefully...');

  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }

    console.log('✅ Server closed successfully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Force closing server after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    console.log('✅ Database connected successfully');

    // Initialize WebSocket
    initSocket(server);
    logger.info('✅ WebSocket initialized');

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔗 Client URL: ${CLIENT_URL || 'Not configured'}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();


export default app;