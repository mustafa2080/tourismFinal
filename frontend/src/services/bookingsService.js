/**
 * Bookings Service
 * Handles all booking-related API calls
 */

import apiClient from './apiClient';

/**
 * Create a new booking (with 15-day validation on backend)
 * @param {object} data - Booking data { packageId, tripStartDate, persons, totalPrice, roomType, extras, notes }
 * @returns {Promise<object>} Created booking
 */
export const createBooking = async (data) => {
  try {
    const response = await apiClient.post('/bookings', data);
    return response;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get user's bookings
 * @param {object} params - Query parameters { limit, offset }
 * @returns {Promise<{data, count, pagination}>}
 */
export const getUserBookings = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/bookings/my-bookings?${queryString}`);
    return response;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

/**
 * Get booking details
 * @param {string} bookingId - Booking ID or booking number
 * @returns {Promise<object>} Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Get booking invoice
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Blob>} PDF file
 */
export const getBookingInvoice = async (bookingId) => {
  try {
    const response = await apiClient.get(`/bookings/${bookingId}/invoice`, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error(`Error fetching invoice for booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Download booking invoice as PDF
 * @param {string} bookingId - Booking ID
 * @param {string} fileName - File name for download
 */
export const downloadBookingInvoice = async (bookingId, fileName = 'invoice.pdf') => {
  try {
    const blob = await getBookingInvoice(bookingId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading invoice for booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Cancel booking
 * @param {string} bookingId - Booking ID
 * @param {object} data - { reason }
 * @returns {Promise<object>} Cancelled booking
 */
export const cancelBooking = async (bookingId, data = {}) => {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/cancel`, data);
    return response;
  } catch (error) {
    console.error(`Error cancelling booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Get all bookings (Admin only)
 * @param {object} params - Query parameters { limit, offset, status, packageId }
 * @returns {Promise<{data, count, pagination}>}
 */
export const getAllBookings = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/bookings?${queryString}`);
    return response;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

/**
 * Get bookings by status (Admin only)
 * @param {string} status - Booking status (pending, confirmed, completed, cancelled)
 * @param {object} params - Query parameters { limit, offset }
 * @returns {Promise<{data, count}>}
 */
export const getBookingsByStatus = async (status, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/bookings/status/${status}?${queryString}`);
    return response;
  } catch (error) {
    console.error(`Error fetching bookings with status ${status}:`, error);
    throw error;
  }
};

/**
 * Get upcoming bookings (Admin only)
 * @param {object} params - Query parameters { daysAhead, limit, offset }
 * @returns {Promise<{data, count}>}
 */
export const getUpcomingBookings = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/bookings/upcoming/all?${queryString}`);
    return response;
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    throw error;
  }
};

/**
 * Get booking statistics (Admin only)
 * @returns {Promise<object>} { totalBookings, confirmed, pending, completed, cancelled, totalRevenue }
 */
export const getBookingStats = async () => {
  try {
    const response = await apiClient.get('/bookings/stats');
    return response;
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    throw error;
  }
};

/**
 * Update booking status (Admin only)
 * @param {string} bookingId - Booking ID
 * @param {object} data - { status, notes }
 * @returns {Promise<object>} Updated booking
 */
export const updateBookingStatus = async (bookingId, data) => {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, data);
    return response;
  } catch (error) {
    console.error(`Error updating booking ${bookingId} status:`, error);
    throw error;
  }
};

/**
 * Complete trip - User marks their trip as completed
 * @param {string} bookingId - Booking ID
 * @returns {Promise<object>} Updated booking
 */
export const completeTrip = async (bookingId) => {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/complete`);
    return response;
  } catch (error) {
    console.error(`Error completing trip for booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Issue refund for booking (Admin only)
 * @param {string} bookingId - Booking ID
 * @param {object} data - { amount, reason }
 * @returns {Promise<object>} Refund details
 */
export const issueRefund = async (bookingId, data) => {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/refund`, data);
    return response;
  } catch (error) {
    console.error(`Error issuing refund for booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Get count of bookings for a package
 * @param {string} packageId - Package ID
 * @returns {Promise<object>} { count }
 */
export const getPackageBookingCount = async (packageId) => {
  try {
    const response = await apiClient.get(`/bookings/package/${packageId}/count`);
    return response;
  } catch (error) {
    console.error(`Error fetching booking count for package ${packageId}:`, error);
    throw error;
  }
};

/**
 * Calculate booking price (for preview before booking)
 * @param {object} data - { packageId, persons, extras }
 * @returns {Promise<object>} Price breakdown { basePrice, baseSubtotal, extrasSubtotal, subtotal, tax, total }
 */
export const calculatePrice = async (data) => {
  try {
    const response = await apiClient.post('/bookings/calculate-price', data);
    return response.data || response;
  } catch (error) {
    console.error('Error calculating price:', error);
    throw error;
  }
};

export const bookingsService = {
  createBooking,
  getUserBookings,
  getBookingById,
  getBookingInvoice,
  downloadBookingInvoice,
  cancelBooking,
  getAllBookings,
  getBookingsByStatus,
  getUpcomingBookings,
  getBookingStats,
  updateBookingStatus,
  completeTrip,
  issueRefund,
  getPackageBookingCount,
  calculatePrice
};

export default bookingsService;