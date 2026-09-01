/**
 * Performance Monitoring Utilities
 * Track and monitor application performance metrics
 */

export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  private static readonly MAX_METRICS = 100;

  /**
   * Record metric measurement
   */
  static recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last MAX_METRICS
    if (values.length > this.MAX_METRICS) {
      values.shift();
    }

    console.log(`📊 [Metric] ${name}: ${value.toFixed(2)}ms`, tags || '');
  }

  /**
   * Measure function execution time
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, tags);
    }
  }

  /**
   * Get average metric value
   */
  static getAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;

    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  /**
   * Get metric percentile
   */
  static getPercentile(name: string, percentile: number = 95): number {
    const values = [...(this.metrics.get(name) || [])].sort((a, b) => a - b);
    if (values.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  /**
   * Get all metrics
   */
  static getAllMetrics(): Record<string, { avg: number; p95: number; count: number }> {
    const result: any = {};

    this.metrics.forEach((values, name) => {
      result[name] = {
        avg: this.getAverage(name),
        p95: this.getPercentile(name, 95),
        count: values.length,
      };
    });

    return result;
  }

  /**
   * Clear metrics
   */
  static clear(): void {
    this.metrics.clear();
  }
}

/**
 * Web Vitals Monitoring
 * Track Core Web Vitals
 */
export class WebVitalsMonitor {
  private static reported = false;

  static reportWebVitals(): void {
    if (this.reported) return;
    this.reported = true;

    try {
      // LCP - Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        PerformanceMonitor.recordMetric('web-vital:lcp', lastEntry.renderTime || lastEntry.loadTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID - First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          PerformanceMonitor.recordMetric('web-vital:fid', (entry as any).processingDuration);
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            PerformanceMonitor.recordMetric('web-vital:cls', clsValue);
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // INP - Interaction to Next Paint (newer metric)
      if ('PerformanceObserver' in window) {
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              PerformanceMonitor.recordMetric('web-vital:inp', entry.duration);
            });
          }).observe({ entryTypes: ['interaction'] });
        } catch (e) {
          // INP not supported
        }
      }

      // Report metrics periodically
      setInterval(() => {
        const metrics = PerformanceMonitor.getAllMetrics();
        console.log('📊 [Web Vitals]:', metrics);
      }, 60000);
    } catch (error) {
      console.error('Failed to setup web vitals monitoring:', error);
    }
  }
}

/**
 * Request Performance Tracking
 */
export class RequestPerformanceTracker {
  private static requests: Map<string, { start: number; size: number }> = new Map();

  static startTracking(url: string): void {
    this.requests.set(url, {
      start: performance.now(),
      size: 0,
    });
  }

  static endTracking(url: string, size: number = 0): void {
    const request = this.requests.get(url);
    if (!request) return;

    const duration = performance.now() - request.start;
    const throughput = size > 0 ? (size / (duration / 1000) / 1024 / 1024).toFixed(2) : 'N/A';

    console.log(`🌐 [Request] ${url}`);
    console.log(`   Duration: ${duration.toFixed(2)}ms, Size: ${size} bytes, Throughput: ${throughput} MB/s`);

    PerformanceMonitor.recordMetric(`request:${new URL(url, location.href).pathname}`, duration);

    this.requests.delete(url);
  }
}

/**
 * React Hook for performance monitoring
 */
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    WebVitalsMonitor.reportWebVitals();
  }, []);

  return {
    recordMetric: PerformanceMonitor.recordMetric,
    getMetrics: () => PerformanceMonitor.getAllMetrics(),
    measure: PerformanceMonitor.measure,
  };
};
