import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * Syncs state with localStorage automatically
 */
export const useLocalStorage = (key, initialValue = null) => {
  // Check if we're in browser
  const isClient = typeof window !== 'undefined';

  /**
   * Initialize state from localStorage or use initialValue
   */
  const [storedValue, setStoredValue] = useState(() => {
    if (!isClient) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Set value in state and localStorage
   */
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (isClient) {
        if (valueToStore === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [isClient, key, storedValue]);

  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(null);
      if (isClient) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [isClient, key]);

  /**
   * Listen to storage changes from other tabs
   */
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isClient, key]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for storing JSON objects in localStorage
 */
export const useLocalStorageObject = (key, initialObject = {}) => {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage(key, initialObject);

  /**
   * Update specific field in object
   */
  const updateField = useCallback((field, value) => {
    setStoredValue(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setStoredValue]);

  /**
   * Merge new object with stored
   */
  const mergeObject = useCallback((newObject) => {
    setStoredValue(prev => ({
      ...prev,
      ...newObject
    }));
  }, [setStoredValue]);

  /**
   * Clear specific field
   */
  const clearField = useCallback((field) => {
    setStoredValue(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, [setStoredValue]);

  return {
    object: storedValue,
    setObject: setStoredValue,
    updateField,
    mergeObject,
    clearField,
    remove: removeValue,
    reset: () => setStoredValue(initialObject)
  };
};

/**
 * Hook for storing arrays in localStorage
 */
export const useLocalStorageArray = (key, initialArray = []) => {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage(key, initialArray);

  /**
   * Add item to array
   */
  const add = useCallback((item) => {
    setStoredValue(prev => {
      if (prev.includes(item)) return prev;
      return [...prev, item];
    });
  }, [setStoredValue]);

  /**
   * Remove item from array
   */
  const remove = useCallback((item) => {
    setStoredValue(prev => prev.filter(i => i !== item));
  }, [setStoredValue]);

  /**
   * Check if item exists
   */
  const includes = useCallback((item) => {
    return storedValue.includes(item);
  }, [storedValue]);

  /**
   * Clear array
   */
  const clear = useCallback(() => {
    setStoredValue([]);
  }, [setStoredValue]);

  /**
   * Toggle item in array
   */
  const toggle = useCallback((item) => {
    setStoredValue(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  }, [setStoredValue]);

  return {
    array: storedValue,
    setArray: setStoredValue,
    add,
    remove,
    includes,
    clear,
    toggle,
    length: storedValue.length,
    isEmpty: storedValue.length === 0,
    removeAll: removeValue,
    reset: () => setStoredValue(initialArray)
  };
};

/**
 * Hook for syncing multiple localStorage values
 */
export const useLocalStorageMulti = (keys, initialValues = {}) => {
  const values = {};
  const setters = {};
  const removers = {};

  keys.forEach(key => {
    const [value, setValue, removeValue] = useLocalStorage(
      key,
      initialValues[key] || null
    );
    values[key] = value;
    setters[key] = setValue;
    removers[key] = removeValue;
  });

  /**
   * Save all values
   */
  const saveAll = useCallback((newValues) => {
    Object.entries(newValues).forEach(([key, value]) => {
      if (key in setters) {
        setters[key](value);
      }
    });
  }, [setters]);

  /**
   * Remove all
   */
  const removeAll = useCallback(() => {
    Object.values(removers).forEach(remove => remove());
  }, [removers]);

  return {
    values,
    setters,
    removers,
    saveAll,
    removeAll
  };
};
