import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, useTheme } from '../../hooks';
import { useWishlistContext } from '../../hooks/useWishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useInstantTranslation } from '../../hooks/useInstantTranslation';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import Button from '../common/Button';
import regionService from '../../services/regionService';
import {
  HiOutlineBars3, HiOutlineXMark, HiOutlineChevronDown, HiOutlineHome,
  HiOutlineMagnifyingGlass, HiOutlineBookmark, HiOutlineUser,
  HiOutlineMoon, HiOutlineSun, HiOutlineBell, HiOutlineInformationCircle,
  HiOutlineEnvelope, HiOutlineCog6Tooth, HiOutlineSparkles,
  HiOutlineArrowRightOnRectangle, HiOutlineUserPlus, HiOutlineArrowLeftOnRectangle,
  HiOutlineNewspaper, HiOutlinePhone, HiOutlineGlobeAlt, HiOutlineTag,
  HiOutlineMapPin, HiOutlineShieldCheck,
} from 'react-icons/hi2';
import logoImg from '../../assets/logo4.webp';
import { notificationsService } from '../../services';
import { socketService } from '../../services/socketService';
import { showSuccessToast, showErrorToast } from '../../utils/notifications';
import { getNavigationPathFromNotification } from '../../utils/notificationNavigation';

// Aliases so the rest of the component's JSX (which already references
// these names) doesn't need to change everywhere.
const FiMenu = HiOutlineBars3;
const FiX = HiOutlineXMark;
const FiChevronDown = HiOutlineChevronDown;
const FiHome = HiOutlineHome;
const FiSearch = HiOutlineMagnifyingGlass;
const FiBookmark = HiOutlineBookmark;
const FiUser = HiOutlineUser;
const FiMoon = HiOutlineMoon;
const FiSun = HiOutlineSun;
const FiBell = HiOutlineBell;
const FiInfo = HiOutlineInformationCircle;
const FiMail = HiOutlineEnvelope;
const FiSettings = HiOutlineCog6Tooth;
const FiCompass = HiOutlineSparkles;
const FiNewspaper = HiOutlineNewspaper;
const MdOutlineLogin = HiOutlineArrowLeftOnRectangle;
const MdOutlinePersonAdd = HiOutlineUserPlus;
const MdLogout = HiOutlineArrowRightOnRectangle;
const FiPhone = HiOutlinePhone;
const FiGlobe = HiOutlineGlobeAlt;
const FiTag = HiOutlineTag;
const FiPin = HiOutlineMapPin;
const FiShield = HiOutlineShieldCheck;

// Region/destination data for the "Destinations" megamenu is fetched live
// from the admin-managed regions API (see fetchDestinationRegions below),
// so it always mirrors the homepage's PopularDestinationsSection and
// whatever the admin configures in the Regions dashboard page.

