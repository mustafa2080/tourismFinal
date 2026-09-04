import { useState, useEffect } from 'react';
import { FiX, FiStar, FiMessageCircle, FiSend, FiAlertCircle } from 'react-icons/fi';
import { MdOutlineRateReview } from 'react-icons/md';
import toast from 'react-hot-toast';

export function RatingCommentModal({ isOpen, onClose, onSubmit, packageName, loading = false }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setHoverRating(0);
      setComment('');
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (rating < 1 || rating > 5) {
      newErrors.rating = 'Please select a rating';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Please write a comment';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    } else if (comment.trim().length > 500) {
      newErrors.comment = 'Comment must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        rating,
        comment: comment.trim(),
      });
      
      // Reset form
      setRating(5);
      setComment('');
      setErrors({});
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;
  const commentLength = comment.length;
  const isCommentValid = commentLength >= 10 && commentLength <= 500;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden animate-modal-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 bg-gradient-to-r from-teal-600 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
              <MdOutlineRateReview size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Rate This Tour</h2>
              <p className="text-teal-100 text-sm mt-1">{packageName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all hover:scale-110"
            disabled={submitting}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FiStar className="text-yellow-500" size={20} />
              How would you rate this tour?
            </label>

            <div className="flex justify-center items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="group relative transition-all duration-200"
                  disabled={submitting}
                >
                  <FiStar
                    size={56}
                    className={`transition-all duration-300 ${
                      star <= displayRating
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg scale-110 animate-pulse'
                        : 'text-slate-300 dark:text-slate-600 scale-100'
                    } ${
                      star <= hoverRating ? 'animate-bounce' : ''
                    } hover:scale-125 cursor-pointer`}
                  />
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][star - 1]}
                  </div>
                </button>
              ))}
            </div>

            {/* Rating Labels */}
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {displayRating > 0 && ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][displayRating - 1]}
              </p>
              {errors.rating && (
                <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
                  <FiAlertCircle size={16} />
                  {errors.rating}
                </p>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FiMessageCircle className="text-teal-600 dark:text-teal-400" size={20} />
              Share your experience
            </label>

            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience with this tour... (minimum 10 characters)"
                className={`w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none transition-all duration-300 resize-none ${
                  errors.comment
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : isCommentValid && commentLength > 0
                    ? 'border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-500/20'
                    : 'border-slate-300 dark:border-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                }`}
                rows="5"
                disabled={submitting}
              />

              {/* Character counter */}
              <div className="absolute bottom-3 right-3 text-xs font-semibold">
                <span className={`${
                  commentLength < 10
                    ? 'text-slate-400 dark:text-slate-500'
                    : commentLength > 500
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}>
                  {commentLength}
                </span>
                <span className="text-slate-400 dark:text-slate-500">/500</span>
              </div>
            </div>

            {/* Error or success message */}
            {errors.comment ? (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <FiAlertCircle size={16} />
                {errors.comment}
              </p>
            ) : commentLength >= 10 ? (
              <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
                ✓ Comment looks good!
              </p>
            ) : commentLength > 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                {10 - commentLength} more characters required
              </p>
            ) : null}
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-teal-50 to-orange-50 dark:from-teal-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Summary</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Your Rating</p>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      size={18}
                      className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Comment Length</p>
                <p className={`text-lg font-bold mt-1 ${
                  isCommentValid ? 'text-green-500' : commentLength > 0 ? 'text-yellow-500' : 'text-slate-400'
                }`}>
                  {commentLength > 0 ? `${commentLength}/500` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-8 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !isCommentValid || rating < 1}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all transform disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${
              submitting
                ? 'bg-gradient-to-r from-slate-400 to-slate-500'
                : 'bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              <>
                <FiSend size={20} className="group-hover:animate-pulse" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingCommentModal;
