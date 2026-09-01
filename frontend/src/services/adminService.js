import apiClient from './apiClient';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export const adminService = {
  // ============ Dashboard Stats (StatsController) ============
  getDashboardStats: async (timeRange = '30days') => {
    try {
      console.log('📊 [adminService.getDashboardStats] Fetching stats for timeRange:', timeRange);
      const response = await apiClient.get('/admin/stats/dashboard', {
        params: { timeRange },
      });
      console.log('✅ [adminService.getDashboardStats] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getDashboardStats] Error:', error);
      throw error;
    }
  },

  getRevenueTrend: async (timeRange = '30days') => {
    try {
      console.log('📈 [adminService.getRevenueTrend] Fetching trend for timeRange:', timeRange);
      const response = await apiClient.get('/admin/stats/revenue-trend', {
        params: { timeRange },
      });
      console.log('✅ [adminService.getRevenueTrend] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getRevenueTrend] Error:', error);
      throw error;
    }
  },

  getBookingDistribution: async () => {
    try {
      console.log('📊 [adminService.getBookingDistribution] Fetching booking distribution...');
      const response = await apiClient.get('/admin/stats/booking-distribution');
      console.log('✅ [adminService.getBookingDistribution] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getBookingDistribution] Error:', error);
      throw error;
    }
  },

  getUserGrowth: async (timeRange = '30days') => {
    try {
      console.log('👥 [adminService.getUserGrowth] Fetching user growth for timeRange:', timeRange);
      const response = await apiClient.get('/admin/stats/user-growth', {
        params: { timeRange },
      });
      console.log('✅ [adminService.getUserGrowth] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getUserGrowth] Error:', error);
      throw error;
    }
  },

  // ============ User Management ============
  getAllUsers: async (limit = 20, offset = 0) => {
    try {
      const response = await apiClient.get('/admin/users', {
        params: { limit, offset },
      });
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  banUser: async (userId, reason) => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/ban`, {
        reason,
      });
      return response;
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // ============ Booking Management ============
  getAllBookings: async (limit = 20, offset = 0, status = null) => {
    try {
      const params = { limit, offset };
      if (status) params.status = status;
      const response = await apiClient.get('/admin/bookings', { params });
      return response;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  getBookingStats: async () => {
    try {
      const response = await apiClient.get('/admin/bookings/stats');
      return response;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  },

  getBookingsByStatus: async (status, limit = 20, offset = 0) => {
    try {
      const response = await apiClient.get(`/admin/bookings/status/${status}`, {
        params: { limit, offset },
      });
      return response;
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      throw error;
    }
  },

  cancelTrip: async (bookingId) => {
    try {
      const response = await apiClient.post(`/admin/bookings/${bookingId}/cancel`);
      return response;
    } catch (error) {
      console.error('Error cancelling trip:', error);
      throw error;
    }
  },

  // ============ Review Management ============
  getPendingReviews: async (limit = 20, offset = 0) => {
    try {
      const response = await apiClient.get('/admin/reviews/pending', {
        params: { limit, offset },
      });
      return response;
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      throw error;
    }
  },

  approveReview: async (reviewId, notes = '') => {
    try {
      console.log('✅ [adminService.approveReview] Approving review:', reviewId);
      const response = await apiClient.post(`/reviews/${reviewId}/approve`, { notes });
      console.log('✅ [adminService.approveReview] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.approveReview] Error:', error);
      throw error;
    }
  },

  rejectReview: async (reviewId, reason) => {
    try {
      console.log('❌ [adminService.rejectReview] Rejecting review:', reviewId);
      const response = await apiClient.post(`/reviews/${reviewId}/reject`, { reason });
      console.log('❌ [adminService.rejectReview] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.rejectReview] Error:', error);
      throw error;
    }
  },

  // ============ Reports & Analytics ============
  getRevenueReport: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await apiClient.get('/admin/reports/revenue', { params });
      return response;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error;
    }
  },

  getTopPackages: async (limit = 10) => {
    try {
      const response = await apiClient.get('/admin/reports/top-packages', {
        params: { limit },
      });
      return response;
    } catch (error) {
      console.error('Error fetching top packages:', error);
      throw error;
    }
  },

  getCustomerStats: async () => {
    try {
      const response = await apiClient.get('/admin/reports/customers');
      return response;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  },

  getBookingStats: async () => {
    try {
      const response = await apiClient.get('/admin/reports/bookings');
      return response;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  },

  // ============ Dashboard Stats (StatsController) ============
  getDashboardStats: async (timeRange = '30days') => {
    try {
      console.log('📊 [adminService.getDashboardStats] Fetching stats for timeRange:', timeRange);
      const response = await apiClient.get('/admin/stats/dashboard', {
        params: { timeRange },
      });
      console.log('✅ [adminService.getDashboardStats] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getDashboardStats] Error:', error);
      throw error;
    }
  },

  getRevenueTrend: async (timeRange = '30days') => {
    try {
      console.log('📈 [adminService.getRevenueTrend] Fetching trend for timeRange:', timeRange);
      const response = await apiClient.get('/admin/stats/revenue-trend', {
        params: { timeRange },
      });
      console.log('✅ [adminService.getRevenueTrend] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getRevenueTrend] Error:', error);
      throw error;
    }
  },

  getBookingDistribution: async () => {
    try {
      console.log('📊 [adminService.getBookingDistribution] Fetching booking distribution...');
      const response = await apiClient.get('/admin/stats/booking-distribution');
      console.log('✅ [adminService.getBookingDistribution] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getBookingDistribution] Error:', error);
      throw error;
    }
  },

  getUserGrowth: async (timeRange = '30days') => {
    try {
      console.log('👥 [adminService.getUserGrowth] Fetching user growth for timeRange:', timeRange);
      const response = await apiClient.get('/admin/stats/user-growth', {
        params: { timeRange },
      });
      console.log('✅ [adminService.getUserGrowth] Response:', response);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getUserGrowth] Error:', error);
      throw error;
    }
  },

  // ============ Audit Logs ============
  getAuditLogs: async (limit = 50, offset = 0) => {
    try {
      const response = await apiClient.get('/admin/logs/audit', {
        params: { limit, offset },
      });
      return response;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // ============ Refund Management ============
  issueRefund: async (bookingId, refundData) => {
    try {
      const response = await apiClient.post(
        `/admin/bookings/${bookingId}/refund`,
        refundData
      );
      return response;
    } catch (error) {
      console.error('Error issuing refund:', error);
      throw error;
    }
  },

  updateRefundStatus: async (bookingId, status) => {
    try {
      const response = await apiClient.put(
        `/admin/bookings/${bookingId}/refund/status`,
        { status }
      );
      return response;
    } catch (error) {
      console.error('Error updating refund status:', error);
      throw error;
    }
  },

  rejectRefund: async (bookingId, reason) => {
    try {
      const response = await apiClient.post(
        `/admin/bookings/${bookingId}/refund/reject`,
        { reason }
      );
      return response;
    } catch (error) {
      console.error('Error rejecting refund:', error);
      throw error;
    }
  },

  getRefunds: async (limit = 20, offset = 0) => {
    try {
      const response = await apiClient.get('/admin/refunds', {
        params: { limit, offset },
      });
      return response;
    } catch (error) {
      console.error('Error fetching refunds:', error);
      throw error;
    }
  },

  getRefundStats: async () => {
    try {
      const response = await apiClient.get('/admin/refunds/stats');
      return response;
    } catch (error) {
      console.error('Error fetching refund stats:', error);
      throw error;
    }
  },

  // ============ Package Management ============
  getAllPackages: async (limit = 20, offset = 0) => {
    try {
      console.log('🔵 [adminService.getAllPackages] Calling API with:', { limit, offset });
      const response = await apiClient.get('/admin/packages', {
        params: { limit, offset },
      });
      console.log('🟢 [adminService.getAllPackages] Response received:', response);
      return response;
    } catch (error) {
      console.error('🔴 [adminService.getAllPackages] Error:', error);
      console.error('🔴 [adminService.getAllPackages] Error response:', error.response?.data);
      throw error;
    }
  },

  createPackage: async (packageData) => {
    try {
      // Increase timeout for large payloads with images
      const response = await apiClient.post('/admin/packages', packageData, {
        timeout: 120000, // 120 seconds for large image uploads
      });
      return response;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  },

  getPackageById: async (packageId) => {
    try {
      const response = await apiClient.get(`/admin/packages/${packageId}`);
      return response;
    } catch (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
  },

  updatePackage: async (packageId, packageData) => {
    try {
      // Increase timeout for large payloads with images
      const response = await apiClient.put(`/admin/packages/${packageId}`, packageData, {
        timeout: 120000, // 120 seconds for large image uploads
      });
      return response;
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  },

  deletePackage: async (packageId) => {
    try {
      const response = await apiClient.delete(`/admin/packages/${packageId}`);
      return response;
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  },

  // ============ Add-ons Management ============
  getAllAddons: async (limit = 50, offset = 0) => {
    try {
      console.log(`🔵 [adminService.getAllAddons] Calling API with: {limit: ${limit}, offset: ${offset}}`);
      const response = await apiClient.get('/admin/addons', {
        params: { limit, offset },
      });
      console.log(`🟢 [adminService.getAllAddons] Response received:`, {
        success: response.success,
        dataCount: response.data?.length,
        total: response.pagination?.total,
        stats: response.stats,
      });
      return response;
    } catch (error) {
      console.error('❌ [adminService.getAllAddons] Error:', error);
      throw error;
    }
  },

  getAddonsStats: async () => {
    try {
      console.log(`📊 [adminService.getAddonsStats] Calling API...`);
      const response = await apiClient.get('/admin/addons/stats');
      console.log(`🟢 [adminService.getAddonsStats] Response received:`, response.data);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getAddonsStats] Error:', error);
      throw error;
    }
  },

  // ============ Settings Management ============
  getAllSettings: async () => {
    try {
      console.log('🔵 [adminService.getAllSettings] Fetching all settings...');
      const response = await apiClient.get('/settings/all');
      console.log('🟢 [adminService.getAllSettings] Settings fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getAllSettings] Error:', error);
      throw error;
    }
  },

  updateMultipleSettings: async (updates) => {
    try {
      console.log('🔵 [adminService.updateMultipleSettings] Updating settings...');
      const response = await apiClient.patch('/settings/update-multiple', { settings: updates });
      console.log('🟢 [adminService.updateMultipleSettings] Settings updated:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [adminService.updateMultipleSettings] Error:', error);
      throw error;
    }
  },

  updateSetting: async (key, value) => {
    try {
      console.log(`🔵 [adminService.updateSetting] Updating ${key}...`);
      const response = await apiClient.patch(`/settings/update/${key}`, { value });
      console.log(`🟢 [adminService.updateSetting] Setting ${key} updated:`, response.data);
      return response;
    } catch (error) {
      console.error(`❌ [adminService.updateSetting] Error:`, error);
      throw error;
    }
  },

  getSetting: async (key) => {
    try {
      const response = await apiClient.get(`/settings/key/${key}`);
      return response;
    } catch (error) {
      console.error(`❌ [adminService.getSetting] Error fetching ${key}:`, error);
      throw error;
    }
  },

  testEmailConfig: async () => {
    try {
      console.log('📧 [adminService.testEmailConfig] Testing email configuration...');
      const response = await apiClient.post('/settings/test-email');
      console.log('✅ [adminService.testEmailConfig] Test email sent:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [adminService.testEmailConfig] Error:', error);
      throw error;
    }
  },
  // ============ Addons Stats ============
  getAddonsStats: async () => {
    try {
      console.log(`📊 [adminService.getAddonsStats] Calling API...`);
      const response = await apiClient.get('/admin/addons/stats');
      console.log(`🟢 [adminService.getAddonsStats] Response received:`, response.data);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getAddonsStats] Error:', error);
      throw error;
    }
  },

  // ============ Settings Management ============
  getAllSettings: async () => {
    try {
      console.log('🔵 [adminService.getAllSettings] Fetching all settings...');
      const response = await apiClient.get('/settings/all');
      console.log('🟢 [adminService.getAllSettings] Settings fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [adminService.getAllSettings] Error:', error);
      throw error;
    }
  },

  // ============ Update Settings ============
  updateMultipleSettings: async (updates) => {
    try {
      console.log('🔵 [adminService.updateMultipleSettings] Updating settings...');
      const response = await apiClient.patch('/settings/update-multiple', { settings: updates });
      console.log('🟢 [adminService.updateMultipleSettings] Settings updated:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [adminService.updateMultipleSettings] Error:', error);
      throw error;
    }
  },

  updateSetting: async (key, value) => {
    try {
      console.log(`🔵 [adminService.updateSetting] Updating ${key}...`);
      const response = await apiClient.patch(`/settings/update/${key}`, { value });
      console.log(`🟢 [adminService.updateSetting] Setting ${key} updated:`, response.data);
      return response;
    } catch (error) {
      console.error(`❌ [adminService.updateSetting] Error:`, error);
      throw error;
    }
  },

  getSetting: async (key) => {
    try {
      const response = await apiClient.get(`/settings/key/${key}`);
      return response;
    } catch (error) {
      console.error(`❌ [adminService.getSetting] Error fetching ${key}:`, error);
      throw error;
    }
  },

  testEmailConfig: async () => {
    try {
      console.log('📧 [adminService.testEmailConfig] Testing email configuration...');
      const response = await apiClient.post('/settings/test-email');
      console.log('✅ [adminService.testEmailConfig] Test email sent:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [adminService.testEmailConfig] Error:', error);
      throw error;
    }
  },
};

export default adminService;
