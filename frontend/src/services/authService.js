import apiClient from './apiClient';
import Cookies from 'js-cookie';

/**
 * Auth Service
 * Handles all authentication-related API calls
 * - Register new user
 * - Login user
 * - Get current user info
 * - Logout
 * - Change password
 * - Password reset
 */

export const authService = {
  /**
   * Register a new user
   * @param {string} name - Full name
   * @param {string} email - Email address
   * @param {string} phone - Phone number
   * @param {string} password - Password
   * @returns {Promise<{user, token}>}
   */
  async register(name, email, phone, password) {
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        phone,
        password,
      });

      // apiClient interceptor returns response.data, so we get:
      // { success, message, data: { user, token, refreshToken } }
      const { user, token, refreshToken } = response.data;

      // Store tokens if provided
      if (token) {
        Cookies.set('authToken', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, {
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      return { user, token, refreshToken };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Login user
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {Promise<{user, token}>}
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      // apiClient interceptor returns response.data, so we get:
      // { success, message, data: { user, token, refreshToken } }
      const { user, token, refreshToken } = response.data;

      // Store tokens
      if (token) {
        Cookies.set('authToken', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, {
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      return { user, token, refreshToken };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * - Clear auth token
   * - Redirect to login page
   */
  logout() {
    Cookies.remove('authToken');
    Cookies.remove('refreshToken');
    window.location.href = '/login';
  },

  /**
   * Refresh access token
   * @returns {Promise<{token, refreshToken}>}
   */
  async refreshAccessToken() {
    try {
      const refreshToken = Cookies.get('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken,
      });

      // apiClient returns response.data
      const { data } = response;
      const { token, refreshToken: newRefreshToken } = data;

      // Update tokens
      if (token) {
        Cookies.set('authToken', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      if (newRefreshToken) {
        Cookies.set('refreshToken', newRefreshToken, {
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<{id, name, email, phone, role, avatar}>}
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/profile');
      console.log('🔐 getCurrentUser response:', response);
      // apiClient interceptor returns response.data directly
      // So response is: { success, data: { id, name, email, phone, avatar, role, created_at } }
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      // If 401, user is not authenticated
      if (error.response?.status === 401) {
        Cookies.remove('authToken');
        Cookies.remove('refreshToken');
      }
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} data - Updated profile data {name, phone, avatar}
   * @returns {Promise<user>}
   */
  async updateProfile(userId, data) {
    try {
      const response = await apiClient.put('/auth/profile', data);
      // apiClient returns response.data, so we get { success, message, data: { id, name, email, phone, avatar } }
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{success}>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const response = await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * - Sends reset link to email
   * @param {string} email - Email address
   * @returns {Promise<{success, message}>}
   */
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/password-reset', {
        email,
      });
      return response;
    } catch (error) {
      console.error('Failed to request password reset:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise<{success, message}>}
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
      return response;
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = Cookies.get('authToken');
    return !!token;
  },

  /**
   * Get stored JWT token
   * @returns {string|null}
   */
  getToken() {
    return Cookies.get('authToken');
  },
};

export default authService;
