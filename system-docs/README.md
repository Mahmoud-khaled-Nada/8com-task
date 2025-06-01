# Shop Sync Catalog System Documentation

## System Overview
Shop Sync Catalog is a full-stack e-commerce application built with React 18.3.1 (TypeScript) frontend and Express.js backend with MongoDB. The system includes real-time features using Socket.IO and supports various authentication methods including Google OAuth.

## System Features

### 1. Authentication System
- JWT-based authentication with access and refresh tokens
- Google OAuth integration
- Token refresh mechanism
- Session management with MongoDB store
- Role-based access control

### 2. Cart System
- Supports both guest and authenticated users
- Persistent cart storage
- Real-time cart updates
- Cart synchronization across devices

### 3. Product Management
- CRUD operations for products
- Flash sale functionality
- Category-based organization
- Image upload support
- Stock management

### 4. Order System
- Order processing and management
- Order history
- Order status tracking
- Email notifications

### 5. Checkout System
- Stripe integration for payments
- Secure payment processing
- Order confirmation
- Receipt generation

### 6. Notification System
- Real-time notifications using Socket.IO
- Database-backed notification storage
- Email notifications
- In-app notification center

### 7. Audit Logging
- Comprehensive system activity logging
- User action tracking
- Security event logging
- Performance monitoring

## Setup Instructions

### Backend Setup (express-server)

1. Navigate to the express-server directory:
```bash
cd express-server
```

2. Create a `.env` file with the following required variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Database
MONGO_URL=mongodb://localhost:27017/shop-sync

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Optional)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM_NAME=Shop Sync
MAIL_FROM_ADDRESS=noreply@example.com

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
FORWARD_REDIS_PORT=6378

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

3. Using Docker (Recommended):
```bash
# Build and start all services
docker-compose up --build

# Or start in detached mode
docker-compose up -d --build
```

4. Manual Setup (Alternative):
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Frontend Setup (client)

1. Navigate to the frontend directory:
```bash
cd client
```

2. Create a `.env` file with the following variables:
```env
# API Configuration
VITE_API_SERVER_URL=http://localhost:5000/api/v1
VITE_WEBSOCKET_SERVER_URL=http://localhost:5000

# Google OAuth
VITE_AUTH_GOOGLE=true
```

3. Install dependencies and start the development server:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Notes

### Backend Services
- Express.js server runs on port 5000
- MongoDB runs on port 27017
- Redis runs on port 6378 (forwarded from 6379)

### Frontend
- React development server runs on port 3000
- Uses Vite as the build tool
- TypeScript for type safety
- React Router for navigation
- Socket.IO client for real-time features

### Security Features
- Helmet.js for security headers
- Rate limiting
- CORS configuration
- Secure cookie settings
- JWT token encryption
- Password hashing with bcrypt

### Database
- MongoDB for primary data storage
- Redis for caching and session storage
- MongoDB indexes for performance optimization

### Monitoring and Logging
- Winston logger for application logging
- Daily rotating log files
- Error tracking and monitoring
- Performance metrics collection

## API Documentation
The API documentation is available at `/api/v1/docs` when running the server (Swagger/OpenAPI documentation).

## Testing
```bash
# Backend tests
cd express-server
npm test

# Frontend tests
cd client
npm test
```

## Deployment
The application is containerized and can be deployed using Docker Compose. For production deployment:

1. Update environment variables for production
2. Set appropriate security measures
3. Configure SSL/TLS
4. Set up proper monitoring and logging
5. Configure backup strategies

## Support
For any issues or questions, please create an issue in the repository or contact the development team. 