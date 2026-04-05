// ============================================
// scoreCalculator.js - ATS Score Calculation
// ============================================
// Calculates overall ATS score from individual metrics.
// Uses weighted averaging to determine final score.
// ============================================

/**
 * Weights for each ATS metric
 * Total: 1.0 (100%)
 * Keyword matching is most important (20%)
 * followed by  bullet quality and formatting
 */
const WEIGHTS = {
  keywordMatch: 0.20,       // Most important: Does resume match job description?
  bulletQuality: 0.15,      // Quality of achievement bullets
  formatting: 0.10,         // ATS-friendly formatting
  sectionCompleteness: 0.10, // All major sections present
  summaryStrength: 0.10,    // Professional summary quality
  skillCoverage: 0.10,      // Completeness of skills section
  quantification: 0.10,     // Use of metrics/numbers in bullets
  actionVerbs: 0.05,        // Use of strong action verbs
  length: 0.05,             // Appropriate resume length
  contactInfo: 0.05,        // Contact information completeness
};

/**
 * Calculate overall ATS score from individual metrics
 * Uses weighted average: overall = sum(metric * weight) for each metric
 * 
 * Example: If keywordMatch=80 and weight=0.20, contributes 16 points
 * 
 * @param {Object} metrics - Individual metric scores { keywordMatch: 85, formatting: 75, ... }
 * @returns {number} Overall score 0-100
 */
const calculateOverallScore = (metrics) => {
  let overall = 0;

  // Add weighted contribution of each metric
  for (const [metric, weight] of Object.entries(WEIGHTS)) {
    let score = metrics[metric] || 0;

    // Handle both simple numbers and objects with score property
    if (typeof score === 'object') {
      score = score.score || 0;
    }

    // Add weighted contribution to overall
    overall += score * weight;
  }

  return Math.round(overall);
};

/**
 * Categorize ATS score into quality levels
 * Helps users understand performance at a glance
 * 
 * @param {number} score - ATS score 0-100
 * @returns {string} Category: 'strong' | 'good' | 'needs-work' | 'weak'
 */
const getScoreCategory = (score) => {
  if (score >= 80) return 'strong';          // Excellent: 80-100
  if (score >= 60) return 'good';            // Good: 60-79
  if (score >= 40) return 'needs-work';      // Needs improvement: 40-59
  return 'weak';                             // Poor: 0-39
};

export { calculateOverallScore, getScoreCategory };
