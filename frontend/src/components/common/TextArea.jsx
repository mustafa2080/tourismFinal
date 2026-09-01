import React from 'react';

/**
 * Reusable TextArea Component
 * Multi-line text input with character count
 */
const TextArea = React.forwardRef(({
  name,
  value,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  rows = 4,
  minLength,
  maxLength,
  onChange,
  onBlur,
  onFocus,
  className = '',
  showCharCount = false,
  resizable = true,
  ...props
}, ref) => {
  const baseClass = 'textarea';
  const errorClass = error ? 'textarea-error' : '';
  const disabledClass = disabled ? 'textarea-disabled' : '';
  const resizeClass = resizable ? 'textarea-resizable' : 'textarea-no-resize';
  const classes = [baseClass, errorClass, disabledClass, resizeClass, className]
    .filter(Boolean)
    .join(' ');

  const charCount = value ? value.length : 0;
  const charCountDisplay = maxLength ? `${charCount}/${maxLength}` : `${charCount}`;
  const charCountClass = maxLength && charCount > maxLength * 0.9 ? 'char-count-warning' : '';

  return (
    <div className="textarea-wrapper">
      {label && (
        <label className="textarea-label">
          {label}
          {required && <span className="textarea-required">*</span>}
        </label>
      )}

      <div className="textarea-container">
        <textarea
          ref={ref}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          minLength={minLength}
          maxLength={maxLength}
          className={classes}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          {...props}
        />

        {showCharCount && (
          <div className={`char-count ${charCountClass}`}>
            {charCountDisplay}
          </div>
        )}
      </div>

      {error && <span className="textarea-error-message">{error}</span>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;

/**
 * Usage Examples:
 * 
 * <TextArea
 *   label="Comments"
 *   placeholder="Enter your comments..."
 *   value={comments}
 *   onChange={(e) => setComments(e.target.value)}
 *   rows={5}
 *   maxLength={500}
 *   showCharCount
 * />
 * 
 * <TextArea
 *   label="Special Requests"
 *   minLength={10}
 *   maxLength={200}
 *   error={requestError}
 * />
 */
