import React from 'react';

/**
 * Reusable Breadcrumbs Component
 * Navigation breadcrumbs trail
 */
const Breadcrumbs = ({
  items = [],
  separator = '/',
  className = '',
  onNavigate,
  ...props
}) => {
  /**
   * Handle item click
   */
  const handleItemClick = (item, index) => {
    if (onNavigate && !item.disabled) {
      onNavigate(item, index);
    }
  };

  const classes = [className].filter(Boolean).join(' ');

  return (
    <nav
      className={`breadcrumbs ${classes}`}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="breadcrumbs-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumbs-item">
            {item.href || item.onClick ? (
              <button
                className={`breadcrumbs-link ${
                  item.active ? 'active' : ''
                } ${item.disabled ? 'disabled' : ''}`}
                onClick={() => handleItemClick(item, index)}
                disabled={item.disabled}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.icon && (
                  <span className="breadcrumbs-icon">{item.icon}</span>
                )}
                {item.label}
              </button>
            ) : (
              <span
                className={`breadcrumbs-text ${
                  item.active ? 'active' : ''
                }`}
              >
                {item.icon && (
                  <span className="breadcrumbs-icon">{item.icon}</span>
                )}
                {item.label}
              </span>
            )}

            {index < items.length - 1 && (
              <span className="breadcrumbs-separator">{separator}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

/**
 * Usage Examples:
 * 
 * <Breadcrumbs
 *   items={[
 *     { label: 'Home', icon: '🏠' },
 *     { label: 'Search', icon: '🔍' },
 *     { label: 'Egypt Packages', active: true }
 *   ]}
 *   onNavigate={(item, index) => navigate(item.href)}
 * />
 * 
 * <Breadcrumbs
 *   items={[
 *     { label: 'Packages', href: '/packages' },
 *     { label: 'Egypt', href: '/packages/egypt' },
 *     { label: '7 Days Cairo', active: true }
 *   ]}
 *   separator="›"
 * />
 */
