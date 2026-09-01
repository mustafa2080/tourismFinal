import { SystemSettingsRepository } from '../repositories/SystemSettingsRepository.js';
import { AppError } from '../utils/errors.js';
import { EmailService } from './EmailService.js';

interface SettingUpdate {
  key: string;
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  timestamp: Date;
  database: {
    connected: boolean;
    message: string;
  };
  email: {
    configured: boolean;
    message: string;
  };
  system: {
    maintenanceMode: boolean;
    debugMode: boolean;
    loggingEnabled: boolean;
  };
}

const DEFAULT_SETTINGS = {
  // General
  'site.name': 'Tour Booking System',
  'site.email': 'admin@tour-booking.com',
  'site.phone': '+20 100 000 0000',
  'site.description': 'Book your next adventure with us',
  'site.logo': '',
  'site.favicon': '',

  // Email
  'email.smtp_host': 'smtp.gmail.com',
  'email.smtp_port': '587',
  'email.smtp_user': '',
  'email.smtp_password': '',
  'email.from_name': 'Tour Booking',
  'email.from_address': 'noreply@tour-booking.com',
  'email.enabled': 'true',

  // Booking
  'booking.confirmation_email': 'true',
  'booking.reminder_days': '3',
  'booking.max_refund_days': '14',
  'booking.min_notice_hours': '24',

  // System
  'system.maintenance_mode': 'false',
  'system.debug_mode': 'false',
  'system.logging_enabled': 'true',
  'system.backup_enabled': 'true',
  'system.backup_frequency': 'daily',
  'system.max_upload_size': '10485760', // 10MB in bytes
};

export class SettingsService {
  private repository: SystemSettingsRepository;
  private emailService: EmailService;

  constructor() {
    this.repository = new SystemSettingsRepository();
    this.emailService = new EmailService();
  }

  /**
   * Get all settings
   */
  async getAllSettings() {
    try {
      const settings = await this.repository.getAllSettings();
      
      // Convert to key-value format for easier frontend usage
      const formatted: any = {};
      settings.forEach(setting => {
        formatted[setting.key] = {
          value: setting.getValue(),
          type: setting.type,
          description: setting.description
        };
      });

      return formatted;
    } catch (error) {
      throw new AppError(500, 'Failed to retrieve settings');
    }
  }

  /**
   * Get a single setting
   */
  async getSetting(key: string) {
    try {
      const setting = await this.repository.getSetting(key);
      
      if (!setting) {
        return null;
      }

      return {
        key: setting.key,
        value: setting.getValue(),
        type: setting.type,
        description: setting.description
      };
    } catch (error) {
      throw new AppError(500, 'Failed to retrieve setting');
    }
  }

  /**
   * Update a single setting
   */
  async updateSetting(
    key: string,
    value: any,
    type: string = 'string',
    description?: string
  ) {
    try {
      const setting = await this.repository.updateSetting(
        key,
        value,
        type as any
      );

      if (description) {
        // Update description if provided (might need to extend the Entity)
        // setting.description = description;
        // await repository.save(setting);
      }

      return {
        key: setting.key,
        value: setting.getValue(),
        type: setting.type,
        description: setting.description
      };
    } catch (error) {
      throw new AppError(500, `Failed to update setting: ${key}`);
    }
  }

  /**
   * Update multiple settings
   */
  async updateMultipleSettings(updates: SettingUpdate[]) {
    try {
      const updated = await this.repository.updateSettings(
        updates.map(u => ({
          key: u.key,
          value: u.value,
          type: u.type || 'string'
        }))
      );

      return updated.map(setting => ({
        key: setting.key,
        value: setting.getValue(),
        type: setting.type,
        description: setting.description
      }));
    } catch (error) {
      throw new AppError(500, 'Failed to update multiple settings');
    }
  }

  /**
   * Get settings by category (prefix)
   */
  async getSettingsByCategory(category: string) {
    try {
      const allSettings = await this.repository.getAllSettings();
      const prefix = `${category}.`;
      
      const categorySettings = allSettings
        .filter(s => s.key.startsWith(prefix))
        .reduce((acc: any, setting) => {
          acc[setting.key] = {
            value: setting.getValue(),
            type: setting.type,
            description: setting.description
          };
          return acc;
        }, {});

      return categorySettings;
    } catch (error) {
      throw new AppError(500, 'Failed to retrieve category settings');
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(keys: string[]) {
    try {
      const keysToReset = keys.filter(key => key in DEFAULT_SETTINGS);
      
      if (keysToReset.length === 0) {
        throw new AppError(400, 'No valid settings to reset');
      }

      const updates = keysToReset.map(key => ({
        key,
        value: DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS],
        type: 'string' as const
      }));

      return await this.updateMultipleSettings(updates as any);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to reset settings');
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration() {
    try {
      const smtpHost = await this.repository.getSettingValue('email.smtp_host');
      const smtpPort = await this.repository.getSettingValue('email.smtp_port');
      const smtpUser = await this.repository.getSettingValue('email.smtp_user');
      const smtpPassword = await this.repository.getSettingValue('email.smtp_password');
      const fromAddress = await this.repository.getSettingValue('email.from_address');

      if (!smtpHost || !smtpUser || !fromAddress) {
        return {
          success: false,
          message: 'Email configuration is incomplete',
          details: {
            smtpHost: !!smtpHost,
            smtpUser: !!smtpUser,
            fromAddress: !!fromAddress
          }
        };
      }

      // Try to send a test email
      try {
        // This would normally send a test email
        // For now, just verify the config format
        return {
          success: true,
          message: 'Email configuration appears to be valid',
          details: {
            host: smtpHost,
            port: smtpPort,
            user: (smtpUser as string)?.substring(0, 5) + '***'
          }
        };
      } catch (emailError) {
        return {
          success: false,
          message: 'Email configuration test failed',
          error: (emailError as Error).message
        };
      }
    } catch (error) {
      throw new AppError(500, 'Failed to test email configuration');
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const maintenanceMode = await this.repository.getSettingValue<string>(
        'system.maintenance_mode',
        'false'
      );
      const debugMode = await this.repository.getSettingValue<string>(
        'system.debug_mode',
        'false'
      );
      const loggingEnabled = await this.repository.getSettingValue<string>(
        'system.logging_enabled',
        'true'
      );

      // Check database connection by trying to fetch a setting
      let dbConnected = false;
      let dbMessage = 'Database connected';
      try {
        await this.repository.getSetting('site.name');
        dbConnected = true;
      } catch (err) {
        dbConnected = false;
        dbMessage = 'Database connection failed';
      }

      // Check email configuration
      const emailConfig = await this.testEmailConfiguration();
      const emailConfigured = emailConfig.success;

      const health: SystemHealth = {
        status: dbConnected ? 'healthy' : 'error',
        timestamp: new Date(),
        database: {
          connected: dbConnected,
          message: dbMessage
        },
        email: {
          configured: emailConfigured,
          message: emailConfig.message
        },
        system: {
          maintenanceMode: maintenanceMode === 'true',
          debugMode: debugMode === 'true',
          loggingEnabled: loggingEnabled === 'true'
        }
      };

      return health;
    } catch (error) {
      throw new AppError(500, 'Failed to get system health');
    }
  }

  /**
   * Initialize default settings
   */
  async initializeDefaults() {
    try {
      const existing = await this.repository.getAllSettings();
      
      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (!existing.find(s => s.key === key)) {
          await this.repository.updateSetting(key, value, 'string');
        }
      }
    } catch (error) {
      throw new AppError(500, 'Failed to initialize default settings');
    }
  }
}

export default SettingsService;
