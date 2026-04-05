// ============================================
// ResumeContext.jsx - Resume Builder State
// ============================================
// Central state management for resume builder page.
// Provides resume data and UI state to all child components.
// All resume edits go through context functions.
// ============================================

import { createContext, useState } from 'react';

// Create context for resume data
// Accessed via useContext(ResumeContext) in components
const ResumeContext = createContext(null);

/**
 * Initial resume state structure
 * Used for new resumes and reset functionality
 * Contains all sections with empty/default values
 */
const initialResume = {
  _id: null,                    // MongoDB ID (null until saved)
  title: 'Untitled Resume',     // User-defined resume name
  templateId: 'classic',        // Visual template: classic, modern, creative, minimal, executive
  targetRole: '',               // Job title user is targeting
  jobDescription: '',           // Pasted job description for AI analysis
  sections: {
    // Contact information
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      portfolio: '',
    },
    // Professional summary
    summary: '',
    // Work experience array
    experience: [],
    // Education array
    education: [],
    // Skills organized by category
    skills: { technical: [], soft: [], languages: [] },
    // Notable projects
    projects: [],
    // Professional certifications
    certifications: [],
  },
  // ATS analysis results
  atsScore: null,
};

/**
 * ResumeProvider component
 * Wraps builder page and provides context to all child components
 */
function ResumeProvider({ children }) {
  // ========== RESUME DATA STATE ==========

  // Main resume data object
  const [resume, setResume] = useState(initialResume);

  // ========== UI STATE ==========

  // Which section is currently being edited (e.g., 'experience', 'education')
  const [activeSection, setActiveSection] = useState('personalInfo');

  // Which UI tab is active (e.g., 'sections', 'preview', 'ai')
  const [activeTab, setActiveTab] = useState('sections');

  // ========== SAVE STATE ==========

  // Whether currently saving to backend
  const [isSaving, setIsSaving] = useState(false);

  // Timestamp of last successful save
  const [lastSaved, setLastSaved] = useState(null);

  // Whether resume has unsaved changes
  // Used to show save indicator and block navigation warnings
  const [hasChanges, setHasChanges] = useState(false);

  // ========== HELPER FUNCTIONS ==========

  /**
   * Update a specific resume section
   * Example: updateSection('experience', [...])
   * Marks resume as changed
   * 
   * @param {string} sectionName - Section to update (experience, education, etc.)
   * @param {any} data - New section data
   */
  const updateSection = (sectionName, data) => {
    setResume((prev) => ({
      ...prev,
      sections: { ...prev.sections, [sectionName]: data },
    }));
    setHasChanges(true);
  };

  /**
   * Change resume visual template
   * Doesn't affect data, only appearance
   * 
   * @param {string} templateId - Template: 'classic', 'modern', 'creative', 'minimal', 'executive'
   */
  const updateTemplate = (templateId) => {
    setResume((prev) => ({ ...prev, templateId }));
    setHasChanges(true);
  };

  /**
   * Update ATS score (usually from AI analysis)
   * Does not mark as changed (external data)
   * 
   * @param {Object} atsScore - ATS analysis results
   */
  const updateAtsScore = (atsScore) => {
    setResume((prev) => ({ ...prev, atsScore }));
  };

  /**
   * Update top-level resume field
   * Used for title, targetRole, jobDescription, etc.
   * 
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const updateField = (field, value) => {
    setResume((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  /**
   * Load resume from backend
   * Used when opening existing resume
   * Marks as no changes (just loaded)
   * 
   * @param {Object} resumeData - Complete resume object from DB
   */
  const loadResume = (resumeData) => {
    setResume(resumeData);
    setHasChanges(false);
  };

  /**
   * Reset resume to blank state
   * Used for new resumes
   */
  const resetResume = () => {
    setResume(initialResume);
    setHasChanges(false);
  };

  /**
   * Calculate resume completion percentage
   * Checks key sections: name, email, summary, experience, education, skills
   * 
   * @returns {number} Percentage 0-100
   */
  const getCompletionPercentage = () => {
    // Define required fields for a complete resume
    const checks = [
      resume.sections.personalInfo.fullName,
      resume.sections.personalInfo.email,
      resume.sections.summary,
      resume.sections.experience.length > 0,
      resume.sections.education.length > 0,
      resume.sections.skills.technical.length > 0,
    ];

    // Count how many are filled
    const filled = checks.filter(Boolean).length;

    // Return percentage
    return Math.round((filled / checks.length) * 100);
  };

  // ========== CONTEXT VALUE ==========

  // Combine all state and functions into context value
  const value = {
    // Resume data
    resume,
    setResume,
    loadResume,
    resetResume,

    // UI state
    activeSection,
    setActiveSection,
    activeTab,
    setActiveTab,

    // Save state
    isSaving,
    setIsSaving,
    lastSaved,
    setLastSaved,
    hasChanges,
    setHasChanges,

    // Helper functions
    updateSection,
    updateTemplate,
    updateAtsScore,
    updateField,
    getCompletionPercentage,
  };

  return (
    <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
  );
}

export { ResumeContext, ResumeProvider };
