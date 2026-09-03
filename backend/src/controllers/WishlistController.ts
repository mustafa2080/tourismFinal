/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Wishlist } from '../entities/Wishlist.js';
import { WishlistService } from '../services/WishlistService.js';
import { AppError } from '../utils/errors.js';
import { getWebSocketService } from '../websocket/index.js';

export class WishlistController {
  private wishlistService: WishlistService;

  constructor() {
    const wishlistRepository = AppDataSource.getRepository(Wishlist);
    this.wishlistService = new WishlistService(wishlistRepository);
  }

  /**
   * GET /api/users/wishlist
   * جلب wishlist المستخدم مع بيانات الرحلات
   */
  async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const wishlist = await this.wishlistService.getUserWishlist(userId);

      console.log('🎯 [WishlistController] Raw wishlist from DB:', JSON.stringify(wishlist.map(w => ({
        id: w.id,
        package_id: w.package_id,
        package: w.package ? {
          id: w.package.id,
          title: w.package.title,
          destination: w.package.destination,
          duration_days: w.package.duration_days,
          base_price: w.package.base_price,
          images_count: w.package.images?.length || 0,
        } : null
      })), null, 2));

      // تحويل البيانات لتطابق ما يتوقعه الـ Frontend
      const formattedWishlist = wishlist.map((item) => {
        const duration = item.package?.duration_days ? Number(item.package.duration_days) : 0;
        const price = item.package?.base_price ? Number(item.package.base_price) : 0;
        const packageId = item.package_id;
        
        console.log(`🖼️ [WishlistController] Processing package "${item.package?.title}":`, {
          has_images: !!item.package?.images,
          images_count: item.package?.images?.length || 0,
          images: item.package?.images?.map((img: any) => ({
            id: img.id,
            url: img.url,
            image_data: img.image_data ? (typeof img.image_data === 'string' ? 'base64_string' : Buffer.isBuffer(img.image_data) ? 'buffer' : typeof img.image_data) : 'null',
            alt_text: img.alt_text,
            order: img.order,
          }))
        });
        
        return {
          id: packageId,
          package_id: packageId,
          title: item.package?.title || 'Unknown Package',
          destination: item.package?.destination || 'Unknown',
          duration_days: duration,
          base_price: price,
          price: price,
          short_desc: item.package?.short_desc || '',
          long_desc: item.package?.long_desc || '',
          images: item.package?.images ? item.package.images.map((img: any) => {
            let imageData = null;
            
            // تحويل Buffer إلى base64 إذا لزم الأمر
            if (img.image_data) {
              if (Buffer.isBuffer(img.image_data)) {
                imageData = img.image_data.toString('base64');
              } else if (typeof img.image_data === 'string') {
                imageData = img.image_data;
              }
            }
            
            return {
              id: img.id,
              url: img.url || '',
              image_data: imageData,
              alt_text: img.alt_text,
              order: img.order,
            };
          }) : [],
          description: item.package?.long_desc || '',
          savedAt: item.created_at,
        };
      });

      console.log('✅ [WishlistController] Formatted wishlist:', JSON.stringify(formattedWishlist, null, 2));

      res.status(200).json({
        success: true,
        data: formattedWishlist,
        count: formattedWishlist.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/wishlist
   * إضافة إلى wishlist
   */
  async addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { packageId } = req.body;

      console.log(`✅ [WishlistController.addToWishlist] User: ${userId}, Package: ${packageId}`);

      const wishlistItem = await this.wishlistService.addToWishlist(userId, packageId);

      // Fetch the complete wishlist to return full data
      const fullWishlist = await this.wishlistService.getUserWishlist(userId);
      const addedItem = fullWishlist.find(w => w.package_id === packageId);

      console.log(`✅ [WishlistController] Responding with full wishlist data`);

      // 🔔 Realtime: let any other open tab/device for this user know the
      // wishlist changed, so they can re-sync instead of showing stale data.
      getWebSocketService()?.emitToUser(userId, 'wishlist:updated', {
        action: 'added',
        packageId,
      });

      res.status(201).json({
        success: true,
        message: 'Added to wishlist',
        data: addedItem || wishlistItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/wishlist/:packageId
   * حذف من wishlist
   */
  async removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { packageId } = req.params;

      console.log(`✅ [WishlistController.removeFromWishlist] User: ${userId}, Package: ${packageId}`);

      await this.wishlistService.removeFromWishlist(userId, packageId);

      console.log(`✅ [WishlistController] Successfully deleted from wishlist`);

      // 🔔 Realtime: notify other open tabs/devices for this user
      getWebSocketService()?.emitToUser(userId, 'wishlist:updated', {
        action: 'removed',
        packageId,
      });

      res.status(200).json({
        success: true,
        message: 'Removed from wishlist',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/wishlist/count
   * عد عناصر wishlist
   */
  async getWishlistCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const count = await this.wishlistService.getWishlistCount(userId);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/wishlist/check/:packageId
   * التحقق من وجود في wishlist
   */
  async checkInWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { packageId } = req.params;

      const isInWishlist = await this.wishlistService.isInWishlist(userId, packageId);

      res.status(200).json({
        success: true,
        data: { isInWishlist },
      });
    } catch (error) {
      next(error);
    }
  }
}
