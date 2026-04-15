const RocketApiConfig = (() => {
  const getBaseUrl = () => {
    return 'http://localhost:3004';
  };

  const buildHeaders = ({ json = true, requireAuth = false } = {}) => {
    const headers = {};

    if (json) {
      headers['Content-Type'] = 'application/json';
    }

    if (requireAuth) {
      headers.Authorization = 'mySecretKey123'; // Replace <your_token_here> with the actual token value
    }

    return headers;
  };

  return {
    getBaseUrl,
    buildHeaders,
  };
})();

window.RocketApiConfig = RocketApiConfig;