import { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiEye, FiX, FiLoader, FiCalendar, FiCheck, FiAlertCircle, 
  FiDollarSign, FiUser, FiMapPin, FiClock, FiDownload, FiChevronRight, FiTrendingUp,
  FiCheckCircle, FiXCircle, FiCopy, FiRefreshCw
} from 'react-icons/fi';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import '../styles/bookings.css';

export function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });
  const [stats, setStats] = useState({ total: 0, confirmed: 0, completed: 0, cancelled: 0 });

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [pagination.offset, filterStatus]);

  const fetchStats = async () => {
    try {
      const response = await adminService.getBookingStats();
      if (response?.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      let response;
      if (filterStatus === 'all') {
        response = await adminService.getAllBookings(pagination.limit, pagination.offset);
      } else {
        response = await adminService.getBookingsByStatus(filterStatus, pagination.limit, pagination.offset);
      }
      
      let bookingsData = [];
      let paginationData = pagination;
      
      if (response?.success && response?.data) {
        bookingsData = Array.isArray(response.data) ? response.data : [];
        paginationData = response.pagination || pagination;
      } else if (Array.isArray(response?.data)) {
        bookingsData = response.data;
        paginationData = response.pagination || pagination;
      } else if (Array.isArray(response)) {
        bookingsData = response;
      }
      
      setBookings(bookingsData);
      
      if (paginationData?.total !== undefined) {
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || 0,
          limit: paginationData.limit || 20,
          offset: paginationData.offset || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (!booking) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (booking.id && booking.id.toString().toLowerCase().includes(searchLower)) ||
      (booking.customerName && booking.customerName.toLowerCase().includes(searchLower)) ||
      (booking.packageName && booking.packageName.toLowerCase().includes(searchLower)) ||
      (booking.customerEmail && booking.customerEmail.toLowerCase().includes(searchLower));
    
    return matchesSearch;
  });

  const getStatusConfig = (status) => {
    const configs = {
      'confirmed': {
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-400',
        icon: FiCheckCircle,
        badge: 'Confirmed'
      },
      'cancelled': {
        color: 'from-red-500 to-rose-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-400',
        icon: FiXCircle,
        badge: 'Cancelled'
      },
      'completed': {
        color: 'from-teal-500 to-orange-500',
        bgColor: 'bg-teal-100 dark:bg-teal-900/30',
        textColor: 'text-teal-700 dark:text-teal-400',
        icon: FiCheck,
        badge: 'Completed'
      }
    };
    // Default to confirmed for any unknown status, pending or null
    return configs[status?.toLowerCase()] || configs['confirmed'];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-orange-600 mb-4">
            <FiLoader className="text-3xl text-white animate-spin" />
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Loading bookings...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-orange-600 rounded-xl shadow-lg">
              <FiTrendingUp className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                Bookings Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                All new bookings are automatically confirmed. Manage and track all tour reservations
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchBookings}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
            <FiRefreshCw size={20} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
            <FiDownload size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: stats.total || bookings.length, icon: FiCalendar, color: 'from-teal-500 to-teal-600' },
          { label: 'Confirmed', value: stats.confirmed || 0, icon: FiCheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Completed', value: stats.completed || 0, icon: FiCheck, color: 'from-orange-500 to-orange-600' },
          { label: 'Cancelled', value: stats.cancelled || 0, icon: FiXCircle, color: 'from-red-500 to-rose-500' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const gradientClass = `bg-gradient-to-r ${stat.color}`;
          return (
            <div key={idx} className="group stat-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className={`h-2 ${gradientClass}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{stat.label}</span>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={20} />
                  </div>
                </div>
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Advanced Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
              <FiSearch className="inline mr-2" size={18} />
              Search Bookings
            </label>
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by ID, customer name, email, or package..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
              <FiFilter className="inline mr-2" size={18} />
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, offset: 0 }));
              }}
              className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={index}
                className="group booking-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 gap-6">
                  {/* Left Side - Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-bold text-sm">
                        #{booking.id}
                      </span>
                      <span className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        <StatusIcon size={16} />
                        {statusConfig.badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Customer Info */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Customer</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <FiUser size={18} className="text-teal-500" />
                          {booking.customerName || 'Unknown'}
                        </p>
                        {booking.customerEmail && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{booking.customerEmail}</p>
                        )}
                      </div>

                      {/* Package Info */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Tour Package</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <FiMapPin size={18} className="text-rose-500" />
                          {booking.packageName || 'N/A'}
                        </p>
                      </div>

                      {/* Date Info */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Trip Date</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <FiCalendar size={18} className="text-orange-500" />
                          {booking.date_start 
                            ? new Date(booking.date_start).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit' 
                              }) 
                            : 'N/A'}
                        </p>
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Total Amount</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                          <FiDollarSign size={18} />
                          ${booking.total_price || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-3 md:min-w-[200px]">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-orange-500 text-white rounded-xl hover:from-teal-600 hover:to-orange-600 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FiEye size={18} />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        // Navigate to refunds page with this booking
                        window.location.href = `/admin/dashboard/refunds?bookingId=${booking.id}`;
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FiRefreshCw size={18} />
                      Process Refund
                    </button>
                    <button
                      onClick={() => copyToClipboard(booking.id)}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-semibold"
                    >
                      <FiCopy size={16} />
                      Copy ID
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <FiAlertCircle className="text-3xl text-slate-400" />
          </div>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">No bookings found</p>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Try adjusting your search filters or check back later</p>
        </div>
      )}

      {/* Pagination */}
      {bookings.length > pagination.limit && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
            disabled={pagination.offset === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            ← Previous
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Page <span className="text-teal-600 dark:text-teal-400 font-bold">{Math.floor(pagination.offset / pagination.limit) + 1}</span> of <span className="text-teal-600 dark:text-teal-400 font-bold">{Math.ceil(pagination.total / pagination.limit)}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} bookings
            </p>
          </div>
          <button
            onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            disabled={pagination.offset + pagination.limit >= pagination.total}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-orange-500 text-white rounded-xl hover:from-teal-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="modal-content bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-orange-600 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Booking Details</h2>
                <p className="text-teal-100 text-sm mt-1">Booking ID: {selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX size={28} className="text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Status Overview */}
              <div className={`rounded-2xl p-6 bg-gradient-to-br ${getStatusConfig(selectedBooking.status).color}`}>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getStatusConfig(selectedBooking.status).icon;
                    return <Icon className="text-white" size={32} />;
                  })()}
                  <div>
                    <p className="text-white/80 text-sm font-semibold">Current Status</p>
                    <p className="text-white text-2xl font-bold">{getStatusConfig(selectedBooking.status).badge}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiUser className="text-teal-500" size={24} />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold mb-2">Name</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedBooking.customerName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold mb-2">Email</p>
                    <p className="text-sm font-mono text-teal-600 dark:text-teal-400 break-all">{selectedBooking.customerEmail || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCalendar className="text-orange-500" size={24} />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold mb-2">Package Name</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FiMapPin className="text-rose-500" />
                      {selectedBooking.packageName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold mb-2">Booking Date</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {new Date(selectedBooking.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold mb-2">Trip Date</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedBooking.date_start ? new Date(selectedBooking.date_start).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold mb-2">Total Amount</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${selectedBooking.total_price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-orange-500 text-white rounded-xl hover:from-teal-600 hover:to-orange-600 transition-all font-semibold shadow-lg hover:shadow-xl">
                  Edit Booking
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
