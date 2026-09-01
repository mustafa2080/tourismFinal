import React from 'react';

/**
 * Reusable Input Component
 * Supports text, email, password, tel, etc.
 */
const Input = React.forwardRef(({
  type = 'text',
  name,
  value,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  onChange,
  onBlur,
  onFocus,
  className = '',
  maxLength,
  minLength,
  pattern,
  autoComplete,
  ...props
}, ref) => {
  const baseClass = 'input';
  const errorClass = error ? 'input-error' : '';
  const disabledClass = disabled ? 'input-disabled' : '';
  const classes = [baseClass, errorClass, disabledClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={classes}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        autoComplete={autoComplete}
        {...props}
      />

      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

/**
 * Input Types:
 * - text: Regular text
 * - email: Email validation
 * - password: Masked input
 * - tel: Phone number
 * - number: Numbers only
 * - date: Date picker
 * - url: URL validation
 * - search: Search field
 */

/**
 * Usage Examples:
 * 
 * <Input
 *   type="email"
 *   label="Email"
 *   placeholder="your@email.com"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={emailError}
 * />
 * 
 * <Input
 *   type="password"
 *   label="Password"
 *   required
 *   error={passwordError}
 * />
 * 
 * <Input
 *   type="tel"
 *   label="Phone"
 *   pattern="[0-9]{10}"
 * />
 */
