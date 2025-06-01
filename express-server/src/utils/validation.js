// utils/validation.js

/**
 * Validates required environment variables
 * @throws {Error} If required environment variables are missing
 */
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'MONGO_URL',
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SERVER_URL',
    'CLIENT_URL'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    
    console.error('\n📝 Please check your .env file and ensure all required variables are set.');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate URL formats
  const urlVars = ['SERVER_URL', 'CLIENT_URL'];
  urlVars.forEach(urlVar => {
    const url = process.env[urlVar];
    if (url && !isValidUrl(url)) {
      console.warn(`⚠️  Invalid URL format for ${urlVar}: ${url}`);
    }
  });

  // Validate JWT secrets are not default values
  const secrets = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'SESSION_SECRET'];
  secrets.forEach(secret => {
    const value = process.env[secret];
    if (value && (value.length < 32 || value === 'your-secret-here')) {
      console.warn(`⚠️  ${secret} should be a strong, randomly generated string (at least 32 characters)`);
    }
  });

  console.log('✅ Environment variables validated successfully');
};

/**
 * Validates if a string is a valid URL
 * @param {string} string - The string to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Gets environment-specific configuration
 * @returns {Object} Configuration object
 */
export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const config = {
    development: {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
      },
      session: {
        secure: false,
        sameSite: 'lax'
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 1000
      }
    },
    production: {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
      },
      session: {
        secure: true,
        sameSite: 'strict'
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100
      }
    },
    test: {
      cors: {
        origin: true,
        credentials: true
      },
      session: {
        secure: false,
        sameSite: 'lax'
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 1000
      }
    }
  };

  return config[env] || config.development;
};