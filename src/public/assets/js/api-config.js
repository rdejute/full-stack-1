const RocketApiConfig = (() => {
  const getBaseUrl = () => window.location.origin;

  const buildHeaders = ({ json = true, requireAuth = false } = {}) => {
    const headers = {};

    if (json) {
      headers['Content-Type'] = 'application/json';
    }

    if (requireAuth) {
      headers.Authorization = 'Bearer mySecretKey123'; // Replace <your_token_here> with the actual token value
    }

    return headers;
  };

  return {
    getBaseUrl,
    buildHeaders,
  };
})();