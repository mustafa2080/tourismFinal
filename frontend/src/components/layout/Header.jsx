import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, useTheme } from '../../hooks';
import { useWishlistContext } from '../../hooks/useWishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useInstantTranslation } from '../../hooks/useInstantTranslation';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import Button from '../common/Button';
import { 
  FiMenu, FiX, FiChevronDown, FiHome, FiSearch, FiBookmark, FiUser, 
  FiMoon, FiSun, FiBell, FiInfo, FiMail, FiSettings
} from 'react-icons/fi';
import { MdOutlineLogin, MdOutlinePersonAdd, MdLogout } from 'react-icons/md';
import logoImg from '../../assets/logo.webp';
import { notificationsService } from '../../services';
import { socketService } from '../../services/socketService';
import { showSuccessToast, showErrorToast } from '../../utils/notifications';
import { getNavigationPathFromNotification } from '../../utils/notificationNavigation';

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
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20 gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 flex-shrink-0 group cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          >
            <img
              src={logoImg}
              alt="Travluyo Logo"
              className="h-11 lg:h-14 w-auto object-contain flex-shrink-0 drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
              loading="eager"
              decoding="async"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-sm lg:text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                Travluyo
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tours</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              if (link.requiresAuth && !isAuthenticated) return null;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ease-out group relative ${
                    isActive(link.path)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20'
                      : link.highlight
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5'
                      : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  <span>{link.label}</span>
                  {link.label === 'Saved Trips' && wishlistCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                  <div
                    className={`absolute bottom-0.5 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300 ease-out origin-center ${
                      isActive(link.path) ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-40'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 lg:gap-3 ml-auto">
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
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
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
                          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                              !notif.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-slate-50/50 dark:bg-slate-700/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
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
                      className="w-8 lg:w-9 h-8 lg:h-9 rounded-full object-cover group-hover:shadow-md group-hover:shadow-blue-500/20 group-hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700"
                      onError={() => setProfileImageUrl(null)}
                    />
                  ) : user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 lg:w-9 h-8 lg:h-9 rounded-full object-cover group-hover:shadow-lg transition-all duration-300"
                    />
                  ) : (
                    <div className="w-8 lg:w-9 h-8 lg:h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
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
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
                            className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 text-blue-600 dark:text-blue-400 transition-colors group font-semibold"
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
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                  className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 px-2.5 lg:px-3 py-2 rounded-lg"
                >
                  <MdOutlineLogin size={16} className="flex-shrink-0" />
                  <span className="hidden lg:inline">Login</span>
                </Button>

                <div className="hidden lg:block h-6 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-1.5 text-xs lg:text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 px-3 lg:px-4 py-2 rounded-lg"
                >
                  <MdOutlinePersonAdd size={16} className="flex-shrink-0" />
                  <span>Sign Up</span>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 active:scale-90"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-300 relative z-50">
            <nav className="flex flex-col gap-0.5 mt-3">
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
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${
                      isActive(link.path)
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400'
                        : link.highlight
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600'
                    }`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1 text-left">{link.label}</span>
                    {link.label === 'Saved Trips' && wishlistCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-center text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2.5 rounded-lg font-semibold text-sm"
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
                    className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-bold text-sm"
                  >
                    <MdOutlinePersonAdd size={18} className="mr-2" />
                    Sign Up
                  </Button>
                </div>
              )}

              {isAuthenticated && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <FiUser size={14} className="flex-shrink-0" />
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <MdLogout size={14} className="flex-shrink-0" />
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
