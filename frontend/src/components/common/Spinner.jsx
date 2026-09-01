import React from 'react';

/**
 * Reusable Spinner Component
 * Loading indicator
 */
const Spinner = ({
  size = 'md',
  variant = 'default',
  fullScreen = false,
  overlay = false,
  label,
  className = '',
  ...props
}) => {
  const baseClass = 'spinner';
  const sizeClass = `spinner-${size}`;
  const variantClass = `spinner-${variant}`;
  const fullScreenClass = fullScreen ? 'spinner-fullscreen' : '';
  const overlayClass = overlay ? 'spinner-overlay' : '';

  const classes = [
    baseClass,
    sizeClass,
    variantClass,
    fullScreenClass,
    overlayClass,
    className
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <div className={classes} {...props}>
      <div className="spinner-circle"></div>
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="spinner-container">
        {content}
      </div>
    );
  }

  return content;
};

export { Spinner };
export default Spinner;

/**
 * Spinner Variants:
 * - default: Standard spinner
 * - primary: Primary color
 * - secondary: Secondary color
 * - success: Green spinner
 */

/**
 * Spinner Sizes:
 * - sm: Small spinner
 * - md: Medium spinner (default)
 * - lg: Large spinner
 * - xl: Extra large spinner
 */

/**
 * Usage Examples:
 * 
 * <Spinner />
 * <Spinner size="lg" />
 * <Spinner fullScreen label="Loading..." />
 * <Spinner overlay variant="primary" />
 */
