import { AppDataSource } from '../../config/connection.js';
import { Package } from '../../entities/Package.js';
import { Category } from '../../entities/Category.js';

/**
 * Link all packages to categories
 * This script ensures that:
 * 1. All packages have at least one category linked
 * 2. Uses the package.category_id field to link to categories
 * 3. Creates default categories if needed
 */
export async function linkPackagesToCategories() {
  const connection = AppDataSource;
  
  if (!connection.isInitialized) {
    await connection.initialize();
  }

  try {
    console.log('🔄 [linkPackagesToCategories] Starting package-category linking process...');

    const packageRepo = connection.getRepository(Package);
    const categoryRepo = connection.getRepository(Category);

    // Get all packages
    const packages = await packageRepo.find();
    console.log(`📦 Found ${packages.length} packages`);

    // Get all categories
    const categories = await categoryRepo.find();
    console.log(`📂 Found ${categories.length} categories`);

    if (categories.length === 0) {
      console.warn('⚠️ No categories found! Creating default categories...');
      
      const defaultCategories = [
        { name: 'Adventure', description: 'Thrilling adventure trips' },
        { name: 'Beach', description: 'Relaxing beach getaways' },
        { name: 'Mountain', description: 'Mountain hiking and trekking' },
        { name: 'Cultural', description: 'Cultural and historical tours' },
        { name: 'Family', description: 'Family-friendly trips' },
      ];

      for (const catData of defaultCategories) {
        const newCategory = categoryRepo.create(catData);
        await categoryRepo.save(newCategory);
        console.log(`✅ Created category: ${catData.name}`);
      }
    }

    // Refresh categories list
    const updatedCategories = await categoryRepo.find();
    console.log(`📂 Now have ${updatedCategories.length} categories`);

    // Link packages to categories
    let linked = 0;
    let skipped = 0;

    for (const pkg of packages) {
      // Get the category from package.category_id
      if (pkg.category_id) {
        const category = updatedCategories.find(c => c.id === pkg.category_id);
        
        if (category) {
          // Check if already linked
          if (!pkg.categories) {
            pkg.categories = [];
          }

          const isAlreadyLinked = pkg.categories.some(c => c.id === category.id);
          
          if (!isAlreadyLinked) {
            pkg.categories.push(category);
            await packageRepo.save(pkg);
            linked++;
            console.log(`✅ Linked package "${pkg.title}" to category "${category.name}"`);
          } else {
            skipped++;
          }
        } else {
          console.warn(`⚠️ Package "${pkg.title}" has category_id ${pkg.category_id} but category not found`);
        }
      } else {
        // Package doesn't have a category_id, assign to a default one
        const defaultCategory = updatedCategories[0];
        if (defaultCategory) {
          if (!pkg.categories) {
            pkg.categories = [];
          }

          const isAlreadyLinked = pkg.categories.some(c => c.id === defaultCategory.id);
          
          if (!isAlreadyLinked) {
            pkg.categories.push(defaultCategory);
            await packageRepo.save(pkg);
            linked++;
            console.log(`✅ Linked package "${pkg.title}" to default category "${defaultCategory.name}"`);
          } else {
            skipped++;
          }
        }
      }
    }

    console.log(`\n📊 Linking Summary:`);
    console.log(`   ✅ Successfully linked: ${linked}`);
    console.log(`   ⏭️  Already linked: ${skipped}`);

    // Verify the linking
    console.log('\n🔍 Verifying category package counts...');
    for (const category of updatedCategories) {
      const categoryPackages = await packageRepo
        .createQueryBuilder('package')
        .innerJoinAndSelect(
          'package.categories',
          'cat',
          'cat.id = :categoryId',
          { categoryId: category.id }
        )
        .getMany();

      console.log(`   📦 ${category.name}: ${categoryPackages.length} packages`);
    }

    console.log('\n✅ Package-category linking completed successfully!');
  } catch (error) {
    console.error('❌ Error during linking:', error);
    throw error;
  }
}

// Run if called directly
if (process.argv[1].includes('link-packages-to-categories')) {
  linkPackagesToCategories()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}
