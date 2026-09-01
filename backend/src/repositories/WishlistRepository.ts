/// <reference types="express" />
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/Wishlist.js';
import { BaseRepository } from './BaseRepository.js';

export class WishlistRepository extends BaseRepository<Wishlist> {
  constructor(repository: Repository<Wishlist>) {
    super(repository);
  }

  /**
   * جلب wishlist المستخدم
   */
  async findByUserId(userId: string): Promise<Wishlist[]> {
    const result = await this.repository
      .createQueryBuilder('wishlist')
      .where('wishlist.user_id = :userId', { userId })
      .leftJoinAndSelect('wishlist.package', 'package')
      .leftJoinAndSelect('package.images', 'images')
      .leftJoinAndSelect('package.category', 'category')
      .orderBy('wishlist.created_at', 'DESC')
      .addOrderBy('images.order', 'ASC')
      .getMany();
    
    console.log('📦 [WishlistRepository.findByUserId] Query executed for user:', userId);
    console.log('📦 [WishlistRepository] Found items:', result.length);
    
    result.forEach((w, idx) => {
      console.log(`\n📦 [WishlistRepository] Item ${idx + 1}:`, {
        id: w.id,
        package_id: w.package_id,
        package_loaded: !!w.package,
        package_title: w.package?.title,
        images_array: w.package?.images ? 'YES' : 'NO',
        images_count: w.package?.images?.length || 0,
        images_details: w.package?.images?.map(img => ({
          id: img.id,
          url: img.url || 'URL_IS_NULL',
          alt_text: img.alt_text,
          order: img.order
        }))
      });
    });
    
    return result;
  }

  /**
   * التحقق من وجود عنصر في الـ wishlist
   */
  async findByUserAndPackage(userId: string, packageId: string): Promise<Wishlist | null> {
    return await this.repository.findOne({
      where: { user_id: userId, package_id: packageId },
    });
  }

  /**
   * إضافة إلى wishlist
   */
  async addToWishlist(userId: string, packageId: string): Promise<Wishlist> {
    const wishlist = this.repository.create({
      user_id: userId,
      package_id: packageId,
    });
    return await this.repository.save(wishlist);
  }

  /**
   * حذف من wishlist
   */
  async removeFromWishlist(userId: string, packageId: string): Promise<boolean> {
    const result = await this.repository.delete({
      user_id: userId,
      package_id: packageId,
    });
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * عد عناصر wishlist
   */
  async countByUserId(userId: string): Promise<number> {
    return await this.repository.count({
      where: { user_id: userId },
    });
  }
}
