import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/SettingsService.js';
import { AppError } from '../utils/errors.js';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * Get all settings
   */
  async getAllSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.settingsService.getAllSettings();
      
      res.status(200).json({
        success: true,
        data: settings,
        message: 'Settings retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific setting by key
   */
  async getSettingByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      
      if (!key) {
        throw new AppError(400, 'Setting key is required');
      }

      const setting = await this.settingsService.getSetting(key);
      
      if (!setting) {
        throw new AppError(404, `Setting with key "${key}" not found`);
      }

      res.status(200).json({
        success: true,
        data: setting,
        message: 'Setting retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a single setting
   */
  async updateSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const { value, type = 'string', description } = req.body;

      if (!key) {
        throw new AppError(400, 'Setting key is required');
      }

      if (value === undefined || value === null) {
        throw new AppError(400, 'Setting value is required');
      }

      const updated = await this.settingsService.updateSetting(
        key,
        value,
        type,
        description
      );

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Setting updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update multiple settings at once
   */
  async updateMultipleSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;

      if (!Array.isArray(settings) || settings.length === 0) {
        throw new AppError(400, 'Settings array is required and must not be empty');
      }

      // Validate each setting
      for (const setting of settings) {
        if (!setting.key || setting.value === undefined) {
          throw new AppError(400, 'Each setting must have key and value');
        }
      }

      const updated = await this.settingsService.updateMultipleSettings(settings);

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get settings grouped by category
   */
  async getSettingsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;

      if (!category) {
        throw new AppError(400, 'Category is required');
      }

      const settings = await this.settingsService.getSettingsByCategory(category);

      res.status(200).json({
        success: true,
        data: settings,
        category,
        message: 'Category settings retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { keys } = req.body;

      if (!Array.isArray(keys) || keys.length === 0) {
        throw new AppError(400, 'Keys array is required for reset');
      }

      const reset = await this.settingsService.resetSettings(keys);

      res.status(200).json({
        success: true,
        data: reset,
        message: 'Settings reset to defaults successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.settingsService.testEmailConfiguration();

      res.status(200).json({
        success: result.success,
        data: result,
        message: result.success 
          ? 'Email configuration test successful' 
          : 'Email configuration test failed'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system health info
   */
  async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await this.settingsService.getSystemHealth();

      res.status(200).json({
        success: true,
        data: health,
        message: 'System health retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SettingsController;
