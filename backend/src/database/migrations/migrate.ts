import 'dotenv/config';
import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'tour',
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, '../entities/**/*.ts')],
  migrations: [path.join(__dirname, './**/*.ts')],
});

async function runMigrations() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('🔄 Running SQL migrations...');
    
    // Array of migration files to run
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_expand_avatar_column.sql',
      '003_add_system_settings.sql',
      '004_add_image_storage.sql',
      '005_add_package_addons.sql',
      '006_add_refund_fields.sql',
      '007_add_refund_fk.sql',
      '008_add_addon_translations.sql',
      '009_package_addons_translation_structure.sql',
      '010_package_translations_enhanced.sql',
      '011_addon_translations_enhanced.sql',
      '012_addon_translations_restructure.sql',
      '013_package_addons_translation_structure.sql',
      '014_add_addon_base_fields.sql',
      '015_add_package_translation_items.sql',
    ];

    for (const file of migrationFiles) {
      try {
        const filePath = path.join(__dirname, file);
        
        try {
          let sql = await fs.readFile(filePath, 'utf-8');
          console.log(`📝 Executing ${file}...`);
          
          // Split by semicolon to run individual statements
          const statements = sql
            .split(';')
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

          for (const statement of statements) {
            try {
              await AppDataSource.query(statement);
            } catch (error: any) {
              // Skip if already exists errors
              if (!error.message?.includes('already exists') && 
                  !error.message?.includes('no schema')) {
                throw error;
              }
            }
          }
          
          console.log(`✅ ${file} completed`);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            console.log(`⏭️  Skipping ${file} (not found)`);
          } else {
            console.error(`❌ Error in ${file}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`❌ Error running ${file}:`, error);
      }
    }

    console.log('✅ Migrations completed');

    // Create users table with all columns
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        avatar VARCHAR(500),
        is_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes (only if not exists)
    try {
      await AppDataSource.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `);
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await AppDataSource.query(`
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
      `);
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    console.log('✅ Users table ensured');

    await AppDataSource.destroy();
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();