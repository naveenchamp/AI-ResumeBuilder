// ============================================
// auth.controller.js - Authentication Controller
// ============================================
// Handles HTTP requests for authentication.
// Flow: Route -> Controller -> Service -> Database
// Purpose: Validate requests and delegate logic to services
// ============================================

import * as authService from '../services/auth.service.js';

/**
 * POST /auth/register - Register new user
 * Validates input, checks duplicate email, creates hashed password,
 * saves to DB, and returns JWT token
 * 
 * @param {Object} req.body - { name, email, password }
 * @returns {Object} { success: true, data: { token, user } }
 */
export const registerUser = async (req, res, next) => {
  try {
    // Extract and destructure request body (JS Essentials: Destructuring)
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Validate minimum password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Call service to handle registration business logic
    const result = await authService.register(name, email, password);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    // Handle known errors with status code
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * POST /auth/login - Login with email and password
 * Validates credentials against hashed password in DB,
 * returns JWT token if successful
 * 
 * @param {Object} req.body - { email, password }
 * @returns {Object} { success: true, data: { token, user } }
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Call service to handle login logic
    const result = await authService.emailLogin(email, password);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * POST /auth/google - Authenticate with Google OAuth
 * Verifies Google credential and creates/updates user record
 * 
 * @param {Object} req.body - { credential } (Google JWT token)
 * @returns {Object} { success: true, data: { token, user } }
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    // Validate credential exists
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required.',
      });
    }

    // Call service to verify and process Google login
    const result = await authService.googleLogin(credential);
    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /auth/me - Get current authenticated user profile
 * Requires valid JWT token in Authorization header
 * 
 * @param {Object} req.user - Attached by auth middleware
 * @returns {Object} { success: true, data: { user } }
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by authenticate middleware
    const user = await authService.getUserProfile(req.user._id);
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/logout - Logout current user
 * Triggers client-side token removal (token stored in localStorage)
 * Server-side: returns success message
 * 
 * @returns {Object} { success: true, data: { message: 'Logged out successfully' } }
 */
export const logout = async (req, res, next) => {
  try {
    // Note: Actual logout handled on client (localStorage.removeItem('token'))
    // Server can be extended for token blacklist/revocation if needed
    return res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    next(error);
  }
};

