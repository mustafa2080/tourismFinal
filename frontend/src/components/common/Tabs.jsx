import React, { useState } from 'react';

/**
 * Reusable Tabs Component
 */
const Tabs = ({
  tabs = [],
  defaultTab = 0,
  onChange,
  className = '',
  variant = 'default',
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  /**
   * Handle tab change
   */
  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index, tabs[index]);
    }
  };

  const variantClass = `tabs-${variant}`;
  const classes = [variantClass, className].filter(Boolean).join(' ');

  return (
    <div className={`tabs ${classes}`} {...props}>
      {/* Tab List */}
      <div className="tabs-list" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tabs-tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabChange(index)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tab-panel-${index}`}
          >
            {tab.icon && <span className="tabs-icon">{tab.icon}</span>}
            <span className="tabs-label">{tab.label}</span>
            {tab.badge && (
              <span className="tabs-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tabs-content">
        {tabs.map((tab, index) => (
          <div
            key={index}
            id={`tab-panel-${index}`}
            className={`tabs-panel ${activeTab === index ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby={`tab-${index}`}
          >
            {activeTab === index && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;

/**
 * Tab Variants:
 * - default: Standard tabs
 * - pills: Pill-shaped tabs
 * - underline: Underline style
 * - vertical: Vertical tabs
 */

/**
 * Usage Examples:
 * 
 * <Tabs
 *   tabs={[
 *     {
 *       label: 'Details',
 *       content: <PackageDetails />,
 *       icon: 'ℹ️'
 *     },
 *     {
 *       label: 'Reviews',
 *       content: <Reviews />,
 *       badge: '12'
 *     },
 *     {
 *       label: 'Photos',
 *       content: <Photos />
 *     }
 *   ]}
 *   onChange={(index, tab) => console.log('Active tab:', index)}
 * />
 */
