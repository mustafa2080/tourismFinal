import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstantTranslation } from '../../hooks/useInstantTranslation';
import {
  FiArrowRight,
  FiLoader,
  FiMapPin,
  FiCalendar,
  FiStar,
  FiX,
} from 'react-icons/fi';
import { BiWorld, BiTrendingUp } from 'react-icons/bi';
import { Card, Button, Spinner } from '../common';
import { packagesService } from '../../services';
import { placeholderService } from '../../services/placeholderService';

const PopularTripCategoriesSection = () => {
  const navigate = useNavigate();
  const { t, i18n } = useInstantTranslation();

  // States
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPackages, setCategoryPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState({});
  const [categoriesFetched, setCategoriesFetched] = useState(false);

  // Fetch categories and filter out empty ones
  useEffect(() => {
    // Prevent duplicate fetches
    if (categoriesFetched) return;

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await packagesService.getCategories();

        let categoriesList = [];
        if (response?.data) {
          categoriesList = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          categoriesList = response;
        } else if (response?.categories) {
          categoriesList = Array.isArray(response.categories) ? response.categories : [response.categories];
        }

        if (!Array.isArray(categoriesList)) {
          categoriesList = [];
        }

        setCategories(categoriesList);

        // Fetch package counts for all categories with delay to prevent rate limiting
        const counts = {};
        for (let i = 0; i < categoriesList.length; i++) {
          const cat = categoriesList[i];
          try {
            // Add 200ms delay between requests to avoid rate limiting
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            const pkgResponse = await packagesService.getPackagesByCategory(cat.id, {
              limit: 1,
              offset: 0,
            });
            
            // Handle both success and not-found responses
            const count = pkgResponse?.total || 0;
            counts[cat.id] = count;
            
            console.log(`📊 [PopularCategories] Category "${cat.name}" (ID: ${cat.id}) has ${count} packages`);
          } catch (err) {
            console.warn(`⚠️ [PopularCategories] Failed to count packages for category "${cat.name}":`, err.message);
            counts[cat.id] = 0;
          }
        }
        setCategoriesWithCounts(counts);

        // Auto-select first category with packages
        const firstWithPackages = categoriesList.find(cat => counts[cat.id] > 0);
        if (firstWithPackages) {
          setSelectedCategory(firstWithPackages);
          await fetchPackagesForCategory(firstWithPackages.id);
        }
      } catch (err) {
        console.error('❌ [PopularCategories] Failed to load categories:', err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
        setCategoriesFetched(true);
      }
    };

    fetchCategories();
  }, [categoriesFetched]);

  // Fetch packages for selected category
  const fetchPackagesForCategory = async (categoryId) => {
    if (!categoryId) {
      console.warn('⚠️ [PopularCategories] No categoryId provided');
      setCategoryPackages([]);
      return;
    }

    try {
      setPackagesLoading(true);
      console.log(`📥 [PopularCategories] Fetching packages for category: ${categoryId}`);

      const response = await packagesService.getPackagesByCategory(categoryId, {
        limit: 8,
        offset: 0,
      });

      console.log(`📦 [PopularCategories] API Response for category ${categoryId}:`, {
        success: response?.success,
        hasData: !!response?.data,
        dataIsArray: Array.isArray(response?.data),
        dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A',
        total: response?.total,
        count: response?.count,
        message: response?.message,
      });

      let packages = [];
      let totalCount = 0;
      
      // Handle different response formats
      if (response?.success === false || response?.success === undefined) {
        console.warn(`⚠️ [PopularCategories] API returned success=false or undefined for category ${categoryId}`);
        console.warn(`   Message: ${response?.message || 'No message provided'}`);
        packages = [];
        totalCount = 0;
      } else if (response?.data) {
        packages = Array.isArray(response.data) ? response.data : [];
        // Get the total count from response
        totalCount = response?.total !== undefined ? response.total : (response?.count || packages.length);
        console.log(`✅ [PopularCategories] Retrieved ${packages.length} packages (total: ${totalCount}) for category ${categoryId}`);
      } else if (Array.isArray(response)) {
        packages = response;
        totalCount = packages.length;
        console.log(`✅ [PopularCategories] Retrieved ${packages.length} packages (array response) for category ${categoryId}`);
      } else if (response?.packages) {
        packages = Array.isArray(response.packages) ? response.packages : [];
        totalCount = response?.total || response?.count || packages.length;
        console.log(`✅ [PopularCategories] Retrieved ${packages.length} packages (packages field) for category ${categoryId}`);
      }

      // Safety check: ensure packages is always an array
      if (!Array.isArray(packages)) {
        console.warn(`⚠️ [PopularCategories] Packages is not an array, resetting to empty array`);
        packages = [];
        totalCount = 0;
      }

      console.log(`🔄 [PopularCategories] Final state for category ${categoryId}: ${packages.length} packages, total count: ${totalCount}`);

      // Update the categories count map with the correct total
      setCategoriesWithCounts(prev => ({
        ...prev,
        [categoryId]: totalCount
      }));

      setCategoryPackages(packages);
    } catch (err) {
      console.error(`❌ [PopularCategories] Failed to load packages for category ${categoryId}:`, err);
      console.error(`Error details:`, {
        message: err?.message,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
      });
      setCategoryPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  // Handle category selection
  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    await fetchPackagesForCategory(category.id);
  };

  // Get only categories with packages
  const categoriesWithPackages = useMemo(() => {
    return categories.filter(cat => {
      const count = categoriesWithCounts[cat.id] ?? 0;
      return count > 0;
    });
  }, [categories, categoriesWithCounts]);

  // Translate package helper (FIX: NOT using useCallback to ensure current i18n.language)
  const getTranslatedPackage = (pkg) => {
    if (!pkg) return pkg;
    const lang = i18n.language || 'en';
    
    let display_title = pkg.title || 'Untitled Package';
    let display_short_desc = pkg.short_desc || '';
    
    // Try translations array first
    if (pkg.translations && Array.isArray(pkg.translations) && pkg.translations.length > 0) {
      const translation = pkg.translations.find(t => t.language === lang);
      if (translation) {
        display_title = translation.package_name || display_title;
        display_short_desc = translation.short_description || display_short_desc;
        return { ...pkg, display_title, display_short_desc };
      }
    }
    
    // Try language-specific columns
    const langNameField = `${lang}_name`;
    const langShortDescField = `${lang}_short_description`;
    
    if (pkg[langNameField] || pkg[langShortDescField]) {
      display_title = pkg[langNameField] || pkg.title;
      display_short_desc = pkg[langShortDescField] || pkg.short_desc || '';
      return { ...pkg, display_title, display_short_desc };
    }
    
    return { ...pkg, display_title, display_short_desc };
  };

  // Memoize translated packages (FIX: Now includes i18n.language in dependencies)
  const translatedCategoryPackages = useMemo(() => {
    return categoryPackages.map(pkg => getTranslatedPackage(pkg));
  }, [categoryPackages, i18n.language]);

  // Memoize displayed packages
  const displayedPackages = useMemo(() => translatedCategoryPackages, [translatedCategoryPackages]);

  return (
    <section
      className="w-full py-12 md:py-20 bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 dark:from-slate-900 dark:via-teal-900/30 dark:to-slate-800"
      style={{ display: 'block', visibility: 'visible', minHeight: '200px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-600 dark:text-teal-400 text-xs md:text-sm font-bold flex items-center gap-2 justify-center">
            <BiTrendingUp size={16} />
            <span>{t('home.exploreCategories') || 'EXPLORE CATEGORIES'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            {t('home.popularCategories') || 'Popular Trip Categories'}
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('home.discoverCategories') || 'Discover your perfect getaway by exploring our most popular travel categories'}
          </p>
        </div>

        {categoriesLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <BiWorld size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">No categories available yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">New categories coming soon!</p>
          </div>
        ) : categoriesWithPackages.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <BiWorld size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">All categories have no available trips</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">Trips will be added soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Categories Navigation Tabs */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categoriesWithPackages.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={() => setHoveredCategoryId(category.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 group ${
                    selectedCategory?.id === category.id
                      ? 'bg-teal-600 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-600 hover:border-teal-500 dark:hover:border-teal-400'
                  }`}
                >
                  <span>{category.name}</span>
                  {selectedCategory?.id === category.id && (
                    <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              ))}
            </div>

            {/* Category Description & Image View */}
            {selectedCategory && (
              <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
                  {/* Left: Category Image & Info */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="relative h-64 md:h-72 rounded-xl overflow-hidden group">
                      {selectedCategory.image ? (
                        <img
                          src={selectedCategory.image}
                          alt={selectedCategory.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-orange-500 group-hover:from-teal-500 group-hover:to-orange-600 transition-all flex items-center justify-center">
                          <BiWorld size={80} className="text-white/50" />
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>

                    {/* Category Details */}
                    <div className="space-y-3">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        {selectedCategory.name}
                      </h3>
                      {selectedCategory.description && (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {selectedCategory.description}
                        </p>
                      )}
                      <Button
                        onClick={() => {
                          console.log(`📂 [PopularCategories] Navigating to category search: ${selectedCategory.id} - ${selectedCategory.name}`);
                          navigate(`/search?category=${selectedCategory.id}&categoryName=${encodeURIComponent(selectedCategory.name)}`);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 group transition-all w-full justify-center md:w-auto"
                      >
                        <span>View All {selectedCategory.name}</span>
                        <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>

                  {/* Right: Trips Count Info */}
                  <div className="flex flex-col justify-center">
                    <div className="bg-gradient-to-br from-teal-50 to-orange-50 dark:from-teal-900/20 dark:to-orange-900/20 rounded-xl p-6 md:p-8 border border-teal-200 dark:border-teal-800">
                      <div className="text-center mb-6">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                          {categoriesWithCounts[selectedCategory?.id] ?? 0}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">
                          {t('home.tripsAvailableIn') || 'Trips Available in'} {selectedCategory.name}
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 pb-4 border-b border-slate-300 dark:border-slate-600">
                          <BiTrendingUp size={20} className="text-teal-500 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{t('home.trendingDestination') || 'Trending Destination'}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {t('home.popularChoiceAmongTravelers') || 'Popular choice among travelers'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <BiWorld size={20} className="text-orange-500 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{t('home.diverseExperiences') || 'Diverse Experiences'}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {t('home.variousOptionsToChooseFrom') || 'Various options to choose from'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          console.log(`📂 [PopularCategories] Browse button clicked: ${selectedCategory.id} - ${selectedCategory.name}`);
                          navigate(`/search?category=${selectedCategory.id}&categoryName=${encodeURIComponent(selectedCategory.name)}`);
                        }}
                        className="w-full bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition-all group"
                      >
                        <span>{t('home.browseCategory') || 'Browse'} {selectedCategory.name}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Packages Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {t('home.tripsIn') || 'Trips in'} {selectedCategory?.name || 'Selected Category'}
                </h3>
                {packagesLoading && (
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                    <FiLoader size={18} className="animate-spin" />
                    <span className="text-sm font-medium">Loading...</span>
                  </div>
                )}
              </div>

              {packagesLoading ? (
                <div className="flex justify-center py-16">
                  <Spinner size="lg" />
                </div>
              ) : displayedPackages.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <BiWorld size={64} className="text-red-500" />
                    </div>
                  </div>
                  <p className="text-red-700 dark:text-red-300 font-bold text-2xl mb-2">
                    ❌ Not Found
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-lg mb-4">
                    No trips available in {selectedCategory?.name}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    This category currently has no available trips. Please check back later or explore other categories.
                  </p>
                  <div className="mt-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-6 text-left max-w-xl mx-auto border border-slate-300 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                      <span>ℹ️</span> Debugging Information
                    </p>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-mono bg-white dark:bg-slate-900/50 rounded p-4">
                      <div className="flex justify-between">
                        <span>Category ID:</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">{selectedCategory?.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category Name:</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">{selectedCategory?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reported Total:</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">{categoriesWithCounts[selectedCategory?.id] ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Response:</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400">Empty Array []</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status Code:</span>
                        <span className="font-bold text-red-600 dark:text-red-400">404 Not Found</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                      💡 Check browser console (F12) for detailed API logs and error messages
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3 justify-center">
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-all"
                    >
                      Refresh Page
                    </Button>
                    <Button
                      onClick={() => setSelectedCategory(null)}
                      className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-all"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {displayedPackages.map((pkg, idx) => (
                    <Card
                      key={pkg.id || idx}
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                      onClick={() => navigate(`/package/${pkg.id}`)}
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-teal-400 to-orange-500 overflow-hidden">
                        {pkg.images && pkg.images.length > 0 && (pkg.images[0]?.image_data || pkg.images[0]?.url) ? (
                          <>
                            {pkg.images[0]?.image_data && (
                              <img
                                src={(() => {
                                  const imageData = pkg.images[0].image_data;
                                  if (typeof imageData === 'string' && imageData.length > 0) {
                                    return `data:image/jpeg;base64,${imageData}`;
                                  } else if (imageData && imageData.data && Array.isArray(imageData.data)) {
                                    const binaryString = String.fromCharCode.apply(null, imageData.data);
                                    const base64 = btoa(binaryString);
                                    return `data:image/jpeg;base64,${base64}`;
                                  }
                                  return null;
                                })()}
                                alt={pkg.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            {pkg.images[0]?.url && (
                              <img
                                src={pkg.images[0].url}
                                alt={pkg.title}
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
                            alt={pkg.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 rounded-full text-xs font-bold line-clamp-1">
                          {pkg.destination}
                        </div>
                        {pkg.average_rating && (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/80 dark:to-yellow-900/80 rounded-full backdrop-blur-sm shadow-md border border-amber-200/60 dark:border-amber-700/60">
                            <FiStar size={16} className="fill-amber-500 text-amber-500 drop-shadow-md" />
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{parseFloat(pkg.average_rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 md:p-5 space-y-4">
                        <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600">
                          {pkg.display_title}
                        </h3>

                        {/* Meta Info */}
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <FiCalendar size={16} className="text-teal-500 flex-shrink-0" />
                            <span>{pkg.duration_days} Days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin size={16} className="text-teal-500 flex-shrink-0" />
                            <span className="truncate">{pkg.destination}</span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex gap-0.5 py-3 border-t border-b border-slate-200 dark:border-slate-700">
                          {[...Array(5)].map((_, i) => {
                            const rating = parseFloat(pkg.average_rating) || 0;
                            const ratingFloor = Math.floor(rating);
                            return (
                              <FiStar
                                key={i}
                                size={16}
                                className={
                                  i < ratingFloor
                                    ? 'fill-amber-400 text-amber-400 drop-shadow-lg'
                                    : i === ratingFloor && rating % 1 >= 0.5
                                    ? 'fill-amber-300 text-amber-300 drop-shadow-md opacity-75'
                                    : 'text-slate-300 dark:text-slate-600'
                                }
                              />
                            );
                          })}
                          {pkg.average_rating > 0 && (
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2 bg-amber-50/50 dark:bg-amber-900/20 px-2.5 py-0.5 rounded-full">
                              {parseFloat(pkg.average_rating).toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">From</p>
                            <p className="text-xl md:text-2xl font-bold text-teal-600">
                              {pkg.base_price && pkg.base_price > 0 
                                ? `$${pkg.base_price?.toLocaleString()}`
                                : <span className="text-orange-500">Price Not Set</span>
                              }
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 p-2"
                          >
                            <FiArrowRight size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* View All Button for Selected Category */}
              {displayedPackages.length > 0 && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => {
                      console.log(`📂 [PopularCategories] View All button clicked: ${selectedCategory?.id} - ${selectedCategory?.name}`);
                      navigate(`/search?category=${selectedCategory?.id}&categoryName=${encodeURIComponent(selectedCategory?.name)}`);
                    }}
                    className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-8 md:px-10 py-3 rounded-lg group transition-all inline-flex items-center gap-2 font-bold"
                  >
                    <span>View All {selectedCategory?.name} Trips</span>
                    <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularTripCategoriesSection;