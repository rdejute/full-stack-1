/**
 * Utility object for standardizing HTTP response formats.
 * Provides consistent response structures for success and error cases.
 */
export const ResponseUtil = {
  respondOk: (res, data, message, status = 200) => {
    res.status(status).json({ type: 'success', data, message });
  },
  respondError: (res, status = 500, data = null, message = 'An unexpected error occurred') => {
    res.status(status).json({ type: 'error', data, message });
  }
};
