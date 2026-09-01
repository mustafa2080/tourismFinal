import Cookies from 'js-cookie';

/**
 * Token Management Utilities
 * Centralized functions for handling authentication tokens
 */

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenManager = {
  /**
   * Get access token
   * @returns {string|null}
   */
  getToken() {
    return Cookies.get(TOKEN_KEY);
  },

  /**
   * Get refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    return Cookies.get(REFRESH_TOKEN_KEY);
  },

  /**
   * Set access token
   * @param {string} token
   * @param {number} expiresInDays - Default: 7 days
   */
  setToken(token, expiresInDays = 7) {
    Cookies.set(TOKEN_KEY, token, {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  },

  /**
   * Set refresh token
   * @param {string} refreshToken
   * @param {number} expiresInDays - Default: 30 days
   */
  setRefreshToken(refreshToken, expiresInDays = 30) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  },

  /**
   * Set both tokens
   * @param {string} token
   * @param {string} refreshToken
   */
  setTokens(token, refreshToken) {
    this.setToken(token);
    this.setRefreshToken(refreshToken);
  },

  /**
   * Remove access token
   */
  removeToken() {
    Cookies.remove(TOKEN_KEY);
  },

  /**
   * Remove refresh token
   */
  removeRefreshToken() {
    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  /**
   * Clear all tokens
   */
  clearTokens() {
    this.removeToken();
    this.removeRefreshToken();
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Decode JWT token (basic decoding, doesn't verify signature)
   * @param {string} token
   * @returns {object|null}
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param {string} token
   * @returns {boolean}
   */
  isTokenExpired(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },

  /**
   * Get token expiration time
   * @param {string} token
   * @returns {Date|null}
   */
  getTokenExpiration(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  },
};

export default tokenManager;
