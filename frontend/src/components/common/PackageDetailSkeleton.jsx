import React from 'react';

/**
 * Package Detail Page Skeleton Loader
 * Placeholder while loading package details
 */
const PackageDetailSkeleton = ({ className = '', ...props }) => {
  return (
    <div className={`skeleton-detail ${className}`} {...props}>
      {/* Header Section */}
      <div className="skeleton-header">
        {/* Gallery Skeleton */}
        <div className="skeleton-gallery">
          <div className="skeleton-main-image skeleton-loading"></div>
          <div className="skeleton-thumbnails">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-thumbnail skeleton-loading"></div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="skeleton-info">
          <div className="skeleton-title skeleton-loading"></div>
          <div className="skeleton-subtitle skeleton-loading" style={{ width: '70%' }}></div>

          {/* Rating */}
          <div className="skeleton-rating">
            <div className="skeleton-stars skeleton-loading"></div>
            <div className="skeleton-reviews skeleton-loading"></div>
          </div>

          {/* Price */}
          <div className="skeleton-price skeleton-loading"></div>

          {/* Actions */}
          <div className="skeleton-actions">
            <div className="skeleton-button skeleton-loading"></div>
            <div className="skeleton-button skeleton-loading"></div>
          </div>
        </div>
      </div>

      {/* Itinerary Section */}
      <div className="skeleton-section">
        <div className="skeleton-section-title skeleton-loading"></div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-itinerary-item">
            <div className="skeleton-day-title skeleton-loading"></div>
            <div className="skeleton-text skeleton-loading" style={{ width: '90%' }}></div>
            <div className="skeleton-text skeleton-loading" style={{ width: '85%' }}></div>
          </div>
        ))}
      </div>

      {/* Inclusions Section */}
      <div className="skeleton-section">
        <div className="skeleton-section-title skeleton-loading"></div>
        <div className="skeleton-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-list-item skeleton-loading"></div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="skeleton-section">
        <div className="skeleton-section-title skeleton-loading"></div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton-review-item">
            <div className="skeleton-review-header">
              <div className="skeleton-avatar skeleton-loading"></div>
              <div className="skeleton-review-title skeleton-loading"></div>
            </div>
            <div className="skeleton-text skeleton-loading" style={{ width: '100%' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageDetailSkeleton;

/**
 * Usage:
 * <PackageDetailSkeleton />
 */
