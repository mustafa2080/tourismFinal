import { Router } from 'express';
import { ItineraryController } from '../controllers/ItineraryController.js';
import { debugItineraryData } from '../controllers/DebugController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

const getController = () => new ItineraryController();

// ⭐ Debug routes (public for now)
// Debug: Get raw database data for a package
router.get('/debug/:packageId', debugItineraryData);

// ⭐ Public routes
// Get all itineraries for a package
router.get('/package/:packageId', (req, res, next) =>
  getController().getPackageItineraries(req, res, next)
);

// Get specific itinerary
router.get('/:id', (req, res, next) =>
  getController().getItineraryById(req, res, next)
);

// ⭐ Admin routes (require auth & admin)
// Create new itinerary
router.post('/', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().createItinerary(req, res, next)
);

// Update itinerary
router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().updateItinerary(req, res, next)
);

// Delete itinerary
router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().deleteItinerary(req, res, next)
);

// Upsert (update or create)
router.post('/upsert', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().upsertItinerary(req, res, next)
);

export default router;
