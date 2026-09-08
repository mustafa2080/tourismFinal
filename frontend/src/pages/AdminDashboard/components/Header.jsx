import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiUser,
  FiSettings,
  FiChevronDown,
  FiLogOut,
  FiMoon,
  FiSun,
  FiMenu,
  FiX,
  FiHome,
  FiMail,
} from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import apiClient from '../../../services/apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function Header() {
  const { logOut } = useAdmin();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(0);

  // Fetch pending messages count
  useEffect(() => {
    const fetchPendingMessages = async () => {
      try {
        const response = await apiClient.get('/admin/contact/status/pending');
        setPendingMessages(response.data?.count || response.data?.length || 0);
      } catch (error) {
        console.error('Error fetching pending messages:', error);
      }
    };

    fetchPendingMessages();
    const interval = setInterval(fetchPendingMessages, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Set profile image
  useEffect(() => {
    if (user?.profileImage) {
      const imageUrl = `data:${user.profileImageMimeType || 'image/jpeg'};base64,${user.profileImage}`;
      setProfileImageUrl(imageUrl);
    } else if (user?.avatar) {
      setProfileImageUrl(user.avatar);
    }
  }, [user?.profileImage, user?.avatar, user?.profileImageMimeType]);

  const userInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'A';

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    logOut();
  };

  const handleNavigateToProfile = () => {
    navigate('/admin/profile');
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNavigateToSettings = () => {
    navigate('/admin/settings');
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 gap-4">
          
          {/* Left Side - Logo/Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
            </div>

            {/* Title - Show on sm and above */}
            <div className="hidden sm:flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tour Management System
              </p>
            </div>

            {/* Title - Mobile Only */}
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Go to Home Button */}
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 hidden sm:flex items-center gap-2"
              title="Go to Home Page"
              aria-label="Go to Home"
            >
              <FiHome size={20} className="text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Home</span>
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun size={20} className="text-slate-600 dark:text-slate-400" />
              ) : (
                <FiMoon size={20} className="text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {/* Contact Messages Button with Badge */}
            <div className="relative">
              <button
                onClick={() => navigate('/admin/contact')}
                className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                title="Contact Messages"
                aria-label="Contact Messages"
              >
                <FiMail size={20} className="text-slate-600 dark:text-slate-400" />
                {pendingMessages > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingMessages > 99 ? '99+' : pendingMessages}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications - Hidden on Mobile */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                aria-label="Notifications"
              >
                <FiBell size={20} className="text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      You have {pendingMessages} pending contact messages
                    </p>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-80 overflow-y-auto">
                    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 mt-1.5 bg-teal-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            New booking received
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            From: Ahmed Hassan - 2 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 mt-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Review pending approval
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Package: Nile Cruise - 15 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                    <button className="w-full text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings - Hidden on Mobile */}
            <button 
              onClick={handleNavigateToSettings}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 hidden lg:block"
              title="Settings"
              aria-label="Settings"
            >
              <FiSettings size={20} className="text-slate-600 dark:text-slate-400" />
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0 overflow-hidden">
                  {profileImageUrl ? (
                    <img 
                      src={profileImageUrl}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name?.split(' ')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Administrator
                  </p>
                </div>
                <FiChevronDown
                  size={16}
                  className={`hidden sm:block text-slate-600 dark:text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  {/* Profile Header */}
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.name || 'Administrator'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={handleNavigateToProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium group">
                      <FiUser size={18} className="text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                      <span>My Profile</span>
                    </button>

                    <button 
                      onClick={handleNavigateToSettings}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium group">
                      <FiSettings size={18} className="text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium group"
                    >
                      <FiLogOut size={18} className="text-red-500 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <FiX size={20} className="text-slate-600 dark:text-slate-400" />
              ) : (
                <FiMenu size={20} className="text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Expandable */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 py-3 space-y-1">
            <button 
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium">
              <FiHome size={18} className="text-slate-500" />
              <span>Go to Home</span>
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium">
              <FiBell size={18} className="text-slate-500" />
              <span>Notifications</span>
            </button>
            <button 
              onClick={handleNavigateToProfile}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium">
              <FiUser size={18} className="text-slate-500" />
              <span>My Profile</span>
            </button>
            <button 
              onClick={handleNavigateToSettings}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium">
              <FiSettings size={18} className="text-slate-500" />
              <span>Settings</span>
            </button>
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
            >
              <FiLogOut size={18} className="text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
