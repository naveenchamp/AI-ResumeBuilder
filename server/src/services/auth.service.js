// ============================================
// auth.service.js - Authentication Business Logic
// ============================================
// Handles core authentication operations:
// - Email/password registration and login
// - Google OAuth login
// - User profile retrieval
// - Password hashing with bcrypt
// ============================================

import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import { verifyGoogleToken } from '../config/google.config.js';
import { generateToken } from '../utils/jwt.utils.js';

/**
 * Register new user with email and password
 * Validates email uniqueness, hashes password, generates JWT token
 * 
 * @param {string} name - User's full name
 * @param {string} email - User's email (must be unique)
 * @param {string} password - User's password (will be hashed)
 * @returns {Object} { token, user }
 * @throws {Error} If email already registered
 */
export const register = async (name, email, password) => {
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered.');
    error.statusCode = 409; // Conflict status code
    throw error;
  }

  // Hash password with bcrypt (salt rounds: 10)
  // This transforms: "mypassword" -> "$2a$10$...[long hash]..."
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user document in database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Generate JWT token for immediate login
  const token = generateToken(user);

  // Return token and user data (excluding password)
  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  };
};

/**
 * Login user with email and password
 * Validates credentials, compares hashed password, generates JWT
 * 
 * @param {string} email - User's email
 * @param {string} password - User's plain password (will be compared to hash)
 * @returns {Object} { token, user }
 * @throws {Error} If email not found or password incorrect
 */
export const emailLogin = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });

  // Validate user exists and has password auth (not Google-only)
  if (!user || !user.password) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  // Compare plain password with hashed password in database
  // bcrypt.compare handles the hash comparison securely
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  };
};

/**
 * Login with Google OAuth
 * Verifies Google credential, creates/updates user record
 * Auto-creates account on first login (upsert)
 * 
 * @param {string} credential - Google JWT credential from frontend
 * @returns {Object} { token, user }
 */
export const googleLogin = async (credential) => {
  // Verify Google credential and extract user info
  const googleUser = await verifyGoogleToken(credential);

  // Upsert: Update if exists by googleId, otherwise create new
  // returnDocument: 'after' returns the updated/created document
  let user = await User.findOneAndUpdate(
    { googleId: googleUser.googleId },        // Find by Google ID
    {
      // Update/set these fields
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      lastLogin: new Date(),
    },
    {
      returnDocument: 'after', // Return updated document
      upsert: true,            // Create if doesn't exist
    }
  );

  // Generate JWT token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  };
};

/**
 * Retrieve user profile information
 * Excludes sensitive fields (__v, googleId)
 * 
 * @param {string} userId - User's ID
 * @returns {Object} User profile data
 * @throws {Error} If user not found
 */
export const getUserProfile = async (userId) => {
  // Find user by ID, exclude internal MongoDB fields and Google ID
  const user = await User.findById(userId).select('-__v -googleId');

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
};
