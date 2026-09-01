/**
 * Performance Optimization Utils
 * تحسين أداء الموقع للـ SEO
 */

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ];

  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
};

/**
 * Lazy load images
 */
export const enableLazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
};

/**
 * Optimize Third-party Scripts
 */
export const optimizeThirdPartyScripts = () => {
  // Load Google Analytics asynchronously
  if (window.location.href.includes('yourdomain.com')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      (window.dataLayer as any[]).push(arguments);
    }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'GA_ID');
  }
};

/**
 * Enable HTTP/2 Push Hint
 */
export const addLinkPrefetchHints = () => {
  const criticalUrls = [
    '/api/packages',
    '/api/categories'
  ];

  criticalUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Minify CSS
 */
export const minifyCSS = (css: string): string => {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove comments
    .replace(/\s+/g, ' ')              // Remove extra whitespace
    .replace(/\s*([{}:;,])\s*/g, '$1')  // Remove whitespace around special chars
    .trim();
};

/**
 * Minify JavaScript
 */
export const minifyJS = (js: string): string => {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
    .replace(/\/\/.*$/gm, '')           // Remove single-line comments
    .replace(/\s+/g, ' ')               // Remove extra whitespace
    .trim();
};

/**
 * Check Core Web Vitals
 */
export const checkCoreWebVitals = () => {
  const vitals = {
    LCP: null,        // Largest Contentful Paint
    FID: null,        // First Input Delay
    CLS: null         // Cumulative Layout Shift
  };

  // Check if Web Vitals API is available
  if ('web-vital' in window) {
    console.log('📊 Core Web Vitals supported');
  }

  return vitals;
};

/**
 * Compress Images using Canvas
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/webp', quality);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Monitor and Report Performance
 */
export const reportPerformanceMetrics = () => {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    const metrics = {
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      timeToFirstByte: timing.responseStart - timing.navigationStart,
      serverResponseTime: timing.responseEnd - timing.requestStart,
      resourceLoadTime: timing.loadEventEnd - timing.responseEnd
    };

    console.table(metrics);

    // Send to analytics service
    if (window.location.href.includes('yourdomain.com')) {
      fetch('/api/performance-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      }).catch(err => console.warn('Failed to send metrics:', err));
    }

    return metrics;
  }
};

/**
 * Cache API Responses
 */
export class APICache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes default

  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    if (ttl) {
      setTimeout(() => this.cache.delete(key), ttl);
    } else {
      setTimeout(() => this.cache.delete(key), this.ttl);
    }
  }

  get(key: string) {
    return this.cache.get(key)?.data;
  }

  isValid(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

/**
 * Service Worker Registration for Offline Support
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered');
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }
};

export default {
  preloadCriticalResources,
  enableLazyLoadImages,
  optimizeThirdPartyScripts,
  addLinkPrefetchHints,
  minifyCSS,
  minifyJS,
  checkCoreWebVitals,
  compressImage,
  reportPerformanceMetrics,
  APICache,
  apiCache,
  registerServiceWorker
};
