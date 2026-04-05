// ============================================
// ai.controller.js - AI-Powered Resume Features
// ============================================
// Handles HTTP requests for AI functionality:
// - Interview coaching with context-aware chatbot
// - Bullet point generation
// - Summary generation
// - ATS scoring and analysis
// - Resume review and suggestions
// ============================================

import * as aiService from '../services/ai.service.js';
import ChatHistory from '../models/ChatHistory.model.js';
import Resume from '../models/Resume.model.js';

/**
 * POST /ai/chat - Chat with AI interview coach
 * Maintains multi-turn conversation history with context awareness.
 * Can provide section-specific coaching.
 * 
 * @param {Object} req.body - { resumeId, message, sectionTargeted? }
 * @returns {Object} { success: true, data: { message, ... } }
 */
export const chat = async (req, res, next) => {
  try {
    const { resumeId, message, sectionTargeted } = req.body;

    // Validate required fields
    if (!resumeId || !message) {
      return res.status(400).json({
        success: false,
        message: 'resumeId and message are required.',
      });
    }

    // Fetch resume with ownership check for both context and access control
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Find or create chat history for this resume
    let chatHistory = await ChatHistory.findOne({
      resumeId,
      userId: req.user._id,
      agentType: 'interview',
    });

    if (!chatHistory) {
      // Create new chat history if doesn't exist
      chatHistory = await ChatHistory.create({
        resumeId,
        userId: req.user._id,
        agentType: 'interview',
        messages: [],
        metadata: { sectionTargeted: sectionTargeted || '' },
      });
    }

    // Add user message to history
    chatHistory.messages.push({ role: 'user', content: message });

    // Call AI service with context (last 20 messages for token optimization)
    const result = await aiService.chatWithInterviewAgent({
      message,
      conversationHistory: chatHistory.messages.slice(-20),
      currentSections: resume?.sections || {},
      sectionTargeted: sectionTargeted || '',
      targetRole: resume?.targetRole || '',
      resumeId,
      jobDescription: resume?.jobDescription || '',
    });

    // Add assistant response to history and save
    chatHistory.messages.push({
      role: 'assistant',
      content: result.message,
    });
    await chatHistory.save();

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/generate-bullets - Convert raw experience into ATS-optimized bullets
 * Takes unstructured work experience and generates professional bullet points.
 * Considers target role and job description for alignment.
 * 
 * @param {Object} req.body - { rawExperience, role?, company?, resumeId? }
 * @returns {Object} { success: true, data: { bullets: [...] } }
 */
export const generateBullets = async (req, res, next) => {
  try {
    const { resumeId, rawExperience, role, company } = req.body;

    // Validate required field
    if (!rawExperience) {
      return res.status(400).json({
        success: false,
        message: 'rawExperience is required.',
      });
    }

    // Fetch resume context if resumeId provided
    const resume = resumeId ? await Resume.findById(resumeId) : null;

    // Call AI service to generate bullets
    const result = await aiService.generateBullets({
      rawExperience,
      role: role || '',
      company: company || '',
      targetRole: resume?.targetRole || '',
      jobDescription: resume?.jobDescription || '',
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/generate-summary - Generate professional summary
 * Creates a tailored professional summary based on resume data,
 * target role, and job description.
 * 
 * @param {Object} req.body - { resumeId }
 * @returns {Object} { success: true, data: { summary: "..." } }
 */
export const generateSummary = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    // Validate required field
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'resumeId is required.',
      });
    }

    // Fetch resume with ownership check
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Call AI service to generate summary
    const result = await aiService.generateSummary({
      sections: resume.sections,
      targetRole: resume.targetRole,
      jobDescription: resume.jobDescription,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/ats-score - Calculate ATS compatibility score
 * Analyzes resume against ATS systems and job description.
 * Returns overall score (0-100) and detailed breakdown.
 * Saves score to resume for future reference.
 * 
 * @param {Object} req.body - { resumeId, jobDescription? }
 * @returns {Object} { success: true, data: { overall: 85, breakdown: {...}, suggestions: [...] } }
 */
export const atsScore = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    // Validate required field
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'resumeId is required.',
      });
    }

    // Fetch resume with ownership check
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Update job description if provided
    if (jobDescription) {
      resume.jobDescription = jobDescription;
    }

    // Call AI service to calculate ATS score
    const result = await aiService.getAtsScore({
      sections: resume.sections,
      jobDescription: jobDescription || resume.jobDescription,
      targetRole: resume.targetRole,
    });

    // Convert breakdown to numeric format for storage
    const numericBreakdown = {};
    if (result.breakdown) {
      for (const [key, val] of Object.entries(result.breakdown)) {
        numericBreakdown[key] =
          typeof val === 'object' ? val.score || 0 : val || 0;
      }
    }

    // Save ATS score to resume document
    resume.atsScore = {
      overall: result.overall || 0,
      breakdown: numericBreakdown,
      missingKeywords: result.missingKeywords || [],
      suggestions: result.suggestions || [],
    };
    await resume.save();

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/review - Get detailed AI-powered resume review
 * Provides constructive feedback and actionable suggestions
 * for resume improvement.
 * 
 * @param {Object} req.body - { resumeId }
 * @returns {Object} { success: true, data: { feedback: [...], suggestions: [...] } }
 */
export const review = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    // Validate required field
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'resumeId is required.',
      });
    }

    // Fetch resume with ownership check
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Call AI service for review analysis
    const result = await aiService.reviewResume({
      sections: resume.sections,
      targetRole: resume.targetRole,
      jobDescription: resume.jobDescription,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/match-job - Analyze how well resume matches job description
 * Identifies matched keywords and missing qualifications.
 * Helps user tailor resume for specific job postings.
 * 
 * @param {Object} req.body - { resumeId, jobDescription }
 * @returns {Object} { success: true, data: { matchPercentage: 75, matched: [...], missing: [...] } }
 */
export const matchJob = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    // Validate required fields
    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'resumeId and jobDescription are required.',
      });
    }

    // Fetch resume with ownership check
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Update job description and save
    resume.jobDescription = jobDescription;
    await resume.save();

    // Call AI service for job matching analysis
    const result = await aiService.matchJob({
      sections: resume.sections,
      jobDescription,
      targetRole: resume.targetRole,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/skill-gaps - Identify missing skills for job
 * Analyzes current skills vs. job requirements.
 * Recommends skills to add or improve.
 * 
 * @param {Object} req.body - { resumeId, jobDescription? }
 * @returns {Object} { success: true, data: { gaps: [...], recommendations: [...] } }
 */
export const skillGaps = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    // Validate required field
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'resumeId is required.',
      });
    }

    // Fetch resume with ownership check
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Call AI service for skill gap analysis
    const result = await aiService.detectSkillGaps({
      skills: resume.sections.skills,
      jobDescription: jobDescription || resume.jobDescription,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /ai/chat-history/:resumeId - Retrieve chat history
 * Returns all conversation sessions for a resume.
 * Useful for resuming previous coaching sessions.
 * 
 * @param {string} req.params.resumeId - Resume ID
 * @returns {Object} { success: true, data: [chatHistories...] }
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    // ChatPanel renders a flat message list for the interview assistant.
    const history = await ChatHistory.findOne({
      resumeId,
      userId: req.user._id,
      agentType: 'interview',
    }).sort({ updatedAt: -1 });

    return res.json({ success: true, data: history?.messages || [] });
  } catch (error) {
    next(error);
  }
};
