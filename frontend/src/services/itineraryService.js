import apiClient from './apiClient';

/**
 * Itinerary Service - Manage trip daily itineraries
 */
export const itineraryService = {
  /**
   * Get all itinerary days for a package
   */
  getPackageItineraries: async (packageId) => {
    try {
      console.log(`📅 [itineraryService] Calling API: /itineraries/package/${packageId}`);
      // Add cache busting with timestamp to force fresh data
      const response = await apiClient.get(`/itineraries/package/${packageId}?t=${Date.now()}`);
      console.log('📅 [itineraryService] Raw API Response:', response);
      
      // API returns { success: true, data: [...] }
      // We need to extract the data array
      if (response?.data) {
        // Debug: Log sample itinerary to verify translations
        if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          console.log('📅 [itineraryService] Sample first itinerary:', {
            title: response.data.data[0].title,
            es_title: response.data.data[0].es_title,
            ar_title: response.data.data[0].ar_title,
            all_fields: Object.keys(response.data.data[0]).filter(k => k.includes('_title') || k.includes('_description'))
          });
        }
        return response.data;
      }
      return response || [];
    } catch (error) {
      console.error('❌ [itineraryService] Failed to fetch itineraries:', error);
      throw error;
    }
  },

  /**
   * Get specific itinerary day
   */
  getItineraryById: async (id) => {
    try {
      // Add cache busting
      const response = await apiClient.get(`/itineraries/${id}?t=${Date.now()}`);
      return response.data;
    } catch (error) {
      console.error('❌ [itineraryService] Failed to fetch itinerary:', error);
      throw error;
    }
  },

  /**
   * Create new itinerary day (Admin)
   */
  createItinerary: async (data) => {
    try {
      const response = await apiClient.post('/itineraries', data);
      return response.data;
    } catch (error) {
      console.error('❌ [itineraryService] Failed to create itinerary:', error);
      throw error;
    }
  },

  /**
   * Update itinerary day (Admin)
   */
  updateItinerary: async (id, data) => {
    try {
      const response = await apiClient.put(`/itineraries/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ [itineraryService] Failed to update itinerary:', error);
      throw error;
    }
  },

  /**
   * Delete itinerary day (Admin)
   */
  deleteItinerary: async (id) => {
    try {
      const response = await apiClient.delete(`/itineraries/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ [itineraryService] Failed to delete itinerary:', error);
      throw error;
    }
  },

  /**
   * Upsert itinerary (Admin) - create or update
   */
  upsertItinerary: async (data) => {
    try {
      const response = await apiClient.post('/itineraries/upsert', data);
      return response.data;
    } catch (error) {
      console.error('❌ [itineraryService] Failed to upsert itinerary:', error);
      throw error;
    }
  },
};

export default itineraryService;
