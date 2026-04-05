// ============================================
// ai.service.js - AI Integration Service
// ============================================
// Coordinates with Gemini AI for resume analysis and generation.
// Handles: ATS scoring, bullet generation, resume review, etc.
// ============================================

import { generateContent } from '../config/gemini.config.js';
import * as prompts from '../constants/prompts.js';
import { analyzeKeywords } from '../utils/keywordAnalyzer.js';
import { checkFormatting } from '../utils/formatChecker.js';
import { calculateOverallScore } from '../utils/scoreCalculator.js';
import { runInterviewAgent } from './agent.service.js';

/**
 * Parse JSON from Gemini response
 * Handles multiple response formats:
 * - Direct JSON: {"field": "value"}
 * - Markdown code blocks: ```json...```
 * - Text with JSON: "Here's the result: {...}"
 * 
 * @param {string} text - Raw AI response text
 * @returns {Object} Parsed JSON or error object
 */
const parseJsonResponse = (text) => {
  // Try direct JSON parsing first
  try {
    return JSON.parse(text);
  } catch (e) {
    /* continue to alternative parsing */
  }

  let jsonStr = null;

  // Try markdown code block with json tag: ```json...```
  if (text.includes('```json')) {
    const start = text.indexOf('```json') + 7;
    const end = text.indexOf('```', start);
    if (end > start) jsonStr = text.slice(start, end).trim();
  } else if (text.includes('```')) {
    // Try generic markdown code block: ```...```
    const start = text.indexOf('```') + 3;
    const end = text.indexOf('```', start);
    if (end > start) jsonStr = text.slice(start, end).trim();
  } else if (text.includes('{')) {
    // Try to extract JSON object by counting braces
    const start = text.indexOf('{');
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) {
          jsonStr = text.slice(start, i + 1);
          break;
        }
      }
    }
  }

  // Try parsing extracted JSON string
  if (jsonStr) {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      /* continue */
    }
  }

  // Return error if all parsing attempts fail
  return { error: 'Failed to parse AI response', raw: text };
};

/**
 * Chat with AI interview coach
 * Uses autonomous agent with function calling capability
 * Maintains conversation context for follow-ups
 * 
 * @param {Object} data - Conversation context including history, resume, job details
 * @returns {Object} AI response with message and metadata
 */
export const chatWithInterviewAgent = async (data) => {
  // Delegates to specialized agent service that handles conversation flow
  return runInterviewAgent(data);
};

/**
 * Generate ATS-optimized bullet points
 * Converts raw work experience into professional bullet points
 * Optimized for ATS parsing and keyword matching
 * 
 * @param {Object} data - { rawExperience, role, company, targetRole, jobDescription }
 * @returns {Object} { bullets: [...], explanation: "..." }
 */
export const generateBullets = async (data) => {
  // Get AI prompt for bullet generation
  const prompt = prompts.bulletWriterPrompt(data);
  // Call Gemini API
  const result = await generateContent(prompt);
  // Parse JSON response
  return parseJsonResponse(result);
};

/**
 * Generate professional summary
 * Creates tailored professional summary based on resume and target role
 * 
 * @param {Object} data - { sections, targetRole, jobDescription }
 * @returns {Object} { summary: "..." }
 */
export const generateSummary = async (data) => {
  const prompt = prompts.summaryWriterPrompt(data);
  const result = await generateContent(prompt);
  return parseJsonResponse(result);
};

/**
 * Calculate ATS (Applicant Tracking System) score
 * Combines algorithmic analysis with AI judgment
 * Returns: overall score (0-100) + breakdown by criteria
 * 
 * Analysis includes:
 * - Keyword matching with job description
 * - Formatting compatibility with ATS
 * - Section completeness
 * - Use of action verbs and quantification
 * - Contact info presence
 * 
 * @param {Object} data - { sections, jobDescription, targetRole }
 * @returns {Object} { overall, breakdown, suggestions, missingKeywords }
 */
