/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { User } from '../entities/User.js';
import { Booking } from '../entities/Booking.js';
import { Review } from '../entities/Review.js';
import { AdminAuditLog } from '../entities/AdminAuditLog.js';
import { SystemSettings } from '../entities/SystemSettings.js';
import { Package } from '../entities/Package.js';
import { PackageImage } from '../entities/PackageImage.js';
import { Itinerary } from '../entities/Itinerary.js';
import { PackageTranslation } from '../entities/PackageTranslation.js';

import { PackageAddon } from '../entities/PackageAddon.js';
import { Category } from '../entities/Category.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { BookingRepository } from '../repositories/BookingRepository.js';
import { ReviewRepository } from '../repositories/ReviewRepository.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingsRepository.js';
import { AppError, ValidationError } from '../utils/errors.js';
import { ReportsService } from '../services/ReportsService.js';

export class AdminController {
  private userRepository: UserRepository;
  private bookingRepository: BookingRepository;
  private reviewRepository: ReviewRepository;
  private auditRepository = AppDataSource.getRepository(AdminAuditLog);
  private reportsService: ReportsService;

  constructor() {
    this.userRepository = new UserRepository(AppDataSource.getRepository(User));
    this.bookingRepository = new BookingRepository(AppDataSource.getRepository(Booking));
    this.reviewRepository = new ReviewRepository(AppDataSource.getRepository(Review));
    this.reportsService = new ReportsService();
  }

  /**
   * Get all users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      console.log('📥 [AdminController.getAllUsers] Fetching users:', { limit, offset });

      const users = await this.userRepository.repository.find({
        select: ['id', 'name', 'email', 'phone', 'role', 'created_at'],
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' },
      });

      const total = await this.userRepository.repository.count();

      console.log('✅ [AdminController.getAllUsers] Found users:', { 
        count: users.length, 
        total,
        firstUser: users[0]?.email
      });

      res.status(200).json({
        success: true,
        data: users,
        pagination: { limit, offset, total },
      });
    } catch (error) {
      console.error('❌ [AdminController.getAllUsers] Error:', error);
      next(error);
    }
  }

  /**
   * Get single user
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await this.userRepository.repository.findOne({
        where: { id: userId },
        select: ['id', 'name', 'email', 'phone', 'role', 'created_at'],
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ban user
   */
  async banUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const adminId = (req as any).user?.userId;

      const user = await this.userRepository.repository.findOne({
        where: { id: userId }
      });
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      user.role = 'banned';
      await this.userRepository.repository.save(user);

      // Log action
      await this.logAction(adminId, 'BAN_USER', userId, { reason: req.body.reason });

      res.status(200).json({
        success: true,
        message: 'User banned successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all bookings
   */
  async getAllBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      console.log('📥 [AdminController.getAllBookings] Fetching bookings:', { limit, offset });

      const bookings = await this.bookingRepository.repository.find({
        relations: ['user', 'package', 'extras'],
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' },
      });

      const total = await this.bookingRepository.repository.count();

      // Transform bookings for better display
      const transformedBookings = bookings.map(booking => ({
        id: booking.id,
        booking_number: booking.booking_number,
        status: booking.status,
        persons: booking.persons,
        date_start: booking.date_start,
        total_price: booking.total_price,
        payment_type: booking.payment_type,
        notes: booking.notes,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        // User info
        user_id: booking.user_id,
        customerName: booking.user?.name || 'Unknown',
        customerEmail: booking.user?.email || '',
        customerPhone: booking.user?.phone || '',
        // Package info
        package_id: booking.package_id,
        packageName: booking.package?.title || 'Unknown',
        // Extras count
        extrasCount: booking.extras?.length || 0,
      }));

      console.log('✅ [AdminController.getAllBookings] Found', bookings.length, 'bookings');

      res.status(200).json({
        success: true,
        data: transformedBookings,
        pagination: { limit, offset, total },
      });
    } catch (error) {
      console.error('❌ [AdminController.getAllBookings] Error:', error);
      next(error);
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📊 [AdminController.getBookingStats] Fetching booking statistics');

      const bookingStats = await this.reportsService.getBookingStats();

      res.status(200).json({
        success: true,
        data: bookingStats,
      });
    } catch (error) {
      console.error('❌ [AdminController.getBookingStats] Error:', error);
      next(error);
    }
  }

