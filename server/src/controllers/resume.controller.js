// ============================================
// resume.controller.js - Resume CRUD Controller
// ============================================
// Handles HTTP requests for resume operations.
// Manages create, read, update, delete, and PDF upload.
// All routes require authentication.
// ============================================

import * as resumeService from '../services/resume.service.js';
import extractTextFromPdf from '../utils/resumeParser.js';
import * as aiService from '../services/ai.service.js';

/**
 * POST /resumes - Create a new resume
 * Creates fresh resume with default template and empty sections
 * 
 * @param {Object} req.body - Optional: { title, templateId, targetRole }
 * @returns {Object} { success: true, data: resume }
 */
export const createResume = async (req, res, next) => {
  try {
    // Call service to create resume for authenticated user
    const resume = await resumeService.createResume(req.user._id, req.body);
    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /resumes - Get all resumes for the logged-in user
 * Returns list sorted by latest updates first
 * 
 * @returns {Object} { success: true, data: [resumes...] }
 */
export const getResumes = async (req, res, next) => {
  try {
    // Fetch all resumes belonging to authenticated user
    const resumes = await resumeService.getResumesByUser(req.user._id);
    return res.json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /resumes/:id - Get a specific resume by ID
 * Verifies ownership before returning data
 * 
 * @param {string} req.params.id - Resume ID
 * @returns {Object} { success: true, data: resume }
 */
export const getResume = async (req, res, next) => {
  try {
    // Retrieve resume with ownership validation
    const resume = await resumeService.getResumeById(req.params.id, req.user._id);
    return res.json({ success: true, data: resume });
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
 * PUT /resumes/:id - Update entire resume
 * Updates title, target role, job description, or other fields
 * 
 * @param {string} req.params.id - Resume ID
 * @param {Object} req.body - Fields to update
 * @returns {Object} { success: true, data: updatedResume }
 */
export const updateResume = async (req, res, next) => {
  try {
    // Call service to update resume data
    const resume = await resumeService.updateResume(
      req.params.id,
      req.user._id,
      req.body
    );
    return res.json({ success: true, data: resume });
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
 * PUT /resumes/:id/sections/:section - Update a specific section
 * Updates one section: personalInfo, summary, experience, education, skills, projects, certifications
 * 
 * @param {string} req.params.id - Resume ID
 * @param {string} req.params.section - Section name to update
 * @param {Object} req.body.data - New section data
 * @returns {Object} { success: true, data: updatedResume }
 */
export const updateSection = async (req, res, next) => {
  try {
    const { section } = req.params;

    // Validate section name
    const validSections = [
      'personalInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
    ];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section: ${section}`,
      });
    }

    // Call service to update specific section
    const resume = await resumeService.updateSection(
      req.params.id,
      req.user._id,
      section,
      req.body.data
    );
    return res.json({ success: true, data: resume });
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
 * PUT /resumes/:id/template - Update resume template
 * Changes visual template: classic, modern, creative, minimal, executive
 * 
 * @param {string} req.params.id - Resume ID
 * @param {string} req.body.templateId - New template ID
 * @returns {Object} { success: true, data: updatedResume }
 */
export const updateTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.body;

    // Validate template name
    const validTemplates = ['classic', 'modern', 'creative', 'minimal', 'executive'];
    if (!validTemplates.includes(templateId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid template: ${templateId}`,
      });
    }

    // Call service to update template
    const resume = await resumeService.updateTemplate(
      req.params.id,
      req.user._id,
      templateId
    );
    return res.json({ success: true, data: resume });
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
 * DELETE /resumes/:id - Delete a resume
 * Permanently removes resume from database
 * 
 * @param {string} req.params.id - Resume ID
 * @returns {Object} { success: true, data: { message: 'Resume deleted successfully' } }
 */
export const deleteResume = async (req, res, next) => {
  try {
    // Call service to delete resume with ownership check
    await resumeService.deleteResume(req.params.id, req.user._id);
    return res.json({
      success: true,
      data: { message: 'Resume deleted successfully' },
    });
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
 * POST /resumes/upload - Upload and parse PDF resume
 * Accepts PDF file, extracts text, parses sections using AI,
 * and creates new resume from parsed data
 * 
 * @param {File} req.file - PDF file from multipart form data
 * @returns {Object} { success: true, data: newResume }
 */
export const uploadResume = async (req, res, next) => {
  try {
    // Validate file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded.',
      });
    }

    // Extract text from PDF file buffer
    const extractedText = await extractTextFromPdf(req.file.buffer);

    // Validate extracted text
    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({
        success: false,
        message:
          'Could not extract text from PDF. Please try a different file.',
      });
    }

    // Parse extracted text into resume sections using AI
    const parsedSections = await aiService.parseResume({
      resumeText: extractedText,
    });

    // Create new resume from parsed sections
    const resume = await resumeService.createFromUpload(
      req.user._id,
      parsedSections
    );

    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};
