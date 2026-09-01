import React from 'react';

/**
 * Reusable Badge Component
 * Small status indicators
 */
const Badge = React.forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
  ...props
}, ref) => {
  const baseClass = 'badge';
  const variantClass = `badge-${variant}`;
  const sizeClass = `badge-${size}`;
  const dotClass = dot ? 'badge-dot' : '';
  const removableClass = removable ? 'badge-removable' : '';

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    dotClass,
    removableClass,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      ref={ref}
      className={classes}
      {...props}
    >
      {dot && <span className="badge-dot-circle"></span>}
      {children}
      {removable && (
        <button
          type="button"
          className="badge-remove"
          onClick={onRemove}
          aria-label="Remove"
        >
          ✕
        </button>
      )}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;

/**
 * Badge Variants:
 * - default: Gray
 * - primary: Blue
 * - success: Green
 * - warning: Yellow
 * - danger: Red
 * - info: Cyan
 */

/**
 * Badge Sizes:
 * - sm: Small
 * - md: Medium (default)
 * - lg: Large
 */

/**
 * Usage Examples:
 * 
 * <Badge variant="success">Active</Badge>
 * <Badge variant="danger">Cancelled</Badge>
 * <Badge dot variant="primary">Online</Badge>
 * <Badge removable onRemove={handleRemove}>Tag</Badge>
 */
