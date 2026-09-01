import { Router } from 'express';
import { PackageController } from '../controllers/PackageController.js';
import { PackageAddonController } from '../controllers/PackageAddonController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new PackageController();
const getAddonController = () => new PackageAddonController();

// ⭐ IMPORTANT: Order matters! Put specific routes before /:id
// Static/feature routes MUST come before parameterized routes

// 1️⃣ Static/Feature routes FIRST (most specific)
router.get('/debug/category-packages/:categoryId', (req, res, next) =>
  getController().debugCategoryPackages(req, res, next)
);

router.get('/debug/linking-status', (req, res, next) =>
  getController().debugCategoryLinking(req, res, next)
);

router.get('/featured', (req, res, next) =>
  getController().getFeaturedPackages(req, res, next)
);

// 2️⃣ More specific routes with patterns
router.get('/search', (req, res, next) =>
  getController().searchPackages(req, res, next)
);

router.get('/destinations/autocomplete', (req, res, next) =>
  getController().getDestinationSuggestions(req, res, next)
);

router.get('/destinations/all', (req, res, next) =>
  getController().getAllDestinations(req, res, next)
);

router.get('/category/:categoryId', (req, res, next) =>
  getController().getByCategory(req, res, next)
);

router.post('/calculate-price', (req, res, next) =>
  getController().calculatePrice(req, res, next)
);

// ⭐ ADDONS ROUTES - BEFORE /:id ROUTE (IMPORTANT!)
// These must come before the generic /:id route
router.get('/:packageId/addons', (req, res, next) =>
  getAddonController().getPackageAddons(req, res, next)
);

router.post('/:packageId/addons', authMiddleware, adminMiddleware, (req, res, next) =>
  getAddonController().createAddon(req, res, next)
);

router.put('/:packageId/addons/:addonId', authMiddleware, adminMiddleware, (req, res, next) =>
  getAddonController().updateAddon(req, res, next)
);

router.delete('/:packageId/addons/:addonId', authMiddleware, adminMiddleware, (req, res, next) =>
  getAddonController().deleteAddon(req, res, next)
);

router.put('/:packageId/addons/bulk-update', authMiddleware, adminMiddleware, (req, res, next) =>
  getAddonController().bulkUpdateAddons(req, res, next)
);

router.get('/:id/related', (req, res, next) =>
  getController().getRelatedPackages(req, res, next)
);

// 3️⃣ Admin routes - CRUD operations (require auth & admin)
router.post('/', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().createPackage(req, res, next)
);

router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().updatePackage(req, res, next)
);

router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().deletePackage(req, res, next)
);

// 4️⃣ Parameterized route - LAST (least specific)
router.get('/:id', (req, res, next) =>
  getController().getPackageById(req, res, next)
);

export default router;