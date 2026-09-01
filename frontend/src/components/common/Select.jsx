import React, { useState } from 'react';

/**
 * Reusable Select Component
 * Supports single and multi-select
 */
const Select = React.forwardRef(({
  name,
  value,
  onChange,
  onBlur,
  options = [],
  label,
  placeholder = 'Select...',
  error,
  disabled = false,
  required = false,
  multiple = false,
  clearable = false,
  searchable = false,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Get display value
   */
  const getDisplayValue = () => {
    if (!value) return placeholder;

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      const labels = options
        .filter(opt => value.includes(opt.value))
        .map(opt => opt.label);
      return `${labels.join(', ')} (${value.length})`;
    }

    if (!multiple) {
      const selected = options.find(opt => opt.value === value);
      return selected ? selected.label : placeholder;
    }

    return placeholder;
  };

  /**
   * Handle option select
   */
  const handleSelect = (optionValue) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? value : [];
      if (newValue.includes(optionValue)) {
        onChange({
          target: { name, value: newValue.filter(v => v !== optionValue) }
        });
      } else {
        onChange({
          target: { name, value: [...newValue, optionValue] }
        });
      }
    } else {
      onChange({ target: { name, value: optionValue } });
      setIsOpen(false);
    }
  };

  /**
   * Filter options
   */
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  /**
   * Check if option is selected
   */
  const isSelected = (optionValue) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const baseClass = 'select';
  const errorClass = error ? 'select-error' : '';
  const disabledClass = disabled ? 'select-disabled' : '';
  const classes = [baseClass, errorClass, disabledClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="select-wrapper">
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}

      <div className={classes} ref={ref}>
        <div
          className="select-input"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onBlur={() => setIsOpen(false)}
        >
          <span className="select-value">{getDisplayValue()}</span>
          <div className="select-icons">
            {clearable && value && (
              <button
                type="button"
                className="select-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ target: { name, value: multiple ? [] : '' } });
                }}
              >
                ✕
              </button>
            )}
            <span className={`select-arrow ${isOpen ? 'open' : ''}`}>▼</span>
          </div>
        </div>

        {isOpen && (
          <div className="select-dropdown">
            {searchable && (
              <input
                type="text"
                className="select-search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div className="select-options">
              {filteredOptions.length === 0 ? (
                <div className="select-no-options">No options</div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    className={`select-option ${isSelected(option.value) ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected(option.value)}
                        readOnly
                        className="select-checkbox"
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span className="select-error-message">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

/**
 * Usage Examples:
 * 
 * Single Select:
 * <Select
 *   name="category"
 *   options={[
 *     { value: 'beach', label: 'Beach' },
 *     { value: 'mountain', label: 'Mountain' }
 *   ]}
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 *   label="Trip Type"
 * />
 * 
 * Multi Select:
 * <Select
 *   name="activities"
 *   multiple
 *   searchable
 *   options={activityOptions}
 *   value={activities}
 *   onChange={(e) => setActivities(e.target.value)}
 *   label="Activities"
 * />
 */
