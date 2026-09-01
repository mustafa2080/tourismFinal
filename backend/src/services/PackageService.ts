import { Repository } from 'typeorm';
import { Package } from '../entities/Package.js';
import { PackageRepository } from '../repositories/PackageRepository.js';
import { PackageTranslation } from '../entities/PackageTranslation.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { AppDataSource } from '../config/connection.js';

export class PackageService {
  private packageRepository: PackageRepository;

  constructor(packageRepo: Repository<Package>) {
    this.packageRepository = new PackageRepository(packageRepo);
  }

  async searchPackages(
    query: string = '',
    minPrice: number = 0,
    maxPrice: number = 999999,
    duration: number = 0,
    categoryIds: string[] = [],
    sort: string = 'newest',
    minRating: number = 0,
    tripType?: string,
    activities: string[] = [],
    limit: number = 50,
    offset: number = 0
  ): Promise<{ packages: Package[]; total: number }> {
    try {
      const packages = await this.packageRepository.searchAdvanced(
        query,
        minPrice,
        maxPrice,
        duration,
        categoryIds,
        sort,
        minRating,
        tripType,
        activities,
        limit,
        offset
      );
      const total = await this.packageRepository.searchAdvancedCount(
        query,
        minPrice,
        maxPrice,
        duration,
        categoryIds,
        minRating,
        tripType,
        activities
      );
      return { packages, total };
    } catch (error) {
      throw new Error('Failed to search packages');
    }
  }

  async getFeaturedPackages(): Promise<Package[]> {
    return await this.packageRepository.findFeatured();
  }

