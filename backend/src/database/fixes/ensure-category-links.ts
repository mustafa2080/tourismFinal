import { AppDataSource } from '../../config/connection.js';
import { Package } from '../../entities/Package.js';
import { Category } from '../../entities/Category.js';
import { Repository } from 'typeorm';

export async function ensureCategoryLinks() {
  console.log('\n🔄 [ensureCategoryLinks] Ensuring all packages have category links...\n');

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    const packageRepo = queryRunner.manager.getRepository(Package);
    const categoryRepo = queryRunner.manager.getRepository(Category);

    // Get all packages that have packages linked via junction table
    const linkedCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM package_categories
    `);
    
    console.log(`📊 Current junction table entries: ${linkedCount[0]?.count || 0}`);

    // Link packages via direct SQL query (more efficient)
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

    console.log(`✅ Inserted new links (if any)`);

    // Get category counts
    const categoryCounts = await queryRunner.query(`
      SELECT c.id, c.name, COUNT(pc.package_id) as linked_count
      FROM categories c
      LEFT JOIN package_categories pc ON c.id = pc.category_id
      GROUP BY c.id, c.name
      ORDER BY linked_count DESC
    `);

    console.log(`\n📂 Category Package Counts:`);
    for (const cat of categoryCounts) {
      console.log(`   • ${cat.name}: ${cat.linked_count} packages`);
    }

    // Get packages without any category
    const packagesWithoutCategory = await queryRunner.query(`
      SELECT p.id, p.title
      FROM packages p
      WHERE p.category_id IS NULL
    `);

    if (packagesWithoutCategory.length > 0) {
      console.log(`\n⚠️  Found ${packagesWithoutCategory.length} packages without category_id`);
      
      // Assign them to first available category
      const firstCategory = await categoryRepo.findOne({ where: {} });
      if (firstCategory) {
        for (const pkg of packagesWithoutCategory) {
          await queryRunner.query(`
            INSERT INTO package_categories (package_id, category_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [pkg.id, firstCategory.id]);
        }
        console.log(`✅ Assigned ${packagesWithoutCategory.length} packages to default category`);
      }
    }

    // Final verification
    const finalCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM package_categories
    `);
    
    console.log(`\n✅ Final junction table entries: ${finalCount[0]?.count || 0}\n`);

  } catch (error) {
    console.error('❌ Error ensuring category links:', error);
  }
}
