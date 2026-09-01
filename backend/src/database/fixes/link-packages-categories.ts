/**
 * Script to link existing packages with categories
 * This fixes the issue where packages have no categories in package_categories table
 */

import { AppDataSource } from '../../config/connection.js';
import { Package } from '../../entities/Package.js';
import { Category } from '../../entities/Category.js';

export async function linkPackagesToCategories() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    console.log('🔄 [LinkPackages] Starting to link packages with categories...');

    const packageRepo = AppDataSource.getRepository(Package);
    const categoryRepo = AppDataSource.getRepository(Category);

    // Get all packages
    const allPackages = await packageRepo.find({ relations: ['categories'] });
    console.log(`📦 [LinkPackages] Found ${allPackages.length} total packages`);

    // Define category mappings based on package destinations/trip types
    const categoryMappings: { [key: string]: string[] } = {
      'Adventure': ['Mountain', 'Adventure'],
      'Beach': ['Beach', 'Honeymoon'],
      'Cultural': ['Cultures'],
      'Honeymoon': ['Honeymoon', 'Beach'],
      'Family': ['Family', 'Beach'],
      'Mountain': ['Mountain', 'Adventure'],
      'Tokyo': ['Cultures', 'Adventure'],
      'Paris': ['Cultures', 'Honeymoon'],
      'Dubai': ['Beach', 'Family'],
    };

    let linkedCount = 0;
    let skippedCount = 0;

    for (const pkg of allPackages) {
      // Skip if already has categories
      if (pkg.categories && pkg.categories.length > 0) {
        console.log(`⏭️  [LinkPackages] Package "${pkg.title}" already has ${pkg.categories.length} categories, skipping...`);
        skippedCount++;
        continue;
      }

      try {
        // Find matching categories based on package title or destination
        const categoriesToLink: Category[] = [];
        const categoryNames = new Set<string>();

        // Check if title or destination contains known keywords
        const searchText = `${pkg.title} ${pkg.destination}`.toLowerCase();
        
        for (const [keyword, categoryNameList] of Object.entries(categoryMappings)) {
          if (searchText.includes(keyword.toLowerCase())) {
            categoryNameList.forEach(name => categoryNames.add(name));
          }
        }

        // If no categories found by keyword, try default mapping
        if (categoryNames.size === 0) {
          // Default: link all packages to a default category or based on trip type
          if (pkg.trip_type) {
            const tripTypeMap: { [key: string]: string } = {
              'adventure': 'Adventure',
              'beach': 'Beach',
              'cultural': 'Cultures',
              'honeymoon': 'Honeymoon',
              'family': 'Family',
            };
            const catName = tripTypeMap[pkg.trip_type.toLowerCase()] || 'Adventure';
            categoryNames.add(catName);
          } else {
            // Fallback to first category (usually Adventure)
            categoryNames.add('Adventure');
          }
        }

        // Fetch the category objects
        for (const catName of categoryNames) {
          const category = await categoryRepo.findOne({ where: { name: catName } });
          if (category) {
            categoriesToLink.push(category);
          }
        }

        if (categoriesToLink.length > 0) {
          pkg.categories = categoriesToLink;
          await packageRepo.save(pkg);
          console.log(`✅ [LinkPackages] Linked package "${pkg.title}" to ${categoriesToLink.length} categories: ${categoriesToLink.map(c => c.name).join(', ')}`);
          linkedCount++;
        } else {
          console.warn(`⚠️  [LinkPackages] Could not find categories for package "${pkg.title}"`);
        }
      } catch (error) {
        console.error(`❌ [LinkPackages] Error linking package "${pkg.title}":`, error);
      }
    }

    console.log(`\n📊 [LinkPackages] Summary:`);
    console.log(`   ✅ Linked: ${linkedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📦 Total processed: ${linkedCount + skippedCount}`);

    return { linkedCount, skippedCount };
  } catch (error) {
    console.error('❌ [LinkPackages] Fatal error:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  linkPackagesToCategories()
    .then(() => {
      console.log('\n✅ Category linking complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Category linking failed:', error);
      process.exit(1);
    });
}
