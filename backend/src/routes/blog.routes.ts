import { Router } from 'express';
import { BlogController } from '../controllers/BlogController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Lazy initialization
const getController = () => new BlogController();

// Public routes
router.get('/', (req, res, next) =>
  getController().getPosts(req, res, next)
);

router.get('/recent', (req, res, next) =>
  getController().getRecentPosts(req, res, next)
);

router.get('/search', (req, res, next) =>
  getController().searchPosts(req, res, next)
);

router.get('/:slug', (req, res, next) =>
  getController().getPostBySlug(req, res, next)
);

// Protected routes - Admin only
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

router.get('/admin/all', authMiddleware, adminMiddleware, (req, res, next) =>
  getController().getAllPostsForAdmin(req, res, next)
);

export default router;
