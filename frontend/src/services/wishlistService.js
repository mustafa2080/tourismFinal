import apiClient from './apiClient';

export const wishlistService = {
  /**
   * Add package to user's wishlist
   * @param {string} packageId - Package ID to add
   * @returns {Promise<Object>} - Wishlist item data
   */
  async addToWishlist(packageId) {
    try {
      console.log('🔄 [wishlistService] Adding to wishlist:', packageId);
      
      const response = await apiClient.post('/users/wishlist', { packageId });
      
      console.log('✅ [wishlistService] Add response:', response);
      return { success: true, packageId };
    } catch (error) {
      console.error('❌ [wishlistService] Error adding:', error);
      throw error;
    }
  },

  /**
   * Remove package from user's wishlist
   * @param {string} packageId - Package ID to remove
   * @returns {Promise<void>}
   */
  async removeFromWishlist(packageId) {
    try {
      console.log('🔄 [wishlistService] Removing from wishlist:', packageId);
      
      const response = await apiClient.delete(`/users/wishlist/${packageId}`);
      
      console.log('✅ [wishlistService] Remove response:', response);

      // apiClient may resolve with an error-shaped payload in edge cases -
      // guard against treating that as a success.
      if (response && response.success === false) {
        throw new Error(response.message || 'Failed to remove from wishlist');
      }

      return { success: true, packageId };
    } catch (error) {
      console.error('❌ [wishlistService] Error removing:', error);
      throw error;
    }
  },

  /**
   * Get user's wishlist
   * @returns {Promise<Array>} - Array of wishlisted packages
   */
  async getWishlist() {
    try {
      console.log('🔄 [wishlistService] Fetching wishlist...');
      
      const response = await apiClient.get('/users/wishlist');
      const wishlist = Array.isArray(response) ? response : (response?.data || []);
      
      console.log('✅ [wishlistService] Wishlist fetched:', wishlist.length, 'items');
      
      return wishlist;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      return [];
    }
  },

  /**
   * Check if package is wishlisted
   * @param {string} packageId - Package ID to check
   * @returns {Promise<boolean>} - true if in wishlist, false otherwise
   */
  async isWishlisted(packageId) {
    try {
      const response = await apiClient.get(`/users/wishlist/check/${packageId}`);
      // Response format: { success: true, data: { isInWishlist: boolean } }
      return response?.data?.isInWishlist || false;
    } catch (error) {
      console.error('❌ [wishlistService] Error checking wishlist status:', error);
      return false;
    }
  },

  /**
   * Toggle package in wishlist (add if not there, remove if there)
   * @param {string} packageId - Package ID to toggle
   * @returns {Promise<Object>} - Result with action (added/removed) and wishlist
   */
  async toggleWishlist(packageId) {
    try {
      const isWishlisted = await this.isWishlisted(packageId);
      
      if (isWishlisted) {
        await this.removeFromWishlist(packageId);
        return { action: 'removed', isWishlisted: false };
      } else {
        const result = await this.addToWishlist(packageId);
        return { action: 'added', isWishlisted: true, data: result };
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get wishlist count
   * @returns {Promise<number>} - Number of items in wishlist
   */
  async getWishlistCount() {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.length || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Clear entire wishlist
   * @returns {Promise<void>}
   */
  async clearWishlist() {
    return apiClient.post('/users/wishlist/clear');
  },

  /**
   * Bulk add packages to wishlist
   * @param {Array<string>} packageIds - Array of package IDs
   * @returns {Promise<Array>} - Result of bulk add operation
   */
  async bulkAddToWishlist(packageIds) {
    return apiClient.post('/users/wishlist/bulk', { packageIds });
  },

  /**
   * Bulk remove packages from wishlist
   * @param {Array<string>} packageIds - Array of package IDs
   * @returns {Promise<void>}
   */
  async bulkRemoveFromWishlist(packageIds) {
    return apiClient.post('/users/wishlist/bulk-remove', { packageIds });
  },
};
