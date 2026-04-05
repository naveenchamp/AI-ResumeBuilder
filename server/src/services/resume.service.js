// ============================================
// resume.service.js - Resume CRUD Business Logic
// ============================================
// Handles all resume data operations:
// - Create, read, update, delete resumes
// - Update individual sections and templates
// - Sanitize subdocument IDs from form data
// ============================================

import mongoose from 'mongoose';
import Resume from '../models/Resume.model.js';

/**
 * Normalize loose AI/file-upload output into the embedded shapes
 * expected by the Resume schema.
 *
 * This keeps upload/import resilient when the model returns items like:
 * - projects: ["Portfolio Website"]
 * - certifications: ["AWS Solutions Architect"]
 *
 * @param {Object} sections - Resume sections object
 * @returns {Object} Cleaned sections ready for Mongoose
 */
const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const pickString = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
};

const normalizeStringArray = (value, splitPattern = null) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeStringArray(item, splitPattern));
  }

  if (value === undefined || value === null) {
    return [];
  }

  if (isPlainObject(value)) {
    const candidate = pickString(
      value.name,
      value.value,
      value.label,
      value.text,
      value.title
    );
    return candidate ? [candidate] : [];
  }

  const text = String(value).trim();
  if (!text) return [];

  const items = splitPattern ? text.split(splitPattern) : [text];
  return items.map((item) => item.trim()).filter(Boolean);
};

const withValidSubdocumentId = (source, normalized) => {
  if (
    isPlainObject(source) &&
    source._id &&
    mongoose.Types.ObjectId.isValid(source._id)
  ) {
    return { _id: source._id, ...normalized };
  }
  return normalized;
};

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', 'yes', 'current', 'present'].includes(
      value.trim().toLowerCase()
    );
  }
  return Boolean(value);
};

const normalizeExperience = (entry) => {
  if (!isPlainObject(entry)) return null;

  return withValidSubdocumentId(entry, {
    company: pickString(entry.company, entry.employer, entry.organization),
    role: pickString(entry.role, entry.title, entry.position),
    startDate: pickString(entry.startDate, entry.start, entry.from),
    endDate: pickString(entry.endDate, entry.end, entry.to),
    current: normalizeBoolean(entry.current),
    bullets: normalizeStringArray(
      entry.bullets ?? entry.highlights ?? entry.achievements ?? entry.responsibilities,
      /\r?\n|[•▪◦]\s+|-\s+/
    ),
  });
};

const normalizeEducation = (entry) => {
  if (!isPlainObject(entry)) return null;

  return withValidSubdocumentId(entry, {
    institution: pickString(entry.institution, entry.school, entry.university),
    degree: pickString(entry.degree, entry.qualification),
    field: pickString(entry.field, entry.major, entry.specialization),
    startDate: pickString(entry.startDate, entry.start, entry.from),
    endDate: pickString(entry.endDate, entry.end, entry.to),
    gpa: pickString(entry.gpa, entry.grade),
  });
};

const normalizeProject = (entry) => {
  if (typeof entry === 'string') {
    const name = entry.trim();
    return name
      ? {
          name,
          description: '',
          technologies: [],
          link: '',
          bullets: [],
        }
      : null;
  }

  if (!isPlainObject(entry)) return null;

  return withValidSubdocumentId(entry, {
    name: pickString(entry.name, entry.title, entry.projectName),
    description: pickString(entry.description, entry.summary, entry.overview),
    technologies: normalizeStringArray(
      entry.technologies ?? entry.techStack ?? entry.stack,
      /,|\r?\n|\|/
    ),
    link: pickString(entry.link, entry.url, entry.github, entry.demo),
    bullets: normalizeStringArray(
      entry.bullets ?? entry.highlights ?? entry.achievements ?? entry.features,
      /\r?\n|[•▪◦]\s+|-\s+/
    ),
  });
};

const normalizeCertification = (entry) => {
  if (typeof entry === 'string') {
    const name = entry.trim();
    return name
      ? {
          name,
          issuer: '',
          date: '',
          link: '',
        }
      : null;
  }

  if (!isPlainObject(entry)) return null;

  return withValidSubdocumentId(entry, {
    name: pickString(entry.name, entry.title, entry.certification, entry.certificate),
    issuer: pickString(entry.issuer, entry.organization, entry.authority),
    date: pickString(entry.date, entry.issuedDate, entry.issueDate),
    link: pickString(entry.link, entry.url, entry.credentialLink, entry.credentialUrl),
  });
};

const normalizeObjectArray = (value, normalizer) => {
  if (!Array.isArray(value)) return [];
  return value.map(normalizer).filter(Boolean);
};

