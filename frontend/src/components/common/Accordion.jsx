import React, { useState } from 'react';

/**
 * Reusable Accordion Component
 * Expandable/collapsible sections
 */
const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpen = [],
  onChange,
  className = '',
  ...props
}) => {
  const [openItems, setOpenItems] = useState(defaultOpen);

  /**
   * Handle item toggle
   */
  const handleToggle = (index) => {
    let newOpenItems;

    if (allowMultiple) {
      newOpenItems = openItems.includes(index)
        ? openItems.filter(i => i !== index)
        : [...openItems, index];
    } else {
      newOpenItems = openItems.includes(index) ? [] : [index];
    }

    setOpenItems(newOpenItems);
    if (onChange) {
      onChange(newOpenItems);
    }
  };

  const classes = [className].filter(Boolean).join(' ');

  return (
    <div className={`accordion ${classes}`} {...props}>
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <button
            className={`accordion-header ${openItems.includes(index) ? 'open' : ''}`}
            onClick={() => handleToggle(index)}
            aria-expanded={openItems.includes(index)}
            aria-controls={`accordion-panel-${index}`}
          >
            <span className="accordion-icon">
              {openItems.includes(index) ? '▼' : '▶'}
            </span>
            <span className="accordion-title">{item.title}</span>
            {item.subtitle && (
              <span className="accordion-subtitle">{item.subtitle}</span>
            )}
          </button>

          {openItems.includes(index) && (
            <div
              id={`accordion-panel-${index}`}
              className="accordion-content"
            >
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;

/**
 * Usage Examples:
 * 
 * <Accordion
 *   items={[
 *     {
 *       title: 'Day 1: Cairo',
 *       subtitle: 'Pyramids & Museum',
 *       content: <DayOneContent />
 *     },
 *     {
 *       title: 'Day 2: Giza',
 *       subtitle: 'Sphinx & Temples',
 *       content: <DayTwoContent />
 *     },
 *     {
 *       title: 'Day 3: Luxor',
 *       subtitle: 'Valley of Kings',
 *       content: <DayThreeContent />
 *     }
 *   ]}
 *   allowMultiple
 * />
 * 
 * <Accordion
 *   items={faqs}
 *   defaultOpen={[0]}
 *   onChange={(openItems) => console.log('Open items:', openItems)}
 * />
 */
