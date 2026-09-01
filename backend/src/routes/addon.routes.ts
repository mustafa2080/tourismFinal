import { Router } from 'express';
import { PackageAddonController } from '../controllers/PackageAddonController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router({ mergeParams: true });

const getAddonController = () => new PackageAddonController();

// Admin routes - Get addon translations
router.get('/:packageId/addons/:addonId/translations', (req, res, next) =>
  getAddonController().getAddonTranslations(req, res, next)
);

// Public routes - Get addons for a package
router.get('/:packageId/addons', (req, res, next) =>
  getAddonController().getPackageAddons(req, res, next)
);

// Admin routes - Create addon
router.post('/:packageId/addons', authMiddleware, adminMiddleware, (req, res, next) =>
  getAddonController().createAddon(req, res, next)
);

// Admin routes - Update addon
router.put('/:packageId/addons/:addonId', authMiddleware, adminMiddleware, (req, res, next) =>
  getAddonController().updateAddon(req, res, next)
);

// Admin routes - Delete addon
router.delete('/:packageId/addons/:addonId', authMiddleware, adminMiddleware, (req, res, next) =>
  getAddonController().deleteAddon(req, res, next)
);

// Admin routes - Bulk update
router.put('/:packageId/addons/bulk-update', authMiddleware, adminMiddleware, (req, res, next) =>
  getAddonController().bulkUpdateAddons(req, res, next)
);

export default router;
