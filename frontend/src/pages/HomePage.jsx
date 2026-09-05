import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInstantTranslation } from '../hooks/useInstantTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useInViewCounter } from '../hooks/useInViewCounter';
import { Reveal, StaggerGroup, StaggerItem } from '../components/motion/Reveal';
import { MainLayout } from '../components/layout';
import { Card, Button, Badge, Spinner } from '../components/common';
import AdvancedImageSlider from '../components/sections/AdvancedImageSlider';
import PopularTripCategoriesSection from '../components/sections/PopularTripCategoriesSection';
import { useWishlistContext } from '../hooks/useWishlistContext';
import { packagesService, reviewsService } from '../services';
import { placeholderService } from '../services/placeholderService';
import { convertImageDataToUrl } from '../utils/imageCompression';
import searchHistoryManager from '../utils/searchHistory';
import {
  FiSearch,
  FiArrowRight,
  FiMapPin,
  FiCalendar,
  FiStar,
  FiUsers,
  FiThumbsUp,
  FiTrendingUp,
  FiChevronRight,
  FiChevronLeft,
  FiPlay,
} from 'react-icons/fi';
import { BiWorld, BiTrendingUp } from 'react-icons/bi';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useInstantTranslation();
  const { languageChangeCounter } = useLanguage(); // Track language changes

  // Hero slides - استخدام state بدلاً من useMemo
  const [heroSlides, setHeroSlides] = useState([]);

  // States
  const [heroSlide, setHeroSlide] = useState(0);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const suggestionsTimeoutRef = useRef(null);

  const [topReviews, setTopReviews] = useState([]);
  const [reviewsFetched, setReviewsFetched] = useState(false);

  const autoSlideRef = useRef(null);
  const fetchedDataRef = useRef(false);

  // Force re-render when language changes via context
  useEffect(() => {
    console.log(`🌍 [HomePage] Language change detected via context, counter: ${languageChangeCounter}`);
    // This hook triggers whenever languageChangeCounter changes
    // which will cause the component to re-render all dependent state
  }, [languageChangeCounter]);

  // تحديث Hero Slides عند تغيير اللغة - استخدام i18n.language كـ dependency
  useEffect(() => {
    setHeroSlides([
      {
        title: t('home.title'),
        subtitle: t('home.subtitle'),
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=700&fit=crop&q=75&auto=format',
        color: 'from-teal-600 to-orange-600',
      },
      {
        title: t('home.title'),
        subtitle: t('home.subtitle'),
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=700&fit=crop&q=75&auto=format',
        color: 'from-teal-500 to-teal-600',
      },
      {
        title: t('home.becomeGuide'),
        subtitle: t('home.becomeGuideDesc'),
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=700&fit=crop&q=75&auto=format',
        color: 'from-green-500 to-teal-600',
      },
    ]);
    setHeroSlide(0); // Reset to first slide
  }, [i18n.language, t]);

  // Fetch featured packages
  useEffect(() => {
    if (fetchedDataRef.current) return; // Prevent double fetching

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔄 [HomePage] Fetching featured packages...');
        const response = await packagesService.getFeaturedPackages(8);
        console.log('📦 [HomePage] Featured packages response:', response);
        
        // Handle both direct array and response object with data property
        let packages = [];
        if (response?.data) {
          packages = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          packages = response;
        } else if (response?.packages) {
          packages = Array.isArray(response.packages) ? response.packages : [response.packages];
        }

        console.log('✅ HomePage - Processed packages:', packages.length);
        
        // Debug: Log first package structure with translation fields
        if (packages.length > 0) {
          const firstPkg = packages[0];
          console.log('🔍 First package keys:', Object.keys(firstPkg).sort());
          console.log('📦 First package base:', {
            id: firstPkg.id,
            title: firstPkg.title,
            destination: firstPkg.destination,
            duration_days: firstPkg.duration_days,
            base_price: firstPkg.base_price,
          });
          console.log('🌍 Translation fields check:');
          console.log('   en_name:', firstPkg.en_name ? `✅ "${firstPkg.en_name}"` : '❌ empty/null');
          console.log('   es_name:', firstPkg.es_name ? `✅ "${firstPkg.es_name}"` : '❌ empty/null');
          console.log('   ar_name:', firstPkg.ar_name ? `✅ "${firstPkg.ar_name}"` : '❌ empty/null');
          console.log('   de_name:', firstPkg.de_name ? `✅ "${firstPkg.de_name}"` : '❌ empty/null');
          console.log('   ru_name:', firstPkg.ru_name ? `✅ "${firstPkg.ru_name}"` : '❌ empty/null');
          console.log('📚 Translations array:', firstPkg.translations?.length ? `${firstPkg.translations.length} items` : 'empty/null');
        }
        
        setFeaturedPackages(packages);
        fetchedDataRef.current = true;
      } catch (error) {
        console.error('HomePage Error fetching featured packages:', error);
        setFeaturedPackages([]);
        fetchedDataRef.current = true;
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only fetch once on mount

  // Re-render when language changes to update translations
  // This effect triggers when i18n.language changes and will cause useMemo to recalculate
  useEffect(() => {
    console.log(`✅ HomePage Language changed to: ${i18n.language}`);
    // The translatedFeaturedPackages useMemo will automatically recalculate 
    // because i18n.language is in its dependency array
  }, [i18n.language]);

  // Fetch top reviews from database
  useEffect(() => {
    if (!reviewsFetched && featuredPackages && featuredPackages.length > 0) {
      const fetchTopReviews = async () => {
        try {
          setReviewsLoading(true);
          
          // Fetch reviews for the first few packages in parallel instead of
          // one-request-at-a-time - each request is an independent round trip,
          // so awaiting them sequentially only added latency for no reason.
          const packagesToQuery = featuredPackages.slice(0, 3);
          const reviewsByPackage = await Promise.all(
            packagesToQuery.map(async (pkg) => {
              try {
                const pkgReviews = await reviewsService.getPackageReviews(pkg.id, {
                  limit: 3,
                  offset: 0
                });

                const reviewsList = pkgReviews?.data
                  ? pkgReviews.data
                  : (Array.isArray(pkgReviews) ? pkgReviews : []);

                return Array.isArray(reviewsList) ? reviewsList : [];
              } catch (err) {
                console.log(`Could not fetch reviews for package ${pkg.id}:`, err.message);
                return [];
              }
            })
          );

          const allReviews = reviewsByPackage.flat();
          
          setTopReviews(allReviews.slice(0, 6));
          setReviewsFetched(true);
        } catch (err) {
          console.error('Failed to load reviews:', err);
          setTopReviews([]);
          setReviewsFetched(true);
        } finally {
          setReviewsLoading(false);
        }
      };
      
      fetchTopReviews();
    }
  }, [featuredPackages, reviewsFetched]);

  // Hero auto-slider
  useEffect(() => {
    if (heroSlides.length === 0) return;
    
    const startAutoSlide = () => {
      autoSlideRef.current = setInterval(() => {
        setHeroSlide((prev) => (prev + 1) % heroSlides.length);
      }, 6000);
    };
    startAutoSlide();
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [heroSlides.length]);

  // Destination suggestions search with debounce
  useEffect(() => {
    if (suggestionsTimeoutRef.current) clearTimeout(suggestionsTimeoutRef.current);

    if (searchQuery.trim().length > 1) {
      setSuggestionsLoading(true);
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await packagesService.getDestinationSuggestions(searchQuery);
          
          // suggestions هو مصفوفة مباشرة من الـ service
          if (Array.isArray(suggestions)) {
            setDestinationSuggestions(suggestions.slice(0, 8));
          } else {
            setDestinationSuggestions([]);
          }
        } catch (err) {
          console.error('HomePage Error fetching suggestions:', err);
          setDestinationSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 300); // 300ms debounce
    } else {
      setDestinationSuggestions([]);
      setSuggestionsLoading(false);
    }

    return () => {
      if (suggestionsTimeoutRef.current) clearTimeout(suggestionsTimeoutRef.current);
    };
  }, [searchQuery]);

  // Statistics counters now animate on scroll-into-view (see statsRef below),
  // not immediately on page load - this is handled by useInViewCounter.
  const statsTargets = useMemo(() => ({ travelers: 25000, destinations: 850, satisfaction: 98 }), []);
  const [statsRef, counters] = useInViewCounter(statsTargets);

  // Load recent searches
  useEffect(() => {
    const recent = searchHistoryManager.getRecent(4);
    setRecentSearches(recent);
  }, []);

  const tourTypes = [
    { id: 'all', label: t('navbar.allTrips'), icon: '🌍' },
    { id: 'adventure', label: t('navbar.adventure'), icon: '⛰️' },
    { id: 'beach', label: t('navbar.beach'), icon: '🏖️' },
    { id: 'cultural', label: t('navbar.cultural'), icon: '🏛️' },
    { id: 'luxury', label: t('navbar.luxury'), icon: '👑' },
  ];

  const stats = useMemo(() => [
    { icon: FiUsers, label: 'Happy Travelers', value: counters.travelers, suffix: '+' },
    { icon: FiMapPin, label: 'Destinations', value: counters.destinations, suffix: '+' },
    { icon: FiThumbsUp, label: 'Satisfaction', value: counters.satisfaction, suffix: '%' },
  ], [counters]);

  const testimonials = [
    {
      name: 'Sarah Mohamed',
      role: 'Traveler',
      comment: 'Amazing experience! Professional team and excellent service throughout my journey.',
      rating: 5,
      avatar: 'SM',
    },
    {
      name: 'Ahmed Ali',
      role: 'Adventure Lover',
      comment: 'Best booking platform! Competitive prices and incredible destinations.',
      rating: 5,
      avatar: 'AA',
    },
    {
      name: 'Emma Johnson',
      role: 'Family Traveler',
      comment: 'High-quality service with family-friendly options. Highly recommended!',
      rating: 5,
      avatar: 'EJ',
    },
  ];

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedType !== 'all') {
      // Add to search history
      if (searchQuery.trim()) {
        searchHistoryManager.addSearch(searchQuery);
      }
      
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery);
      if (selectedType !== 'all') params.append('type', selectedType);
      navigate(`/search?${params.toString()}`);
    }
  }, [searchQuery, selectedType, navigate]);

  // Memoize translated packages to avoid re-creating on every render
  // CRITICAL FIX: Use only i18n.language (not i18n object) and languageChangeCounter for dependencies
  // This ensures the useMemo recalculates when language actually changes
  const translatedFeaturedPackages = useMemo(() => {
    console.log(`🔄 [useMemo] Retranslating packages for language: ${i18n.language}`);
    
    return featuredPackages.map(pkg => {
      if (!pkg) return pkg;
      
      const currentLang = i18n.language || 'en';
      
      let display_title = pkg.title || 'Untitled Package';
      let display_short_desc = pkg.short_desc || '';
      let display_long_desc = pkg.long_desc || '';
      let display_whats_included = pkg.inclusions?.join(', ') || '';
      let display_daily_itinerary = '';
      
      // Check for language-specific columns
      const langNameField = `${currentLang}_name`;
      const langShortDescField = `${currentLang}_short_description`;
      const langLongDescField = `${currentLang}_detailed_description`;
      const langIncludedField = `${currentLang}_whats_included`;
      const langIncludedItemsField = `${currentLang}_whats_included_items`;
      const langDailyItineraryField = `${currentLang}_daily_itinerary`;
      
      // IMPORTANT: If translation is missing, fallback to English
      const fallbackLangNameField = `en_name`;
      const fallbackLangShortDescField = `en_short_description`;
      const fallbackLangLongDescField = `en_detailed_description`;
      const fallbackLangIncludedField = `en_whats_included`;
      const fallbackLangIncludedItemsField = `en_whats_included_items`;
      const fallbackLangDailyItineraryField = `en_daily_itinerary`;
      
      if (pkg[langNameField] || pkg[langShortDescField] || pkg[langLongDescField]) {
        display_title = pkg[langNameField] || pkg[fallbackLangNameField] || pkg.title;
        display_short_desc = pkg[langShortDescField] || pkg[fallbackLangShortDescField] || pkg.short_desc || '';
        display_long_desc = pkg[langLongDescField] || pkg[fallbackLangLongDescField] || pkg.long_desc || '';
        
        if (Array.isArray(pkg[langIncludedItemsField])) {
          display_whats_included = pkg[langIncludedItemsField].join(', ');
        } else if (pkg[langIncludedField]) {
          display_whats_included = pkg[langIncludedField];
        } else if (Array.isArray(pkg[fallbackLangIncludedItemsField])) {
          display_whats_included = pkg[fallbackLangIncludedItemsField].join(', ');
        } else if (pkg[fallbackLangIncludedField]) {
          display_whats_included = pkg[fallbackLangIncludedField];
        }
        
        display_daily_itinerary = pkg[langDailyItineraryField] || pkg[fallbackLangDailyItineraryField] || '';
      } else {
        // If all language fields are empty, use English as main source
        display_title = pkg[fallbackLangNameField] || pkg.title;
        display_short_desc = pkg[fallbackLangShortDescField] || pkg.short_desc || '';
        display_long_desc = pkg[fallbackLangLongDescField] || pkg.long_desc || '';
        
        if (Array.isArray(pkg[fallbackLangIncludedItemsField])) {
          display_whats_included = pkg[fallbackLangIncludedItemsField].join(', ');
        } else if (pkg[fallbackLangIncludedField]) {
          display_whats_included = pkg[fallbackLangIncludedField];
        } else if (pkg.inclusions) {
          display_whats_included = Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : '';
        }
        
        display_daily_itinerary = pkg[fallbackLangDailyItineraryField] || '';
      }
      
      return {
        ...pkg,
        display_title,
        display_short_desc,
        display_long_desc,
        display_whats_included,
        display_daily_itinerary,
      };
    });
  }, [featuredPackages, i18n.language]);

  const nextSlide = useCallback(() => {
    if (heroSlides.length === 0) return;
    setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    if (heroSlides.length === 0) return;
    setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[heroSlide] || {
    title: t('home.title') || 'Explore the World',
    subtitle: t('home.subtitle') || 'Discover amazing destinations and create unforgettable memories',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=700&fit=crop',
    color: 'from-teal-600 to-orange-600',
  };

  // Hero parallax: background drifts slower than scroll, content fades out
  // slightly faster - the classic layered-depth effect used on Airbnb-style
  // hero sections.
  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(heroScrollProgress, [0, 1], ['0%', '18%']);
  const heroContentOpacity = useTransform(heroScrollProgress, [0, 0.7], [1, 0]);
  const heroContentY = useTransform(heroScrollProgress, [0, 1], ['0%', '12%']);

  return (
    <MainLayout key={`home-${i18n.language}`}>
      {/* ==================== HERO SLIDER ==================== */}
      <section
        ref={heroRef}
        key={`hero-${i18n.language}`}
        className="relative w-full bg-slate-900 dark:bg-slate-950 overflow-hidden"
        style={{ minHeight: 'clamp(400px, 60vh, 600px)' }}
      >
        {/* Background Images Slider - parallax layer */}
        <motion.div className="absolute inset-0 w-full h-[120%]" style={{ y: heroImageY }}>
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === heroSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                decoding={idx === 0 ? 'sync' : 'async'}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            </div>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ opacity: heroContentOpacity, y: heroContentY, gap: 'clamp(1rem, 5vw, 3rem)' }}
          className="relative z-10 w-full px-3 sm:px-4 md:px-6 lg:px-8 h-full flex flex-col justify-between py-6 sm:py-8 md:py-12 lg:py-16"
        >
          {/* Top Content */}
          <div className="max-w-7xl mx-auto w-full flex-shrink-0">
            <div className="max-w-2xl pr-24 sm:pr-28 md:pr-0">
              {/* Title + Subtitle - cross-fade/slide between slides */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`hero-copy-${heroSlide}-${i18n.language}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 leading-tight">
                    {currentSlide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-lg leading-relaxed">
                    {currentSlide.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-row flex-wrap gap-3 sm:gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/search')}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 xs:px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2.5 group transition-all shadow-lg shadow-teal-600/30 hover:shadow-xl text-sm xs:text-base flex-1 xs:flex-initial"
                >
                  <FiSearch size={16} className="flex-shrink-0" />
                  <span>Explore Now</span>
                </Button>

                <Button
                  size="lg"
                  onClick={() => {
                    document.querySelector('.featured-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white font-semibold px-4 xs:px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2.5 group transition-all text-sm xs:text-base flex-1 xs:flex-initial"
                >
                  <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  <span>Discover</span>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Search Bar - Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto w-full flex-shrink-0"
          >
            <form onSubmit={handleSearch} className="bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-[0_20px_45px_-15px_rgba(0,0,0,0.35)] p-4 sm:p-5 md:p-6 lg:p-8 backdrop-blur-xl border border-white/50 dark:border-slate-700/40">
              <div className="space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-3 lg:gap-5">
                {/* Destination Input with Autocomplete */}
                <div className="md:col-span-5 relative">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 xs:mb-2.5 sm:mb-3 uppercase tracking-wide">
                    {t('navbar.destination')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder={t('navbar.searchPlaceholder')}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-sm xs:text-base"
                    />
                    
                    {/* Autocomplete Suggestions Dropdown */}
                    {showSuggestions && (searchQuery.trim().length > 1) && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                        {suggestionsLoading ? (
                          <div className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                            <span className="inline-block animate-spin">↻</span> {t('navbar.searching')}
                          </div>
                        ) : destinationSuggestions.length > 0 ? (
                          <>
                            {destinationSuggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  // Check if suggestion has packageId (new format) or is just a string (old format)
                                  if (suggestion?.packageId) {
                                    // New format: navigate directly to package details
                                    searchHistoryManager.addSearch(suggestion.destination || suggestion.title);
                                    setShowSuggestions(false);
                                    setSearchQuery('');
                                    navigate(`/package/${suggestion.packageId}`);
                                  } else if (typeof suggestion === 'string') {
                                    // Old format: navigate to search page (for backward compatibility)
                                    searchHistoryManager.addSearch(suggestion);
                                    const params = new URLSearchParams();
                                    params.append('q', suggestion);
                                    if (selectedType && selectedType !== 'all') {
                                      params.append('type', selectedType);
                                    }
                                    setShowSuggestions(false);
                                    setSearchQuery('');
                                    navigate(`/search?${params.toString()}`);
                                  }
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700 last:border-b-0 text-slate-900 dark:text-white cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <FiMapPin size={16} className="text-teal-500 flex-shrink-0" />
                                  <div className="flex-1">
                                    <span className="font-medium block">
                                      {suggestion?.destination || suggestion?.title || suggestion}
                                    </span>
                                    {suggestion?.title && suggestion?.title !== (suggestion?.destination || suggestion?.title) && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {suggestion.title}
                                      </span>
                                    )}
                                  </div>
                                  {suggestion?.packageId && (
                                    <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-2 py-1 rounded flex-shrink-0">
                                      Direct Link
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                            {t('navbar.noDestinationsFound')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tour Type Select */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 xs:mb-2.5 sm:mb-3 uppercase tracking-wide">
                    {t('navbar.tourType')}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer transition-all font-medium text-sm xs:text-base"
                  >
                    {tourTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="md:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 xs:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 text-white font-bold rounded-full flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:scale-105 group shadow-lg text-sm xs:text-base"
                  >
                    <FiSearch size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">{t('navbar.search')}</span>
                  </button>
                </div>
              </div>

              {/* Quick Tags */}
              <div className="mt-4 xs:mt-5 sm:mt-6 pt-4 xs:pt-5 sm:pt-6 border-t-2 border-slate-300 dark:border-slate-700/50">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 xs:mb-3 uppercase tracking-wide">{t('navbar.quickSelect')}</p>
                <div className="flex flex-wrap gap-2 xs:gap-2.5 sm:gap-3">
                  {tourTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`px-3 xs:px-4 py-2 xs:py-2.5 rounded-full text-xs xs:text-sm font-semibold transition-all backdrop-blur-lg whitespace-nowrap ${
                        selectedType === type.id
                          ? 'bg-teal-600 text-white shadow-lg scale-105'
                          : 'bg-white/60 dark:bg-slate-700/60 text-slate-900 dark:text-white hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/50 dark:border-slate-600/50'
                      }`}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches && recentSearches.length > 0 && (
                <div className="mt-4 xs:mt-5 sm:mt-6 pt-4 xs:pt-5 sm:pt-6 border-t-2 border-slate-300 dark:border-slate-700/50">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 xs:mb-3 uppercase tracking-wide">{t('navbar.recentSearches')}</p>
                  <div className="flex flex-wrap gap-2 xs:gap-2.5">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          // Add to search history
                          searchHistoryManager.addSearch(search.query);
                          // Navigate to search page with the query
                          const params = new URLSearchParams();
                          params.append('q', search.query);
                          if (selectedType !== 'all') params.append('type', selectedType);
                          navigate(`/search?${params.toString()}`);
                        }}
                        className="px-3 py-2 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-600 flex items-center gap-1.5"
                      >
                        <FiMapPin size={12} />
                        {search.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>

        {/* Navigation Dots - Bottom Left */}
        <div className="absolute bottom-20 md:bottom-24 left-4 sm:left-6 md:left-8 z-20 flex gap-2.5 pointer-events-auto">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setHeroSlide(idx);
                if (autoSlideRef.current) clearInterval(autoSlideRef.current);
              }}
              className={`transition-all duration-300 rounded-full backdrop-blur-lg ${
                idx === heroSlide
                  ? 'w-10 h-2.5 bg-white shadow-lg'
                  : 'w-2.5 h-2.5 bg-white/60 hover:bg-white/80 shadow-md'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>

        {/* Navigation Arrows - Right Side */}
        <div className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 md:gap-4 pointer-events-auto">
          <button
            onClick={prevSlide}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-lg border-2 border-white/50 flex items-center justify-center text-white transition-all hover:shadow-2xl group shadow-lg"
            aria-label="Previous slide"
          >
            <FiChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-lg border-2 border-white/50 flex items-center justify-center text-white transition-all hover:shadow-2xl group shadow-lg"
            aria-label="Next slide"
          >
            <FiChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Slide Counter - Top Right */}
        <div className="absolute top-6 right-4 sm:right-6 md:top-8 md:right-8 z-20 pointer-events-auto">
          <div className="px-4 py-2.5 bg-white/30 backdrop-blur-lg border-2 border-white/50 rounded-full text-white text-sm font-bold shadow-lg">
            {heroSlides && heroSlides.length > 0 ? (
              <>
                {String((heroSlide || 0) + 1).padStart(2, '0')} / {String(heroSlides.length || 3).padStart(2, '0')}
              </>
            ) : (
              '01 / 03'
            )}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PACKAGES ==================== */}
      <section key={`featured-${i18n.language}`} className="featured-section w-full py-6 sm:py-8 md:py-12 lg:py-24 bg-white dark:bg-slate-950" style={{ display: 'block', visibility: 'visible', minHeight: '200px' }}>
        <div className="w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <Reveal className="text-center mb-10 md:mb-12 space-y-3 md:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-50 dark:bg-teal-900/30 border border-teal-200/60 dark:border-teal-800/60 rounded-full text-teal-700 dark:text-teal-400 text-xs md:text-sm font-semibold justify-center">
              <BiTrendingUp size={14} />
              <span>{t('home.trendingTrips') || 'Trending Trips'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              {t('home.handpickedTrips') || 'Handpicked Premium Trips'}
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('home.handpickedDescription') || 'Explore our curated collection of the best travel experiences'}
            </p>
          </Reveal>

          {/* Loading / Packages */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : featuredPackages.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <BiWorld size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">No trips available at the moment</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">Check back soon for new travel packages!</p>
            </div>
          ) : (
            <>
              <StaggerGroup key={`grid-${i18n.language}`} className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {translatedFeaturedPackages.map((translatedPkg, idx) => {
                  const pkg = featuredPackages[idx];
                  return (
                    <StaggerItem key={`${pkg.id}-${i18n.language}`}>
                    <Card
                      className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/60 hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col h-full"
                      onClick={() => navigate(`/package/${pkg.id}`)}
                    >
                      {/* Image */}
                      <div className="relative h-36 xs:h-44 sm:h-52 md:h-56 bg-gradient-to-br from-teal-400 to-orange-500 overflow-hidden group">
                        {pkg.images && pkg.images.length > 0 && (pkg.images[0]?.image_data || pkg.images[0]?.url) ? (
                          <>
                            {pkg.images[0]?.image_data && (
                              <img
                                src={convertImageDataToUrl(pkg.images[0].image_data)}
                                alt={translatedPkg.display_title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            {pkg.images[0]?.url && (
                              <img
                                src={pkg.images[0].url}
                                alt={translatedPkg.display_title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <img
                            src={placeholderService.getDestinationPlaceholder(pkg.destination)}
                            alt={translatedPkg.display_title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {/* Bottom gradient for legibility */}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        {/* Top gradient so badges stay legible on light images */}
                        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

                        {/* Badges */}
                        <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 dark:bg-slate-900/90 rounded-full text-xs font-bold text-slate-800 dark:text-white shadow-sm line-clamp-1">
                          {pkg.destination}
                        </div>
                        {pkg.average_rating !== undefined && pkg.average_rating !== null && pkg.average_rating > 0 && (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/80 dark:to-yellow-900/80 rounded-full backdrop-blur-sm shadow-md border border-amber-200/60 dark:border-amber-700/60">
                            <FiStar size={16} className="fill-amber-500 text-amber-500 drop-shadow-md" />
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{parseFloat(pkg.average_rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 xs:p-3.5 sm:p-4 md:p-5 flex flex-col flex-1 gap-3">
                        <h3 className="font-bold text-xs xs:text-sm sm:text-base md:text-lg text-slate-900 dark:text-white line-clamp-2 min-h-[2.5em] group-hover:text-teal-600 transition-colors" title={translatedPkg.display_title}>
                          {translatedPkg.display_title}
                        </h3>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-xs xs:text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar size={15} className="text-teal-500 flex-shrink-0" />
                            <span>{pkg.duration_days} {t('common.days') || 'Days'}</span>
                          </div>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FiMapPin size={15} className="text-teal-500 flex-shrink-0" />
                            <span className="truncate">{pkg.destination}</span>
                          </div>
                        </div>

                        {/* Spacer pushes rating + price + CTA to the bottom, keeping cards aligned */}
                        <div className="flex-1" />

                        {/* Rating - Gold Stars Display */}
                        {pkg.average_rating !== undefined && pkg.average_rating !== null && parseFloat(pkg.average_rating) > 0 ? (
                          <div className="flex gap-1 items-center justify-start">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => {
                                const rating = parseFloat(pkg.average_rating) || 0;
                                const ratingFloor = Math.floor(rating);
                                return (
                                  <FiStar
                                    key={i}
                                    size={16}
                                    className={
                                      i < ratingFloor
                                        ? 'fill-amber-400 text-amber-400'
                                        : i === ratingFloor && rating % 1 >= 0.5
                                        ? 'fill-amber-300 text-amber-300 opacity-75'
                                        : 'text-slate-300 dark:text-slate-600'
                                    }
                                  />
                                );
                              })}
                            </div>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1.5">
                              {parseFloat(pkg.average_rating).toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                            <FiStar size={14} className="text-slate-300 dark:text-slate-600" />
                            <span>{t('common.noRatings') || 'No ratings yet'}</span>
                          </div>
                        )}

                        {/* Price + CTA */}
                        <div className="flex justify-between items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('common.from') || 'From'}</p>
                            <p className="text-lg xs:text-xl md:text-2xl font-bold text-teal-600 dark:text-teal-400 truncate">
                              {pkg.base_price && pkg.base_price > 0
                                ? `$${(parseFloat(pkg.base_price) || 0).toFixed(2)}`
                                : <span className="text-orange-500 text-sm">Price Not Set</span>
                              }
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 rounded-full w-9 h-9 xs:w-10 xs:h-10 flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-600/30 group-hover:shadow-md group-hover:shadow-teal-600/40 transition-shadow"
                          >
                            <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>

              {/* View All */}
              <Reveal className="text-center mt-12">
                <Button
                  size="lg"
                  onClick={() => navigate('/search')}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 md:px-10 py-3 rounded-full group transition-all inline-flex items-center gap-2 font-bold shadow-sm hover:shadow-md"
                >
                  <span>Explore All Packages</span>
                  <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Reveal>
            </>
          )}
        </div>
      </section>

      {/* ==================== CATEGORIES SECTION ==================== */}
      <Reveal y={32}>
        <PopularTripCategoriesSection />
      </Reveal>

      {/* ==================== STATISTICS ==================== */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-20 bg-gradient-to-r from-emerald-600 via-amber-600 to-pink-600 dark:from-emerald-900 dark:via-amber-900 dark:to-pink-900" style={{ display: 'block', visibility: 'visible', minHeight: '150px' }}>
        <div ref={statsRef} className="w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8" staggerDelay={0.15}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <StaggerItem key={idx} className="text-center">
                  <div className="mb-2 sm:mb-3 md:mb-4 flex justify-center">
                    <Icon size={24} className="xs:w-8 xs:h-8 sm:w-9 sm:h-9 text-white" />
                  </div>
                  <p className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white mb-1 md:mb-2">
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </p>
                  <p className="text-xs xs:text-sm md:text-base lg:text-lg text-white/90 font-semibold">{stat.label}</p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ==================== REVIEWS SECTION FROM DATABASE ==================== */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-24 bg-white dark:bg-slate-950" style={{ display: 'block', visibility: 'visible', minHeight: '200px' }}>
        <div className="w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <Reveal className="text-center mb-12 md:mb-16 space-y-3 md:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-50 dark:bg-teal-900/30 border border-teal-200/60 dark:border-teal-800/60 rounded-full text-teal-700 dark:text-teal-400 text-xs md:text-sm font-semibold justify-center">
              <FiThumbsUp size={14} />
              <span>{t('home.trendingTrips') || 'Traveler Reviews'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              {t('home.travelerReviews') || 'Real Feedback From Our Community'}
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('home.reviewsDescription') || 'See what travelers from around the world think about our trips'}
            </p>
          </Reveal>

          {/* Reviews Grid */}
          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : topReviews && topReviews.length > 0 ? (
            <>
              <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {topReviews.map((review, idx) => {
                  const initials = review.user?.full_name 
                    ? review.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : review.user?.username?.substring(0, 2).toUpperCase() || 'U';
                  
                  return (
                    <StaggerItem key={review.id || idx}>
                    <Card
                      className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                    >
                      <div className="p-5 md:p-6 space-y-4 h-full flex flex-col">
                        {/* Rating Stars */}
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i} 
                              size={16} 
                              className={`${
                                i < (review.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Review Comment */}
                        <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed flex-grow line-clamp-4">
                          {review.comment || review.text}
                        </p>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>

                        {/* Author */}
                        <div className="flex items-center gap-3 pt-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                              {review.user?.full_name || review.user?.username || 'Traveler'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(review.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>

              {/* View All Reviews Button */}
              <div className="text-center mt-12">
                <Button
                  size="lg"
                  onClick={() => navigate('/search')}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 md:px-10 py-3 rounded-full group transition-all inline-flex items-center gap-2 font-bold shadow-sm hover:shadow-md"
                >
                  <span>View All Reviews</span>
                  <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BiWorld size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">No reviews available yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </section>

      {/* ==================== TESTIMONIALS - MODERN DESIGN ==================== */}
      <section className="py-6 sm:py-8 md:py-16 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 relative" style={{ display: 'block', visibility: 'visible', minHeight: '200px' }}>
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 dark:opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 dark:opacity-10"></div>

        <div className="w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <Reveal>
          <div className="text-center mb-12 md:mb-20 space-y-3 md:space-y-4">
            <div className="inline-block">
              <Badge className="bg-gradient-to-r from-orange-200 to-teal-200 dark:from-orange-900/30 dark:to-teal-900/30 text-orange-700 dark:text-orange-300 mb-4 px-4 py-2 rounded-full text-xs md:text-sm font-bold border border-orange-300/30 dark:border-orange-700/30">
                ⭐ CLIENT TESTIMONIALS
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-300 leading-tight">
              {t('home.whatOurTravelersDay') || 'What Our Travelers Say'}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              {t('home.joinThousands') || 'Join thousands of satisfied travelers who\'ve discovered their perfect journey with us'}
            </p>
          </div>
          </Reveal>

          {/* Testimonials Grid */}
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 lg:gap-8 mb-8 md:mb-12">
            {reviewsLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : topReviews && topReviews.length > 0 ? (
              topReviews.map((review, idx) => {
                const initials = review.user?.full_name 
                  ? review.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : review.user?.username?.substring(0, 2).toUpperCase() || 'U';
                
                return (
                  <StaggerItem key={review.id || idx}>
                  <Card
                    className="group relative overflow-hidden bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 backdrop-blur-sm"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-teal-50/0 dark:from-orange-900/0 dark:to-teal-900/0 group-hover:from-orange-50 group-hover:to-teal-50 dark:group-hover:from-orange-900/10 dark:group-hover:to-teal-900/10 transition-all duration-500 -z-0"></div>

                    <div className="relative z-10 p-4 md:p-6 lg:p-8 h-full flex flex-col">
                      {/* Top Section - Rating */}
                      <div className="flex items-start justify-between mb-4 md:mb-6">
                        <div className="flex gap-1 flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i} 
                              size={16} 
                              className={`transition-all duration-300 ${
                                i < (review.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          ✓
                        </div>
                      </div>

                      {/* Quote Icon */}
                      <div className="inline-flex w-8 md:w-10 h-8 md:h-10 rounded-lg bg-gradient-to-br from-orange-100 to-teal-100 dark:from-orange-900/30 dark:to-teal-900/30 items-center justify-center mb-3 md:mb-4 text-orange-600 dark:text-orange-300 text-lg md:text-xl group-hover:scale-110 transition-transform duration-300">
                        "
                      </div>

                      {/* Comment - Main Content */}
                      <p className="text-slate-700 dark:text-slate-300 mb-auto text-sm md:text-base leading-relaxed font-medium italic">
                        {review.comment || review.text}
                      </p>

                      {/* Divider */}
                      <div className="my-4 md:my-6 h-1 bg-gradient-to-r from-orange-200 via-teal-200 to-transparent dark:from-orange-700/50 dark:via-teal-700/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Author Info */}
                      <div className="flex items-center gap-3 md:gap-4 pt-2">
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gradient-to-br from-teal-500 via-orange-500 to-pink-500 flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors duration-300 truncate">
                            {review.user?.full_name || review.user?.username || 'Traveler'}
                          </p>
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                            Verified Traveler
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  </StaggerItem>
                );
              })
            ) : (
              // Fallback to static testimonials if no reviews available
              testimonials.map((testimonial, idx) => (
                <StaggerItem key={idx}>
                <Card
                  className="group relative overflow-hidden bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 backdrop-blur-sm"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-teal-50/0 dark:from-orange-900/0 dark:to-teal-900/0 group-hover:from-orange-50 group-hover:to-teal-50 dark:group-hover:from-orange-900/10 dark:group-hover:to-teal-900/10 transition-all duration-500 -z-0"></div>

                  <div className="relative z-10 p-4 md:p-6 lg:p-8 h-full flex flex-col">
                    {/* Top Section - Rating */}
                    <div className="flex items-start justify-between mb-4 md:mb-6">
                      <div className="flex gap-1 flex-shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            size={16} 
                            className={`transition-all duration-300 ${
                              i < testimonial.rating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        ✓
                      </div>
                    </div>

                    {/* Quote Icon */}
                    <div className="inline-flex w-8 md:w-10 h-8 md:h-10 rounded-lg bg-gradient-to-br from-orange-100 to-teal-100 dark:from-orange-900/30 dark:to-teal-900/30 items-center justify-center mb-3 md:mb-4 text-orange-600 dark:text-orange-300 text-lg md:text-xl group-hover:scale-110 transition-transform duration-300">
                      "
                    </div>

                    {/* Comment - Main Content */}
                    <p className="text-slate-700 dark:text-slate-300 mb-auto text-sm md:text-base leading-relaxed font-medium italic">
                      {testimonial.comment}
                    </p>

                    {/* Divider */}
                    <div className="my-4 md:my-6 h-1 bg-gradient-to-r from-orange-200 via-teal-200 to-transparent dark:from-orange-700/50 dark:via-teal-700/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Author Info */}
                    <div className="flex items-center gap-3 md:gap-4 pt-2">
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gradient-to-br from-teal-500 via-orange-500 to-pink-500 flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors duration-300 truncate">
                          {testimonial.name}
                        </p>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
                </StaggerItem>
              ))
            )}
          </StaggerGroup>

          {/* Stats Row */}
          <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mt-8 md:mt-12 lg:mt-16">
            <div className="text-center p-3 xs:p-4 sm:p-6 md:p-8 bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500 transition-all hover:shadow-lg group">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-orange-600 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300">
                4.9
              </div>
              <p className="text-xs xs:text-sm md:text-base text-slate-600 dark:text-slate-300 font-semibold">Average Rating</p>
            </div>
            <div className="text-center p-3 xs:p-4 sm:p-6 md:p-8 bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500 transition-all hover:shadow-lg group">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-pink-600 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300">
                5K+
              </div>
              <p className="text-xs xs:text-sm md:text-base text-slate-600 dark:text-slate-300 font-semibold">Reviews</p>
            </div>
            <div className="text-center p-3 xs:p-4 sm:p-6 md:p-8 bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500 transition-all hover:shadow-lg group">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-orange-600 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300">
                98%
              </div>
              <p className="text-xs xs:text-sm md:text-base text-slate-600 dark:text-slate-300 font-semibold">Satisfaction</p>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden" style={{ display: 'block', visibility: 'visible', minHeight: '150px' }}>
        <motion.div
          className="absolute inset-0 -z-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(20,184,166,0.5), transparent 50%), radial-gradient(circle at 70% 60%, rgba(249,115,22,0.4), transparent 50%)',
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Reveal>
        <div className="w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 md:mb-4 lg:mb-6">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-6 md:mb-8 lg:mb-10 max-w-2xl mx-auto">
            Join thousands of travelers exploring the world with us. Start your journey today!
          </p>

          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center">
            <Button
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold px-6 xs:px-8 md:px-10 py-2.5 xs:py-3 rounded-full flex items-center justify-center gap-2 group transition-all shadow-lg text-sm xs:text-base"
            >
              <FiSearch size={16} />
              <span>Explore Now</span>
            </Button>
            <Button
              onClick={() => navigate('/about')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-6 xs:px-8 md:px-10 py-2.5 xs:py-3 rounded-full transition-all group text-sm xs:text-base"
            >
              <span>Learn More</span>
            </Button>
          </div>
        </div>
        </Reveal>
      </section>
    </MainLayout>
  );
};

export default HomePage;
