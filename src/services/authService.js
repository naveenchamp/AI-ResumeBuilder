// ============================================
// authService.js - Authentication API Functions
// ============================================
// Client-side authentication API calls.
// Makes HTTP requests to backend /auth routes.
// All functions use the API wrapper (api.js).
// ============================================

import API from './api.js';

/**
 * Register new user with email and password
 * Creates account and returns token + user data
 * 
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} password - User's password (hashed on server)
 * @returns {Object} { id, email, name, picture, token }
 * @throws {Error} If email already registered or validation fails
 */
const register = async (name, email, password) => {
  const response = await API.post('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

/**
 * Login with email and password
 * Authenticates user and returns token + user data
 * 
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} { id, email, name, picture, token }
 * @throws {Error} If credentials invalid
 */
const emailLogin = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Login with Google OAuth
 * Verifies Google credential and returns token + user data
 * Auto-creates account if first time login
 * 
 * @param {string} credential - Google JWT credential from GoogleLogin component
 * @returns {Object} { id, email, name, picture, token }
 * @throws {Error} If Google credential invalid
 */
const googleLogin = async (credential) => {
  const response = await API.post('/auth/google', { credential });
  return response.data;
};

/**
 * Get current user profile (requires token)
 * Validates that user is still authenticated and in DB
 * Called on app init to restore auth state
 * 
 * @returns {Object} { id, email, name, picture, createdAt, lastLogin }
 * @throws {Error} If not authenticated (token invalid/expired) or user deleted
 */
const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

/**
 * Logout (API endpoint)
 * Server-side logout logic (optional)
 * Main logout handled on client via localStorage removal
 * 
 * @returns {Object} Success response from server
 */
const logout = async () => {
  const response = await API.post('/auth/logout');
  return response;
};

export { register, emailLogin, googleLogin, getMe, logout };
