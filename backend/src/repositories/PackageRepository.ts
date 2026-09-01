import { Repository, Like, Between, In } from 'typeorm';
import { Package } from '../entities/Package.js';
import { BaseRepository } from './BaseRepository.js';

export class PackageRepository extends BaseRepository<Package> {
  constructor(repository: Repository<Package>) {
    super(repository);
  }

  async findFeatured(): Promise<Package[]> {
    try {
      console.log('🔍 [PackageRepository.findFeatured] Fetching featured packages');
      
      const packages = await this.repository
        .createQueryBuilder('package')
        .where('package.featured = :featured', { featured: true })
        .leftJoinAndSelect('package.images', 'images')
        .leftJoinAndSelect('package.categories', 'categories')
        .leftJoinAndSelect('package.reviews', 'reviews', 'reviews.approved = :approved', { approved: true })
        .leftJoinAndSelect('package.addons', 'addons')
        .leftJoinAndSelect('package.translations', 'translations')
        .leftJoinAndSelect('reviews.user', 'user')
        .orderBy('package.created_at', 'DESC')
        .addOrderBy('images.created_at', 'ASC')
        .take(8)
        .getMany();
      
      console.log(`✅ [PackageRepository.findFeatured] Found ${packages.length} featured packages`);
      
      // Log translation counts
      packages.forEach(pkg => {
        const transCounts = pkg.translations?.reduce((acc: any, t: any) => {
          acc[t.language] = (acc[t.language] || 0) + 1;
          return acc;
        }, {}) || {};
        console.log(`   📦 ${pkg.title}: translations=${JSON.stringify(transCounts)}`);
      });
      
      // Transform packages: flatten translation fields for frontend compatibility
      const transformedPackages = packages.map(pkg => this.flattenTranslations(pkg));
      
      // Recalculate average_rating from database for each package
      for (const pkg of transformedPackages) {
        let result;
        
        if (process.env.NODE_ENV === 'development') {
          // In dev mode, calculate from all reviews (pending and approved)
          result = await this.repository
            .createQueryBuilder('pkg')
            .innerJoin('pkg.reviews', 'review')
            .where('review.package_id = :packageId', { packageId: pkg.id })
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .getRawOne();
        } else {
          // In production, only approved reviews
          result = await this.repository
            .createQueryBuilder('pkg')
            .innerJoin('pkg.reviews', 'review')
            .where('review.package_id = :packageId', { packageId: pkg.id })
            .andWhere('review.approved = :approved', { approved: true })
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .getRawOne();
        }
        
        if (result && result.average) {
          pkg.average_rating = parseFloat(parseFloat(result.average).toFixed(2));
        } else {
          pkg.average_rating = 0;
        }
        
        const reviewCount = result?.count || 0;
        pkg.review_count = parseInt(reviewCount);
        console.log(`   ⭐ Package "${pkg.title}": average_rating=${pkg.average_rating}, reviews=${reviewCount}, images=${pkg.images?.length || 0}`);
      }
      
      return transformedPackages;
    } catch (error) {
      console.error('❌ [PackageRepository.findFeatured] Error:', error);
      throw error;
    }
  }

  /**
   * Helper method: Flatten translation fields from nested translations array to package root level
   */

