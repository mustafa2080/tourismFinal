import { useState, useEffect, useRef } from 'react';
import { FiCheckCircle, FiX, FiStar, FiFilter, FiSearch, FiTrendingUp, FiMessageCircle, FiUser } from 'react-icons/fi';
import { MdOutlineReviews, MdOutlineRateReview } from 'react-icons/md';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import { socketService } from '../../../services/socketService';

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    approvedReviews: 0,
    pendingReviews: 0
  });
  const [approvedReviewsIds, setApprovedReviewsIds] = useState(new Set());
  const socketRef = useRef(null);

  useEffect(() => {
    fetchPendingReviews();
    calculateStats();

    // Connect to WebSocket for real-time updates
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      socketRef.current = socketService.connect();
      
      // Listen for new review submissions
      socketRef.current.on('new_review', (data) => {
        console.log('📬 New review received:', data);
        toast.success('New review submitted!');
        // Reload reviews to show the new one
        fetchPendingReviews();
        calculateStats();
      });

      // Listen for review approval notifications
      socketRef.current.on('review_approved', (data) => {
        console.log('✅ Review approved:', data);
        setApprovedReviewsIds(prev => new Set([...prev, data.reviewId]));
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [pagination.offset, filterRating]);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingReviews(pagination.limit, pagination.offset);
      
      if (response.success) {
        let filteredReviews = response.data || [];
        
        if (filterRating !== 'all') {
          const ratingNum = parseInt(filterRating);
          filteredReviews = filteredReviews.filter(r => r.rating === ratingNum);
        }
        
        if (searchTerm) {
          filteredReviews = filteredReviews.filter(r =>
            r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.package?.title?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setReviews(filteredReviews);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      // Fetch all reviews to calculate stats
      const response = await adminService.getPendingReviews(1000, 0);
      
      if (response.success && response.data) {
        const allReviews = response.data;
        const totalReviews = response.pagination?.total || allReviews.length;
        const averageRating = allReviews.length > 0 
          ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
          : 0;
        
        // Count approved and pending
        const approvedCount = allReviews.filter(r => r.approved).length;
        const pendingCount = allReviews.filter(r => !r.approved).length;
        
        setStats({
          totalReviews: totalReviews,
          averageRating: averageRating,
          approvedReviews: approvedCount,
          pendingReviews: pendingCount
        });
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      const response = await adminService.approveReview(reviewId);
      if (response.success) {
        toast.success('✅ Review approved successfully!');
        setApprovedReviewsIds(prev => new Set([...prev, reviewId]));
        
        // Add animation effect
        setTimeout(() => {
          fetchPendingReviews();
          setShowModal(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      const response = await adminService.rejectReview(reviewId, 'Deleted by admin');
      if (response.success) {
        toast.success('❌ Review deleted successfully');
        
        // Add animation effect
        setTimeout(() => {
          fetchPendingReviews();
          setShowModal(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}
          />
        ))}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white border border-opacity-20 group hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="text-white/20 group-hover:text-white/30 transition-all">
          <Icon size={40} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <MdOutlineReviews className="text-white" size={32} />
            </div>
            Reviews Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
            Review and manage customer feedback on tours
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={MdOutlineReviews}
          label="Total Reviews"
          value={stats.totalReviews}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Average Rating"
          value={`${stats.averageRating}/5`}
          color="from-yellow-500 to-orange-600"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Approved"
          value={stats.approvedReviews}
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          icon={MdOutlineRateReview}
          label="Pending"
          value={stats.pendingReviews}
          color="from-purple-500 to-pink-600"
        />
      </div>

      {/* Search & Filter Section */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, comment, or tour..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <FiFilter className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400"></div>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">Loading reviews...</p>
            </div>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={review.id || index}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-500 p-6 group ${
                approvedReviewsIds.has(review.id)
                  ? 'animate-pulse scale-95 opacity-50'
                  : 'hover:scale-102 animate-in fade-in slide-in-from-bottom-4'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  {/* User Info & Rating */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {(review.user?.name || review.user?.fullName || 'U')?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        {review.user?.name || review.user?.fullName || 'User'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(review.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Tour Title */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <FiMessageCircle size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">{review.package?.title || 'Tour'}</span>
                  </div>

                  {/* Review Comment */}
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    "{review.comment}"
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => handleRejectReview(review.id)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <FiX size={16} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleViewReview(review)}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Review Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <MdOutlineReviews className="text-blue-600 dark:text-blue-400" size={40} />
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">No pending reviews</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">All reviews have been moderated</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white font-bold">{pagination.offset + 1}</span> to <span className="text-slate-900 dark:text-white font-bold">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of <span className="text-slate-900 dark:text-white font-bold">{pagination.total}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPagination(p => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
              disabled={pagination.offset === 0}
              className="px-6 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, offset: p.offset + p.limit }))}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="px-6 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in scale-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <MdOutlineReviews size={24} />
                </div>
                <h2 className="text-2xl font-bold">Review Details</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8 max-h-96 overflow-y-auto">
              {/* User Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiUser className="text-blue-600 dark:text-blue-400" size={20} />
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Name</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedReview.user?.name || selectedReview.user?.fullName || 'User'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedReview.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Tour Information */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Tour Information</h3>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedReview.package?.title || '-'}</p>
              </div>

              {/* Rating */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Rating</h3>
                <div className="flex items-center gap-3">
                  {renderStars(selectedReview.rating)}
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiMessageCircle size={20} className="text-blue-600 dark:text-blue-400" />
                  Review Comment
                </h3>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 border-l-4 border-blue-600">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                    "{selectedReview.comment}"
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-slate-600 dark:text-slate-400 pt-2">
                Review submitted on <span className="font-semibold text-slate-900 dark:text-white">{new Date(selectedReview.created_at).toLocaleString('en-US')}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 p-8 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleApproveReview(selectedReview.id)}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FiCheckCircle size={20} />
                Approve
              </button>
              <button
                onClick={() => handleRejectReview(selectedReview.id)}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FiX size={20} />
                Reject
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewsPage;