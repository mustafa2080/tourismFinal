/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Booking } from '../entities/Booking.js';
import { Review } from '../entities/Review.js';
import { Wishlist } from '../entities/Wishlist.js';
import { AppError } from '../utils/errors.js';

export class DashboardController {
  /**
   * GET /api/dashboard
   * جلب إحصائيات لوحة التحكم للمستخدم
   */
  async getUserDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const bookingRepository = AppDataSource.getRepository(Booking);
      const reviewRepository = AppDataSource.getRepository(Review);
      const wishlistRepository = AppDataSource.getRepository(Wishlist);

      // جلب الإحصائيات
      const totalBookings = await bookingRepository.count({
        where: { user_id: userId },
      });

      const confirmedBookings = await bookingRepository.count({
        where: { user_id: userId, status: 'confirmed' },
      });

      const completedBookings = await bookingRepository.count({
        where: { user_id: userId, status: 'completed' },
      });

      const cancelledBookings = await bookingRepository.count({
        where: { user_id: userId, status: 'cancelled' },
      });

      const totalReviews = await reviewRepository.count({
        where: { user_id: userId },
      });

      const totalWishlistItems = await wishlistRepository.count({
        where: { user_id: userId },
      });

      // جلب آخر 5 حجوزات
      const recentBookings = await bookingRepository.find({
        where: { user_id: userId },
        relations: ['package'],
        order: { created_at: 'DESC' },
        take: 5,
      });

      // جلب آخر 5 تقييمات
      const recentReviews = await reviewRepository.find({
        where: { user_id: userId },
        relations: ['package'],
        order: { created_at: 'DESC' },
        take: 5,
      });

