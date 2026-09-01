import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pagination logic
 */
export const usePagination = (initialTotal = 0, initialPageSize = 10) => {
  const [total, setTotal] = useState(initialTotal);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Calculate total pages
   */
  const totalPages = Math.ceil(total / pageSize) || 1;

  /**
   * Calculate offset for API requests
   */
  const offset = (currentPage - 1) * pageSize;

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
    return pageNum;
  }, [totalPages]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      return currentPage + 1;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      return currentPage - 1;
    }
    return currentPage;
  }, [currentPage]);

  /**
   * Go to first page
   */
  const firstPage = useCallback(() => {
    setCurrentPage(1);
    return 1;
  }, []);

  /**
   * Go to last page
   */
  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
    return totalPages;
  }, [totalPages]);

  /**
   * Change page size
   */
  const changePageSize = useCallback((newSize) => {
    if (newSize > 0) {
      setPageSize(newSize);
      setCurrentPage(1); // Reset to first page
    }
  }, []);

  /**
   * Set total count
   */
  const setTotalCount = useCallback((count) => {
    setTotal(count);
  }, []);

  /**
   * Reset pagination
   */
  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  /**
   * Get pages array for pagination display
   * Shows current page ± 2 pages (or adjusted for boundaries)
   */
  const getPageNumbers = useCallback(() => {
    if (totalPages <= 1) return [];
    
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;

    const range = [];
    
    // Add first page
    if (left > 1) {
      range.push(1);
    }
    
    // Add ellipsis if needed
    if (left > 2) {
      range.push('...');
    }
    
    // Add pages around current
    for (let i = Math.max(1, left); i < Math.min(totalPages + 1, right); i++) {
      range.push(i);
    }
    
    // Add ellipsis if needed
    if (right < totalPages) {
      range.push('...');
    }
    
    // Add last page
    if (right < totalPages + 1) {
      range.push(totalPages);
    }
    
    return range;
  }, [currentPage, totalPages]);

  /**
   * Get range display (e.g., "1-10 of 95")
   */
  const getRangeDisplay = useCallback(() => {
    const from = offset + 1;
    const to = Math.min(offset + pageSize, total);
    return { from, to, total };
  }, [offset, pageSize, total]);

  /**
   * Check if data can be loaded (based on current state)
   */
  const canFetchMore = useCallback(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  return {
    // State
    currentPage,
    pageSize,
    total,
    totalPages,
    offset,

    // Methods
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changePageSize,
    setTotalCount,
    reset,

    // Display helpers
    getPageNumbers: getPageNumbers(),
    getRangeDisplay: getRangeDisplay(),

    // Checkers
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    canFetchMore: canFetchMore(),
    isEmpty: total === 0,
    itemsShowing: Math.min(pageSize, total - offset)
  };
};
