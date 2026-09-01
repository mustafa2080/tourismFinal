import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook for real-time form validation
 * Handles validation rules, error states, and touched fields
 */
export const useFormValidation = (initialFormData, validationRules) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [validFields, setValidFields] = useState({});

  // Real-time validation effect
  useEffect(() => {
    const newErrors = {};
    const newValidFields = {};

    Object.keys(validationRules).forEach((field) => {
      const error = validationRules[field].validate(formData[field], formData);
      if (touchedFields[field]) {
        newErrors[field] = error;
      }
      newValidFields[field] = !error && formData[field];
    });

    setErrors(newErrors);
    setValidFields(newValidFields);
  }, [formData, touchedFields, validationRules]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFieldBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
  };

  const handleFieldFocus = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
  };

  const isFormValid = useMemo(() => {
    return (
      Object.keys(validationRules).every((field) => validFields[field]) &&
      formData.agreeToTerms !== false
    );
  }, [validFields, formData]);

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouchedFields({});
    setValidFields({});
  };

  return {
    formData,
    setFormData,
    errors,
    touchedFields,
    validFields,
    handleChange,
    handleFieldBlur,
    handleFieldFocus,
    isFormValid,
    resetForm,
  };
};

/**
 * Validation rules for signup form
 */
export const signupValidationRules = {
  name: {
    validate: (val) => {
      if (!val?.trim()) return 'Full name is required';
      if (val.trim().length < 2) return 'Name must be at least 2 characters';
      if (!/^[a-zA-Z\s]+$/.test(val.trim())) return 'Name can only contain letters and spaces';
      return '';
    },
  },
  email: {
    validate: (val) => {
      if (!val?.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Invalid email format';
      return '';
    },
  },
  phone: {
    validate: (val) => {
      if (!val?.trim()) return 'Phone number is required';
      const digitsOnly = val.replace(/\D/g, '');
      if (digitsOnly.length < 10) return 'Phone must have at least 10 digits';
      return '';
    },
  },
  password: {
    validate: (val) => {
      if (!val) return 'Password is required';
      if (val.length < 8) return 'Password must be at least 8 characters';
      return '';
    },
  },
  confirmPassword: {
    validate: (val, formData) => {
      if (!val) return 'Please confirm your password';
      if (val !== formData.password) return 'Passwords do not match';
      return '';
    },
  },
};

/**
 * Check password strength
 */
export const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: 'bg-slate-300' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const strength =
    score < 2
      ? { label: 'Weak', color: 'bg-red-500' }
      : score < 3
        ? { label: 'Fair', color: 'bg-orange-500' }
        : score < 4
          ? { label: 'Good', color: 'bg-yellow-500' }
          : score <= 5
            ? { label: 'Strong', color: 'bg-green-500' }
            : { label: 'Very Strong', color: 'bg-blue-500' };

  return {
    score: Math.min(score, 6),
    label: strength.label,
    color: strength.color,
  };
};
