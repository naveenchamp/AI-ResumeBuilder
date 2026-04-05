// ============================================
// auth.middleware.js - JWT Authentication Check
// ============================================
// Middleware for protecting routes that require authentication.
// Verifies JWT token and attaches user to request.
// Called before protected route handlers.
// ============================================

import { verifyToken } from '../utils/jwt.utils.js';
import User from '../models/User.model.js';

/**
 * Authentication middleware
 * Checks for valid JWT token in Authorization header.
 * If valid, attaches authenticated user to req.user object.
 * If invalid, returns 401 Unauthorized.
 * 
 * Expected header format: "Bearer <token>"
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists and has Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this route.',
      });
    }

    // Extract token from "Bearer <token>" format
    // Splits on space and takes the second part
    const token = authHeader.split(' ')[1];

    // Verify JWT signature and expiration
    // Throws error if token is invalid or expired
    const decoded = verifyToken(token);

    // Find user in database
    // decoded.id was set when token was generated
    const user = await User.findById(decoded.id);

    // Ensure user still exists (not deleted after login)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.',
      });
    }

    // Attach user to request object
    // Available as req.user in subsequent route handlers
    req.user = user;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Token invalid, expired, or verification failed
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

export default authenticate;
