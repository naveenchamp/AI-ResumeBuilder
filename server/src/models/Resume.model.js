// ============================================
// Resume.model.js - Resume Database Schema
// ============================================
// Defines MongoDB schema for complete resume documents.
// Includes all resume sections and ATS scoring data.
// Uses nested subdocument schemas for complex structures.
// ============================================

import mongoose from 'mongoose';

// ========== NESTED SUBDOCUMENT SCHEMAS ==========
// These define the structure of array items within the resume

/**
 * Experience schema - Work history entry
 * Stores: company, role, dates, current status, and bullet points
 */
const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, default: '' },       // Company name
    role: { type: String, default: '' },           // Job title/role
    startDate: { type: String, default: '' },      // Start date (format: MM/YYYY)
    endDate: { type: String, default: '' },        // End date (format: MM/YYYY or 'Currently')
    current: { type: Boolean, default: false },    // Is this current position?
    bullets: [{ type: String }],                   // Array of achievement bullets
  },
  { _id: true } // Each experience entry gets unique ID
);

/**
 * Education schema - Educational background
 * Stores: institution, degree, field, dates, GPA
 */
const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: '' },   // School/university name
    degree: { type: String, default: '' },         // Degree level (B.S., M.S., etc.)
    field: { type: String, default: '' },          // Field of study
    startDate: { type: String, default: '' },      // Start date (MM/YYYY)
    endDate: { type: String, default: '' },        // End date (MM/YYYY)
    gpa: { type: String, default: '' },            // GPA (optional)
  },
  { _id: true } // Each education entry gets unique ID
);

/**
 * Project schema - Notable projects/portfolio items
 * Stores: project details, technologies, link, and accomplishments
 */
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },           // Project name
    description: { type: String, default: '' },    // Project overview
    technologies: [{ type: String }],              // Tech stack used
    link: { type: String, default: '' },           // GitHub/demo link
    bullets: [{ type: String }],                   // Achievement/feature bullets
  },
  { _id: true } // Each project gets unique ID
);

/**
 * Certification schema - Professional certifications
 * Stores: certification details and verification link
 */
const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },           // Certification name
    issuer: { type: String, default: '' },         // Issuing organization
    date: { type: String, default: '' },           // Certification date
    link: { type: String, default: '' },           // Verification/credential link
  },
  { _id: true } // Each certification gets unique ID
);

/**
 * ATS Score breakdown schema - Detailed ATS analysis scores
 * Stores numeric scores for each evaluation criterion
 * Range: 0-100 for each metric
 */
const atsBreakdownSchema = new mongoose.Schema(
  {
    keywordMatch: { type: Number, default: 0 },        // Keyword relevance (0-100)
    formatting: { type: Number, default: 0 },          // ATS-friendly formatting (0-100)
    sectionCompleteness: { type: Number, default: 0 }, // All major sections present (0-100)
    bulletQuality: { type: Number, default: 0 },       // Quality of bullet points (0-100)
    summaryStrength: { type: Number, default: 0 },     // Professional summary quality (0-100)
    skillCoverage: { type: Number, default: 0 },       // Skill section completeness (0-100)
    quantification: { type: Number, default: 0 },      // Metrics/data in bullets (0-100)
    actionVerbs: { type: Number, default: 0 },         // Action verb usage (0-100)
    length: { type: Number, default: 0 },              // Appropriate length (0-100)
    contactInfo: { type: Number, default: 0 },         // Contact info completeness (0-100)
  },
  { _id: false } // No ID needed for this sub-document
);

// ========== MAIN RESUME SCHEMA ==========

const resumeSchema = new mongoose.Schema(
  {
    // ========== METADATA ==========

    // Reference to User document - establishes ownership
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Resume title/name - e.g., "Senior Developer Resume"
    title: {
      type: String,
      default: 'Untitled Resume',
      trim: true,
    },

    // Visual template style for PDF generation
    templateId: {
      type: String,
      enum: ['classic', 'modern', 'creative', 'minimal', 'executive'],
      default: 'classic',
    },

    // Target job role - used for AI tailoring
    targetRole: {
      type: String,
      default: '',
    },

    // Job description pasted by user - used for matching analysis
    jobDescription: {
      type: String,
      default: '',
    },

    // ========== RESUME CONTENT SECTIONS ==========

    sections: {
      // Personal contact information
      personalInfo: {
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        linkedIn: { type: String, default: '' },
        portfolio: { type: String, default: '' },
      },

      // Professional summary/objective
      summary: { type: String, default: '' },

      // Work experience array
      experience: [experienceSchema],

      // Education array
      education: [educationSchema],

      // Array of skills organized by category
      skills: {
        technical: [{ type: String }],  // Programming languages, frameworks, tools
        soft: [{ type: String }],       // Communication, leadership, etc.
        languages: [{ type: String }],  // Languages spoken
      },

      // Portfolio projects array
      projects: [projectSchema],

      // Certifications array
      certifications: [certificationSchema],
    },

    // ========== ATS ANALYSIS ==========

    // ATS scoring and analysis results
    atsScore: {
      overall: { type: Number, default: 0 },           // Overall ATS score (0-100)
      breakdown: { type: atsBreakdownSchema, default: () => ({}) }, // Detailed breakdown
      missingKeywords: [{ type: String }],             // Keywords from JD not in resume
      suggestions: [{ type: String }],                 // AI-generated improvement suggestions
    },

    // ========== FLAGS ==========

    // Soft delete flag for future use
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Auto-generates createdAt and updatedAt timestamp fields
    timestamps: true,
  }
);

// ========== INDEXES ==========
// Index for fast query by userId and sorting by creation date
// Improves performance of "get all resumes" queries
resumeSchema.index({ userId: 1, createdAt: -1 });

// Create and export the Resume model
const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