  async search(
    query: string,
    minPrice: number,
    maxPrice: number,
    duration: number,
    categoryIds: string[],
    sort: string
  ): Promise<Package[]> {
    let queryBuilder = this.repository
      .createQueryBuilder('package');

    // Only apply search filter if query is not empty
    if (query && query.trim() !== '') {
      queryBuilder = queryBuilder.where('package.title ILIKE :query OR package.destination ILIKE :query', {
        query: `%${query}%`,
      });
    }

    queryBuilder = queryBuilder
      .andWhere('package.base_price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });

    if (duration > 0) {
      queryBuilder = queryBuilder.andWhere('package.duration_days = :duration', {
        duration,
      });
    }

    if (categoryIds.length > 0) {
      queryBuilder = queryBuilder
        .innerJoinAndSelect('package.categories', 'category')
        .andWhere('category.id IN (:...categoryIds)', { categoryIds });
    } else {
      queryBuilder = queryBuilder.leftJoinAndSelect('package.categories', 'category');
    }

    queryBuilder = queryBuilder.leftJoinAndSelect('package.images', 'images');
    queryBuilder = queryBuilder.leftJoinAndSelect('package.translations', 'translations');
    queryBuilder = queryBuilder.leftJoinAndSelect('package.reviews', 'reviews', 'reviews.approved = :approved', { approved: true });

    // Sorting
    if (sort === 'price_asc') {
      queryBuilder = queryBuilder.orderBy('package.base_price', 'ASC');
    } else if (sort === 'price_desc') {
      queryBuilder = queryBuilder.orderBy('package.base_price', 'DESC');
    } else if (sort === 'rating') {
      queryBuilder = queryBuilder.orderBy('package.average_rating', 'DESC');
    } else if (sort === 'newest') {
      queryBuilder = queryBuilder.orderBy('package.created_at', 'DESC');
    } else {
      queryBuilder = queryBuilder.orderBy('package.created_at', 'DESC');
    }

    const packages = await queryBuilder.getMany();
    // Transform packages: flatten translation fields for frontend compatibility
    const transformedPackages = packages.map(pkg => this.flattenTranslations(pkg));
    
    // Calculate average_rating and review_count for each package
    for (const pkg of transformedPackages) {
      let result;
      
      if (process.env.NODE_ENV === 'development') {
        result = await this.repository
          .createQueryBuilder('pkg')
          .innerJoin('pkg.reviews', 'review')
          .where('review.package_id = :packageId', { packageId: pkg.id })
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(review.id)', 'count')
          .getRawOne();
      } else {
        result = await this.repository
          .createQueryBuilder('pkg')
          .innerJoin('pkg.reviews', 'review')
          .where('review.package_id = :packageId', { packageId: pkg.id })
          .andWhere('review.approved = :approved', { approved: true })
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(review.id)', 'count')
          .getRawOne();
      }
      
      if (result && result.average) {
        pkg.average_rating = parseFloat(parseFloat(result.average).toFixed(2));
      } else {
        pkg.average_rating = 0;
      }
      
      const reviewCount = result?.count || 0;
      pkg.review_count = parseInt(reviewCount);
      console.log(`   📦 Search: "${pkg.title}" - rating=${pkg.average_rating}, reviews=${reviewCount}`);
    }
    
    return transformedPackages;
  }

  async findWithRelations(id: string): Promise<Package | null> {
    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      console.warn(`⚠️ Invalid UUID format: "${id}"`);
      return null;
    }
    
    const pkg = await this.repository.findOne({
      where: { id },
      relations: ['images', 'itineraries', 'categories', 'reviews', 'addons', 'translations'],
    });
    
    if (pkg) {
      // Add review_count and average_rating
      let result;
      
      if (process.env.NODE_ENV === 'development') {
        result = await this.repository
          .createQueryBuilder('p')
          .innerJoin('p.reviews', 'review')
          .where('review.package_id = :packageId', { packageId: pkg.id })
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(review.id)', 'count')
          .getRawOne();
      } else {
        result = await this.repository
          .createQueryBuilder('p')
          .innerJoin('p.reviews', 'review')
          .where('review.package_id = :packageId', { packageId: pkg.id })
          .andWhere('review.approved = :approved', { approved: true })
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(review.id)', 'count')
          .getRawOne();
      }
      
      if (result && result.average) {
        pkg.average_rating = parseFloat(parseFloat(result.average).toFixed(2)) as any;
      } else {
        pkg.average_rating = 0 as any;
      }
      
      const reviewCount = result?.count || 0;
      pkg.review_count = parseInt(reviewCount) as any;
      console.log(`   📦 Detail View: "${pkg.title}" - rating=${pkg.average_rating}, reviews=${reviewCount}`);
    }
    
    return pkg;
  }

