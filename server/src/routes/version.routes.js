// ============================================
// version.routes.js - Resume Version Control
// ============================================
// Endpoints for managing resume versions.
// Allows users to save snapshots and restore previous versions.
// Base URL: /api/versions
// ============================================

import { Router } from 'express';
import {
  saveVersion, getVersions, getVersion,
  restoreVersion, deleteVersion,
} from '../controllers/version.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all version routes
router.use(authenticate);

// POST /api/versions/:resumeId - Save current resume as a version
// Creates a snapshot with optional label for easy identification
router.post('/:resumeId', saveVersion);

// GET /api/versions/:resumeId - Get all versions of a resume
// Useful for version history and comparison
router.get('/:resumeId', getVersions);

// GET /api/versions/:resumeId/:versionId - Get a specific version
router.get('/:resumeId/:versionId', getVersion);

// POST /api/versions/:resumeId/:versionId/restore - Restore resume to a previous version
// Copies all data from saved version back to main resume
router.post('/:resumeId/:versionId/restore', restoreVersion);

// DELETE /api/versions/:resumeId/:versionId - Delete a specific version
router.delete('/:resumeId/:versionId', deleteVersion);

export default router;
