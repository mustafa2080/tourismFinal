/**
 * Performance Monitoring Utilities
 * Track and monitor application performance metrics (backend only)
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
