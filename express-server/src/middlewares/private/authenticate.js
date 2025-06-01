import { verifyToken } from '../../utils/jwt.js';
import { Cache } from '../../utils/redis.js';

export const CACHE_KEYS = {
  SESSION: (userId) => `user_session:${userId}`,
  REFRESH_TOKEN: (userId) => `refresh_token:${userId}`
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = verifyToken(token, process.env.JWT_SECRET);

    // Optional: Check session validity in Redis
    const session = await Cache.get(CACHE_KEYS.SESSION(decoded.id));
    if (!session) {
      return res.status(403).json({ message: 'Session expired or invalidated' });
    }

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};


export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};