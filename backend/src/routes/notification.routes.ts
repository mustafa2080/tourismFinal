import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { csrfMiddleware } from '../middleware/csrfMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new NotificationController();

// Protected routes - auth required
router.get('/', authMiddleware, (req, res, next) =>
  getController().getNotifications(req, res, next)
);

router.get('/unread', authMiddleware, (req, res, next) =>
  getController().getUnreadCount(req, res, next)
);

router.get('/unread/list', authMiddleware, (req, res, next) =>
  getController().getUnreadNotifications(req, res, next)
);

router.get('/type/:type', authMiddleware, (req, res, next) =>
  getController().getNotificationsByType(req, res, next)
);

router.put('/:id/read', authMiddleware, csrfMiddleware, (req, res, next) =>
  getController().markAsRead(req, res, next)
);

router.put('/read-all', authMiddleware, csrfMiddleware, (req, res, next) =>
  getController().markAllAsRead(req, res, next)
);

router.delete('/:id', authMiddleware, csrfMiddleware, (req, res, next) =>
  getController().deleteNotification(req, res, next)
);

router.delete('/', authMiddleware, csrfMiddleware, (req, res, next) =>
  getController().deleteAllNotifications(req, res, next)
);

export default router;
