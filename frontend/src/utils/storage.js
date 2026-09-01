/**
 * Local Storage Utility Functions
 * Helper functions for localStorage operations
 */

import { LOCAL_STORAGE_KEYS } from '../config/constants';

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} stored value or default
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} success status
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Clear all localStorage
 * @returns {boolean} success status
 */
export const clearAll = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage', error);
    return false;
  }
};

/**
 * Get all recent searches
 * @returns {array} array of recent searches
 */
export const getRecentSearches = () => {
  return getItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES, []);
};

/**
 * Add search to recent searches
 * @param {string} query - Search query
 * @param {number} maxItems - Max number of searches to keep (default: 10)
 */
export const addRecentSearch = (query, maxItems = 10) => {
  if (!query || query.trim().length === 0) return;

  const searches = getRecentSearches();
  const filtered = searches.filter(s => s !== query);
  filtered.unshift(query);
  const limited = filtered.slice(0, maxItems);

  setItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES, limited);
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = () => {
  removeItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES);
};

/**
 * Get saved filters
 * @returns {object} saved filters
 */
export const getSavedFilters = () => {
  return getItem(LOCAL_STORAGE_KEYS.SAVED_FILTERS, {});
};

/**
 * Save filters
 * @param {object} filters - Filter object to save
 */
export const saveFilters = (filters) => {
  setItem(LOCAL_STORAGE_KEYS.SAVED_FILTERS, filters);
};

/**
 * Clear saved filters
 */
export const clearSavedFilters = () => {
  removeItem(LOCAL_STORAGE_KEYS.SAVED_FILTERS);
};

/**
 * Get user preferences
 * @returns {object} user preferences
 */
export const getUserPreferences = () => {
  return getItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, {
    language: 'en',
    currency: 'EGP',
    notifications: true
  });
};

/**
 * Update user preference
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 */
export const setUserPreference = (key, value) => {
  const prefs = getUserPreferences();
  prefs[key] = value;
  setItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, prefs);
};

/**
 * Get theme preference
 * @returns {string} 'light' or 'dark'
 */
export const getTheme = () => {
  return getItem(LOCAL_STORAGE_KEYS.THEME, 'light');
};

/**
 * Set theme preference
 * @param {string} theme - 'light' or 'dark'
 */
export const setTheme = (theme) => {
  setItem(LOCAL_STORAGE_KEYS.THEME, theme);
};

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export default {
  getItem,
  setItem,
  removeItem,
  clearAll,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getSavedFilters,
  saveFilters,
  clearSavedFilters,
  getUserPreferences,
  setUserPreference,
  getTheme,
  setTheme,
  isLocalStorageAvailable
};