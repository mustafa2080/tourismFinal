import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { packagesService, bookingsService } from '../services';
import { formatCurrency, formatPrice } from '../utils/formatters';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AddonsSelector from '../components/AddonsSelector';
import '../styles/pages/booking-page.css';

/**
 * BookingPage Component - Professional Booking System
 * Features:
 * - 4-step booking process
 * - Real-time price calculation
 * - 15-day booking rule validation
 * - Extras selection
 * - Payment method selection
 * - Full form validation
 * 
 * 💳 PAYMENT METHOD VISIBILITY:
 * - For bookings $1-$100: All payment methods are shown (Pay on Arrival + 50% Deposit + Full Payment)
 * - For bookings >$100: Only card payments are shown (50% Deposit + Full Payment) - Pay on Arrival hidden
 */
const BookingPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get package data passed from detail page (optional)
  const passedPackageData = location.state?.packageData;

  // Package and booking states
  const [packageData, setPackageData] = useState(null);
  const [packageLoading, setPackageLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Currency display toggle (USD is the real stored currency; EGP is a display-only conversion)
  const USD_TO_EGP_RATE = 50;
  const [displayCurrencyCode, setDisplayCurrencyCode] = useState('USD');
  const displayCurrency = (amountInUsd) => {
    const num = parseFloat(amountInUsd) || 0;
    if (displayCurrencyCode === 'EGP') {
      return formatPrice(num * USD_TO_EGP_RATE, 'EGP');
    }
    return formatPrice(num, 'USD');
  };

  // Form data
  const [formData, setFormData] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    tripStartDate: '',
    notes: '',
    addons: [],
    paymentType: 'on_arrival',
  });

  // Per-traveler details (name, nationality, passport, DOB) - one entry per person
  const [travelers, setTravelers] = useState([]);
  const [travelerErrors, setTravelerErrors] = useState({});
  const [expandedTraveler, setExpandedTraveler] = useState(0);

  // Calculated data
  const [priceCalculation, setPriceCalculation] = useState({
    basePrice: 0,
    baseSubtotal: 0,
    infantSubtotal: 0,
    extrasSubtotal: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  // UI states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [addonLoading, setAddonLoading] = useState(false);

  // Load package on mount
  useEffect(() => {
    // If package data was passed from detail page, use it directly
    if (passedPackageData) {
      setPackageData(passedPackageData);
      setPackageLoading(false);
    } else {
      // Otherwise, fetch from API
      loadPackage();
    }
  }, [packageId, passedPackageData]);

  // Recalculate price whenever package or persons change
  useEffect(() => {
    if (packageData && packageData.id) {
      console.log('🔄 Triggering price calculation...');
      calculatePrice();
    }
  }, [packageData?.id, formData.adults, formData.children, formData.infants, selectedAddons]);

  // Keep the travelers array in sync with the adults/children/infants counts.
  // Preserves already-entered data when counts change; adds/removes rows as needed.
  useEffect(() => {
    setTravelers(prev => {
      const buildRows = (type, count) => {
        const existing = prev.filter(t => t.travelerType === type);
        const rows = [];
        for (let i = 0; i < count; i++) {
          rows.push(existing[i] || {
            travelerType: type,
            fullName: '',
            nationality: '',
            passportNumber: '',
            dateOfBirth: '',
          });
        }
        return rows;
      };

      return [
        ...buildRows('adult', formData.adults),
        ...buildRows('child', formData.children),
        ...buildRows('infant', formData.infants),
      ];
    });
  }, [formData.adults, formData.children, formData.infants]);

  // Auto-adjust payment method based on total price
  useEffect(() => {
    // If price is > $100 and user selected on_arrival, change to deposit (first available card option)
    if (priceCalculation.total > 100) {
      if (formData.paymentType === 'on_arrival') {
        console.log('💳 Price > $100, changing payment method to deposit (card only)');
        setFormData(prev => ({ ...prev, paymentType: 'deposit' }));
      }
    }
  }, [priceCalculation.total]);

  /**
   * Load package details from API
   */
  const loadPackage = async () => {
    try {
      setPackageLoading(true);
      const response = await packagesService.getPackageById(packageId);
      
      // Extract actual package data from response
      const data = response.data || response;
      
      console.log('✅ Package loaded:', {
        id: data.id,
        name: data.title || data.name,
        basePrice: data.base_price || data.basePrice || data.price,
        extras: data.extras?.length || 0,
        fullData: data
      });
      
      setPackageData(data);
    } catch (err) {
      console.error('Failed to load package:', err);
      setBookingError('Failed to load package details. Please try again.');
    } finally {
      setPackageLoading(false);
    }
  };

  /**
   * Calculate total price based on selected options
   */
  const calculatePrice = async () => {
    if (!packageData || !packageData.id) {
      console.log('⏳ Waiting for package data...');
      return;
    }

    try {
      const payingPersons = formData.adults + formData.children;
      const totalPersons = payingPersons + formData.infants;
      
      // If no persons selected, don't calculate
      if (totalPersons === 0) {
        setPriceCalculation({
          basePrice: 0,
          baseSubtotal: 0,
          infantSubtotal: 0,
          extrasSubtotal: 0,
          subtotal: 0,
          tax: 0,
          total: 0,
        });
        return;
      }

      // Get base price from package - try multiple possible field names
      const basePrice = parseFloat(
        packageData.base_price || 
        packageData.basePrice || 
        packageData.price || 
        packageData.pricePerPerson ||
        0
      );
      const infantPrice = parseFloat(packageData.infant_price || 0);

      console.log('📊 Price Calculation:', {
        packageId: packageData.id,
        packageName: packageData.title || packageData.name,
        basePrice,
        infantPrice,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        totalPersons,
      });

      if (basePrice === 0) {
        console.warn('⚠️ Base price is 0! Package data:', packageData);
      }

      const extrasData = selectedAddons.map(addon => ({
        key: addon.id,
        name: addon.name,
        price: parseFloat(addon.price || 0),
        quantity: addon.quantity || 1,
      }));

      try {
        // Try to call Backend API
        const response = await bookingsService.calculatePrice({
          packageId: packageData.id,
          persons: {
            adults: formData.adults,
            children: formData.children,
            infants: formData.infants,
          },
          extras: extrasData,
        });

        console.log('✅ Backend calculation response:', response);
        setPriceCalculation(response);
      } catch (apiErr) {
        console.warn('⚠️ Backend calculation failed, calculating locally:', apiErr);
        
        // Calculate locally if API fails
        const baseSubtotal = basePrice * payingPersons;
        const infantSubtotal = infantPrice * formData.infants;
        const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (parseFloat(addon.price || 0) * (addon.quantity || 1)), 0);
        const subtotal = baseSubtotal + infantSubtotal + addonsTotal;
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        console.log('📊 Local calculation:', {
          basePrice,
          baseSubtotal,
          infantSubtotal,
          addonsTotal,
          subtotal,
          tax,
          total,
        });

        setPriceCalculation({
          basePrice,
          baseSubtotal,
          infantSubtotal,
          extrasSubtotal: addonsTotal,
          subtotal,
          tax,
          total,
        });
      }
    } catch (err) {
      console.error('❌ Error calculating price:', err);
    }
  };

  /**
   * Format person count for display
   */
  const getTotalPersons = () => {
    return formData.adults + formData.children + formData.infants;
  };

  /**
   * Validate step 1 (Personal Details)
   */
  const validateStep1 = () => {
    const newErrors = {};
    const totalPersons = getTotalPersons();

    if (formData.adults + formData.children < 1) {
      newErrors.persons = 'At least 1 adult or child is required';
    } else if (totalPersons > 50) {
      newErrors.persons = 'Maximum 50 persons allowed';
    }

    if (formData.infants > formData.adults) {
      newErrors.persons = 'Each infant must be accompanied by an adult';
    }

    if (!formData.tripStartDate) {
      newErrors.tripStartDate = 'Travel date is required';
    } else {
      const selectedDate = new Date(formData.tripStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilTrip = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilTrip < 0) {
        newErrors.tripStartDate = 'Travel date cannot be in the past';
      } else if (daysUntilTrip < 15) {
        newErrors.tripStartDate = `Booking must be at least 15 days in advance. You have ${daysUntilTrip} days.`;
      }
    }

    // Validate per-traveler details
    const newTravelerErrors = {};
    travelers.forEach((t, idx) => {
      const rowErrors = {};
      if (!t.fullName || !t.fullName.trim()) rowErrors.fullName = 'Full name is required';
      if (!t.nationality || !t.nationality.trim()) rowErrors.nationality = 'Nationality is required';
      if (!t.dateOfBirth) rowErrors.dateOfBirth = 'Date of birth is required';
      if (Object.keys(rowErrors).length > 0) newTravelerErrors[idx] = rowErrors;
    });
    setTravelerErrors(newTravelerErrors);
    if (Object.keys(newTravelerErrors).length > 0) {
      newErrors.travelers = 'Please complete all traveler details';
      // Jump to the first incomplete traveler
      setExpandedTraveler(Number(Object.keys(newTravelerErrors)[0]));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newTravelerErrors).length === 0;
  };

  /**
   * Validate step 2 (Extras Selection) - No validation needed, optional
   */
  const validateStep2 = () => {
    setErrors({});
    return true;
  };

  /**
   * Validate step 3 (Payment Details) - No validation needed
   */
  const validateStep3 = () => {
    setErrors({});
    return true;
  };

  /**
   * Handle moving to next step
   */
  const handleNextStep = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle moving to previous step
   */
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle addon selection
   */
  const handleAddonsChange = (updatedAddons) => {
    setSelectedAddons(updatedAddons);
  };

  /**
   * Submit booking
   */
  const handleSubmitBooking = async () => {
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setBookingError(null);

    try {
      const totalPersons = getTotalPersons();
      const addonsData = selectedAddons.map(addon => ({
        key: addon.id,
        name: addon.name,
        price: addon.price,
        quantity: addon.quantity || 1,
      }));

      const bookingPayload = {
        packageId: packageData.id,
        tripStartDate: formData.tripStartDate,
        persons: {
          adults: formData.adults,
          children: formData.children,
          infants: formData.infants,
        },
        travelers: travelers.map(t => ({
          travelerType: t.travelerType,
          fullName: t.fullName.trim(),
          nationality: t.nationality.trim(),
          passportNumber: t.passportNumber ? t.passportNumber.trim() : undefined,
          dateOfBirth: t.dateOfBirth,
        })),
        extras: addonsData,
        totalPrice: priceCalculation.total,
        paymentType: formData.paymentType,
        notes: formData.notes || null,
        displayCurrency: displayCurrencyCode,
      };

      const response = await bookingsService.createBooking(bookingPayload);
      
      setBookingSuccess({
        bookingNumber: response.data?.booking_number || response.data?.id,
        packageName: packageData.title || packageData.name,
        totalPrice: priceCalculation.total,
        displayCurrency: response.data?.display_currency || displayCurrencyCode,
        displayTotal: response.data?.display_total,
      });

      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (packageLoading) {
    return (
      <>
        <Header />
        <div className="booking-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading package details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Package not found
  if (!packageData) {
    return (
      <>
        <Header />
        <div className="booking-container">
          <div className="error-card">
            <h2>❌ Package not found</h2>
            <p>The package you're trying to book is no longer available.</p>
            <button onClick={() => navigate('/search')} className="btn btn-primary">
              Back to Search
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Success state
  if (currentStep === 4 && bookingSuccess) {
    return (
      <>
        <Header />
        <div className="booking-container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h1>Booking Confirmed!</h1>
            <p>Your booking has been successfully created.</p>
            
            <div className="success-details">
              <div className="detail-row">
                <span className="label">Booking Number:</span>
                <span className="value">{bookingSuccess.bookingNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Package:</span>
                <span className="value">{bookingSuccess.packageName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Price:</span>
                <span className="value price">
                  {bookingSuccess.displayCurrency === 'EGP' && bookingSuccess.displayTotal
                    ? formatPrice(bookingSuccess.displayTotal, 'EGP')
                    : formatCurrency(bookingSuccess.totalPrice)}
                </span>
              </div>
            </div>

            <div className="success-actions">
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                View My Bookings
              </button>
              <button onClick={() => navigate('/')} className="btn btn-outline">
                Back to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="booking-container">
        {/* Progress Steps */}
        <div className="booking-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Passengers</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Extras</div>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Payment</div>
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Confirm</div>
          </div>
        </div>

        <div className="booking-content">
          {/* Left Side - Form */}
          <div className="booking-form-section">
            {/* Error Alert */}
            {(bookingError || Object.keys(errors).length > 0) && (
              <div className="alert alert-error">
                {bookingError ? (
                  <p>{bookingError}</p>
                ) : (
                  <ul>
                    {Object.values(errors).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Step 1: Passengers */}
            {currentStep === 1 && (
              <div className="step-content">
                <h2>Select Passengers</h2>
                
                <div className="passenger-form">
                  <div className="form-group">
                    <label>Adults</label>
                    <div className="number-input">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, adults: Math.max(0, prev.adults - 1) }))}
                        className="btn-minus"
                      >
                        −
                      </button>
                      <input type="text" value={formData.adults} readOnly />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, adults: prev.adults + 1 }))}
                        className="btn-plus"
                      >
                        +
                      </button>
                    </div>
                    <small>Age 12 and above</small>
                  </div>

                  <div className="form-group">
                    <label>Children</label>
                    <div className="number-input">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                        className="btn-minus"
                      >
                        −
                      </button>
                      <input type="text" value={formData.children} readOnly />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, children: prev.children + 1 }))}
                        className="btn-plus"
                      >
                        +
                      </button>
                    </div>
                    <small>Age 3 to 11</small>
                  </div>

                  <div className="form-group">
                    <label>Infant</label>
                    <div className="number-input">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, infants: Math.max(0, prev.infants - 1) }))}
                        className="btn-minus"
                      >
                        −
                      </button>
                      <input type="text" value={formData.infants} readOnly />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, infants: Math.min(prev.adults, prev.infants + 1) }))}
                        className="btn-plus"
                        disabled={formData.infants >= formData.adults}
                      >
                        +
                      </button>
                    </div>
                    <small>Under 2 years — must not exceed number of adults</small>
                  </div>
                </div>

                {errors.persons && <small className="error-text">{errors.persons}</small>}

                {/* Traveler Details - one form per person, collapsible */}
                {travelers.length > 0 && (
                  <div className="traveler-details">
                    <h3>Traveler Details</h3>
                    <p className="traveler-details-hint">Please provide details for each traveler.</p>

                    {travelers.map((traveler, idx) => {
                      const typeLabel = traveler.travelerType === 'adult'
                        ? 'Adult'
                        : traveler.travelerType === 'child'
                          ? 'Child'
                          : 'Infant';
                      // Count this traveler's position within its own type, for a friendly label
                      const positionInType = travelers
                        .slice(0, idx + 1)
                        .filter(t => t.travelerType === traveler.travelerType).length;
                      const isExpanded = expandedTraveler === idx;
                      const rowErrors = travelerErrors[idx] || {};
                      const isComplete = traveler.fullName?.trim() && traveler.nationality?.trim() && traveler.dateOfBirth;

                      const updateTraveler = (field, value) => {
                        setTravelers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
                      };

                      return (
                        <div key={idx} className={`traveler-card ${isExpanded ? 'expanded' : ''}`}>
                          <button
                            type="button"
                            className="traveler-card-header"
                            onClick={() => setExpandedTraveler(isExpanded ? -1 : idx)}
                          >
                            <span className="traveler-card-title">
                              {typeLabel} {positionInType}
                              {traveler.fullName ? ` — ${traveler.fullName}` : ''}
                            </span>
                            <span className={`traveler-card-status ${isComplete ? 'complete' : 'incomplete'}`}>
                              {isComplete ? '✓ Complete' : 'Incomplete'}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="traveler-card-body">
                              <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                  type="text"
                                  value={traveler.fullName}
                                  onChange={(e) => updateTraveler('fullName', e.target.value)}
                                  placeholder="As shown on passport/ID"
                                  className={rowErrors.fullName ? 'error' : ''}
                                />
                                {rowErrors.fullName && <small className="error-text">{rowErrors.fullName}</small>}
                              </div>

                              <div className="form-group">
                                <label>Nationality *</label>
                                <input
                                  type="text"
                                  value={traveler.nationality}
                                  onChange={(e) => updateTraveler('nationality', e.target.value)}
                                  placeholder="e.g. Egyptian"
                                  className={rowErrors.nationality ? 'error' : ''}
                                />
                                {rowErrors.nationality && <small className="error-text">{rowErrors.nationality}</small>}
                              </div>

                              <div className="form-group">
                                <label>Passport / ID Number (Optional)</label>
                                <input
                                  type="text"
                                  value={traveler.passportNumber}
                                  onChange={(e) => updateTraveler('passportNumber', e.target.value)}
                                  placeholder="Passport or national ID number"
                                />
                              </div>

                              <div className="form-group">
                                <label>Date of Birth *</label>
                                <input
                                  type="date"
                                  value={traveler.dateOfBirth}
                                  onChange={(e) => updateTraveler('dateOfBirth', e.target.value)}
                                  max={new Date().toISOString().split('T')[0]}
                                  className={rowErrors.dateOfBirth ? 'error' : ''}
                                />
                                {rowErrors.dateOfBirth && <small className="error-text">{rowErrors.dateOfBirth}</small>}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="form-group">
                  <label>Travel Date * (Must be 15+ days from today)</label>
                  <input
                    type="date"
                    value={formData.tripStartDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, tripStartDate: e.target.value }));
                      setErrors({});
                    }}
                    min={(() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 15);
                      return date.toISOString().split('T')[0];
                    })()}
                    className={errors.tripStartDate ? 'error' : ''}
                  />
                  {errors.tripStartDate && <small className="error-text">{errors.tripStartDate}</small>}
                </div>

                <div className="form-group">
                  <label>Special Requests (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requests or dietary requirements?"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Add-ons */}
            {currentStep === 2 && (
              <div className="step-content">
                <h2>Select Add-ons (Optional)</h2>
                <p className="step-description">Enhance your experience with our available add-ons</p>
                <AddonsSelector 
                  packageId={packageData?.id} 
                  selectedAddons={selectedAddons}
                  onAddonsChange={handleAddonsChange}
                  loading={addonLoading}
                />
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="step-content">
                <h2>Payment Method</h2>
                <div className="payment-options">
                  {/* Show all payment methods for prices $1-$100 */}
                  {priceCalculation.total > 0 && priceCalculation.total <= 100 && (
                    <>
                      <div
                        className={`payment-option ${formData.paymentType === 'on_arrival' ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentType: 'on_arrival' }))}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="on_arrival"
                          checked={formData.paymentType === 'on_arrival'}
                          onChange={() => setFormData(prev => ({ ...prev, paymentType: 'on_arrival' }))}
                        />
                        <div className="payment-info">
                          <h4>Pay on Arrival</h4>
                          <p>Pay the full amount when the tour starts</p>
                        </div>
                      </div>

                      <div
                        className={`payment-option ${formData.paymentType === 'deposit' ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentType: 'deposit' }))}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="deposit"
                          checked={formData.paymentType === 'deposit'}
                          onChange={() => setFormData(prev => ({ ...prev, paymentType: 'deposit' }))}
                        />
                        <div className="payment-info">
                          <h4>Pay Deposit (50%)</h4>
                          <p>Pay 50% now, rest on arrival</p>
                        </div>
                      </div>

                      <div
                        className={`payment-option ${formData.paymentType === 'full_payment' ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentType: 'full_payment' }))}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="full_payment"
                          checked={formData.paymentType === 'full_payment'}
                          onChange={() => setFormData(prev => ({ ...prev, paymentType: 'full_payment' }))}
                        />
                        <div className="payment-info">
                          <h4>Pay Full Amount</h4>
                          <p>Pay everything now and save time</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Show only card payment methods (Deposit + Full Payment) for prices > $100 */}
                  {priceCalculation.total > 100 && (
                    <>
                      <div
                        className={`payment-option ${formData.paymentType === 'deposit' ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentType: 'deposit' }))}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="deposit"
                          checked={formData.paymentType === 'deposit'}
                          onChange={() => setFormData(prev => ({ ...prev, paymentType: 'deposit' }))}
                        />
                        <div className="payment-info">
                          <h4>Pay Deposit (50%)</h4>
                          <p>Pay 50% now with card, rest on arrival</p>
                        </div>
                      </div>

                      <div
                        className={`payment-option ${formData.paymentType === 'full_payment' ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentType: 'full_payment' }))}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="full_payment"
                          checked={formData.paymentType === 'full_payment'}
                          onChange={() => setFormData(prev => ({ ...prev, paymentType: 'full_payment' }))}
                        />
                        <div className="payment-info">
                          <h4>Pay Full Amount</h4>
                          <p>Pay everything now with card</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="booking-navigation">
              {currentStep > 1 && (
                <button onClick={handlePrevStep} className="btn btn-outline">
                  ← Previous
                </button>
              )}
              {currentStep < 3 && (
                <button onClick={handleNextStep} className="btn btn-primary">
                  Next →
                </button>
              )}
              {currentStep === 3 && (
                <button
                  onClick={handleSubmitBooking}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Processing...' : 'Confirm Booking →'}
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Price Summary */}
          <div className="booking-summary">
            <div className="summary-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0 }}>Booking Summary</h3>
                <div
                  style={{
                    display: 'inline-flex',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    padding: '2px',
                    background: '#f1f5f9',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDisplayCurrencyCode('USD')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: displayCurrencyCode === 'USD' ? '#2563eb' : 'transparent',
                      color: displayCurrencyCode === 'USD' ? '#fff' : '#475569',
                      transition: 'all 0.2s',
                    }}
                  >
                    USD
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayCurrencyCode('EGP')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: displayCurrencyCode === 'EGP' ? '#2563eb' : 'transparent',
                      color: displayCurrencyCode === 'EGP' ? '#fff' : '#475569',
                      transition: 'all 0.2s',
                    }}
                  >
                    EGP
                  </button>
                </div>
              </div>

              {/* Package Info */}
              <div className="package-info">
                <h4>{packageData ? (packageData.title || packageData.name) : 'Loading...'}</h4>
                <div className="summary-row">
                  <span>
                    Base Price × {formData.adults + formData.children} {(formData.adults + formData.children) === 1 ? 'Person' : 'Persons'}
                  </span>
                  <span>{displayCurrency(priceCalculation.baseSubtotal)}</span>
                </div>
                {formData.infants > 0 && (
                  <div className="summary-row">
                    <span>Infant × {formData.infants}</span>
                    <span>{displayCurrency(priceCalculation.infantSubtotal)}</span>
                  </div>
                )}
              </div>

              {/* Extras */}
              {selectedAddons.length > 0 && (
                <div className="extras-summary">
                  <h5>Add-ons</h5>
                  {selectedAddons.map(extra => (
                    <div key={extra.id} className="summary-row">
                      <span>{extra.name}</span>
                      <span>{displayCurrency(extra.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="summary-row subtotal">
                  <span>Subtotal</span>
                  <span>{displayCurrency(priceCalculation.subtotal)}</span>
                </div>
                <div className="summary-row tax">
                  <span>Tax (5%)</span>
                  <span>{displayCurrency(priceCalculation.tax)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{displayCurrency(priceCalculation.total)}</span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="booking-details">
                <h5>Booking Details</h5>
                <div className="detail-row">
                  <span>Passengers:</span>
                  <span>
                    {formData.adults} {formData.adults === 1 ? 'Adult' : 'Adults'}
                    {formData.children > 0 && `, ${formData.children} ${formData.children === 1 ? 'Child' : 'Children'}`}
                    {formData.infants > 0 && `, ${formData.infants} ${formData.infants === 1 ? 'Infant' : 'Infants'}`}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Travel Date:</span>
                  <span>
                    {formData.tripStartDate
                      ? new Date(formData.tripStartDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not selected'}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Payment Method:</span>
                  <span className="capitalize">
                    {formData.paymentType === 'on_arrival' && 'Pay on Arrival'}
                    {formData.paymentType === 'deposit' && 'Pay Deposit (50%)'}
                    {formData.paymentType === 'full_payment' && 'Pay Full Amount'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookingPage;
