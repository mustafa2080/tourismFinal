import React, { useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

/**
 * Modern Advanced Pagination Component
 * Beautiful, responsive pagination with smart page calculation
 */
const AdvancedPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  showItemsInfo = true,
  showJumpTo = true,
  className = '',
  disabled = false,
  variant = 'modern', // 'modern', 'minimal', 'compact'
}) => {
  const [jumpValue, setJumpValue] = React.useState('');

  // Calculate page numbers to display
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const maxPagesToShow = 5;
    const halfWindow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfWindow);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage && !disabled) {
      onPageChange(page);
      setJumpValue('');
    }
  };

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const page = parseInt(jumpValue, 10);
    if (page >= 1 && page <= totalPages) {
      handlePageClick(page);
      setJumpValue('');
    }
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!canGoPrev || disabled}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <FiChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => (
            <button
              key={idx}
              onClick={() => handlePageClick(page)}
              disabled={page === '...' || disabled}
              className={`w-10 h-10 rounded-lg font-semibold transition ${
                page === currentPage
                  ? 'bg-blue-600 text-white shadow-lg'
                  : page === '...'
                  ? 'cursor-default text-gray-500'
                  : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!canGoNext || disabled}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
        <div className="text-sm text-gray-600 dark:text-slate-400">
          Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of{' '}
          <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageClick(1)}
            disabled={!canGoPrev || disabled}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="First page"
          >
            <FiChevronsLeft size={18} />
          </button>

          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={!canGoPrev || disabled}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Previous page"
          >
            <FiChevronLeft size={18} />
          </button>

          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={!canGoNext || disabled}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Next page"
          >
            <FiChevronRight size={18} />
          </button>

          <button
            onClick={() => handlePageClick(totalPages)}
            disabled={!canGoNext || disabled}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Last page"
          >
            <FiChevronsRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Modern variant (default)
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Info Row */}
      {showItemsInfo && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700/50 rounded-lg border border-blue-200 dark:border-slate-600">
          <div className="text-sm text-gray-700 dark:text-slate-300">
            Showing <span className="font-bold text-blue-600 dark:text-blue-400">{startItem}</span> to{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">{endItem}</span> of{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">{totalItems}</span> results
          </div>

          <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Prev/Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageClick(1)}
            disabled={!canGoPrev || disabled}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="First page"
            aria-label="First page"
          >
            <FiChevronsLeft size={18} />
          </button>

          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={!canGoPrev || disabled}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Previous page"
            aria-label="Previous page"
          >
            <FiChevronLeft size={18} />
          </button>
        </div>

        {/* Center: Page Numbers */}
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {pageNumbers.map((page, idx) => (
            <button
              key={idx}
              onClick={() => handlePageClick(page)}
              disabled={page === '...' || disabled}
              className={`w-10 h-10 rounded-lg font-semibold transition-all transform ${
                page === currentPage
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-400/50 scale-110'
                  : page === '...'
                  ? 'cursor-default text-gray-400 dark:text-slate-500'
                  : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Right: Next/Last */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={!canGoNext || disabled}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Next page"
            aria-label="Next page"
          >
            <FiChevronRight size={18} />
          </button>

          <button
            onClick={() => handlePageClick(totalPages)}
            disabled={!canGoNext || disabled}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Last page"
            aria-label="Last page"
          >
            <FiChevronsRight size={18} />
          </button>
        </div>
      </div>

      {/* Jump To Page */}
      {showJumpTo && totalPages > 10 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
            <label htmlFor="jump-input" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Jump to:
            </label>
            <div className="flex items-center gap-1">
              <input
                id="jump-input"
                type="number"
                min="1"
                max={totalPages}
                value={jumpValue}
                onChange={(e) => setJumpValue(e.target.value)}
                placeholder="Page"
                className="w-16 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!jumpValue || disabled}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Go
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdvancedPagination;
