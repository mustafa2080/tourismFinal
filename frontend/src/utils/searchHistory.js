/**
 * Search History Manager
 * Manages recent searches with in-memory storage
 */

let searchHistoryStore = [];
const MAX_HISTORY = 15;

export const searchHistoryManager = {
  /**
   * Add a search to history
   */
  addSearch: (query) => {
    if (!query || query.trim().length === 0) return;
    
    const trimmedQuery = query.trim();
    // Remove if already exists
    searchHistoryStore = searchHistoryStore.filter(
      item => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
    );
    
    // Add to front
    searchHistoryStore.unshift({
      query: trimmedQuery,
      timestamp: new Date().getTime()
    });
    
    // Keep only MAX_HISTORY items
    if (searchHistoryStore.length > MAX_HISTORY) {
      searchHistoryStore = searchHistoryStore.slice(0, MAX_HISTORY);
    }
  },

  /**
   * Get all search history
   */
  getHistory: () => searchHistoryStore,

  /**
   * Clear all history
   */
  clearHistory: () => {
    searchHistoryStore = [];
  },

  /**
   * Remove specific search from history
   */
  removeSearch: (query) => {
    searchHistoryStore = searchHistoryStore.filter(
      item => item.query.toLowerCase() !== query.toLowerCase()
    );
  },

  /**
   * Get recent searches (last N items)
   */
  getRecent: (limit = 5) => {
    return searchHistoryStore.slice(0, limit);
  }
};

export default searchHistoryManager;
