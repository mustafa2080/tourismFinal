/// <reference types="express" />
import { Router } from 'express';
import { WishlistController } from '../controllers/WishlistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new WishlistController();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/wishlist/count - عد العناصر (Must be before /:packageId)
router.get('/count', (req, res, next) =>
  getController().getWishlistCount(req, res, next)
);

// GET /api/users/wishlist/check/:packageId - التحقق من الوجود
router.get('/check/:packageId', (req, res, next) =>
  getController().checkInWishlist(req, res, next)
);

// GET /api/users/wishlist - جلب wishlist المستخدم
router.get('/', (req, res, next) =>
  getController().getWishlist(req, res, next)
);

// POST /api/users/wishlist - إضافة إلى wishlist
router.post('/', (req, res, next) =>
  getController().addToWishlist(req, res, next)
);

// DELETE /api/users/wishlist/:packageId - حذف من wishlist
router.delete('/:packageId', (req, res, next) =>
  getController().removeFromWishlist(req, res, next)
);

export default router;