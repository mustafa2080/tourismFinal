import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks';
import { customTripService } from '../services/customTripService';
import { formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiCalendar, FiUsers, FiCheckCircle, FiArrowRight, FiArrowLeft,
  FiPlus, FiMinus, FiTrash2, FiHome, FiActivity, FiTruck, FiCoffee,
  FiSend, FiLoader, FiCompass, FiEdit3,
} from 'react-icons/fi';

const USD_TO_EGP_RATE = 50;

const ITEM_TYPE_META = {
  activity: { label: 'Activities', icon: FiActivity },
  hotel: { label: 'Hotels', icon: FiHome },
  transport: { label: 'Transport', icon: FiTruck },
  meal: { label: 'Meals', icon: FiCoffee },
};

const STEPS = [
  { id: 1, label: 'Destination' },
  { id: 2, label: 'Dates & Travelers' },
  { id: 3, label: 'Build Your Trip' },
  { id: 4, label: 'Review & Send' },
];

/**
 * Custom Trip — "Build Your Own Trip" wizard.
 * A self-serve trip builder: pick a destination, dates & travelers, then
 * assemble activities/hotels/transport/meals from the catalog with a live
 * running price, and submit the request for a tailored quote.
 */
const CustomTripPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [errors, setErrors] = useState({});

  // Step 1 — destination
  const [destinations, setDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [useCustomDestination, setUseCustomDestination] = useState(false);

  // Step 2 — dates & travelers
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budgetTier, setBudgetTier] = useState('mid_range');
  const [pace, setPace] = useState('standard');
  const [interests, setInterests] = useState([]);

  // Step 3 — items catalog + selection
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [activeItemType, setActiveItemType] = useState('activity');
  const [selectedItems, setSelectedItems] = useState([]); // [{...option, quantity}]

  // Step 4 — contact info (guest fallback)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const effectiveDestination = useCustomDestination ? customDestination.trim() : destination;

  // Prefill contact info for logged-in users
  useEffect(() => {
    if (isAuthenticated && user) {
      setContactName(prev => prev || user.name || '');
      setContactEmail(prev => prev || user.email || '');
      setContactPhone(prev => prev || user.phone || '');
    }
  }, [isAuthenticated, user]);

  // Load destinations on mount
  useEffect(() => {
    (async () => {
      try {
        setDestinationsLoading(true);
        const data = await customTripService.getDestinations();
        setDestinations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load destinations:', err);
        setDestinations([]);
      } finally {
        setDestinationsLoading(false);
      }
    })();
  }, []);

  // Load builder options whenever destination is chosen (step 3 needs it, but fetch early)
  useEffect(() => {
    if (!effectiveDestination) return;
    (async () => {
      try {
        setOptionsLoading(true);
        const data = await customTripService.getOptions({ destination: effectiveDestination });
        setOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load trip builder options:', err);
        setOptions([]);
      } finally {
        setOptionsLoading(false);
      }
    })();
  }, [effectiveDestination]);

  const nights = useMemo(
    () => customTripService.calculateNights(dateStart, dateEnd),
    [dateStart, dateEnd]
  );

  const estimatedTotalUsd = useMemo(
    () => customTripService.calculateTotal(selectedItems),
    [selectedItems]
  );

  const displayTotal = (amountUsd) => {
    const num = parseFloat(amountUsd) || 0;
    if (displayCurrency === 'EGP') return formatPrice(num * USD_TO_EGP_RATE, 'EGP');
    return formatPrice(num, 'USD');
  };

  const groupedOptions = useMemo(() => {
    return options.filter(opt => opt.item_type === activeItemType);
  }, [options, activeItemType]);

  const itemCountByType = useMemo(() => {
    const counts = { activity: 0, hotel: 0, transport: 0, meal: 0 };
    options.forEach(opt => {
      if (counts[opt.item_type] !== undefined) counts[opt.item_type] += 1;
    });
    return counts;
  }, [options]);

  const toggleInterest = (tag) => {
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const isItemSelected = (optionId) => selectedItems.some(i => i.id === optionId);

  const addItem = (option) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === option.id);
      if (existing) {
        return prev.map(i => i.id === option.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...option, quantity: 1 }];
    });
  };

  const removeItem = (optionId) => {
    setSelectedItems(prev => prev.filter(i => i.id !== optionId));
  };

  const changeItemQuantity = (optionId, delta) => {
    setSelectedItems(prev => prev
      .map(i => i.id === optionId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    );
  };

  // ---- Validation per step ----

  const validateStep1 = () => {
    const newErrors = {};
    if (!effectiveDestination) newErrors.destination = 'Please choose or enter a destination';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!dateStart) newErrors.dateStart = 'Start date is required';
    if (!dateEnd) newErrors.dateEnd = 'End date is required';
    if (dateStart && dateEnd && new Date(dateEnd) <= new Date(dateStart)) {
      newErrors.dateEnd = 'End date must be after the start date';
    }
    if (dateStart && new Date(dateStart) < new Date(new Date().toDateString())) {
      newErrors.dateStart = 'Start date cannot be in the past';
    }
    if (!adults || adults < 1) newErrors.adults = 'At least one adult is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (selectedItems.length === 0) newErrors.items = 'Add at least one item to your trip';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (!contactName.trim()) newErrors.contactName = 'Name is required';
    if (!contactEmail.trim()) newErrors.contactEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) newErrors.contactEmail = 'Enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    let valid = false;
    if (step === 1) valid = validateStep1();
    else if (step === 2) valid = validateStep2();
    else if (step === 3) valid = validateStep3();
    if (valid) {
      setStep(s => Math.min(4, s + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim() || undefined,
        destination: effectiveDestination,
        date_start: dateStart,
        date_end: dateEnd,
        adults,
        children,
        budget_tier: budgetTier,
        pace,
        interests,
        special_requests: specialRequests.trim() || undefined,
        items: selectedItems.map(i => ({
          item_type: i.item_type,
          name: i.name,
          description: i.description,
          image: i.image,
          quantity: i.quantity,
          unit_price: i.price,
          day_number: 0,
        })),
        display_currency: displayCurrency,
        display_total: displayCurrency === 'EGP' ? estimatedTotalUsd * USD_TO_EGP_RATE : undefined,
      };

      const response = await customTripService.submitRequest(payload);
      setSubmitted(response);
      toast.success('Your custom trip request has been sent!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to submit custom trip request:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
      toast.error('Failed to send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Success screen ----
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
              <FiCheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Request sent
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              We received your custom trip to <strong>{effectiveDestination}</strong>. Our
              team will review it and send you a tailored quote by email soon.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Request number</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {submitted.request_number}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Estimated total</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {displayTotal(estimatedTotalUsd)}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Back to Home'}
              </button>
              <button
                onClick={() => navigate('/search')}
                className="flex-1 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all"
              >
                Explore Packages
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative pt-10 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm font-semibold mb-3">
            <FiCompass size={14} />
            Build Your Own Trip
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Design a trip that's entirely yours
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            Pick a destination, set your dates, and choose the experiences you want —
            we'll send you a tailored price for exactly what you build.
          </p>
        </div>
      </section>

      {/* Stepper */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 lg:top-20 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : step > s.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step > s.id ? <FiCheckCircle size={16} /> : s.id}
                  </div>
                  <span
                    className={`text-[11px] font-medium hidden sm:block ${
                      step === s.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                      step > s.id ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Step 1 — Destination */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FiMapPin size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Where do you want to go?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose a destination we cover, or tell us your own</p>
              </div>
            </div>

            {destinationsLoading ? (
              <div className="flex items-center justify-center py-10">
                <FiLoader className="animate-spin text-slate-400" size={24} />
              </div>
            ) : (
              <>
                {destinations.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    {destinations.map((d) => {
                      const name = typeof d === 'string' ? d : d.destination || d.name;
                      const active = !useCustomDestination && destination === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => { setDestination(name); setUseCustomDestination(false); }}
                          className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all text-left ${
                            active
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">or enter your own</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <input
                  type="text"
                  value={customDestination}
                  onChange={(e) => {
                    setCustomDestination(e.target.value);
                    setUseCustomDestination(true);
                  }}
                  onFocus={() => setUseCustomDestination(true)}
                  placeholder="e.g. Santorini, Greece"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                    errors.destination ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.destination && (
                  <p className="text-sm text-red-500 mt-2">{errors.destination}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2 — Dates & Travelers */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FiCalendar size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">When are you traveling?</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start date</label>
                  <input
                    type="date"
                    value={dateStart}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateStart(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none ${
                      errors.dateStart ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.dateStart && <p className="text-sm text-red-500 mt-1.5">{errors.dateStart}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">End date</label>
                  <input
                    type="date"
                    value={dateEnd}
                    min={dateStart || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none ${
                      errors.dateEnd ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.dateEnd && <p className="text-sm text-red-500 mt-1.5">{errors.dateEnd}</p>}
                </div>
              </div>
              {nights > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{nights} night{nights !== 1 ? 's' : ''}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FiUsers size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Who's traveling?</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Adults</p>
                    <p className="text-xs text-slate-400">Age 12+</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAdults(a => Math.max(1, a - 1))} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                      <FiMinus size={14} />
                    </button>
                    <span className="w-5 text-center font-bold text-slate-900 dark:text-white">{adults}</span>
                    <button type="button" onClick={() => setAdults(a => a + 1)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Children</p>
                    <p className="text-xs text-slate-400">Age 3–11</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setChildren(c => Math.max(0, c - 1))} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                      <FiMinus size={14} />
                    </button>
                    <span className="w-5 text-center font-bold text-slate-900 dark:text-white">{children}</span>
                    <button type="button" onClick={() => setChildren(c => c + 1)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {errors.adults && <p className="text-sm text-red-500 mt-2">{errors.adults}</p>}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Budget</h3>
              <div className="grid grid-cols-3 gap-3">
                {customTripService.budgetTiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setBudgetTier(tier.id)}
                    className={`px-3 py-3 rounded-xl border-2 text-center transition-all ${
                      budgetTier === tier.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{tier.emoji}</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{tier.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Pace</h3>
              <div className="grid grid-cols-3 gap-3">
                {customTripService.paceOptions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPace(p.id)}
                    className={`px-3 py-3 rounded-xl border-2 text-center transition-all ${
                      pace === p.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{p.emoji}</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Interests (optional)</h3>
              <div className="flex flex-wrap gap-2">
                {customTripService.interestTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      interests.includes(tag)
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Build the trip */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FiEdit3 size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pick what you want</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">for {effectiveDestination}</p>
                </div>
              </div>

              {/* Type tabs */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {Object.entries(ITEM_TYPE_META).map(([type, meta]) => {
                  const Icon = meta.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveItemType(type)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                        activeItemType === type
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <Icon size={15} />
                      {meta.label}
                      {itemCountByType[type] > 0 && (
                        <span className="text-xs opacity-75">({itemCountByType[type]})</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {errors.items && (
                <p className="text-sm text-red-500 mb-4">{errors.items}</p>
              )}

              {optionsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <FiLoader className="animate-spin text-slate-400" size={24} />
                </div>
              ) : groupedOptions.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                  <FiCompass size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No {ITEM_TYPE_META[activeItemType].label.toLowerCase()} available for this destination yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupedOptions.map((opt) => {
                    const selected = isItemSelected(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`rounded-xl border-2 overflow-hidden transition-all ${
                          selected ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {opt.image && (
                          <img src={opt.image} alt={opt.name} className="w-full h-32 object-cover" loading="lazy" />
                        )}
                        <div className="p-3.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{opt.name}</h4>
                          {opt.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{opt.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {displayTotal(opt.price)}
                              <span className="text-xs font-normal text-slate-400"> /{opt.price_unit?.replace('per_', '') || 'item'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => addItem(opt)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                            >
                              <FiPlus size={12} />
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sticky top-36">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Your Trip</h3>
                  <div className="inline-flex border border-slate-200 dark:border-slate-700 rounded-full p-0.5">
                    {['USD', 'EGP'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDisplayCurrency(c)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          displayCurrency === c ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedItems.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
                    Nothing added yet. Pick items from the catalog.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-4">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs text-slate-400">{displayTotal(item.price)} each</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button type="button" onClick={() => changeItemQuantity(item.id, -1)} className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600">
                              <FiMinus size={10} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                            <button type="button" onClick={() => changeItemQuantity(item.id, 1)} className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600">
                              <FiPlus size={10} />
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Estimated total</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{displayTotal(estimatedTotalUsd)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Review & Send */}
        {step === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FiSend size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Almost there</h2>
              </div>

              {submitError && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your name"
                    className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none ${
                      errors.contactName ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.contactName && <p className="text-sm text-red-500 mt-1.5">{errors.contactName}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none ${
                        errors.contactEmail ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    {errors.contactEmail && <p className="text-sm text-red-500 mt-1.5">{errors.contactEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+20 1xx xxx xxxx"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Special requests (optional)</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    placeholder="Dietary needs, accessibility, anything else we should know"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sticky top-36">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Trip Summary</h3>
                <div className="space-y-2.5 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Destination</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">{effectiveDestination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Dates</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">
                      {dateStart} → {dateEnd}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Travelers</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Items</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedItems.length}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between mb-5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Estimated total</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{displayTotal(estimatedTotalUsd)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Request
                      <FiSend size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step navigation (steps 1–3 only; step 4 has its own Send button) */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <FiArrowLeft size={16} />
                Back
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
            >
              Continue
              <FiArrowRight size={16} />
            </button>
          </div>
        )}
        {step === 4 && (
          <div className="mt-6">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <FiArrowLeft size={16} />
              Back
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CustomTripPage;
