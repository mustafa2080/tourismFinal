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
  synchronize: true,
  logging: false,
  entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
  migrations: [],
  subscribers: [],
};

export default databaseConfig;
