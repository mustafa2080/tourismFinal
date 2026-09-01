import { useState, useCallback } from 'react';

/**
 * Custom hook for managing search filters state
 */
export const useSearchFilters = (initialFilters = {}) => {
  const defaultFilters = {
    search: '',
    destination: '',
    category: null,
    tripType: [],
    minPrice: 0,
    maxPrice: 10000,
    minDuration: 1,
    maxDuration: 30,
    minRating: 0,
    activities: [],
    accommodationType: [],
    mealInclusion: [],
    specialRequests: [],
    ...initialFilters
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  /**
   * Update single filter value
   */
  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  /**
   * Add value to array filter (for multi-select)
   */
  const addToArrayFilter = useCallback((filterName, value) => {
    setFilters(prev => {
      const currentArray = prev[filterName] || [];
      if (currentArray.includes(value)) {
        return prev; // Already exists
      }
      return {
        ...prev,
        [filterName]: [...currentArray, value]
      };
    });
  }, []);

  /**
   * Remove value from array filter
   */
  const removeFromArrayFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: (prev[filterName] || []).filter(item => item !== value)
    }));
  }, []);

  /**
   * Toggle value in array filter
   */
  const toggleArrayFilter = useCallback((filterName, value) => {
    setFilters(prev => {
      const currentArray = prev[filterName] || [];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [filterName]: currentArray.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [filterName]: [...currentArray, value]
        };
      }
    });
  }, []);

  /**
   * Apply current filters (for delayed search)
   */
  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  }, [defaultFilters]);

  /**
   * Clear specific filter
   */
  const clearFilter = useCallback((filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: defaultFilters[filterName]
    }));
  }, [defaultFilters]);

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = defaultFilters[key];
      return JSON.stringify(value) !== JSON.stringify(defaultValue);
    });
  }, [filters, defaultFilters]);

  /**
   * Get count of active filters
   */
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      const defaultValue = defaultFilters[key];
      
      if (Array.isArray(value)) {
        if (value.length > 0) count++;
      } else if (value !== defaultValue && value !== '') {
        count++;
      }
    });
    return count;
  }, [filters, defaultFilters]);

  /**
   * Build query string from filters
   */
  const getQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (value !== '' && value !== null) {
        params.append(key, value);
      }
    });
    
    return params.toString();
  }, [appliedFilters]);

  /**
   * Update price range
   */
  const setPriceRange = useCallback((min, max) => {
    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  }, []);

  /**
   * Update duration range
   */
  const setDurationRange = useCallback((min, max) => {
    setFilters(prev => ({
      ...prev,
      minDuration: min,
      maxDuration: max
    }));
  }, []);

  /**
   * Get filtered out statistics
   */
  const getFilterStats = useCallback(() => {
    return {
      hasSearch: filters.search !== '',
      hasDestination: filters.destination !== '',
      hasCategory: filters.category !== null,
      hasTripTypes: (filters.tripType || []).length > 0,
      hasPriceFilter: filters.minPrice > defaultFilters.minPrice || 
                      filters.maxPrice < defaultFilters.maxPrice,
      hasDurationFilter: filters.minDuration > defaultFilters.minDuration || 
                         filters.maxDuration < defaultFilters.maxDuration,
      hasRatingFilter: filters.minRating > defaultFilters.minRating,
      hasActivities: (filters.activities || []).length > 0
    };
  }, [filters, defaultFilters]);

  return {
    // Current filters
    filters,
    appliedFilters,

    // Methods
    updateFilter,
    updateFilters,
    addToArrayFilter,
    removeFromArrayFilter,
    toggleArrayFilter,
    applyFilters,
    resetFilters,
    clearFilter,
    setPriceRange,
    setDurationRange,

    // Query helpers
    getQueryString,
    getFilterStats,
    hasActiveFilters: hasActiveFilters(),
    activeFiltersCount: getActiveFiltersCount(),

    // State checkers
    isEmpty: !hasActiveFilters(),
    isChanged: JSON.stringify(filters) !== JSON.stringify(appliedFilters)
  };
};
