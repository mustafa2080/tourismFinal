/// <reference types="express" />
import { Router } from 'express';
import { ContactController } from '../controllers/ContactController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new ContactController();

// Public route - submit contact form
router.post('/', (req, res, next) =>
  getController().submitContactForm(req, res, next)
);

// Admin routes - protected
// ⚠️ IMPORTANT: Status routes MUST come before /:id route to prevent /status/:status being caught by /:id
router.get('/stats/pending', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getPendingCount(req, res, next)
);

router.get('/status/:status', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getSubmissionsByStatus(req, res, next)
);

router.put('/:id/status', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().updateSubmissionStatus(req, res, next)
);

router.get('/', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getAllSubmissions(req, res, next)
);

router.get('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getSubmissionById(req, res, next)
);

router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().deleteSubmission(req, res, next)
);

export default router;