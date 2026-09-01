/**
 * Initialize Category Links
 * Ensures all packages are linked to categories through the package_categories junction table
 */

import { AppDataSource } from './connection.js';

export async function initializeCategoryLinks() {
  try {
    console.log('🔗 Initializing Package-Category Links...');

    if (!AppDataSource.isInitialized) {
      return; // Database not initialized yet
    }

    const queryRunner = AppDataSource.createQueryRunner();

    // Check if junction table exists
    const tableExists = await queryRunner.hasTable('package_categories');
    if (!tableExists) {
      console.log('  ⚠️  package_categories table does not exist yet');
      return;
    }

    // Get current link count
    const currentLinks = await queryRunner.query(`
      SELECT COUNT(*) as count FROM package_categories
    `);
    const linkCount = currentLinks[0]?.count || 0;
    console.log(`  📊 Current links: ${linkCount}`);

    // Link packages via their category_id field
    try {
      const result = await queryRunner.query(`
        INSERT INTO package_categories (package_id, category_id)
        SELECT DISTINCT p.id, p.category_id
        FROM packages p
        WHERE p.category_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM package_categories pc 
            WHERE pc.package_id = p.id AND pc.category_id = p.category_id
          )
        ON CONFLICT DO NOTHING;
      `);

      const newLinks = await queryRunner.query(`
        SELECT COUNT(*) as count FROM package_categories
      `);
      const newLinkCount = newLinks[0]?.count || 0;

      if (newLinkCount > linkCount) {
        console.log(`  ✅ Added ${newLinkCount - linkCount} new package-category links`);
      } else {
        console.log(`  ✅ All packages already linked`);
      }

      // Show category counts
      const categoryCounts = await queryRunner.query(`
        SELECT c.id, c.name, COUNT(pc.package_id) as linked_count
        FROM categories c
        LEFT JOIN package_categories pc ON c.id = pc.category_id
        GROUP BY c.id, c.name
        ORDER BY linked_count DESC
        LIMIT 5
      `);

      if (categoryCounts.length > 0) {
        console.log(`  📂 Top categories:`);
        for (const cat of categoryCounts) {
          console.log(`     • ${cat.name}: ${cat.linked_count} packages`);
        }
      }
    } catch (error: any) {
      // Silently handle constraint violations
      if (!error.message.includes('already exists')) {
        console.warn(`  ⚠️  Could not create links:`, error.message.split('\n')[0]);
      }
    }

    console.log('  ✅ Category links initialization complete');
  } catch (error) {
    console.warn('  ⚠️  Warning: Category links initialization failed:', error);
    // Don't throw - let server continue even if this fails
  }
}
