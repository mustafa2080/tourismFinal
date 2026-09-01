import { useState, useCallback } from 'react';
import { bookingsService } from '../services';
import { canBookTrip, formatDate, calculateTotalPrice } from '../utils';
import { dateUtils } from '../utils';

/**
 * Custom hook for managing booking form and validation
 * CRITICAL: Enforces 15-day booking rule
 */
export const useBooking = (packageData = null) => {
  const [step, setStep] = useState(1); // Step 1, 2, or 3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+20',
    numberOfPersons: 1,
    travelDate: '',
    roomType: 'double',
    addOns: [],
    specialRequests: '',
    
    // Step 2
    agreeToTerms: false,
    paymentMethod: 'on-arrival'
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Price calculation
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    roomPrice: 0,
    addOnsPrice: 0,
    total: 0
  });

  /**
   * 🔴 CRITICAL: Validate travel date (15-day rule)
   */
  const validateTravelDate = useCallback((date) => {
    if (!date) {
      return { isValid: false, error: 'Travel date is required' };
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysUntilTrip = Math.floor(
      (selectedDate - today) / (1000 * 60 * 60 * 24)
    );

    // Check if date is in the past
    if (daysUntilTrip < 0) {
      return { 
        isValid: false, 
        error: 'Travel date cannot be in the past',
        daysUntilTrip 
      };
    }

    // 🔴 CHECK 15-DAY RULE
    if (daysUntilTrip < 15) {
      return {
        isValid: false,
        error: `Booking must be at least 15 days in advance. You have only ${daysUntilTrip} days.`,
        daysUntilTrip
      };
    }

    return { isValid: true, daysUntilTrip };
  }, []);

  /**
   * Validate email format
   */
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  /**
   * Validate phone format
   */
  const validatePhone = useCallback((phone) => {
    // Basic validation - at least 7 digits
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 7;
  }, []);

  /**
   * Validate step 1 form
   */
  const validateStep1 = useCallback(() => {
    const newErrors = {};

    // Full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    // Number of persons
    if (formData.numberOfPersons < 1) {
      newErrors.numberOfPersons = 'At least 1 person is required';
    } else if (formData.numberOfPersons > 20) {
      newErrors.numberOfPersons = 'Maximum 20 persons allowed';
    }

    // Travel date 🔴 CRITICAL 15-DAY VALIDATION
    const dateValidation = validateTravelDate(formData.travelDate);
    if (!dateValidation.isValid) {
      newErrors.travelDate = dateValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail, validatePhone, validateTravelDate]);

  /**
   * Validate step 2 form
   */
  const validateStep2 = useCallback(() => {
    const newErrors = {};

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to terms & conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.agreeToTerms]);

  /**
   * Update form field
   */
  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    // Recalculate price if relevant field changed
    if (['numberOfPersons', 'roomType', 'addOns'].includes(fieldName)) {
      recalculatePrice();
    }
  }, []);

  /**
   * Recalculate total price
   */
  const recalculatePrice = useCallback(() => {
    if (!packageData) return;

    const roomPrices = { single: 0.8, double: 1, triple: 1.2 };
    const basePersonPrice = packageData.basePrice;
    
    const personCount = formData.numberOfPersons || 1;
    const roomMultiplier = roomPrices[formData.roomType] || 1;
    
    let addOnsPrice = 0;
    if (formData.addOns.length > 0 && packageData.addOns) {
      addOnsPrice = formData.addOns.reduce((sum, addOnId) => {
        const addOn = packageData.addOns.find(a => a.id === addOnId);
        return sum + (addOn?.price || 0);
      }, 0);
    }

    const roomPrice = basePersonPrice * roomMultiplier;
    const basePrice = basePersonPrice * personCount;
    const total = (roomPrice * personCount) + addOnsPrice;

    setPriceBreakdown({
      basePrice,
      roomPrice: roomPrice * personCount,
      addOnsPrice,
      total
    });
  }, [packageData, formData.numberOfPersons, formData.roomType, formData.addOns]);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        recalculatePrice();
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  }, [step, validateStep1, validateStep2, recalculatePrice]);

  /**
   * Go to previous step
   */
  const prevStep = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  }, [step]);

  /**
   * Submit booking
   */
  const submitBooking = useCallback(async () => {
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const bookingData = {
        packageId: packageData.id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `${formData.countryCode}${formData.phone.trim()}`,
        numberOfPersons: formData.numberOfPersons,
        travelDate: formData.travelDate,
        roomType: formData.roomType,
        addOns: formData.addOns,
        specialRequests: formData.specialRequests.trim(),
        totalPrice: priceBreakdown.total,
        paymentMethod: formData.paymentMethod,
        priceBreakdown
      };

      const response = await bookingsService.createBooking(bookingData);
      
      setBookingId(response.bookingNumber || response.id);
      setSuccess(true);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, packageData, validateStep2, priceBreakdown]);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      countryCode: '+20',
      numberOfPersons: 1,
      travelDate: '',
      roomType: 'double',
      addOns: [],
      specialRequests: '',
      agreeToTerms: false,
      paymentMethod: 'on-arrival'
    });
    setErrors({});
    setStep(1);
    setError(null);
    setSuccess(false);
    setBookingId(null);
  }, []);

  return {
    // State
    step,
    formData,
    errors,
    loading,
    error,
    success,
    bookingId,
    priceBreakdown,

    // Methods
    updateField,
    nextStep,
    prevStep,
    submitBooking,
    resetForm,
    validateStep1,
    validateStep2,
    validateTravelDate,
    recalculatePrice,

    // Utility
    canProceedToStep2: !loading && Object.keys(errors).length === 0 && formData.travelDate,
    canProceedToStep3: !loading && Object.keys(errors).length === 0 && formData.agreeToTerms,
    isStep1: step === 1,
    isStep2: step === 2,
    isStep3: step === 3
  };
};
