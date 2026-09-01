/**
 * Constants & Configuration
 * Centralized constants used throughout the app
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'authToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user',
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Trip Types
export const TRIP_TYPES = [
  { value: 'family', label: 'Family' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'honeymoon', label: 'Honeymoon' },
  { value: 'business', label: 'Business' },
  { value: 'cultural', label: 'Cultural' }
];

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const BOOKING_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'confirmed', label: 'Confirmed', color: '#10b981' },
  { value: 'completed', label: 'Completed', color: '#3b82f6' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
];

// Payment Types
export const PAYMENT_TYPES = [
  { value: 'on_arrival', label: 'Pay on Arrival' },
  { value: 'upfront', label: 'Pay Upfront' },
  { value: 'installments', label: 'Installments' }
];

// Room Types
export const ROOM_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
  { value: 'family', label: 'Family' }
];

// Duration Ranges
export const DURATION_RANGES = [
  { value: '1-3', label: '1-3 Days' },
  { value: '4-7', label: '4-7 Days' },
  { value: '8-14', label: '8-14 Days' },
  { value: '15+', label: '15+ Days' }
];

// Budget Ranges
export const BUDGET_RANGES = [
  { value: '0-1000', label: 'Under $1,000' },
  { value: '1000-3000', label: '$1,000 - $3,000' },
  { value: '3000-5000', label: '$3,000 - $5,000' },
  { value: '5000+', label: '$5,000+' }
];

// Activities
export const ACTIVITIES = [
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'water_sports', label: 'Water Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'food', label: 'Food & Wine' },
  { value: 'photography', label: 'Photography' }
];

// Ratings
export const RATING_OPTIONS = [
  { value: 5, label: '⭐⭐⭐⭐⭐ Excellent' },
  { value: 4, label: '⭐⭐⭐⭐ Very Good' },
  { value: 3, label: '⭐⭐⭐ Good' },
  { value: 2, label: '⭐⭐ Fair' },
  { value: 1, label: '⭐ Poor' }
];

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'booking:created',
  BOOKING_CONFIRMED: 'booking:confirmed',
  BOOKING_CANCELLED: 'booking:cancelled',
  BOOKING_REMINDER: 'booking:reminder',
  PAYMENT_RECEIVED: 'payment:received',
  REVIEW_APPROVED: 'review:approved',
  NEW_MESSAGE: 'message:new'
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  PAGE_SIZES: [10, 20, 50, 100]
};

// Sort Options
export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Most Popular' }
];

// Booking Rules
export const BOOKING_RULES = {
  MINIMUM_DAYS_IN_ADVANCE: 15,
  MAXIMUM_PERSONS_PER_BOOKING: 20,
  MINIMUM_PERSONS: 1,
  REFUND_POLICY: {
    '30': 100, // 30+ days before: 100% refund
    '14': 75,  // 14-29 days: 75% refund
    '7': 50,   // 7-13 days: 50% refund
    '3': 25    // 3-6 days: 25% refund
  }
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  FULL: 'dddd, MMMM d, yyyy',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm:ss',
  DATETIME: 'MMM d, yyyy HH:mm'
};

// Currency
export const CURRENCIES = [
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' }
];

// Default Currency
export const DEFAULT_CURRENCY = 'EGP';

// Validation Rules
export const VALIDATION_RULES = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MIN: 5,
  EMAIL_MAX: 100,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 50,
  PHONE_MIN: 10,
  PHONE_MAX: 15,
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 5000,
  COMMENT_MAX: 500
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain letters, numbers and special characters',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_NAME: 'Name must be between 2-100 characters',
  BOOKING_DATE_INVALID: 'Booking must be at least 15 days in advance',
  PERSONS_INVALID: 'Number of persons must be between 1-20',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'Please login to continue',
  FORBIDDEN: 'You do not have permission to access this',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please check your input',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
  BOOKING_FAILED: 'Failed to create booking. Please try again'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_CANCELLED: 'Booking cancelled successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  WISHLIST_ADDED: 'Added to wishlist!',
  WISHLIST_REMOVED: 'Removed from wishlist!'
};

// Routes
export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  PACKAGE_DETAIL: '/packages/:id',
  BOOKING: '/booking/:packageId',
  DASHBOARD: '/dashboard',
  BOOKINGS: '/dashboard/bookings',
  WISHLIST: '/dashboard/wishlist',
  PROFILE: '/dashboard/profile',
  REVIEWS: '/dashboard/reviews',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  ADMIN: '/admin',
  ADMIN_PACKAGES: '/admin/packages',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_BLOG: '/admin/blog',
  ADMIN_REPORTS: '/admin/reports',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
  ABOUT: '/about',
  CONTACT: '/contact'
};

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  RECENT_SEARCHES: 'recentSearches',
  SAVED_FILTERS: 'savedFilters',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme'
};

// Debounce Delays (milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  TYPING: 500,
  RESIZE: 200
};

// Toast Duration (milliseconds)
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000
};

// Avatar Placeholder
export const AVATAR_PLACEHOLDER = 'https://via.placeholder.com/150?text=User';

// Max File Sizes (bytes)
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  PROFILE_PICTURE: 2 * 1024 * 1024 // 2MB
};

// Accepted File Types
export const ACCEPTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  TRIP_TYPES,
  BOOKING_STATUS,
  PAYMENT_TYPES,
  ROOM_TYPES,
  DURATION_RANGES,
  BUDGET_RANGES,
  ACTIVITIES,
  RATING_OPTIONS,
  NOTIFICATION_TYPES,
  PAGINATION,
  SORT_OPTIONS,
  BOOKING_RULES,
  DATE_FORMATS,
  CURRENCIES,
  DEFAULT_CURRENCY,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  LOCAL_STORAGE_KEYS,
  DEBOUNCE_DELAYS,
  TOAST_DURATION,
  AVATAR_PLACEHOLDER,
  MAX_FILE_SIZES,
  ACCEPTED_FILE_TYPES
};