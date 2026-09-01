import apiClient from './apiClient';

export const notificationsService = {
  /**
   * Get all notifications for current user
   * @param {Object} options - Query options { limit, offset, type, unreadOnly }
   * @returns {Promise<Array>} - Array of notifications
   */
  async getNotifications(options = {}) {
    const { limit = 20, offset = 0, type = null, unreadOnly = false } = options;
    const params = { limit, offset };
    
    if (type) params.type = type;
    if (unreadOnly) params.unreadOnly = true;
    
    return apiClient.get('/notifications', { params });
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} - Count of unread notifications
   */
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/notifications/unread');
      // Handle multiple response formats
      if (response.data?.unreadCount !== undefined) {
        return response.data.unreadCount;
      }
      if (response.data?.data?.unreadCount !== undefined) {
        return response.data.data.unreadCount;
      }
      if (response.unreadCount !== undefined) {
        return response.unreadCount;
      }
      return 0;
    } catch (err) {
      console.error('Error getting unread count:', err);
      return 0;
    }
  },

  /**
   * Mark single notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Updated notification
   */
  async markAsRead(notificationId) {
    return apiClient.put(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} - Result { updated: count }
   */
  async markAllAsRead() {
    return apiClient.put('/notifications/read-all');
  },

  /**
   * Delete a single notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId) {
    return apiClient.delete(`/notifications/${notificationId}`);
  },

  /**
   * Delete all notifications
   * @returns {Promise<Object>} - Result { deleted: count }
   */
  async deleteAllNotifications() {
    return apiClient.delete('/notifications');
  },

  /**
   * Get notifications by type
   * @param {string} type - Notification type (booking_created, booking_confirmed, payment_received, etc.)
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Filtered notifications
   */
  async getNotificationsByType(type, options = {}) {
    const { limit = 20, offset = 0 } = options;
    return apiClient.get(`/notifications/type/${type}`, {
      params: { limit, offset }
    });
  },

  /**
   * Get notifications by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Notifications in date range
   */
  async getNotificationsByDateRange(startDate, endDate, options = {}) {
    const { limit = 20, offset = 0 } = options;
    return apiClient.get('/notifications/by-date', {
      params: { startDate, endDate, limit, offset }
    });
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Preferences { emailNotifications, smsNotifications, pushNotifications }
   * @returns {Promise<Object>} - Updated preferences
   */
  async updatePreferences(preferences) {
    return apiClient.put('/notifications/preferences', preferences);
  },

  /**
   * Get notification preferences
   * @returns {Promise<Object>} - Current preferences
   */
  async getPreferences() {
    return apiClient.get('/notifications/preferences');
  },

  /**
   * Subscribe to a notification channel
   * @param {string} channel - Channel name (booking, package, reviews, etc.)
   * @returns {Promise<void>}
   */
  async subscribeToChannel(channel) {
    return apiClient.post(`/notifications/subscribe/${channel}`);
  },

  /**
   * Unsubscribe from a notification channel
   * @param {string} channel - Channel name
   * @returns {Promise<void>}
   */
  async unsubscribeFromChannel(channel) {
    return apiClient.post(`/notifications/unsubscribe/${channel}`);
  },

  /**
   * Get subscribed channels
   * @returns {Promise<Array>} - List of subscribed channels
   */
  async getSubscribedChannels() {
    const response = await apiClient.get('/notifications/subscribed-channels');
    return response.channels || [];
  },

  /**
   * Send test notification
   * @returns {Promise<Object>} - Test notification result
   */
  async sendTestNotification() {
    return apiClient.post('/notifications/test');
  },

  /**
   * Archive notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async archiveNotification(notificationId) {
    return apiClient.post(`/notifications/${notificationId}/archive`);
  },

  /**
   * Get archived notifications
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Archived notifications
   */
  async getArchivedNotifications(options = {}) {
    const { limit = 20, offset = 0 } = options;
    return apiClient.get('/notifications/archived', {
      params: { limit, offset }
    });
  },

  /**
   * Restore archived notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async restoreNotification(notificationId) {
    return apiClient.post(`/notifications/${notificationId}/restore`);
  },

  /**
   * Subscribe email to newsletter
   * @param {string} email - Email address
   * @returns {Promise<Object>} - Subscription result
   */
  async subscribeNewsletter(email) {
    return apiClient.post('/notifications/newsletter/subscribe', { email });
  },

  /**
   * Unsubscribe email from newsletter
   * @param {string} email - Email address
   * @returns {Promise<Object>} - Unsubscribe result
   */
  async unsubscribeNewsletter(email) {
    return apiClient.post('/notifications/newsletter/unsubscribe', { email });
  }
};
