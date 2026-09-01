import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { CacheManager } from '../config/cache.js';

/**
 * Performance Monitoring Dashboard Controller
 */

export class MonitoringController {
  /**
   * Get system health and performance metrics
   */
  async getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cache = CacheManager.getInstance();
      const db = AppDataSource;

      // Database connection status
      const dbHealthy = db.isInitialized;

      // Memory usage
      const memoryUsage = process.memoryUsage();

      // Get WebSocket stats if available
      const wsStats = await cache.get('websocket:stats').catch(() => null);

      // Cache stats
      const cacheExists = await cache.exists('cache:*').catch(() => false);

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: dbHealthy ? 'connected' : 'disconnected',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'tour',
          },
          cache: {
            status: 'connected',
            type: 'redis',
          },
          websocket: {
            status: wsStats ? 'active' : 'inactive',
            connections: wsStats?.clientsConnected || 0,
          },
        },
        performance: {
          memory: {
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          },
          uptime: process.uptime(),
        },
        environment: {
          nodeVersion: process.version,
          environment: process.env.NODE_ENV,
        },
      };

      res.json(health);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cache = CacheManager.getInstance();

      // Get WebSocket stats
      const wsStats = await cache.get('websocket:stats').catch(() => null);

      // Memory stats
      const memUsage = process.memoryUsage();

      const metrics = {
        timestamp: new Date().toISOString(),
        websocket: wsStats || {},
        memory: {
          heapUsedPercent: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2),
          heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
          heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
        },
        uptime: process.uptime(),
        load: process.cpuUsage(),
      };

      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cache = CacheManager.getInstance();

      const stats = {
        cacheEnabled: true,
        redisHost: process.env.REDIS_HOST || 'localhost',
        redisPort: process.env.REDIS_PORT || 6379,
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear cache (admin only)
   */
  async clearCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cache = CacheManager.getInstance();
      const pattern = req.query.pattern as string;

      if (pattern) {
        await cache.deletePattern(pattern);
        res.json({
          success: true,
          message: `Cache cleared for pattern: ${pattern}`,
        });
      } else {
        await cache.flush();
        res.json({
          success: true,
          message: 'All cache cleared',
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new MonitoringController();
