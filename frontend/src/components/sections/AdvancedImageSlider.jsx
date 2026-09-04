import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Advanced Image Slider with Stats
 * Premium slider with tourism data and rich interactions
 */
const AdvancedImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const autoPlayRef = useRef(null);

  const slides = [
    {
      id: 1,
      title: 'Tropical Beaches',
      subtitle: 'Crystal clear waters and pristine white sand',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop',
      category: 'Beach',
      stats: { visitors: '2.5M', rating: '4.9/5', duration: '5-7 days' },
    },
    {
      id: 2,
      title: 'Alpine Mountains',
      subtitle: 'Majestic peaks and thrilling hiking trails',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
      category: 'Adventure',
      stats: { visitors: '1.8M', rating: '4.8/5', duration: '6-10 days' },
    },
    {
      id: 3,
      title: 'Ancient Ruins',
      subtitle: 'Step back in time exploring historical wonders',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop',
      category: 'Cultural',
      stats: { visitors: '3.2M', rating: '4.9/5', duration: '4-6 days' },
    },
    {
      id: 4,
      title: 'Desert Landscapes',
      subtitle: 'Experience endless dunes under starlit skies',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop',
      category: 'Desert',
      stats: { visitors: '1.2M', rating: '4.7/5', duration: '3-5 days' },
    },
    {
      id: 5,
      title: 'Vibrant Cities',
      subtitle: 'Discover dynamic urban culture and architecture',
      image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=600&fit=crop',
      category: 'City',
      stats: { visitors: '4.1M', rating: '4.8/5', duration: '3-4 days' },
    },
    {
      id: 6,
      title: 'Tropical Rainforests',
      subtitle: 'Immerse in biodiversity and nature adventures',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop',
      category: 'Nature',
      stats: { visitors: '900K', rating: '4.9/5', duration: '5-7 days' },
    },
  ];

  useEffect(() => {
    if (!isAutoPlay) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlay, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full space-y-6">
      {/* Main Slider */}
      <section
        className="relative w-full aspect-video sm:aspect-auto sm:h-96 lg:h-[500px] overflow-hidden bg-slate-900 rounded-3xl shadow-2xl"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        {/* Slides */}
        <div className="relative w-full h-full">
          {slides.map((s, index) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="absolute inset-0 z-10 flex items-center p-6 sm:p-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                {slide.category}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 leading-tight">
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg text-white/80 mb-6">
              {slide.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105">
                Explore
              </button>
              <button className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/40 text-white font-semibold rounded-lg hover:bg-white/30 transition-all">
                Details
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            onClick={handlePrev}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white transition-all hover:scale-110"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white transition-all hover:scale-110"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Indicator */}
        <div className="absolute top-4 right-4 z-20 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/40 rounded-full text-white text-xs font-bold">
          {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentSlide
                  ? 'w-8 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/70'
              }`}
            ></button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-orange-500 transition-all duration-500"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          ></div>
        </div>
      </section>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Visitors */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-2xl p-4 border border-teal-200 dark:border-teal-700/50">
            <div className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 mb-1">
              {slide.stats.visitors}
            </div>
            <div className="text-xs sm:text-sm text-teal-600/70 dark:text-teal-300/70 font-semibold uppercase tracking-wider">
              Annual Visitors
            </div>
          </div>

          {/* Rating */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-700/50">
            <div className="text-2xl sm:text-3xl font-black text-yellow-600 dark:text-yellow-400 mb-1">
              {slide.stats.rating}
            </div>
            <div className="text-xs sm:text-sm text-yellow-600/70 dark:text-yellow-300/70 font-semibold uppercase tracking-wider">
              Rating
            </div>
          </div>

          {/* Duration */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-2xl p-4 border border-green-200 dark:border-green-700/50">
            <div className="text-xl sm:text-2xl font-black text-green-600 dark:text-green-400 mb-1">
              {slide.stats.duration}
            </div>
            <div className="text-xs sm:text-sm text-green-600/70 dark:text-green-300/70 font-semibold uppercase tracking-wider">
              Best Duration
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Strip */}
      <div className="hidden lg:flex gap-3 overflow-x-auto pb-2">
        {slides.map((s, index) => (
          <button
            key={s.id}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 relative overflow-hidden rounded-lg border-2 transition-all ${
              index === currentSlide
                ? 'border-teal-500 ring-2 ring-teal-300 w-32 h-24'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 w-28 h-20'
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
            />
            {index === currentSlide && (
              <div className="absolute inset-0 bg-teal-600/20 backdrop-blur-sm"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdvancedImageSlider;
