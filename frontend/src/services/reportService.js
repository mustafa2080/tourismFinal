import apiClient from './apiClient';

export const reportService = {
  /**
   * Get booking report
   * @param {Object} options - Options { startDate, endDate, status, groupBy }
   * @returns {Promise<Object>} - Booking report data
   */
  async getBookingReport(options = {}) {
    const { startDate, endDate, status = null, groupBy = 'daily' } = options;
    
    const params = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (status) params.status = status;
    
    return apiClient.get('/reports/bookings', { params });
  },

  /**
   * Get revenue report
   * @param {Object} options - Options { startDate, endDate, groupBy, currency }
   * @returns {Promise<Object>} - Revenue report data
   */
  async getRevenueReport(options = {}) {
    const { startDate, endDate, groupBy = 'daily', currency = 'USD' } = options;
    
    const params = { groupBy, currency };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return apiClient.get('/reports/revenue', { params });
  },

  /**
   * Get customer report
   * @param {Object} options - Options { startDate, endDate, sortBy }
   * @returns {Promise<Object>} - Customer analytics
   */
  async getCustomerReport(options = {}) {
    const { startDate, endDate, sortBy = 'recent' } = options;
    
    const params = { sortBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return apiClient.get('/reports/customers', { params });
  },

  /**
   * Get package performance report
   * @param {Object} options - Options { startDate, endDate, sortBy }
   * @returns {Promise<Object>} - Package stats
   */
  async getPackageReport(options = {}) {
    const { startDate, endDate, sortBy = 'bookings' } = options;
    
    const params = { sortBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return apiClient.get('/reports/packages', { params });
  },

  /**
   * Export report to CSV
   * @param {string} reportType - Type (bookings, revenue, customers, packages)
   * @param {Object} options - Report options
   * @returns {Promise<Blob>} - CSV file blob
   */
  async exportReport(reportType, options = {}) {
    return apiClient.get(`/reports/export/${reportType}`, {
      params: options,
      responseType: 'blob'
    });
  },

  /**
   * Export report to PDF
   * @param {string} reportType - Type (bookings, revenue, customers, packages)
   * @param {Object} options - Report options
   * @returns {Promise<Blob>} - PDF file blob
   */
  async exportReportPDF(reportType, options = {}) {
    return apiClient.get(`/reports/export-pdf/${reportType}`, {
      params: options,
      responseType: 'blob'
    });
  },

  /**
   * Get marketing metrics
   * @param {Object} options - Options { startDate, endDate }
   * @returns {Promise<Object>} - Marketing data { conversions, roi, cac }
   */
  async getMarketingMetrics(options = {}) {
    const params = {};
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;
    
    return apiClient.get('/reports/marketing', { params });
  },

  /**
   * Get customer acquisition report
   * @param {Object} options - Options { startDate, endDate }
   * @returns {Promise<Object>} - CAC, acquisition channels, etc.
   */
  async getAcquisitionReport(options = {}) {
    const params = {};
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;
    
    return apiClient.get('/reports/acquisition', { params });
  },

  /**
   * Get customer retention report
   * @param {Object} options - Options { startDate, endDate }
   * @returns {Promise<Object>} - Churn rate, repeat customers, etc.
   */
  async getRetentionReport(options = {}) {
    const params = {};
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;
    
    return apiClient.get('/reports/retention', { params });
  },

  /**
   * Get reviews report
   * @param {Object} options - Options { startDate, endDate, status }
   * @returns {Promise<Object>} - Reviews statistics
   */
  async getReviewsReport(options = {}) {
    const params = {};
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;
    if (options.status) params.status = options.status;
    
    return apiClient.get('/reports/reviews', { params });
  },

  /**
   * Get custom report
   * @param {Object} config - Report configuration
   * @returns {Promise<Object>} - Custom report data
   */
  async getCustomReport(config) {
    return apiClient.post('/reports/custom', config);
  },

  /**
   * Schedule report to email
   * @param {string} reportType - Report type
   * @param {Object} config - Schedule config { frequency, recipients, format }
   * @returns {Promise<Object>} - Schedule details
   */
  async scheduleReport(reportType, config) {
    return apiClient.post(`/reports/schedule/${reportType}`, config);
  },

  /**
   * Get scheduled reports
   * @returns {Promise<Array>} - List of scheduled reports
   */
  async getScheduledReports() {
    return apiClient.get('/reports/scheduled');
  },

  /**
   * Delete scheduled report
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise<void>}
   */
  async deleteScheduledReport(scheduleId) {
    return apiClient.delete(`/reports/scheduled/${scheduleId}`);
  },

  /**
   * Generate comparison report
   * @param {Object} options - Options { period1Start, period1End, period2Start, period2End }
   * @returns {Promise<Object>} - Comparison data
   */
  async getComparisonReport(options) {
    return apiClient.get('/reports/comparison', { params: options });
  },

  /**
   * Get KPI summary
   * @returns {Promise<Object>} - Key performance indicators
   */
  async getKPISummary() {
    return apiClient.get('/reports/kpi');
  }
};
