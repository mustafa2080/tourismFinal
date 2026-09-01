import React, { useState, useEffect } from 'react';

/**
 * Reusable DatePicker Component
 * Includes 15-day minimum validation for booking dates
 */
const DatePicker = React.forwardRef(({
  name,
  value,
  onChange,
  onBlur,
  label,
  placeholder = 'Select date...',
  error,
  disabled = false,
  required = false,
  minDaysInAdvance = null,
  maxDate = null,
  className = '',
  showTime = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inputValue, setInputValue] = useState('');

  /**
   * Update input value when value prop changes
   */
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setInputValue(formatDate(date));
    } else {
      setInputValue('');
    }
  }, [value]);

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Get minimum allowed date (today + minDaysInAdvance)
   */
  const getMinDate = () => {
    const today = new Date();
    const min = new Date(today);
    
    if (minDaysInAdvance) {
      min.setDate(min.getDate() + minDaysInAdvance);
    }
    
    return min;
  };

  /**
   * Check if date is valid
   */
  const isValidDate = (date) => {
    if (!date) return false;

    const minDate = getMinDate();
    if (date < minDate) return false;

    if (maxDate) {
      const max = new Date(maxDate);
      if (date > max) return false;
    }

    return true;
  };

  /**
   * Handle date selection from calendar
   */
  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!isValidDate(newDate)) {
      return;
    }

    const formattedDate = formatDate(newDate);
    setInputValue(formattedDate);
    onChange({ target: { name, value: formattedDate } });
    setIsOpen(false);
  };

  /**
   * Handle manual input
   */
  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    if (inputVal.length === 10) {
      const parts = inputVal.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        const date = new Date(year, month - 1, day);
        
        if (isValidDate(date)) {
          onChange({ target: { name, value: inputVal } });
        }
      }
    }
  };

  /**
   * Get days in month
   */
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * Get first day of month (0 = Sunday)
   */
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  /**
   * Render calendar
   */
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const minDate = getMinDate();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isValid = isValidDate(date);
      const isToday = 
        date.toDateString() === new Date().toDateString();
      const isSelected = 
        value && date.toDateString() === new Date(value).toDateString();

      days.push(
        <button
          key={day}
          type="button"
          className={`calendar-day ${isValid ? '' : 'disabled'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          disabled={!isValid}
          onClick={() => isValid && handleDateSelect(day)}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const baseClass = 'datepicker';
  const errorClass = error ? 'datepicker-error' : '';
  const disabledClass = disabled ? 'datepicker-disabled' : '';
  const classes = [baseClass, errorClass, disabledClass, className]
    .filter(Boolean)
    .join(' ');

  const monthYear = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="datepicker-wrapper">
      {label && (
        <label className="datepicker-label">
          {label}
          {required && <span className="datepicker-required">*</span>}
          {minDaysInAdvance && (
            <span className="datepicker-hint">
              {' '}(min. {minDaysInAdvance} days in advance)
            </span>
          )}
        </label>
      )}

      <div className={classes}>
        <input
          ref={ref}
          type="text"
          name={name}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={onBlur}
          disabled={disabled}
          readOnly
          className="datepicker-input"
        />

        {isOpen && !disabled && (
          <div className="datepicker-popup">
            <div className="calendar-header">
              <button
                type="button"
                onClick={() => setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                )}
              >
                ◀
              </button>
              <span className="calendar-month">{monthYear}</span>
              <button
                type="button"
                onClick={() => setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                )}
              >
                ▶
              </button>
            </div>

            <div className="calendar-weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="calendar-days">
              {renderCalendar()}
            </div>
          </div>
        )}
      </div>

      {error && <span className="datepicker-error-message">{error}</span>}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;

/**
 * Usage Examples:
 * 
 * <DatePicker
 *   label="Travel Date"
 *   value={travelDate}
 *   onChange={(e) => setTravelDate(e.target.value)}
 *   minDaysInAdvance={15}
 *   required
 *   error={dateError}
 * />
 */
