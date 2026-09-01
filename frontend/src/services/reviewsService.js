import apiClient from './apiClient';

export const reviewsService = {
  /**
   * Get all reviews for a package
   * @param {string} packageId - Package ID
   * @param {Object} options - Query options (limit, offset, sortBy)
   * @returns {Promise<Array>} - Array of reviews
   */
  async getPackageReviews(packageId, options = {}) {
    const { limit = 10, offset = 0, sortBy = 'recent' } = options;
    return apiClient.get(`/reviews/package/${packageId}`, {
      params: { limit, offset, sortBy }
    });
  },

  /**
   * Get a specific review by ID
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} - Review data
   */
  async getReviewById(reviewId) {
    return apiClient.get(`/reviews/${reviewId}`);
  },

  /**
   * Add review for a package (requires completed booking)
   * @param {string} packageId - Package ID
   * @param {Object} reviewData - Review data { rating, comment, bookingId }
   * @returns {Promise<Object>} - Created review
   */
  async addReview(packageId, reviewData) {
    const { rating, comment, bookingId } = reviewData;
    
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    if (!comment || comment.trim().length < 10) {
      throw new Error('Review comment must be at least 10 characters');
    }
    
    return apiClient.post(`/reviews`, {
      packageId,
      rating,
      comment: comment.trim(),
      bookingId
    });
  },

  /**
   * Update an existing review
   * @param {string} reviewId - Review ID
   * @param {Object} updateData - Updated data { rating, comment }
   * @returns {Promise<Object>} - Updated review
   */
  async updateReview(reviewId, updateData) {
    const { rating, comment } = updateData;
    
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    if (comment && comment.trim().length < 10) {
      throw new Error('Review comment must be at least 10 characters');
    }
    
    return apiClient.put(`/reviews/${reviewId}`, updateData);
  },

  /**
   * Delete a review (admin or review author only)
   * @param {string} reviewId - Review ID
   * @returns {Promise<void>}
   */
  async deleteReview(reviewId) {
    return apiClient.delete(`/reviews/${reviewId}`);
  },

  /**
   * Get average rating for a package
   * @param {string} packageId - Package ID
   * @returns {Promise<number>} - Average rating (0-5)
   */
  async getAverageRating(packageId) {
    const response = await apiClient.get(`/reviews/package/${packageId}/average`);
    return response.averageRating || 0;
  },

  /**
   * Get rating distribution for a package (for chart)
   * @param {string} packageId - Package ID
   * @returns {Promise<Object>} - Distribution { 1: count, 2: count, ..., 5: count }
   */
  async getRatingDistribution(packageId) {
    const response = await apiClient.get(`/reviews/package/${packageId}/distribution`);
    return response.distribution || {};
  },

  /**
   * Get user's reviews
   * @returns {Promise<Array>} - Array of user's reviews
   */
  async getUserReviews() {
    return apiClient.get('/users/my-reviews');
  },

  /**
   * Get reviews by rating (admin)
   * @param {number} rating - Filter by rating (1-5)
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Filtered reviews
   */
  async getReviewsByRating(rating, options = {}) {
    const { limit = 10, offset = 0 } = options;
    return apiClient.get('/admin/reviews/by-rating', {
      params: { rating, limit, offset }
    });
  },

  /**
   * Approve a pending review (admin only)
   * @param {string} reviewId - Review ID to approve
   * @param {string} notes - Admin notes (optional)
   * @returns {Promise<Object>} - Updated review
   */
  async adminApproveReview(reviewId, notes = '') {
    return apiClient.post(`/admin/reviews/${reviewId}/approve`, { notes });
  },

  /**
   * Reject a pending review (admin only)
   * @param {string} reviewId - Review ID to reject
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} - Updated review
   */
  async adminRejectReview(reviewId, reason) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }
    
    return apiClient.post(`/admin/reviews/${reviewId}/reject`, { reason });
  },

  /**
   * Flag review as inappropriate (user report)
   * @param {string} reviewId - Review ID to flag
   * @param {string} reportReason - Reason for flagging
   * @returns {Promise<void>}
   */
  async flagReviewAsInappropriate(reviewId, reportReason) {
    if (!reportReason || reportReason.trim().length === 0) {
      throw new Error('Report reason is required');
    }
    
    return apiClient.post(`/reviews/${reviewId}/flag`, { reportReason });
  },

  /**
   * Get flagged reviews (admin only)
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Flagged reviews
   */
  async getFlaggedReviews(options = {}) {
    const { limit = 10, offset = 0 } = options;
    return apiClient.get('/admin/reviews/flagged', {
      params: { limit, offset }
    });
  },

  /**
   * Get reviews stats (admin)
   * @returns {Promise<Object>} - Stats { totalReviews, pending, approved, rejected, flagged }
   */
  async getReviewsStats() {
    return apiClient.get('/admin/reviews/stats');
  },

  /**
   * Auto-approve all pending reviews (admin debug endpoint)
   * @returns {Promise<Object>} - Result { approved, updated_packages }
   */
  async autoApprovePendingReviews() {
    return apiClient.post('/reviews/admin/auto-approve-pending', {});
  }
};
