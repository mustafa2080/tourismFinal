import React, { useState, useMemo } from 'react';
import { FiStar, FiSend, FiCheck } from 'react-icons/fi';
import { Card, Button } from './common';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks';

const InlineReviewSection = ({ 
  reviews, 
  onRatingSubmit, 
  packageTitle,
  isAuthenticated,
  isSubmitting
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  // Get user's existing review (if any)
  const userReview = useMemo(() => {
    if (!user || !reviews) return null;
    return reviews.find(review => review.user?.id === user.id);
  }, [user, reviews]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters');
      return;
    }

    try {
      await onRatingSubmit({
        rating,
        comment: comment.trim()
      });
      
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Form - Only show if user hasn't reviewed yet */}
      {isAuthenticated && !userReview && (
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-orange-50 dark:from-teal-900/20 dark:to-orange-900/20 shadow-sm hover:shadow-md transition-shadow border border-teal-200 dark:border-teal-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share Your Review</h3>
          
          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <FiStar
                    size={32}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Review (minimum 10 characters)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience with ${packageTitle}...`}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows="4"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !rating || comment.trim().length < 10}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 text-white font-semibold"
          >
            <FiSend size={18} />
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Card>
      )}

      {/* Already Reviewed Badge */}
      {isAuthenticated && userReview && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <FiCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">You've already reviewed this trip</p>
              <p className="text-sm text-green-700 dark:text-green-400">Thank you for sharing your feedback!</p>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reviews ({reviews?.length || 0})
        </h3>
        
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card 
                key={review.id} 
                className="p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Badge for verified reviews */}
                {review.is_approved && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <FiCheck size={14} className="text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300">Verified</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-2 pr-24">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.user?.full_name || review.user?.fullName || review.user?.name || 'User'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={16}
                            className={`${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              No reviews yet. Be the first to review this package!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineReviewSection;
