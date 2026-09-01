/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { PackageAddon } from '../entities/PackageAddon.js';
import { PackageAddonTranslation } from '../entities/PackageAddonTranslation.js';
import { Package } from '../entities/Package.js';
import { PackageAddonTranslationRepository } from '../repositories/PackageAddonTranslationRepository.js';
import { AppError, ValidationError } from '../utils/errors.js';

export class PackageAddonController {
  /**
   * GET /api/packages/:packageId/addons
   * جلب جميع add-ons للـ package
   */
  async getPackageAddons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;

      // التحقق من وجود الـ package
      const packageRepository = AppDataSource.getRepository(Package);
      const pkg = await packageRepository.findOne({ where: { id: packageId } });
      if (!pkg) {
        throw new AppError(404, 'Package not found');
      }

      const addonRepository = AppDataSource.getRepository(PackageAddon);
      // جلب جميع الـ add-ons سواء متاحة أم لا
      const addons = await addonRepository.find({
        where: { package_id: packageId },
        relations: ['translations'],
        order: { sort_order: 'ASC', created_at: 'DESC' },
      });

      res.status(200).json({
        success: true,
        data: addons,
        count: addons.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/packages/:packageId/addons/:addonId/translations
   * جلب ترجمات addon معين
   */
  async getAddonTranslations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { addonId } = req.params;

      const translationRepo = new PackageAddonTranslationRepository(
        AppDataSource.getRepository(PackageAddonTranslation)
      );

      const translations = await translationRepo.findByAddon(addonId);

      res.status(200).json({
        success: true,
        data: translations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/packages/:packageId/addons
   * إنشاء addon جديد (Admin Only)
   */
  async createAddon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;
      const { 
        price = 0,
        name = '',
        description = '',
        category = 'addon',
        min_quantity = 1, 
        max_quantity = 1, 
        sort_order = 0,
        is_available = true,
        en_name = '',
        en_short_description = '',
        en_detailed_description = '',
        en_whats_included = '',
        en_whats_excluded = '',
        en_daily_itinerary = '',
        ar_name = '',
        ar_short_description = '',
        ar_detailed_description = '',
        ar_whats_included = '',
        ar_whats_excluded = '',
        ar_daily_itinerary = '',
        de_name = '',
        de_short_description = '',
        de_detailed_description = '',
        de_whats_included = '',
        de_whats_excluded = '',
        de_daily_itinerary = '',
        es_name = '',
        es_short_description = '',
        es_detailed_description = '',
        es_whats_included = '',
        es_whats_excluded = '',
        es_daily_itinerary = '',
        ru_name = '',
        ru_short_description = '',
        ru_detailed_description = '',
        ru_whats_included = '',
        ru_whats_excluded = '',
        ru_daily_itinerary = '',
      } = req.body;

      const packageRepository = AppDataSource.getRepository(Package);
      const pkg = await packageRepository.findOne({ where: { id: packageId } });
      if (!pkg) {
        throw new AppError(404, 'Package not found');
      }

      if (min_quantity < 1 || max_quantity < min_quantity) {
        throw new ValidationError('Invalid quantity range');
      }

      if (!name || !price) {
        throw new ValidationError('Name and price are required');
      }

      const translations = {
        en: { package_name: en_name || name, short_description: en_short_description || description, detailed_description: en_detailed_description, whats_included: en_whats_included, whats_excluded: en_whats_excluded, daily_itinerary: en_daily_itinerary },
        ar: { package_name: ar_name || name, short_description: ar_short_description || description, detailed_description: ar_detailed_description, whats_included: ar_whats_included, whats_excluded: ar_whats_excluded, daily_itinerary: ar_daily_itinerary },
        de: { package_name: de_name || name, short_description: de_short_description || description, detailed_description: de_detailed_description, whats_included: de_whats_included, whats_excluded: de_whats_excluded, daily_itinerary: de_daily_itinerary },
        es: { package_name: es_name || name, short_description: es_short_description || description, detailed_description: es_detailed_description, whats_included: es_whats_included, whats_excluded: es_whats_excluded, daily_itinerary: es_daily_itinerary },
        ru: { package_name: ru_name || name, short_description: ru_short_description || description, detailed_description: ru_detailed_description, whats_included: ru_whats_included, whats_excluded: ru_whats_excluded, daily_itinerary: ru_daily_itinerary },
      };

      const languages = ['ar', 'en', 'es', 'de', 'ru'];
      const hasTranslations = languages.some(lang => translations[lang]?.package_name);
      if (!hasTranslations) {
        throw new ValidationError('At least one translation is required');
      }

      const addonRepository = AppDataSource.getRepository(PackageAddon);
      const translationRepo = new PackageAddonTranslationRepository(
        AppDataSource.getRepository(PackageAddonTranslation)
      );

      const addon = addonRepository.create({
        package_id: packageId,
        price: parseFloat(String(price)),
        name,
        description,
        category,
        is_available,
        min_quantity,
        max_quantity,
        sort_order,
      });

      await addonRepository.save(addon);

      for (const lang of languages) {
        if (translations[lang]?.package_name) {
          const transData = translations[lang];
          await translationRepo.create({
            addon_id: addon.id,
            language: lang,
            package_name: transData.package_name || '',
            short_description: transData.short_description || '',
            detailed_description: transData.detailed_description || '',
            whats_included: transData.whats_included || [],
            whats_excluded: transData.whats_excluded || [],
            daily_itinerary: transData.daily_itinerary || null,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Add-on created successfully',
        data: addon,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAddon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId, addonId } = req.params;
      const { 
        price,
        name,
        description,
        category,
        is_available, 
        min_quantity, 
        max_quantity, 
        sort_order,
        en_name = '',
        en_short_description = '',
        en_detailed_description = '',
        en_whats_included = '',
        en_whats_excluded = '',
        en_daily_itinerary = '',
        ar_name = '',
        ar_short_description = '',
        ar_detailed_description = '',
        ar_whats_included = '',
        ar_whats_excluded = '',
        ar_daily_itinerary = '',
        de_name = '',
        de_short_description = '',
        de_detailed_description = '',
        de_whats_included = '',
        de_whats_excluded = '',
        de_daily_itinerary = '',
        es_name = '',
        es_short_description = '',
        es_detailed_description = '',
        es_whats_included = '',
        es_whats_excluded = '',
        es_daily_itinerary = '',
        ru_name = '',
        ru_short_description = '',
        ru_detailed_description = '',
        ru_whats_included = '',
        ru_whats_excluded = '',
        ru_daily_itinerary = '',
      } = req.body;

      console.log(`📝 [updateAddon] Starting update for addon: ${addonId}`, {
        packageId,
        price,
        name,
        category,
      });

      const addonRepository = AppDataSource.getRepository(PackageAddon);
      const translationRepo = new PackageAddonTranslationRepository(
        AppDataSource.getRepository(PackageAddonTranslation)
      );

      const addon = await addonRepository.findOne({
        where: { id: addonId, package_id: packageId },
      });

      if (!addon) {
        throw new AppError(404, 'Add-on not found');
      }

      console.log(`📋 [updateAddon] Current addon data:`, {
        id: addon.id,
        oldPrice: addon.price,
        oldName: addon.name,
        oldCategory: addon.category,
      });

      if (price !== undefined) {
        const newPrice = parseFloat(String(price));
        console.log(`💰 [updateAddon] Updating price: ${addon.price} -> ${newPrice}`);
        addon.price = newPrice;
      }
      if (name !== undefined) addon.name = name;
      if (description !== undefined) addon.description = description;
      if (category !== undefined) addon.category = category;
      if (is_available !== undefined) addon.is_available = is_available;
      if (min_quantity !== undefined) addon.min_quantity = min_quantity;
      if (max_quantity !== undefined) addon.max_quantity = max_quantity;
      if (sort_order !== undefined) addon.sort_order = sort_order;

      const savedAddon = await addonRepository.save(addon);

      console.log(`✅ [updateAddon] Addon saved successfully:`, {
        id: savedAddon.id,
        newPrice: savedAddon.price,
        newName: savedAddon.name,
        newCategory: savedAddon.category,
      });

      const translations = {
        en: { package_name: en_name || name, short_description: en_short_description || description, detailed_description: en_detailed_description, whats_included: en_whats_included, whats_excluded: en_whats_excluded, daily_itinerary: en_daily_itinerary },
        ar: { package_name: ar_name || name, short_description: ar_short_description || description, detailed_description: ar_detailed_description, whats_included: ar_whats_included, whats_excluded: ar_whats_excluded, daily_itinerary: ar_daily_itinerary },
        de: { package_name: de_name || name, short_description: de_short_description || description, detailed_description: de_detailed_description, whats_included: de_whats_included, whats_excluded: de_whats_excluded, daily_itinerary: de_daily_itinerary },
        es: { package_name: es_name || name, short_description: es_short_description || description, detailed_description: es_detailed_description, whats_included: es_whats_included, whats_excluded: es_whats_excluded, daily_itinerary: es_daily_itinerary },
        ru: { package_name: ru_name || name, short_description: ru_short_description || description, detailed_description: ru_detailed_description, whats_included: ru_whats_included, whats_excluded: ru_whats_excluded, daily_itinerary: ru_daily_itinerary },
      };

      const languages = ['ar', 'en', 'es', 'de', 'ru'];
      for (const lang of languages) {
        if (translations[lang]?.package_name) {
          await translationRepo.upsert(addonId, lang, {
            package_name: translations[lang].package_name,
            short_description: translations[lang].short_description,
            detailed_description: translations[lang].detailed_description,
            whats_included: translations[lang].whats_included,
            whats_excluded: translations[lang].whats_excluded,
            daily_itinerary: translations[lang].daily_itinerary,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Add-on updated successfully',
        data: savedAddon,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/packages/:packageId/addons/:addonId
   * حذف addon
   */
  async deleteAddon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId, addonId } = req.params;

      const addonRepository = AppDataSource.getRepository(PackageAddon);
      const addon = await addonRepository.findOne({
        where: { id: addonId, package_id: packageId },
      });

      if (!addon) {
        throw new AppError(404, 'Add-on not found');
      }

      await addonRepository.delete(addonId);

      res.status(200).json({
        success: true,
        message: 'Add-on deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/packages/:packageId/addons/bulk-update
   * تحديث ترتيب وحالة addons
   */
  async bulkUpdateAddons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;
      const { addons } = req.body;

      if (!Array.isArray(addons)) {
        throw new ValidationError('addons must be an array');
      }

      const addonRepository = AppDataSource.getRepository(PackageAddon);

      for (const addonUpdate of addons) {
        const addon = await addonRepository.findOne({
          where: { id: addonUpdate.id, package_id: packageId },
        });

        if (addon) {
          if (addonUpdate.sort_order !== undefined) addon.sort_order = addonUpdate.sort_order;
          if (addonUpdate.is_available !== undefined) addon.is_available = addonUpdate.is_available;
          await addonRepository.save(addon);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Add-ons updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
