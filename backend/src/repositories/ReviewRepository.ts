import { Repository } from 'typeorm';
import { Review } from '../entities/Review.js';
import { BaseRepository } from './BaseRepository.js';

export class ReviewRepository extends BaseRepository<Review> {
  constructor(repository: Repository<Review>) {
    super(repository);
  }

  async findPackageReviews(packageId: string): Promise<Review[]> {
    return await this.repository.find({
      where: { package_id: packageId, approved: true },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findUserPackageReview(userId: string, packageId: string): Promise<Review | null> {
    return await this.repository.findOne({
      where: { user_id: userId, package_id: packageId },
    });
  }

  async findPendingApproval(): Promise<Review[]> {
    return await this.repository.find({
      where: { approved: false },
      relations: ['user', 'package'],
      order: { created_at: 'DESC' },
    });
  }

  async getPackageAverageRating(packageId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('review')
      .where('review.package_id = :packageId', { packageId })
      .andWhere('review.approved = :approved', { approved: true })
      .select('AVG(review.rating)', 'average')
      .getRawOne();

    const average = result.average ? parseFloat(result.average) : 0;
    return parseFloat(average.toFixed(2));
  }

  async getPackageAverageRatingAll(packageId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('review')
      .where('review.package_id = :packageId', { packageId })
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .getRawOne();

    const average = result.average ? parseFloat(result.average) : 0;
    const count = result.count || 0;
    console.log(`📊 [ReviewRepository.getPackageAverageRatingAll] Package ${packageId}: average=${average.toFixed(2)}, count=${count}`);
    return parseFloat(average.toFixed(2));
  }
}
