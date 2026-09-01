/**
 * Date Utility Functions
 * Useful for date calculations and manipulations
 */

/**
 * Get number of days until a given date
 * @param {Date|string} date - Target date
 * @returns {number} days until date (negative if in past)
 */
export const getDaysUntil = (date) => {
  const targetDate = new Date(date);
  const today = new Date();

  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Get number of days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} days between dates
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(end - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Get date from now with offset
 * @param {number} days - Number of days to add/subtract
 * @param {number} hours - Number of hours to add/subtract (default: 0)
 * @returns {Date} new date
 */
export const getDateWithOffset = (days = 0, hours = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date;
};

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} new date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get minimum booking date (today + 15 days)
 * @returns {Date}
 */
export const getMinimumBookingDate = () => {
  return addDays(new Date(), 15);
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();

  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is tomorrow
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isTomorrow = (date) => {
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return d.toDateString() === tomorrow.toDateString();
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isPast = (date) => {
  const d = new Date(date);
  const today = new Date();

  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return d < today;
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isFuture = (date) => {
  const d = new Date(date);
  const today = new Date();

  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return d > today;
};

/**
 * Check if date is within next N days
 * @param {Date|string} date - Date to check
 * @param {number} days - Number of days (default: 7)
 * @returns {boolean}
 */
export const isWithinDays = (date, days = 7) => {
  const daysUntil = getDaysUntil(date);
  return daysUntil >= 0 && daysUntil <= days;
};

/**
 * Get day name from date
 * @param {Date|string} date - Date
 * @returns {string} day name
 */
export const getDayName = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Get short day name from date
 * @param {Date|string} date - Date
 * @returns {string} short day name
 */
export const getShortDayName = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Get month name from date
 * @param {Date|string} date - Date
 * @returns {string} month name
 */
export const getMonthName = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long' });
};

/**
 * Get quarter of the year (Q1-Q4)
 * @param {Date|string} date - Date
 * @returns {number} quarter (1-4)
 */
export const getQuarter = (date) => {
  const d = new Date(date);
  return Math.ceil((d.getMonth() + 1) / 3);
};

/**
 * Get week number of the year
 * @param {Date|string} date - Date
 * @returns {number} week number
 */
export const getWeekNumber = (date) => {
  const d = new Date(date);
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date} start of day (00:00:00)
 */
export const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date} end of day (23:59:59)
 */
export const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of month
 * @param {Date|string} date - Date
 * @returns {Date}
 */
export const getStartOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of month
 * @param {Date|string} date - Date
 * @returns {Date}
 */
export const getEndOfMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get array of dates between start and end
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Date[]} array of dates
 */
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const last = new Date(endDate);

  while (currentDate <= last) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Parse ISO string to Date
 * @param {string} isoString - ISO date string
 * @returns {Date|null} parsed date or null
 */
export const parseISO = (isoString) => {
  try {
    return new Date(isoString);
  } catch {
    return null;
  }
};

/**
 * Convert to ISO string
 * @param {Date} date - Date to convert
 * @returns {string} ISO string
 */
export const toISO = (date) => {
  return new Date(date).toISOString();
};

export default {
  getDaysUntil,
  getDaysBetween,
  getDateWithOffset,
  addDays,
  getMinimumBookingDate,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  isWithinDays,
  getDayName,
  getShortDayName,
  getMonthName,
  getQuarter,
  getWeekNumber,
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  getDateRange,
  parseISO,
  toISO
};