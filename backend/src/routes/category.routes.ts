/// <reference types="express" />
import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new CategoryController();

// ⭐ Static routes FIRST (most specific)
router.get('/with-packages', (req, res, next) =>
  getController().getCategoriesWithPackageCount(req, res, next)
);

// Public routes - General get all
router.get('/', (req, res, next) =>
  getController().getAllCategories(req, res, next)
);

// Parameterized route - LAST (least specific)
router.get('/:id', (req, res, next) =>
  getController().getCategoryById(req, res, next)
);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().createCategory(req, res, next)
);

router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().updateCategory(req, res, next)
);

router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().deleteCategory(req, res, next)
);

export default router;