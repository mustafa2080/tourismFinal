import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, useMyBookings, useAdvancedStats } from '../hooks';
import { useWishlistContext } from '../hooks/useWishlistContext';
import { bookingsService, uploadService } from '../services';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { formatBookingDate, formatDateRange } from '../utils/bookingDateFormatter';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiLogOut, FiSettings, FiBell, FiMapPin, FiCalendar, FiDollarSign, FiUsers, FiStar, FiCheck, FiClock, FiX, FiDownload, FiArrowUp, FiFilter, FiSearch, FiCamera, FiUser, FiEdit2, FiSave, FiTrash2, FiBookmark, FiExternalLink, FiImage } from 'react-icons/fi';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { compressImage, validateImageFile, formatFileSize } from '../utils/imageCompression';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { wishlist, loading: wishlistLoading, removeFromWishlist, syncWishlistData } = useWishlistContext();
  const { bookings, loading: bookingsLoading, error: bookingsError, stats } = useMyBookings();
  const { stats: advancedStats, loading: statsLoading, refresh: refreshStats } = useAdvancedStats();

  // States
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check if URL has a tab parameter (e.g., /dashboard/wishlist)
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const tabFromUrl = pathSegments[1]; // Get the second segment after 'dashboard'
    const validTabs = ['overview', 'bookings', 'wishlist', 'stats', 'profile'];
    
    if (validTabs.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    
    // Otherwise load from localStorage
    return localStorage.getItem('dashboardActiveTab') || 'overview';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    createdAt: null,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to access dashboard');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Sync wishlist when entering dashboard
  useEffect(() => {
    if (isAuthenticated && activeTab === 'wishlist') {
      console.log('🔄 [DashboardPage] Syncing wishlist on mount/tab change...');
      syncWishlistData();
    }
  }, [isAuthenticated, activeTab, syncWishlistData]);

  // Listen to URL changes and update activeTab accordingly
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const tabFromUrl = pathSegments[1]; // Get the second segment after 'dashboard'
    const validTabs = ['overview', 'bookings', 'wishlist', 'stats', 'profile'];
    
    if (validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname]);

  // Save active tab to localStorage and update URL
  useEffect(() => {
    localStorage.setItem('dashboardActiveTab', activeTab);
    // Update URL to match the active tab
    if (activeTab !== 'overview') {
      navigate(`/dashboard/${activeTab}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [activeTab, navigate]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getCurrentUser();
        // Response from apiClient.get returns: { success, data: { id, name, email, phone, avatar, profileImage, profileImageMimeType, ... } }
        const userData = response?.data || response;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          createdAt: userData.created_at || null,
        });
        // Update avatar preview if exists (check profileImage first, then avatar)
        if (userData.profileImage && typeof userData.profileImage === 'string') {
          const imageUrl = `data:${userData.profileImageMimeType || 'image/jpeg'};base64,${userData.profileImage}`;
          setAvatarPreview(imageUrl);
        } else if (userData.avatar && typeof userData.avatar === 'string') {
          setAvatarPreview(userData.avatar);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile');
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Filter bookings
  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(booking => {
    if (!booking) return false;
    const matchesSearch = 
      (booking.package?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (booking.booking_number || '').includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status colors
  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return <FiCheck className="text-green-600" size={18} />;
      case 'completed': return <FiCheck className="text-blue-600" size={18} />;
      case 'cancelled': return <FiX className="text-red-600" size={18} />;
      default: return null;
    }
  };

  // Chart data
  const monthlyData = [
    { month: 'January', trips: 0, amount: 0 },
    { month: 'February', trips: 0, amount: 0 },
    { month: 'March', trips: 0, amount: 0 },
    { month: 'April', trips: 0, amount: 0 },
    { month: 'May', trips: 0, amount: 0 },
    { month: 'June', trips: 0, amount: 0 }
  ];

  if (Array.isArray(bookings)) {
    bookings.forEach(booking => {
      if (booking) {
        const date = new Date(booking.trip_start_date);
        const monthIndex = date.getMonth();
        if (monthIndex < monthlyData.length) {
          monthlyData[monthIndex].trips += 1;
          monthlyData[monthIndex].amount += booking.total_price || 0;
        }
      }
    });
  }

  const statusDistribution = [
    { name: 'Confirmed', value: (Array.isArray(bookings) ? bookings : []).filter(b => b && b.status === 'confirmed').length, color: '#10b981' },
    { name: 'Completed', value: (Array.isArray(bookings) ? bookings : []).filter(b => b && b.status === 'completed').length, color: '#3b82f6' },
    { name: 'Cancelled', value: (Array.isArray(bookings) ? bookings : []).filter(b => b && b.status === 'cancelled').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
      };

      // Add avatar if it was changed
      if (avatar) {
        updateData.profileImage = avatar;
      }

      const response = await authService.updateProfile(user.id, updateData);
      
      // Response from apiClient.put returns: { success, message, data: { id, name, email, phone, avatar, profileImage, profileImageMimeType } }
      const responseData = response.data || response;
      const updatedData = responseData.id ? responseData : responseData.data;
      setProfileData({
        name: updatedData.name || profileData.name,
        email: updatedData.email || profileData.email,
        phone: updatedData.phone || profileData.phone,
      });

      // Update avatar preview from response if available
      if (updatedData.profileImage && typeof updatedData.profileImage === 'string') {
        const newPreviewUrl = `data:${updatedData.profileImageMimeType || 'image/jpeg'};base64,${updatedData.profileImage}`;
        setAvatarPreview(newPreviewUrl);
      }
      
      // ✅ تحديث AuthContext
      if (updateProfile) {
        await updateProfile(updateData);
      }
      
      setIsEditingProfile(false);
      setAvatar(null); // Clear avatar state after save
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle cancel booking
  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      const response = await bookingsService.cancelBooking(bookingId, { reason: 'Cancelled by user' });
      
      if (response?.success) {
        toast.success('Trip cancelled successfully');
        // Reload the page to refresh bookings
        window.location.reload();
      } else {
        toast.error(response?.message || 'Failed to cancel trip');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel trip');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile input change
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Compress image with better quality settings
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // تحديد الحد الأقصى للعرض والارتفاع (أصغر قليلاً لتقليل حجم base64)
          const maxWidth = 600;
          const maxHeight = 600;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // ضغط الصورة بجودة أقل لتقليل الحجم (من 0.7 إلى 0.6)
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            0.6
          );
        };
      };
    });
  };

  // Handle avatar file change
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من الملف
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // ضغط الصورة
      const compressed = await uploadService.uploadProfileImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.75,
      });

      setAvatar(compressed.base64);
      
      // إنشاء preview
      const previewUrl = `data:${compressed.mimeType};base64,${compressed.base64}`;
      setAvatarPreview(previewUrl);

      // تحديث الصورة مباشرة
      try {
        const response = await authService.updateProfile(user.id, {
          name: profileData.name,
          phone: profileData.phone,
          profileImage: compressed.base64,
          profileImageMimeType: compressed.mimeType,
        });

        // Response from authService.updateProfile returns: { success, message, data: {...} }
        const responseData = response.data || response;
        const updatedData = responseData.id ? responseData : responseData.data;
        // Update avatar preview from response if available
        if (updatedData.profileImage && typeof updatedData.profileImage === 'string') {
          const newPreviewUrl = `data:${updatedData.profileImageMimeType || 'image/jpeg'};base64,${updatedData.profileImage}`;
          setAvatarPreview(newPreviewUrl);
        } else {
          setAvatarPreview(previewUrl);
        }
        
        // ✅ تحديث AuthContext ليتم عرض الصورة مباشرة في النافبار
        if (updateProfile) {
          await updateProfile({
            name: profileData.name,
            phone: profileData.phone,
            profileImage: compressed.base64,
            profileImageMimeType: compressed.mimeType,
          });
        }
        
        toast.success(`Image uploaded (${formatFileSize(compressed.size)})`);
      } catch (err) {
        console.error('Error uploading avatar:', err);
        toast.error('Failed to upload avatar');
      } finally {
        setIsUploadingAvatar(false);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      toast.error(err.message || 'Failed to process image');
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 md:px-6 py-4 md:py-8">
        {bookingsLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 md:gap-2 mb-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto -mx-6 px-6">
              {['overview', 'bookings', 'wishlist', 'stats', 'profile'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 md:px-6 py-3 font-semibold transition-colors border-b-2 text-xs md:text-base whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab
                      ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'overview' && t('dashboardPage.tabs.overview')}
                  {tab === 'bookings' && t('dashboardPage.tabs.bookings')}
                  {tab === 'wishlist' && t('dashboardPage.tabs.savedTrips')}
                  {tab === 'stats' && t('dashboardPage.tabs.statistics')}
                  {tab === 'profile' && t('dashboardPage.tabs.profile')}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden relative group">
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                  </div>
                  <div className="relative z-10">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">{t('dashboardPage.welcomeBack')}</h1>
                    <p className="text-white/90 text-sm md:text-lg">{t('dashboardPage.dashboardOverview')}</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">{t('dashboardPage.totalBookings')}</p>
                        <div className="mt-4">
                          <p className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">{stats?.totalBookings || 0}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{t('dashboardPage.allTimeBookings')}</p>
                        </div>
                      </div>
                      <div className="p-2 md:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
                        <FiUsers size={20} className="md:w-7 md:h-7 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">{t('dashboardPage.totalSpent')}</p>
                        <div className="mt-4">
                          <p className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">${(stats?.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{t('dashboardPage.acrossAllBookings')}</p>
                        </div>
                      </div>
                      <div className="p-2 md:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
                        <FiDollarSign size={20} className="md:w-7 md:h-7 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">{t('dashboardPage.upcomingTrips')}</p>
                        <div className="mt-4">
                          <p className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">{stats?.upcomingTrips || 0}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{t('dashboardPage.nextAdventures')}</p>
                        </div>
                      </div>
                      <div className="p-2 md:p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
                        <FiCalendar size={20} className="md:w-7 md:h-7 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">{t('dashboardPage.completedTrips')}</p>
                        <div className="mt-4">
                          <p className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">{stats?.completedTrips || 0}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{t('dashboardPage.wonderfulMemories')}</p>
                        </div>
                      </div>
                      <div className="p-2 md:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
                        <FiCheck size={20} className="md:w-7 md:h-7 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-8 flex-col md:flex-row gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{t('dashboardPage.recentBookings')}</h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('dashboardPage.yourLatestReservations')}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-semibold transition-colors text-sm md:text-base"
                    >
                      {t('dashboardPage.viewAll')}
                      <FiExternalLink size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(bookings) ? bookings : []).slice(0, 5).map((booking) => (
                      booking && (
                      <div key={booking.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent dark:hover:from-slate-700/50 dark:hover:to-transparent rounded-xl transition-all border border-slate-200 dark:border-slate-700/50 group cursor-pointer flex-col md:flex-row gap-3 md:gap-4">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                          <div className={`p-2 md:p-3 rounded-xl transition-all group-hover:scale-110 flex-shrink-0 ${
                            booking.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' :
                            'bg-orange-100 dark:bg-orange-900/30'
                          }`}>
                            {getStatusIcon(booking.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm md:text-base">
                              {booking.package?.title || 'Your Trip'}
                            </h3>
                            <div className="flex items-center gap-2 md:gap-3 mt-1 text-xs md:text-sm flex-wrap">
                              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <FiMapPin size={12} className="md:w-3.5 md:h-3.5" />
                                {booking.package?.destination}
                              </p>
                              <span className="text-slate-400 dark:text-slate-600">•</span>
                              <p className="text-slate-500 dark:text-slate-500">#{booking.booking_number}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="font-bold text-base md:text-lg text-slate-900 dark:text-white">
                            ${(Number(booking.total_price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <span className={`inline-block mt-1 md:mt-2 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold border transition-all ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>
                      </div>
                      )
                    ))}
                    {(Array.isArray(bookings) ? bookings : []).length === 0 && (
                      <div className="text-center py-12">
                        <FiCalendar size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4 md:w-12 md:h-12" />
                        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm md:text-base">{t('dashboardPage.noBookingsYet')}</p>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500 mt-1">{t('dashboardPage.startExploring')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Saved Trips */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 md:p-8 border border-purple-200 dark:border-purple-700/50 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{t('dashboardPage.savedTripsTitle')}</h3>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">{t('dashboardPage.viewYourWishlist')}</p>
                      </div>
                      <FiBookmark size={24} className="md:w-7 md:h-7 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">{(Array.isArray(wishlist) ? wishlist : []).length}</p>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                      {t('dashboardPage.browseSavedTrips')}
                    </button>
                  </div>

                  {/* Explore More */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 md:p-8 border border-blue-200 dark:border-blue-700/50 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{t('dashboardPage.exploreMore')}</h3>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">{t('dashboardPage.discoverNewAdventures')}</p>
                      </div>
                      <FiMapPin size={24} className="md:w-7 md:h-7 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4">{t('dashboardPage.findAmazingPackages')}</p>
                    <button
                      onClick={() => navigate('/search')}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                      {t('dashboardPage.explorePackages')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                {/* Header with summary */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 md:p-6 mb-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{t('dashboardPage.myBookings')}</h2>
                      <p className="text-white/80 text-sm md:text-base">{t('dashboardPage.manageAndTrack')}</p>
                    </div>
                    <div className="flex gap-6 md:gap-8 flex-wrap">
                      <div>
                        <p className="text-white/60 text-xs md:text-sm">Total Bookings</p>
                        <p className="text-xl md:text-2xl font-bold">{filteredBookings.length}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs md:text-sm">Total Spent</p>
                        <p className="text-xl md:text-2xl font-bold">${(filteredBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-2 md:gap-4 flex-col md:flex-row">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by package name or booking number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm md:text-base"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm md:text-base"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Bookings Grid */}
                {filteredBookings.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <FiCalendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Bookings Found</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {(Array.isArray(bookings) ? bookings : []).length === 0 
                        ? 'No bookings yet'
                        : 'No matching bookings'}
                    </p>
                    {(Array.isArray(bookings) ? bookings : []).length === 0 && (
                      <button
                        onClick={() => navigate('/search')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                      >
                        <FiSearch size={18} />
                        Explore Packages
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {filteredBookings && filteredBookings.length > 0 ? filteredBookings.map((booking) => {
                      console.log('🎫 Rendering booking:', booking);
                      return (
                      <div 
                        key={booking.id} 
                        className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group"
                      >
                        {/* Header with status */}
                        <div className={`px-4 md:px-6 py-3 md:py-4 border-b-2 ${
                          booking.status === 'confirmed' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' :
                          booking.status === 'completed' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' :
                          'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                        }`}>
                          <div className="flex justify-between items-start gap-3 md:gap-4 flex-col md:flex-row">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                                {booking.package?.title || 'Trip Package'}
                              </h3>
                              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1">
                                Booking #{booking.booking_number}
                              </p>
                            </div>
                            <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 ${getStatusColor(booking.status)}`}>
                              {getStatusLabel(booking.status)}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                          {/* Destination */}
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-0.5 flex-shrink-0">
                              <FiMapPin size={16} className="md:w-4.5 md:h-4.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Destination</p>
                              <p className="text-sm md:text-base font-medium text-slate-900 dark:text-white truncate">
                                {booking.package?.destination || 'Not Specified'}
                              </p>
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-0.5 flex-shrink-0">
                              <FiCalendar size={16} className="md:w-4.5 md:h-4.5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Travel Dates</p>
                              <p className="text-sm md:text-base font-medium text-slate-900 dark:text-white">
                                {formatDateRange(booking.date_start, booking.date_end)}
                              </p>
                            </div>
                          </div>

                          {/* Persons */}
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mt-0.5 flex-shrink-0">
                              <FiUsers size={16} className="md:w-4.5 md:h-4.5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Travelers</p>
                              <p className="text-sm md:text-base font-medium text-slate-900 dark:text-white">
                                {booking.persons} {booking.persons === 1 ? 'Person' : 'Persons'}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mt-0.5 flex-shrink-0">
                              <FiDollarSign size={16} className="md:w-4.5 md:h-4.5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Price</p>
                              <p className="text-base md:text-lg font-bold text-green-600 dark:text-green-400">
                                ${(Number(booking.total_price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer with actions */}
                        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 flex gap-2 flex-col md:flex-row">
                          <button 
                            onClick={() => navigate(`/package/${booking.package?.id}`)}
                            className="flex-1 min-w-[100px] px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 md:gap-2 group/btn"
                          >
                            <FiExternalLink size={14} className="md:w-4 md:h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            <span>Details</span>
                          </button>
                          <button 
                            onClick={() => {
                              toast.loading('Generating invoice...');
                              bookingsService.downloadBookingInvoice(booking.id, `invoice-${booking.booking_number}.pdf`)
                                .then(() => {
                                  toast.success('Invoice downloaded successfully');
                                })
                                .catch(() => {
                                  toast.error('Failed to download invoice');
                                });
                            }}
                            className="flex-1 min-w-[100px] px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 md:gap-2 group/btn"
                          >
                            <FiDownload size={14} className="md:w-4 md:h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                            <span>Invoice</span>
                          </button>
                          {booking.status === 'confirmed' && (
                            <button 
                              onClick={() => {
                                const isConfirmed = window.confirm('Are you sure you want to cancel this trip?');
                                if (isConfirmed) {
                                  cancelBooking(booking.id);
                                }
                              }}
                              className="flex-1 min-w-[100px] px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 md:gap-2 group/btn"
                            >
                              <FiX size={14} className="md:w-4 md:h-4 group-hover/btn:scale-110 transition-transform" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                    }) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">No bookings to display</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-4 md:space-y-6">
                {statsLoading ? (
                  <div className="flex justify-center items-center h-80 md:h-96">
                    <div className="animate-spin">
                      <div className="h-10 md:h-12 w-10 md:w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 md:p-6 text-white">
                      <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Your Statistics</h2>
                          <p className="text-white/80 text-sm md:text-base">Detailed breakdown of your bookings</p>
                        </div>
                        <button
                          onClick={refreshStats}
                          className="px-3 md:px-4 py-1.5 md:py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all text-sm md:text-base flex-shrink-0"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>

                    {/* Main Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      {/* Total Bookings */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">Total Bookings</p>
                            <p className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 md:mt-3">
                              {advancedStats?.stats?.totalBookings || 0}
                            </p>
                          </div>
                          <div className="p-2 md:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0 ml-2">
                            <FiUsers size={18} className="md:w-7 md:h-7 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Total Spent */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">Total Spent</p>
                            <p className="text-2xl md:text-4xl font-bold text-green-600 dark:text-green-400 mt-2 md:mt-3 break-words">
                              ${(advancedStats?.stats?.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="p-2 md:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0 ml-2">
                            <FiDollarSign size={18} className="md:w-7 md:h-7 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Trips */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">Upcoming Trips</p>
                            <p className="text-2xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mt-2 md:mt-3">
                              {advancedStats?.stats?.upcomingTrips || 0}
                            </p>
                          </div>
                          <div className="p-2 md:p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0 ml-2">
                            <FiCalendar size={18} className="md:w-7 md:h-7 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Completed Trips */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">Completed Trips</p>
                            <p className="text-2xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2 md:mt-3">
                              {advancedStats?.stats?.completedTrips || 0}
                            </p>
                          </div>
                          <div className="p-2 md:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0 ml-2">
                            <FiCheck size={18} className="md:w-7 md:h-7 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Monthly Trends */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Monthly Trends</h3>
                        {advancedStats?.monthlyChart && advancedStats.monthlyChart.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={advancedStats.monthlyChart}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="month" stroke="#6b7280" />
                              <YAxis stroke="#6b7280" />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: '#1f2937',
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#fff'
                                }}
                              />
                              <Legend />
                              <Bar dataKey="trips" fill="#3b82f6" name="Trips" />
                              <Bar dataKey="amount" fill="#10b981" name="Spending" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400 text-center py-8">No data available</p>
                        )}
                      </div>

                      {/* Status Distribution */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Booking Status Distribution</h3>
                        {advancedStats?.distribution && advancedStats.distribution.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={advancedStats.distribution.map((item) => ({
                                  name: item.status,
                                  value: item.count,
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {advancedStats.distribution.map((entry, index) => {
                                  const colors = {
                                    confirmed: '#10b981',
                                    completed: '#3b82f6',
                                    cancelled: '#ef4444',
                                  };
                                  return <Cell key={`cell-${index}`} fill={colors[entry.status] || '#6b7280'} />;
                                })}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400 text-center py-8">No data available</p>
                        )}
                      </div>
                    </div>

                    {/* Detailed Stats List */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Booking Status Breakdown</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {advancedStats?.distribution && advancedStats.distribution.length > 0 ? (
                          advancedStats.distribution.map((item) => (
                            <div
                              key={item.status}
                              className={`p-4 rounded-lg border-l-4 ${
                                item.status === 'confirmed'
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                  : item.status === 'completed'
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                              }`}
                            >
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                                {item.status} Bookings
                              </p>
                              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                                {item.count}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">No booking data</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                {/* Saved Trips Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Trips</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {Array.isArray(wishlist) ? wishlist.length : 0} {Array.isArray(wishlist) && wishlist.length === 1 ? 'trip' : 'trips'} saved
                    </p>
                  </div>
                </div>

                {/* Saved Trips Content */}
                {wishlistLoading ? (
                  <div className="flex justify-center items-center h-96">
                    <div className="animate-spin">
                      <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  </div>
                ) : !Array.isArray(wishlist) || wishlist.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <FiBookmark size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Saved Trips</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Start exploring and save your favorite trips
                    </p>
                    <button
                      onClick={() => navigate('/search')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                      <FiSearch size={18} />
                      Explore Packages
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlist.filter(item => item !== null && item !== undefined).map((item) => {
                      // Handle multiple possible field names from API
                      const title = item.title || item.name || 'Unnamed Package';
                      const destination = item.destination || item.location || 'Unknown Destination';
                      const duration = item.duration_days || item.duration || item.days || 0;
                      const price = Number(item.base_price || item.price || 0);
                      
                      console.log('📌 Wishlist Item:', { id: item.id, title, destination, duration, price, imagesCount: item.images?.length || 0 });
                      
                      // Handle images - check multiple formats
                      let imageUrl = null;
                      if (item.images && item.images.length > 0) {
                        // Filter out null values first
                        const validImages = item.images.filter(img => img !== null && img !== undefined);
                        
                        if (validImages.length > 0) {
                          const imgObj = validImages[0];
                          console.log('🖼️ Processing image:', { 
                            has_url: !!imgObj.url && imgObj.url.length > 0,
                            url_length: imgObj.url?.length,
                            has_image_data: !!imgObj.image_data,
                            image_data_length: imgObj.image_data?.length,
                            alt_text: imgObj.alt_text 
                          });
                          
                          // If it's a string URL with content
                          if (typeof imgObj === 'string' && imgObj?.trim()) {
                            imageUrl = imgObj;
                          }
                          // If it's an object
                          else if (imgObj && typeof imgObj === 'object') {
                            // Try URL first
                            if (imgObj.url && imgObj.url.trim()) {
                              imageUrl = imgObj.url;
                              console.log('✅ Using URL');
                            }
                            // Try image_data (base64)
                            else if (imgObj.image_data) {
                              if (typeof imgObj.image_data === 'string' && imgObj.image_data.trim()) {
                                // Check if it already has data: prefix
                                if (imgObj.image_data.startsWith('data:')) {
                                  imageUrl = imgObj.image_data;
                                } else {
                                  // Add data URI prefix
                                  imageUrl = `data:image/jpeg;base64,${imgObj.image_data}`;
                                }
                                console.log('✅ Using image_data base64');
                              }
                            }
                            // Alternative: image_url field
                            else if (imgObj.image_url && imgObj.image_url.trim()) {
                              imageUrl = imgObj.image_url;
                              console.log('✅ Using image_url');
                            }
                          }
                          
                          if (!imageUrl) {
                            console.warn('⚠️ No valid image URL or data found', imgObj);
                          }
                        }
                      }
                      
                      return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
                      >
                        {/* Image */}
                        <div className="relative h-40 md:h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.error('❌ Wishlist image failed to load:', e.target.src);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiImage size={28} className="md:w-8 md:h-8 text-slate-400" />
                            </div>
                          )}
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg hover:shadow-xl"
                          >
                            <FiX size={16} className="md:w-4.5 md:h-4.5" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-3 md:p-6">
                          <div className="mb-3 md:mb-4">
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1 md:mb-2 truncate">
                              {title}
                            </h3>
                            <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 dark:text-slate-400 text-xs md:text-sm">
                              <FiMapPin size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                              <span className="truncate">{destination}</span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
                              <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                                {duration} Days
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Price</p>
                              <p className="text-sm md:text-base font-semibold text-blue-600 dark:text-blue-400 truncate">
                                {price?.toLocaleString()} EGP
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => navigate(`/package/${item.id}`)}
                            className="w-full flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all hover:shadow-lg text-sm md:text-base"
                          >
                            <span>View Details</span>
                            <FiExternalLink size={14} className="md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-5xl space-y-4 md:space-y-6">
                {/* Premium Profile Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 shadow-xl">
                  {/* Decorative background elements */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
                  </div>
                  
                  <div className="relative p-4 md:p-8 lg:p-12">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 lg:gap-8">
                      {/* Avatar Section with Badge */}
                      <div className="relative flex-shrink-0 group">
                        <div className="relative w-28 md:w-32 lg:w-40 h-28 md:h-32 lg:h-40 rounded-3xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl border-2 md:border-4 border-white/40 backdrop-blur-sm"></div>
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                              <FiUser size={56} className="md:w-16 md:h-16 lg:w-20 lg:h-20 text-white/80" />
                            </div>
                          )}
                          
                          {/* Upload Overlay */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                            className="absolute inset-0 bg-black/0 hover:bg-black/50 group-hover:bg-black/50 flex items-center justify-center transition-all rounded-3xl cursor-pointer"
                          >
                            {isUploadingAvatar ? (
                              <div className="flex flex-col items-center gap-1 md:gap-2">
                                <div className="w-6 md:w-8 h-6 md:h-8 border-2 md:border-3 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="text-white text-xs font-semibold">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 md:gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <FiCamera size={28} className="md:w-10 md:h-10" />
                                <span className="text-xs md:text-sm font-semibold">Change Photo</span>
                              </div>
                            )}
                          </button>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute -bottom-2 -right-2 px-2 md:px-4 py-1 md:py-2 bg-green-500 rounded-full flex items-center gap-1.5 md:gap-2 shadow-lg border-2 md:border-4 border-white dark:border-slate-900">
                          <div className="w-2 md:w-3 h-2 md:h-3 bg-white rounded-full animate-pulse"></div>
                          <span className="text-white text-xs font-bold">Active</span>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>

                      {/* Profile Info Section */}
                      <div className="flex-1 text-center md:text-left text-white">
                        <div className="mb-3">
                          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-1 md:mb-2 break-words">{profileData.name}</h1>
                          <p className="text-white/80 text-sm md:text-base lg:text-lg break-all">{profileData.email}</p>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-8 pt-4 md:pt-8 border-t border-white/30">
                          <div className="group">
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Member Since</p>
                            <p className="text-sm md:text-lg lg:text-xl font-bold text-white group-hover:scale-110 transition-transform origin-left">
                              {profileData.createdAt 
                                ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div className="group">
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Bookings</p>
                            <p className="text-sm md:text-lg lg:text-xl font-bold text-white group-hover:scale-110 transition-transform origin-left">
                              {stats?.totalBookings || 0}
                            </p>
                          </div>
                          <div className="group">
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Role</p>
                            <p className="text-sm md:text-lg lg:text-xl font-bold text-white capitalize group-hover:scale-110 transition-transform origin-left">
                              {user?.role || 'User'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Form Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 lg:p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-6 md:mb-8 flex-col md:flex-row gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{t('myProfilePage.title')}</h2>
                      <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-0.5 md:mt-1">{t('myProfilePage.subtitle')}</p>
                    </div>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="hidden sm:flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:scale-105 text-sm md:text-base flex-shrink-0"
                      >
                        <FiEdit2 size={16} className="md:w-4.5 md:h-4.5" />
                        <span>{t('myProfilePage.edit')}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {/* Name Field */}
                    <div className="group">
                      <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 md:mb-3 uppercase tracking-wide">
                        {t('myProfilePage.fullName')}
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 md:left-4 top-2.5 md:top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          readOnly={!isEditingProfile}
                          className={`w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border-2 font-medium text-slate-900 dark:text-white transition-all text-sm md:text-base ${
                            isEditingProfile
                              ? 'border-blue-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 cursor-default'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="group">
                      <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 md:mb-3 uppercase tracking-wide">
                        {t('myProfilePage.emailAddress')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 md:left-4 top-2.5 md:top-4 text-slate-400 dark:text-slate-500 text-base md:text-lg">✉️</span>
                        <input
                          type="email"
                          value={profileData.email}
                          readOnly
                          className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white font-medium cursor-not-allowed text-sm md:text-base"
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 md:mt-2 flex items-center gap-1">
                        <span>🔒</span> {t('myProfilePage.emailImmutable')}
                      </p>
                    </div>

                    {/* Phone Field */}
                    <div className="group">
                      <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 md:mb-3 uppercase tracking-wide">
                        {t('myProfilePage.phoneNumber')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 md:left-4 top-2.5 md:top-4 text-slate-400 dark:text-slate-500 text-base md:text-lg">📱</span>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          readOnly={!isEditingProfile}
                          placeholder="Your phone number"
                          className={`w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border-2 font-medium text-slate-900 dark:text-white transition-all text-sm md:text-base ${
                            isEditingProfile
                              ? 'border-blue-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 cursor-default'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Account Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 pt-4 md:pt-8 border-t border-slate-200 dark:border-slate-700">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 md:p-5 border border-green-200 dark:border-green-800/50">
                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">✓</span>
                          </div>
                          <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">{t('myProfilePage.accountStatus')}</span>
                        </div>
                        <p className="text-sm md:text-base font-semibold text-green-700 dark:text-green-300">
                          {user?.is_verified ? t('myProfilePage.verified') : t('myProfilePage.pendingVerification')}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 md:p-5 border border-blue-200 dark:border-blue-800/50">
                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">📅</span>
                          </div>
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Account Created</span>
                        </div>
                        <p className="text-sm md:text-base font-semibold text-blue-700 dark:text-blue-300">
                          {profileData.createdAt
                            ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 md:pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2 md:gap-3">
                      {isEditingProfile ? (
                        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                          <button
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group text-sm md:text-base"
                          >
                            {isSavingProfile ? (
                              <>
                                <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <FiSave size={16} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                                <span>Save Changes</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingProfile(false);
                              setProfileData({
                                name: user?.name || '',
                                email: user?.email || '',
                                phone: user?.phone || '',
                              });
                            }}
                            className="flex-1 px-4 md:px-6 py-2.5 md:py-3.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsEditingProfile(true)}
                            className="sm:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all hover:shadow-lg active:scale-95 group text-sm md:text-base"
                          >
                            <FiEdit2 size={16} className="md:w-4.5 md:h-4.5 group-hover:scale-110 transition-transform" />
                            <span>Edit Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              navigate('/login');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95 group text-sm md:text-base"
                          >
                            <FiLogOut size={16} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                            <span>Logout</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security & Privacy Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg md:text-2xl">🔐</span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Password</h3>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-3 md:mb-4">Change your account password regularly</p>
                    <button className="w-full px-4 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg text-sm md:text-base">
                      Change Password
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg md:text-2xl">🔔</span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-3 md:mb-4">Manage your notification preferences</p>
                    <button className="w-full px-4 py-2 md:py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg text-sm md:text-base">
                      Settings
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800/50 rounded-2xl p-4 md:p-6 shadow-lg">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg md:text-2xl">⚠️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-red-900 dark:text-red-300 mb-1.5 md:mb-2">Danger Zone</h3>
                      <p className="text-xs md:text-sm text-red-800 dark:text-red-200 mb-3 md:mb-4">
                        Be careful! Deleting your account is permanent and cannot be undone.
                      </p>
                      <button className="px-4 md:px-6 py-2 md:py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all hover:shadow-lg active:scale-95 text-sm md:text-base">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;