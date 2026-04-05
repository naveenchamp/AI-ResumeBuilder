// ============================================
// error.middleware.js - Global Error Handling
// ============================================
// Two middleware functions for error handling.
// 404 handler must come before error handler in app.use() order.
// Error handler should be last in middleware chain.
// ============================================

/**
 * 404 Not Found handler
 * Catches requests to non-existent routes
 * Should be added to Express app after all other routes
 * 
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Not called from this handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    // Template literal shows what route was attempted
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global error handler
 * Catches all errors thrown in route handlers or middlewares.
 * Must have 4 parameters (err, req, res, next) to be recognized as error handler
 * Should be last middleware in the stack
 * 
 * @param {Error} err - The error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Not used in this handler
 */
export const errorHandler = (err, req, res, next) => {
  // Log error to console for debugging
  console.error('Error:', err.message);

  // Return error response to client
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
  });
};
