// ============================================
// resume.routes.js - Resume Management Routes
// ============================================
// Handles all routes for resume CRUD operations.
// All routes require authentication.
// Base URL: /api/resumes
// ============================================

import { Router } from 'express';
import {
  createResume, getResumes, getResume,
  updateResume, updateSection, updateTemplate, deleteResume, uploadResume,
} from '../controllers/resume.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /api/resumes/upload - Upload a PDF resume and auto-parse it
router.post('/upload', upload.single('file'), uploadResume);

// POST /api/resumes - Create a new resume
router.post('/', createResume);

// GET /api/resumes - Get all resumes for the logged-in user
router.get('/', getResumes);

// GET /api/resumes/:id - Get a specific resume by ID
router.get('/:id', getResume);

// PUT /api/resumes/:id - Update entire resume
router.put('/:id', updateResume);

// PUT /api/resumes/:id/sections/:section - Update a specific section (experience, education, etc.)
router.put('/:id/sections/:section', updateSection);

// PUT /api/resumes/:id/template - Update resume template (classic, modern, creative, etc.)
router.put('/:id/template', updateTemplate);

// DELETE /api/resumes/:id - Delete a resume
router.delete('/:id', deleteResume);

export default router;