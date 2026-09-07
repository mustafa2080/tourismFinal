/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { BlogService } from '../services/BlogService.js';
import { AppError } from '../utils/errors.js';
import { invalidateCache } from '../middleware/cachingMiddleware.js';

export class BlogController {
  private blogService: BlogService;

  constructor() {
    this.blogService = new BlogService();
  }

  // ---------- Public ----------

  async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const categoryId = (req.query.category as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const tag = (req.query.tag as string) || undefined;

      const result = await this.blogService.getAllPosts(limit, offset, { categoryId, search, tag });

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: { limit, offset, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const post = await this.blogService.getPostBySlug(slug);
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async getRecentPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, Math.min(20, parseInt(req.query.limit as string) || 5));
      const posts = await this.blogService.getRecentPosts(limit);
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      next(error);
    }
  }

  async searchPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
      if (!query) throw new AppError(400, 'Search query is required');

      const posts = await this.blogService.searchPosts(query, limit);
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      next(error);
    }
  }

  async getRelatedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const limit = Math.max(1, Math.min(10, parseInt(req.query.limit as string) || 3));
      const posts = await this.blogService.getRelatedPosts(id, limit);
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      next(error);
    }
  }

  // ---------- Categories ----------

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.blogService.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = req.body;
      const category = await this.blogService.createCategory(name, description);
      await invalidateCache('/api/blog');
      res.status(201).json({ success: true, message: 'Category created', data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.blogService.updateCategory(id, req.body);
      await invalidateCache('/api/blog');
      res.status(200).json({ success: true, message: 'Category updated', data: category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.blogService.deleteCategory(id);
      await invalidateCache('/api/blog');
      res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  }

  // ---------- Admin ----------

  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorId = (req as any).user?.userId;
      if (!authorId) throw new AppError(401, 'Authentication required');

      const post = await this.blogService.createPost(req.body, authorId);
      await invalidateCache('/api/blog');
      res.status(201).json({ success: true, message: 'Post created successfully', data: post });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const post = await this.blogService.updatePost(id, req.body);
      await invalidateCache('/api/blog');
      res.status(200).json({ success: true, message: 'Post updated successfully', data: post });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.blogService.deletePost(id);
      await invalidateCache('/api/blog');
      res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async publishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const post = await this.blogService.setPublished(id, true);
      await invalidateCache('/api/blog');
      res.status(200).json({ success: true, message: 'Post published successfully', data: post });
    } catch (error) {
      next(error);
    }
  }

  async unpublishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const post = await this.blogService.setPublished(id, false);
      await invalidateCache('/api/blog');
      res.status(200).json({ success: true, message: 'Post unpublished successfully', data: post });
    } catch (error) {
      next(error);
    }
  }

  async getPostByIdForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const post = await this.blogService.getPostByIdForAdmin(id);
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async getAllPostsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const categoryId = (req.query.category as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const publishedParam = req.query.published as string | undefined;
      const published = publishedParam === undefined ? undefined : publishedParam === 'true';

      const result = await this.blogService.getAllPostsForAdmin(limit, offset, {
        categoryId,
        search,
        published,
      });

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: { limit, offset, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.blogService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
