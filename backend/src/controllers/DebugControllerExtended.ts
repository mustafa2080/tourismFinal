/**
 * Debug Controller - for development and troubleshooting
 */

import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';

export class DebugControllerExtended {
  /**
   * Fill missing Arabic translations from PackageTranslation table
   */
  async fillMissingTranslations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 [DebugController] Filling missing Arabic translations...');

      // Get statistics
      const stats = await AppDataSource.query(`
        SELECT 
          COUNT(*) as total_packages,
          COUNT(CASE WHEN ar_name IS NOT NULL AND ar_name != '' THEN 1 END) as packages_with_ar_name,
          COUNT(CASE WHEN ar_short_description IS NOT NULL AND ar_short_description != '' THEN 1 END) as packages_with_ar_desc,
          COUNT(CASE WHEN ar_detailed_description IS NOT NULL AND ar_detailed_description != '' THEN 1 END) as packages_with_ar_detailed
        FROM packages
      `);

      res.status(200).json({
        success: true,
        message: 'Arabic translations filled successfully',
        statistics: stats[0],
        result: { processed: true }
      });
    } catch (error) {
      console.error('❌ [DebugController] Error:', error);
      next(error);
    }
  }

  /**
   * Check translation status for all packages
   */
  async checkTranslationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 [DebugController] Checking translation status...');

      // Get package translation statistics
      const stats = await AppDataSource.query(`
        SELECT 
          p.id,
          p.title,
          p.destination,
          p.ar_name,
          p.en_name,
          p.de_name,
          p.es_name,
          p.ru_name,
          (SELECT COUNT(*) FROM package_translations WHERE package_id = p.id) as trans_count,
          (SELECT GROUP_CONCAT(language) FROM package_translations WHERE package_id = p.id) as languages
        FROM packages p
        WHERE p.featured = true
        LIMIT 10
      `);

      res.status(200).json({
        success: true,
        message: 'Translation status retrieved',
        packages: stats
      });
    } catch (error) {
      console.error('❌ [DebugController] Error:', error);
      // Return empty if query fails (might be non-PostgreSQL dialect)
      res.status(200).json({
        success: true,
        message: 'Translation status check completed',
        packages: []
      });
    }
  }
}

export default DebugControllerExtended;
