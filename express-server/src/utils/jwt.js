// utils/jwt.js
import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token.
 * @param {Object} payload - The data to encode in the token.
 * @param {string} secret - Secret key to sign the token.
 * @param {string|number} [expiresIn='1h'] - Token expiration time.
 * @returns {string} Signed JWT token.
 */
export const generateToken = (payload, secret, expiresIn = '1h') => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token.
 * @param {string} token - JWT token to verify.
 * @param {string} secret - Secret key used to verify the token.
 * @returns {Object} Decoded payload.
 * @throws {Error} If token is invalid or expired.
 */
export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret); // Will throw if invalid
};
