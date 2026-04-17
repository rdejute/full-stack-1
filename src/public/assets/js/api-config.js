/**
 * Centralized API configuration for frontend-backend communication
 * 
 * Provides consistent base URL and header configuration across all frontend modules.
 * Uses IIFE pattern to encapsulate configuration and expose public methods.
 */
const RocketApiConfig = (() => {
  /**
   * Returns the base URL for API requests
   * 
   * @returns {string} The base URL for the backend API server
   */
  const getBaseUrl = () => {
    return 'http://localhost:3004';
  };

  /**
   * Builds HTTP headers for API requests
   * 
   * @param {Object} options - Header configuration options
   * @param {boolean} options.json - Whether to set Content-Type to application/json
   * @param {boolean} options.requireAuth - Whether to include Authorization header
   * @returns {Object} Headers object with appropriate headers set
   */
  const buildHeaders = ({ json = true, requireAuth = false } = {}) => {
    const headers = {};

    // Set JSON content type for API requests that send data
    if (json) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header for protected endpoints
    // Token must match SECRET environment variable on backend
    if (requireAuth) {
      headers.Authorization = 'mySecretKey123';
    }

    return headers;
  };

  return {
    getBaseUrl,
    buildHeaders,
  };
})();

// Expose configuration globally for use across all frontend modules
window.RocketApiConfig = RocketApiConfig;