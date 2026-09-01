/**
 * Formatters Utility Functions
 * Used to format data for display
 */

/**
 * Format price to currency string
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} formatted price
 */
export const formatPrice = (price, currency = 'USD') => {
  const num = parseFloat(price);
  if (isNaN(num)) return '$0.00';

  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const symbols = {
    'EGP': '£',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };

  return `${symbols[currency] || currency} ${formatted}`;
};

// Alias for consistency
export const formatCurrency = (price) => formatPrice(price, 'USD');

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format style: 'short' | 'long' | 'full'
 * @returns {string} formatted date
 */
export const formatDate = (date, format = 'short') => {
  try {
    const d = new Date(date);
    const options = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };

    return d.toLocaleDateString('en-US', options[format] || options.short);
  } catch {
    return date;
  }
};

/**
 * Format date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate, 'short');
  const end = formatDate(endDate, 'short');
  return `${start} - ${end}`;
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @param {string} countryCode - Country code (default: 'EG')
 * @returns {string} formatted phone
 */
export const formatPhoneNumber = (phone, countryCode = 'EG') => {
  const cleaned = phone.replace(/\D/g, '');

  if (countryCode === 'EG') {
    // Format: +20 123 456 7890 or 0123 456 7890
    if (cleaned.startsWith('201')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    if (cleaned.startsWith('01')) {
      return `0${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
  }

  return phone;
};

/**
 * Format duration in days to readable string
 * @param {number} days - Number of days
 * @returns {string} formatted duration
 */
export const formatDuration = (days) => {
  if (!days) return 'N/A';
  return `${days} Day${days > 1 ? 's' : ''}`;
};

/**
 * Format rating with stars
 * @param {number} rating - Rating value (1-5)
 * @returns {string} formatted rating with stars
 */
export const formatRating = (rating) => {
  const num = parseFloat(rating) || 0;
  const stars = '⭐'.repeat(Math.round(num));
  return `${stars} (${num.toFixed(1)})`;
};

/**
 * Format large numbers with K, M notation
 * @param {number} num - Number to format
 * @returns {string} formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Truncate text to max length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Format status badge with color
 * @param {string} status - Status value
 * @returns {object} { text, color, bgColor }
 */
export const formatStatus = (status) => {
  const statuses = {
    pending: { text: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
    confirmed: { text: 'Confirmed', color: '#10b981', bgColor: '#d1fae5' },
    completed: { text: 'Completed', color: '#3b82f6', bgColor: '#dbeafe' },
    cancelled: { text: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2' }
  };

  return statuses[status] || { text: status, color: '#6b7280', bgColor: '#f3f4f6' };
};

/**
 * Format trip type
 * @param {string} tripType - Trip type value
 * @returns {string} formatted trip type
 */
export const formatTripType = (tripType) => {
  const types = {
    family: 'Family',
    adventure: 'Adventure',
    honeymoon: 'Honeymoon',
    business: 'Business',
    cultural: 'Cultural'
  };

  return types[tripType] || tripType;
};

/**
 * Format currency code to symbol
 * @param {string} code - Currency code
 * @returns {string} currency symbol
 */
export const getCurrencySymbol = (code) => {
  const symbols = {
    'EGP': '£',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'د.إ',
    'SAR': '﷼'
  };

  return symbols[code] || code;
};

/**
 * Format time to HH:MM:SS
 * @param {Date|string} time - Time to format
 * @returns {string} formatted time
 */
export const formatTime = (time) => {
  try {
    const d = new Date(time);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  } catch {
    return time;
  }
};

/**
 * Format booking number with pattern
 * @param {string} bookingId - Booking ID
 * @returns {string} formatted booking number
 */
export const formatBookingNumber = (bookingId) => {
  if (!bookingId) return 'N/A';
  return `BK-${bookingId.slice(0, 8).toUpperCase()}`;
};

/**
 * Format file size (bytes to KB, MB, GB)
 * @param {number} bytes - Size in bytes
 * @returns {string} formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default {
  formatPrice,
  formatCurrency,
  formatDate,
  formatDateRange,
  formatPhoneNumber,
  formatDuration,
  formatRating,
  formatNumber,
  truncateText,
  formatStatus,
  formatTripType,
  getCurrencySymbol,
  formatTime,
  formatBookingNumber,
  formatFileSize
};