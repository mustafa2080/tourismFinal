import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for debouncing values
 * Delays updating state until input stops changing
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timeout if value changes before delay expires
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Advanced debounce hook with callback
 */
export const useDebounceCallback = (callback, delay = 500) => {
  const [timeoutId, setTimeoutId] = useState(null);

  /**
   * Debounced callback
   */
  const debounced = useCallback((...args) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [callback, delay, timeoutId]);

  /**
   * Cancel pending execution
   */
  const cancel = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  /**
   * Execute immediately
   */
  const flush = useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    callback(...args);
  }, [callback, timeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    debounced,
    cancel,
    flush,
    isPending: timeoutId !== null
  };
};

/**
 * Debounce hook for search queries
 */
export const useDebouncedSearch = (onSearch, delay = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setIsSearching(true);

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for search
    const newTimeoutId = setTimeout(async () => {
      if (term.trim().length > 0) {
        try {
          await onSearch(term);
        } catch (error) {
          console.error('Search error:', error);
        }
      }
      setIsSearching(false);
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [onSearch, delay, timeoutId]);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearching(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    handleSearchChange,
    clearSearch
  };
};

/**
 * Debounce hook for form input validation
 */
export const useDebouncedValidation = (value, validate, delay = 500) => {
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (!value) {
      setError(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for validation
    const newTimeoutId = setTimeout(async () => {
      try {
        const validationError = await validate(value);
        setError(validationError || null);
      } catch (err) {
        setError(err.message || 'Validation error');
      } finally {
        setIsValidating(false);
      }
    }, delay);

    setTimeoutId(newTimeoutId);

    return () => clearTimeout(newTimeoutId);
  }, [value, validate, delay, timeoutId]);

  return {
    error,
    isValidating,
    isValid: !error && !isValidating && value
  };
};

/**
 * Debounce hook for API calls with caching
 */
export const useDebouncedAPI = (apiCall, delay = 500) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const [cache, setCache] = useState({});

  /**
   * Debounced API call
   */
  const execute = useCallback((...args) => {
    const cacheKey = JSON.stringify(args);

    // Return cached result immediately
    if (cache[cacheKey]) {
      setData(cache[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(async () => {
      try {
        const result = await apiCall(...args);
        setData(result);
        
        // Cache result
        setCache(prev => ({
          ...prev,
          [cacheKey]: result
        }));
      } catch (err) {
        setError(err.message || 'API call failed');
      } finally {
        setLoading(false);
      }
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [apiCall, delay, timeoutId, cache]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  /**
   * Cancel pending request
   */
  const cancel = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
      setLoading(false);
    }
  }, [timeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    data,
    loading,
    error,
    execute,
    cancel,
    clearCache,
    cacheSize: Object.keys(cache).length
  };
};
