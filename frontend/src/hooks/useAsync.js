import { useState, useCallback, useEffect } from 'react';

/**
 * Generic custom hook for async operations
 * Handles loading, error, and data states
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute async function
   */
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await asyncFunction(...args);
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear data
   */
  const clearData = useCallback(() => {
    setData(null);
  }, []);

  /**
   * Clear all state
   */
  const clear = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * Automatically execute on mount if immediate is true
   */
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    // State
    loading,
    error,
    data,

    // Methods
    execute,
    clearError,
    clearData,
    clear,

    // Computed
    isSuccess: !loading && !error && data !== null,
    isError: !!error,
    isLoading: loading,
    isEmpty: data === null || (Array.isArray(data) && data.length === 0)
  };
};

/**
 * Advanced async hook with retry logic
 */
export const useAsyncWithRetry = (asyncFunction, maxRetries = 3, immediate = true) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [retries, setRetries] = useState(0);

  /**
   * Execute with retry logic
   */
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    setData(null);
    setRetries(0);

    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await asyncFunction(...args);
        setData(response);
        setRetries(attempt);
        setLoading(false);
        return response;
      } catch (err) {
        lastError = err;
        setRetries(attempt + 1);
        
        // Don't wait after last attempt
        if (attempt < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    // All retries failed
    const errorMessage = lastError?.message || 'Failed after multiple retries';
    setError(errorMessage);
    setLoading(false);
    throw lastError;
  }, [asyncFunction, maxRetries]);

  /**
   * Clear all state
   */
  const clear = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setRetries(0);
  }, []);

  /**
   * Auto-execute on mount
   */
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    loading,
    error,
    data,
    retries,
    execute,
    clear,
    
    isSuccess: !loading && !error && data !== null,
    isError: !!error
  };
};

/**
 * Debounced async hook for search/filter operations
 */
export const useAsyncDebounced = (asyncFunction, delay = 500) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  /**
   * Execute with debounce
   */
  const execute = useCallback((...args) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setLoading(true);
    setError(null);

    // Set new timeout
    const newTimeoutId = setTimeout(async () => {
      try {
        const response = await asyncFunction(...args);
        setData(response);
        setError(null);
      } catch (err) {
        const errorMessage = err?.message || 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [asyncFunction, delay, timeoutId]);

  /**
   * Cancel pending execution
   */
  const cancel = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
      setLoading(false);
    }
  }, [timeoutId]);

  /**
   * Clear state
   */
  const clear = useCallback(() => {
    cancel();
    setData(null);
    setError(null);
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    loading,
    error,
    data,
    execute,
    cancel,
    clear,
    
    isSuccess: !loading && !error && data !== null,
    isError: !!error
  };
};
