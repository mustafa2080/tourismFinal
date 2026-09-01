import { AppDataSource } from '../config/connection.js';
import { logger } from '../middleware/logger.js';

async function migrate() {
  try {
    logger.info('Starting database migrations...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Run migrations
    await AppDataSource.runMigrations();

    logger.info('✅ Migrations completed successfully');

    await AppDataSource.destroy();
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
