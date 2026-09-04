/// <reference types="express" />
import { Router } from 'express';
import { CustomTripController } from '../controllers/CustomTripController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();
const getController = () => new CustomTripController();

// ============ PUBLIC ROUTES ============

// Catalog of pickable items for the trip builder
router.get('/options', (req, res, next) => getController().getOptions(req, res, next));
router.get('/destinations', (req, res, next) => getController().getDestinations(req, res, next));

// Submit a new custom trip request (works for guests and logged-in users)
router.post('/', optionalAuthMiddleware, (req, res, next) =>
  getController().submitRequest(req, res, next)
);

// Logged-in user's own requests — MUST come before /:id
router.get('/mine', authMiddleware, (req, res, next) =>
  getController().getMyRequests(req, res, next)
);

router.get('/:id', (req, res, next) => getController().getById(req, res, next));

export default router;
