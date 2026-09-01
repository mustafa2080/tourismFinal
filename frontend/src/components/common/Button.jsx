import React from 'react';

/**
 * Reusable Button Component
 * Supports multiple variants, sizes, and states
 */
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  title,
  ...props
}, ref) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full-width' : '';
  const loadingClass = loading ? 'btn-loading' : '';
  const disabledClass = disabled || loading ? 'btn-disabled' : '';

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    loadingClass,
    disabledClass,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={classes}
      onClick={onClick}
      title={title}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          <span className="ml-2">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

/**
 * Button Variants:
 * - primary: Main CTA (blue)
 * - secondary: Secondary action (gray)
 * - success: Success action (green)
 * - danger: Destructive action (red)
 * - warning: Warning action (yellow)
 * - ghost: Transparent button
 * - outline: Bordered button
 */

/**
 * Button Sizes:
 * - xs: Extra small (px-2 py-1, text-xs)
 * - sm: Small (px-3 py-2, text-sm)
 * - md: Medium (px-4 py-2, text-base) - default
 * - lg: Large (px-6 py-3, text-lg)
 * - xl: Extra large (px-8 py-4, text-xl)
 */

/**
 * Usage Examples:
 * 
 * <Button>Click me</Button>
 * <Button variant="success" size="lg">Success</Button>
 * <Button variant="danger" onClick={handleDelete}>Delete</Button>
 * <Button loading={isLoading}>Saving...</Button>
 * <Button fullWidth disabled>Disabled</Button>
 * <Button variant="outline">Outline Button</Button>
 */
