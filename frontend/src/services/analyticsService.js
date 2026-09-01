import apiClient from './apiClient';

export const analyticsService = {
  /**
   * Track page view
   * @param {string} pageName - Page name/URL
   * @param {Object} metadata - Additional metadata (optional)
   * @returns {Promise<void>}
   */
  async trackPageView(pageName, metadata = {}) {
    if (!pageName) return;
    
    return apiClient.post('/analytics/page-view', {
      pageName,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },

  /**
   * Track custom event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   * @returns {Promise<void>}
   */
  async trackEvent(eventName, data = {}) {
    if (!eventName) return;
    
    return apiClient.post('/analytics/event', {
      eventName,
      data,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Track user action
   * @param {string} action - Action name (click, submit, etc.)
   * @param {string} target - Target element or component
   * @returns {Promise<void>}
   */
  async trackAction(action, target) {
    return this.trackEvent('user_action', { action, target });
  },

  /**
   * Track conversion (successful booking, purchase)
   * @param {string} bookingId - Booking ID
   * @param {number} amount - Booking amount
   * @param {Object} metadata - Additional data
   * @returns {Promise<void>}
   */
  async trackConversion(bookingId, amount, metadata = {}) {
    return apiClient.post('/analytics/conversion', {
      bookingId,
      amount,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },

  /**
   * Track search query
   * @param {string} query - Search query
   * @param {number} resultsCount - Number of results found
   * @returns {Promise<void>}
   */
  async trackSearch(query, resultsCount) {
    return this.trackEvent('search', { query, resultsCount });
  },

  /**
   * Track filter application
   * @param {Object} filters - Applied filters
   * @returns {Promise<void>}
   */
  async trackFilter(filters) {
    return this.trackEvent('filter_applied', filters);
  },

  /**
   * Track package view
   * @param {string} packageId - Package ID
   * @param {string} packageName - Package name
   * @returns {Promise<void>}
   */
  async trackPackageView(packageId, packageName) {
    return this.trackEvent('package_viewed', { packageId, packageName });
  },

  /**
   * Track booking initiation
   * @param {string} packageId - Package ID
   * @returns {Promise<void>}
   */
  async trackBookingStart(packageId) {
    return this.trackEvent('booking_started', { packageId });
  },

  /**
   * Track booking completion
   * @param {string} bookingId - Booking ID
   * @param {string} packageId - Package ID
   * @param {number} amount - Booking amount
   * @returns {Promise<void>}
   */
  async trackBookingComplete(bookingId, packageId, amount) {
    return this.trackConversion(bookingId, amount, { packageId });
  },

  /**
   * Track exception/error
   * @param {string} errorName - Error name
   * @param {string} errorMessage - Error message
   * @param {string} errorStack - Error stack trace (optional)
   * @returns {Promise<void>}
   */
  async trackException(errorName, errorMessage, errorStack = '') {
    return apiClient.post('/analytics/exception', {
      errorName,
      errorMessage,
      errorStack,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Set user properties
   * @param {Object} properties - User properties { userId, userType, segment, etc. }
   * @returns {Promise<void>}
   */
  async setUserProperties(properties) {
    return apiClient.post('/analytics/user-properties', properties);
  },

  /**
   * Get session ID
   * @returns {Promise<string>} - Session ID
   */
  async getSessionId() {
    const response = await apiClient.get('/analytics/session-id');
    return response.sessionId;
  },

  /**
   * Track time on page
   * @param {string} pageName - Page name
   * @param {number} timeInSeconds - Time spent on page
   * @returns {Promise<void>}
   */
  async trackTimeOnPage(pageName, timeInSeconds) {
    return this.trackEvent('time_on_page', { pageName, timeInSeconds });
  },

  /**
   * Track wishlist action
   * @param {string} action - Action (added, removed)
   * @param {string} packageId - Package ID
   * @returns {Promise<void>}
   */
  async trackWishlistAction(action, packageId) {
    return this.trackEvent('wishlist_' + action, { packageId });
  },

  /**
   * Track review submission
   * @param {string} packageId - Package ID
   * @param {number} rating - Rating given
   * @returns {Promise<void>}
   */
  async trackReviewSubmission(packageId, rating) {
    return this.trackEvent('review_submitted', { packageId, rating });
  },

  /**
   * Track login
   * @returns {Promise<void>}
   */
  async trackLogin() {
    return this.trackEvent('user_login');
  },

  /**
   * Track logout
   * @returns {Promise<void>}
   */
  async trackLogout() {
    return this.trackEvent('user_logout');
  },

  /**
   * Track signup
   * @param {string} signupMethod - Method (email, google, etc.)
   * @returns {Promise<void>}
   */
  async trackSignup(signupMethod = 'email') {
    return this.trackEvent('user_signup', { method: signupMethod });
  },

  /**
   * Get analytics dashboard data
   * @param {Object} options - Options { dateRange, metrics }
   * @returns {Promise<Object>} - Analytics data
   */
  async getDashboardData(options = {}) {
    return apiClient.get('/analytics/dashboard', { params: options });
  },

  /**
   * Get user analytics
   * @returns {Promise<Object>} - User-specific analytics
   */
  async getUserAnalytics() {
    return apiClient.get('/analytics/user');
  }
};
