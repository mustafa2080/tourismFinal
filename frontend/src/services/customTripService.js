import apiClient from './apiClient';

/**
 * Custom Trip Service
 * Handles the "Build Your Own Trip" feature — public builder + admin management
 */

export const customTripService = {
  // ============ PUBLIC (Trip Builder) ============

  /**
   * Get pickable catalog items (activities/hotels/transport/meals)
   * @param {Object} filters - { destination, item_type }
   */
  async getOptions(filters = {}) {
    try {
      const response = await apiClient.get('/custom-trips/options', { params: filters });
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch trip builder options:', error);
      throw error;
    }
  },

  /**
   * Get list of destinations that have builder options
   */
  async getDestinations() {
    try {
      const response = await apiClient.get('/custom-trips/destinations');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
      throw error;
    }
  },

  /**
   * Submit a new custom trip request
   * @param {Object} payload - full trip builder form + items[]
   */
  async submitRequest(payload) {
    try {
      const response = await apiClient.post('/custom-trips', payload);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to submit custom trip request:', error);
      throw error;
    }
  },

  /**
   * Get the logged-in user's own custom trip requests
   */
  async getMyRequests(limit = 20, offset = 0) {
    try {
      const response = await apiClient.get('/custom-trips/mine', { params: { limit, offset } });
      return response || { data: [], pagination: {} };
    } catch (error) {
      console.error('Failed to fetch my custom trip requests:', error);
      throw error;
    }
  },

  /**
   * Get a single request by id (public — used for confirmation page / tracking)
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/custom-trips/${id}`);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to fetch custom trip request:', error);
      throw error;
    }
  },

  // ============ ADMIN ============

  async getAllAdmin(limit = 20, offset = 0, status = 'all') {
    try {
      const response = await apiClient.get('/admin/custom-trips', {
        params: { limit, offset, status },
      });
      return response || { data: [], pagination: {} };
    } catch (error) {
      console.error('Failed to fetch custom trip requests (admin):', error);
      throw error;
    }
  },

  async getStats() {
    try {
      const response = await apiClient.get('/admin/custom-trips/stats');
      return response?.data || {};
    } catch (error) {
      console.error('Failed to fetch custom trip stats:', error);
      throw error;
    }
  },

  async updateStatus(id, status, adminNotes = '') {
    try {
      const response = await apiClient.put(`/admin/custom-trips/${id}/status`, {
        status,
        adminNotes,
      });
      return response?.data || response;
    } catch (error) {
      console.error('Failed to update custom trip status:', error);
      throw error;
    }
  },

  async sendQuote(id, quotedPrice, quoteMessage) {
    try {
      const response = await apiClient.post(`/admin/custom-trips/${id}/quote`, {
        quotedPrice,
        quoteMessage,
      });
      return response?.data || response;
    } catch (error) {
      console.error('Failed to send quote:', error);
      throw error;
    }
  },

  async deleteRequest(id) {
    try {
      return await apiClient.delete(`/admin/custom-trips/${id}`);
    } catch (error) {
      console.error('Failed to delete custom trip request:', error);
      throw error;
    }
  },

  // ---- Admin catalog management ----

  async getOptionsAdmin(limit = 100, offset = 0) {
    try {
      const response = await apiClient.get('/admin/custom-trips/options', {
        params: { limit, offset },
      });
      return response || { data: [], pagination: {} };
    } catch (error) {
      console.error('Failed to fetch builder options (admin):', error);
      throw error;
    }
  },

  async createOption(data) {
    try {
      const response = await apiClient.post('/admin/custom-trips/options', data);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to create builder option:', error);
      throw error;
    }
  },

  async updateOption(id, data) {
    try {
      const response = await apiClient.put(`/admin/custom-trips/options/${id}`, data);
      return response?.data || response;
    } catch (error) {
      console.error('Failed to update builder option:', error);
      throw error;
    }
  },

  async deleteOption(id) {
    try {
      return await apiClient.delete(`/admin/custom-trips/options/${id}`);
    } catch (error) {
      console.error('Failed to delete builder option:', error);
      throw error;
    }
  },

  // ============ Local Helpers ============

  /**
   * Calculate number of nights between two dates
   */
  calculateNights(dateStart, dateEnd) {
    if (!dateStart || !dateEnd) return 0;
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  },

  /**
   * Calculate running total for the items currently selected in the builder
   */
  calculateTotal(items = []) {
    return items.reduce((sum, item) => sum + (item.unit_price || 0) * (item.quantity || 1), 0);
  },

  budgetTiers: [
    { id: 'budget', label: 'Budget', emoji: '💰', description: 'Smart choices, great value' },
    { id: 'mid_range', label: 'Mid-Range', emoji: '⭐', description: 'Comfortable & balanced' },
    { id: 'luxury', label: 'Luxury', emoji: '💎', description: 'Premium experiences' },
  ],

  paceOptions: [
    { id: 'relaxed', label: 'Relaxed', emoji: '🌴', description: 'Plenty of downtime' },
    { id: 'standard', label: 'Standard', emoji: '🚶', description: 'A balanced pace' },
    { id: 'packed', label: 'Packed', emoji: '⚡', description: 'See and do as much as possible' },
  ],

  interestTags: [
    'Culture & History', 'Beaches', 'Adventure', 'Food & Dining', 'Nightlife',
    'Nature & Wildlife', 'Shopping', 'Relaxation & Wellness', 'Photography', 'Family Friendly',
  ],

  statusMeta: {
    draft: { label: 'Draft', color: 'gray' },
    submitted: { label: 'Submitted', color: 'amber' },
    reviewing: { label: 'Reviewing', color: 'blue' },
    quoted: { label: 'Quoted', color: 'purple' },
    accepted: { label: 'Accepted', color: 'emerald' },
    rejected: { label: 'Rejected', color: 'red' },
    converted: { label: 'Converted', color: 'emerald' },
    cancelled: { label: 'Cancelled', color: 'gray' },
  },
};

export default customTripService;
