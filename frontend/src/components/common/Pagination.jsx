import React from 'react';

/**
 * Reusable Pagination Component
 * Page navigation with smart page numbers
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPrevNext = true,
  showFirstLast = true,
  maxButtons = 5,
  className = '',
  disabled = false,
  ...props
}) => {
  /**
   * Generate page numbers to display
   */
  const getPageNumbers = () => {
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const halfWindow = Math.floor(maxButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfWindow);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Add first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  /**
   * Handle page click
   */
  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  const pages = getPageNumbers();
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const classes = [className].filter(Boolean).join(' ');

  return (
    <div className={`pagination ${classes}`} {...props}>
      {/* First Page Button */}
      {showFirstLast && (
        <button
          className="pagination-btn pagination-btn-first"
          onClick={() => handlePageClick(1)}
          disabled={!canGoPrev || disabled}
          aria-label="First page"
        >
          ⟨⟨
        </button>
      )}

      {/* Previous Button */}
      {showPrevNext && (
        <button
          className="pagination-btn pagination-btn-prev"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!canGoPrev || disabled}
          aria-label="Previous page"
        >
          ⟨
        </button>
      )}

      {/* Page Numbers */}
      <div className="pagination-numbers">
        {pages.map((page, index) => (
          <button
            key={index}
            className={`pagination-number ${
              page === currentPage ? 'active' : ''
            } ${page === '...' ? 'ellipsis' : ''}`}
            onClick={() => handlePageClick(page)}
            disabled={page === '...' || disabled}
            aria-label={page === '...' ? 'More pages' : `Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      {showPrevNext && (
        <button
          className="pagination-btn pagination-btn-next"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!canGoNext || disabled}
          aria-label="Next page"
        >
          ⟩
        </button>
      )}

      {/* Last Page Button */}
      {showFirstLast && (
        <button
          className="pagination-btn pagination-btn-last"
          onClick={() => handlePageClick(totalPages)}
          disabled={!canGoNext || disabled}
          aria-label="Last page"
        >
          ⟩⟩
        </button>
      )}

      {/* Info */}
      <div className="pagination-info">
        <span>Page {currentPage} of {totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination;

/**
 * Usage Examples:
 * 
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * 
 * <Pagination
 *   currentPage={1}
 *   totalPages={50}
 *   onPageChange={handlePageChange}
 *   maxButtons={7}
 * />
 */
