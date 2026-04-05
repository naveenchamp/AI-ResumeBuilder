// ============================================
// aiService.js - AI-Powered Resume API Calls
// ============================================
// Client-side functions for AI features:
// - Interview coaching
// - Bullet/summary generation
// - ATS scoring and analysis
// - Job matching and skill gaps
// ============================================

import API from './api.js';

// ========== INTERVIEW COACHING ==========

/**
 * Chat with AI interview coach
 * Maintains multi-turn conversation with context awareness
 * 
 * Features:
 * - Remembers conversation history
 * - Can provide section-specific coaching
 * - References resume data and job description
 * 
 * @param {string} resumeId - Resume ID for context
 * @param {string} message - User's message to AI
 * @param {string} sectionTargeted - Optional section being discussed (e.g., 'experience')
 * @returns {Object} { message, feedback, suggestions }
 */
const chatWithAgent = async (resumeId, message, sectionTargeted = '') => {
  const response = await API.post('/ai/chat', {
    resumeId,
    message,
    sectionTargeted,
  });
  return response.data;
};

// ========== CONTENT GENERATION ==========

/**
 * Generate ATS-optimized bullet points
 * Converts raw work description into professional bullet points
 * Tailored to target role and job description
 * 
 * @param {Object} data - { rawExperience, role?, company?, resumeId?, targetRole?, jobDescription? }
 * @returns {Object} { bullets: [...], explanation: "..." }
 */
const generateBullets = async (data) => {
  const response = await API.post('/ai/generate-bullets', data);
  return response.data;
};

/**
 * Generate professional summary
 * Creates tailored summary from resume data
 * Reflects target role and job requirements
 * 
 * @param {string} resumeId - Resume ID
 * @returns {Object} { summary: "..." }
 */
const generateSummary = async (resumeId) => {
  const response = await API.post('/ai/generate-summary', { resumeId });
  return response.data;
};

// ========== ATS ANALYSIS ==========

/**
 * Calculate ATS (Applicant Tracking System) score
 * Analyzes how well resume will parse in ATS systems
 * Returns: overall score (0-100) + detailed breakdown
 * 
 * Metrics analyzed:
 * - Keyword matching with job description
 * - Formatting compatibility
 * - Section completeness
 * - Use of action verbs
 * - Quantification
 * - Business - etc.
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} jobDescription - Optional job description to analyze against
 * @returns {Object} { overall, breakdown, suggestions, missingKeywords }
 */
const getAtsScore = async (resumeId, jobDescription) => {
  const response = await API.post('/ai/ats-score', {
    resumeId,
    jobDescription,
  });
  return response.data;
};

/**
 * Get AI-powered resume review
 * Analyzes resume and provides constructive feedback
 * Identifies strengths and areas for improvement
 * 
 * @param {string} resumeId - Resume ID
 * @returns {Object} { feedback: [...], strengths: [...], improvements: [...] }
 */
const reviewResume = async (resumeId) => {
  const response = await API.post('/ai/review', { resumeId });
  return response.data;
};

// ========== JOB MATCHING ==========

/**
 * Analyze how well resume matches job description
 * Identifies:
 * - Matched keywords and qualifications
 * - Missing skills and experience
 * - Alignment percentage
 * 
 * Helps user tailor resume for specific job
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} jobDescription - Job posting text
 * @returns {Object} { matchPercentage, matched: [...], missing: [...] }
 */
const matchJob = async (resumeId, jobDescription) => {
  const response = await API.post('/ai/match-job', {
    resumeId,
    jobDescription,
  });
  return response.data;
};

/**
 * Detect skill gaps for job
 * Compares current skills with job requirements
 * Recommends skills to add or improve
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} jobDescription - Job posting text
 * @returns {Object} { gaps: [...], recommendations: [...], priority: [...] }
 */
const detectSkillGaps = async (resumeId, jobDescription) => {
  const response = await API.post('/ai/skill-gaps', {
    resumeId,
    jobDescription,
  });
  return response.data;
};

// ========== CHAT HISTORY ==========

/**
 * Retrieve chat history for a resume
 * Useful for resuming previous coaching sessions
 * 
 * @param {string} resumeId - Resume ID
 * @returns {Array} Array of chat history records
 */
const getChatHistory = async (resumeId) => {
  const response = await API.get(`/ai/chat-history/${resumeId}`);
  return response.data;
};

export {
  chatWithAgent,
  generateBullets,
  generateSummary,
  getAtsScore,
  reviewResume,
  matchJob,
  detectSkillGaps,
  getChatHistory,
};