      // جلب الحجوزات القادمة
      const upcomingBookings = await bookingRepository
        .createQueryBuilder('booking')
        .where('booking.user_id = :userId', { userId })
        .andWhere('booking.date_start > CURRENT_DATE')
        .andWhere("booking.status != 'cancelled'")
        .orderBy('booking.date_start', 'ASC')
        .take(3)
        .getMany();

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalBookings,
            confirmedBookings,
            completedBookings,
            cancelledBookings,
            totalReviews,
            totalWishlistItems,
          },
          recentBookings: recentBookings.map((b) => ({
            id: b.id,
            bookingNumber: b.booking_number,
            packageTitle: b.package?.title,
            status: b.status,
            tripStartDate: b.date_start,
            createdAt: b.created_at,
          })),
          recentReviews: recentReviews.map((r) => ({
            id: r.id,
            packageTitle: r.package?.title,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
          })),
          upcomingTrips: upcomingBookings.map((b) => ({
            id: b.id,
            bookingNumber: b.booking_number,
            packageTitle: b.package?.title,
            tripStartDate: b.date_start,
            daysUntilTrip: Math.ceil(
              (new Date(b.date_start).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ),
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/bookings
   * جلب جميع حجوزات المستخدم بـ pagination
   */
  async getUserBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const status = req.query.status as string | undefined;

      const bookingRepository = AppDataSource.getRepository(Booking);

      let query = bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.package', 'package')
        .where('booking.user_id = :userId', { userId });

      if (status) {
        query = query.andWhere('booking.status = :status', { status });
      }

      const [bookings, total] = await query
        .orderBy('booking.created_at', 'DESC')
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: bookings,
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/wishlist
   * جلب wishlist المستخدم
   */
  async getUserWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const wishlistRepository = AppDataSource.getRepository(Wishlist);

      const [wishlistItems, total] = await wishlistRepository
        .createQueryBuilder('wishlist')
        .where('wishlist.user_id = :userId', { userId })
        .leftJoinAndSelect('wishlist.package', 'package')
        .leftJoinAndSelect('package.images', 'images')
        .orderBy('wishlist.created_at', 'DESC')
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: wishlistItems,
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/reviews
   * جلب تقييمات المستخدم
   */
  async getUserReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const reviewRepository = AppDataSource.getRepository(Review);

      const [reviews, total] = await reviewRepository
        .createQueryBuilder('review')
        .where('review.user_id = :userId', { userId })
        .leftJoinAndSelect('review.package', 'package')
        .orderBy('review.created_at', 'DESC')
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/stats/advanced
   * جلب الإحصائيات المتقدمة مع تفاصيل شاملة
   */
  async getAdvancedStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      console.log('📊 [getAdvancedStats] User ID:', userId);
      
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const bookingRepository = AppDataSource.getRepository(Booking);

      // إحصائيات عامة
      const totalBookings = await bookingRepository.count({ where: { user_id: userId } });
      console.log('📊 [getAdvancedStats] Total bookings:', totalBookings);
      
      // الأموال المنفقة
      const spentResult = await bookingRepository
        .createQueryBuilder('booking')
        .select('SUM(booking.total_price)', 'total')
        .where('booking.user_id = :userId', { userId })
        .getRawOne();
      
      const totalSpent = parseFloat(spentResult?.total || 0);
      console.log('📊 [getAdvancedStats] Total spent:', totalSpent);

      // الرحلات القادمة - استخدام QueryBuilder بصيغة صحيحة
      const upcomingTrips = await bookingRepository
        .createQueryBuilder('booking')
        .where('booking.user_id = :userId', { userId })
        .andWhere('booking.date_start > CURRENT_DATE')
        .andWhere("booking.status != 'cancelled'")
        .getCount();
      console.log('📊 [getAdvancedStats] Upcoming trips:', upcomingTrips);

      // الرحلات المكتملة
      const completedTrips = await bookingRepository.count({
        where: { user_id: userId, status: 'completed' },
      });
      console.log('📊 [getAdvancedStats] Completed trips:', completedTrips);

      // توزيع الحالات - مع معالجة البيانات الفارغة
      const statusDistributionRaw = await bookingRepository
        .createQueryBuilder('booking')
        .select('booking.status', 'status')
        .addSelect('COUNT(booking.id)', 'count')
        .where('booking.user_id = :userId', { userId })
        .groupBy('booking.status')
        .getRawMany();

      console.log('📊 [getAdvancedStats] Status distribution raw:', statusDistributionRaw);

      const statusDistribution = statusDistributionRaw.map((item) => ({
        status: item.status || 'unknown',
        count: parseInt(item.count) || 0,
      }));

      // البيانات الشهرية - PostgreSQL syntax
      const monthlyDataRaw = await bookingRepository
        .createQueryBuilder('booking')
        .select('EXTRACT(MONTH FROM booking.date_start)::INTEGER', 'month')
        .addSelect('EXTRACT(YEAR FROM booking.date_start)::INTEGER', 'year')
        .addSelect('COUNT(booking.id)::INTEGER', 'trips')
        .addSelect('COALESCE(SUM(booking.total_price), 0)::NUMERIC', 'amount')
        .where('booking.user_id = :userId', { userId })
        .andWhere('booking.date_start IS NOT NULL')
        .groupBy('EXTRACT(YEAR FROM booking.date_start), EXTRACT(MONTH FROM booking.date_start)')
        .orderBy('EXTRACT(YEAR FROM booking.date_start)', 'ASC')
        .addOrderBy('EXTRACT(MONTH FROM booking.date_start)', 'ASC')
        .getRawMany();

      console.log('📊 [getAdvancedStats] Monthly data raw:', monthlyDataRaw);

      // ملء الأشهر الناقصة - آخر 6 أشهر
      const monthlyChart = Array.from({ length: 6 }, (_, i) => {
        const currentMonth = new Date();
        currentMonth.setMonth(currentMonth.getMonth() + (i - 5));
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        
        const found = monthlyDataRaw.find(
          (d) => parseInt(d.month) === month && parseInt(d.year) === year
        );
        
        console.log(`📊 [getAdvancedStats] Month ${month}/${year}:`, found);
        
        return {
          month: currentMonth.toLocaleDateString('en-US', { month: 'short' }),
          trips: found ? parseInt(found.trips) || 0 : 0,
          amount: found ? parseFloat(found.amount) || 0 : 0,
        };
      });

      console.log('📊 [getAdvancedStats] Final response data:', {
        stats: {
          totalBookings,
          totalSpent,
          upcomingTrips,
          completedTrips,
        },
        distribution: statusDistribution,
        monthlyChart,
      });

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalBookings,
            totalSpent,
            upcomingTrips,
            completedTrips,
          },
          distribution: statusDistribution,
          monthlyChart,
        },
      });
      
      console.log('✅ [getAdvancedStats] Response sent successfully');
    } catch (error) {
      next(error);
    }
  }
}
