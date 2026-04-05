// ============================================
// api.js - HTTP Request Wrapper with Auth
// ============================================
// Centralizes all API calls to backend.
// Automatically adds JWT token from localStorage.
// Handles JSON serialization and error handling.
// ============================================

/**
 * Base URL for API
 * Uses environment variable VITE_API_URL or defaults to local dev server
 * Set in .env.local or .env file
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Core fetch wrapper with error handling
 * Adds JWT token from localStorage to all requests
 * Converts response to JSON and checks for errors
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/auth/login')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Object} Response data from server
 * @throws {Error} On network error or non-2xx response
 */
const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  // Add JWT token to Authorization header if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type to JSON for non-FormData requests
  // (FormData sets its own Content-Type with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Make fetch request with full URL
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse response as JSON
  const data = await response.json();

  // Check if response status indicates success (2xx)
  if (!response.ok) {
    // Create error with server message
    const error = new Error(data.message || 'Request failed');
    // Attach full response for debugging
    error.response = { data, status: response.status };
    throw error;
  }

  return data;
};

/**
 * API object with shortcuts for common HTTP methods
 * Each method calls fetchApi with appropriate method and body handling
 */
const API = {
  /**
   * GET request
   * @param {string} endpoint - API path
   * @returns {Promise} Response data
   */
  get: (endpoint) => fetchApi(endpoint),

  /**
   * POST request
   * Handles both JSON objects and FormData (for file uploads)
   * @param {string} endpoint - API path
   * @param {Object|FormData} body - Request body
   * @returns {Promise} Response data
   */
  post: (endpoint, body) =>
    fetchApi(endpoint, {
      method: 'POST',
      // Keep FormData as-is, stringify JSON objects
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  /**
   * PUT request - Update resource
   * @param {string} endpoint - API path
   * @param {Object} body - Request body (typically full resource)
   * @returns {Promise} Response data
   */
  put: (endpoint, body) =>
    fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  /**
   * DELETE request - Remove resource
   * @param {string} endpoint - API path
   * @returns {Promise} Response data
   */
  delete: (endpoint) =>
    fetchApi(endpoint, {
      method: 'DELETE',
    }),
};

export default API;
