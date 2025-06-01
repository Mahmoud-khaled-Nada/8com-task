// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../users/user.model.js';
import { generateToken } from '../utils/jwt.js';

export const configurePassport = () => {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
          role: 'customer',
          isVerified: true, // Google accounts are pre-verified
          provider: 'google'
        });
        
        console.log(`✅ New user created via Google OAuth: ${user.email}`);
      } else {
        // Update existing user info if needed
        const updates = {};
        if (profile.displayName && user.name !== profile.displayName) {
          updates.name = profile.displayName;
        }
        if (profile.photos?.[0]?.value && user.avatar !== profile.photos[0].value) {
          updates.avatar = profile.photos[0].value;
        }
        
        if (Object.keys(updates).length > 0) {
          await User.findByIdAndUpdate(user._id, updates);
          console.log(`✅ User updated via Google OAuth: ${user.email}`);
        }
      }
      
      return done(null, user);
    } catch (error) {
      console.error('❌ Error in Google OAuth strategy:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (error) {
      console.error('❌ Error deserializing user:', error);
      done(error, null);
    }
  });
};

// Google Auth route handlers
export const googleAuthHandler = passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account' // Force account selection
});

export const googleCallbackHandler = [
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}?error=auth_failed` 
  }),
  (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=user_not_found`);
      }

      // Generate tokens
      const payload = { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role ,
        avatar: user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
      };
      
      const accessToken = generateToken(
        payload, 
        process.env.JWT_SECRET, 
        process.env.JWT_EXPIRES_IN || '30m'
      );
      
      const refreshToken = generateToken(
        payload, 
        process.env.REFRESH_TOKEN_SECRET, 
        process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
      );

      // Set secure cookies
      const cookieOptions = {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
      };

      res.cookie('token', accessToken, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000 // 30 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to dashboard or specified redirect URL
      const redirectUrl = req.session.returnTo || `${process.env.CLIENT_URL}`;
      delete req.session.returnTo; // Clean up session
      
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Error in Google callback:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=callback_error`);
    }
  }
];