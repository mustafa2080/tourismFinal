import React from 'react';

/**
 * Reusable Card Component
 * Wrapper for content with optional header and footer
 */
const Card = React.forwardRef(({
  children,
  header,
  footer,
  title,
  subtitle,
  variant = 'default',
  shadow = 'md',
  padding = 'md',
  hoverable = false,
  onClick,
  className = '',
  ...props
}, ref) => {
  const baseClass = 'card';
  const variantClass = `card-${variant}`;
  const shadowClass = `card-shadow-${shadow}`;
  const paddingClass = `card-p-${padding}`;
  const hoverClass = hoverable ? 'card-hoverable' : '';
  const clickableClass = onClick ? 'card-clickable' : '';

  const classes = [
    baseClass,
    variantClass,
    shadowClass,
    paddingClass,
    hoverClass,
    clickableClass,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {(header || title) && (
        <div className="card-header">
          {header ? (
            header
          ) : (
            <>
              <h3 className="card-title">{title}</h3>
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </>
          )}
        </div>
      )}

      <div className="card-body">
        {children}
      </div>

      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;

/**
 * Card Variants:
 * - default: Plain white/light background
 * - elevated: Raised appearance
 * - outlined: Bordered style
 * - filled: Filled background
 * - primary: Primary color themed
 */

/**
 * Shadow Options:
 * - none: No shadow
 * - sm: Small shadow
 * - md: Medium shadow (default)
 * - lg: Large shadow
 * - xl: Extra large shadow
 */

/**
 * Padding Options:
 * - none: No padding
 * - sm: Small padding
 * - md: Medium padding (default)
 * - lg: Large padding
 * - xl: Extra large padding
 */

/**
 * Usage Examples:
 * 
 * <Card title="Package Details">
 *   <p>Package information here</p>
 * </Card>
 * 
 * <Card
 *   header={<h2>Trip Details</h2>}
 *   footer={<button>Book Now</button>}
 * >
 *   <img src={image} alt="trip" />
 *   <p>Description</p>
 * </Card>
 * 
 * <Card
 *   title="Package"
 *   subtitle="7 Days in Egypt"
 *   hoverable
 *   onClick={() => navigate(`/package/${id}`)}
 * >
 *   Content
 * </Card>
 */
