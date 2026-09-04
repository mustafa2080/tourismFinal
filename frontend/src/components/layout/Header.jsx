import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, useTheme } from '../../hooks';
import { useWishlistContext } from '../../hooks/useWishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useInstantTranslation } from '../../hooks/useInstantTranslation';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import Button from '../common/Button';
import {
  HiOutlineBars3, HiOutlineXMark, HiOutlineChevronDown, HiOutlineHome,
  HiOutlineMagnifyingGlass, HiOutlineBookmark, HiOutlineUser,
  HiOutlineMoon, HiOutlineSun, HiOutlineBell, HiOutlineInformationCircle,
  HiOutlineEnvelope, HiOutlineCog6Tooth, HiOutlineSparkles,
  HiOutlineArrowRightOnRectangle, HiOutlineUserPlus, HiOutlineArrowLeftOnRectangle,
} from 'react-icons/hi2';
import logoImg from '../../assets/logo.webp';
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
const MdOutlineLogin = HiOutlineArrowLeftOnRectangle;
const MdOutlinePersonAdd = HiOutlineUserPlus;
const MdLogout = HiOutlineArrowRightOnRectangle;

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
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const scrollTimeoutRef = useRef(null);

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

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

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
    { label: t('common.customTrip') || 'Custom Trip', path: '/custom-trip', icon: FiCompass, highlight: true },
    { label: t('common.about') || 'About', path: '/about', icon: FiInfo },
    { label: t('common.contact') || 'Contact', path: '/contact', icon: FiMail },
    { label: t('common.savedTrips') || 'Saved Trips', path: '/dashboard/wishlist', icon: FiBookmark, requiresAuth: true },
  ], [t, i18n.language, languageChangeCounter]);

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
              className="h-9 sm:h-10 lg:h-12 w-auto object-contain flex-shrink-0 drop-shadow-[0_2px_6px_rgba(180,140,50,0.35)] group-hover:drop-shadow-[0_4px_10px_rgba(180,140,50,0.5)] transition-all duration-300"
              loading="eager"
              decoding="async"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-sm lg:text-lg" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                <span style={{ color: '#14b8a6' }}>Trav</span><span style={{ color: '#f97316' }}>luyo</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tours</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-shrink min-w-0 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              if (link.requiresAuth && !isAuthenticated) return null;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-2 rounded-lg font-semibold text-[13px] xl:text-sm whitespace-nowrap transition-all duration-300 ease-out group relative ${
                    isActive(link.path)
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-900/20'
                      : link.highlight
                      ? 'text-white bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 shadow-md hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5'
                      : 'text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={17} className="transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
                  <span>{link.label}</span>
                  {link.label === 'Saved Trips' && wishlistCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                  <div
                    className={`absolute bottom-0.5 left-4 right-4 h-0.5 bg-gradient-to-r from-teal-600 to-orange-600 rounded-full transition-all duration-300 ease-out origin-center ${
                      isActive(link.path) ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-40'
                    }`}
                  />
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
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun size={20} className="text-yellow-500 transition-transform duration-500" />
              ) : (
                <FiMoon size={20} className="text-slate-600 transition-transform duration-500" />
              )}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 relative group hover:scale-110 active:scale-95"
                  title="Notifications"
                >
                  <FiBell size={20} className="text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-800">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
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
                )}
              </div>
            )}

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group"
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
                    <div className="w-8 lg:w-9 h-8 lg:h-9 bg-gradient-to-br from-teal-500 via-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
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
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 via-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
                )}

                <button
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
                    <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                  className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-300 px-2.5 lg:px-3 py-2 rounded-lg"
                >
                  <MdOutlineLogin size={16} className="flex-shrink-0" />
                  <span className="hidden lg:inline">Login</span>
                </Button>

                <div className="hidden lg:block h-6 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-1.5 text-xs lg:text-sm font-bold bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-300 px-3 lg:px-4 py-2 rounded-lg"
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
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-600 to-orange-600 flex-shrink-0">
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
                          ? 'bg-gradient-to-r from-teal-50 to-orange-50 dark:from-teal-900/20 dark:to-orange-900/20 text-teal-600 dark:text-teal-400 shadow-sm'
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
                  className="w-full justify-center bg-gradient-to-r from-teal-600 to-orange-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-600/30"
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
