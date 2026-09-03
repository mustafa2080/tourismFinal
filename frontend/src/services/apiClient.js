import axios from 'axios';
import Cookies from 'js-cookie';
import { getApiUrl } from '../config/env.js';

/**
 * API Client Setup
 * - Base configuration for all API calls
 * - JWT token management
 * - CSRF token management
 * - Error handling & response transformation
 * - Automatic token refresh on 401
 * - Request deduplication to prevent rate limiting
 */

const API_URL = getApiUrl();

// Request deduplication cache
const pendingRequests = new Map();

// CSRF Token Storage
let csrfToken = localStorage.getItem('csrfToken') || null;
let sessionId = localStorage.getItem('sessionId') || null;

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds default timeout (can be overridden per request)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in all requests
});

/**
 * Request Interceptor
 * - Attach JWT token to every request
 * - Token stored in secure cookie
 * - Attach CSRF token for state-changing requests (POST, PUT, DELETE)
 * - Deduplicate identical concurrent requests (but NOT cache-bust requests)
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    
    // Only log in development or if there's an issue
    if (!token && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ [apiClient.request] No token available for:', config.url);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔐 CSRF Token Management
    // For state-changing requests (POST, PUT, DELETE, PATCH), attach CSRF token
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase())) {
      if (csrfToken && sessionId) {
        config.headers['X-CSRF-Token'] = csrfToken;
        config.headers['X-Session-Id'] = sessionId;
      } else {
        console.warn('⚠️ [apiClient.request] CSRF token missing for', config.method, config.url);
      }
    }

    // Request deduplication: if the same GET request is pending, return that instead
    // BUT: Skip deduplication if URL has cache-bust parameter (t=timestamp)
    if (config.method === 'GET' && !config.url.includes('t=')) {
      const cacheKey = `${config.method}:${config.url}`;
      if (pendingRequests.has(cacheKey)) {
        config.adapter = () => pendingRequests.get(cacheKey);
      } else {
        // Store promise for this request
        const originalAdapter = axios.defaults.adapter;
        config.adapter = (cfg) => {
          const promise = originalAdapter(cfg);
          pendingRequests.set(cacheKey, promise);
          promise.finally(() => {
            pendingRequests.delete(cacheKey);
          });
          return promise;
        };
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ [apiClient.request] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handle errors globally
 * - Return only data (not full response)
 * - Handle 401 (token expired) with automatic refresh
 * - Log errors
 */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // 🔐 CSRF Token Management - Extract tokens from response headers for ALL requests
    // The backend sends new CSRF token on each GET request for security rotation
    const newCsrfToken = response.headers?.['x-csrf-token'];
    const newSessionId = response.headers?.['x-session-id'];
    
    if (newCsrfToken) {
      csrfToken = newCsrfToken;
      localStorage.setItem('csrfToken', newCsrfToken);
      console.log('✅ [apiClient.response] CSRF token updated from headers');
    }
    
    if (newSessionId) {
      sessionId = newSessionId;
      localStorage.setItem('sessionId', newSessionId);
      console.log('✅ [apiClient.response] Session ID updated from headers');
    }
    
    // Also check response body for CSRF tokens (from /auth/csrf-token endpoint)
    if (response.data?.data?.csrfToken && !newCsrfToken) {
      csrfToken = response.data.data.csrfToken;
      localStorage.setItem('csrfToken', csrfToken);
      console.log('✅ [apiClient.response] CSRF token updated from body');
    }
    
    if (response.data?.data?.sessionId && !newSessionId) {
      sessionId = response.data.data.sessionId;
      localStorage.setItem('sessionId', sessionId);
      console.log('✅ [apiClient.response] Session ID updated from body');
    }
    
    // Only log errors or in development
    if (process.env.NODE_ENV === 'development' && response.status >= 400) {
      console.warn('⚠️ [apiClient.response]:', response.status, response.config?.url);
    }
    
    // Return the full response.data object (which contains success, data, pagination, etc.)
    // Services will extract what they need
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [apiClient.response]:', error.response?.status, errorMessage);
    }

    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('⚠️ [apiClient.response] 401 Unauthorized - attempting token refresh');
      
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken');

      console.log('🔄 [apiClient.response] Refresh token check:', {
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length || 0
      });

      if (!refreshToken) {
        console.error('❌ [apiClient.response] No refresh token available');
        Cookies.remove('authToken');
        Cookies.remove('refreshToken');
        isRefreshing = false;
        
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      try {
        // Try to refresh the token
        console.log('🔐 [apiClient.response] Calling refresh-token endpoint...');
        
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        console.log('✅ [apiClient.response] Token refreshed successfully');

        const tokenData = response.data?.data || response.data;
        const { token, refreshToken: newRefreshToken } = tokenData;

        // Validate tokens exist
        if (!token) {
          throw new Error('No token in refresh response');
        }

        // Update tokens
        Cookies.set('authToken', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        if (newRefreshToken) {
          Cookies.set('refreshToken', newRefreshToken, {
            expires: 30,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
        }

        // Update the authorization header
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);
        
        console.log('🔄 [apiClient.response] Retrying original request with new token');
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('❌ [apiClient.response] Token refresh failed:', refreshError.message);
        processQueue(refreshError, null);
        Cookies.remove('authToken');
        Cookies.remove('refreshToken');
        
        return Promise.reject(new Error('Session expired. Please login again.'));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('❌ [apiClient.response] Access forbidden:', errorMessage);
      return Promise.reject(new Error('Access denied'));
    }

    // Handle 404 - Not found
    // For GET requests, resolve gracefully so read flows can render "no data" states.
    // For state-changing requests (POST/PUT/DELETE/PATCH), reject so the caller's
    // catch block runs and the UI doesn't assume an action succeeded when it didn't.
    if (error.response?.status === 404) {
      console.warn('⚠️ [apiClient.response] Resource not found (404):', errorMessage);
      if (originalRequest?.method?.toUpperCase() === 'GET') {
        return error.response?.data || { success: false, message: 'Not found', status: 404 };
      }
      return Promise.reject(error.response?.data || new Error(errorMessage));
    }

    // Handle 500 - Server error
    if (error.response?.status >= 500) {
      console.error('❌ [apiClient.response] Server error:', errorMessage);
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    // Handle network errors
    if (!error.response) {
      console.error('❌ [apiClient.response] Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Default error
    console.error('❌ [apiClient.response] Default error handler:', errorMessage);
    return Promise.reject(
      error.response?.data || new Error(errorMessage)
    );
  }
);

/**
 * 🔐 Initialize CSRF Token on App Load
 * Call this in your main App component (useEffect in App.jsx)
 */
export const initializeCSRFToken = async () => {
  try {
    console.log('🔐 [CSRF] Initializing CSRF token...');
    
    // Make a GET request to trigger CSRF token generation
    const response = await apiClient.get('/auth/csrf-token');
    
    // Extract CSRF token and session ID from response headers (set-cookie handles sessionId)
    const newCsrfToken = response.headers?.['x-csrf-token'] || response.data?.data?.csrfToken;
    const newSessionId = response.headers?.['x-session-id'] || response.data?.data?.sessionId;
    
    if (newCsrfToken) {
      // Update module-level variable and localStorage
      csrfToken = newCsrfToken;
      localStorage.setItem('csrfToken', newCsrfToken);
      console.log('✅ [CSRF] Token initialized from headers/response');
    }
    
    if (newSessionId) {
      // Update module-level variable and localStorage
      sessionId = newSessionId;
      localStorage.setItem('sessionId', newSessionId);
      console.log('✅ [CSRF] Session ID initialized');
    }
    
    // If we didn't get tokens from headers/response data, check localStorage
    if (!csrfToken) {
      csrfToken = localStorage.getItem('csrfToken');
      console.log('⚠️ [CSRF] Token loaded from localStorage (may be expired)');
    }
    
    if (!sessionId) {
      sessionId = localStorage.getItem('sessionId');
      console.log('⚠️ [CSRF] Session ID loaded from localStorage');
    }
    
    console.log('✅ [CSRF] Token setup complete:', {
      hasToken: !!csrfToken,
      hasSessionId: !!sessionId,
      tokenLength: csrfToken?.length || 0,
      tokenPreview: csrfToken ? csrfToken.substring(0, 8) + '...' : 'none'
    });
    
    return true;
  } catch (error) {
    console.error('❌ [CSRF] Failed to initialize token:', error.message);
    // Retry with fresh tokens
    try {
      const retryResponse = await axios.get(`${API_URL}/auth/csrf-token`, { withCredentials: true });
      const retryToken = retryResponse.headers?.['x-csrf-token'] || retryResponse.data?.data?.csrfToken;
      const retrySessionId = retryResponse.headers?.['x-session-id'] || retryResponse.data?.data?.sessionId;
      
      if (retryToken) {
        csrfToken = retryToken;
        localStorage.setItem('csrfToken', retryToken);
      }
      if (retrySessionId) {
        sessionId = retrySessionId;
        localStorage.setItem('sessionId', retrySessionId);
      }
      
      console.log('✅ [CSRF] Token re-initialized on retry');
      return true;
    } catch (retryError) {
      console.error('❌ [CSRF] Retry failed:', retryError.message);
      return false;
    }
  }
};

/**
 * 🔐 Get Current CSRF Token Status
 * Use for debugging purposes
 */
export const getCSRFStatus = () => {
  return {
    hasToken: !!csrfToken,
    hasSessionId: !!sessionId,
    tokenLength: csrfToken?.length || 0,
  };
};

export default apiClient;
