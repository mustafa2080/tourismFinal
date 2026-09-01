import { AppDataSource } from './connection.js';
import { logger } from '../middleware/logger.js';

/**
 * Database Performance Optimization
 * Creates indexes on frequently queried columns
 */

export async function createPerformanceIndexes(): Promise<void> {
  try {
    const connection = AppDataSource;

    if (!connection.isInitialized) {
      throw new Error('Database not initialized');
    }

    const queryRunner = connection.createQueryRunner();

    try {
      console.log('🔧 Creating performance indexes...');

      const indexes = [
        // Packages table
        'CREATE INDEX IF NOT EXISTS idx_packages_category_id ON packages(category_id)',
        'CREATE INDEX IF NOT EXISTS idx_packages_price ON packages(base_price)',
        'CREATE INDEX IF NOT EXISTS idx_packages_rating ON packages(rating)',
        'CREATE INDEX IF NOT EXISTS idx_packages_featured ON packages(featured)',
        'CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at)',

        // Bookings table
        'CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id)',
        'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)',
        'CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_bookings_date_start ON bookings(date_start)',

        // Reviews table
        'CREATE INDEX IF NOT EXISTS idx_reviews_package_id ON reviews(package_id)',
        'CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)',

        // Users table
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',

        // Categories table
        'CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)',
        'CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id)',

        // Itineraries
        'CREATE INDEX IF NOT EXISTS idx_itineraries_package_id ON itineraries(package_id)',

        // Wishlist
        'CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_wishlist_package_id ON wishlist(package_id)',

        // Composite indexes for common queries
        'CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_reviews_package_rating ON reviews(package_id, rating)',
        'CREATE INDEX IF NOT EXISTS idx_packages_category_price ON packages(category_id, base_price)',
      ];

      for (const index of indexes) {
        try {
          await queryRunner.query(index);
          console.log(`✅ ${index.split(' ')[3]}`);
        } catch (error: any) {
          if (!error.message.includes('already exists')) {
            logger.warn(`⚠️ Index creation warning:`, error.message);
          }
        }
      }

      console.log('✅ All indexes created successfully');

    } finally {
      await queryRunner.release();
    }

  } catch (error) {
    logger.error('Failed to create performance indexes:', error);
    throw error;
  }
}

/**
 * Get index information
 */
export async function getIndexes(): Promise<any[]> {
  try {
    const connection = AppDataSource;
    const queryRunner = connection.createQueryRunner();

    try {
      const result = await queryRunner.query(`
        SELECT
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `);

      return result;
    } finally {
      await queryRunner.release();
    }

  } catch (error) {
    logger.error('Failed to get indexes:', error);
    return [];
  }
}

/**
 * Analyze tables for query optimization
 */
export async function analyzeTables(): Promise<void> {
  try {
    const connection = AppDataSource;
    const queryRunner = connection.createQueryRunner();

    try {
      const tables = [
        'packages',
        'bookings',
        'reviews',
        'users',
        'categories',
        'itineraries',
        'wishlist'
      ];

      for (const table of tables) {
        await queryRunner.query(`ANALYZE ${table}`);
        console.log(`✅ Analyzed: ${table}`);
      }

    } finally {
      await queryRunner.release();
    }

  } catch (error) {
    logger.error('Failed to analyze tables:', error);
  }
}
