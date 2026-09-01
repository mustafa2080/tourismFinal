/**
 * Helper Utility Functions
 * General purpose helpers used throughout the app
 */

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean}
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Check if value exists in array
 * @param {array} arr - Array to check
 * @param {any} value - Value to search
 * @returns {boolean}
 */
export const arrayIncludes = (arr, value) => {
  if (!Array.isArray(arr)) return false;
  return arr.includes(value);
};

/**
 * Remove item from array
 * @param {array} arr - Array
 * @param {any} item - Item to remove
 * @returns {array} new array without item
 */
export const arrayRemove = (arr, item) => {
  return arr.filter(element => element !== item);
};

/**
 * Remove by index from array
 * @param {array} arr - Array
 * @param {number} index - Index to remove
 * @returns {array} new array
 */
export const arrayRemoveAt = (arr, index) => {
  return arr.filter((_, i) => i !== index);
};

/**
 * Get unique values from array
 * @param {array} arr - Array with possible duplicates
 * @returns {array} unique values
 */
export const arrayUnique = (arr) => {
  return [...new Set(arr)];
};

/**
 * Sort array of objects by property
 * @param {array} arr - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {array} sorted array
 */
export const sortByProperty = (arr, property, order = 'asc') => {
  return [...arr].sort((a, b) => {
    if (a[property] < b[property]) return order === 'asc' ? -1 : 1;
    if (a[property] > b[property]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter array by property value
 * @param {array} arr - Array to filter
 * @param {string} property - Property to filter by
 * @param {any} value - Value to match
 * @returns {array} filtered array
 */
export const filterByProperty = (arr, property, value) => {
  return arr.filter(item => item[property] === value);
};

/**
 * Group array items by property
 * @param {array} arr - Array to group
 * @param {string} property - Property to group by
 * @returns {object} grouped object
 */
export const groupByProperty = (arr, property) => {
  return arr.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Debounce a function
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle a function
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function} throttled function
 */
export const throttle = (func, limit = 300) => {
  let lastCall = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Convert object to query string
 * @param {object} obj - Object to convert
 * @returns {string} query string
 */
export const objectToQueryString = (obj) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  return params.toString();
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string to parse
 * @returns {object} parsed object
 */
export const queryStringToObject = (queryString) => {
  const params = new URLSearchParams(queryString);
  const obj = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * Sleep for specified milliseconds (for async/await)
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
export const sleep = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a promise multiple times
 * @param {function} fn - Function returning promise
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise}
 */
export const retryPromise = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(delay);
    }
  }
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} initials (max 2 chars)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Generate random ID
 * @returns {string} random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Scroll to element
 * @param {HTMLElement|string} element - Element or selector
 * @param {object} options - Scroll options { behavior, block, inline }
 */
export const scrollToElement = (element, options = {}) => {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start', ...options });
  }
};

/**
 * Scroll to top
 * @param {number} duration - Animation duration in ms
 */
export const scrollToTop = (duration = 300) => {
  const start = window.scrollY;
  const startTime = performance.now();

  const scroll = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start * (1 - progress));

    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  };

  requestAnimationFrame(scroll);
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export const isElementInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Get DOM element dimensions
 * @param {HTMLElement} element - Element
 * @returns {object} { width, height, top, left }
 */
export const getElementDimensions = (element) => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right
  };
};

/**
 * Check if device is mobile
 * @returns {boolean}
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Check if device is touch-enabled
 * @returns {boolean}
 */
export const isTouchDevice = () => {
  return (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0)
  );
};

export default {
  deepClone,
  isEmptyObject,
  arrayIncludes,
  arrayRemove,
  arrayRemoveAt,
  arrayUnique,
  sortByProperty,
  filterByProperty,
  groupByProperty,
  debounce,
  throttle,
  objectToQueryString,
  queryStringToObject,
  sleep,
  retryPromise,
  getInitials,
  generateId,
  generateUUID,
  copyToClipboard,
  scrollToElement,
  scrollToTop,
  isElementInViewport,
  getElementDimensions,
  isMobileDevice,
  isTouchDevice
};