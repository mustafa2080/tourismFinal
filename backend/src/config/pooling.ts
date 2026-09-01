import 'dotenv/config';
import { Pool, PoolClient } from 'pg';

/**
 * Database Connection Pooling Configuration
 * Optimizes performance for high-traffic scenarios
 */

export class DatabasePool {
  private static instance: Pool;

  /**
   * Initialize the connection pool with optimal settings
   */
  static getInstance(): Pool {
    if (!this.instance) {
      this.instance = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'tour',
        
        // ⚡ PERFORMANCE SETTINGS
        max: parseInt(process.env.DB_POOL_SIZE || '30'), // Max concurrent connections
        min: parseInt(process.env.DB_POOL_MIN || '10'), // Min idle connections
        idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
        connectionTimeoutMillis: 5000, // Connection attempt timeout
        
        // Statement caching
        statement_cache_size: 100,
      });

      // ⚠️ Handle pool errors
      this.instance.on('error', (err: Error) => {
        console.error('❌ Unexpected error on idle client:', err);
      });

      // Monitor pool
      setInterval(() => {
        console.log(`📊 [DB Pool] Idle: ${this.instance.idleCount}, Waiting: ${(this.instance as any).waitingCount || 0}`);
      }, 60000); // Every minute

      console.log('✅ Database Connection Pool initialized');
      console.log(`   Max connections: ${this.instance.max}`);
      console.log(`   Min connections: ${this.instance.min}`);
    }

    return this.instance;
  }

  /**
   * Execute a query using the pool
   */
  static async query<T = any>(
    text: string,
    values?: any[]
  ): Promise<{ rows: T[]; rowCount: number }> {
    const pool = this.getInstance();
    const result = await pool.query(text, values);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
    };
  }

  /**
   * Get a client for transaction management
   */
  static async getClient(): Promise<PoolClient> {
    const pool = this.getInstance();
    return pool.connect();
  }

  /**
   * Close all connections in the pool
   */
  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.end();
      console.log('✅ Database Connection Pool closed');
    }
  }
}
