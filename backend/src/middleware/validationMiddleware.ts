/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';

/**
 * Input Validation & Sanitization Middleware
 * Protects against XSS, SQL Injection, and malformed data
 */

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.warn(`⚠️ [Validation] Failed on ${req.path}:`, errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err: any) => ({
        field: err.param || err.path,
        message: err.msg,
        value: err.value || undefined
      }))
    });
  }
  
  next();
};

/**
 * Booking validation rules
 */
export const validateBooking = [
  body('package_id')
    .notEmpty().withMessage('Package ID is required')
    .isUUID().withMessage('Invalid package ID format'),
  
  body('start_date')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format')
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  
  body('end_date')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.start_date);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('persons')
    .notEmpty().withMessage('Number of persons is required')
    .isInt({ min: 1, max: 50 }).withMessage('Persons must be between 1 and 50'),
  
  body('total_price')
    .notEmpty().withMessage('Total price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('special_requests')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Special requests must be less than 1000 characters'),
  
  handleValidationErrors
];

/**
 * Review validation rules
 */
export const validateReview = [
  body('package_id')
    .notEmpty().withMessage('Package ID is required')
    .isUUID().withMessage('Invalid package ID format'),
  
  body('booking_id')
    .notEmpty().withMessage('Booking ID is required')
    .isUUID().withMessage('Invalid booking ID format'),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters')
    .escape(), // Prevent XSS
  
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Comment must be between 10 and 5000 characters')
    .escape(), // Prevent XSS
  
  handleValidationErrors
];

/**
 * User registration validation
 */
export const validateUserRegistration = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain special character (!@#$%^&*)'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-()]{10,}$/).withMessage('Invalid phone number format'),
  
  handleValidationErrors
];

/**
 * Login validation
 */
export const validateLogin = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Sanitize output - Remove sensitive fields from responses
 */
export const sanitizeUserResponse = (user: any) => {
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    is_verified: user.is_verified,
    created_at: user.created_at
    // Don't include: password_hash, reset_token, etc.
  };
};

/**
 * Sanitize booking response
 */
export const sanitizeBookingResponse = (booking: any) => {
  if (!booking) return null;
  
  return {
    id: booking.id,
    booking_number: booking.booking_number,
    package_id: booking.package_id,
    user_id: booking.user_id,
    start_date: booking.start_date,
    end_date: booking.end_date,
    persons: booking.persons,
    total_price: booking.total_price,
    status: booking.status,
    special_requests: booking.special_requests,
    created_at: booking.created_at
    // Don't include internal fields
  };
};

export default {
  handleValidationErrors,
  validateBooking,
  validateReview,
  validateUserRegistration,
  validateLogin,
  sanitizeUserResponse,
  sanitizeBookingResponse
};
