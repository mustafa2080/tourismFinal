import React from 'react';

/**
 * Booking Table Skeleton Loader
 * Placeholder while loading bookings list
 */
const BookingTableSkeleton = ({ rows = 5, className = '', ...props }) => {
  return (
    <div className={`skeleton-table ${className}`} {...props}>
      {/* Table Header */}
      <div className="skeleton-table-header">
        <div className="skeleton-table-cell skeleton-loading"></div>
        <div className="skeleton-table-cell skeleton-loading"></div>
        <div className="skeleton-table-cell skeleton-loading"></div>
        <div className="skeleton-table-cell skeleton-loading"></div>
        <div className="skeleton-table-cell skeleton-loading"></div>
        <div className="skeleton-table-cell skeleton-loading"></div>
      </div>

      {/* Table Body */}
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table-row">
            <div className="skeleton-table-cell">
              <div className="skeleton-text skeleton-loading" style={{ width: '70%' }}></div>
            </div>
            <div className="skeleton-table-cell">
              <div className="skeleton-text skeleton-loading" style={{ width: '80%' }}></div>
            </div>
            <div className="skeleton-table-cell">
              <div className="skeleton-text skeleton-loading" style={{ width: '90%' }}></div>
            </div>
            <div className="skeleton-table-cell">
              <div className="skeleton-badge skeleton-loading"></div>
            </div>
            <div className="skeleton-table-cell">
              <div className="skeleton-text skeleton-loading" style={{ width: '60%' }}></div>
            </div>
            <div className="skeleton-table-cell">
              <div className="skeleton-button-small skeleton-loading"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingTableSkeleton;

/**
 * Usage:
 * <BookingTableSkeleton rows={10} />
 */
