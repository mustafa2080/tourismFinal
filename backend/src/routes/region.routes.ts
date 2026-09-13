/// <reference types="express" />
import { Router } from 'express';
import { RegionController } from '../controllers/RegionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

const getController = () => new RegionController();

// ⭐ Static routes FIRST (most specific)
router.get('/admin', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getAllRegionsAdmin(req, res, next)
);

// Public routes
router.get('/', (req, res, next) =>
  getController().getAllRegions(req, res, next)
);

// Parameterized route - LAST (least specific)
router.get('/:id', (req, res, next) =>
  getController().getRegionById(req, res, next)
);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().createRegion(req, res, next)
);

router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().updateRegion(req, res, next)
);

router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().deleteRegion(req, res, next)
);

export default router;
