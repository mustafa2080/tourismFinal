import { Router } from 'express';
import SettingsController from '../controllers/SettingsController';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = new SettingsController();

// All settings routes require authentication
router.use(authMiddleware);

// Public routes (any authenticated user can read settings)
router.get('/all', (req, res, next) => controller.getAllSettings(req, res, next));
router.get('/key/:key', (req, res, next) => controller.getSettingByKey(req, res, next));
router.get('/category/:category', (req, res, next) => 
  controller.getSettingsByCategory(req, res, next)
);
router.get('/health', (req, res, next) => controller.getSystemHealth(req, res, next));

// Admin-only routes (require admin middleware)
router.use(adminMiddleware);

router.patch('/update/:key', (req, res, next) => 
  controller.updateSetting(req, res, next)
);

router.patch('/update-multiple', (req, res, next) => 
  controller.updateMultipleSettings(req, res, next)
);

router.post('/reset', (req, res, next) => 
  controller.resetSettings(req, res, next)
);

router.post('/test-email', (req, res, next) => 
  controller.testEmailConfig(req, res, next)
);

export default router;
