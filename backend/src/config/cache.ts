import { createClient } from 'redis';
import { logger } from '../middleware/logger.js';

/**
 * Redis Cache Manager
 * Handles caching for frequently accessed data
 */

export class CacheManager {
  private static instance: CacheManager;
  private client: ReturnType<typeof createClient>;
  private isConnected = false;
  private isDisabled = process.env.REDIS_DISABLED === 'true';

  private constructor() {
    if (this.isDisabled) {
      console.log('⏭️ Redis disabled - caching skipped');
      this.isConnected = false;
      return;
    }

    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            return new Error('Max retries exceeded');
          }
          return retries * 100;
        },
      },
      password: process.env.REDIS_PASSWORD,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err: Error) => {
      this.isConnected = false;
      logger.error('❌ Redis error:', err);
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  static getInstance(): CacheManager {
    if (!this.instance) {
      this.instance = new CacheManager();
    }
    return this.instance;
  }

  async connect(): Promise<void> {
    if (this.isDisabled) {
      return;
    }
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  /**
   * Set cache with TTL (seconds)
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    if (this.isDisabled) {
      return;
    }
    try {
      if (!this.isConnected) await this.connect();
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
    } catch (error) {
      logger.warn(`Cache set failed for key ${key}:`, error);
    }
  }

  /**
   * Get cache value
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (this.isDisabled) {
      return null;
    }
    try {
      if (!this.isConnected) await this.connect();
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.warn(`Cache get failed for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string): Promise<void> {
    if (this.isDisabled) {
      return;
    }
    try {
      if (!this.isConnected) await this.connect();
      await this.client.del(key);
    } catch (error) {
      logger.warn(`Cache delete failed for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys (pattern)
   */
  async deletePattern(pattern: string): Promise<void> {
    if (this.isDisabled) {
      return;
    }
    try {
      if (!this.isConnected) await this.connect();
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.warn(`Cache pattern delete failed for ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (this.isDisabled) {
      return false;
    }
    try {
      if (!this.isConnected) await this.connect();
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      logger.warn(`Cache exists check failed for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    if (this.isDisabled) {
      return 0;
    }
    try {
      if (!this.isConnected) await this.connect();
      return await this.client.incrBy(key, amount);
    } catch (error) {
      logger.warn(`Cache increment failed for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<void> {
    if (this.isDisabled) {
      return;
    }
    try {
      if (!this.isConnected) await this.connect();
      await this.client.flushDb();
      console.log('✅ Cache flushed');
    } catch (error) {
      logger.error('Cache flush failed:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.isDisabled || !this.isConnected) {
      return;
    }
    await this.client.quit();
    this.isConnected = false;
    console.log('✅ Redis disconnected');
  }
}
