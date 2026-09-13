import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstantTranslation } from '../../hooks/useInstantTranslation';
import { Reveal, StaggerGroup, StaggerItem } from '../motion/Reveal';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';
import { regionService } from '../../services/regionService';

/**
 * PopularDestinationsSection
 * TourRadar-style "Popular Destinations" block: large region tiles with a
 * background image, plus a list of country/destination links underneath
 * each one. Regions and their destinations are managed from the admin
 * dashboard (Popular Destinations page) and fetched here dynamically.
 * Clicking a country routes into the search page filtered by that name;
 * clicking the region tile searches the whole region.
 */
const PopularDestinationsSection = () => {
  const navigate = useNavigate();
  const { t } = useInstantTranslation();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRegions = async () => {
      try {
        const data = await regionService.getAllRegions();
        if (isMounted) setRegions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load popular destinations:', error);
        if (isMounted) setRegions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRegions();
    return () => {
      isMounted = false;
    };
  }, []);

  const goToSearch = (query) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    navigate(`/search?${params.toString()}`);
  };

  // Hide the whole section gracefully if there's nothing to show yet
  if (!loading && regions.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="text-center mb-10 md:mb-12 space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-50 dark:bg-teal-900/30 border border-teal-200/60 dark:border-teal-800/60 rounded-full text-teal-700 dark:text-teal-400 text-xs md:text-sm font-semibold justify-center">
            <BiWorld size={14} />
            <span>{t('home.exploreTheWorld') || 'Explore The World'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            {t('home.popularDestinations') || 'Popular Destinations'}
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('home.popularDestinationsDesc') || 'From the mountains of Europe to the deserts of Africa - find your next adventure by region'}
          </p>
        </Reveal>

        {/* Region Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-700/60 animate-pulse"
              >
                <div className="h-40 sm:h-48 bg-slate-200 dark:bg-slate-800" />
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-2">
                  <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6" staggerDelay={0.08}>
            {regions.map((region) => (
              <StaggerItem key={region.id}>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-700/60 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                  {/* Background image + region CTA */}
                  <button
                    type="button"
                    onClick={() => goToSearch(region.name)}
                    className="relative w-full h-40 sm:h-48 block overflow-hidden text-left"
                  >
                    <img
                      src={region.image}
                      alt={region.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between">
                      <h3 className="text-white text-xl md:text-2xl font-bold drop-shadow-md">
                        {region.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 text-slate-900 text-xs font-bold group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        {t('common.viewAll') || 'View All'}
                        <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </button>

                  {/* Country list */}
                  {region.destinations && region.destinations.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                        {region.destinations.map((destination) => (
                          <button
                            key={destination.id}
                            type="button"
                            onClick={() => goToSearch(destination.name)}
                            className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-left"
                          >
                            <FiMapPin size={12} className="text-teal-500 flex-shrink-0" />
                            <span className="truncate">{destination.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
};

export default PopularDestinationsSection;
