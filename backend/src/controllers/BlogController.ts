/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { BlogService } from '../services/BlogService.js';
import { AppError } from '../utils/errors.js';

export class BlogController {
  private blogService: BlogService;

  constructor() {
    this.blogService = new BlogService();
  }

  /**
   * GET /api/blog
   * Get all published posts
   */
  async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const result = await this.blogService.getAllPosts(limit, offset);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: {
          limit,
          offset,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/blog/:slug
   * Get post by slug
   */
  async getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;

      const post = await this.blogService.getPostBySlug(slug);

      if (!post) {
        throw new AppError(404, 'Post not found');
      }

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/blog/recent
   * Get recent posts
   */
  async getRecentPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 5);

      const posts = await this.blogService.getRecentPosts(limit);

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/blog/search
   * Search posts
   */
  async searchPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

      if (!query) {
        throw new AppError(400, 'Search query is required');
      }

      const posts = await this.blogService.searchPosts(query, limit);

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/blog
   * Create new post - admin only
   */
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorId = (req as any).user?.userId;
      if (!authorId) {
        throw new AppError(401, 'Authentication required');
      }

      const { title, body, slug, excerpt } = req.body;

      const post = await this.blogService.createPost(title, body, slug, authorId, excerpt);

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/blog/:id
   * Update post - admin only
   */
  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const post = await this.blogService.updatePost(id, updates);

      res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/blog/:id
   * Delete post - admin only
   */
  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.blogService.deletePost(id);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/blog/:id/publish
   * Publish post - admin only
   */
  async publishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const post = await this.blogService.publishPost(id);

      res.status(200).json({
        success: true,
        message: 'Post published successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/blog/:id/unpublish
   * Unpublish post - admin only
   */
  async unpublishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const post = await this.blogService.unpublishPost(id);

      res.status(200).json({
        success: true,
        message: 'Post unpublished successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/blog/admin/all
   * Get all posts for admin - admin only
   */
  async getAllPostsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const result = await this.blogService.getAllPostsForAdmin(limit, offset);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: {
          limit,
          offset,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
