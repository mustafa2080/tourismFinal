import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { packagesService, bookingsService } from '../services';
import { formatCurrency } from '../utils/formatters';
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

  // Form data
  const [formData, setFormData] = useState({
    adults: 1,
    children: 0,
    seniors: 0,
    tripStartDate: '',
    notes: '',
    addons: [],
    paymentType: 'on_arrival',
  });

  // Calculated data
  const [priceCalculation, setPriceCalculation] = useState({
    basePrice: 0,
    baseSubtotal: 0,
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
  }, [packageData?.id, formData.adults, formData.children, formData.seniors, selectedAddons]);

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
      const totalPersons = formData.adults + formData.children + formData.seniors;
      
      // If no persons selected, don't calculate
      if (totalPersons === 0) {
        setPriceCalculation({
          basePrice: 0,
          baseSubtotal: 0,
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

      console.log('📊 Price Calculation:', {
        packageId: packageData.id,
        packageName: packageData.title || packageData.name,
        basePrice,
        adults: formData.adults,
        children: formData.children,
        seniors: formData.seniors,
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
            seniors: formData.seniors,
          },
          extras: extrasData,
        });

        console.log('✅ Backend calculation response:', response);
        setPriceCalculation(response);
      } catch (apiErr) {
        console.warn('⚠️ Backend calculation failed, calculating locally:', apiErr);
        
        // Calculate locally if API fails
        const baseSubtotal = basePrice * totalPersons;
        const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (parseFloat(addon.price || 0) * (addon.quantity || 1)), 0);
        const subtotal = baseSubtotal + addonsTotal;
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        console.log('📊 Local calculation:', {
          basePrice,
          baseSubtotal,
          extrasTotal,
          subtotal,
          tax,
          total,
        });

        setPriceCalculation({
          basePrice,
          baseSubtotal,
          extrasSubtotal: extrasTotal,
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
    return formData.adults + formData.children + formData.seniors;
  };

  /**
   * Validate step 1 (Personal Details)
   */
  const validateStep1 = () => {
    const newErrors = {};
    const totalPersons = getTotalPersons();

    if (totalPersons < 1) {
      newErrors.persons = 'At least 1 person is required';
    } else if (totalPersons > 50) {
      newErrors.persons = 'Maximum 50 persons allowed';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          seniors: formData.seniors,
        },
        extras: addonsData,
        totalPrice: priceCalculation.total,
        paymentType: formData.paymentType,
        notes: formData.notes || null,
      };

      const response = await bookingsService.createBooking(bookingPayload);
      
      setBookingSuccess({
        bookingNumber: response.data?.booking_number || response.data?.id,
        packageName: packageData.title || packageData.name,
        totalPrice: priceCalculation.total,
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
                <span className="value price">{formatCurrency(bookingSuccess.totalPrice)}</span>
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
                    <label>Seniors</label>
                    <div className="number-input">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, seniors: Math.max(0, prev.seniors - 1) }))}
                        className="btn-minus"
                      >
                        −
                      </button>
                      <input type="text" value={formData.seniors} readOnly />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, seniors: prev.seniors + 1 }))}
                        className="btn-plus"
                      >
                        +
                      </button>
                    </div>
                    <small>Age 60 and above</small>
                  </div>
                </div>

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
              <h3>Booking Summary</h3>
              
              {/* Package Info */}
              <div className="package-info">
                <h4>{packageData ? (packageData.title || packageData.name) : 'Loading...'}</h4>
                <div className="summary-row">
                  <span>Base Price × {getTotalPersons()} {getTotalPersons() === 1 ? 'Person' : 'Persons'}</span>
                  <span>{formatCurrency(priceCalculation.baseSubtotal)}</span>
                </div>
              </div>

              {/* Extras */}
              {selectedAddons.length > 0 && (
                <div className="extras-summary">
                  <h5>Add-ons</h5>
                  {selectedAddons.map(extra => (
                    <div key={extra.id} className="summary-row">
                      <span>{extra.name}</span>
                      <span>{formatCurrency(extra.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="summary-row subtotal">
                  <span>Subtotal</span>
                  <span>{formatCurrency(priceCalculation.subtotal)}</span>
                </div>
                <div className="summary-row tax">
                  <span>Tax (5%)</span>
                  <span>{formatCurrency(priceCalculation.tax)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatCurrency(priceCalculation.total)}</span>
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
                    {formData.seniors > 0 && `, ${formData.seniors} ${formData.seniors === 1 ? 'Senior' : 'Seniors'}`}
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
