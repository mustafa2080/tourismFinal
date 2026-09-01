import apiClient from './apiClient';

/**
 * Category Service
 * Handles all category-related API calls
 */

export const categoryService = {
  /**
   * Get all categories
   * @returns {Promise<Array>} - Array of categories
   */
  async getAllCategories() {
    try {
      const response = await apiClient.get('/categories');
      // response is already response.data from apiClient interceptor
      // response = {success: true, data: [...], count: X}
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} - Category data
   */
  async getCategoryById(id) {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to fetch category:', error);
      throw error;
    }
  },

  /**
   * Get categories with package count
   * @returns {Promise<Array>} - Array of categories with package counts
   */
  async getCategoriesWithPackageCount() {
    try {
      const response = await apiClient.get('/categories/with-packages');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch categories with package count:', error);
      throw error;
    }
  },

  /**
   * Create new category (admin only)
   * @param {Object} categoryData - {name, slug, description, image}
   * @returns {Promise<Object>} - Created category
   */
  async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/categories', categoryData);
      // Response structure: {success: true, message: '...', data: {...}}
      return response?.data || response;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },

  /**
   * Update category (admin only)
   * @param {string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} - Updated category
   */
  async updateCategory(id, categoryData) {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  },

  /**
   * Delete category (admin only)
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    try {
      return await apiClient.delete(`/categories/${id}`);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  },
};

export default categoryService;
