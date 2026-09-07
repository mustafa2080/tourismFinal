import { Router } from 'express';
import { BlogController } from '../controllers/BlogController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new BlogController();

// ============ Admin routes (registered first: '/admin/*' would otherwise
// be swallowed by the '/:slug' catch-all below) ============

router.get('/admin/all', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getAllPostsForAdmin(req, res, next)
);
router.get('/admin/stats', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getStats(req, res, next)
);
router.get('/admin/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getPostByIdForAdmin(req, res, next)
);

router.post('/admin/categories', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().createCategory(req, res, next)
);
router.put('/admin/categories/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().updateCategory(req, res, next)
);
router.delete('/admin/categories/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().deleteCategory(req, res, next)
);

router.post('/', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().createPost(req, res, next)
);
router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().updatePost(req, res, next)
);
router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().deletePost(req, res, next)
);
router.post('/:id/publish', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().publishPost(req, res, next)
);
router.post('/:id/unpublish', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().unpublishPost(req, res, next)
);

// ============ Public routes ============
// NOTE: specific paths must be registered before the '/:slug' catch-all.

router.get('/', (req, res, next) => getController().getPosts(req, res, next));
router.get('/recent', (req, res, next) => getController().getRecentPosts(req, res, next));
router.get('/search', (req, res, next) => getController().searchPosts(req, res, next));
router.get('/categories', (req, res, next) => getController().getCategories(req, res, next));
router.get('/:id/related', (req, res, next) => getController().getRelatedPosts(req, res, next));
router.get('/:slug', (req, res, next) => getController().getPostBySlug(req, res, next));

export default router;
