/**
 * Request Debouncing and Throttling Utilities
 * Prevents duplicate requests and unnecessary API calls
 */

export class RequestManager {
  private static pendingRequests = new Map<string, Promise<any>>();
  private static requestCache = new Map<string, { data: any; timestamp: number }>();
  private static debouncers = new Map<string, NodeJS.Timeout>();
  private static throttlers = new Map<string, { lastCall: number; timeout: NodeJS.Timeout | null }>();

  private static readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * De-duplicate concurrent requests
   */
  static async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // If request already pending, return existing promise
    if (this.pendingRequests.has(key)) {
      console.log(`♻️ [RequestManager] Reusing pending request: ${key}`);
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const promise = requestFn()
      .then((data) => {
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Cache request with TTL
   */
  static async cachedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): Promise<T> {
    // Check cache
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`💾 [RequestManager] Cache HIT: ${key}`);
      return cached.data;
    }

    // Execute request
    const data = await this.deduplicateRequest(key, requestFn);

    // Store in cache
    this.requestCache.set(key, { data, timestamp: Date.now() });
    console.log(`📝 [RequestManager] Cache SET: ${key} (${ttl}ms)`);

    return data;
  }

  /**
   * Debounce function calls (delays execution)
   */
  static debounce<T>(
    key: string,
    fn: () => Promise<T>,
    delay: number = 300
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Clear existing debounce
      if (this.debouncers.has(key)) {
        clearTimeout(this.debouncers.get(key)!);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        fn()
          .then((result) => {
            this.debouncers.delete(key);
            resolve(result);
          })
          .catch((error) => {
            this.debouncers.delete(key);
            reject(error);
          });
      }, delay);

      this.debouncers.set(key, timeout);
    });
  }

  /**
   * Throttle function calls (limits frequency)
   */
  static throttle<T>(
    key: string,
    fn: () => Promise<T>,
    interval: number = 1000
  ): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const throttleState = this.throttlers.get(key) || {
        lastCall: 0,
        timeout: null,
      };

      const now = Date.now();
      const timeSinceLastCall = now - throttleState.lastCall;

      if (timeSinceLastCall >= interval) {
        // Enough time has passed, execute immediately
        throttleState.lastCall = now;
        this.throttlers.set(key, throttleState);

        fn()
          .then(resolve)
          .catch(reject);
      } else {
        // Not enough time has passed, schedule for later
        if (throttleState.timeout) {
          clearTimeout(throttleState.timeout);
        }

        const waitTime = interval - timeSinceLastCall;
        throttleState.timeout = setTimeout(() => {
          throttleState.lastCall = Date.now();
          throttleState.timeout = null;
          this.throttlers.set(key, throttleState);

          fn()
            .then(resolve)
            .catch(reject);
        }, waitTime);

        this.throttlers.set(key, throttleState);
      }
    });
  }

  /**
   * Clear cache for a pattern
   */
  static clearCache(pattern?: string): void {
    if (!pattern) {
      this.requestCache.clear();
      console.log('🔄 [RequestManager] All cache cleared');
      return;
    }

    for (const key of this.requestCache.keys()) {
      if (key.includes(pattern)) {
        this.requestCache.delete(key);
      }
    }

    console.log(`🔄 [RequestManager] Cache cleared for pattern: ${pattern}`);
  }

  /**
   * Get request stats for monitoring
   */
  static getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      cachedRequests: this.requestCache.size,
      activeThrottles: this.throttlers.size,
      activeDebouncers: this.debouncers.size,
    };
  }
}

/**
 * React Hook for debounced API calls
 */
export const useDebouncedRequest = (delay: number = 300) => {
  const execute = async <T,>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    return RequestManager.debounce(key, requestFn, delay);
  };

  return { execute, clearCache: RequestManager.clearCache };
};

/**
 * React Hook for throttled API calls
 */
export const useThrottledRequest = (interval: number = 1000) => {
  const execute = async <T,>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T | undefined> => {
    return RequestManager.throttle(key, requestFn, interval);
  };

  return { execute, clearCache: RequestManager.clearCache };
};

/**
 * React Hook for cached API calls
 */
export const useCachedRequest = (ttl: number = 5 * 60 * 1000) => {
  const execute = async <T,>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    return RequestManager.cachedRequest(key, requestFn, ttl);
  };

  return {
    execute,
    clearCache: RequestManager.clearCache,
    getStats: RequestManager.getStats,
  };
};
