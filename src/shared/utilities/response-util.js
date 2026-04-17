/**
 * Standardized HTTP response utility for API consistency
 * 
 * Ensures all API endpoints return responses in the same format
 * with type, data, and message fields. This simplifies frontend
 * response handling and provides consistent error reporting.
 */
export const ResponseUtil = {
  /**
   * Sends a successful response with standardized format
   * 
   * @param {Object} res - Express response object
   * @param {*} data - Response data payload
   * @param {string} message - Success message
   * @param {number} status - HTTP status code (default: 200)
   */
  respondOk: (res, data, message, status = 200) => {
    res.status(status).json({ type: 'success', data, message });
  },

  /**
   * Sends an error response with standardized format
   * 
   * @param {Object} res - Express response object
   * @param {number} status - HTTP status code (default: 500)
   * @param {*} data - Error data payload (default: null)
   * @param {string} message - Error message
   */
  respondError: (res, status = 500, data = null, message = 'An unexpected error occurred') => {
    res.status(status).json({ type: 'error', data, message });
  }
};
