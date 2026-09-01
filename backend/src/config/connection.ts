import { DataSource } from 'typeorm';
import databaseConfig from './database.js';

export const AppDataSource = new DataSource(databaseConfig as any);

export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('🔄 Connecting to database...');
      console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
      console.log(`   Port: ${process.env.DB_PORT || 5432}`);
      console.log(`   Database: ${process.env.DB_NAME || 'tour'}`);
      
      console.log('🔄 Initializing database connection...');
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
      console.log('');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('📋 Make sure PostgreSQL is running and database "tour" exists');
    throw error;
  }
}

export async function closeDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
}
