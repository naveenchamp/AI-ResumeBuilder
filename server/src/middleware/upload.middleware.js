// ============================================
// upload.middleware.js - File Upload Handler
// ============================================
// Configures multer for PDF file uploads.
// Stores files in memory and validates file type.
// ============================================

import multer from 'multer';

/**
 * Memory storage configuration
 * Stores files in RAM instead of disk (5MB limit enforced below)
 * Good for small files that are processed immediately
 * (vs. disk storage if files need to be persisted)
 */
const storage = multer.memoryStorage();

/**
 * File filter function
 * Validates that uploaded file is a PDF
 * Rejects non-PDF files with error message
 * 
 * @param {Request} req - Express request
 * @param {File} file - File being uploaded
 * @param {Function} cb - Callback(error, boolean)
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    // Accept PDF files
    cb(null, true);
  } else {
    // Reject non-PDF files
    cb(new Error('Only PDF files are allowed'), false);
  }
};

/**
 * Multer middleware instance
 * Configured to:
 * - Store in memory
 * - Only accept PDF files
 * - Limit file size to 5MB
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
  },
});

export default upload;
