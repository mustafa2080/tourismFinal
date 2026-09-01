import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Modern Image Slider Component
 * Beautiful tourism image showcase with auto-play and manual controls
 */
const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayRef = useRef(null);

  // Tourism images collection
  const slides = [
    {
      id: 1,
      title: 'Tropical Paradise',
      subtitle: 'Experience pristine beaches and crystal clear waters',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop',
      category: 'Beach',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 2,
      title: 'Mountain Adventure',
      subtitle: 'Discover breathtaking peaks and thrilling trails',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
      category: 'Adventure',
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 3,
      title: 'Cultural Heritage',
      subtitle: 'Explore ancient ruins and rich traditions',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop',
      category: 'Cultural',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 4,
      title: 'Desert Wonders',
      subtitle: 'Feel the magic of endless golden dunes',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop',
      category: 'Desert',
      color: 'from-yellow-500 to-amber-600',
    },
    {
      id: 5,
      title: 'Urban Exploration',
      subtitle: 'Discover vibrant cities and modern wonders',
      image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=600&fit=crop',
      category: 'City',
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 6,
      title: 'Jungle Expedition',
      subtitle: 'Immerse yourself in nature and wildlife',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop',
      category: 'Nature',
      color: 'from-teal-500 to-green-600',
    },
  ];

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlay) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, slides.length]);

  // Handle manual slide change
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

  const handleMouseEnter = () => setIsAutoPlay(false);
  const handleMouseLeave = () => setIsAutoPlay(true);

  const slide = slides[currentSlide];

  return (
    <section className="w-full h-screen max-h-[600px] relative overflow-hidden bg-slate-900 rounded-3xl shadow-2xl mx-auto">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div
        className="relative z-10 w-full h-full flex items-center px-6 sm:px-8 lg:px-12"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-2xl">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${slide.color}`}></div>
            <span className="text-sm font-bold text-white uppercase tracking-widest">
              {slide.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 leading-tight animate-fade-in">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl leading-relaxed animate-fade-in-delayed">
            {slide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delayed-2">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
              Explore Now
            </button>
            <button className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 text-white font-bold rounded-lg transition-all duration-300 hover:border-white/60">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white transition-all duration-300 group hover:border-white/60"
          aria-label="Previous slide"
        >
          <FiChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white transition-all duration-300 group hover:border-white/60"
          aria-label="Next slide"
        >
          <FiChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 sm:right-8 z-20">
        <div className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/40 rounded-full text-white text-sm font-bold">
          {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-10 h-2.5 bg-white'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
        <div
          className={`h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300`}
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        ></div>
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute left-0 right-0 bottom-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-6 hidden lg:flex gap-3 justify-center overflow-x-auto">
        {slides.map((s, index) => (
          <button
            key={s.id}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
              index === currentSlide
                ? 'border-white ring-2 ring-white/50 scale-110'
                : 'border-white/30 hover:border-white/60'
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default ImageSlider;
