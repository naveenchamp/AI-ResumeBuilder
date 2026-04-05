// ============================================
// User.model.js - User Database Schema
// ============================================
// Defines the MongoDB schema for user accounts.
// Supports both email/password and Google OAuth authentication.
// ============================================

import mongoose from 'mongoose';

// Mongoose schema definition for users
// Timestamps: auto-generates createdAt and updatedAt fields
const userSchema = new mongoose.Schema(
  {
    // Google OAuth identifier - sparse unique index allows null for email-only users
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Email address - unique, lowercase, trimmed
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Full name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    // Hashed password - only for email/password auth, null for Google users
    password: {
      type: String,
    },

    // Profile picture URL - from Google or user-provided
    picture: {
      type: String,
      default: '',
    },

    // Last login timestamp - useful for analytics and security
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Auto-generates createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create and export the User model
// Collection name will be 'users' (lowercased and pluralized)
const User = mongoose.model('User', userSchema);

export default User;

