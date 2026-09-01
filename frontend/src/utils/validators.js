/**
 * Validators Utility Functions
 * Used for form validation and data validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid, strength: 'weak'|'medium'|'strong', feedback }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      strength: 'weak',
      feedback: 'Password must be at least 8 characters'
    };
  }

  let strength = 'weak';
  let checks = 0;

  if (/[a-z]/.test(password)) checks++;
  if (/[A-Z]/.test(password)) checks++;
  if (/[0-9]/.test(password)) checks++;
  if (/[!@#$%^&*]/.test(password)) checks++;

  if (checks >= 3) strength = 'strong';
  else if (checks >= 2) strength = 'medium';

  return {
    isValid: checks >= 2,
    strength,
    feedback: checks < 2 ? 'Password too weak' : `Password strength: ${strength}`
  };
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @param {string} countryCode - Country code (e.g., 'EG', 'US')
 * @returns {boolean}
 */
export const validatePhone = (phone, countryCode = 'EG') => {
  // Remove spaces and special characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Egypt: 11-13 digits, starts with 01
  if (countryCode === 'EG') {
    return /^201\d{8,10}$/.test(cleanPhone) || /^01\d{8,10}$/.test(cleanPhone);
  }

  // Default: at least 10 digits
  return cleanPhone.length >= 10;
};

/**
 * Validate name (at least 2 characters, no numbers)
 * @param {string} name - Name to validate
 * @returns {boolean}
 */
export const validateName = (name) => {
  if (!name || name.trim().length < 2) return false;
  // Allow letters, spaces, hyphens, apostrophes, Arabic characters
  return /^[a-zA-Z\s\-'ء-ي]+$/.test(name);
};

/**
 * Validate booking date (15-day rule)
 * @param {Date|string} tripDate - Trip start date
 * @returns {object} { isValid, daysUntilTrip, error }
 */
export const validateBookingDate = (tripDate) => {
  try {
    const date = new Date(tripDate);
    const today = new Date();

    // Set hours to 0 for accurate day comparison
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const daysUntil = Math.floor((date - today) / (1000 * 60 * 60 * 24));

    if (daysUntil < 15) {
      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() + 15);
      return {
        isValid: false,
        daysUntilTrip: daysUntil,
        error: `Booking must be at least 15 days in advance. Earliest date: ${minDate.toDateString()}`
      };
    }

    return {
      isValid: true,
      daysUntilTrip: daysUntil,
      error: null
    };
  } catch (err) {
    return {
      isValid: false,
      daysUntilTrip: 0,
      error: 'Invalid date format'
    };
  }
};

/**
 * Check if booking date is valid (≥15 days from now)
 * @param {Date|string} tripDate - Trip start date
 * @returns {boolean}
 */
export const canBookTrip = (tripDate) => {
  const validation = validateBookingDate(tripDate);
  return validation.isValid;
};

/**
 * Get minimum booking date (today + 15 days)
 * @returns {Date}
 */
export const getMinimumBookingDate = () => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 15);
  return minDate;
};

/**
 * Validate price (must be positive number)
 * @param {number|string} price - Price to validate
 * @returns {boolean}
 */
export const validatePrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate numbers only
 * @param {string} value - Value to validate
 * @returns {boolean}
 */
export const validateNumbersOnly = (value) => {
  return /^\d+$/.test(value);
};

/**
 * Validate required field (not empty, not just spaces)
 * @param {string|number} value - Value to validate
 * @returns {boolean}
 */
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== '';
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateBookingDate,
  canBookTrip,
  getMinimumBookingDate,
  validatePrice,
  validateURL,
  validateNumbersOnly,
  validateRequired
};