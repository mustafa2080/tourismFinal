import { Router } from 'express';
import { BookingController } from '../controllers/BookingController.js';
import { BookingExtraController } from '../controllers/BookingExtraController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { verifyOwner, checkRole } from '../middleware/permissionMiddleware.js';
import { bookingLimiter, adminActionLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateBooking } from '../middleware/validationMiddleware.js';

const router = Router();

// Lazy initialization
const getBookingController = () => new BookingController();
const getExtraController = () => new BookingExtraController();

// ⭐ Static/Named routes FIRST (most specific)

// Price calculation (no auth required - for preview)
router.post('/calculate-price', (req, res, next) =>
  getBookingController().calculatePrice(req, res, next)
);

// My bookings - User can only see their own
router.get('/my-bookings', authMiddleware, (req, res, next) =>
  getBookingController().getUserBookings(req, res, next)
);

// Admin only - View bookings by status
router.get('/status/:status', authMiddleware, adminMiddleware, adminActionLimiter, (req, res, next) =>
  getBookingController().getBookingsByStatus(req, res, next)
);

// Admin only - View upcoming bookings
router.get('/upcoming/all', authMiddleware, adminMiddleware, (req, res, next) =>
  getBookingController().getUpcomingBookings(req, res, next)
);

// Public - Count bookings for package
router.get('/package/:packageId/count', (req, res, next) =>
  getBookingController().countPackageBookings(req, res, next)
);

// Protected routes - After specific routes
// Create booking with validation and rate limiting
router.post('/', authMiddleware, bookingLimiter, validateBooking, (req, res, next) =>
  getBookingController().createBooking(req, res, next)
);

// Parameterized routes - LAST
// Get single booking - User can only see their own or admin can see any
router.get('/:id', authMiddleware, (req, res, next) =>
  getBookingController().getBooking(req, res, next)
);

// Get invoice - User can only get their own invoice
router.get('/:id/invoice', authMiddleware, (req, res, next) =>
  getBookingController().getBookingInvoice(req, res, next)
);

// Cancel booking - User can only cancel their own
router.post('/:id/cancel', authMiddleware, (req, res, next) =>
  getBookingController().cancelBooking(req, res, next)
);

// Complete trip - User can mark their booking as completed to leave a review
router.post('/:id/complete', authMiddleware, (req, res, next) =>
  getBookingController().completeTrip(req, res, next)
);

// Update status - Admin only
router.put('/:id/status', authMiddleware, adminMiddleware, adminActionLimiter, (req, res, next) =>
  getBookingController().updateBookingStatus(req, res, next)
);

// Booking Extras routes - After booking routes
router.get('/:bookingId/extras', authMiddleware, (req, res, next) =>
  getExtraController().getBookingExtras(req, res, next)
);

router.post('/:bookingId/extras', authMiddleware, (req, res, next) =>
  getExtraController().addBookingExtra(req, res, next)
);

router.put('/extras/:extraId', authMiddleware, (req, res, next) =>
  getExtraController().updateBookingExtra(req, res, next)
);

router.delete('/extras/:extraId', authMiddleware, (req, res, next) =>
  getExtraController().deleteBookingExtra(req, res, next)
);

export default router;
