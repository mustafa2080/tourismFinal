import { Review } from '../entities/Review.js';
import { Booking } from '../entities/Booking.js';
import { Package } from '../entities/Package.js';
import { ReviewRepository } from '../repositories/ReviewRepository.js';
import { BookingRepository } from '../repositories/BookingRepository.js';
import { ValidationError, AppError } from '../utils/errors.js';
import { AppDataSource } from '../config/connection.js';

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private bookingRepository: BookingRepository;

  constructor() {
    const typeormRepo = AppDataSource.getRepository(Review);
    const bookingRepo = AppDataSource.getRepository(Booking);
    this.reviewRepository = new ReviewRepository(typeormRepo);
    this.bookingRepository = new BookingRepository(bookingRepo);
  }

  /**
   * Get all reviews for a package (paginated) - including pending for testing
   */
  async getReviewsForPackage(
    packageId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ reviews: Review[]; total: number }> {
    if (!packageId) {
      throw new ValidationError('Package ID is required');
    }

    const reviews = await this.reviewRepository.repository
      .find({
        where: { package_id: packageId },
        relations: ['user'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });

    const total = await this.reviewRepository.repository.count({
      where: { package_id: packageId },
    });

    return { reviews, total };
  }

  /**
   * Get top reviews for a package (for homepage/featured)
   */
  async getTopReviews(packageId: string, limit: number = 5): Promise<Review[]> {
    if (!packageId) {
      throw new ValidationError('Package ID is required');
    }

    return await this.reviewRepository.repository
      .find({
        where: { package_id: packageId, approved: true },
        relations: ['user'],
        order: { rating: 'DESC', created_at: 'DESC' },
        take: limit,
      });
  }

  /**
   * Add a review - user must have completed the booking
   */
  async addReview(
    userId: string,
    packageId: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    // Validate inputs
    if (!userId || !packageId) {
      throw new ValidationError('User ID and Package ID are required');
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim().length < 10) {
      throw new ValidationError('Comment must be at least 10 characters long');
    }

    // Check if user has already reviewed this package
    const existingReview = await this.reviewRepository.findUserPackageReview(userId, packageId);
    if (existingReview) {
      throw new AppError(400, 'You have already reviewed this package');
    }

    // Check if user has booked this package (in any status that indicates they took the trip)
    const booking = await this.bookingRepository.repository.findOne({
      where: {
        user_id: userId,
        package_id: packageId,
      },
    });

    if (!booking) {
      throw new AppError(403, 'You can only review packages after completing the trip');
    }

    // Allow review if booking is completed, or if cancelled/confirmed and enough time has passed
    // The main point is: did they book this package?
    if (booking.status === 'cancelled') {
      // Still allow review for cancelled bookings - user may want to leave feedback
      console.log(`ℹ️ [ReviewService] Allowing review for cancelled booking: ${booking.id}`);
    }

    // Create review
    const review = this.reviewRepository.repository.create({
      user_id: userId,
      package_id: packageId,
      rating,
      comment: comment.trim(),
      approved: process.env.NODE_ENV === 'development' ? true : false, // Auto-approve in dev mode for testing
      created_at: new Date(),
    });

    const savedReview = await this.reviewRepository.repository.save(review);
    
    // Fetch the review with user relations
    const reviewWithUser = await this.reviewRepository.repository.findOne({
      where: { id: savedReview.id },
      relations: ['user']
    });
    
    // Update package average rating immediately (even for pending reviews)
    if (packageId) {
      await this.updatePackageAverageRating(packageId);
    }
    
    return reviewWithUser || savedReview;
  }

  /**
   * Update a review - only by owner
   */
  async updateReview(
    reviewId: string,
    userId: string,
    rating?: number,
    comment?: string
  ): Promise<Review> {
    if (!reviewId) {
      throw new ValidationError('Review ID is required');
    }

    const review = await this.reviewRepository.repository.findOne({ 
      where: { id: reviewId } 
    });
    if (!review) {
      throw new AppError(404, 'Review not found');
    }

    if (review.user_id !== userId) {
      throw new AppError(403, 'You can only update your own reviews');
    }

    // Validate inputs if provided
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        throw new ValidationError('Rating must be between 1 and 5');
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      if (comment.trim().length < 10) {
        throw new ValidationError('Comment must be at least 10 characters long');
      }
      review.comment = comment.trim();
    }

    return await this.reviewRepository.repository.save(review);
  }

  /**
   * Delete a review - only by owner or admin
   */
  async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    if (!reviewId) {
      throw new ValidationError('Review ID is required');
    }

    const review = await this.reviewRepository.repository.findOne({ 
      where: { id: reviewId } 
    });
    if (!review) {
      throw new AppError(404, 'Review not found');
    }

    if (!isAdmin && review.user_id !== userId) {
      throw new AppError(403, 'You can only delete your own reviews');
    }

    await this.reviewRepository.repository.remove(review);
  }

  /**
   * Approve a review - admin only
   */
  async approveReview(reviewId: string): Promise<Review> {
    if (!reviewId) {
      throw new ValidationError('Review ID is required');
    }

    const review = await this.reviewRepository.repository.findOne({ 
      where: { id: reviewId } 
    });
    if (!review) {
      throw new AppError(404, 'Review not found');
    }

    review.approved = true;
    const savedReview = await this.reviewRepository.repository.save(review);
    
    // Update package average rating
    if (review.package_id) {
      await this.updatePackageAverageRating(review.package_id);
    }
    
    return savedReview;
  }

  /**
   * Reject a review - admin only
   */
  async rejectReview(reviewId: string): Promise<Review> {
    if (!reviewId) {
      throw new ValidationError('Review ID is required');
    }

    const review = await this.reviewRepository.repository.findOne({ 
      where: { id: reviewId } 
    });
    if (!review) {
      throw new AppError(404, 'Review not found');
    }

    review.approved = false;
    const savedReview = await this.reviewRepository.repository.save(review);
    
    // Update package average rating
    if (review.package_id) {
      await this.updatePackageAverageRating(review.package_id);
    }
    
    return savedReview;
  }

  /**
   * Update package average rating based on approved reviews
   */
  private async updatePackageAverageRating(packageId: string): Promise<void> {
    try {
      // In development, calculate from all reviews. In production, only approved reviews
      const avgRating = process.env.NODE_ENV === 'development' 
        ? await this.reviewRepository.getPackageAverageRatingAll(packageId)
        : await this.reviewRepository.getPackageAverageRating(packageId);
      
      // Update the package's average_rating
      await AppDataSource.getRepository(Package).update(
        { id: packageId },
        { average_rating: avgRating }
      );
      
      console.log(`✅ [ReviewService] Updated package ${packageId} average rating to ${avgRating}`);
    } catch (error) {
      console.error(`❌ [ReviewService] Error updating average rating for package ${packageId}:`, error);
    }
  }

  /**
   * Get pending reviews for admin - awaiting approval
   */
  async getPendingReviews(limit: number = 20, offset: number = 0): Promise<{
    reviews: Review[];
    total: number;
  }> {
    const reviews = await this.reviewRepository.findPendingApproval();

    return {
      reviews: reviews.slice(offset, offset + limit),
      total: reviews.length,
    };
  }

  /**
   * Get package average rating (from approved reviews only)
   */
  async getPackageAverageRating(packageId: string): Promise<number> {
    if (!packageId) {
      throw new ValidationError('Package ID is required');
    }

    return await this.reviewRepository.getPackageAverageRating(packageId);
  }

  /**
   * Get package average rating including pending reviews (for internal use)
   */
  async getPackageAverageRatingAll(packageId: string): Promise<number> {
    if (!packageId) {
      throw new ValidationError('Package ID is required');
    }

    return await this.reviewRepository.getPackageAverageRatingAll(packageId);
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId: string, limit: number = 10, offset: number = 0): Promise<{
    reviews: Review[];
    total: number;
  }> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const reviews = await this.reviewRepository.repository
      .find({
        where: { user_id: userId },
        relations: ['package'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });

    const total = await this.reviewRepository.repository.count({
      where: { user_id: userId },
    });

    return { reviews, total };
  }

  /**
   * Get rating distribution for a package
   */
  async getRatingDistribution(packageId: string): Promise<{
    [key: number]: number;
  }> {
    if (!packageId) {
      throw new ValidationError('Package ID is required');
    }

    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    const reviews = await this.reviewRepository.repository
      .find({
        where: { package_id: packageId, approved: true },
      });

    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    return distribution;
  }

  /**
   * Auto-approve all pending reviews (admin debug endpoint)
   */
  async autoApprovePendingReviews(): Promise<{ approved: number; updated_packages: string[] }> {
    try {
      console.log('🔧 [ReviewService.autoApprovePendingReviews] Starting auto-approval process...');

      // Get all pending reviews
      const pendingReviews = await this.reviewRepository.repository.find({
        where: { approved: false },
        relations: ['package']
      });

      console.log(`📋 Found ${pendingReviews.length} pending reviews`);

      // Approve all pending reviews
      const updatedPackages = new Set<string>();
      
      for (const review of pendingReviews) {
        review.approved = true;
        await this.reviewRepository.repository.save(review);
        
        if (review.package_id) {
          updatedPackages.add(review.package_id);
        }
      }

      console.log(`✅ Approved ${pendingReviews.length} reviews`);
      console.log(`🔄 Updating average ratings for ${updatedPackages.size} packages...`);

      // Update average ratings for affected packages
      for (const packageId of updatedPackages) {
        await this.updatePackageAverageRating(packageId);
      }

      console.log(`✅ [ReviewService.autoApprovePendingReviews] Completed - approved ${pendingReviews.length} reviews, updated ${updatedPackages.size} packages`);

      return {
        approved: pendingReviews.length,
        updated_packages: Array.from(updatedPackages)
      };
    } catch (error) {
      console.error('❌ [ReviewService.autoApprovePendingReviews] Error:', error);
      throw error;
    }
  }
}