  async findByCategory(categoryId: string, limit: number = 50, offset: number = 0): Promise<Package[]> {
    if (!categoryId) {
      console.warn(`⚠️ [findByCategory] Empty categoryId provided`);
      return [];
    }

    console.log(`🔍 [findByCategory] Fetching packages for category: ${categoryId}, limit: ${limit}, offset: ${offset}`);

    try {
      // First, check how many packages are actually linked to this category in the junction table
      const countFromJunction = await this.repository.query(
        `SELECT COUNT(DISTINCT pc.package_id) as count FROM package_categories pc WHERE pc.category_id = $1`,
        [categoryId]
      );
      console.log(`📊 [findByCategory] Junction table shows ${countFromJunction[0]?.count || 0} packages for category ${categoryId}`);

      // Query to find all packages that have this category in their categories relationship
      const packages = await this.repository
        .createQueryBuilder('package')
        .innerJoinAndSelect(
          'package.categories',
          'category',
          'category.id = :categoryId',
          { categoryId }
        )
        .leftJoinAndSelect('package.images', 'images')
        .leftJoinAndSelect('package.addons', 'addons')
        .leftJoinAndSelect('package.reviews', 'reviews', 'reviews.approved = :approved', { approved: true })
        .leftJoinAndSelect('package.translations', 'translations')
        .orderBy('package.created_at', 'DESC')
        .addOrderBy('images.created_at', 'ASC')
        .skip(offset)
        .take(limit)
        .getMany();

      console.log(`✅ [findByCategory] Found ${packages.length} packages for category ${categoryId}`);
      
      // Log translation availability before transformation
      packages.forEach(pkg => {
        const transCount = pkg.translations?.length || 0;
        const languages = pkg.translations?.map((t: any) => t.language).join(', ') || 'none';
        console.log(`   📦 ${pkg.title}: ${transCount} translations (${languages}), ar_name="${pkg.ar_name || 'empty'}"`);
      });
      
      // If no packages found, return early with logging
      if (packages.length === 0) {
        console.warn(`⚠️ [findByCategory] No packages found for category ${categoryId}. This could mean:`);
        console.warn(`   1. No packages are linked to this category`);
        console.warn(`   2. Category doesn't exist or is inactive`);
        console.warn(`   3. All packages in this category are unpublished`);
        return [];
      }
      
      // Transform packages: flatten translation fields for frontend compatibility
      const transformedPackages = packages.map(pkg => this.flattenTranslations(pkg));
      
      // Calculate average_rating for each package from reviews
      for (const pkg of transformedPackages) {
        let result;
        
        if (process.env.NODE_ENV === 'development') {
          // In dev mode, calculate from all reviews (pending and approved)
          result = await this.repository
            .createQueryBuilder('pkg')
            .innerJoin('pkg.reviews', 'review')
            .where('review.package_id = :packageId', { packageId: pkg.id })
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .getRawOne();
        } else {
          // In production, only approved reviews
          result = await this.repository
            .createQueryBuilder('pkg')
            .innerJoin('pkg.reviews', 'review')
            .where('review.package_id = :packageId', { packageId: pkg.id })
            .andWhere('review.approved = :approved', { approved: true })
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .getRawOne();
        }
        
        if (result && result.average) {
          pkg.average_rating = parseFloat(parseFloat(result.average).toFixed(2));
        } else {
          pkg.average_rating = 0;
        }
        
        const reviewCount = result?.count || 0;
        pkg.review_count = parseInt(reviewCount);
        console.log(`   ⭐ Package "${pkg.title}": average_rating=${pkg.average_rating}, reviews=${reviewCount}, images=${pkg.images?.length || 0}`);
      }
      
      // Log details for debugging
      if (transformedPackages.length > 0) {
        console.log(`📋 Sample packages:`, transformedPackages.slice(0, 2).map(p => ({
          id: p.id,
          title: p.title,
          destination: p.destination,
          average_rating: p.average_rating,
          categories: p.categories?.map(c => c.name).join(', ') || 'none',
          images: p.images?.length || 0,
          de_name: p.de_name,
          de_short_description: p.de_short_description
        })));
      }
      
      return transformedPackages;
    } catch (error) {
      console.error(`❌ [findByCategory] Error fetching packages for category ${categoryId}:`, error);
      return [];
    }
  }

  async countByCategory(categoryId: string): Promise<number> {
    if (!categoryId) {
      console.warn(`⚠️ [countByCategory] Empty categoryId provided`);
      return 0;
    }

    console.log(`🔍 [countByCategory] Counting packages for category: ${categoryId}`);

    try {
      // First check the junction table directly
      const junctionCount = await this.repository.query(
        `SELECT COUNT(DISTINCT pc.package_id) as count FROM package_categories pc WHERE pc.category_id = $1`,
        [categoryId]
      );
      console.log(`📊 [countByCategory] Direct junction query: ${junctionCount[0]?.count || 0} packages`);

      // Then check via the query builder (should match)
      const queryBuilderCount = await this.repository
        .createQueryBuilder('package')
        .innerJoin(
          'package.categories',
          'category',
          'category.id = :categoryId',
          { categoryId }
        )
        .getCount();

      console.log(`✅ [countByCategory] QueryBuilder count for category ${categoryId}: ${queryBuilderCount}`);
      
      return queryBuilderCount;
    } catch (error) {
      console.error(`❌ [countByCategory] Error counting packages for category ${categoryId}:`, error);
      return 0;
    }
  }

