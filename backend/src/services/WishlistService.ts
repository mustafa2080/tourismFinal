/// <reference types="express" />
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/Wishlist.js';
import { WishlistRepository } from '../repositories/WishlistRepository.js';
import { AppError, ValidationError, NotFoundError } from '../utils/errors.js';

export class WishlistService {
  private wishlistRepository: WishlistRepository;

  constructor(wishlistRepo: Repository<Wishlist>) {
    this.wishlistRepository = new WishlistRepository(wishlistRepo);
  }

  /**
   * جلب wishlist المستخدم
   */
  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    return await this.wishlistRepository.findByUserId(userId);
  }

  /**
   * إضافة إلى wishlist
   */
  async addToWishlist(userId: string, packageId: string): Promise<Wishlist> {
    if (!userId || !packageId) {
      throw new ValidationError('User ID and Package ID are required');
    }

    console.log(`📌 [WishlistService.addToWishlist] Adding packageId: ${packageId} for userId: ${userId}`);

    // التحقق من عدم الإضافة مسبقاً
    const existing = await this.wishlistRepository.findByUserAndPackage(userId, packageId);
    if (existing) {
      console.log(`⚠️ [WishlistService.addToWishlist] Package already in wishlist`);
      throw new AppError(400, 'Package already in wishlist');
    }

    const result = await this.wishlistRepository.addToWishlist(userId, packageId);
    console.log(`✅ [WishlistService.addToWishlist] Successfully added:`, result);
    return result;
  }

  /**
   * حذف من wishlist
   */
  async removeFromWishlist(userId: string, packageId: string): Promise<void> {
    if (!userId || !packageId) {
      throw new ValidationError('User ID and Package ID are required');
    }

    console.log(`📌 [WishlistService.removeFromWishlist] Removing packageId: ${packageId} for userId: ${userId}`);

    const removed = await this.wishlistRepository.removeFromWishlist(userId, packageId);
    if (!removed) {
      console.log(`❌ [WishlistService.removeFromWishlist] Item not found in wishlist`);
      throw new NotFoundError('Item not found in wishlist');
    }
    
    console.log(`✅ [WishlistService.removeFromWishlist] Successfully removed`);
  }

  /**
   * عد عناصر wishlist
   */
  async getWishlistCount(userId: string): Promise<number> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    return await this.wishlistRepository.countByUserId(userId);
  }

  /**
   * التحقق من وجود في wishlist
   */
  async isInWishlist(userId: string, packageId: string): Promise<boolean> {
    if (!userId || !packageId) {
      return false;
    }

    const wishlist = await this.wishlistRepository.findByUserAndPackage(userId, packageId);
    return !!wishlist;
  }
}
