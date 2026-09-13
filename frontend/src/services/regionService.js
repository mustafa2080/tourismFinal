import apiClient from './apiClient';

/**
 * Region Service
 * Handles all region-related API calls (Popular Destinations section)
 */

export const regionService = {
  /**
   * Get all active regions with their destinations (public, homepage)
   * @returns {Promise<Array>}
   */
  async getAllRegions() {
    try {
      const response = await apiClient.get('/regions');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      throw error;
    }
  },

  /**
   * Get all regions including inactive ones (admin)
   * @returns {Promise<Array>}
   */
  async getAllRegionsAdmin() {
    try {
      const response = await apiClient.get('/regions/admin');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch regions (admin):', error);
      throw error;
    }
  },

  /**
   * Get region by ID
   * @param {string} id
   */
  async getRegionById(id) {
    try {
      const response = await apiClient.get(`/regions/${id}`);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to fetch region:', error);
      throw error;
    }
  },

  /**
   * Create new region (admin only)
   * @param {Object} regionData - {name, slug, image, is_active, sort_order, destinations: string[]}
   */
  async createRegion(regionData) {
    try {
      const response = await apiClient.post('/regions', regionData);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to create region:', error);
      throw error;
    }
  },

  /**
   * Update region (admin only)
   * @param {string} id
   * @param {Object} regionData
   */
  async updateRegion(id, regionData) {
    try {
      const response = await apiClient.put(`/regions/${id}`, regionData);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to update region:', error);
      throw error;
    }
  },

  /**
   * Delete region (admin only)
   * @param {string} id
   */
  async deleteRegion(id) {
    try {
      return await apiClient.delete(`/regions/${id}`);
    } catch (error) {
      console.error('Failed to delete region:', error);
      throw error;
    }
  },
};

export default regionService;
