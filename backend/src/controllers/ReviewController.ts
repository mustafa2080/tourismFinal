/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/ReviewService.js';
import { AppError, ValidationError } from '../utils/errors.js';
import { WebSocketService } from '../websocket/socket.js';

export class ReviewController {
  private reviewService: ReviewService;
  private socketService: WebSocketService;

  constructor(socketService?: WebSocketService) {
    this.reviewService = new ReviewService();
    this.socketService = socketService;
  }

  /**
   * GET /api/reviews/package/:packageId
   * Get all approved reviews for a package
   */
  async getPackageReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      console.log(`📋 [ReviewController.getPackageReviews] Fetching reviews for package ${packageId}, limit: ${limit}, offset: ${offset}`);

      const result = await this.reviewService.getReviewsForPackage(packageId, limit, offset);

      console.log(`✅ [ReviewController.getPackageReviews] Found ${result.reviews.length} reviews (total: ${result.total})`);

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: {
          limit,
          offset,
          total: result.total,
        },
      });
    } catch (error) {
      console.error('❌ [ReviewController.getPackageReviews] Error:', error);
      next(error);
    }
  }

  /**
   * GET /api/reviews/top/:packageId
   * Get top rated reviews for a package
   */
  async getTopReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;
      const limit = Math.max(1, parseInt(req.query.limit as string) || 5);

      const reviews = await this.reviewService.getTopReviews(packageId, limit);

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reviews
   * Create a new review
   * Auth required
   */
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { packageId, rating, comment } = req.body;

      console.log('📝 [ReviewController.createReview] Creating review:', {
        userId,
        packageId,
        rating,
        commentLength: comment?.length
      });

      const review = await this.reviewService.addReview(userId, packageId, rating, comment);

      // Emit WebSocket event for real-time updates
      if (this.socketService) {
        this.socketService.emitToAll('new_review', {
          reviewId: review.id,
          userId,
          packageId,
          rating,
          timestamp: new Date()
        });
      }

      console.log('✅ [ReviewController.createReview] Review created:', review.id);

      res.status(201).json({
        success: true,
        message: 'Review created successfully. Awaiting admin approval.',
        data: review,
      });
    } catch (error) {
      console.error('❌ [ReviewController.createReview] Error:', error);
      next(error);
    }
  }

  /**
   * PUT /api/reviews/:id
   * Update a review
   * Auth required - only by owner
   */
  async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await this.reviewService.updateReview(id, userId, rating, comment);

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/reviews/:id
   * Delete a review
   * Auth required - only by owner or admin
   */
  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const isAdmin = (req as any).user?.role === 'admin';

      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { id } = req.params;

      await this.reviewService.deleteReview(id, userId, isAdmin);

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reviews/:id/approve
   * Approve a review
   * Admin only
   */
  async approveReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = (req as any).user?.userId;

      console.log('✅ [ReviewController.approveReview] Approving review:', { reviewId: id, adminId });

      const review = await this.reviewService.approveReview(id);

      // Emit WebSocket event for real-time updates
      if (this.socketService) {
        this.socketService.emitToAdmins('review_approved', {
          reviewId: id,
          adminId,
          packageId: review.package_id,
          timestamp: new Date()
        });
      }

      console.log('✅ [ReviewController.approveReview] Review approved successfully');

      res.status(200).json({
        success: true,
        message: 'Review approved successfully',
        data: review,
      });
    } catch (error) {
      console.error('❌ [ReviewController.approveReview] Error:', error);
      next(error);
    }
  }

  /**
   * POST /api/reviews/:id/reject
   * Reject a review
   * Admin only
   */
  async rejectReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = (req as any).user?.userId;
      const { reason } = req.body;

      console.log('❌ [ReviewController.rejectReview] Rejecting review:', { reviewId: id, adminId, reason });

      const review = await this.reviewService.rejectReview(id);

      // Emit WebSocket event for real-time updates
      if (this.socketService) {
        this.socketService.emitToAdmins('review_rejected', {
          reviewId: id,
          adminId,
          reason,
          packageId: review.package_id,
          timestamp: new Date()
        });
      }

      console.log('❌ [ReviewController.rejectReview] Review rejected successfully');

      res.status(200).json({
        success: true,
        message: 'Review rejected successfully',
        data: review,
      });
    } catch (error) {
      console.error('❌ [ReviewController.rejectReview] Error:', error);
      next(error);
    }
  }

  /**
   * GET /api/reviews/pending
   * Get pending reviews awaiting approval
   * Admin only
   */
  async getPendingReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      console.log('📋 [ReviewController.getPendingReviews] Fetching pending reviews:', { limit, offset });

      const result = await this.reviewService.getPendingReviews(limit, offset);

      console.log('✅ [ReviewController.getPendingReviews] Found pending reviews:', {
        count: result.reviews.length,
        total: result.total
      });

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: {
          limit,
          offset,
          total: result.total,
        },
      });
    } catch (error) {
      console.error('❌ [ReviewController.getPendingReviews] Error:', error);
      next(error);
    }
  }

  /**
   * GET /api/reviews/package/:packageId/average
   * Get average rating for a package
   */
  async getAverageRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;

      const average = await this.reviewService.getPackageAverageRating(packageId);

      res.status(200).json({
        success: true,
        data: {
          packageId,
          averageRating: average,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/package/:packageId/distribution
   * Get rating distribution for a package
   */
  async getRatingDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;

      const distribution = await this.reviewService.getRatingDistribution(packageId);

      res.status(200).json({
        success: true,
        data: {
          packageId,
          distribution,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/user/:userId
   * Get user's reviews
   */
  async getUserReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const result = await this.reviewService.getUserReviews(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: result.reviews,
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
   * POST /api/reviews/admin/auto-approve-pending
   * Auto-approve all pending reviews (admin debug endpoint)
   * Admin only
   */
  async autoApprovePendingReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔧 [ReviewController.autoApprovePendingReviews] Auto-approving all pending reviews...');
      
      const result = await this.reviewService.autoApprovePendingReviews();

      console.log(`✅ [ReviewController.autoApprovePendingReviews] Successfully approved ${result.approved} reviews`);

      res.status(200).json({
        success: true,
        message: `Approved ${result.approved} pending reviews`,
        data: {
          approved: result.approved,
          updated_packages: result.updated_packages
        },
      });
    } catch (error) {
      console.error('❌ [ReviewController.autoApprovePendingReviews] Error:', error);
      next(error);
    }
  }
}
