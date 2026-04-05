// ============================================
// ai.routes.js - AI-Powered Resume Features
// ============================================
// Endpoints for AI capabilities:
// - Interview coaching with context-aware chatbot
// - Bullet point generation from raw experience
// - Professional summary generation
// - ATS (Applicant Tracking System) scoring
// - Resume review with actionable feedback
// - Job description matching
// - Skill gap analysis
// Base URL: /api/ai
// ============================================

import { Router } from 'express';
import {
  chat, generateBullets, generateSummary,
  atsScore, review, matchJob, skillGaps, getChatHistory,
} from '../controllers/ai.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all AI routes
router.use(authenticate);

// POST /api/ai/chat - Chat with AI interview coach
// Maintains conversation history for contextual responses
router.post('/chat', chat);

// POST /api/ai/generate-bullets - Convert raw work experience into ATS-optimized bullet points
// Input: rawExperience, role, company, targetRole, jobDescription
router.post('/generate-bullets', generateBullets);

// POST /api/ai/generate-summary - Generate professional summary based on resume data
// Tailored to target role and job description
router.post('/generate-summary', generateSummary);

// POST /api/ai/ats-score - Calculate ATS compatibility score (0-100)
// Includes breakdown by criteria: keywords, formatting, structure, etc.
router.post('/ats-score', atsScore);

// POST /api/ai/review - Get detailed AI-powered review of resume
// Provides actionable feedback and improvement suggestions
router.post('/review', review);

// POST /api/ai/match-job - How well does resume match job description
// Identifies matched and missing keywords
router.post('/match-job', matchJob);

// POST /api/ai/skill-gaps - Identify missing skills based on job JD
// Recommends skills to add or improve
router.post('/skill-gaps', skillGaps);

// GET /api/ai/chat-history/:resumeId - Retrieve previous conversations
// Useful for resuming previous coaching sessions
router.get('/chat-history/:resumeId', getChatHistory);

export default router;