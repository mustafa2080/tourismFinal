/**
 * Environment Configuration
 * Centralized environment variable handling
 */

/**
 * Force a URL to match the page's current protocol when running in a
 * browser over https. This protects us even if VITE_API_URL /
 * VITE_SOCKET_URL (or their fallback defaults) were accidentally set with
 * "http://" on a production build - it avoids browsers blocking
 * "mixed content" requests. localhost URLs are left untouched since
 * they're for local dev only.
 */
const enforcePageProtocol = (url) => {
  if (typeof window === 'undefined') return url;
  if (window.location.protocol !== 'https:') return url;
  if (url.includes('localhost') || url.includes('127.0.0.1')) return url;
  return url.replace(/^http:\/\//i, 'https://');
};

/**
 * Get API base URL
 */
export const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return enforcePageProtocol(url);
};

/**
 * Get Socket URL
 */
export const getSocketUrl = () => {
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  return enforcePageProtocol(url);
};

/**
 * Get environment mode
 */
export const getEnvironment = () => {
  return import.meta.env.MODE || 'development';
};

/**
 * Check if production
 */
export const isProduction = () => {
  return getEnvironment() === 'production';
};

/**
 * Check if development
 */
export const isDevelopment = () => {
  return getEnvironment() === 'development';
};

/**
 * Get all environment variables
 */
export const getEnvConfig = () => {
  return {
    apiUrl: getApiUrl(),
    socketUrl: getSocketUrl(),
    environment: getEnvironment(),
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    debugMode: import.meta.env.VITE_DEBUG === 'true'
  };
};

export default {
  getApiUrl,
  getSocketUrl,
  getEnvironment,
  isProduction,
  isDevelopment,
  getEnvConfig
};
