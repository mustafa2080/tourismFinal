import { useState, useCallback, useEffect } from 'react';
import { packagesService } from '../services';
import { useAutoTranslatePackages } from './useAutoTranslatePackages';

/**
 * Custom hook for managing packages data
 * Handles fetching, filtering, searching, and sorting
 */
export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    minPrice: null,
    maxPrice: null,
    minDuration: null,
    maxDuration: null,
    rating: null
  });
  const [sortBy, setSortBy] = useState('popular');

  // 🔥 Auto-translate packages when language changes
  const { translatedPackages, isTranslating } = useAutoTranslatePackages(
    packages,
    ['title', 'destination', 'short_desc', 'long_desc', 'trip_type']
  );

  /**
   * Fetch packages with current filters and sort
   */
  const fetchPackages = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const limit = 12;
      const offset = (page - 1) * limit;
      
      const response = await packagesService.searchPackages(
        {
          search: filters.search,
          category: filters.category,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minDuration: filters.minDuration,
          maxDuration: filters.maxDuration,
          rating: filters.rating
        },
        { limit, offset },
        sortBy
      );
      
      setPackages(response.packages || []);
      setTotal(response.total || 0);
      setPages(response.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Failed to fetch packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  /**
   * Get featured packages
   */
  const fetchFeaturedPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await packagesService.getFeaturedPackages(12);
      setPackages(response || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch featured packages');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update search query
   */
  const search = useCallback((query) => {
    setFilters(prev => ({ ...prev, search: query }));
    setCurrentPage(1);
  }, []);

  /**
   * Update filters
   */
  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  }, []);

  /**
   * Apply multiple filters at once
   */
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: null,
      minPrice: null,
      maxPrice: null,
      minDuration: null,
      maxDuration: null,
      rating: null
    });
    setSortBy('popular');
    setCurrentPage(1);
  }, []);

  /**
   * Change sort order
   */
  const sort = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  }, []);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page) => {
    if (page > 0 && page <= pages) {
      fetchPackages(page);
    }
  }, [pages, fetchPackages]);

  /**
   * Get next page
   */
  const nextPage = useCallback(() => {
    if (currentPage < pages) {
      fetchPackages(currentPage + 1);
    }
  }, [currentPage, pages, fetchPackages]);

  /**
   * Get previous page
   */
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchPackages(currentPage - 1);
    }
  }, [currentPage, fetchPackages]);

  /**
   * Get single package
   */
  const getPackageById = useCallback(async (packageId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await packagesService.getPackageById(packageId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch package');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get related packages
   */
  const getRelatedPackages = useCallback(async (packageId) => {
    try {
      const response = await packagesService.getRelatedPackages(packageId);
      return response || [];
    } catch (err) {
      console.error('Failed to fetch related packages:', err);
      return [];
    }
  }, []);

  return {
    // Data
    packages: translatedPackages.length > 0 ? translatedPackages : packages,  // 🔥 Use translated if available
    loading: loading || isTranslating,  // Include translation loading
    error,
    total,
    pages,
    currentPage,
    filters,
    sortBy,
    
    // Methods
    fetchPackages,
    fetchFeaturedPackages,
    search,
    updateFilter,
    applyFilters,
    resetFilters,
    sort,
    goToPage,
    nextPage,
    prevPage,
    getPackageById,
    getRelatedPackages,
    
    // Utility
    hasNextPage: currentPage < pages,
    hasPrevPage: currentPage > 1,
    isLastPage: currentPage === pages,
    isEmpty: packages.length === 0,
    isTranslating  // 🔥 Let components know if translating
  };
};
