/**
 * 🔐 useInputValidation Hook
 * Provides input validation and sanitization for forms
 * Prevents XSS, SQL injection patterns, and validates field types
 */

import { sanitizeInput, sanitizeEmail, sanitizeText, detectXSSPatterns } from '../utils/sanitizer.js';

/**
 * Validation rules for common field types
 */
const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 5,
    maxLength: 254,
    message: 'Please enter a valid email address',
    sanitizer: sanitizeEmail,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    requiresSpecialChar: true,
    requiresNumber: true,
    requiresUppercase: true,
    requiresLowercase: true,
  },
  phone: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    minLength: 7,
    maxLength: 20,
    message: 'Please enter a valid phone number',
    sanitizer: sanitizeInput,
  },
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\u0600-\u06FF]+$/,
    message: 'Name can only contain letters and spaces',
    sanitizer: sanitizeInput,
  },
  url: {
    minLength: 5,
    maxLength: 2048,
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL',
    sanitizer: sanitizeInput,
  },
  text: {
    maxLength: 5000,
    message: 'Text is too long',
    sanitizer: sanitizeText,
  },
  number: {
    pattern: /^\d+$/,
    message: 'Please enter a valid number',
    sanitizer: (val) => val.replace(/[^\d]/g, ''),
  },
};

/**
 * 🔐 Field Validator Class
 */
export class FieldValidator {
  constructor(fieldName, ruleType = 'text', customRules = {}) {
    this.fieldName = fieldName;
    this.ruleType = ruleType;
    this.rules = { ...VALIDATION_RULES[ruleType], ...customRules };
    this.errors = [];
  }

  /**
   * Validate a value against all rules
   */
  validate(value) {
    this.errors = [];

    // Check for null/undefined
    if (value === null || value === undefined) {
      if (this.rules.required !== false) {
        this.errors.push(`${this.fieldName} is required`);
      }
      return this.errors.length === 0;
    }

    // Convert to string
    const stringValue = String(value).trim();

    // Check XSS patterns
    if (detectXSSPatterns(stringValue)) {
      this.errors.push(`${this.fieldName} contains potentially malicious content`);
      return false;
    }

    // Check length
    if (this.rules.minLength && stringValue.length < this.rules.minLength) {
      this.errors.push(`${this.fieldName} must be at least ${this.rules.minLength} characters`);
    }

    if (this.rules.maxLength && stringValue.length > this.rules.maxLength) {
      this.errors.push(`${this.fieldName} must not exceed ${this.rules.maxLength} characters`);
    }

    // Check pattern
    if (this.rules.pattern && !this.rules.pattern.test(stringValue)) {
      this.errors.push(this.rules.message || `${this.fieldName} is invalid`);
    }

    // Check password requirements
    if (this.ruleType === 'password') {
      if (this.rules.requiresUppercase && !/[A-Z]/.test(stringValue)) {
        this.errors.push('Password must contain at least one uppercase letter');
      }
      if (this.rules.requiresLowercase && !/[a-z]/.test(stringValue)) {
        this.errors.push('Password must contain at least one lowercase letter');
      }
      if (this.rules.requiresNumber && !/\d/.test(stringValue)) {
        this.errors.push('Password must contain at least one number');
      }
      if (this.rules.requiresSpecialChar && !/[@$!%*?&]/.test(stringValue)) {
        this.errors.push('Password must contain at least one special character (@$!%*?&)');
      }
    }

    return this.errors.length === 0;
  }

  /**
   * Sanitize a value based on rules
   */
  sanitize(value) {
    if (value === null || value === undefined) {
      return '';
    }

    const sanitizer = this.rules.sanitizer || sanitizeInput;
    return sanitizer(value);
  }

  /**
   * Get validation errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get first error message
   */
  getFirstError() {
    return this.errors[0] || null;
  }

  /**
   * Check if valid
   */
  isValid() {
    return this.errors.length === 0;
  }
}

/**
 * 🔐 useInputValidation Hook
 * React hook for input validation and sanitization
 */
export const useInputValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  /**
   * Validate a single field
   */
  const validateField = (name, value) => {
    const rules = validationRules[name] || {};
    const validator = new FieldValidator(
      name,
      rules.type || 'text',
      rules
    );

    const isValid = validator.validate(value);

    return {
      isValid,
      errors: validator.getErrors(),
    };
  };

  /**
   * Handle field change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    // Sanitize input
    const rules = validationRules[name] || {};
    const validator = new FieldValidator(name, rules.type || 'text');
    const sanitizedValue = validator.sanitize(inputValue);

    setValues((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Clear error if field was previously touched
    if (touched[name]) {
      const { isValid, errors: fieldErrors } = validateField(name, sanitizedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: isValid ? undefined : fieldErrors,
      }));
    }
  };

  /**
   * Handle field blur
   */
  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate on blur
    const { isValid, errors: fieldErrors } = validateField(name, values[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: isValid ? undefined : fieldErrors,
    }));
  };

  /**
   * Validate all fields
   */
  const validateAll = () => {
    const newErrors = {};
    let isFormValid = true;

    for (const [fieldName, value] of Object.entries(values)) {
      const { isValid, errors: fieldErrors } = validateField(fieldName, value);
      if (!isValid) {
        newErrors[fieldName] = fieldErrors;
        isFormValid = false;
      }
    }

    setErrors(newErrors);
    return isFormValid;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (onSubmit) => {
    return async (e) => {
      e.preventDefault();

      if (!validateAll()) {
        console.warn('❌ Form validation failed');
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error) {
        console.error('❌ Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  /**
   * Set field error manually
   */
  const setFieldError = (name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error ? [error] : undefined,
    }));
  };

  /**
   * Get field props for easy binding to inputs
   */
  const getFieldProps = (name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
  });

  /**
   * Get field error message
   */
  const getFieldError = (name) => {
    return errors[name]?.[0] || null;
  };

  /**
   * Check if field has error
   */
  const hasError = (name) => {
    return touched[name] && !!errors[name]?.length;
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldError,
    validateField,
    validateAll,
    getFieldProps,
    getFieldError,
    hasError,
    setValues,
  };
};

export default {
  FieldValidator,
  useInputValidation,
  VALIDATION_RULES,
};
