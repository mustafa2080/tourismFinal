import React, { useState } from 'react';

/**
 * Reusable Rating Component
 * Star rating display/input
 */
const Rating = React.forwardRef(({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showText = true,
  showCount = false,
  count = 0,
  className = '',
  ...props
}, ref) => {
  const [hoverValue, setHoverValue] = useState(0);

  /**
   * Handle star click
   */
  const handleStarClick = (starValue) => {
    if (!readonly && onChange) {
      onChange(starValue);
    }
  };

  /**
   * Handle star hover
   */
  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoverValue(starValue);
    }
  };

  /**
   * Get text for rating
   */
  const getRatingText = () => {
    const texts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[value] || '';
  };

  const sizeClass = `rating-${size}`;
  const readonlyClass = readonly ? 'rating-readonly' : '';
  const classes = [sizeClass, readonlyClass, className]
    .filter(Boolean)
    .join(' ');

  const displayValue = hoverValue || value;

  return (
    <div ref={ref} className={`rating ${classes}`} {...props}>
      <div className="rating-stars">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayValue;

          return (
            <button
              key={index}
              type="button"
              className={`rating-star ${isFilled ? 'filled' : ''}`}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              onMouseLeave={() => setHoverValue(0)}
              disabled={readonly}
              aria-label={`${starValue} stars`}
            >
              ★
            </button>
          );
        })}
      </div>

      <div className="rating-info">
        {showText && (
          <span className="rating-text">{getRatingText()}</span>
        )}
        {showCount && (
          <span className="rating-count">
            {value} / {max}
            {count > 0 && ` (${count} reviews)`}
          </span>
        )}
      </div>
    </div>
  );
});

Rating.displayName = 'Rating';

export default Rating;

/**
 * Rating Sizes:
 * - sm: Small stars
 * - md: Medium stars (default)
 * - lg: Large stars
 * - xl: Extra large stars
 */

/**
 * Usage Examples:
 * 
 * <Rating
 *   value={rating}
 *   onChange={setRating}
 *   showText
 * />
 * 
 * <Rating
 *   value={avgRating}
 *   readonly
 *   showCount
 *   count={totalReviews}
 * />
 */