  /**
   * Get bookings by status
   */
  async getBookingsByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.params;
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
        throw new AppError(400, 'Invalid booking status');
      }

      const bookings = await this.bookingRepository.repository.find({
        where: { status: status as 'confirmed' | 'completed' | 'cancelled' },
        relations: ['user', 'package'],
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' },
      });

      const total = await this.bookingRepository.repository.count({
        where: { status: status as 'confirmed' | 'completed' | 'cancelled' },
      });

      res.status(200).json({
        success: true,
        data: bookings,
        pagination: { limit, offset, total },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending reviews
   */
  async getPendingReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const reviews = await this.reviewRepository.findPendingApproval();
      const paginated = reviews.slice(offset, offset + limit);

      res.status(200).json({
        success: true,
        data: paginated,
        pagination: { limit, offset, total: reviews.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      let endDate = new Date();

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
        endDate.setHours(23, 59, 59, 999);
      }

      console.log('📊 [AdminController.getRevenueReport] Period:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        originalStartDate: req.query.startDate,
        originalEndDate: req.query.endDate,
      });

      const reportData = await this.reportsService.getRevenueReport(startDate, endDate);

      console.log('✅ [AdminController.getRevenueReport] Generated report:', {
        totalRevenue: reportData.totalRevenue,
        totalBookings: reportData.totalBookings,
        dataKeys: Object.keys(reportData.dailyRevenue || {}),
      });

      res.status(200).json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      console.error('❌ [AdminController.getRevenueReport] Error:', error);
      next(error);
    }
  }

  /**
   * Get top packages
   */
  async getTopPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

      console.log('📊 [AdminController.getTopPackages] Fetching top packages with limit:', limit);

      const topPackages = await this.reportsService.getTopPackages(limit);

      console.log('✅ [AdminController.getTopPackages] Found top packages:', topPackages.length);

      res.status(200).json({
        success: true,
        data: topPackages,
      });
    } catch (error) {
      console.error('❌ [AdminController.getTopPackages] Error:', error);
      next(error);
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📊 [AdminController.getCustomerStats] Fetching customer statistics');

      const customerStats = await this.reportsService.getCustomerStats();

      res.status(200).json({
        success: true,
        data: customerStats,
      });
    } catch (error) {
      console.error('❌ [AdminController.getCustomerStats] Error:', error);
      next(error);
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 50);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const logs = await this.auditRepository.find({
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' },
      });

      const total = await this.auditRepository.count();

      res.status(200).json({
        success: true,
        data: logs,
        pagination: { limit, offset, total },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper method to log admin actions
   */
  private async logAction(actorId: string, action: string, target: string, payload?: any): Promise<void> {
    try {
      const log = this.auditRepository.create({
        actor_id: actorId,
        action,
        target,
        payload: payload || {},
        created_at: new Date(),
      });

      await this.auditRepository.save(log);
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }

  /**
   * Get all packages
   */
  async getAllPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      console.log(`\n📦 [getAllPackages] ========== START ==========`);
      console.log(`   Limit: ${limit}, Offset: ${offset}`);
      console.log(`   Time: ${new Date().toISOString()}`);

      const pkgRepo = AppDataSource.getRepository(Package);
      
      console.log(`   Fetching packages from database...`);
      const packages = await pkgRepo.find({
        relations: ['images', 'itineraries', 'categories', 'category'],
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' },
      });

      const total = await pkgRepo.count();

      console.log(`✅ [getAllPackages] Found ${packages.length} packages (total: ${total})`);

      // Transform images to include preview
      const transformedPackages = packages.map(pkg => ({
        ...pkg,
        images: (pkg.images || []).map(img => ({
          ...img,
          // If image_data exists as Buffer, keep it. Otherwise it's already string
          image_data: img.image_data ? (
            Buffer.isBuffer(img.image_data) 
              ? img.image_data.toString('base64')
              : img.image_data
          ) : ''
        }))
      }));

      console.log(`   Sending response with ${transformedPackages.length} packages`);
      res.status(200).json({
        success: true,
        data: transformedPackages,
        pagination: { limit, offset, total },
      });
      console.log(`📦 [getAllPackages] ========== END ==========\n`);
    } catch (error) {
      console.error('❌ [getAllPackages] Error:', error instanceof Error ? error.message : String(error));
      console.error('   Stack:', error instanceof Error ? error.stack : 'No stack');
      next(error);
    }
  }

  /**
   * Create package
   */
  async createPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('\n🟢🟢🟢 [createPackage] REQUEST RECEIVED 🟢🟢🟢');
      console.log(`   Timestamp: ${new Date().toISOString()}`);
      console.log(`   Request body keys: ${Object.keys(req.body).join(', ')}`);

      const { 
        title, 
        destination, 
        category_id,
        duration_days, 
        base_price, 
        short_desc, 
        long_desc, 
        featured, 
        images = [], 
        itineraries = [],
        inclusions = [],
        exclusions = [],
        // Translation fields
        en_name, en_short_description, en_detailed_description, en_whats_included, en_whats_excluded, en_daily_itinerary, en_whats_included_items, en_whats_excluded_items, en_daily_itinerary_days, en_daily_itinerary_items,
        ar_name, ar_short_description, ar_detailed_description, ar_whats_included, ar_whats_excluded, ar_daily_itinerary, ar_whats_included_items, ar_whats_excluded_items, ar_daily_itinerary_days, ar_daily_itinerary_items,
        es_name, es_short_description, es_detailed_description, es_whats_included, es_whats_excluded, es_daily_itinerary, es_whats_included_items, es_whats_excluded_items, es_daily_itinerary_days, es_daily_itinerary_items,
        de_name, de_short_description, de_detailed_description, de_whats_included, de_whats_excluded, de_daily_itinerary, de_whats_included_items, de_whats_excluded_items, de_daily_itinerary_days, de_daily_itinerary_items,
        ru_name, ru_short_description, ru_detailed_description, ru_whats_included, ru_whats_excluded, ru_daily_itinerary, ru_whats_included_items, ru_whats_excluded_items, ru_daily_itinerary_days, ru_daily_itinerary_items,
        packageId
      } = req.body;
      
      // Extract from req.params if coming from route param
      const finalPackageId = packageId || (req as any).params?.packageId;

      console.log('📋 REQUEST DATA:');
      console.log(`   title: "${title}"`);
      console.log(`   destination: "${destination}"`);
      console.log(`   category_id: "${category_id}"`);
      console.log(`   duration_days: ${duration_days}`);
      console.log(`   base_price: ${base_price}`);
      console.log(`   featured: ${featured}`);
      console.log(`   images count: ${Array.isArray(images) ? images.length : 'not array'}`);
      console.log(`   itineraries count: ${Array.isArray(itineraries) ? itineraries.length : 'not array'}`);
      console.log(`   inclusions count: ${Array.isArray(inclusions) ? inclusions.length : 'not array'}`);
      console.log(`   exclusions count: ${Array.isArray(exclusions) ? exclusions.length : 'not array'}`);

      // Validation
      const validationErrors: string[] = [];
      if (!title || typeof title !== 'string' || !title.trim()) {
        validationErrors.push('title is required');
      }
      if (!destination || typeof destination !== 'string' || !destination.trim()) {
        validationErrors.push('destination is required');
      }
      if (!category_id || typeof category_id !== 'string' || !category_id.trim()) {
        validationErrors.push('category_id is required');
      }
      if (duration_days === undefined || duration_days === null || isNaN(Number(duration_days)) || Number(duration_days) < 1) {
        validationErrors.push(`duration_days must be >= 1 (got: ${duration_days})`);
      }
      if (base_price === undefined || base_price === null || isNaN(Number(base_price)) || Number(base_price) <= 0) {
        validationErrors.push(`base_price must be > 0 (got: ${base_price})`);
      }

      if (validationErrors.length > 0) {
        console.error('❌ VALIDATION ERRORS:', validationErrors);
        throw new ValidationError(validationErrors.join('; '));
      }

      console.log('✅ Validation passed');

      const pkgRepo = AppDataSource.getRepository(Package);
      const imgRepo = AppDataSource.getRepository(PackageImage);
      const itinRepo = AppDataSource.getRepository(Itinerary);

      console.log('💾 Creating and saving package...');
      let pkg = pkgRepo.create({
        title: title.trim(),
        destination: destination.trim(),
        category_id: category_id.trim(),
        duration_days: parseInt(duration_days),
        base_price: parseFloat(base_price),
        short_desc: (short_desc || '').trim(),
        long_desc: (long_desc || '').trim(),
        featured: Boolean(featured),
        inclusions: Array.isArray(inclusions) ? inclusions.filter(item => item && typeof item === 'string' && item.trim()).map(item => item.trim()) : [],
        exclusions: Array.isArray(exclusions) ? exclusions.filter(item => item && typeof item === 'string' && item.trim()).map(item => item.trim()) : [],
        // Add translation fields
        en_name: en_name?.trim() || '',
        en_short_description: en_short_description?.trim() || '',
        en_detailed_description: en_detailed_description?.trim() || '',
        en_whats_included: en_whats_included?.trim() || '',
        en_whats_excluded: en_whats_excluded?.trim() || '',
        en_daily_itinerary: en_daily_itinerary?.trim() || '',
        en_whats_included_items: Array.isArray(en_whats_included_items) ? en_whats_included_items.filter(item => item?.trim()) : [],
        en_whats_excluded_items: Array.isArray(en_whats_excluded_items) ? en_whats_excluded_items.filter(item => item?.trim()) : [],
        en_daily_itinerary_items: Array.isArray(en_daily_itinerary_items) ? en_daily_itinerary_items.filter(item => item?.trim()) : [],
        en_daily_itinerary_days: Array.isArray(en_daily_itinerary_days) ? en_daily_itinerary_days : null,
        ar_name: ar_name?.trim() || '',
        ar_short_description: ar_short_description?.trim() || '',
        ar_detailed_description: ar_detailed_description?.trim() || '',
        ar_whats_included: ar_whats_included?.trim() || '',
        ar_whats_excluded: ar_whats_excluded?.trim() || '',
        ar_daily_itinerary: ar_daily_itinerary?.trim() || '',
        ar_whats_included_items: Array.isArray(ar_whats_included_items) ? ar_whats_included_items.filter(item => item?.trim()) : [],
        ar_whats_excluded_items: Array.isArray(ar_whats_excluded_items) ? ar_whats_excluded_items.filter(item => item?.trim()) : [],
        ar_daily_itinerary_items: Array.isArray(ar_daily_itinerary_items) ? ar_daily_itinerary_items.filter(item => item?.trim()) : [],
        ar_daily_itinerary_days: Array.isArray(ar_daily_itinerary_days) ? ar_daily_itinerary_days : null,
        es_name: es_name?.trim() || '',
        es_short_description: es_short_description?.trim() || '',
        es_detailed_description: es_detailed_description?.trim() || '',
        es_whats_included: es_whats_included?.trim() || '',
        es_whats_excluded: es_whats_excluded?.trim() || '',
        es_daily_itinerary: es_daily_itinerary?.trim() || '',
        es_whats_included_items: Array.isArray(es_whats_included_items) ? es_whats_included_items.filter(item => item?.trim()) : [],
        es_whats_excluded_items: Array.isArray(es_whats_excluded_items) ? es_whats_excluded_items.filter(item => item?.trim()) : [],
        es_daily_itinerary_items: Array.isArray(es_daily_itinerary_items) ? es_daily_itinerary_items.filter(item => item?.trim()) : [],
        es_daily_itinerary_days: Array.isArray(es_daily_itinerary_days) ? es_daily_itinerary_days : null,
        de_name: de_name?.trim() || '',
        de_short_description: de_short_description?.trim() || '',
        de_detailed_description: de_detailed_description?.trim() || '',
        de_whats_included: de_whats_included?.trim() || '',
        de_whats_excluded: de_whats_excluded?.trim() || '',
        de_daily_itinerary: de_daily_itinerary?.trim() || '',
        de_whats_included_items: Array.isArray(de_whats_included_items) ? de_whats_included_items.filter(item => item?.trim()) : [],
        de_whats_excluded_items: Array.isArray(de_whats_excluded_items) ? de_whats_excluded_items.filter(item => item?.trim()) : [],
        de_daily_itinerary_items: Array.isArray(de_daily_itinerary_items) ? de_daily_itinerary_items.filter(item => item?.trim()) : [],
        de_daily_itinerary_days: Array.isArray(de_daily_itinerary_days) ? de_daily_itinerary_days : null,
        ru_name: ru_name?.trim() || '',
        ru_short_description: ru_short_description?.trim() || '',
        ru_detailed_description: ru_detailed_description?.trim() || '',
        ru_whats_included: ru_whats_included?.trim() || '',
        ru_whats_excluded: ru_whats_excluded?.trim() || '',
        ru_daily_itinerary: ru_daily_itinerary?.trim() || '',
        ru_whats_included_items: Array.isArray(ru_whats_included_items) ? ru_whats_included_items.filter(item => item?.trim()) : [],
        ru_whats_excluded_items: Array.isArray(ru_whats_excluded_items) ? ru_whats_excluded_items.filter(item => item?.trim()) : [],
        ru_daily_itinerary_items: Array.isArray(ru_daily_itinerary_items) ? ru_daily_itinerary_items.filter(item => item?.trim()) : [],
        ru_daily_itinerary_days: Array.isArray(ru_daily_itinerary_days) ? ru_daily_itinerary_days : null,
      });

      pkg = await pkgRepo.save(pkg);
      console.log(`✅ Package created with ID: ${pkg.id}`);
      console.log(`   Category ID: ${pkg.category_id}`);
      console.log(`   Inclusions: ${pkg.inclusions?.length || 0}`);
      console.log(`   Exclusions: ${pkg.exclusions?.length || 0}`);

      // Link package to category in package_categories junction table
      // This is critical for the many-to-many relationship to work
      if (category_id && category_id.trim()) {
        try {
          console.log(`🔗 Linking package to category: ${category_id}`);
          const catRepo = AppDataSource.getRepository(Category);
          const category = await catRepo.findOne({ where: { id: category_id } });
          
          if (category) {
            // Direct SQL insertion to ensure the relationship is created
            await AppDataSource.query(
              `INSERT INTO package_categories (package_id, category_id) 
               VALUES ($1, $2) 
               ON CONFLICT DO NOTHING`,
              [pkg.id, category_id]
            );
            
            console.log(`✅ Package linked to category "${category.name}" (ID: ${category.id})`);
          } else {
            console.warn(`⚠️ Category not found: ${category_id}`);
          }
        } catch (err) {
          console.error(`❌ Error linking package to category:`, err instanceof Error ? err.message : String(err));
        }
      }

      // ⏸️ Brief pause before saving images to ensure package is fully committed
      await new Promise(resolve => setTimeout(resolve, 50));

      // Save images
      if (Array.isArray(images) && images.length > 0) {
        console.log(`📸 Saving ${images.length} image(s)...`);
        let savedCount = 0;

        for (let idx = 0; idx < images.length; idx++) {
          try {
            const img = images[idx];
            console.log(`   Image ${idx + 1}: Processing...`);
            
            if (!img || typeof img !== 'object') {
              console.warn(`   ⚠️ Image ${idx + 1}: Invalid format`);
              continue;
            }

            const imageDataObj = imgRepo.create();
            imageDataObj.package_id = pkg.id;
            
            // Ensure url is string and doesn't exceed 500 chars
            if (img.url && typeof img.url === 'string') {
              imageDataObj.url = img.url.substring(0, 500);
            } else {
              imageDataObj.url = '';
            }
            
            imageDataObj.alt_text = img.alt_text?.substring(0, 255) || `Package image ${idx + 1}`;
            imageDataObj.order = idx;

            // Handle base64
            if (img.image_data && typeof img.image_data === 'string' && img.image_data.length > 0) {
              try {
                let base64Data = img.image_data.trim();
                
                // Remove prefix if it exists
                if (base64Data.includes(',')) {
                  base64Data = base64Data.split(',')[1];
                }

                // Validate base64
                if (!/^[A-Za-z0-9+/=]*$/.test(base64Data)) {
                  console.error(`   ❌ Image ${idx + 1}: Invalid base64 format`);
                  continue;
                }

                // Convert to Buffer
                imageDataObj.image_data = Buffer.from(base64Data, 'base64');
                console.log(`   ✅ Image ${idx + 1}: Converted (${imageDataObj.image_data.length} bytes)`);
              } catch (err) {
                console.error(`   ❌ Image ${idx + 1}: Conversion error:`, err instanceof Error ? err.message : String(err));
                continue;
              }
            } else {
              console.warn(`   ⚠️ Image ${idx + 1}: No image_data provided`);
              continue;
            }

            // Save the image
            const savedImage = await imgRepo.save(imageDataObj);
            console.log(`   ✅ Image ${idx + 1}: Saved with ID ${savedImage.id}`);
            savedCount++;
          } catch (err) {
            console.error(`   ❌ Image ${idx + 1}: Save error:`, err instanceof Error ? err.message : String(err));
          }
        }

        console.log(`✅ Images: ${savedCount}/${images.length} saved successfully`);
      } else {
        console.warn('⚠️ No images provided in request');
      }

      // Save itineraries  
      if (Array.isArray(itineraries) && itineraries.length > 0) {
        console.log(`📅 Saving ${itineraries.length} itinerary day(s)...`);
        for (const itin of itineraries) {
          try {
            if (!itin) continue;
            await itinRepo.save({
              package_id: pkg.id,
              day_number: itin.day_number ? parseInt(itin.day_number) : 1,
              title: itin.title?.substring(0, 255) || '',
              description: itin.description || '',
              activities: itin.activities || '',
              meals: itin.meals?.substring(0, 255) || '',
              image_url: itin.image_url?.substring(0, 500) || '',
            });
          } catch (err) {
            console.error(`   ❌ Itinerary error:`, err instanceof Error ? err.message : String(err));
          }
        }
        console.log(`✅ Itineraries saved`);
      }

      // ✅ CRITICAL: Ensure package data is fully committed to database
      console.log(`\n🔄 Verifying package was saved to database...`);
      const verifyPackage = await pkgRepo.findOne({
        where: { id: pkg.id },
      });

      if (!verifyPackage) {
        throw new Error(`Package verification failed: Package ${pkg.id} not found in database after save`);
      }

      console.log(`✅ Package verified in database: ${verifyPackage.id}`);

      // ✅ Now fetch with relations
      const created = await pkgRepo.findOne({
        where: { id: pkg.id },
        relations: ['images', 'itineraries', 'categories', 'translations'],
      });

      // Transform images to ensure consistent format with base64
      const transformedCreated = {
        ...created,
        images: (created?.images || []).map(img => ({
          ...img,
          image_data: img.image_data ? (
            Buffer.isBuffer(img.image_data)
              ? img.image_data.toString('base64')
              : img.image_data
          ) : ''
        }))
      };

      const duration = Date.now() - startTime;
      console.log(`🎉🎉🎉 PACKAGE CREATED SUCCESSFULLY (${duration}ms) 🎉🎉🎉\n`);
      console.log(`📊 Final data: title="${transformedCreated.title}", destination="${transformedCreated.destination}", categories=${transformedCreated.categories?.length || 0}`);

      // ✅ Critical: Set longer timeout and send response
      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: transformedCreated,
      });

      // ✅ Log to ensure response was sent
      console.log(`✅ Response sent successfully`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`\n❌❌❌ [createPackage] ERROR (${duration}ms):`, {
        message: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name,
      });
      next(error);
    }
  }

  /**
   * Update package
   */
  async updatePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('\n🟡 [updatePackage] Starting package update...');
      const { id: packageId } = req.params;
      const { 
        title, destination, category_id, duration_days, base_price, short_desc, long_desc, featured, images, itineraries, inclusions, exclusions,
        // Translation fields
        en_name, en_short_description, en_detailed_description, en_whats_included, en_whats_excluded, en_daily_itinerary, en_whats_included_items, en_whats_excluded_items, en_daily_itinerary_items, en_daily_itinerary_days,
        ar_name, ar_short_description, ar_detailed_description, ar_whats_included, ar_whats_excluded, ar_daily_itinerary, ar_whats_included_items, ar_whats_excluded_items, ar_daily_itinerary_items, ar_daily_itinerary_days,
        es_name, es_short_description, es_detailed_description, es_whats_included, es_whats_excluded, es_daily_itinerary, es_whats_included_items, es_whats_excluded_items, es_daily_itinerary_items, es_daily_itinerary_days,
        de_name, de_short_description, de_detailed_description, de_whats_included, de_whats_excluded, de_daily_itinerary, de_whats_included_items, de_whats_excluded_items, de_daily_itinerary_items, de_daily_itinerary_days,
        ru_name, ru_short_description, ru_detailed_description, ru_whats_included, ru_whats_excluded, ru_daily_itinerary, ru_whats_included_items, ru_whats_excluded_items, ru_daily_itinerary_items, ru_daily_itinerary_days,
      } = req.body;

      console.log(`   Package ID: ${packageId}`);
      console.log(`   Update fields: ${Object.keys(req.body).join(', ')}`);

      const pkgRepo = AppDataSource.getRepository(Package);
      const imgRepo = AppDataSource.getRepository(PackageImage);
      const itinRepo = AppDataSource.getRepository(Itinerary);

      let pkg = await pkgRepo.findOne({ where: { id: packageId } });
      if (!pkg) {
        throw new AppError(404, 'Package not found');
      }

      console.log('📝 Updating package fields...');
      console.log(`   Current package category_id: ${pkg.category_id}`);

      // Update fields only if provided
      if (title && typeof title === 'string' && title.trim()) pkg.title = title.trim();
      if (destination && typeof destination === 'string' && destination.trim()) pkg.destination = destination.trim();
      if (category_id && typeof category_id === 'string' && category_id.trim()) pkg.category_id = category_id.trim();
      if (duration_days && !isNaN(Number(duration_days)) && Number(duration_days) >= 1) pkg.duration_days = parseInt(duration_days);
      if (base_price && !isNaN(Number(base_price)) && Number(base_price) > 0) pkg.base_price = parseFloat(base_price);
      if (short_desc !== undefined) pkg.short_desc = (short_desc || '').trim();
      if (long_desc !== undefined) pkg.long_desc = (long_desc || '').trim();
      if (featured !== undefined) pkg.featured = Boolean(featured);
      
      // Update inclusions and exclusions
      if (Array.isArray(inclusions)) {
        pkg.inclusions = inclusions.filter(item => item && typeof item === 'string' && item.trim()).map(item => item.trim());
        console.log(`✅ Inclusions updated: ${pkg.inclusions.length} items`);
      }
      if (Array.isArray(exclusions)) {
        pkg.exclusions = exclusions.filter(item => item && typeof item === 'string' && item.trim()).map(item => item.trim());
        console.log(`✅ Exclusions updated: ${pkg.exclusions.length} items`);
      }

      // Update translation fields
      if (en_name !== undefined) pkg.en_name = en_name?.trim() || '';
      if (en_short_description !== undefined) pkg.en_short_description = en_short_description?.trim() || '';
      if (en_detailed_description !== undefined) pkg.en_detailed_description = en_detailed_description?.trim() || '';
      if (en_whats_included !== undefined) pkg.en_whats_included = en_whats_included?.trim() || '';
      if (en_whats_excluded !== undefined) pkg.en_whats_excluded = en_whats_excluded?.trim() || '';
      if (en_daily_itinerary !== undefined) pkg.en_daily_itinerary = en_daily_itinerary?.trim() || '';
      if (Array.isArray(en_whats_included_items)) pkg.en_whats_included_items = en_whats_included_items.filter(item => item?.trim());
      if (Array.isArray(en_whats_excluded_items)) pkg.en_whats_excluded_items = en_whats_excluded_items.filter(item => item?.trim());
      if (Array.isArray(en_daily_itinerary_items)) pkg.en_daily_itinerary_items = en_daily_itinerary_items.filter(item => item?.trim());
      if (Array.isArray(en_daily_itinerary_days)) pkg.en_daily_itinerary_days = en_daily_itinerary_days;

      if (ar_name !== undefined) pkg.ar_name = ar_name?.trim() || '';
      if (ar_short_description !== undefined) pkg.ar_short_description = ar_short_description?.trim() || '';
      if (ar_detailed_description !== undefined) pkg.ar_detailed_description = ar_detailed_description?.trim() || '';
      if (ar_whats_included !== undefined) pkg.ar_whats_included = ar_whats_included?.trim() || '';
      if (ar_whats_excluded !== undefined) pkg.ar_whats_excluded = ar_whats_excluded?.trim() || '';
      if (ar_daily_itinerary !== undefined) pkg.ar_daily_itinerary = ar_daily_itinerary?.trim() || '';
      if (Array.isArray(ar_whats_included_items)) pkg.ar_whats_included_items = ar_whats_included_items.filter(item => item?.trim());
      if (Array.isArray(ar_whats_excluded_items)) pkg.ar_whats_excluded_items = ar_whats_excluded_items.filter(item => item?.trim());
      if (Array.isArray(ar_daily_itinerary_items)) pkg.ar_daily_itinerary_items = ar_daily_itinerary_items.filter(item => item?.trim());
      if (Array.isArray(ar_daily_itinerary_days)) pkg.ar_daily_itinerary_days = ar_daily_itinerary_days;

      if (es_name !== undefined) pkg.es_name = es_name?.trim() || '';
      if (es_short_description !== undefined) pkg.es_short_description = es_short_description?.trim() || '';
      if (es_detailed_description !== undefined) pkg.es_detailed_description = es_detailed_description?.trim() || '';
      if (es_whats_included !== undefined) pkg.es_whats_included = es_whats_included?.trim() || '';
      if (es_whats_excluded !== undefined) pkg.es_whats_excluded = es_whats_excluded?.trim() || '';
      if (es_daily_itinerary !== undefined) pkg.es_daily_itinerary = es_daily_itinerary?.trim() || '';
      if (Array.isArray(es_whats_included_items)) pkg.es_whats_included_items = es_whats_included_items.filter(item => item?.trim());
      if (Array.isArray(es_whats_excluded_items)) pkg.es_whats_excluded_items = es_whats_excluded_items.filter(item => item?.trim());
      if (Array.isArray(es_daily_itinerary_items)) pkg.es_daily_itinerary_items = es_daily_itinerary_items.filter(item => item?.trim());
      if (Array.isArray(es_daily_itinerary_days)) pkg.es_daily_itinerary_days = es_daily_itinerary_days;

      if (de_name !== undefined) pkg.de_name = de_name?.trim() || '';
      if (de_short_description !== undefined) pkg.de_short_description = de_short_description?.trim() || '';
      if (de_detailed_description !== undefined) pkg.de_detailed_description = de_detailed_description?.trim() || '';
      if (de_whats_included !== undefined) pkg.de_whats_included = de_whats_included?.trim() || '';
      if (de_whats_excluded !== undefined) pkg.de_whats_excluded = de_whats_excluded?.trim() || '';
      if (de_daily_itinerary !== undefined) pkg.de_daily_itinerary = de_daily_itinerary?.trim() || '';
      if (Array.isArray(de_whats_included_items)) pkg.de_whats_included_items = de_whats_included_items.filter(item => item?.trim());
      if (Array.isArray(de_whats_excluded_items)) pkg.de_whats_excluded_items = de_whats_excluded_items.filter(item => item?.trim());
      if (Array.isArray(de_daily_itinerary_items)) pkg.de_daily_itinerary_items = de_daily_itinerary_items.filter(item => item?.trim());
      if (Array.isArray(de_daily_itinerary_days)) pkg.de_daily_itinerary_days = de_daily_itinerary_days;

      if (ru_name !== undefined) pkg.ru_name = ru_name?.trim() || '';
      if (ru_short_description !== undefined) pkg.ru_short_description = ru_short_description?.trim() || '';
      if (ru_detailed_description !== undefined) pkg.ru_detailed_description = ru_detailed_description?.trim() || '';
      if (ru_whats_included !== undefined) pkg.ru_whats_included = ru_whats_included?.trim() || '';
      if (ru_whats_excluded !== undefined) pkg.ru_whats_excluded = ru_whats_excluded?.trim() || '';
      if (ru_daily_itinerary !== undefined) pkg.ru_daily_itinerary = ru_daily_itinerary?.trim() || '';
      if (Array.isArray(ru_whats_included_items)) pkg.ru_whats_included_items = ru_whats_included_items.filter(item => item?.trim());
      if (Array.isArray(ru_whats_excluded_items)) pkg.ru_whats_excluded_items = ru_whats_excluded_items.filter(item => item?.trim());
      if (Array.isArray(ru_daily_itinerary_items)) pkg.ru_daily_itinerary_items = ru_daily_itinerary_items.filter(item => item?.trim());
      if (Array.isArray(ru_daily_itinerary_days)) pkg.ru_daily_itinerary_days = ru_daily_itinerary_days;

      await pkgRepo.save(pkg);
      console.log('✅ Package fields updated');

      // 🌐 DYNAMIC AUTO-TRANSLATION - Update translations in background
      (async () => {
        try {
          console.log(`\n🌐 [AUTO-TRANSLATION] Updating translations for package ${packageId}...`);
          const pkgTranslationRepo = AppDataSource.getRepository(PackageTranslation);
          
          // Translations will be handled via formData fields already
          console.log(`✅ [AUTO-TRANSLATION] Updated for package ${packageId}`);
        } catch (transError) {
          console.error(`⚠️ [AUTO-TRANSLATION] Error:`, transError);
        }
      })(); // Fire and forget

      // Update category link in package_categories junction table
      if (category_id && category_id.trim()) {
        try {
          console.log(`🔗 Updating category link: ${category_id}`);
          const catRepo = AppDataSource.getRepository(Category);
          const category = await catRepo.findOne({ where: { id: category_id } });
          
          if (category) {
            // Load the package with its categories relationship
            const pkgWithCategories = await pkgRepo.findOne({
              where: { id: packageId },
              relations: ['categories']
            });
            
            if (pkgWithCategories) {
              // Replace categories with the new one
              pkgWithCategories.categories = [category];
              await pkgRepo.save(pkgWithCategories);
              
              console.log(`✅ Package category updated to "${category.name}" (ID: ${category.id})`);
            }
          } else {
            console.warn(`⚠️ Category not found: ${category_id}`);
          }
        } catch (err) {
          console.error(`❌ Error updating package category:`, err instanceof Error ? err.message : String(err));
        }
      }

      // Update images
      if (Array.isArray(images)) {
        console.log(`📸 Updating images: deleting old ones...`);
        await imgRepo.delete({ package_id: packageId });
        
        let savedCount = 0;
        for (let idx = 0; idx < images.length; idx++) {
          const img = images[idx];
          
          if (!img || typeof img !== 'object') {
            console.warn(`  ⚠️ Image ${idx + 1}: Invalid object format, skipping`);
            continue;
          }

          const imageDataObj = imgRepo.create();
          imageDataObj.package_id = packageId;
          
          // Ensure url is string and doesn't exceed 500 chars
          if (img.url && typeof img.url === 'string') {
            imageDataObj.url = img.url.substring(0, 500);
          } else {
            imageDataObj.url = '';
          }
          
          imageDataObj.alt_text = img.alt_text && typeof img.alt_text === 'string' ? img.alt_text.trim().substring(0, 255) : `Package image ${idx + 1}`;
          imageDataObj.order = idx;

          if (img.image_data && typeof img.image_data === 'string' && img.image_data.length > 0) {
            try {
              let base64Data = img.image_data.trim();
              
              if (base64Data.includes(',')) {
                base64Data = base64Data.split(',')[1];
              }

              if (!/^[A-Za-z0-9+/=]*$/.test(base64Data)) {
                console.error(`  ❌ Image ${idx + 1}: Invalid base64 format`);
                continue;
              }

              imageDataObj.image_data = Buffer.from(base64Data, 'base64');
              console.log(`  ✅ Image ${idx + 1}: Converted to buffer (${imageDataObj.image_data.length} bytes)`);
            } catch (bufferError) {
              console.error(`  ❌ Image ${idx + 1}: Conversion error:`, bufferError instanceof Error ? bufferError.message : String(bufferError));
              continue;
            }
          }

          try {
            await imgRepo.save(imageDataObj);
            savedCount++;
            console.log(`  ✅ Image ${idx + 1}: Saved successfully`);
          } catch (saveError) {
            console.error(`  ❌ Image ${idx + 1}: Save error:`, saveError instanceof Error ? saveError.message : String(saveError));
            continue;
          }
        }
        
        console.log(`📊 Image update complete: ${savedCount}/${images.length} saved`);
      }

      // Update itineraries
      if (Array.isArray(itineraries)) {
        console.log(`📅 Updating itineraries: deleting old ones...`);
        await itinRepo.delete({ package_id: packageId });
        
        for (const itin of itineraries) {
          try {
            if (!itin || typeof itin !== 'object') continue;

            await itinRepo.save({
              package_id: packageId,
              day_number: itin.day_number ? parseInt(itin.day_number) : 1,
              title: itin.title && typeof itin.title === 'string' ? itin.title.trim().substring(0, 255) : '',
              description: itin.description && typeof itin.description === 'string' ? itin.description.trim() : '',
              activities: itin.activities && typeof itin.activities === 'string' ? itin.activities.trim() : '',
              meals: itin.meals && typeof itin.meals === 'string' ? itin.meals.trim().substring(0, 255) : '',
              image_url: itin.image_url && typeof itin.image_url === 'string' ? itin.image_url.trim().substring(0, 500) : '',
            });
          } catch (itinError) {
            console.error(`  ❌ Itinerary error:`, itinError instanceof Error ? itinError.message : String(itinError));
            continue;
          }
        }
        
        console.log(`✅ Itineraries updated`);
      }

      const updated = await pkgRepo.findOne({
        where: { id: packageId },
        relations: ['images', 'itineraries'],
      });

      console.log(`✅ Updated package details:`);
      console.log(`   Title: ${updated?.title}`);
      console.log(`   Inclusions: ${JSON.stringify(updated?.inclusions)}`);
      console.log(`   Exclusions: ${JSON.stringify(updated?.exclusions)}`);

      const duration = Date.now() - startTime;
      console.log(`✅ Package update complete! (${duration}ms)\n`);

      res.status(200).json({
        success: true,
        message: 'Package updated successfully',
        data: updated,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`\n🔴 [updatePackage] Error (${duration}ms):`, {
        message: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name,
      });
      next(error);
    }
  }

  /**
   * Delete package
   */
  async deletePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: packageId } = req.params;
      const adminId = (req as any).user?.userId;

      console.log(`🗑️ [deletePackage] Deleting package: ${packageId}`);

      const pkgRepo = AppDataSource.getRepository(Package);
      const imgRepo = AppDataSource.getRepository(PackageImage);
      const itinRepo = AppDataSource.getRepository(Itinerary);

      const pkg = await pkgRepo.findOne({ where: { id: packageId } });
      if (!pkg) {
        console.warn(`⚠️ [deletePackage] Package not found: ${packageId}`);
        throw new AppError(404, 'Package not found');
      }

      // Delete related data first
      console.log('   Deleting related images...');
      await imgRepo.delete({ package_id: packageId });
      
      console.log('   Deleting related itineraries...');
      await itinRepo.delete({ package_id: packageId });

      // 🌐 DYNAMIC AUTO-TRANSLATION - Delete translations in background
      (async () => {
        try {
          console.log(`\n🌐 [AUTO-TRANSLATION] Deleting translations for package ${packageId}...`);
          const pkgTranslationRepo = AppDataSource.getRepository(PackageTranslation);
          
          // Delete translations
          await pkgTranslationRepo.delete({ package_id: packageId });
          
          console.log(`✅ [AUTO-TRANSLATION] Deleted for package ${packageId}`);
        } catch (transError) {
          console.error(`⚠️ [AUTO-TRANSLATION] Error:`, transError);
        }
      })(); // Fire and forget

      // Delete the package
      console.log('   Deleting package...');
      await pkgRepo.remove(pkg);

      // Log action
      await this.logAction(adminId, 'DELETE_PACKAGE', packageId, { 
        title: pkg.title,
        destination: pkg.destination 
      });

      console.log(`✅ [deletePackage] Package deleted successfully`);

      res.status(200).json({
        success: true,
        message: 'Package deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting package:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  }

  /**
   * Get package by ID
   */
  async getPackageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: packageId } = req.params;
      const pkgRepo = AppDataSource.getRepository(Package);

      console.log(`🔍 [getPackageById] Fetching package: ${packageId}`);

      const pkg = await pkgRepo.findOne({
        where: { id: packageId },
        relations: ['images', 'itineraries', 'categories', 'category'],
      });

      if (!pkg) {
        console.warn(`⚠️ [getPackageById] Package not found: ${packageId}`);
        throw new AppError(404, 'Package not found');
      }

      console.log(`✅ [getPackageById] Found package with ${pkg.images?.length || 0} images and ${pkg.itineraries?.length || 0} itineraries`);

      // Transform images to ensure consistent format
      const transformedPkg = {
        ...pkg,
        images: (pkg.images || []).map(img => ({
          ...img,
          image_data: img.image_data ? (
            Buffer.isBuffer(img.image_data) 
              ? img.image_data.toString('base64')
              : img.image_data
          ) : ''
        }))
      };

      res.status(200).json({
        success: true,
        data: transformedPkg,
      });
    } catch (error) {
      console.error('Error fetching package:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  }
  /**
   * Get all add-ons from database
   */
  async getAllAddons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 50);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      console.log(`\n📦 [getAllAddons] ========== START ==========`);
      console.log(`   Limit: ${limit}, Offset: ${offset}`);

      const addonRepository = AppDataSource.getRepository(PackageAddon);

      const addons = await addonRepository.find({
        relations: ['package'],
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' },
      });

      const total = await addonRepository.count();

      console.log(`✅ [getAllAddons] Found ${addons.length} add-ons (total: ${total})`);
      console.log(`📋 [getAllAddons] Sample addon:`, {
        id: addons[0]?.id,
        package_id: addons[0]?.package_id,
        name: addons[0]?.name,
        price: addons[0]?.price,
        category: addons[0]?.category,
      });

      // Calculate statistics
      const allAddons = await addonRepository.find();
      const stats = {
        totalAddons: allAddons.length,
        availableAddons: allAddons.filter(a => a.is_available).length,
        unavailableAddons: allAddons.filter(a => !a.is_available).length,
        categories: {} as Record<string, number>,
      };

      allAddons.forEach(addon => {
        stats.categories[addon.category] = (stats.categories[addon.category] || 0) + 1;
      });

      // Ensure all required fields are present in response
      const transformedAddons = addons.map(addon => {
        // Ensure price is a number, not null or undefined
        const price = typeof addon.price === 'number' ? addon.price : (parseFloat(String(addon.price)) || 0);
        
        const transformed = {
          ...addon,
          package_id: addon.package_id, // Explicitly include package_id
          name: addon.name || 'Unnamed Add-on',
          price: price, // Use parsed number
          category: addon.category || 'addon',
          packageName: addon.package?.title || 'Unknown',
        };
        
        console.log(`📊 [getAllAddons] Transformed addon:`, {
          id: transformed.id,
          package_id: transformed.package_id,
          name: transformed.name,
          price_original: addon.price,
          price_transformed: transformed.price,
          price_type: typeof transformed.price,
          category_original: addon.category,
          category_transformed: transformed.category,
        });
        
        return transformed;
      });

      res.status(200).json({
        success: true,
        data: transformedAddons,
        pagination: { limit, offset, total },
        stats,
      });
      console.log(`📦 [getAllAddons] ========== END ==========\n`);
    } catch (error) {
      console.error('❌ [getAllAddons] Error:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  }

  /**
   * Get add-ons statistics
   */
  async getAddonsStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(`📊 [getAddonsStats] Calculating statistics...`);

      const addonRepository = AppDataSource.getRepository(PackageAddon);

      const allAddons = await addonRepository.find();

      const stats = {
        totalAddons: allAddons.length,
        availableAddons: allAddons.filter(a => a.is_available).length,
        unavailableAddons: allAddons.filter(a => !a.is_available).length,
        categories: {} as Record<string, { count: number }>,
        totalValue: 0,
        averagePrice: 0,
      };

      allAddons.forEach(addon => {
        const price = Number(addon.price);
        
        if (!stats.categories[addon.category]) {
          stats.categories[addon.category] = { count: 0 };
        }
        
        stats.categories[addon.category].count += 1;
        stats.totalValue += price;
      });

      if (allAddons.length > 0) {
        stats.averagePrice = stats.totalValue / allAddons.length;
      }

      console.log(`✅ [getAddonsStats] Statistics calculated:`, stats);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ [getAddonsStats] Error:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  }

  /**
   * Cancel Trip - Only for confirmed bookings
   */
  async cancelTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const adminId = (req as any).user?.userId;

      console.log(`🔴 [cancelTrip] Cancelling trip: ${bookingId} by admin: ${adminId}`);

      const booking = await this.bookingRepository.repository.findOne({
        where: { id: bookingId },
        relations: ['user', 'package'],
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // Check if booking status is confirmed
      if (booking.status !== 'confirmed') {
        throw new AppError(
          400,
          `Cannot cancel booking with status '${booking.status}'. Only confirmed bookings can be cancelled.`
        );
      }

      // Update booking status to cancelled
      booking.status = 'cancelled';
      booking.updated_at = new Date();
      
      await this.bookingRepository.repository.save(booking);

      // Log the action
      await this.logAction(adminId, 'CANCEL_TRIP', bookingId, {
        previousStatus: 'confirmed',
        newStatus: 'cancelled',
        bookingNumber: booking.booking_number,
        customerName: booking.user?.name,
        packageName: booking.package?.title,
      });

      console.log(`✅ [cancelTrip] Trip cancelled successfully for booking: ${bookingId}`);

      res.status(200).json({
        success: true,
        message: 'Trip cancelled successfully',
        data: {
          id: booking.id,
          booking_number: booking.booking_number,
          status: booking.status,
          cancelledAt: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ [cancelTrip] Error:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  }
}
