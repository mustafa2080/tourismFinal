import { AppDataSource } from '../../config/connection.js';
import fs from 'fs';
import path from 'path';

/**
 * Script to populate package_categories table
 * Run with: npx ts-node src/database/fixes/populate-categories.ts
 */

async function populatePackageCategories() {
  try {
    console.log('🔄 [populatePackageCategories] Starting...');
    
    // Ensure database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      // Step 1: Verify current state
      const packageCount = await queryRunner.query('SELECT COUNT(*) FROM packages');
      const categoryCount = await queryRunner.query('SELECT COUNT(*) FROM categories');
      const linkCount = await queryRunner.query('SELECT COUNT(*) FROM package_categories');

      console.log(`\n📊 Current State:`);
      console.log(`   Packages: ${packageCount[0].count}`);
      console.log(`   Categories: ${categoryCount[0].count}`);
      console.log(`   Links: ${linkCount[0].count}`);

      // Step 2: Get all packages and categories
      const packages = await queryRunner.query('SELECT id, title, destination, trip_type FROM packages ORDER BY created_at DESC');
      const categories = await queryRunner.query('SELECT id, name, slug FROM categories');

      console.log(`\n📂 Categories found:`, categories.map((c: any) => c.name).join(', '));

      if (categories.length === 0) {
        throw new Error('No categories found in database. Please create categories first.');
      }

      // Step 3: Create mapping logic
      const mapPackageToCategories = (pkg: any, cats: any[]): string[] => {
        const categoryIds: string[] = [];
        const title = (pkg.title || '').toLowerCase();
        const destination = (pkg.destination || '').toLowerCase();
        const tripType = (pkg.trip_type || '').toLowerCase();

        // Adventure keywords
        if (title.includes('balloon') || title.includes('adventure') || title.includes('trekking') || 
            title.includes('safari') || title.includes('expedition') || destination.includes('safari')) {
          const cat = cats.find((c: any) => c.name === 'Adventure');
          if (cat && !categoryIds.includes(cat.id)) categoryIds.push(cat.id);
        }

        // Beach keywords
        if (title.includes('beach') || title.includes('coastal') || title.includes('island') || 
            destination.includes('beach') || destination.includes('dubai') || destination.includes('maldives') ||
            destination.includes('bali') || destination.includes('caribbean')) {
          const cat = cats.find((c: any) => c.name === 'Beach');
          if (cat && !categoryIds.includes(cat.id)) categoryIds.push(cat.id);
        }

        // Cultures keywords
        if (title.includes('cultural') || title.includes('historical') || title.includes('heritage') ||
            destination.includes('tokyo') || destination.includes('paris') || destination.includes('egypt') ||
            destination.includes('rome') || destination.includes('bangkok') || destination.includes('istanbul')) {
          const cat = cats.find((c: any) => c.name === 'Cultures');
          if (cat && !categoryIds.includes(cat.id)) categoryIds.push(cat.id);
        }

        // Honeymoon keywords
        if (title.includes('honeymoon') || title.includes('romance') || title.includes('romantic') ||
            tripType.includes('honeymoon')) {
          const cat = cats.find((c: any) => c.name === 'Honeymoon');
          if (cat && !categoryIds.includes(cat.id)) categoryIds.push(cat.id);
        }

        // Family keywords
        if (title.includes('family') || title.includes('kids') || title.includes('children') ||
            tripType.includes('family')) {
          const cat = cats.find((c: any) => c.name === 'Family');
          if (cat && !categoryIds.includes(cat.id)) categoryIds.push(cat.id);
        }

        // Mountain keywords
        if (title.includes('mountain') || title.includes('hiking') || title.includes('alpine') ||
            title.includes('ski') || destination.includes('mountain') || destination.includes('alps') ||
            destination.includes('nepal') || destination.includes('switzerland')) {
          const cat = cats.find((c: any) => c.name === 'Mountain');
          if (cat && !categoryIds.includes(cat.id)) categoryIds.push(cat.id);
        }

        // Default to Adventure if no category matched
        if (categoryIds.length === 0) {
          const defaultCat = cats.find((c: any) => c.name === 'Adventure');
          if (defaultCat) categoryIds.push(defaultCat.id);
        }

        return categoryIds;
      };

      // Step 4: Link packages to categories
      let linksAdded = 0;
      let packagesProcessed = 0;

      for (const pkg of packages) {
        const categoryIds = mapPackageToCategories(pkg, categories);
        
        for (const categoryId of categoryIds) {
          try {
            // Check if link already exists
            const existing = await queryRunner.query(
              'SELECT 1 FROM package_categories WHERE package_id = $1 AND category_id = $2',
              [pkg.id, categoryId]
            );

            if (existing.length === 0) {
              await queryRunner.query(
                'INSERT INTO package_categories (package_id, category_id) VALUES ($1, $2)',
                [pkg.id, categoryId]
              );
              linksAdded++;
            }
          } catch (err) {
            console.warn(`   ⚠️ Failed to link package ${pkg.title} to category:`, err);
          }
        }
        
        packagesProcessed++;
        if (packagesProcessed % 10 === 0) {
          console.log(`   📦 Processed ${packagesProcessed}/${packages.length} packages...`);
        }
      }

      console.log(`\n✅ Linking complete!`);
      console.log(`   Packages processed: ${packagesProcessed}`);
      console.log(`   New links created: ${linksAdded}`);

      // Step 5: Verify results
      const categoriesWithCounts = await queryRunner.query(`
        SELECT 
          c.name,
          COUNT(DISTINCT pc.package_id) as package_count
        FROM categories c
        LEFT JOIN package_categories pc ON c.id = pc.category_id
        GROUP BY c.id, c.name
        ORDER BY package_count DESC, c.name
      `);

      console.log(`\n📊 Final breakdown by category:`);
      categoriesWithCounts.forEach((row: any) => {
        console.log(`   ${row.name}: ${row.package_count} packages`);
      });

      const finalLinkCount = await queryRunner.query('SELECT COUNT(*) FROM package_categories');
      console.log(`\n📊 Total category links: ${finalLinkCount[0].count}`);

    } finally {
      await queryRunner.release();
    }

    console.log(`\n✅ [populatePackageCategories] Completed successfully!`);
  } catch (error) {
    console.error('❌ [populatePackageCategories] Error:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
populatePackageCategories().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