  async searchAdvanced(
    query: string,
    minPrice: number,
    maxPrice: number,
    duration: number,
    categoryIds: string[],
    sort: string,
    minRating: number = 0,
    tripType?: string,
    activities: string[] = [],
    limit: number = 50,
    offset: number = 0
  ): Promise<Package[]> {
    let queryBuilder = this.repository
      .createQueryBuilder('package');

    // Only apply search filter if query is not empty
    if (query && query.trim() !== '') {
      queryBuilder = queryBuilder.where('package.title ILIKE :query OR package.destination ILIKE :query', {
        query: `%${query}%`,
      });
    }

    queryBuilder = queryBuilder
      .andWhere('package.base_price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });

    if (duration > 0) {
      queryBuilder = queryBuilder.andWhere('package.duration_days = :duration', {
        duration,
      });
    }

    if (minRating > 0) {
      queryBuilder = queryBuilder.andWhere(
        'package.average_rating >= :minRating',
        { minRating }
      );
    }

    if (tripType) {
      queryBuilder = queryBuilder.andWhere('package.trip_type = :tripType', {
        tripType,
      });
    }

    if (categoryIds.length > 0) {
      queryBuilder = queryBuilder
        .innerJoinAndSelect('package.categories', 'category')
        .andWhere('category.id IN (:...categoryIds)', { categoryIds });
    } else {
      queryBuilder = queryBuilder.leftJoinAndSelect('package.categories', 'category');
    }

    queryBuilder = queryBuilder.leftJoinAndSelect('package.images', 'images');
    queryBuilder = queryBuilder.leftJoinAndSelect('package.translations', 'translations');
    queryBuilder = queryBuilder.leftJoinAndSelect('package.reviews', 'reviews', 'reviews.approved = :approved', { approved: true });

    // Sorting
    if (sort === 'price_asc') {
      queryBuilder = queryBuilder.orderBy('package.base_price', 'ASC');
    } else if (sort === 'price_desc') {
      queryBuilder = queryBuilder.orderBy('package.base_price', 'DESC');
    } else if (sort === 'rating') {
      queryBuilder = queryBuilder.orderBy('package.average_rating', 'DESC');
    } else if (sort === 'newest') {
      queryBuilder = queryBuilder.orderBy('package.created_at', 'DESC');
    } else if (sort === 'most_popular') {
      queryBuilder = queryBuilder.orderBy('package.booking_count', 'DESC');
    } else {
      // Default sorting when no specific sort is selected
      queryBuilder = queryBuilder.orderBy('package.created_at', 'DESC');
    }

    const packages = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();
    
    const transformedPackages = packages.map(pkg => this.flattenTranslations(pkg));
    
    // Calculate average_rating and review_count for each package
    for (const pkg of transformedPackages) {
      let result;
      
      if (process.env.NODE_ENV === 'development') {
        result = await this.repository
          .createQueryBuilder('pkg')
          .innerJoin('pkg.reviews', 'review')
          .where('review.package_id = :packageId', { packageId: pkg.id })
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(review.id)', 'count')
          .getRawOne();
      } else {
        result = await this.repository
          .createQueryBuilder('pkg')
          .innerJoin('pkg.reviews', 'review')
          .where('review.package_id = :packageId', { packageId: pkg.id })
          .andWhere('review.approved = :approved', { approved: true })
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(review.id)', 'count')
          .getRawOne();
      }
      
      if (result && result.average) {
        pkg.average_rating = parseFloat(parseFloat(result.average).toFixed(2));
      } else {
        pkg.average_rating = 0;
      }
      
      const reviewCount = result?.count || 0;
      pkg.review_count = parseInt(reviewCount);
      console.log(`   📦 Advanced Search: "${pkg.title}" - rating=${pkg.average_rating}, reviews=${reviewCount}`);
    }
    
    return transformedPackages;
  }

  /**
   * عد النتائج للـ advanced search
   */
  async searchAdvancedCount(
    query: string,
    minPrice: number,
    maxPrice: number,
    duration: number,
    categoryIds: string[],
    minRating: number = 0,
    tripType?: string,
    activities: string[] = []
  ): Promise<number> {
    let queryBuilder = this.repository
      .createQueryBuilder('package');

    // Only apply search filter if query is not empty
    if (query && query.trim() !== '') {
      queryBuilder = queryBuilder.where('package.title ILIKE :query OR package.destination ILIKE :query', {
        query: `%${query}%`,
      });
    }

    queryBuilder = queryBuilder
      .andWhere('package.base_price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });

    if (duration > 0) {
      queryBuilder = queryBuilder.andWhere('package.duration_days = :duration', {
        duration,
      });
    }

    if (minRating > 0) {
      queryBuilder = queryBuilder.andWhere(
        'package.average_rating >= :minRating',
        { minRating }
      );
    }

    if (tripType) {
      queryBuilder = queryBuilder.andWhere('package.trip_type = :tripType', {
        tripType,
      });
    }

    if (categoryIds.length > 0) {
      queryBuilder = queryBuilder
        .innerJoin('package.categories', 'category')
        .andWhere('category.id IN (:...categoryIds)', { categoryIds });
    }

    return await queryBuilder.getCount();
  }

  /**
   * جلب جميع الـ packages مع pagination
   */
  async findAll(limit: number = 10, offset: number = 0): Promise<Package[]> {
    try {
      console.log(`🔍 [PackageRepository.findAll] Fetching ${limit} packages from offset ${offset}`);
      
      const packages = await this.repository.find({
        relations: ['images', 'itineraries', 'categories', 'reviews', 'translations'],
        take: limit,
        skip: offset,
        order: { created_at: 'DESC' },
      });

      console.log(`✅ [PackageRepository.findAll] Found ${packages.length} packages`);
      
      // Transform packages: flatten translation fields for frontend compatibility
      const transformedPackages = packages.map(pkg => this.flattenTranslations(pkg));
      
      // Calculate average_rating for each package
      for (const pkg of transformedPackages) {
        let result;
        
        if (process.env.NODE_ENV === 'development') {
          result = await this.repository
            .createQueryBuilder('pkg')
            .innerJoin('pkg.reviews', 'review')
            .where('review.package_id = :packageId', { packageId: pkg.id })
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .getRawOne();
        } else {
          result = await this.repository
            .createQueryBuilder('pkg')
            .innerJoin('pkg.reviews', 'review')
            .where('review.package_id = :packageId', { packageId: pkg.id })
            .andWhere('review.approved = :approved', { approved: true })
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .getRawOne();
        }
        
        if (result && result.average) {
          pkg.average_rating = parseFloat(parseFloat(result.average).toFixed(2));
        } else {
          pkg.average_rating = 0;
        }
        
        const reviewCount = result?.count || 0;
        pkg.review_count = parseInt(reviewCount);
        console.log(`   Package ${pkg.id}: "${pkg.title}" - ${pkg.images?.length || 0} images, ${pkg.itineraries?.length || 0} itineraries, avg_rating=${pkg.average_rating}, reviews=${reviewCount}`);
      }
      
      return transformedPackages;

      return packages;
    } catch (error) {
      console.error('❌ [PackageRepository.findAll] Error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * عد جميع الـ packages
   */
  async count(): Promise<number> {
    return await this.repository.count();
  }

  /**
   * الحصول على اقتراحات الوجهات مع معلومات الـ Package
   */
  async getDestinationSuggestions(query: string, limit: number = 10): Promise<Array<{destination: string, packageId: string, title: string}>> {
    try {
      console.log(`🔍 [PackageRepository.getDestinationSuggestions] Searching for query: "${query}"`);
      
      // إذا كان الـ query فارغ، نرجع مصفوفة فارغة
      if (!query || query.trim() === '') {
        console.warn('⚠️ [PackageRepository.getDestinationSuggestions] Query is empty');
        return [];
      }

      // ابحث في destination أو title مع إرجاع معلومات الـ package
      const results = await this.repository
        .createQueryBuilder('package')
        .select('package.id', 'packageId')
        .addSelect('package.destination', 'destination')
        .addSelect('package.title', 'title')
        .where('(package.destination IS NOT NULL AND package.destination != :empty)', { empty: '' })
        .andWhere('package.destination ILIKE :query', { query: `%${query}%` })
        .orderBy('package.destination', 'ASC')
        .limit(limit)
        .getRawMany();

      console.log(`✅ [PackageRepository.getDestinationSuggestions] Found ${results.length} suggestions from destination field`);
      
      let suggestions = results.map((r: any) => ({
        destination: r.destination,
        packageId: r.packageId,
        title: r.title
      })).filter(s => s.destination);
      
      // إذا لم نجد نتائج في destination، ابحث في title (ربما يريد المستخدم اسم الـ package)
      if (suggestions.length === 0) {
        console.log(`📌 [PackageRepository.getDestinationSuggestions] No results from destination, searching in titles...`);
        
        const titleResults = await this.repository
          .createQueryBuilder('package')
          .select('package.id', 'packageId')
          .addSelect('package.title', 'title')
          .addSelect('package.destination', 'destination')
          .where('package.title IS NOT NULL AND package.title != :empty', { empty: '' })
          .andWhere('package.title ILIKE :query', { query: `%${query}%` })
          .orderBy('package.title', 'ASC')
          .limit(limit)
          .getRawMany();

        suggestions = titleResults.map((r: any) => ({
          destination: r.destination || r.title,
          packageId: r.packageId,
          title: r.title
        })).filter(Boolean);
        console.log(`✅ [PackageRepository.getDestinationSuggestions] Found ${suggestions.length} suggestions from title field`);
      }
      
      console.log(`📋 Final suggestions (${suggestions.length}):`, suggestions.slice(0, 5));
      
      return suggestions;
    } catch (error) {
      console.error('❌ [PackageRepository.getDestinationSuggestions] Error:', error);
      return [];
    }
  }

  /**
   * الحصول على جميع الوجهات الفريدة
   */
  async getAllDestinations(): Promise<string[]> {
    try {
      // ابحث عن destinations الموجودة
      const results = await this.repository
        .createQueryBuilder('package')
        .select('DISTINCT package.destination', 'destination')
        .where('package.destination IS NOT NULL AND package.destination != :empty', { empty: '' })
        .orderBy('package.destination', 'ASC')
        .getRawMany();

      let destinations = results.map((r: any) => r.destination).filter(Boolean);
      
      // إذا لم نجد destinations، احصل على titles كبديل
      if (destinations.length === 0) {
        console.log('📌 No destinations found, using titles instead');
        const titleResults = await this.repository
          .createQueryBuilder('package')
          .select('DISTINCT package.title', 'title')
          .where('package.title IS NOT NULL AND package.title != :empty', { empty: '' })
          .orderBy('package.title', 'ASC')
          .getRawMany();

        destinations = titleResults.map((r: any) => r.title).filter(Boolean);
      }
      
      console.log(`✅ [PackageRepository.getAllDestinations] Found ${destinations.length} unique destinations`);
      return destinations;
    } catch (error) {
      console.error('❌ Error getting all destinations:', error);
      return [];
    }
  }

  /**
   * Helper method: Flatten translation fields from nested translations array to package root level
   * Converts: { ..., translations: [{language: 'de', name: '...', ...}] }
   * To: { ..., de_name: '...', de_short_description: '...', ... }
   */
  private flattenTranslations(pkg: any): any {
    const flatPkg = { ...pkg };

    // Fill from translations array (primary source)
    if (pkg.translations && Array.isArray(pkg.translations) && pkg.translations.length > 0) {
      pkg.translations.forEach((translation: any) => {
        const lang = translation.language || translation.lang;
        if (!lang) return;

        const nameField = `${lang}_name`;
        const shortDescField = `${lang}_short_description`;
        const detailDescField = `${lang}_detailed_description`;
        const includedField = `${lang}_whats_included`;
        const excludedField = `${lang}_whats_excluded`;
        const itineraryField = `${lang}_daily_itinerary`;
        const includedItemsField = `${lang}_whats_included_items`;
        const excludedItemsField = `${lang}_whats_excluded_items`;

        // Set translation fields from the translations table
        if (translation.package_name) flatPkg[nameField] = translation.package_name;
        if (translation.short_description) flatPkg[shortDescField] = translation.short_description;
        if (translation.detailed_description) flatPkg[detailDescField] = translation.detailed_description;
        if (translation.whats_included) flatPkg[includedField] = translation.whats_included;
        if (translation.whats_excluded) flatPkg[excludedField] = translation.whats_excluded;
        if (translation.daily_itinerary) flatPkg[itineraryField] = translation.daily_itinerary;
        if (translation.whats_included_items) flatPkg[includedItemsField] = translation.whats_included_items;
        if (translation.whats_excluded_items) flatPkg[excludedItemsField] = translation.whats_excluded_items;

        console.log(`✅ [flattenTranslations] Filled ${lang}: name="${translation.package_name || 'empty'}"`);
      });
    } else {
      console.warn(`⚠️ [flattenTranslations] No translations array for package: ${pkg.id}`);
    }

    return flatPkg;
  }
}
