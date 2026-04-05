// ============================================
// ResumeVersion.model.js - Resume Version Control
// ============================================
// Stores snapshots of resume at different points in time.
// Allows users to save, view, and restore previous versions.
// Each version is immutable once created.
// ============================================

import mongoose from 'mongoose';

/**
 * Resume Version schema - Immutable snapshot of a resume
 * Stores complete resume state at time of save
 */
const resumeVersionSchema = new mongoose.Schema(
  {
    // Which resume this is a version of
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },

    // Which user owns this version
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Sequential version number (1, 2, 3, ...)
    // Used to track order and identify versions
    versionNumber: {
      type: Number,
      required: true,
    },

    // Optional user-provided label for this version
    // e.g., "Before Interview Updates" or "Final Draft"
    label: {
      type: String,
      default: '',
      trim: true,
    },

    // Complete snapshot of resume data at time of save
    // Mongoose.Schema.Types.Mixed allows any object structure
    // This preserves exact state including all sections and ATS scores
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Template ID used when this version was saved
    templateId: {
      type: String,
      default: 'classic',
    },

    // ATS score at time of this version
    atsScore: {
      type: Number,
      default: 0,
    },

    // Job description associated with this version
    jobDescription: {
      type: String,
      default: '',
    },
  },
  {
    // Auto-generates createdAt and updatedAt timestamps
    // createdAt shows when this version was saved
    timestamps: true,
  }
);

// ========== INDEXES ==========
// Index for finding versions by resume, sorted by version number descending
// Improves performance of "get version history" queries
resumeVersionSchema.index({ resumeId: 1, versionNumber: -1 });

// Create and export the ResumeVersion model
const ResumeVersion = mongoose.model('ResumeVersion', resumeVersionSchema);

export default ResumeVersion;
