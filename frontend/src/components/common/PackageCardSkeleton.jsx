import React from 'react';

/**
 * Package Card Skeleton Loader
 * Placeholder while loading package cards
 */
const PackageCardSkeleton = ({ count = 1, className = '', ...props }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`skeleton-card ${className}`} {...props}>
          {/* Image Skeleton */}
          <div className="skeleton-image skeleton-loading"></div>

          {/* Content Skeleton */}
          <div className="skeleton-content">
            {/* Rating Skeleton */}
            <div className="skeleton-rating">
              <div className="skeleton-stars skeleton-loading"></div>
              <div className="skeleton-reviews skeleton-loading"></div>
            </div>

            {/* Title Skeleton */}
            <div className="skeleton-title skeleton-loading"></div>

            {/* Destination Skeleton */}
            <div className="skeleton-text skeleton-loading" style={{ width: '60%' }}></div>

            {/* Duration & Price Skeleton */}
            <div className="skeleton-footer">
              <div className="skeleton-text skeleton-loading" style={{ width: '40%' }}></div>
              <div className="skeleton-price skeleton-loading"></div>
            </div>

            {/* Button Skeleton */}
            <div className="skeleton-button skeleton-loading"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PackageCardSkeleton;

/**
 * Usage:
 * <PackageCardSkeleton count={6} />
 */