const sanitizeSections = (sections) => {
  if (!sections) return sections;

  return {
    personalInfo: {
      fullName: pickString(sections.personalInfo?.fullName),
      email: pickString(sections.personalInfo?.email),
      phone: pickString(sections.personalInfo?.phone),
      location: pickString(sections.personalInfo?.location),
      linkedIn: pickString(sections.personalInfo?.linkedIn),
      portfolio: pickString(sections.personalInfo?.portfolio),
    },
    summary:
      typeof sections.summary === 'string'
        ? sections.summary.trim()
        : pickString(sections.summary?.text, sections.summary),
    experience: normalizeObjectArray(sections.experience, normalizeExperience),
    education: normalizeObjectArray(sections.education, normalizeEducation),
    skills: {
      technical: normalizeStringArray(sections.skills?.technical, /,|\r?\n|\|/),
      soft: normalizeStringArray(sections.skills?.soft, /,|\r?\n|\|/),
      languages: normalizeStringArray(sections.skills?.languages, /,|\r?\n|\|/),
    },
    projects: normalizeObjectArray(sections.projects, normalizeProject),
    certifications: normalizeObjectArray(
      sections.certifications,
      normalizeCertification
    ),
  };
};

const sanitizeSectionValue = (sectionName, sectionData) => {
  switch (sectionName) {
    case 'personalInfo':
      return sanitizeSections({ personalInfo: sectionData }).personalInfo;
    case 'summary':
      return sanitizeSections({ summary: sectionData }).summary;
    case 'experience':
      return sanitizeSections({ experience: sectionData }).experience;
    case 'education':
      return sanitizeSections({ education: sectionData }).education;
    case 'skills':
      return sanitizeSections({ skills: sectionData }).skills;
    case 'projects':
      return sanitizeSections({ projects: sectionData }).projects;
    case 'certifications':
      return sanitizeSections({ certifications: sectionData }).certifications;
    default:
      return sectionData;
  }
};

/**
 * Create new resume
 * Initializes resume with basic metadata and empty sections
 * 
 * @param {string} userId - User ID
 * @param {Object} data - { title?, templateId?, targetRole? }
 * @returns {Object} Created resume document
 */
export const createResume = async (userId, data = {}) => {
  const resume = await Resume.create({
    userId,
    title: data.title || 'Untitled Resume',
    templateId: data.templateId || 'classic',
    targetRole: data.targetRole || '',
  });
  return resume;
};

/**
 * Get all resumes for a user
 * Returns resumes sorted by most recently updated first
 * 
 * @param {string} userId - User ID
 * @returns {Array} Array of resume documents
 */
export const getResumesByUser = async (userId) => {
  const resumes = await Resume.find({ userId })
    .sort({ updatedAt: -1 })       // Sort: newest first
    .select('-__v');                // Exclude internal MongoDB field
  return resumes;
};

/**
 * Get single resume by ID
 * Validates user ownership before returning
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID (for access control)
 * @returns {Object} Resume document
 * @throws {Error} 404 if resume not found or not owned by user
 */
export const getResumeById = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId }).select('-__v');

  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

/**
 * Update entire resume or specific fields
 * Sanitizes subdocument IDs before saving
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID (for access control)
 * @param {Object} updateData - Fields to update
 * @returns {Object} Updated resume document
 * @throws {Error} 404 if resume not found or not owned by user
 */
export const updateResume = async (resumeId, userId, updateData) => {
  // Clean subdocument IDs if sections are being updated
  if (updateData.sections) {
    updateData.sections = sanitizeSections(updateData.sections);
  }

  // Using Mongoose $set operator for atomic update
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },    // Match by ID and owner
    { $set: updateData },          // Update fields
    { returnDocument: 'after' }    // Return updated document
  );

  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

/**
 * Update a specific section of resume
 * Handles array fields (experience, education, etc.) specially
 *
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID (for access control)
 * @param {string} sectionName - Section to update (e.g., 'experience')
 * @param {Object|Array} sectionData - New section data
 * @returns {Object} Updated resume document
 * @throws {Error} 404 if resume not found
 */
export const updateSection = async (resumeId, userId, sectionName, sectionData) => {
  const cleanData = sanitizeSectionValue(sectionName, sectionData);

  // Build nested field path for Mongoose update
  // e.g., 'sections.experience' for experience section
  const updateKey = `sections.${sectionName}`;

  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { [updateKey]: cleanData } },
    { returnDocument: 'after' }
  );

  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

/**
 * Update resume template (visual style)
 * Changes the template used for PDF generation
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID (for access control)
 * @param {string} templateId - New template ID
 * @returns {Object} Updated resume document
 * @throws {Error} 404 if resume not found
 */
export const updateTemplate = async (resumeId, userId, templateId) => {
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { templateId } },
    { returnDocument: 'after' }
  );

  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

/**
 * Create resume from uploaded PDF
 * Stores parsed content in new resume
 * 
 * @param {string} userId - User ID
 * @param {Object} parsedSections - Parsed resume content
 * @param {string} title - Optional custom title
 * @returns {Object} Created resume document
 */
export const createFromUpload = async (userId, parsedSections, title = 'Uploaded Resume') => {
  const resume = await Resume.create({
    userId,
    title,
    templateId: 'classic',
    sections: sanitizeSections(parsedSections),
  });
  return resume;
};

/**
 * Delete resume
 * Permanently removes resume from database
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID (for access control)
 * @returns {Object} Deleted resume document
 * @throws {Error} 404 if resume not found or not owned by user
 */
export const deleteResume = async (resumeId, userId) => {
  const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });

  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};
