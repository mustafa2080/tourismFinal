import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Package } from '../entities/Package.js';
import { Category } from '../entities/Category.js';
import { PackageService } from '../services/PackageService.js';

export class PackageController {
  private packageService: PackageService;

  constructor() {
    const packageRepository = AppDataSource.getRepository(Package);
    this.packageService = new PackageService(packageRepository);
  }

  async searchPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        q = '',
        minPrice = 0,
        maxPrice = 999999,
        duration = 0,
        categoryId = '',
        categories = '',
        sort = 'newest',
        minRating = 0,
        tripType = '',
        activities = '',
        limit = 50,
        offset = 0,
      } = req.query;

      // إذا كان هناك categoryId بدون filters آخرى، استخدم getByCategory للحصول على نتائج أدق
      if (categoryId && categoryId !== '' && !q && duration === 0 && minRating === 0) {
        console.log(`🎯 [searchPackages] Detected category-only search, using optimized getByCategory`);
        const result = await this.packageService.getPackagesByCategory(
          categoryId as string,
          parseInt(limit as string),
          parseInt(offset as string)
        );
        
        res.status(200).json({
          success: true,
          data: result.packages,
          count: result.packages.length,
          total: result.total,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: result.total,
          }
        });
        return;
      }

      // إذا كان هناك categoryId، استخدمه، وإلا استخدم categories
      let categoryIds = (categories as string)
        .split(',')
        .filter((id) => id.trim() !== '');
      
      if (categoryId && categoryId !== '') {
        categoryIds = [(categoryId as string)];
      }

      const activitiesList = (activities as string)
        .split(',')
        .filter((a) => a.trim() !== '');

      const result = await this.packageService.searchPackages(
        q as string,
        parseInt(minPrice as string),
        parseInt(maxPrice as string),
        parseInt(duration as string),
        categoryIds,
        sort as string,
        parseInt(minRating as string),
        tripType ? (tripType as string) : undefined,
        activitiesList,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        success: true,
        data: result.packages,
        count: result.packages.length,
        total: result.total,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: result.total,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const packages = await this.packageService.getFeaturedPackages();

      res.status(200).json({
        success: true,
        data: packages,
        count: packages.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPackageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const pkg = await this.packageService.getPackageById(id);

      res.status(200).json({
        success: true,
        data: pkg,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;
      const limit = Math.min(50, parseInt(req.query.limit as string) || 50);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      console.log(`📦 [PackageController.getByCategory] Fetching packages for category: ${categoryId}, limit: ${limit}, offset: ${offset}`);

      const result = await this.packageService.getPackagesByCategory(categoryId, limit, offset);

      console.log(`✅ [PackageController.getByCategory] Found ${result.packages.length} packages (total: ${result.total}) for category: ${categoryId}`);

      // Return 200 regardless of whether packages found or not
      // Empty categories should return empty data, not 404
      res.status(200).json({
        success: true,
        data: result.packages,
        count: result.packages.length,
        total: result.total,
        pagination: {
          limit,
          offset,
          total: result.total,
        }
      });
    } catch (error) {
      console.error(`❌ [PackageController.getByCategory] Error:`, error);
      next(error);
    }
  }

  async getRelatedPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const limit = Math.min(10, parseInt(req.query.limit as string) || 4);

      const packages = await this.packageService.getRelatedPackages(id, limit);

      res.status(200).json({
        success: true,
        data: packages,
        count: packages.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        title,
        destination,
        duration_days,
        base_price,
        short_desc,
        long_desc,
        featured,
        category_id,
        images,
        itineraries,
        inclusions,
        exclusions,
        en_name,
        en_short_description,
        en_detailed_description,
        en_whats_included,
        en_whats_excluded,
        en_daily_itinerary,
        ar_name,
        ar_short_description,
        ar_detailed_description,
        ar_whats_included,
        ar_whats_excluded,
        ar_daily_itinerary,
        de_name,
        de_short_description,
        de_detailed_description,
        de_whats_included,
        de_whats_excluded,
        de_daily_itinerary,
        es_name,
        es_short_description,
        es_detailed_description,
        es_whats_included,
        es_whats_excluded,
        es_daily_itinerary,
        ru_name,
        ru_short_description,
        ru_detailed_description,
        ru_whats_included,
        ru_whats_excluded,
        ru_daily_itinerary,
      } = req.body;

      const translations = {
        en: { package_name: en_name, short_description: en_short_description, detailed_description: en_detailed_description, whats_included: en_whats_included, whats_excluded: en_whats_excluded, daily_itinerary: en_daily_itinerary },
        ar: { package_name: ar_name, short_description: ar_short_description, detailed_description: ar_detailed_description, whats_included: ar_whats_included, whats_excluded: ar_whats_excluded, daily_itinerary: ar_daily_itinerary },
        de: { package_name: de_name, short_description: de_short_description, detailed_description: de_detailed_description, whats_included: de_whats_included, whats_excluded: de_whats_excluded, daily_itinerary: de_daily_itinerary },
        es: { package_name: es_name, short_description: es_short_description, detailed_description: es_detailed_description, whats_included: es_whats_included, whats_excluded: es_whats_excluded, daily_itinerary: es_daily_itinerary },
        ru: { package_name: ru_name, short_description: ru_short_description, detailed_description: ru_detailed_description, whats_included: ru_whats_included, whats_excluded: ru_whats_excluded, daily_itinerary: ru_daily_itinerary },
      };

      const pkg = await this.packageService.createPackage(
        title,
        destination,
        duration_days,
        base_price,
        short_desc,
        long_desc,
        featured,
        category_id,
        images,
        itineraries,
        inclusions,
        exclusions,
        translations
      );

      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: pkg,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const pkg = await this.packageService.updatePackage(id, updates);

      res.status(200).json({
        success: true,
        message: 'Package updated successfully',
        data: pkg,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.packageService.deletePackage(id);

      res.status(200).json({
        success: true,
        message: 'Package deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async calculatePrice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId, persons, extras = [] } = req.body;

      const totalPrice = await this.packageService.calculatePackagePrice(
        packageId,
        persons,
        extras
      );

      res.status(200).json({
        success: true,
        data: {
          totalPrice,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * جلب جميع الـ packages مع pagination
   */
  async getAllPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const result = await this.packageService.getAllPackages(limit, offset);

      res.status(200).json({
        success: true,
        data: result.packages,
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
   * الحصول على اقتراحات الوجهات
   */
  async getDestinationSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q = '', limit = 10 } = req.query;

      console.log(`🔍 [PackageController.getDestinationSuggestions] Request received with q="${q}", limit="${limit}"`);

      if (!q || (q as string).trim() === '') {
        console.log('⚠️ [PackageController.getDestinationSuggestions] Query is empty, returning empty array');
        res.status(200).json({
          success: true,
          data: [],
        });
        return;
      }

      const suggestions = await this.packageService.getDestinationSuggestions(
        q as string,
        parseInt(limit as string) || 10
      );

      console.log(`✅ [PackageController.getDestinationSuggestions] Found ${suggestions.length} suggestions`);

      res.status(200).json({
        success: true,
        data: suggestions,
        count: suggestions.length,
      });
    } catch (error) {
      console.error('❌ [PackageController.getDestinationSuggestions] Error:', error);
      next(error);
    }
  }

  /**
   * الحصول على جميع الوجهات الفريدة
   */
  async getAllDestinations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const destinations = await this.packageService.getAllDestinations();

      res.status(200).json({
        success: true,
        data: destinations,
        count: destinations.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Debug endpoint: Check packages linked to a category
   */
  async debugCategoryPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;
      
      console.log(`\n🔍 DEBUG: Checking category packages for: ${categoryId}`);

      const packageRepo = AppDataSource.getRepository(Package);
      const categoryRepo = AppDataSource.getRepository(Category);

      // Check if category exists
      const category = await categoryRepo.findOne({ where: { id: categoryId } });
      console.log(`📂 Category found:`, category ? `"${category.name}"` : 'NOT FOUND');

      // Get all packages with this category
      const packages = await packageRepo
        .createQueryBuilder('package')
        .innerJoinAndSelect('package.categories', 'category', 'category.id = :categoryId', { categoryId })
        .leftJoinAndSelect('package.images', 'images')
        .orderBy('package.created_at', 'DESC')
        .getMany();

      console.log(`📦 Packages found: ${packages.length}`);
      
      packages.forEach((pkg, idx) => {
        console.log(`   ${idx + 1}. ${pkg.title}`);
        console.log(`      - ID: ${pkg.id}`);
        console.log(`      - Destination: ${pkg.destination}`);
        console.log(`      - Categories: ${pkg.categories?.map(c => c.name).join(', ') || 'none'}`);
        console.log(`      - Images: ${pkg.images?.length || 0}`);
      });

      // Also check package_categories table directly
      const directQuery = await AppDataSource.query(`
        SELECT pc.package_id, pc.category_id, p.title, c.name
        FROM package_categories pc
        LEFT JOIN packages p ON pc.package_id = p.id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE pc.category_id = $1
        ORDER BY p.created_at DESC
      `, [categoryId]);

      console.log(`📋 Direct query results: ${directQuery.length} records`);
      directQuery.forEach((record: any, idx: number) => {
        console.log(`   ${idx + 1}. ${record.title} (${record.name})`);
      });

      res.status(200).json({
        success: true,
        data: {
          categoryId,
          category: category ? { id: category.id, name: category.name } : null,
          packagesCount: packages.length,
          packages: packages.map(p => ({
            id: p.id,
            title: p.title,
            destination: p.destination,
            images: p.images?.length || 0,
            categories: p.categories?.map(c => ({ id: c.id, name: c.name })) || []
          })),
          directQueryCount: directQuery.length,
          directQueryResults: directQuery
        }
      });
    } catch (error) {
      console.error('❌ Debug error:', error);
      next(error);
    }
  }

  /**
   * Debug endpoint: Get comprehensive information about category-package linking
   */
  async debugCategoryLinking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(`\n🔍 DEBUG: Comprehensive category-package linking check`);

      const packageRepo = AppDataSource.getRepository(Package);
      const categoryRepo = AppDataSource.getRepository(Category);

      // Get all categories with their package counts
      const categoriesData = await categoryRepo
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.packages', 'packages')
        .orderBy('category.name', 'ASC')
        .getMany();

      // Get direct counts from junction table
      const junctionCounts = await AppDataSource.query(`
        SELECT 
          c.id,
          c.name,
          COUNT(DISTINCT pc.package_id) as link_count
        FROM categories c
        LEFT JOIN package_categories pc ON c.id = pc.category_id
        GROUP BY c.id, c.name
        ORDER BY c.name
      `);

      // Get package statistics
      const stats = await AppDataSource.query(`
        SELECT 
          COUNT(DISTINCT p.id) as total_packages,
          COUNT(DISTINCT pc.package_id) as packages_with_categories,
          COUNT(DISTINCT pc.category_id) as unique_categories_linked
        FROM packages p
        LEFT JOIN package_categories pc ON p.id = pc.package_id
      `);

      // Find packages without categories
      const orphanedPackages = await packageRepo.query(`
        SELECT p.id, p.title, p.destination
        FROM packages p
        WHERE NOT EXISTS (SELECT 1 FROM package_categories WHERE package_id = p.id)
      `);

      console.log(`\n📊 Summary:`);
      console.log(`   Total packages: ${stats[0].total_packages}`);
      console.log(`   Packages linked to categories: ${stats[0].packages_with_categories}`);
      console.log(`   Categories with links: ${stats[0].unique_categories_linked}`);

      res.status(200).json({
        success: true,
        data: {
          summary: stats[0],
          categories: junctionCounts.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            packageCount: parseInt(cat.link_count)
          })),
          orphanedPackages: orphanedPackages.slice(0, 10),
          orphanedCount: orphanedPackages.length,
          recommendation: orphanedPackages.length > 0 
            ? `Run the populate-categories migration to link the ${orphanedPackages.length} orphaned packages`
            : 'All packages are properly linked to categories'
        }
      });
    } catch (error) {
      console.error('❌ Debug error:', error);
      next(error);
    }
  }
}