export const getAtsScore = async (data) => {
  const sections = data.sections || {};
  const jobDescription = data.jobDescription || '';

  // Convert resume to searchable text
  const resumeText = JSON.stringify(sections);

  // Run algorithmic analysis on resume content
  // analyzeKeywords: Finds matching keywords between resume and JD
  const keywordResults = analyzeKeywords(resumeText, jobDescription);

  // checkFormatting: Analyzes ATS-friendly formatting
  // Checks for proper structure, fonts, no tables/images, etc.
  const formatResults = checkFormatting(sections);

  // Combine algorithmic results
  const algorithmicResults = {
    keywordMatch: keywordResults,
    formatting: formatResults.formatting || 0,
    sectionCompleteness: formatResults.sectionCompleteness || 0,
    quantification: formatResults.quantification || 0,
    actionVerbs: formatResults.actionVerbs || 0,
    length: formatResults.length || 0,
    contactInfo: formatResults.contactInfo || 0,
  };

  // Get AI assessment using algorithmic baseline as context
  const prompt = prompts.atsScorerPrompt({
    ...data,
    algorithmicResults,
  });
  const result = await generateContent(prompt);
  const parsed = parseJsonResponse(result);

  // Blend algorithmic and AI scores for better accuracy
  if (parsed.breakdown) {
    const breakdown = parsed.breakdown;

    // For each major metric, average algorithmic and AI scores
    for (const metric of [
      'keywordMatch',
      'formatting',
      'sectionCompleteness',
      'quantification',
      'actionVerbs',
      'length',
      'contactInfo',
    ]) {
      // Get algorithmic score
      const algoScore =
        metric === 'keywordMatch'
          ? typeof algorithmicResults[metric] === 'object'
            ? algorithmicResults[metric].score
            : algorithmicResults[metric]
          : algorithmicResults[metric];

      // Average with AI score if available
      if (
        typeof algoScore === 'number' &&
        breakdown[metric] &&
        typeof breakdown[metric] === 'object'
      ) {
        const aiScore = breakdown[metric].score || algoScore;
        breakdown[metric].score = Math.round((algoScore + aiScore) / 2);
      }
    }

    // Extract numeric scores and calculate overall
    const scores = {};
    for (const [key, val] of Object.entries(breakdown)) {
      scores[key] = typeof val === 'object' ? val.score || 0 : val;
    }
    parsed.overall = calculateOverallScore(scores); // Weighted average
  }

  return parsed;
};

/**
 * Review resume and provide feedback
 * Identifies strengths, weaknesses, and improvement areas
 * Provides actionable suggestions for improvement
 * 
 * @param {Object} data - { sections, targetRole, jobDescription }
 * @returns {Object} { feedback: [...], strengths: [...], improvements: [...] }
 */
export const reviewResume = async (data) => {
  const prompt = prompts.reviewerPrompt(data);
  const result = await generateContent(prompt);
  return parseJsonResponse(result);
};

/**
 * Match resume against specific job description
 * Analyzes how well resume fits the job requirements
 * Returns match percentage and aligned/missing elements
 * 
 * @param {Object} data - { sections, jobDescription, targetRole }
 * @returns {Object} { matchPercentage, matched, missing }
 */
export const matchJob = async (data) => {
  const prompt = prompts.matchJobPrompt(data);
  const result = await generateContent(prompt);
  return parseJsonResponse(result);
};

/**
 * Identify skill gaps
 * Analyzes current skills vs. job requirements
 * Recommends skills to add or improve
 * 
 * @param {Object} data - { skills, jobDescription }
 * @returns {Object} { gaps: [...], recommendations: [...] }
 */
export const detectSkillGaps = async (data) => {
  const prompt = prompts.skillGapsPrompt(data);
  const result = await generateContent(prompt);
  return parseJsonResponse(result);
};

/**
 * Parse uploaded resume PDF into structured data
 * Extracts text and categorizes into resume sections
 * Returns: personalInfo, experience, education, skills, etc.
 * 
 * @param {Object} data - { resumeText }
 * @returns {Object} Parsed resume sections
 */
export const parseResume = async (data) => {
  const prompt = prompts.resumeParserPrompt(data.resumeText || '');
  const result = await generateContent(prompt);
  return parseJsonResponse(result);
};
