/// <reference types="express" />
import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new DashboardController();

// All routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/stats/advanced - الإحصائيات المتقدمة (يجب أن يكون قبل الـ routes الأخرى)
router.get('/stats/advanced', (req, res, next) =>
  getController().getAdvancedStats(req, res, next)
);

// GET /api/dashboard - الإحصائيات الرئيسية
router.get('/', (req, res, next) =>
  getController().getUserDashboard(req, res, next)
);

// GET /api/dashboard/bookings - جميع الحجوزات
router.get('/bookings', (req, res, next) =>
  getController().getUserBookings(req, res, next)
);

// GET /api/dashboard/wishlist - الـ wishlist
router.get('/wishlist', (req, res, next) =>
  getController().getUserWishlist(req, res, next)
);

// GET /api/dashboard/reviews - التقييمات
router.get('/reviews', (req, res, next) =>
  getController().getUserReviews(req, res, next)
);

export default router;