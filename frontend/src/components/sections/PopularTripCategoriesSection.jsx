import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstantTranslation } from '../../hooks/useInstantTranslation';
import { Reveal, StaggerGroup, StaggerItem } from '../motion/Reveal';
import {
  FiArrowRight,
  FiMapPin,
  FiCalendar,
  FiStar,
  FiClock,
} from 'react-icons/fi';
import { BiWorld, BiTrendingUp } from 'react-icons/bi';
import { Button, Spinner } from '../common';
import { packagesService } from '../../services';
import { placeholderService } from '../../services/placeholderService';
import { convertImageDataToUrl } from '../../utils/imageCompression';

/**
 * PopularTripCategoriesSection
 * TourRadar-style tabbed category browser: pill tabs with a thumbnail per
 * category, a compact category banner, and a clean trip grid below. Empty
 * categories are filtered out of the tab list entirely so the user never
 * sees a dead end; the "no trips" state (should it ever surface) is a
 * quiet, on-brand placeholder rather than a debug dump.
 */
const PopularTripCategoriesSection = () => {
  const navigate = useNavigate();
  const { t, i18n } = useInstantTranslation();

  // States
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPackages, setCategoryPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState({});
  const [categoriesFetched, setCategoriesFetched] = useState(false);

  // Fetch categories and their package counts, then auto-select the first
  // category that actually has trips.
  useEffect(() => {
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
        if (!Array.isArray(categoriesList)) categoriesList = [];

        setCategories(categoriesList);

        const counts = {};
        await Promise.all(
          categoriesList.map(async (cat) => {
            try {
              const pkgResponse = await packagesService.getPackagesByCategory(cat.id, { limit: 1, offset: 0 });
              counts[cat.id] = pkgResponse?.total || 0;
            } catch (err) {
              counts[cat.id] = 0;
            }
          })
        );
        setCategoriesWithCounts(counts);

        const firstWithPackages = categoriesList.find((cat) => counts[cat.id] > 0);
        if (firstWithPackages) {
          setSelectedCategory(firstWithPackages);
          await fetchPackagesForCategory(firstWithPackages.id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
        setCategoriesFetched(true);
      }
    };

    fetchCategories();
  }, [categoriesFetched]);

  // Fetch packages for a given category id.
  const fetchPackagesForCategory = async (categoryId) => {
    if (!categoryId) {
      setCategoryPackages([]);
      return;
    }

    try {
      setPackagesLoading(true);
      const response = await packagesService.getPackagesByCategory(categoryId, { limit: 8, offset: 0 });

      let packages = [];
      let totalCount = 0;

      if (response?.success === false) {
        packages = [];
        totalCount = 0;
      } else if (Array.isArray(response?.data)) {
        packages = response.data;
        totalCount = response?.total ?? response?.count ?? packages.length;
      } else if (Array.isArray(response)) {
        packages = response;
        totalCount = packages.length;
      } else if (Array.isArray(response?.packages)) {
        packages = response.packages;
        totalCount = response?.total ?? response?.count ?? packages.length;
      }

      setCategoriesWithCounts((prev) => ({ ...prev, [categoryId]: totalCount }));
      setCategoryPackages(packages);
    } catch (err) {
      console.error(`Failed to load packages for category ${categoryId}:`, err);
      setCategoryPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    await fetchPackagesForCategory(category.id);
  };

  // Only categories that actually have trips get a tab.
  const categoriesWithPackages = useMemo(() => {
    return categories.filter((cat) => (categoriesWithCounts[cat.id] ?? 0) > 0);
  }, [categories, categoriesWithCounts]);

  const getTranslatedPackage = (pkg) => {
    if (!pkg) return pkg;
    const lang = i18n.language || 'en';

    let display_title = pkg.title || 'Untitled Package';
    let display_short_desc = pkg.short_desc || '';

    if (pkg.translations && Array.isArray(pkg.translations) && pkg.translations.length > 0) {
      const translation = pkg.translations.find((tr) => tr.language === lang);
      if (translation) {
        return {
          ...pkg,
          display_title: translation.package_name || display_title,
          display_short_desc: translation.short_description || display_short_desc,
        };
      }
    }

    const langNameField = `${lang}_name`;
    const langShortDescField = `${lang}_short_description`;
    if (pkg[langNameField] || pkg[langShortDescField]) {
      display_title = pkg[langNameField] || pkg.title;
      display_short_desc = pkg[langShortDescField] || pkg.short_desc || '';
    }

    return { ...pkg, display_title, display_short_desc };
  };

  const displayedPackages = useMemo(
    () => categoryPackages.map((pkg) => getTranslatedPackage(pkg)),
    [categoryPackages, i18n.language]
  );

  return (
    <section
      className="w-full py-12 md:py-20 bg-white dark:bg-slate-900"
      style={{ display: 'block', visibility: 'visible', minHeight: '200px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="text-center mb-10 md:mb-12 space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-50 dark:bg-teal-900/30 border border-teal-200/60 dark:border-teal-800/60 rounded-full text-teal-700 dark:text-teal-400 text-xs md:text-sm font-semibold justify-center">
            <BiTrendingUp size={14} />
            <span>{t('home.exploreCategories') || 'Explore Categories'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            {t('home.popularCategories') || 'Popular Trip Categories'}
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('home.discoverCategories') || 'Discover your perfect getaway by exploring our most popular travel categories'}
          </p>
        </Reveal>

        {categoriesLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : categoriesWithPackages.length === 0 ? (
          /* Quiet, on-brand empty state - no debug info, no red alarm colors */
          <div className="max-w-lg mx-auto text-center py-14 px-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-500">
              <BiWorld size={26} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1.5">
              {t('home.categoriesComingSoon') || 'New categories coming soon'}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t('home.checkBackSoon') || "We're curating more trips - check back shortly!"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Category Tabs - pill with a small thumbnail, TourRadar style */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {categoriesWithPackages.map((category) => {
                const active = selectedCategory?.id === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={`flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                      active
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 scale-[1.03]'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${active ? 'ring-2 ring-white/60' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      {category.image ? (
                        <img src={category.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BiWorld size={14} className={active ? 'text-white' : 'text-slate-400'} />
                      )}
                    </span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Compact Category Banner */}
            {selectedCategory && (
              <div className="relative rounded-2xl overflow-hidden h-32 sm:h-40 border border-slate-200/70 dark:border-slate-700/60 group">
                {selectedCategory.image ? (
                  <img
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-600 to-teal-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-between px-5 sm:px-8">
                  <div>
                    <h3 className="text-white text-xl sm:text-2xl font-bold drop-shadow-md">
                      {selectedCategory.name}
                    </h3>
                    <p className="text-white/85 text-xs sm:text-sm mt-1">
                      {categoriesWithCounts[selectedCategory.id] ?? 0} {t('home.tripsAvailable') || 'trips available'}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/search?category=${selectedCategory.id}&categoryName=${encodeURIComponent(selectedCategory.name)}`)}
                    className="hidden sm:inline-flex bg-white/95 hover:bg-white text-slate-900 font-bold px-5 py-2.5 rounded-full items-center gap-2 group/btn transition-all text-sm flex-shrink-0"
                  >
                    <span>{t('common.viewAll') || 'View All'}</span>
                    <FiArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            )}

            {/* Trips Grid */}
            <div className="space-y-5">
              {packagesLoading ? (
                <div className="flex justify-center py-16">
                  <Spinner size="lg" />
                </div>
              ) : displayedPackages.length === 0 ? (
                /* Graceful empty state for a selected category with no trips
                   (shouldn't normally surface since empty tabs are hidden,
                   but kept clean rather than the old debug-info screen). */
                <div className="max-w-md mx-auto text-center py-14 px-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-500">
                    <FiClock size={22} />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1.5">
                    {t('home.tripsComingSoon') || 'Trips coming soon'}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {t('home.exploreOtherCategories') || 'Try another category or explore all our trips.'}
                  </p>
                  <Button
                    onClick={() => navigate('/search')}
                    className="mt-5 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full font-semibold text-sm"
                  >
                    {t('home.exploreAllPackages') || 'Explore All Packages'}
                  </Button>
                </div>
              ) : (
                <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" staggerDelay={0.06}>
                  {displayedPackages.map((pkg) => (
                    <StaggerItem key={pkg.id}>
                      <div
                        className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/60 hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group bg-white dark:bg-slate-800 flex flex-col h-full"
                        onClick={() => navigate(`/package/${pkg.id}`)}
                      >
                        {/* Image */}
                        <div className="relative h-44 sm:h-48 bg-teal-600 overflow-hidden">
                          {pkg.images?.[0]?.image_data || pkg.images?.[0]?.url ? (
                            <img
                              src={pkg.images[0]?.image_data ? convertImageDataToUrl(pkg.images[0].image_data) : pkg.images[0].url}
                              alt={pkg.display_title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <img
                              src={placeholderService.getDestinationPlaceholder(pkg.destination)}
                              alt={pkg.display_title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 dark:bg-slate-900/90 rounded-full text-xs font-bold text-slate-800 dark:text-white shadow-sm line-clamp-1">
                            {pkg.destination}
                          </div>
                          {pkg.average_rating > 0 && (
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-sm shadow-md bg-white/90 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-700/60">
                              <FiStar size={14} className="fill-amber-500 text-amber-500" />
                              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{parseFloat(pkg.average_rating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1 gap-3">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 min-h-[2.5em] group-hover:text-teal-600 transition-colors">
                            {pkg.display_title}
                          </h3>

                          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <FiCalendar size={14} className="text-teal-500 flex-shrink-0" />
                              <span>{pkg.duration_days} {t('common.days') || 'Days'}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FiMapPin size={14} className="text-teal-500 flex-shrink-0" />
                              <span className="truncate">{pkg.destination}</span>
                            </div>
                          </div>

                          <div className="flex-1" />

                          <div className="flex justify-between items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('common.from') || 'From'}</p>
                              <p className="text-lg font-bold text-teal-600 dark:text-teal-400 truncate">
                                {pkg.base_price > 0 ? `$${parseFloat(pkg.base_price).toLocaleString()}` : (
                                  <span className="text-teal-500 text-sm">{t('common.priceNotSet') || 'Price Not Set'}</span>
                                )}
                              </p>
                            </div>
                            <span className="w-9 h-9 rounded-full bg-teal-600 group-hover:bg-teal-700 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors">
                              <FiArrowRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              )}

              {/* View All for the selected category */}
              {displayedPackages.length > 0 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/search?category=${selectedCategory?.id}&categoryName=${encodeURIComponent(selectedCategory?.name || '')}`)}
                    className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-8 py-3 rounded-full group transition-all inline-flex items-center gap-2 font-bold text-sm"
                  >
                    <span>
                      {(t('home.viewAllInCategory', { category: selectedCategory?.name })) ||
                        `View All ${selectedCategory?.name} Trips`}
                    </span>
                    <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
