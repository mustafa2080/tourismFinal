/**
 * Packages Service
 * Handles all package-related API calls
 */

import apiClient from './apiClient';

/**
 * Search packages with filters
 * @param {object} params - Search parameters { q, minPrice, maxPrice, duration, categoryId, sort, limit, offset }
 * @returns {Promise<{data, count}>}
 */
export const searchPackages = async (params = {}) => {
  try {
    console.log(`📋 [packagesService.searchPackages] Received params:`, params);
    
    const queryParams = new URLSearchParams();
    
    // Always append q parameter (can be empty string for getting all packages)
    queryParams.append('q', params.q || '');
    if (params.minPrice !== undefined && params.minPrice !== null) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice !== undefined && params.maxPrice !== null) queryParams.append('maxPrice', params.maxPrice);
    if (params.duration !== undefined && params.duration !== null) queryParams.append('duration', params.duration);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.categories) queryParams.append('categories', params.categories);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    const queryString = queryParams.toString();
    console.log(`🔗 [packagesService.searchPackages] Built query string:`, queryString);

    const response = await apiClient.get(`/packages/search?${queryString}`);
    return response;
  } catch (error) {
    console.error('Error searching packages:', error);
    throw error;
  }
};

/**
 * Get featured packages
 * @param {number} limit - Number of packages to retrieve (default: 6)
 * @returns {Promise<{data, count}>}
 */
export const getFeaturedPackages = async (limit = 6) => {
  try {
    const response = await apiClient.get(`/packages/featured?limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error fetching featured packages:', error);
    throw error;
  }
};

/**
 * Get package by ID
 * @param {string} packageId - Package ID
 * @returns {Promise<object>} Package details
 */
export const getPackageById = async (packageId) => {
  try {
    const response = await apiClient.get(`/packages/${packageId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching package ${packageId}:`, error);
    throw error;
  }
};

/**
 * Get packages by category
 * @param {string} categoryId - Category ID
 * @param {object} params - Query parameters { limit, offset }
 * @returns {Promise<{data, count}>}
 */
export const getPackagesByCategory = async (categoryId, params = {}) => {
  try {
    if (!categoryId) {
      console.error('❌ [packagesService] categoryId is missing');
      return { success: true, data: [], count: 0, total: 0 };
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `/packages/category/${categoryId}${queryString ? '?' + queryString : ''}`;
    
    console.log(`🔄 [packagesService.getPackagesByCategory] Requesting: ${url}`);
    
    try {
      const response = await apiClient.get(url);
      
      console.log(`✅ [packagesService.getPackagesByCategory] Response received:`, {
        success: response?.success,
        dataLength: Array.isArray(response?.data) ? response.data.length : 'not-array',
        total: response?.total,
      });
      
      return response;
    } catch (apiError) {
      // If 404, return empty with success=false instead of throwing
      if (apiError?.response?.status === 404) {
        console.warn(`⚠️ [packagesService.getPackagesByCategory] 404 Not Found for category ${categoryId}`);
        console.warn(`   Message: ${apiError?.response?.data?.message || 'No packages available'}`);
        
        return {
          success: false,
          data: [],
          count: 0,
          total: 0,
          message: apiError?.response?.data?.message || 'No trips available for this category'
        };
      }
      
      // For other errors, throw to let caller handle
      throw apiError;
    }
  } catch (error) {
    console.error(`❌ [packagesService.getPackagesByCategory] Error fetching packages for category ${categoryId}:`, {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.url,
      data: error?.response?.data,
    });
    
    // Return empty data instead of throwing to allow graceful handling
    return { success: true, data: [], count: 0, total: 0 };
  }
};

/**
 * Get all categories
 * @returns {Promise<array>} Categories list
 */
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Calculate package price
 * @param {string} packageId - Package ID
 * @param {object} data - { persons, roomType, extras }
 * @returns {Promise<object>} { basePrice, personPrice, extras, total }
 */
export const calculatePrice = async (packageId, data) => {
  try {
    const response = await apiClient.post(`/packages/${packageId}/calculate-price`, data);
    return response;
  } catch (error) {
    console.error(`Error calculating price for package ${packageId}:`, error);
    throw error;
  }
};

/**
 * Get related packages
 * @param {string} packageId - Package ID
 * @param {number} limit - Number of related packages (default: 4)
 * @returns {Promise<array>} Related packages
 */
export const getRelatedPackages = async (packageId, limit = 4) => {
  try {
    const response = await apiClient.get(`/packages/${packageId}/related?limit=${limit}`);
    return response;
  } catch (error) {
    console.error(`Error fetching related packages for ${packageId}:`, error);
    throw error;
  }
};

/**
 * Get package count by status
 * @returns {Promise<object>} { total, featured, active }
 */
export const getPackageStats = async () => {
  try {
    const response = await apiClient.get('/packages/stats');
    return response;
  } catch (error) {
    console.error('Error fetching package stats:', error);
    throw error;
  }
};

/**
 * Create package (Admin only)
 * @param {object} data - Package data
 * @returns {Promise<object>} Created package
 */
export const createPackage = async (data) => {
  try {
    const response = await apiClient.post('/packages', data);
    return response;
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
};

/**
 * Update package (Admin only)
 * @param {string} packageId - Package ID
 * @param {object} data - Updated package data
 * @returns {Promise<object>} Updated package
 */
export const updatePackage = async (packageId, data) => {
  try {
    const response = await apiClient.put(`/packages/${packageId}`, data);
    return response;
  } catch (error) {
    console.error(`Error updating package ${packageId}:`, error);
    throw error;
  }
};

/**
 * Delete package (Admin only)
 * @param {string} packageId - Package ID
 * @returns {Promise<object>} Success response
 */
export const deletePackage = async (packageId) => {
  try {
    const response = await apiClient.delete(`/packages/${packageId}`);
    return response;
  } catch (error) {
    console.error(`Error deleting package ${packageId}:`, error);
    throw error;
  }
};

/**
 * Get destination suggestions (for autocomplete)
 * @param {string} query - Search query
 * @returns {Promise<array>} Matching destinations with package info
 */
export const getDestinationSuggestions = async (query) => {
  try {
    console.log(`🔍 [packagesService] Getting destination suggestions for: "${query}"`);
    
    if (!query || query.trim() === '') {
      console.warn('⚠️ [packagesService] Query is empty, returning empty array');
      return [];
    }
    
    const response = await apiClient.get(`/packages/destinations/autocomplete?q=${encodeURIComponent(query)}&limit=15`);
    
    console.log(`✅ [packagesService] Response structure:`, {
      responseType: typeof response,
      isArray: Array.isArray(response),
      hasData: !!response?.data,
      responseKeys: typeof response === 'object' ? Object.keys(response) : 'N/A',
      dataType: typeof response?.data,
      isDataArray: Array.isArray(response?.data)
    });
    
    let suggestions = [];
    
    if (response && typeof response === 'object') {
      // Case 1: Response has a 'data' field with suggestions array
      if (Array.isArray(response.data)) {
        suggestions = response.data;
        console.log(`📋 [packagesService] Case 1: Found ${suggestions.length} suggestions from response.data`);
      }
      // Case 2: Response itself is the data field (shouldn't happen with current implementation)
      else if (Array.isArray(response)) {
        suggestions = response;
        console.log(`📋 [packagesService] Case 2: Found ${suggestions.length} suggestions from response array`);
      }
      // Case 3: Response has success field (it's the full response object from Backend)
      else if (response.success && Array.isArray(response.data)) {
        suggestions = response.data;
        console.log(`📋 [packagesService] Case 3: Found ${suggestions.length} suggestions from response.data (success response)`);
      }
      else {
        console.warn('⚠️ [packagesService] Unexpected response structure:', response);
        suggestions = [];
      }
    }
    
    console.log(`📋 [packagesService] Final suggestions (${suggestions.length}):`, suggestions.slice(0, 3));
    
    return suggestions;
  } catch (error) {
    console.error('❌ [packagesService] Error fetching destination suggestions:', error);
    return [];
  }
};

/**
 * Get all unique destinations
 * @returns {Promise<array>} All destinations
 */
export const getAllDestinations = async () => {
  try {
    const response = await apiClient.get('/packages/destinations/all');
    return response;
  } catch (error) {
    console.error('Error fetching all destinations:', error);
    throw error;
  }
};

export const packagesService = {
  searchPackages,
  getFeaturedPackages,
  getPackageById,
  getPackagesByCategory,
  getCategories,
  calculatePrice,
  getRelatedPackages,
  getPackageStats,
  createPackage,
  updatePackage,
  deletePackage,
  getDestinationSuggestions,
  getAllDestinations
};

export default packagesService;