import { Repository, SelectQueryBuilder } from 'typeorm';
import { CacheManager } from '../config/cache.js';

/**
 * Enhanced Query Performance Helper
 * Adds pagination, eager loading, and optimizations
 */

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class QueryOptimizer {
  /**
   * Apply pagination to query builder
   */
  static paginate<T>(
    query: SelectQueryBuilder<T>,
    options: PaginationOptions
  ): SelectQueryBuilder<T> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20)); // Max 100
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    if (options.sort && options.order) {
      query.orderBy(`query.${options.sort}`, options.order);
    }

    return query;
  }

  /**
   * Add eager loading to prevent N+1 queries
   */
  static eagerLoad<T>(
    query: SelectQueryBuilder<T>,
    relations: string[]
  ): SelectQueryBuilder<T> {
    relations.forEach((relation) => {
      query.leftJoinAndSelect(`${query.alias}.${relation}`, relation);
    });
    return query;
  }

  /**
   * Add select specific columns to reduce data transfer
   */
  static selectColumns<T>(
    query: SelectQueryBuilder<T>,
    columns: string[]
  ): SelectQueryBuilder<T> {
    if (columns.length > 0) {
      query.select(
        columns.map((col) => `${query.alias}.${col}`)
      );
    }
    return query;
  }

  /**
   * Execute with caching
   */
  static async executeWithCache<T>(
    query: SelectQueryBuilder<T>,
    cacheKey: string,
    ttl: number = 3600
  ): Promise<T[]> {
    const cache = CacheManager.getInstance();

    // Try cache first
    const cached = await cache.get<T[]>(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return cached;
    }

    // Execute query
    const result = await query.getMany();

    // Cache result
    await cache.set(cacheKey, result, ttl).catch(() => {
      // Silently fail
    });

    return result;
  }

  /**
   * Get paginated results with cache support
   */
  static async getPaginated<T>(
    query: SelectQueryBuilder<T>,
    options: PaginationOptions,
    cacheKey?: string,
    cacheTtl: number = 600
  ): Promise<PaginatedResult<T>> {
    // Try cache if key provided
    if (cacheKey) {
      const cache = CacheManager.getInstance();
      const cached = await cache.get<PaginatedResult<T>>(cacheKey);
      if (cached) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return cached;
      }
    }

    // Get total count (with optimization)
    const total = await query.getCount();

    // Apply pagination
    const paginatedQuery = this.paginate(query, options);

    // Get data
    const data = await paginatedQuery.getMany();

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const pages = Math.ceil(total / limit);

    const result: PaginatedResult<T> = {
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };

    // Cache result if key provided
    if (cacheKey) {
      const cache = CacheManager.getInstance();
      await cache.set(cacheKey, result, cacheTtl).catch(() => {
        // Silently fail
      });
    }

    return result;
  }

  /**
   * Bulk insert with optimization
   */
  static async bulkInsert<T>(
    repository: Repository<T>,
    entities: Partial<T>[],
    batchSize: number = 1000
  ): Promise<void> {
    const batches = [];
    for (let i = 0; i < entities.length; i += batchSize) {
      batches.push(entities.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await repository.insert(batch as any);
    }

    console.log(`✅ Bulk inserted ${entities.length} records in ${batches.length} batches`);
  }

  /**
   * Check query performance
   */
  static explainQuery<T>(query: SelectQueryBuilder<T>): void {
    const sql = query.getSql();
    console.log('📊 Query:', sql);
  }
}
