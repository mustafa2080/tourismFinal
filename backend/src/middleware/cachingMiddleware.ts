import { Request, Response, NextFunction } from 'express';
import { CacheManager } from '../config/cache.js';

/**
 * Smart Caching Middleware
 * Caches GET requests to reduce database load
 */

const CACHE_DURATIONS = {
  packages: 3600, // 1 hour
  categories: 7200, // 2 hours
  reviews: 1800, // 30 minutes
  bookings: 600, // 10 minutes (sensitive data)
  users: 900, // 15 minutes
  itineraries: 3600, // 1 hour
  settings: 7200, // 2 hours
  default: 600, // 10 minutes
};

// 🔐 SECURITY: These path prefixes serve per-user data (bookings, wishlist,
// auth, notifications, admin panels). The cache key below is built from the
// URL alone with no user identity in it, so caching these would let one
// user's response be served to a different user hitting the same path
// (e.g. GET /api/users/wishlist), and would also serve stale data after a
// write (add/remove) until the TTL expires. Skip the cache entirely for
// these - they're per-user reads that should always hit the database.
const UNCACHEABLE_PREFIXES = [
  '/api/users',
  '/api/bookings',
  '/api/auth',
  '/api/notifications',
  '/api/admin',
];

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  if (UNCACHEABLE_PREFIXES.some(prefix => req.path.startsWith(prefix))) {
    return next();
  }

  try {
    const cache = CacheManager.getInstance();
    const cacheKey = `cache:${req.originalUrl}`;

    // Check if cached
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache HIT: ${req.path}`);
      return res.json(cachedData);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache response
    res.json = function(data: any) {
      // Determine cache duration based on endpoint
      let duration = CACHE_DURATIONS.default;

      if (req.path.includes('/packages')) {
        duration = CACHE_DURATIONS.packages;
      } else if (req.path.includes('/categories')) {
        duration = CACHE_DURATIONS.categories;
      } else if (req.path.includes('/reviews')) {
        duration = CACHE_DURATIONS.reviews;
      } else if (req.path.includes('/bookings')) {
        duration = CACHE_DURATIONS.bookings;
      } else if (req.path.includes('/users')) {
        duration = CACHE_DURATIONS.users;
      } else if (req.path.includes('/itineraries')) {
        duration = CACHE_DURATIONS.itineraries;
      } else if (req.path.includes('/settings')) {
        duration = CACHE_DURATIONS.settings;
      }

      // Cache the response
      cache.set(cacheKey, data, duration).catch(() => {
        // Silently fail - don't break the response
      });

      console.log(`📝 Cache SET: ${req.path} (${duration}s)`);
      return originalJson(data);
    };

    next();
  } catch (error) {
    console.warn('⚠️ Caching middleware error:', error);
    next();
  }
};

/**
 * Invalidate cache for specific patterns
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const cache = CacheManager.getInstance();
    await cache.deletePattern(`cache:${pattern}*`);
    console.log(`🔄 Cache invalidated: ${pattern}`);
  } catch (error) {
    console.warn(`⚠️ Cache invalidation failed for ${pattern}:`, error);
  }
};
