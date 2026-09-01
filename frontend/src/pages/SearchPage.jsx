import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInstantTranslation } from '../hooks/useInstantTranslation';
import { MainLayout } from '../components/layout';
import { Card, Button, AdvancedPagination } from '../components/common';
import { packagesService } from '../services';
import { useAuth } from '../hooks';
import { useWishlistContext } from '../hooks/useWishlistContext';
import searchHistoryManager from '../utils/searchHistory';
import { 
  FiGrid, FiList, FiFilter, FiX, FiMapPin, FiCalendar, 
  FiSearch, FiStar, FiHeart, FiChevronDown
} from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useInstantTranslation();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isWishlisted, syncWishlistData } = useWishlistContext();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const suggestionsTimeoutRef = useRef(null);
  const [totalResults, setTotalResults] = useState(0);
  
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 50000,
    minDuration: 1,
    maxDuration: 30,
    minRating: 0,
    sortBy: 'newest',
  });

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const categoryNameParam = searchParams.get('categoryName') || '';
    
    setSearchQuery(q);
    setCategoryId(category);
    setCategoryName(categoryNameParam);
    setCurrentPage(1);
    
    console.log(`🔍 [SearchPage] URL params extracted:`, {
      query: q ? `"${q}"` : 'empty',
      category: category ? `"${category}"` : 'empty',
      categoryName: categoryNameParam ? `"${categoryNameParam}"` : 'empty',
      willUseCategoryFilter: !!(category && !q),
      willUseSearchAPI: !!(q)
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * itemsPerPage;
        let response;
        
        // If searching by category, use getPackagesByCategory
        if (categoryId && !searchQuery) {
          console.log(`📂 [SearchPage] Fetching by category ONLY: ${categoryId}`);
          
          response = await packagesService.getPackagesByCategory(categoryId, {
            limit: itemsPerPage,
            offset: offset,
          });
          
          console.log(`📦 [SearchPage] Category response:`, {
            success: response?.success,
            dataLength: response?.data?.length,
            total: response?.total,
            message: response?.message,
          });
        } else if (categoryId && searchQuery) {
          // If both category AND search query, filter category packages by search query
          console.log(`🔍 [SearchPage] Searching WITHIN category: ${categoryId} with query: "${searchQuery}"`);
          
          response = await packagesService.getPackagesByCategory(categoryId, {
            q: searchQuery,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            duration: filters.minDuration,
            minRating: filters.minRating,
            sort: filters.sortBy,
            limit: itemsPerPage,
            offset: offset,
          });
          
          console.log(`📦 [SearchPage] Category + Search response:`, {
            success: response?.success,
            dataLength: response?.data?.length,
            total: response?.total,
            message: response?.message,
          });
        } else {
          // Only search query, no category filter
          console.log(`🔍 [SearchPage] Searching all packages with query: "${searchQuery}"`);
          
          response = await packagesService.searchPackages({
            q: searchQuery || '',
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            duration: filters.minDuration,
            minRating: filters.minRating,
            sort: filters.sortBy,
            limit: itemsPerPage,
            offset: offset,
          });
        }
        
        let fetchedPackages = [];
        let total = 0;
        
        if (response?.data) {
          fetchedPackages = Array.isArray(response.data) ? response.data : [response.data];
          total = response?.total !== undefined ? response.total : (response?.count || fetchedPackages.length);
          console.log(`✅ [SearchPage] Using response.data: ${fetchedPackages.length} packages, total: ${total}`);
        } else if (Array.isArray(response)) {
          fetchedPackages = response;
          total = response.length;
          console.log(`✅ [SearchPage] Using array response: ${fetchedPackages.length} packages`);
        } else if (response?.packages) {
          fetchedPackages = Array.isArray(response.packages) ? response.packages : [response.packages];
          total = response?.total || response?.count || fetchedPackages.length;
          console.log(`✅ [SearchPage] Using response.packages: ${fetchedPackages.length} packages, total: ${total}`);
        }
        
        // Safety check: ensure fetchedPackages is always an array
        if (!Array.isArray(fetchedPackages)) {
          console.warn('⚠️ [SearchPage] fetchedPackages is not an array, resetting');
          fetchedPackages = [];
          total = 0;
        }
        
        console.log(`✅ [SearchPage] Final count: ${fetchedPackages.length} packages fetched, ${total} total available`);
        
        setPackages(fetchedPackages);
        setTotalResults(total);
        
        // Debug: Log first package to check data structure
        if (fetchedPackages.length > 0) {
          console.log('📦 [SearchPage] First package data:', {
            id: fetchedPackages[0].id,
            title: fetchedPackages[0].title,
            destination: fetchedPackages[0].destination,
            average_rating: fetchedPackages[0].average_rating,
            review_count: fetchedPackages[0].review_count,
            base_price: fetchedPackages[0].base_price,
          });
        } else {
          console.warn(`⚠️ [SearchPage] No packages returned! Response:`, response);
        }
      } catch (err) {
        console.error('❌ [SearchPage] Search/fetch failed:', err);
        toast.error('Failed to load trips');
        setPackages([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [searchQuery, categoryId, filters, currentPage]);

  // Debug effect to monitor category filter
  useEffect(() => {
    if (categoryId) {
      console.log(`📊 [SearchPage] Category filter active: "${categoryId}"`);
      console.log(`   - Category Name: "${categoryName}"`);
      console.log(`   - Search Query: "${searchQuery || 'empty'}"`);
      console.log(`   - Will use getPackagesByCategory: ${!searchQuery}`);
    }
  }, [categoryId, categoryName, searchQuery]);

  // Smooth scroll to results when page changes
  useEffect(() => {
    if (currentPage > 1) {
      const resultsSection = document.querySelector('[data-results-section]');
      if (resultsSection) {
        setTimeout(() => {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [currentPage]);

  useEffect(() => {
    if (suggestionsTimeoutRef.current) clearTimeout(suggestionsTimeoutRef.current);

    if (searchQuery.trim().length > 1) {
      setSuggestionsLoading(true);
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await packagesService.getDestinationSuggestions(searchQuery);
          setDestinationSuggestions(Array.isArray(suggestions) ? suggestions.slice(0, 10) : []);
        } catch (err) {
          setDestinationSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 300);
    } else {
      setDestinationSuggestions([]);
    }

    return () => {
      if (suggestionsTimeoutRef.current) clearTimeout(suggestionsTimeoutRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    setRecentSearches(searchHistoryManager.getRecent(6));
  }, []);

  const filteredPackages = packages.filter(pkg => (pkg.average_rating || 0) >= filters.minRating);
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const paginatedPackages = filteredPackages;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 50000,
      minDuration: 1,
      maxDuration: 30,
      minRating: 0,
      sortBy: 'newest',
    });
  };

  const handleToggleWishlist = async (e, packageId) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please log in');
      navigate('/login');
      return;
    }

    try {
      const wasWishlisted = isWishlisted(packageId);
      const loadingToastId = toast.loading(wasWishlisted ? 'Removing from wishlist...' : 'Adding to wishlist...');
      
      if (wasWishlisted) {
        const removed = await removeFromWishlist(packageId);
        if (removed) {
          toast.dismiss(loadingToastId);
          toast.success('Removed from wishlist', { duration: 2000 });
          // Sync to update other components
          await syncWishlistData();
        } else {
          toast.dismiss(loadingToastId);
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const added = await addToWishlist(packageId);
        if (added) {
          toast.dismiss(loadingToastId);
          toast.success('Added to wishlist! 💝', { duration: 2000 });
          // Sync to update other components
          await syncWishlistData();
        } else {
          toast.dismiss(loadingToastId);
          toast.error('Failed to add to wishlist');
        }
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      toast.error('Failed to update wishlist');
    }
  };

  const getImageUrl = (pkg) => {
    if (!pkg.images?.[0]) return null;
    const img = pkg.images[0];
    if (img.image_data) {
      if (typeof img.image_data === 'string') {
        return `data:image/jpeg;base64,${img.image_data}`;
      } else if (img.image_data.data?.length) {
        const str = String.fromCharCode.apply(null, img.image_data.data);
        return `data:image/jpeg;base64,${btoa(str)}`;
      }
    }
    return img.url || null;
  };

  return (
    <MainLayout>
      {/* Hero Search */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
            {categoryId && categoryName
              ? (
                <>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-lg">
                    📂 {categoryName}
                  </span>
                  <span>Trips</span>
                </>
              )
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : t('searchPageExact.findYourPerfectTrip')
            }
          </h1>
          {categoryId && (
            <p className="text-blue-100 mb-4 flex items-center gap-2">
              Found <span className="font-bold text-white text-lg">{totalResults}</span> {totalResults === 1 ? 'trip' : 'trips'} in <span className="font-bold text-white">{categoryName}</span>
              {searchQuery && (
                <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  matching "{searchQuery}"
                </span>
              )}
            </p>
          )}
          
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-lg">
              <FiSearch className="text-gray-400 text-xl" />
              <input
                type="text"
                placeholder={t('searchPageExact.searchDestination')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setShowSuggestions(false);
                    searchHistoryManager.addSearch(searchQuery);
                    // Keep category filter if it exists
                    if (categoryId) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`);
                    } else {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="flex-1 outline-none text-gray-900 text-sm md:text-base"
              />
            </div>

            {/* Suggestions */}
            {showSuggestions && searchQuery.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {suggestionsLoading ? (
                  <div className="p-4 text-center text-gray-500">{t('searchPageExact.searching')}</div>
                ) : destinationSuggestions.length > 0 ? (
                  destinationSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setShowSuggestions(false);
                        searchHistoryManager.addSearch(suggestion);
                        // Keep category filter if it exists
                        if (categoryId) {
                          navigate(`/search?q=${encodeURIComponent(suggestion)}&category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`);
                        } else {
                          navigate(`/search?q=${encodeURIComponent(suggestion)}`);
                        }
                      }}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-center gap-2 text-gray-700"
                    >
                      <FiMapPin size={16} className="text-blue-500" />
                      {suggestion}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">{t('searchPageExact.noDestinationsFound')}</div>
                )}
              </div>
            )}
          </div>

          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-3 opacity-90">{t('searchPageExact.recentSearches')}</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (categoryId) {
                        navigate(`/search?q=${encodeURIComponent(search.query)}&category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`);
                      } else {
                        navigate(`/search?q=${encodeURIComponent(search.query)}`);
                      }
                    }}
                    className="px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm transition"
                  >
                    {search.query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Category Filter Badge with Clear Button */}
          {categoryId && (
            <div className="mb-6 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  📂 Viewing: {categoryName}
                </span>
              </div>
              <button
                onClick={() => {
                  setCategoryId('');
                  setCategoryName('');
                  setCurrentPage(1);
                  navigate(searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search');
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 transition text-sm font-medium"
              >
                <FiX size={16} />
                Clear Category
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-gray-600">
                {t('searchPageExact.showing')} <span className="font-bold text-gray-900">{paginatedPackages.length}</span> {t('searchPageExact.of')} <span className="font-bold text-gray-900">{totalResults}</span> {t('searchPageExact.trips')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <FiFilter size={18} />
                <span>{t('searchPageExact.filters')}</span>
                <FiChevronDown size={16} className={`transition ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white rounded-lg shadow p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title={t('searchPageExact.gridView')}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title={t('searchPageExact.listView')}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Sidebar Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block md:col-span-1`}>
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-8 sticky top-24">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{t('searchPageExact.filterTrips')}</h3>
                  <div className="w-12 h-1 bg-blue-600 rounded"></div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4">💰 {t('searchPageExact.priceRange')}</label>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('searchPageExact.minPrice')}</p>
                        <p className="text-lg font-bold text-blue-600">${filters.minPrice}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">{t('searchPageExact.toPrice')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('searchPageExact.maxPrice')}</p>
                        <p className="text-lg font-bold text-blue-600">${filters.maxPrice}</p>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="text-xs text-gray-500 text-center">{t('searchPageExact.dragToAdjustMaxPrice')}</div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4">📅 {t('searchPageExact.durationDays')}</label>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('searchPageExact.minPrice')}</p>
                        <p className="text-lg font-bold text-blue-600">{filters.minDuration}{t('searchPageExact.daysAbbr')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">{t('searchPageExact.toPrice')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('searchPageExact.maxPrice')}</p>
                        <p className="text-lg font-bold text-blue-600">{filters.maxDuration}{t('searchPageExact.daysAbbr')}</p>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={filters.maxDuration}
                      onChange={(e) => handleFilterChange('maxDuration', parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="text-xs text-gray-500 text-center">{t('searchPageExact.dragToAdjustDuration')}</div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4">⭐ {t('searchPageExact.rating')}</label>
                  <div className="space-y-2.5">
                    {[
                      { value: 0, label: t('searchPageExact.allRatings'), emoji: '🌐' },
                      { value: 3, label: t('searchPageExact.threePlusStars'), emoji: '⭐' },
                      { value: 4, label: t('searchPageExact.fourPlusStars'), emoji: '⭐⭐' },
                      { value: 4.5, label: t('searchPageExact.fourPointFiveStars'), emoji: '⭐⭐⭐' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleFilterChange('minRating', opt.value)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-semibold ${
                          filters.minRating === opt.value
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : 'hover:bg-gray-100 text-gray-700 border-2 border-transparent hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt.label}</span>
                          <span>{opt.emoji}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4">🔄 {t('searchPageExact.sortBy')}</label>
                  <div className="space-y-2.5">
                    {[
                      { value: 'newest', label: t('searchPageExact.newestFirst'), emoji: '📅' },
                      { value: 'price_asc', label: t('searchPageExact.budgetFriendly'), emoji: '💵' },
                      { value: 'price_desc', label: t('searchPageExact.premiumFirst'), emoji: '💎' },
                      { value: 'rating', label: t('searchPageExact.topRated'), emoji: '🏆' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleFilterChange('sortBy', opt.value)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-semibold ${
                          filters.sortBy === opt.value
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : 'hover:bg-gray-100 text-gray-700 border-2 border-transparent hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt.label}</span>
                          <span>{opt.emoji}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6 border-t-2 border-gray-200">
                  <button
                    onClick={handleResetFilters}
                    className="w-full px-4 py-3 text-sm font-bold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border-2 border-gray-300"
                  >
                    ↻ {t('searchPageExact.resetAll')}
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full md:hidden px-4 py-3 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                  >
                    ✓ {t('searchPageExact.applyFilters')}
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="md:col-span-4" data-results-section>
              {loading && (
                <div className="flex justify-center py-20">
                  <div className="animate-spin">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                  </div>
                </div>
              )}

              {!loading && filteredPackages.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-5xl mb-4">🔍</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {categoryId
                      ? `No trips available in ${categoryName}`
                      : t('searchPageExact.noTripsFound')
                    }
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {categoryId
                      ? `Try another category or use the filters to refine your search`
                      : `Try adjusting your search or filters`
                    }
                  </p>
                  <Button onClick={handleResetFilters} className="bg-blue-600 hover:bg-blue-700">{t('searchPageExact.resetFilters')}</Button>
                </div>
              )}

              {/* Grid View */}
              {!loading && filteredPackages.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedPackages.map(pkg => (
                    <Card
                      key={pkg.id}
                      className="overflow-hidden hover:shadow-lg transition cursor-pointer group"
                      onClick={() => navigate(`/package/${pkg.id}`)}
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        {getImageUrl(pkg) ? (
                          <img src={getImageUrl(pkg)} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><p className="text-4xl">🖼️</p></div>
                        )}
                        <button
                          onClick={(e) => handleToggleWishlist(e, pkg.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full transition ${
                            isWishlisted(pkg.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50'
                          }`}
                        >
                          <FiHeart size={18} fill={isWishlisted(pkg.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-gray-900 line-clamp-2">{pkg.title}</h3>
                        
                        <div className="space-y-1.5 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiMapPin size={14} className="text-blue-500" />
                            {pkg.destination}
                          </div>
                          <div className="flex items-center gap-2">
                            <FiCalendar size={14} className="text-blue-500" />
                            {pkg.duration_days} {t('searchPageExact.daysDuration')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 py-3 border-t border-b border-gray-200">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => {
                              const rating = parseFloat(pkg.average_rating) || 0;
                              const ratingFloor = Math.floor(rating);
                              return (
                                <FiStar 
                                  key={i} 
                                  size={14}
                                  className={
                                    i < ratingFloor
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : i === ratingFloor && rating % 1 >= 0.5
                                      ? 'fill-yellow-300 text-yellow-300 opacity-75'
                                      : 'text-gray-300'
                                  }
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs font-bold text-gray-700">
                            {parseFloat(pkg.average_rating) > 0 
                              ? `${parseFloat(pkg.average_rating).toFixed(1)}/5`
                              : 'No Rating'
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            ({pkg.review_count || pkg.reviews?.length || 0} {(pkg.review_count || pkg.reviews?.length || 0) === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 mb-1">{t('searchPageExact.from')}</p>
                          <div className="text-2xl font-bold text-blue-600">
                            {pkg.base_price && pkg.base_price > 0 
                              ? `$${pkg.base_price?.toLocaleString()}`
                              : <span className="text-orange-500">Price Not Set</span>
                            }
                          </div>
                        </div>

                        <Button onClick={(e) => { e.stopPropagation(); navigate(`/package/${pkg.id}`); }} className="w-full bg-blue-600 hover:bg-blue-700">{t('searchPageExact.viewDetails')}</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* List View */}
              {!loading && filteredPackages.length > 0 && viewMode === 'list' && (
                <div className="space-y-4">
                  {paginatedPackages.map(pkg => (
                    <Card
                      key={pkg.id}
                      className="p-4 hover:shadow-lg transition cursor-pointer"
                      onClick={() => navigate(`/package/${pkg.id}`)}
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="hidden sm:block w-32 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {getImageUrl(pkg) ? (
                            <img src={getImageUrl(pkg)} alt={pkg.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-2xl">🖼️</div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 line-clamp-1">{pkg.title}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <FiMapPin size={12} /> {pkg.destination}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiCalendar size={12} /> {pkg.duration_days}{t('searchPageExact.daysAbbr')}
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => {
                                  const rating = parseFloat(pkg.average_rating) || 0;
                                  const ratingFloor = Math.floor(rating);
                                  return (
                                    <FiStar 
                                      key={i} 
                                      size={11}
                                      className={
                                        i < ratingFloor
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : i === ratingFloor && rating % 1 >= 0.5
                                          ? 'fill-yellow-300 text-yellow-300 opacity-75'
                                          : 'text-gray-300'
                                      }
                                    />
                                  );
                                })}
                              </div>
                              <span className="font-bold">
                                {parseFloat(pkg.average_rating) > 0 
                                  ? `${parseFloat(pkg.average_rating).toFixed(1)}`
                                  : 'No Rating'
                                }
                              </span>
                              <span className="text-gray-500">
                                ({pkg.review_count || pkg.reviews?.length || 0} {(pkg.review_count || pkg.reviews?.length || 0) === 1 ? 'review' : 'reviews'})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex flex-col justify-between">
                          <div>
                            <p className="text-xs text-gray-600">{t('searchPageExact.from')}</p>
                            <div className="text-lg font-bold text-blue-600">
                              {pkg.base_price && pkg.base_price > 0 
                                ? `$${pkg.base_price?.toLocaleString()}`
                                : <span className="text-orange-500">Price Not Set</span>
                              }
                            </div>
                          </div>
                          <Button onClick={(e) => { e.stopPropagation(); navigate(`/package/${pkg.id}`); }} className="bg-blue-600 hover:bg-blue-700 text-sm">{t('searchPageExact.viewDetails')}</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="mt-16 bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <AdvancedPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalResults}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    showItemsInfo={true}
                    showJumpTo={true}
                    variant="modern"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPage;
