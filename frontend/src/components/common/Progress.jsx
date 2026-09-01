import React from 'react';

/**
 * Reusable Progress Component
 * Progress bar with percentage
 */
const Progress = ({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  variant = 'default',
  size = 'md',
  animated = false,
  striped = false,
  showLabel = true,
  className = '',
  ...props
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Determine variant based on percentage
  const getVariantFromValue = () => {
    if (percentage < 33) return 'danger';
    if (percentage < 66) return 'warning';
    return 'success';
  };

  const variantClass = `progress-${variant}`;
  const sizeClass = `progress-${size}`;
  const animatedClass = animated ? 'progress-animated' : '';
  const stripedClass = striped ? 'progress-striped' : '';
  const classes = [variantClass, sizeClass, animatedClass, stripedClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="progress-wrapper">
      {showLabel && (label || showPercent) && (
        <div className="progress-label">
          <span>{label || 'Progress'}</span>
          {showPercent && (
            <span className="progress-percent">{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      <div className={`progress ${classes}`} {...props}>
        <div
          className="progress-bar"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin="0"
          aria-valuemax={max}
          aria-label={label || 'Progress'}
        >
          {showPercent && (
            <span className="progress-text">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;

/**
 * Progress Variants:
 * - default: Gray
 * - primary: Blue
 * - success: Green
 * - warning: Yellow
 * - danger: Red
 * - auto: Changes based on value
 */

/**
 * Progress Sizes:
 * - sm: Small
 * - md: Medium (default)
 * - lg: Large
 * - xl: Extra large
 */

/**
 * Usage Examples:
 * 
 * <Progress value={65} />
 * 
 * <Progress
 *   value={uploadProgress}
 *   label="Uploading..."
 *   animated
 * />
 * 
 * <Progress
 *   value={downloadSpeed}
 *   max={100}
 *   variant="primary"
 *   striped
 *   animated
 * />
 */
