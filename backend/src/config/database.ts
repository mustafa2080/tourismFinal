import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const databaseConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'tour',
  // 🔐 SECURITY: synchronize auto-alters the live schema to match the
  // entities on every boot - including on production. That risks silent
  // data loss if an entity and the real table ever drift apart. Schema
  // changes now go through migrations (see src/database/migrations) and
  // are applied explicitly via `npm run migrate`, never automatically.
  synchronize: false,
  migrationsRun: false,
  logging: false,
  entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../database/migrations/*.{ts,js}')],
  subscribers: [],
};

export default databaseConfig;
