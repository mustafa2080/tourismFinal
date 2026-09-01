import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { getWebSocketService } from '../websocket/index.js';

const router = Router();

// Lazy initialization of controller
const getController = () => new ReviewController(getWebSocketService() || undefined);

// ⭐ Static/Named routes FIRST (most specific)
router.get('/pending', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getPendingReviews(req, res, next)
);

// Admin debug endpoint
router.post('/admin/auto-approve-pending', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().autoApprovePendingReviews(req, res, next)
);

// Public package routes - specific patterns
router.get('/package/:packageId/average', (req, res, next) =>
  getController().getAverageRating(req, res, next)
);

router.get('/package/:packageId/distribution', (req, res, next) =>
  getController().getRatingDistribution(req, res, next)
);

router.get('/package/:packageId', (req, res, next) =>
  getController().getPackageReviews(req, res, next)
);

router.get('/top/:packageId', (req, res, next) =>
  getController().getTopReviews(req, res, next)
);

router.get('/user/:userId', (req, res, next) =>
  getController().getUserReviews(req, res, next)
);

// Protected routes - Customer
router.post('/', authMiddleware, (req, res, next) =>
  getController().createReview(req, res, next)
);

// Parameterized routes - LAST
router.put('/:id', authMiddleware, (req, res, next) =>
  getController().updateReview(req, res, next)
);

router.delete('/:id', authMiddleware, (req, res, next) =>
  getController().deleteReview(req, res, next)
);

// Admin routes - with :id
router.post('/:id/approve', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().approveReview(req, res, next)
);

router.post('/:id/reject', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().rejectReview(req, res, next)
);

export default router;