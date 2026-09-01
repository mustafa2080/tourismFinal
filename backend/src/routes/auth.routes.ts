import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateLogin, validateUserRegistration } from '../middleware/validationMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new AuthController();

// 🔐 CSRF Token Route - Must be accessible without auth
router.get('/csrf-token', (req, res, next) =>
  getController().getCSRFToken(req, res, next)
);

// Public routes - with rate limiting and validation
router.post('/register', authLimiter, validateUserRegistration, (req, res, next) =>
  getController().register(req, res, next)
);

router.post('/login', authLimiter, validateLogin, (req, res, next) =>
  getController().login(req, res, next)
);

router.post('/admin/setup', authLimiter, (req, res, next) =>
  getController().setupAdmin(req, res, next)
);

router.post('/refresh-token', (req, res, next) =>
  getController().refreshToken(req, res, next)
);

// 🔐 Password Reset Routes
router.post('/forgot-password', authLimiter, (req, res, next) =>
  getController().forgotPassword(req, res, next)
);

router.post('/reset-password', authLimiter, (req, res, next) =>
  getController().resetPassword(req, res, next)
);

router.get('/verify-reset-token/:token', (req, res, next) =>
  getController().verifyResetToken(req, res, next)
);

// Protected routes
router.post('/change-password', authMiddleware, (req, res, next) =>
  getController().changePassword(req, res, next)
);

router.get('/profile', authMiddleware, (req, res, next) =>
  getController().getProfile(req, res, next)
);

router.put('/profile', authMiddleware, (req, res, next) =>
  getController().updateProfile(req, res, next)
);

router.get('/profile-image', authMiddleware, (req, res, next) =>
  getController().getProfileImage(req, res, next)
);

export default router;
