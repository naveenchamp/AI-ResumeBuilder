// ============================================
// auth.routes.js - Authentication Routes
// ============================================
// Handles user registration, login, and Google OAuth.
// Some routes are public, others require authentication.
// Base URL: /api/auth
// ============================================

import { Router } from 'express';
import { registerUser, loginUser, googleAuth, getMe, logout } from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// ========== PUBLIC ROUTES ==========

// POST /api/auth/register - Register new user with email and password
// Input: { name, email, password }
// Returns: { token, user }
router.post('/register', registerUser);

// POST /api/auth/login - Login with email and password
// Input: { email, password }
// Returns: { token, user }
router.post('/login', loginUser);

// POST /api/auth/google - Authenticate using Google OAuth
// Input: { credential } (Google credential from frontend)
// Returns: { token, user } - Auto-creates user if first time
router.post('/google', googleAuth);

// ========== PROTECTED ROUTES ==========

// GET /api/auth/me - Get current authenticated user profile
// Requires: Bearer token in Authorization header
// Returns: { user } with id, email, name, picture, timestamps
router.get('/me', authenticate, getMe);

// POST /api/auth/logout - Logout current user
// Requires: Bearer token in Authorization header
// Note: Token is managed on client side (localStorage removal)
router.post('/logout', authenticate, logout);

export default router;
