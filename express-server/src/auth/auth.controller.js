import Joi from 'joi';
import { catchAsyncError } from "../middlewares/common/catch.async.error.js";
import { verifyToken, generateToken } from '../utils/jwt.js';
import { User } from '../users/user.model.js';
import { Cache } from '../utils/redis.js';
import { CACHE_KEYS } from '../middlewares/private/authenticate.js';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(20).required()
});

export const login = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }


  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found with this email" });
  }

  console.log(password)

  const isPasswordValid = await user.verifyPassword(password);
  console.log(isPasswordValid)
  if (!isPasswordValid) {
    return res.status(400).json({ success: false, message: "Invalid password" });
  }

  const userPayload = { id: user._id, email: user.email, role: user.role, avatar: user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', name: user.name };

  // Generate tokens
  const accessToken = generateToken(userPayload, process.env.JWT_SECRET, '30m');
  const refreshToken = generateToken(userPayload, process.env.REFRESH_TOKEN_SECRET, '7d');

  // Cache session and refresh token
  const pipeline = Cache.pipeline();
  pipeline.setex(CACHE_KEYS.SESSION(userPayload.id), 7 * 24 * 60 * 60, JSON.stringify(userPayload));
  pipeline.setex(CACHE_KEYS.REFRESH_TOKEN(userPayload.id), 7 * 24 * 60 * 60, refreshToken);
  await pipeline.exec();

  // Set cookies
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });


  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: userPayload
  });
});


export const refreshToken = catchAsyncError(async (req, res) => {
  const tokenFromCookie = req.cookies?.refresh_token;

  if (!tokenFromCookie) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const userData = verifyToken(tokenFromCookie, process.env.REFRESH_TOKEN_SECRET);

    if (!userData?.id || !userData?.email) {
      return res.status(403).json({ message: 'Invalid refresh token payload' });
    }

    const userExists = await User.findById(userData.id);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userPayload = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    };

    const newAccessToken = generateToken(userPayload, process.env.JWT_SECRET, '30m');
    const newRefreshToken = generateToken(userPayload, process.env.REFRESH_TOKEN_SECRET, '7d');

    const pipeline = Cache.pipeline();
    pipeline.setex(CACHE_KEYS.SESSION(userData.id), 7 * 24 * 60 * 60, JSON.stringify(userPayload));
    pipeline.setex(CACHE_KEYS.REFRESH_TOKEN(userData.id), 7 * 24 * 60 * 60, newRefreshToken);
    await pipeline.exec();

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 30 * 60 * 1000 // 30 minutes
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed'
    });

  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});



export const logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refresh_token');
  res.status(200).json({ success: true, message: 'Logged out' });
};


export const me = (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
}