// Quick trip-type filters shown in the strip under the main navbar - mirrors
// the "Top deals / Adventure / Beach ..." quick-select tags on the homepage
// hero search, kept accessible from anywhere in the site.
const QUICK_FILTERS = [
  { id: 'deals', label: 'Top Deals', icon: '🔥' },
  { id: 'adventure', label: 'Adventure', icon: '⛰️' },
  { id: 'beach', label: 'Beach', icon: '🏖️' },
  { id: 'cultural', label: 'Cultural', icon: '🏛️' },
  { id: 'luxury', label: 'Luxury', icon: '👑' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useInstantTranslation(); // استخدام الترجمة الفورية
  const { languageChangeCounter } = useLanguage(); // Track language changes
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { count: wishlistCount } = useWishlistContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [destinationsMenuOpen, setDestinationsMenuOpen] = useState(false);
  const [mobileDestinationsOpen, setMobileDestinationsOpen] = useState(false);
  const [destinationRegions, setDestinationRegions] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const scrollTimeoutRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const userMenuButtonMobileRef = useRef(null);
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 0 });
  const notifButtonRef = useRef(null);
  const [notifMenuPosition, setNotifMenuPosition] = useState({ top: 0, right: 0 });
  const destinationsButtonRef = useRef(null);
  const [destinationsMenuPosition, setDestinationsMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleScroll = () => {
      // Debounce scroll event
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setScrolled(window.scrollY > 20);
      }, 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Load the Destinations megamenu content once on mount from the
  // admin-managed regions API (same data source as the homepage's
  // Popular Destinations section and the admin Regions page).
  useEffect(() => {
    let cancelled = false;
    regionService.getAllRegions()
      .then((regions) => {
        if (cancelled) return;
        const list = Array.isArray(regions) ? regions : (regions?.data || []);
        setDestinationRegions(list);
      })
      .catch((error) => {
        console.error('Failed to load destinations for navbar menu:', error);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
    setDestinationsMenuOpen(false);
    setMobileDestinationsOpen(false);
  }, [location.pathname]);

  // Keep the portal-rendered user dropdown anchored under its trigger button,
  // recalculating on open, resize, and scroll so it never drifts off-screen
  // or gets clipped by the header's backdrop-blur/transform stacking context.
  useEffect(() => {
    if (!userDropdownOpen) return;

    const updatePosition = () => {
      const desktopBtn = userMenuButtonRef.current;
      const mobileBtn = userMenuButtonMobileRef.current;
      const btn = desktopBtn && desktopBtn.offsetParent !== null
        ? desktopBtn
        : (mobileBtn && mobileBtn.offsetParent !== null ? mobileBtn : null);
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setUserMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [userDropdownOpen]);

  // Same anchoring fix for the Destinations megamenu: the button's parent
  // <nav> has overflow-x-auto (for horizontal scrolling of nav links on
  // smaller screens), which clips any absolutely-positioned child that
  // overflows the nav's height — including this dropdown. Rendering it via
  // portal with fixed positioning avoids the clipping entirely.
  useEffect(() => {
    if (!destinationsMenuOpen) return;

    const updatePosition = () => {
      const btn = destinationsButtonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setDestinationsMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [destinationsMenuOpen]);

  // Same anchoring fix for the notifications dropdown.
  useEffect(() => {
    if (!notificationsOpen) return;

    const updatePosition = () => {
      const btn = notifButtonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setNotifMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [notificationsOpen]);

  // Debug wishlist count changes
  useEffect(() => {
    if (wishlistCount > 0) {
      console.log('🛍️ [Header] Wishlist count updated:', wishlistCount);
    }
  }, [wishlistCount]);

  useEffect(() => {
    let mounted = true;
    
    if (isAuthenticated && user) {
      // Use avatar from user context (which includes profileImage as base64)
      // Prioritize profileImage as it's updated after upload
      if (user.profileImage && typeof user.profileImage === 'string') {
        // Validate that it's a valid base64 string (not an object)
        const imageUrl = `data:${user.profileImageMimeType || 'image/jpeg'};base64,${user.profileImage}`;
        setProfileImageUrl(imageUrl);
      } else if (user.avatar && typeof user.avatar === 'string') {
        setProfileImageUrl(user.avatar);
      } else {
        setProfileImageUrl(null);
      }
      
      const timer = setTimeout(() => {
        if (mounted) fetchNotifications();
      }, 500);
      
      return () => {
        clearTimeout(timer);
        mounted = false;
      };
    } else {
      if (mounted) {
        setNotifications([]);
        setProfileImageUrl(null);
      }
    }
    
    return () => { mounted = false; };
  }, [isAuthenticated, user?.id, user?.profileImage, user?.avatar, user?.profileImageMimeType]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationsService.getNotifications({ limit: 5 });
      setNotifications(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Setup WebSocket listener for new notifications
  useEffect(() => {
    let mounted = true;

    const setupWebSocketListener = () => {
      const socket = socketService?.getSocket?.();
      if (!socket?.connected) {
        console.debug('Socket not connected yet for notifications');
        return;
      }

      console.log('✅ Setting up WebSocket listener for notifications. Socket ID:', socket.id);

      // Subscribe to user notifications
      socket.emit('subscribe:user', user?.id);
      console.log('📍 Subscribed to user notifications for:', user?.id);

      socket.on('notification:new', (notification) => {
        if (!mounted) return;
        
        console.log('🔔 New notification received in Header:', notification);
        
        // Add new notification to list
        setNotifications(prev => [notification, ...prev].slice(0, 5));
        
        // Show toast
        showSuccessToast(`${notification.title || 'Notification'}`, {
          duration: 4000,
        });
      });

      socket.on('notifications:unread-count', (data) => {
        if (!mounted) return;
        console.log('📊 Unread count updated via socket:', data.unreadCount);
        // Don't update unreadCount here as it's computed from notifications array
      });

      return () => {
        socket?.off?.('notification:new');
        socket?.off?.('notifications:unread-count');
      };
    };

    if (isAuthenticated && user?.id) {
      const cleanup = setupWebSocketListener();
      return cleanup;
    }
  }, [isAuthenticated, user?.id]);

  const navLinks = useMemo(() => [
    { label: t('common.home') || 'Home', path: '/', icon: FiHome },
    { label: t('common.explore') || 'Explore', path: '/search', icon: FiSearch},
    { label: t('common.customTrip') || 'Custom Trip', path: '/custom-trip', icon: FiCompass },
    { label: t('common.blog') || 'Blog', path: '/blog', icon: FiNewspaper },
    { label: t('common.about') || 'About', path: '/about', icon: FiInfo },
    { label: t('common.contact') || 'Contact', path: '/contact', icon: FiMail },
    { label: t('common.savedTrips') || 'Saved Trips', path: '/dashboard/wishlist', icon: FiBookmark, requiresAuth: true },
  ], [t, i18n.language, languageChangeCounter]);

  // Navigate to the search page filtered by a free-text query (destination
  // name, region name, or quick-filter type). Used by the Destinations
  // megamenu and the quick-filter strip below the navbar.
  const goToSearch = useCallback((query, type) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type) params.append('type', type);
    navigate(`/search?${params.toString()}`);
    setDestinationsMenuOpen(false);
    setMobileMenuOpen(false);
  }, [navigate]);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);
  
  const handleLogout = useCallback(() => {
    logout();
    setUserDropdownOpen(false);
  }, [logout]);
  
  const unreadCount = useMemo(() => {
    const count = notifications.filter(n => !n.is_read && !n.read).length;
    console.log('📊 [Header] Computing unread count:', count, 'from', notifications.length, 'notifications');
    return count;
  }, [notifications]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-500 ease-out pointer-events-auto ${
        scrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] dark:bg-slate-900/90 dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border-b border-slate-200/60 dark:border-slate-700/60'
          : 'bg-white/40 backdrop-blur-sm dark:bg-slate-900/40 border-b border-transparent'
      }`}
    >
      {/* ==================== TOP UTILITY BAR ==================== */}
      {/* Collapses smoothly once the page is scrolled, like TourRadar's
          thin trust-signal strip above the main navbar. */}
      <div
        className={`hidden md:block w-full bg-slate-900 dark:bg-black text-slate-300 overflow-hidden transition-all duration-300 ease-out ${
          scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
        }`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 lg:gap-6">
            <span className="flex items-center gap-1.5">
              <FiShield size={13} className="text-teal-400" />
              {t('header.trustedOperators') || '500+ trusted tour operators'}
            </span>
            <span className="hidden lg:flex items-center gap-1.5">
              <FiPin size={13} className="text-teal-400" />
              {t('header.destinationsCount') || '850+ destinations worldwide'}
            </span>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => navigate('/contact')}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <FiPhone size={13} className="text-teal-400" />
              {t('header.support247') || '24/7 Customer Support'}
            </button>
            <button
              onClick={() => navigate('/custom-trip')}
              className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors font-medium"
            >
              {t('header.becomeGuide') || 'Become a Guide'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:h-24 gap-2 lg:gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 group cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          >
            <img
              src={logoImg}
              alt="Travluyo Logo"
              className="h-8 sm:h-9 lg:h-10 w-auto object-contain flex-shrink-0 drop-shadow-[0_2px_6px_rgba(180,140,50,0.35)] group-hover:drop-shadow-[0_4px_10px_rgba(180,140,50,0.5)] transition-all duration-300"
              loading="eager"
              decoding="async"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-shrink min-w-0 overflow-x-auto no-scrollbar pl-2">
            {/* Destinations Megamenu Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setDestinationsMenuOpen(true)}
              onMouseLeave={() => setDestinationsMenuOpen(false)}
            >
              <button
                onClick={() => setDestinationsMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 rounded-full font-semibold text-[13px] xl:text-sm whitespace-nowrap transition-all duration-300 ease-out group relative ${
                  destinationsMenuOpen
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/60 shadow-sm'
                    : 'text-slate-600 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                }`}
                aria-haspopup="true"
                aria-expanded={destinationsMenuOpen}
              >
                <FiGlobe size={15} className={`transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${destinationsMenuOpen ? '' : 'text-slate-400'}`} />
                <span>{t('common.destinations') || 'Destinations'}</span>
                <FiChevronDown size={14} className={`transition-transform duration-300 ${destinationsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Megamenu Panel */}
              {destinationsMenuOpen && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="w-[880px] max-w-[85vw] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-700/80 p-6 grid grid-cols-4 gap-x-6 gap-y-5 max-h-[70vh] overflow-y-auto">
                    {destinationRegions.map((region) => (
                      <div key={region.id}>
                        <button
                          onClick={() => goToSearch(region.name)}
                          className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-2.5"
                        >
                          {region.name}
                        </button>
                        <ul className="space-y-2">
                          {(region.destinations || []).map((dest) => (
                            <li key={dest.id}>
                              <button
                                onClick={() => goToSearch(dest.name)}
                                className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-left"
                              >
                                <span>{dest.name}</span>
                                {dest.badge && (
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                                    dest.badge === 'trending'
                                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                                      : 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300'
                                  }`}>
                                    {dest.badge === 'trending' ? 'Trending' : 'Top seller'}
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => goToSearch(region.name)}
                          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors mt-2.5"
                        >
                          {t('common.seeAll') || 'See all'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              if (link.requiresAuth && !isAuthenticated) return null;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 rounded-full font-semibold text-[13px] xl:text-sm whitespace-nowrap transition-all duration-300 ease-out group relative ${
                    isActive(link.path)
                      ? 'text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/60 shadow-sm'
                      : link.highlight
                      ? 'text-white bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 shadow-md hover:shadow-lg hover:shadow-teal-500/20'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={15} className={`transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${isActive(link.path) || link.highlight ? '' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.label === 'Saved Trips' && wishlistCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 ml-auto flex-shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun size={18} className="text-yellow-500 transition-transform duration-500" />
              ) : (
                <FiMoon size={18} className="text-slate-600 transition-transform duration-500" />
              )}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative hidden sm:block">
                <button
                  ref={notifButtonRef}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 relative group hover:scale-105 active:scale-95"
                  title="Notifications"
                >
                  <FiBell size={17} className="text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-800">
                      {unreadCount > 9 ? '9+' : unreadCount}
 </span>
 )}
 </button>

 {notificationsOpen && createPortal(
 <>
 <div
 className="fixed inset-0 z-[9998]"
 onClick={() => setNotificationsOpen(false)}
 />
 <div
 className="fixed w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
 style={{ top: notifMenuPosition.top, right: notifMenuPosition.right }}
 >
 <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-[#0d9488] ">
 <div className="flex items-center justify-between">
 <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
 {unreadCount > 0 && (
 <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
 {unreadCount} new
 </span>
 )}
 </div>
 </div>
 <div className="max-h-72 overflow-y-auto">
 {loadingNotifications ? (
 <div className="px-4 py-8 text-center">
 <div className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
 </div>
 ) : notifications.length > 0 ? (
 notifications.map((notif, idx) => (
 <div 
 key={notif.id || idx}
 onClick={async () => {
 // Mark as read when clicked
 if (!notif.is_read && !notif.read) {
 try {
 await notificationsService.markAsRead(notif.id);
 // Update notifications list properly
 setNotifications(prev => {
 const updated = prev.map(n => 
 n.id === notif.id ? { ...n, is_read: true, read: true } : n
 );
 console.log('✅ Notification marked as read. Updated list:', updated);
                                    return updated;
                                  });
                                  showSuccessToast('Notification marked as read');
                                } catch (error) {
                                  console.error('Failed to mark notification as read:', error);
                                  showErrorToast('Failed to mark notification as read');
                                }
                              }

                              // Navigate based on notification type and payload
                              const navigatePath = getNavigationPathFromNotification(notif);

                              if (navigatePath) {
                                navigate(navigatePath);
                                setNotificationsOpen(false);
                              } else {
                                console.warn('⚠️ Could not determine navigation path for notification:', notif);
                              }
                            }}
                            className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer group ${
                              !notif.is_read ? 'bg-teal-50 dark:bg-teal-900/10' : 'bg-slate-50/50 dark:bg-slate-700/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-900 dark:text-white font-medium group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                  {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 {!notif.is_read && (
 <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1" />
 )}
 </div>
 </div>
 ))
 ) : (
 <div className="px-4 py-8 text-center">
 <FiBell size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2 opacity-50" />
 <p className="text-sm text-slate-500 dark:text-slate-400">No notifications</p>
 </div>
 )}
 </div>
 </div>
 </>,
 document.body
 )}
 </div>
 )}

 {/* Auth Section */}
 {isAuthenticated && user ? (
 <div className="relative flex items-center">
 <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
 <button
 ref={userMenuButtonRef}
 onClick={() => setUserDropdownOpen(!userDropdownOpen)}
 className="hidden sm:flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group"
 >
 {profileImageUrl ? (
 <img 
 src={profileImageUrl}
 alt={user.name}
 className="w-8 lg:w-9 h-8 lg:h-9 rounded-full object-cover group-hover:shadow-md group-hover:shadow-teal-500/20 group-hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700"
 onError={() => setProfileImageUrl(null)}
 />
 ) : user.avatar ? (
 <img 
 src={user.avatar} 
 alt={user.name}
 className="w-8 lg:w-9 h-8 lg:h-9 rounded-full object-cover group-hover:shadow-lg transition-all duration-300"
 />
 ) : (
 <div className="w-8 lg:w-9 h-8 lg:h-9 bg-[#0d9488] rounded-full flex items-center justify-center text-white text-xs font-bold">
 {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="font-semibold text-slate-700 dark:text-slate-200 hidden lg:inline text-sm">
                    {user.name?.split(' ')[0]}
                  </span>
                  <FiChevronDown
                    size={16}
                    className={`transition-transform duration-300 text-slate-600 dark:text-slate-400 ${userDropdownOpen ? 'rotate-180' : ''}`}
 />
 </button>

 {userDropdownOpen && createPortal(
 <>
 {/* Transparent overlay to catch outside clicks and close the menu */}
 <div
 className="fixed inset-0 z-[9998]"
 onClick={() => setUserDropdownOpen(false)}
 />
 <div
 className="fixed w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
 style={{ top: userMenuPosition.top, right: userMenuPosition.right }}
 >
 <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-[#0d9488] ">
 <div className="flex items-center gap-3">
 {profileImageUrl ? (
 <img 
 src={profileImageUrl}
 alt={user.name}
 className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700"
 onError={() => setProfileImageUrl(null)}
 />
 ) : user.avatar ? (
 <img 
 src={user.avatar} 
 alt={user.name}
 className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700"
 />
 ) : (
 <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold">
 {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/dashboard/profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors duration-200 group"
                      >
                        <FiUser size={14} className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors duration-200 group"
                      >
                        <FiSettings size={14} className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                        <span>Dashboard</span>
                      </button>
                      
                      {user?.role === 'admin' && (
                        <>
                          <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                          <button
                            onClick={() => {
                              navigate('/admin');
 setUserDropdownOpen(false);
 }}
 className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 flex items-center gap-3 text-teal-600 dark:text-teal-400 transition-colors group font-semibold"
 >
 <span className="text-sm">⚙️</span>
 <span>Admin Panel</span>
 </button>
 </>
 )}
 
 <button
 onClick={handleLogout}
 className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors duration-200 group"
 >
 <MdLogout size={14} className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
 <span>Logout</span>
 </button>
 </div>
 </div>
 </>,
 document.body
 )}

 <button
 ref={userMenuButtonMobileRef}
 onClick={() => setUserDropdownOpen(!userDropdownOpen)}
 className="sm:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95"
 >
 {profileImageUrl ? (
 <img 
 src={profileImageUrl}
 alt={user.name}
 className="w-7 h-7 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600"
 onError={() => setProfileImageUrl(null)}
 />
 ) : user.avatar ? (
 <img 
 src={user.avatar} 
 alt={user.name}
 className="w-7 h-7 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600"
 />
 ) : (
 <div className="w-7 h-7 bg-[#0d9488] rounded-full flex items-center justify-center text-white text-xs font-bold">
 {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 lg:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
 className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-300 px-2.5 lg:px-3.5 py-2 rounded-full"
 >
 <MdOutlineLogin size={16} className="flex-shrink-0" />
 <span className="hidden lg:inline">Login</span>
 </Button>

 <div className="hidden lg:block h-6 w-px bg-[#0d9488] " />

 <Button
 variant="primary"
 size="sm"
 onClick={() => navigate('/signup')}
 className="flex items-center gap-1.5 text-xs lg:text-sm font-bold bg-[#0d9488] text-white shadow-md hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 px-3.5 lg:px-4.5 py-2 rounded-full"
 >
 <MdOutlinePersonAdd size={16} className="flex-shrink-0" />
 <span>Sign Up</span>
 </Button>
 </div>
 )}

 {/* Mobile Menu Button */}
 <button
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className={`lg:hidden p-2 rounded-lg transition-all duration-300 active:scale-90 ${
 mobileMenuOpen
 ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
 }`}
 aria-label="Toggle menu"
 aria-expanded={mobileMenuOpen}
 >
 {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
 </button>
 </div>
 </div>
 </div>

      {/* ==================== QUICK FILTER STRIP ==================== */}
      {/* TourRadar-style row of trip-type shortcuts under the main navbar,
          hidden once scrolled to keep the sticky header compact. */}
      <div
        className={`hidden md:block w-full border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out ${
          scrolled ? 'max-h-0 opacity-0 border-t-0' : 'max-h-12 opacity-100'
        }`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 flex-shrink-0 pr-1">
            <FiTag size={13} />
            {t('header.quickFilters') || 'Quick picks:'}
          </span>
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => goToSearch('', filter.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all flex-shrink-0"
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

 {/* Mobile Side Drawer - rendered via portal so it always covers the full viewport,
 regardless of any backdrop-blur/transform on ancestor elements like <header> */}
 {mobileMenuOpen && createPortal(
 <>
 {/* Overlay */}
 <div
 className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9998] animate-in fade-in duration-300"
 onClick={() => setMobileMenuOpen(false)}
 />

 {/* Drawer panel */}
 <div className="lg:hidden fixed top-0 right-0 h-screen w-[86%] xs:w-[82%] max-w-[340px] bg-white dark:bg-slate-900 z-[9999] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
 {/* Drawer header */}
 <div className="flex items-center justify-between px-5 py-4 bg-[#0d9488] flex-shrink-0">
 <div className="flex items-center gap-2.5">
 <img src={logoImg} alt="Travluyo" className="h-11 w-auto object-contain drop-shadow-md" />
 <span className="text-white font-extrabold text-lg tracking-tight">Travluyo</span>
 </div>
 <button
 onClick={() => setMobileMenuOpen(false)}
 className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all duration-200 active:scale-90"
 aria-label="Close menu"
 >
 <FiX size={20} />
 </button>
 </div>

 {/* Drawer body (scrollable) */}
 <div className="flex-1 overflow-y-auto px-4 py-5">
              {/* Destinations accordion (mobile) */}
              <div className="mb-3 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileDestinationsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 font-semibold text-sm text-slate-700 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <FiGlobe size={16} className="text-teal-500" />
                    {t('common.destinations') || 'Destinations'}
                  </span>
                  <FiChevronDown size={16} className={`transition-transform duration-300 ${mobileDestinationsOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileDestinationsOpen && (
                  <div className="px-4 py-3 space-y-3 bg-white dark:bg-slate-900">
                    {destinationRegions.map((region) => (
                      <div key={region.id}>
                        <button
                          onClick={() => goToSearch(region.name)}
                          className="text-xs font-bold text-slate-800 dark:text-white mb-1.5 block"
                        >
                          {region.name}
                        </button>
                        <div className="flex flex-wrap gap-1.5">
                          {(region.destinations || []).map((dest) => (
                            <button
                              key={dest.id}
                              onClick={() => goToSearch(dest.name)}
                              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              {dest.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

 <nav className="flex flex-col gap-1">
 {navLinks.map((link) => {
 const Icon = link.icon;
 if (link.requiresAuth && !isAuthenticated) return null;
 return (
 <button
 key={link.path}
 onClick={() => {
 navigate(link.path);
 setMobileMenuOpen(false);
 }}
 className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${
 isActive(link.path)
 ? 'bg-gradient-to-r from-teal-50 to-amber-50 dark:from-teal-900/20 dark:to-teal-900/20 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600'
                      }`}
                    >
                      <span className={`flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 ${
                        isActive(link.path)
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 text-left">{link.label}</span>
                      {link.label === 'Saved Trips' && wishlistCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {isAuthenticated && (
                <div className="flex flex-col gap-1 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-[0.98]"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0">
                      <FiUser size={16} />
                    </span>
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 transition-all duration-200 active:scale-[0.98]"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex-shrink-0">
                      <MdLogout size={16} />
                    </span>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Drawer footer - auth actions for guests */}
            {!isAuthenticated && (
              <div className="flex-shrink-0 flex flex-col gap-2.5 px-4 py-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 py-2.5 rounded-xl font-semibold text-sm"
                >
                  <MdOutlineLogin size={18} className="mr-2" />
                  Login
                </Button>

                <Button
                  variant="primary"
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center bg-[#0d9488] text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-600/30"
                >
                  <MdOutlinePersonAdd size={18} className="mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </header>
  );
};

export default Header;
