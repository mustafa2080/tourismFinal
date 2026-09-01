/**
 * SEO Analytics Service
 * تتبع وتحليل مقاييس SEO
 */

class SEOAnalyticsService {
  constructor() {
    this.events = [];
    this.pageViews = 0;
    this.sessions = [];
  }

  /**
   * Track page view
   */
  trackPageView(page: string) {
    this.pageViews++;
    const event = {
      type: 'pageview',
      page,
      timestamp: new Date(),
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    this.events.push(event);
    this.sendAnalytics(event);
  }

  /**
   * Track keyword search
   */
  trackSearch(query: string, results: number) {
    const event = {
      type: 'search',
      query,
      resultsFound: results,
      timestamp: new Date()
    };

    this.events.push(event);
    this.sendAnalytics(event);
  }

  /**
   * Track package view
   */
  trackPackageView(packageId: string, packageName: string) {
    const event = {
      type: 'package_view',
      packageId,
      packageName,
      timestamp: new Date()
    };

    this.events.push(event);
    this.sendAnalytics(event);
  }

  /**
   * Track booking conversion
   */
  trackBooking(packageId: string, price: number) {
    const event = {
      type: 'booking',
      packageId,
      price,
      timestamp: new Date(),
      conversionTime: this.calculateConversionTime()
    };

    this.events.push(event);
    this.sendAnalytics(event);
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, element: string) {
    const event = {
      type: 'interaction',
      action,
      element,
      timestamp: new Date()
    };

    this.events.push(event);
  }

  /**
   * Calculate conversion time (time from first visit to conversion)
   */
  private calculateConversionTime(): number {
    if (this.sessions.length === 0) return 0;
    
    const firstEvent = this.events[0];
    const currentTime = new Date();
    
    return (currentTime.getTime() - firstEvent.timestamp.getTime()) / 1000; // in seconds
  }

  /**
   * Send analytics to server
   */
  private sendAnalytics(event: any) {
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true
      }).catch(err => console.warn('Failed to send analytics:', err));
    }
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    return {
      totalPageViews: this.pageViews,
      totalEvents: this.events.length,
      eventTypes: this.getEventTypeCounts(),
      averageSessionDuration: this.calculateAverageSessionDuration(),
      conversionRate: this.calculateConversionRate()
    };
  }

  /**
   * Get count of each event type
   */
  private getEventTypeCounts() {
    const counts: { [key: string]: number } = {};
    
    this.events.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1;
    });

    return counts;
  }

  /**
   * Calculate average session duration
   */
  private calculateAverageSessionDuration(): number {
    if (this.sessions.length === 0) return 0;
    
    const totalDuration = this.sessions.reduce((sum, session) => sum + session.duration, 0);
    return totalDuration / this.sessions.length;
  }

  /**
   * Calculate conversion rate
   */
  private calculateConversionRate(): number {
    const bookings = this.events.filter(e => e.type === 'booking').length;
    const pageViews = this.events.filter(e => e.type === 'pageview').length;

    if (pageViews === 0) return 0;
    return (bookings / pageViews) * 100;
  }

  /**
   * Track Core Web Vitals
   */
  trackWebVitals() {
    if ('web-vital' in window) {
      try {
        // Largest Contentful Paint
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.sendAnalytics({
            type: 'web_vital',
            metric: 'LCP',
            value: lastEntry.renderTime || lastEntry.loadTime,
            timestamp: new Date()
          });
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('Web Vitals tracking not available');
      }
    }
  }

  /**
   * Export analytics data
   */
  exportData(): string {
    return JSON.stringify({
      summary: this.getSummary(),
      events: this.events,
      exportedAt: new Date()
    }, null, 2);
  }

  /**
   * Clear analytics data
   */
  clearData() {
    this.events = [];
    this.pageViews = 0;
    this.sessions = [];
  }
}

export const seoAnalyticsService = new SEOAnalyticsService();
