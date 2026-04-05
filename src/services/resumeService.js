// ============================================
// resumeService.js - Resume API Functions
// ============================================
// Client-side API calls for resume CRUD operations.
// Also handles version management and PDF uploads.
// All functions use API wrapper from api.js.
// ============================================

import API from './api.js';

// ========== RESUME CRUD OPERATIONS ==========

/**
 * Create new resume
 * Initializes new resume with optional title and template
 * 
 * @param {Object} data - { title?, templateId?, targetRole? }
 * @returns {Object} Created resume with _id and default sections
 */
const createResume = async (data = {}) => {
  const response = await API.post('/resumes', data);
  return response.data;
};

/**
 * Get all resumes for logged-in user
 * Returns list sorted by most recent first
 * 
 * @returns {Array} Array of resume objects
 */
const getResumes = async () => {
  const response = await API.get('/resumes');
  return response.data;
};

/**
 * Get single resume by ID
 * Includes all sections and metadata
 * 
 * @param {string} id - Resume ID
 * @returns {Object} Complete resume object
 */
const getResume = async (id) => {
  const response = await API.get(`/resumes/${id}`);
  return response.data;
};

/**
 * Update entire resume or multiple fields
 * Can update title, targetRole, jobDescription, etc.
 * 
 * @param {string} id - Resume ID
 * @param {Object} data - Fields to update
 * @returns {Object} Updated resume
 */
const updateResume = async (id, data) => {
  const response = await API.put(`/resumes/${id}`, data);
  return response.data;
};

/**
 * Update specific resume section
 * Only updates one section like 'experience', 'education', etc.
 * More efficient than updating entire resume
 * 
 * @param {string} id - Resume ID
 * @param {string} section - Section name (experience, education, skills, etc.)
 * @param {Array|Object} data - New section data
 * @returns {Object} Updated resume
 */
const updateSection = async (id, section, data) => {
  const response = await API.put(`/resumes/${id}/sections/${section}`, { data });
  return response.data;
};

/**
 * Change resume template/style
 * Updates visual template without affecting content
 * Valid templates: classic, modern, creative, minimal, executive
 * 
 * @param {string} id - Resume ID
 * @param {string} templateId - New template ID
 * @returns {Object} Updated resume
 */
const updateTemplate = async (id, templateId) => {
  const response = await API.put(`/resumes/${id}/template`, { templateId });
  return response.data;
};

/**
 * Delete resume permanently
 * Warning: Cannot be undone unless version exists
 * 
 * @param {string} id - Resume ID
 * @returns {Object} Success response
 */
const deleteResume = async (id) => {
  const response = await API.delete(`/resumes/${id}`);
  return response.data;
};

// ========== VERSION MANAGEMENT ==========

/**
 * Save current resume as a version
 * Creates snapshot for rollback capability
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} label - Optional label like "Before Interview Updates"
 * @returns {Object} Created version object
 */
const saveVersion = async (resumeId, label) => {
  const response = await API.post(`/versions/${resumeId}`, { label });
  return response.data;
};

/**
 * Get all versions of a resume
 * Returns version history
 * 
 * @param {string} resumeId - Resume ID
 * @returns {Array} Array of version objects
 */
const getVersions = async (resumeId) => {
  const response = await API.get(`/versions/${resumeId}`);
  return response.data;
};

/**
 * Restore resume from saved version
 * Overwrites current resume with version snapshot
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} versionId - Version ID to restore
 * @returns {Object} Restored resume
 */
const restoreVersion = async (resumeId, versionId) => {
  const response = await API.post(`/versions/${resumeId}/${versionId}/restore`);
  return response.data;
};

/**
 * Delete a specific version
 * Removes saved snapshot permanently
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} versionId - Version ID to delete
 * @returns {Object} Success response
 */
const deleteVersion = async (resumeId, versionId) => {
  const response = await API.delete(`/versions/${resumeId}/${versionId}`);
  return response.data;
};

// ========== FILE UPLOADS ==========

/**
 * Upload and parse PDF resume
 * Converts PDF to text and auto-extracts resume sections
 * Creates new resume from parsed content
 * 
 * @param {File} file - PDF file from file input
 * @returns {Object} Newly created resume with parsed content
 */
const uploadResume = async (file) => {
  // Create FormData for multipart file upload
  // Note: API wrapper  detects FormData and doesn't set Content-Type
  const formData = new FormData();
  formData.append('file', file);

  const response = await API.post('/resumes/upload', formData);
  return response.data;
};

export {
  createResume,
  getResumes,
  getResume,
  updateResume,
  updateSection,
  updateTemplate,
  deleteResume,
  saveVersion,
  getVersions,
  restoreVersion,
  deleteVersion,
  uploadResume,
};
