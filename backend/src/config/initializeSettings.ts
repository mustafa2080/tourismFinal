// Utility script to verify and initialize system_settings table
// Run this at startup or as needed

import { AppDataSource } from '../config/connection.js';
import { SystemSettings } from '../entities/SystemSettings.js';
import { SettingsService } from '../services/SettingsService.js';

export async function initializeSystemSettings() {
  try {
    console.log('🔧 Initializing System Settings Table...');

    // Ensure database is connected
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get the query runner to check if table exists
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      // Check if table exists
      const tableExists = await queryRunner.hasTable('system_settings');
      
      if (!tableExists) {
        console.log('  📝 Creating system_settings table...');
        await queryRunner.createTable(
          new (require('typeorm').Table)({
            name: 'system_settings',
            columns: [
              {
                name: 'key',
                type: 'varchar',
                length: '255',
                isPrimary: true,
                isNullable: false,
              },
              {
                name: 'value',
                type: 'text',
                isNullable: true,
              },
              {
                name: 'type',
                type: 'varchar',
                length: '50',
                default: "'string'",
                isNullable: false,
              },
              {
                name: 'description',
                type: 'text',
                isNullable: true,
              },
              {
                name: 'created_at',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
                isNullable: false,
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
                isNullable: false,
              },
            ],
            indices: [
              {
                columnNames: ['type'],
              },
              {
                columnNames: ['created_at'],
              },
            ],
          })
        );
        console.log('  ✅ system_settings table created');
      } else {
        console.log('  ✅ system_settings table already exists');
      }

      // Initialize default settings
      const settingsService = new SettingsService();
      await settingsService.initializeDefaults();
      console.log('  ✅ Default settings initialized');

      console.log('🎉 System settings ready!');
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Failed to initialize system settings:', error);
    throw error;
  }
}

export default initializeSystemSettings;
