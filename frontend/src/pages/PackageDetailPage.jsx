import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrencyConversion } from '../hooks/useCurrencyConversion';
import { useInstantTranslation } from '../hooks/useInstantTranslation';
import { MainLayout } from '../components/layout';
import { Card, Modal, Button, Rating, Spinner, Breadcrumbs } from '../components/common';
import BookingPanel from '../components/BookingPanel';
import { ItineraryDetails } from '../components/sections';
import { useAuth, useItinerary, useLanguage, useTranslatedPackages } from '../hooks';
import { packagesService, wishlistService, reviewsService, bookingsService } from '../services';
import { WishlistContext } from '../context/WishlistContext';
import {
  FiShare2, FiHeart, FiX, FiCalendar, FiMapPin, FiChevronLeft, FiChevronRight,
  FiAlertCircle, FiStar, FiZap, FiClock, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

/**
 * PackageDetailPage - Enhanced Beautiful Design
 * Premium package detail page with modern UI/UX
 */
const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const wishlistContext = useContext(WishlistContext);
  const { t } = useTranslation();
  
  // Handle context safely
  const isInWishlist = wishlistContext?.isWishlisted || (() => false);
  const toggleWishlistContext = wishlistContext?.toggleWishlist || (() => Promise.resolve());

  // STATE
  const [pkg, setPkg] = useState(null);
  const [translatedPkg, setTranslatedPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [persons, setPersons] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [translatedReviews, setTranslatedReviews] = useState([]);
  const [showAutoTranslate, setShowAutoTranslate] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [userBooking, setUserBooking] = useState(null);
  const [completingTrip, setCompletingTrip] = useState(false);

  // Hooks
  const { itineraries, loading: itineraryLoading } = useItinerary(id);
  const { translatePackage, isLoadingTranslations, autoTranslateToAll, translateListItems } = useTranslatedPackages();
  const { language: currentLanguage } = useLanguage();
  const { i18n } = useInstantTranslation();

  // Check if package is wishlisted from context
  const isWishlisted = isInWishlist(id);

  // 🌐 Helper function to get translated package data from language-specific columns
  // FIX: Accept lang parameter explicitly to ensure proper translation
  const getTranslatedPackageData = useCallback((packageData, lang) => {
    if (!packageData) return packageData;
    
    const currentLang = lang || i18n.language || 'en';
    
    // Try to get translations from language-specific columns
    const langNameField = `${currentLang}_name`;
    const langShortDescField = `${currentLang}_short_description`;
    const langLongDescField = `${currentLang}_detailed_description`;
    const langIncludedField = `${currentLang}_whats_included`;
    const langIncludedItemsField = `${currentLang}_whats_included_items`;
    const langDailyItineraryField = `${currentLang}_daily_itinerary`;
    
    // Fallback fields (English)
    const fallbackLangNameField = 'en_name';
    const fallbackLangShortDescField = 'en_short_description';
    const fallbackLangLongDescField = 'en_detailed_description';
    const fallbackLangIncludedField = 'en_whats_included';
    const fallbackLangIncludedItemsField = 'en_whats_included_items';
    const fallbackLangDailyItineraryField = 'en_daily_itinerary';
    
    let display_title = packageData.title;
    let display_short_desc = packageData.short_desc || '';
    let display_long_desc = packageData.long_desc || '';
    let display_inclusions = packageData.inclusions || [];
    
    // Check if any language-specific field exists
    if (packageData[langNameField] || packageData[langShortDescField] || packageData[langLongDescField]) {
      display_title = packageData[langNameField] || packageData[fallbackLangNameField] || packageData.title;
      display_short_desc = packageData[langShortDescField] || packageData[fallbackLangShortDescField] || packageData.short_desc || '';
      display_long_desc = packageData[langLongDescField] || packageData[fallbackLangLongDescField] || packageData.long_desc || '';
      
      // Handle inclusions which can be array or string
      if (Array.isArray(packageData[langIncludedItemsField])) {
        display_inclusions = packageData[langIncludedItemsField];
      } else if (packageData[langIncludedField]) {
        display_inclusions = packageData[langIncludedField];
      } else if (Array.isArray(packageData[fallbackLangIncludedItemsField])) {
        display_inclusions = packageData[fallbackLangIncludedItemsField];
      } else if (packageData[fallbackLangIncludedField]) {
        display_inclusions = packageData[fallbackLangIncludedField];
      }
      
      return {
        ...packageData,
        title: display_title,
        short_desc: display_short_desc,
        long_desc: display_long_desc,
        inclusions: display_inclusions,
      };
    }
    
    // If no language fields, use English fields as fallback
    if (packageData[fallbackLangNameField] || packageData[fallbackLangShortDescField] || packageData[fallbackLangLongDescField]) {
      display_title = packageData[fallbackLangNameField] || packageData.title;
      display_short_desc = packageData[fallbackLangShortDescField] || packageData.short_desc || '';
      display_long_desc = packageData[fallbackLangLongDescField] || packageData.long_desc || '';
      
      if (Array.isArray(packageData[fallbackLangIncludedItemsField])) {
        display_inclusions = packageData[fallbackLangIncludedItemsField];
      } else if (packageData[fallbackLangIncludedField]) {
        display_inclusions = packageData[fallbackLangIncludedField];
      }
      
      return {
        ...packageData,
        title: display_title,
        short_desc: display_short_desc,
        long_desc: display_long_desc,
        inclusions: display_inclusions,
      };
    }
    
    return packageData;
  }, [i18n.language]);

  // Auto-translate when language changes
  useEffect(() => {
    if (!pkg) {
      setTranslatedPkg(null);
      return;
    }

    // First, try to use direct language-specific columns with current language
    const directTranslated = getTranslatedPackageData(pkg, i18n.language);
    
    // If we found translations in columns, use them
    if (directTranslated.title !== pkg.title || directTranslated.short_desc !== pkg.short_desc) {
      setTranslatedPkg(directTranslated);
      return;
    }

    // Otherwise, use the old auto-translate method if language is not English
    if (currentLanguage === 'en') {
      setTranslatedPkg(null);
      return;
    }

    const translateContent = async () => {
      try {
        const translated = await translatePackage(
          pkg,
          currentLanguage,
          ['title', 'short_desc', 'long_desc', 'description']
        );

        setTranslatedPkg(translated);

        // Translate highlights, inclusions, exclusions
        if (pkg.highlights) {
          const transHighlights = await translateListItems(pkg.highlights, currentLanguage);
          setTranslatedPkg(prev => ({
            ...prev,
            highlights: transHighlights
          }));
        }

        if (pkg.inclusions) {
          const transInclusions = await translateListItems(pkg.inclusions, currentLanguage);
          setTranslatedPkg(prev => ({
            ...prev,
            inclusions: transInclusions
          }));
        }

        if (pkg.exclusions) {
          const transExclusions = await translateListItems(pkg.exclusions, currentLanguage);
          setTranslatedPkg(prev => ({
            ...prev,
            exclusions: transExclusions
          }));
        }

      } catch (error) {
        console.error('Translation error:', error);
      }
    };

    translateContent();
  }, [pkg, i18n.language, translatePackage, translateListItems, getTranslatedPackageData, currentLanguage]);

  // Fetch package and reviews
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`📦 [PackageDetail] Fetching package: ${id}`);

        // Fetch package
        const response = await packagesService.getPackageById(id);
        console.log('✅ [PackageDetail] Package loaded:', response);

        if (!response || !response.success || !response.data) {
          throw new Error('Invalid package data format');
        }

        const packageData = response.data;
        setPkg(packageData);
        setSelectedImage(0);

        // Fetch reviews for this package
        try {
          setReviewsLoading(true);
          const reviewsData = await reviewsService.getPackageReviews(id, {
            limit: 5,
            sortBy: 'recent'
          });
          console.log('✅ [PackageDetail] Reviews loaded:', reviewsData);
          
          // Use reviews from API or default to empty
          const reviewsList = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.data || []);
          setReviews(reviewsList);
        } catch (err) {
          console.warn('⚠️ [PackageDetail] Could not fetch reviews:', err);
          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      } catch (err) {
        console.error('❌ [PackageDetail] Error:', err);
        setError(err.message || 'Failed to load package');
        toast.error('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPackageData();
  }, [id]);

  // Load user's booking for this package
  useEffect(() => {
    if (!isAuthenticated || !id) {
      setUserBooking(null);
      return;
    }

    const fetchUserBooking = async () => {
      try {
        const bookings = await bookingsService.getUserBookings({ limit: 100 });
        const bookingsList = Array.isArray(bookings) ? bookings : (bookings?.data || []);
        
        // Find booking for this package
        const booking = bookingsList.find(b => b.package_id === id);
        setUserBooking(booking || null);
        
        if (booking) {
          console.log('📋 [PackageDetail] User booking found:', {
            id: booking.id,
            status: booking.status,
            can_review: booking.status === 'completed'
          });
        }
      } catch (err) {
        console.warn('⚠️ [PackageDetail] Could not fetch user bookings:', err);
        setUserBooking(null);
      }
    };

    fetchUserBooking();
  }, [isAuthenticated, id]);

  // HANDLERS
  const handleBookNow = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error(t('packageDetail.pleaseLoginBook'));
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      setBookingLoading(true);
      console.log('📋 [PackageDetail] Initiating booking...', {
        packageId: id,
        persons,
        roomType: selectedRoomType?.id,
        extras: selectedExtras.map(e => e.id)
      });

      navigate(`/booking/${id}`, {
        state: {
          roomType: selectedRoomType,
          extras: selectedExtras,
          persons,
          package: pkg,
        },
      });
    } catch (err) {
      console.error('❌ [PackageDetail] Booking error:', err);
      toast.error(t('packageDetail.bookingError'));
    } finally {
      setBookingLoading(false);
    }
  }, [isAuthenticated, id, persons, selectedRoomType, selectedExtras, pkg, navigate, t]);

  const handleWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error(t('packageDetail.wishlist.pleaseLogin'));
      navigate('/login');
      return;
    }

    try {
      setWishlistLoading(true);
      console.log(`❤️ [PackageDetail] Wishlist toggle for package: ${id}`);
      
      // Use context's toggleWishlist which updates the global state and count
      const action = await toggleWishlistContext(id);
      
      if (action === 'added') {
        toast.success(t('packageDetail.wishlist.addedToWishlist'));
      } else if (action === 'removed') {
        toast.success(t('packageDetail.wishlist.removedFromWishlist'));
      }
      
      console.log(`✅ [PackageDetail] Wishlist updated:`, action);
    } catch (err) {
      console.error('❌ [PackageDetail] Wishlist error:', err);
      toast.error(t('packageDetail.wishlist.failedWishlist'));
    } finally {
      setWishlistLoading(false);
    }
  }, [isAuthenticated, id, navigate, toggleWishlistContext, t]);

  const handleAutoTranslate = useCallback(async () => {
    if (!pkg) return;
    try {
      console.log('🌍 Starting auto-translate for all languages...');
      await autoTranslateToAll(pkg, ['title', 'short_desc', 'long_desc', 'description']);
      toast.success('✨ Auto-translated to all languages! Refresh or change language to see');
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('⚠️ Translation failed');
    }
  }, [pkg, autoTranslateToAll]);

  const handleSubmitReview = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    // Check if user has any booking for this package
    if (!userBooking) {
      toast.error('Please book this trip first to leave a review');
      navigate('/booking/' + id);
      return;
    }

    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (reviewComment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters');
      return;
    }

    try {
      setSubmitReviewLoading(true);
      console.log('📝 [PackageDetail] Submitting review:', {
        packageId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      const newReview = await reviewsService.addReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      console.log('✅ [PackageDetail] Review submitted successfully:', newReview);

      // Extract the actual review data from response
      const reviewData = newReview.data || newReview;
      
      // Ensure user object exists with current user info
      const enrichedReview = {
        ...reviewData,
        user: reviewData.user || {
          id: user?.userId,
          name: user?.name || 'You'
        }
      };

      // Add new review to the list
      setReviews([enrichedReview, ...reviews]);
      
      // Reset form
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);

      toast.success('Review submitted successfully! Awaiting approval.');
    } catch (err) {
      console.error('❌ [PackageDetail] Review submission error:', err);
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitReviewLoading(false);
    }
  }, [isAuthenticated, id, reviewRating, reviewComment, reviews, userBooking, navigate]);

  const handleCompleteTrip = useCallback(async () => {
    if (!userBooking) return;

    try {
      setCompletingTrip(true);
      console.log('✅ [PackageDetail] Marking trip as completed:', userBooking.id);

      const result = await bookingsService.completeTrip(userBooking.id);
      
      console.log('✅ [PackageDetail] Trip completed successfully');
      
      // Update local user booking state
      setUserBooking({
        ...userBooking,
        status: 'completed'
      });

      toast.success('Trip marked as completed! You can now leave a review.');
    } catch (err) {
      console.error('❌ [PackageDetail] Error completing trip:', err);
      toast.error(err.message || 'Failed to mark trip as completed');
    } finally {
      setCompletingTrip(false);
    }
  }, [userBooking]);

  // CALCULATIONS
  const priceBreakdown = useMemo(() => {
    if (!pkg) return { base: 0, room: 0, extras: 0, total: 0 };

    const basePrice = (pkg.base_price || 0) * persons;
    const roomPrice = (selectedRoomType?.price || 0) * persons;
    const extrasPrice = selectedExtras.reduce((sum, e) => sum + ((e.price || 0) * persons), 0);

    return {
      base: basePrice,
      room: roomPrice,
      extras: extrasPrice,
      total: basePrice + roomPrice + extrasPrice,
    };
  }, [pkg, persons, selectedRoomType, selectedExtras]);

  // RENDER STATES
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !pkg) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <FiAlertCircle size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('packageDetail.tripNotFound')}</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">{error || t('packageDetail.packageNotFound')}</p>
            <Button onClick={() => navigate('/search')} className="mt-6">
              {t('packageDetail.backToSearch')}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentImage = pkg?.images?.[selectedImage] || null;
  const images = pkg?.images || [];
  
  // Use translated package if available, otherwise original
  const displayPkg = translatedPkg || pkg;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        {/* HERO GALLERY SECTION */}
        <div className="relative h-[350px] sm:h-[450px] lg:h-[550px] bg-black overflow-hidden group">
          {/* Main Image */}
          {currentImage && (
            <div className="absolute inset-0">
              <img
                src={(() => {
                  if (!currentImage.image_data) return currentImage.url || '';
                  let imageData = currentImage.image_data;
                  if (typeof imageData === 'string') {
                    return `data:image/jpeg;base64,${imageData}`;
                  } else if (imageData.data && Array.isArray(imageData.data)) {
                    const binaryString = String.fromCharCode.apply(null, imageData.data);
                    const base64 = btoa(binaryString);
                    return `data:image/jpeg;base64,${base64}`;
                  }
                  return '';
                })()}
                alt={currentImage.alt_text || 'Package image'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
            <span className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-full text-sm shadow-lg">
              ⭐ {(Number(displayPkg.average_rating) || Number(displayPkg.rating) || 0).toFixed(1)} ({displayPkg.reviews_count || displayPkg.review_count || 0})
            </span>
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`p-3 rounded-full backdrop-blur-md transition-all transform hover:scale-110 ${
                isWishlisted
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/40'
              } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiHeart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-0 p-6 flex gap-2 overflow-x-auto z-10">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-teal-400 shadow-lg scale-105'
                      : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={(() => {
                      if (!img.image_data) return img.url || '';
                      let imageData = img.image_data;
                      if (typeof imageData === 'string') {
                        return `data:image/jpeg;base64,${imageData}`;
                      } else if (imageData.data && Array.isArray(imageData.data)) {
                        const binaryString = String.fromCharCode.apply(null, imageData.data);
                        const base64 = btoa(binaryString);
                        return `data:image/jpeg;base64,${base64}`;
                      }
                      return '';
                    })()}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* LEFT COLUMN - INFO */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header Section */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                    {displayPkg.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                      <FiMapPin size={20} />
                      {displayPkg.destination}
                    </div>
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold">
                      <FiCalendar size={20} />
                      {displayPkg.duration_days} {t('packageDetail.header.days')}
                    </div>
                  </div>
                </div>

                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                  {displayPkg.short_desc}
                </p>
              </div>

              {/* Highlights Card */}
              {displayPkg.highlights && displayPkg.highlights.length > 0 && (
                <div className="bg-gradient-to-r from-teal-50 to-teal-50 dark:from-teal-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('packageDetail.highlights')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {displayPkg.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <FiChevronRight size={18} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="space-y-4">
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                  {['overview', 'inclusions', 'reviews'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                        activeTab === tab
                          ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400'
                          : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {t(`packageDetail.tabs.${tab}`)}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {displayPkg.long_desc && (
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('packageDetail.aboutThisTrip')}</h4>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                            {displayPkg.long_desc}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'inclusions' && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                          <FiCheckCircle size={24} /> {t('packageDetail.inclusions.included')}
                        </h4>
                        <ul className="space-y-3">
                          {displayPkg.inclusions?.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                              <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                          <FiXCircle size={24} /> {t('packageDetail.inclusions.notIncluded')}
                        </h4>
                        <ul className="space-y-3">
                          {displayPkg.exclusions?.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                              <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✕</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {/* Add Review Section */}
                      {isAuthenticated && (
                        <div className="bg-gradient-to-r from-teal-50 to-teal-50 dark:from-teal-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Share Your Experience</h4>
                            <button
                              onClick={() => setShowReviewForm(!showReviewForm)}
                              disabled={!userBooking}
                              className={`px-4 py-2 text-white rounded-lg transition text-sm font-semibold ${
                                !userBooking
                                  ? 'bg-slate-400 cursor-not-allowed opacity-50'
                                  : 'bg-teal-600 hover:bg-teal-700'
                              }`}
                            >
                              {showReviewForm ? '✕ Cancel' : '+ Add Review'}
                            </button>
                          </div>

                          {/* Alert if user hasn't completed trip or booking is cancelled */}
                          {userBooking && userBooking.status !== 'completed' && (
                            <div className={`mb-4 p-4 border rounded-lg flex items-start gap-3 ${
                              userBooking.status === 'cancelled'
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                            }`}>
                              <FiAlertCircle size={20} className={`flex-shrink-0 mt-0.5 ${
                                userBooking.status === 'cancelled'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`} />
                              <div className="flex-1">
                                {userBooking.status === 'cancelled' ? (
                                  <>
                                    <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                                      Your booking was cancelled
                                    </p>
                                    <p className="text-xs text-red-800 dark:text-red-300 mb-3">
                                      You can still leave a review to share your feedback about this trip.
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
                                      Mark your trip as completed to leave a review
                                    </p>
                                    <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
                                      Your booking status is: <strong>{userBooking.status}</strong>
                                    </p>
                                    <button
                                      onClick={handleCompleteTrip}
                                      disabled={completingTrip}
                                      className={`px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all ${
                                        completingTrip
                                          ? 'bg-slate-400 cursor-not-allowed'
                                          : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
                                      }`}
                                    >
                                      {completingTrip ? '⏳ Processing...' : '✓ Mark Trip Complete'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {showReviewForm && userBooking && (
                            <div className="space-y-4 mt-4 pt-4 border-t border-teal-200 dark:border-teal-700">
                              {/* Rating Selection */}
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Rating * {hoverRating > 0 && <span className="text-yellow-500">({['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating]})</span>}</label>
                                <div className="flex gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      onClick={() => setReviewRating(star)}
                                      onMouseEnter={() => setHoverRating(star)}
                                      onMouseLeave={() => setHoverRating(0)}
                                      className="transition-all duration-200 transform hover:scale-125 active:scale-95"
                                    >
                                      <FiStar
                                        size={40}
                                        className={`transition-all duration-200 ${
                                          star <= (hoverRating || reviewRating)
                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                            : 'text-slate-300 dark:text-slate-600'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                                {reviewRating > 0 && (
                                  <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                                    <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">
                                      Your rating: <span className="text-lg text-yellow-500">{reviewRating}/5 - {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}</span>
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Comment */}
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                  Your Comment * <span className={reviewComment.trim().length >= 10 ? 'text-green-600' : 'text-slate-500'}>(min 10 characters)</span>
                                </label>
                                <textarea
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  placeholder="Share your experience with this trip... 💭"
                                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none ${
                                    reviewComment.trim().length >= 10
                                      ? 'border-green-500 focus:ring-2 focus:ring-green-400'
                                      : 'border-slate-300 dark:border-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-400'
                                  }`}
                                  rows="4"
                                />
                                <div className="flex justify-between items-center mt-2">
                                  <p className={`text-xs font-semibold ${
                                    reviewComment.length > 500
                                      ? 'text-red-600'
                                      : reviewComment.trim().length >= 10
                                      ? 'text-green-600'
                                      : 'text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {reviewComment.length}/500 characters
                                  </p>
                                  {reviewComment.trim().length >= 10 && (
                                    <span className="text-xs text-green-600 font-semibold">✓ Ready to submit</span>
                                  )}
                                </div>
                              </div>

                              {/* Submit Button */}
                              <button
                                onClick={handleSubmitReview}
                                disabled={submitReviewLoading || reviewRating === 0 || reviewComment.trim().length < 10}
                                className={`w-full px-6 py-4 rounded-lg font-bold text-white transition-all duration-200 transform ${
                                  submitReviewLoading
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : reviewRating === 0 || reviewComment.trim().length < 10
                                    ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:scale-95 shadow-lg hover:shadow-xl'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  {submitReviewLoading ? (
                                    <>
                                      <span className="animate-spin">⏳</span>
                                      <span>Submitting...</span>
                                    </>
                                  ) : reviewRating === 0 || reviewComment.trim().length < 10 ? (
                                    <>
                                      <span>🔒</span>
                                      <span>Complete the form above</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>✨</span>
                                      <span>Submit Review</span>
                                    </>
                                  )}
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reviews List */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                          Reviews ({reviews.length})
                        </h4>
                        
                        {reviewsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Spinner size="sm" />
                            <span className="ml-2 text-slate-600 dark:text-slate-400">Loading reviews...</span>
                          </div>
                        ) : reviews && reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.map((review, idx) => (
                              <div key={idx} className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-5 border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                        {(review.user?.name || 'A')[0]}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-bold text-slate-900 dark:text-white">{review.user?.name || 'Anonymous'}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {new Date(review.created_at).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Rating Stars */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                          <FiStar
                                            key={i}
                                            size={16}
                                            className={i < Math.floor(review.rating || 0) ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-300'}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{review.rating}/5</span>
                                      {review.approved ? (
                                        <span className="ml-auto px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-semibold">✓ Verified</span>
                                      ) : (
                                        <span className="ml-auto px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full font-semibold">⏳ Pending</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Comment */}
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{review.comment}"</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold mb-2">
                              No reviews yet
                            </p>
                            <p className="text-slate-500 dark:text-slate-500 text-sm">
                              Be the first to share your experience with this trip!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Itinerary */}
              <ItineraryDetails
                itineraries={itineraries}
                loading={itineraryLoading}
              />
            </div>

            {/* RIGHT COLUMN - BOOKING */}
            <BookingPanel
              pkg={displayPkg}
              persons={persons}
              onPersonsChange={setPersons}
              selectedRoomType={selectedRoomType}
              onSelectRoomType={setSelectedRoomType}
              selectedExtras={selectedExtras}
              onToggleExtra={(extra) => {
                setSelectedExtras(prev =>
                  prev.some(e => e.id === extra.id)
                    ? prev.filter(e => e.id !== extra.id)
                    : [...prev, extra]
                );
              }}
              priceBreakdown={priceBreakdown}
              onBookNow={handleBookNow}
              isBookingLoading={bookingLoading}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PackageDetailPage;
