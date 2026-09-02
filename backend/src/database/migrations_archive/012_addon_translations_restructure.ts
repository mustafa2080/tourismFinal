import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddonTranslationsRestructure1763311200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to package_addon_translations
    await queryRunner.query(`
      ALTER TABLE package_addon_translations
      ADD COLUMN IF NOT EXISTS package_name VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS short_description VARCHAR(500) DEFAULT '',
      ADD COLUMN IF NOT EXISTS detailed_description TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS whats_included TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS whats_excluded TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS daily_itinerary TEXT DEFAULT NULL;
    `);

    // Remove old columns from package_addons
    await queryRunner.query(`
      ALTER TABLE package_addons
      DROP COLUMN IF EXISTS name,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS price,
      DROP COLUMN IF EXISTS category;
    `);

    // Update constraints
    await queryRunner.query(`
      ALTER TABLE package_addon_translations
      ALTER COLUMN package_name SET NOT NULL,
      ALTER COLUMN short_description SET NOT NULL,
      ALTER COLUMN detailed_description SET NOT NULL;
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_package_addon_translations_addon_id 
      ON package_addon_translations(addon_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_package_addon_translations_language 
      ON package_addon_translations(language);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_package_addon_translations_addon_language 
      ON package_addon_translations(addon_id, language);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse migrations
    await queryRunner.query(`
      ALTER TABLE package_addon_translations
      DROP COLUMN IF EXISTS package_name,
      DROP COLUMN IF EXISTS short_description,
      DROP COLUMN IF EXISTS detailed_description,
      DROP COLUMN IF EXISTS whats_included,
      DROP COLUMN IF EXISTS whats_excluded,
      DROP COLUMN IF EXISTS daily_itinerary;
    `);

    await queryRunner.query(`
      ALTER TABLE package_addons
      ADD COLUMN IF NOT EXISTS name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'addon';
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_package_addon_translations_addon_id;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_package_addon_translations_language;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_package_addon_translations_addon_language;
    `);
  }
}
