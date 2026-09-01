import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';

/**
 * Quick debug endpoint to check itinerary data
 */
export async function debugItineraryData(req: Request, res: Response, next: NextFunction) {
  try {
    const { packageId } = req.params;
    
    if (!packageId) {
      res.status(400).json({
        success: false,
        error: 'packageId is required'
      });
      return;
    }

    // Query raw SQL to see exactly what's in the database
    const result = await AppDataSource.query(`
      SELECT 
        id,
        package_id,
        day_number,
        title,
        description,
        activities,
        meals,
        en_title,
        en_description,
        en_activities,
        en_meals,
        ar_title,
        ar_description,
        ar_activities,
        ar_meals,
        es_title,
        es_description,
        es_activities,
        es_meals,
        de_title,
        de_description,
        de_activities,
        de_meals,
        ru_title,
        ru_description,
        ru_activities,
        ru_meals
      FROM itineraries
      WHERE package_id = $1
      ORDER BY day_number ASC
    `, [packageId]);

    console.log('🔍 [DEBUG] Raw SQL Query Result:', {
      packageId,
      count: result.length,
      firstItem: result[0] || null,
      allItems: result
    });

    res.status(200).json({
      success: true,
      packageId,
      count: result.length,
      data: result,
      analysis: {
        hasTranslations: result.length > 0 && (
          result[0].es_title || result[0].ar_title || result[0].de_title || result[0].ru_title
        ),
        emptyFields: result.length > 0 ? {
          es_title: !result[0].es_title,
          es_description: !result[0].es_description,
          es_activities: !result[0].es_activities,
          es_meals: !result[0].es_meals,
          ar_title: !result[0].ar_title,
          de_title: !result[0].de_title,
          ru_title: !result[0].ru_title
        } : {}
      }
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error);
    next(error);
  }
}
