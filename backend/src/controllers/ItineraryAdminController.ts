import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';

/**
 * Admin endpoint to fill missing itinerary translations
 * POST /admin/itineraries/fill-translations
 */
export class ItineraryAdminController {
  
  async fillMissingTranslations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔄 [ItineraryAdmin] Starting to fill missing translations using raw SQL...');
      
      // Use raw SQL for bulk update - much more efficient
      const updateResult = await AppDataSource.query(`
        UPDATE itineraries 
        SET 
          -- Fill English translations from base fields
          en_title = COALESCE(en_title, title),
          en_description = COALESCE(en_description, description),
          en_activities = COALESCE(en_activities, activities),
          en_meals = COALESCE(en_meals, meals),
          
          -- Fill Arabic translations (use English as fallback)
          ar_title = COALESCE(ar_title, COALESCE(en_title, title)),
          ar_description = COALESCE(ar_description, COALESCE(en_description, description)),
          ar_activities = COALESCE(ar_activities, COALESCE(en_activities, activities)),
          ar_meals = COALESCE(ar_meals, COALESCE(en_meals, meals)),
          
          -- Fill Spanish translations (use English as fallback)
          es_title = COALESCE(es_title, COALESCE(en_title, title)),
          es_description = COALESCE(es_description, COALESCE(en_description, description)),
          es_activities = COALESCE(es_activities, COALESCE(en_activities, activities)),
          es_meals = COALESCE(es_meals, COALESCE(en_meals, meals)),
          
          -- Fill German translations (use English as fallback)
          de_title = COALESCE(de_title, COALESCE(en_title, title)),
          de_description = COALESCE(de_description, COALESCE(en_description, description)),
          de_activities = COALESCE(de_activities, COALESCE(en_activities, activities)),
          de_meals = COALESCE(de_meals, COALESCE(en_meals, meals)),
          
          -- Fill Russian translations (use English as fallback)
          ru_title = COALESCE(ru_title, COALESCE(en_title, title)),
          ru_description = COALESCE(ru_description, COALESCE(en_description, description)),
          ru_activities = COALESCE(ru_activities, COALESCE(en_activities, activities)),
          ru_meals = COALESCE(ru_meals, COALESCE(en_meals, meals))
        WHERE 
          en_title IS NULL OR en_title = '' OR
          es_title IS NULL OR es_title = '' OR
          ar_title IS NULL OR ar_title = '' OR
          de_title IS NULL OR de_title = '' OR
          ru_title IS NULL OR ru_title = ''
      `);

      console.log('✅ [ItineraryAdmin] SQL Update Result:', updateResult);

      // Now verify the update by checking count
      const countResult = await AppDataSource.query(`
        SELECT COUNT(*) as count FROM itineraries
      `);

      console.log(`✅ [ItineraryAdmin] Total itineraries with translations: ${countResult[0].count}`);

      // Get updated count
      const translatedResult = await AppDataSource.query(`
        SELECT COUNT(*) as count FROM itineraries
        WHERE 
          es_title IS NOT NULL AND es_title != '' AND
          ar_title IS NOT NULL AND ar_title != ''
      `);

      console.log(`✅ [ItineraryAdmin] Itineraries now have translations: ${translatedResult[0].count}`);

      res.status(200).json({
        success: true,
        message: `✅ Updated itineraries with missing translations`,
        stats: {
          totalItineraries: countResult[0].count,
          translatedItineraries: translatedResult[0].count,
          updateSuccessful: true
        }
      });
    } catch (error) {
      console.error('❌ [ItineraryAdmin] Error:', error);
      next(error);
    }
  }
}