  async getPackageById(packageId: string): Promise<Package> {
    const pkg = await this.packageRepository.findWithRelations(packageId);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }
    return pkg;
  }

  async getPackagesByCategory(categoryId: string, limit: number = 50, offset: number = 0): Promise<{ packages: Package[]; total: number }> {
    console.log(`🔍 [PackageService.getPackagesByCategory] Fetching packages for category: ${categoryId}, limit: ${limit}, offset: ${offset}`);
    
    try {
      const packages = await this.packageRepository.findByCategory(categoryId, limit, offset);
      const total = await this.packageRepository.countByCategory(categoryId);
      
      console.log(`✅ [PackageService.getPackagesByCategory] Found ${packages.length} packages (total: ${total})`);
      
      return { packages, total };
    } catch (error) {
      console.error(`❌ [PackageService.getPackagesByCategory] Error:`, error);
      throw error;
    }
  }

  async getRelatedPackages(packageId: string, limit: number = 4): Promise<Package[]> {
    try {
      const pkg = await this.getPackageById(packageId);
      
      // Get related packages from same category or destination
      const categoryId = pkg.categories?.[0]?.id;
      if (!categoryId) {
        return [];
      }

      const result = await this.packageRepository.findByCategory(categoryId, limit + 1, 0);
      
      // Filter out the current package and limit results
      return result
        .filter(p => p.id !== packageId)
        .slice(0, limit);
    } catch (error) {
      throw new Error('Failed to fetch related packages');
    }
  }

  async createPackage(
    title: string,
    destination: string,
    durationDays: number,
    basePrice: number,
    shortDesc: string,
    longDesc: string,
    featured: boolean = false,
    categoryId?: string,
    images?: any[],
    itineraries?: any[],
    inclusions?: string[],
    exclusions?: string[],
    translations?: Record<string, any>
  ): Promise<Package> {
    if (!title || !destination || durationDays <= 0 || basePrice <= 0) {
      throw new ValidationError('Invalid package data');
    }

    // 1️⃣ Create package with translation fields
    const translationData: any = {};
    if (translations) {
      Object.entries(translations).forEach(([lang, data]: [string, any]) => {
        translationData[`${lang}_name`] = data.package_name || title;
        translationData[`${lang}_short_description`] = data.short_description || shortDesc;
        translationData[`${lang}_detailed_description`] = data.detailed_description || longDesc;
        translationData[`${lang}_whats_included`] = data.whats_included || '';
        translationData[`${lang}_whats_excluded`] = data.whats_excluded || '';
        translationData[`${lang}_daily_itinerary`] = data.daily_itinerary || '';
        translationData[`${lang}_whats_included_items`] = data.whats_included_items || [];
        translationData[`${lang}_whats_excluded_items`] = data.whats_excluded_items || [];
      });
    }

    const pkg = await this.packageRepository.create({
      title,
      destination,
      duration_days: durationDays,
      base_price: basePrice,
      short_desc: shortDesc,
      long_desc: longDesc,
      featured,
      category_id: categoryId,
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      images: images || [],
      itineraries: itineraries || [],
      ...translationData,
    });

    // 2️⃣ Create translations if provided
    if (translations) {
      const translationRepository = AppDataSource.getRepository(PackageTranslation);
      const translationsToCreate = Object.entries(translations).map(([language, data]: [string, any]) => ({
        package_id: pkg.id,
        language,
        package_name: data.package_name || title,
        short_description: data.short_description || shortDesc,
        detailed_description: data.detailed_description || longDesc,
        whats_included: data.whats_included || '',
        whats_excluded: data.whats_excluded || '',
        daily_itinerary: data.daily_itinerary || '',
        whats_included_items: data.whats_included_items || [],
        whats_excluded_items: data.whats_excluded_items || [],
      }));

      await translationRepository.save(translationsToCreate);
    }

    return pkg;
  }

  async updatePackage(
    packageId: string,
    updates: Partial<Package> & { 
      translations?: Record<string, any>,
      itineraries?: any[],
      en_daily_itinerary_days?: any[],
      ar_daily_itinerary_days?: any[],
      es_daily_itinerary_days?: any[],
      de_daily_itinerary_days?: any[],
      ru_daily_itinerary_days?: any[],
    }
  ): Promise<Package> {
    const pkg = await this.packageRepository.findById(packageId);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    // Separate translations, itineraries from other updates
    const { 
      translations, 
      itineraries,
      en_daily_itinerary_days,
      ar_daily_itinerary_days,
      es_daily_itinerary_days,
      de_daily_itinerary_days,
      ru_daily_itinerary_days,
      ...packageUpdates 
    } = updates;

    // Add translation fields to package updates
    if (translations) {
      Object.entries(translations).forEach(([lang, data]: [string, any]) => {
        (packageUpdates as any)[`${lang}_name`] = data.package_name || packageUpdates.title || pkg.title;
        (packageUpdates as any)[`${lang}_short_description`] = data.short_description || packageUpdates.short_desc || pkg.short_desc;
        (packageUpdates as any)[`${lang}_detailed_description`] = data.detailed_description || packageUpdates.long_desc || pkg.long_desc;
        (packageUpdates as any)[`${lang}_whats_included`] = data.whats_included || '';
        (packageUpdates as any)[`${lang}_whats_excluded`] = data.whats_excluded || '';
        (packageUpdates as any)[`${lang}_daily_itinerary`] = data.daily_itinerary || '';
        (packageUpdates as any)[`${lang}_whats_included_items`] = data.whats_included_items || [];
        (packageUpdates as any)[`${lang}_whats_excluded_items`] = data.whats_excluded_items || [];
      });
    }

    const updatedPkg = await this.packageRepository.update(packageId, packageUpdates) as Package;

    // Update itineraries with translations
    if (itineraries && itineraries.length > 0) {
      const ItineraryEntity = (await import('../entities/Itinerary.js')).Itinerary;
      const itineraryRepository = AppDataSource.getRepository(ItineraryEntity);

      // Delete existing itineraries for this package
      await itineraryRepository.delete({ package_id: packageId });

      // Map and create itineraries with translations
      const itinerariesToCreate = itineraries.map((itin: any, index: number) => ({
        package_id: packageId,
        day_number: itin.day_number || index + 1,
        title: itin.title || '',
        description: itin.description || '',
        image_url: itin.image_url || null,
        activities: itin.activities || '',
        meals: itin.meals || '',
        // English translations
        en_title: itin.title || '',
        en_description: itin.description || '',
        en_activities: itin.activities || '',
        en_meals: itin.meals || '',
        // Arabic translations
        ar_title: itin.ar_title || '',
        ar_description: itin.ar_description || '',
        ar_activities: itin.ar_activities || '',
        ar_meals: itin.ar_meals || '',
        // Spanish translations
        es_title: itin.es_title || '',
        es_description: itin.es_description || '',
        es_activities: itin.es_activities || '',
        es_meals: itin.es_meals || '',
        // German translations
        de_title: itin.de_title || '',
        de_description: itin.de_description || '',
        de_activities: itin.de_activities || '',
        de_meals: itin.de_meals || '',
        // Russian translations
        ru_title: itin.ru_title || '',
        ru_description: itin.ru_description || '',
        ru_activities: itin.ru_activities || '',
        ru_meals: itin.ru_meals || '',
      }));

      await itineraryRepository.save(itinerariesToCreate);
      console.log(`✅ [PackageService] Updated ${itinerariesToCreate.length} itinerary days with translations`);
    }

    // Update itinerary translations from language-specific fields
    const languages = [
      { code: 'en', days: en_daily_itinerary_days },
      { code: 'ar', days: ar_daily_itinerary_days },
      { code: 'es', days: es_daily_itinerary_days },
      { code: 'de', days: de_daily_itinerary_days },
      { code: 'ru', days: ru_daily_itinerary_days },
    ];

    for (const lang of languages) {
      if (lang.days && lang.days.length > 0) {
        const ItineraryEntity = (await import('../entities/Itinerary.js')).Itinerary;
        const itineraryRepository = AppDataSource.getRepository(ItineraryEntity);

        // Update each itinerary day with language-specific translations
        for (let i = 0; i < lang.days.length; i++) {
          const dayData = lang.days[i];
          
          // Find itinerary by package_id and day_number
          const existingItin = await itineraryRepository.findOne({
            where: { package_id: packageId, day_number: i + 1 }
          });

          if (existingItin) {
            // Update with language-specific fields
            const updateData: any = {};
            updateData[`${lang.code}_title`] = dayData.title || '';
            updateData[`${lang.code}_description`] = dayData.description || '';
            updateData[`${lang.code}_activities`] = dayData.activities || '';
            updateData[`${lang.code}_meals`] = dayData.meals || '';

            await itineraryRepository.update({ id: existingItin.id }, updateData);
          }
        }
        console.log(`✅ [PackageService] Updated ${lang.days.length} itinerary days for ${lang.code}`);
      }
    }

    // Update translations if provided
    if (translations) {
      const translationRepository = AppDataSource.getRepository(PackageTranslation);
      
      // Delete existing translations
      await translationRepository.delete({ package_id: packageId });

      // Create new translations
      const translationsToCreate = Object.entries(translations).map(([language, data]: [string, any]) => ({
        package_id: packageId,
        language,
        package_name: data.package_name || packageUpdates.title || pkg.title,
        short_description: data.short_description || packageUpdates.short_desc || pkg.short_desc,
        detailed_description: data.detailed_description || packageUpdates.long_desc || pkg.long_desc,
        whats_included: data.whats_included || '',
        whats_excluded: data.whats_excluded || '',
        daily_itinerary: data.daily_itinerary || '',
        whats_included_items: data.whats_included_items || [],
        whats_excluded_items: data.whats_excluded_items || [],
      }));

      await translationRepository.save(translationsToCreate);
    }

    return updatedPkg;
  }

  async deletePackage(packageId: string): Promise<void> {
    const pkg = await this.packageRepository.findById(packageId);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    await this.packageRepository.delete(packageId);
  }

  async calculatePackagePrice(
    packageId: string,
    persons: number,
    extras: { key: string; quantity: number }[] = []
  ): Promise<number> {
    const pkg = await this.getPackageById(packageId);
    let totalPrice = parseFloat(pkg.base_price.toString()) * persons;

    // إضافة سعر الـ extras
    for (const extra of extras) {
      // في النسخة الحقيقية، ستحصل على سعر الـ extra من قاعدة البيانات
      // هنا مثال بسيط
      totalPrice += extra.quantity * 50; // سعر مثالي
    }

    return totalPrice;
  }

  /**
   * جلب جميع الـ packages مع pagination
   */
  async getAllPackages(limit: number = 10, offset: number = 0): Promise<{ packages: Package[]; total: number }> {
    try {
      const packages = await this.packageRepository.findAll(limit, offset);
      const total = await this.packageRepository.count();
      return { packages, total };
    } catch (error) {
      throw new Error('Failed to fetch packages');
    }
  }

  /**
   * الحصول على اقتراحات الوجهات
   */
  async getDestinationSuggestions(query: string, limit: number = 10): Promise<Array<{destination: string, packageId: string, title: string}>> {
    try {
      console.log(`🔍 [PackageService.getDestinationSuggestions] Getting suggestions for: "${query}"`);
      
      if (!query || query.trim() === '') {
        console.warn('⚠️ [PackageService.getDestinationSuggestions] Query is empty');
        return [];
      }
      
      const suggestions = await this.packageRepository.getDestinationSuggestions(query, limit);
      
      console.log(`✅ [PackageService.getDestinationSuggestions] Returning ${suggestions.length} suggestions`);
      
      return suggestions;
    } catch (error) {
      console.error('❌ [PackageService.getDestinationSuggestions] Error:', error);
      throw new Error('Failed to fetch destination suggestions');
    }
  }

  /**
   * الحصول على جميع الوجهات الفريدة
   */
  async getAllDestinations(): Promise<string[]> {
    try {
      return await this.packageRepository.getAllDestinations();
    } catch (error) {
      throw new Error('Failed to fetch destinations');
    }
  }
}
