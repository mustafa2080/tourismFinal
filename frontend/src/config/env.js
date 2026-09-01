/**
 * Environment Configuration
 * Centralized environment variable handling
 */

/**
 * Get API base URL
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

/**
 * Get Socket URL
 */
export const getSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
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