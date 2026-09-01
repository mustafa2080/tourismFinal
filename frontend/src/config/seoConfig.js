/**
 * SEO Configuration
 * مركز إدارة جميع إعدادات SEO
 */

const SEO_CONFIG = {
  // Domain settings
  domain: 'yourdomain.com',
  baseUrl: 'https://yourdomain.com',
  protocol: 'https',

  // Site settings
  siteName: 'Tour Booking Platform',
  siteDescription: 'Discover Amazing Travel Packages & Tours | Book Your Dream Vacation Today',
  siteKeywords: [
    'tours',
    'travel packages',
    'vacation booking',
    'travel deals',
    'adventure tours',
    'travel agency'
  ],

  // Contact information (for schema)
  contact: {
    email: 'support@yourdomain.com',
    phone: '+1-XXX-XXX-XXXX',
    address: {
      streetAddress: 'Your Street Address',
      addressLocality: 'Your City',
      addressRegion: 'Your State',
      postalCode: 'XXXXX',
      addressCountry: 'US'
    }
  },

  // Social media links
  social: {
    facebook: 'https://facebook.com/yourpage',
    twitter: 'https://twitter.com/yourprofile',
    instagram: 'https://instagram.com/yourprofile',
    linkedin: 'https://linkedin.com/company/yourcompany'
  },

  // Analytics
  analytics: {
    googleAnalyticsId: 'G-XXXXXXXXXX',
    googleSearchConsoleToken: 'your-token-here',
    bingWebmasterTools: 'your-bing-token'
  },

  // Meta tags configuration
  metaTags: {
    titleLength: 60,           // Optimal length
    descriptionLength: 160,    // Optimal length
    keywordsLimit: 5           // Maximum keywords
  },

  // Image settings
  images: {
    ogImageUrl: 'https://yourdomain.com/og-image.jpg',
    twitterImageUrl: 'https://yourdomain.com/twitter-image.jpg',
    logoUrl: 'https://yourdomain.com/logo.png',
    faviconUrl: 'https://yourdomain.com/favicon.ico',
    
    // Image optimization
    optimize: true,
    formats: ['webp', 'jpg', 'png'],
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.8
  },

  // Sitemap configuration
  sitemap: {
    enabled: true,
    routes: [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/search', priority: 0.9, changefreq: 'weekly' },
      { path: '/packages', priority: 0.9, changefreq: 'weekly' },
      { path: '/tours', priority: 0.9, changefreq: 'weekly' },
      { path: '/about', priority: 0.7, changefreq: 'monthly' },
      { path: '/contact', priority: 0.7, changefreq: 'monthly' },
      { path: '/faq', priority: 0.7, changefreq: 'monthly' },
      { path: '/blog', priority: 0.8, changefreq: 'weekly' },
      { path: '/terms-of-service', priority: 0.5, changefreq: 'yearly' },
      { path: '/privacy-policy', priority: 0.5, changefreq: 'yearly' },
      { path: '/careers', priority: 0.6, changefreq: 'monthly' }
    ]
  },

  // Robots.txt configuration
  robots: {
    userAgents: ['*'],
    allowedPaths: [
      '/packages',
      '/tours',
      '/search',
      '/booking',
      '/reviews',
      '/about',
      '/contact'
    ],
    disallowedPaths: [
      '/admin',
      '/dashboard',
      '/private',
      '/*.json$',
      '/*.pdf$'
    ]
  },

  // Structured data settings
  structuredData: {
    enableLocalBusiness: true,
    enableOrganization: true,
    enableProduct: true,
    enableArticle: true,
    enableFAQ: true,
    enableBreadcrumbs: true
  },

  // Performance settings
  performance: {
    enableLazyLoad: true,
    enableCodeSplitting: true,
    enableCaching: true,
    cacheStrategy: 'network-first', // or 'cache-first'
    enableServiceWorker: true,
    enableCompression: true,
    
    // Core Web Vitals thresholds
    coreWebVitals: {
      LCP: 2500,    // Largest Contentful Paint (milliseconds)
      FID: 100,     // First Input Delay (milliseconds)
      CLS: 0.1      // Cumulative Layout Shift
    }
  },

  // Security settings
  security: {
    enableCSP: true,
    enableHTST: true,
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableXXSSProtection: true
  },

  // Internationalization
  i18n: {
    enabled: true,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar', 'es', 'de', 'ru'],
    languageDetection: true
  },

  // Breadcrumbs configuration
  breadcrumbs: {
    enabled: true,
    includeSchema: true,
    maxItems: 5
  },

  // Open Graph settings
  openGraph: {
    enabled: true,
    type: 'website',
    locale: 'en_US'
  },

  // Twitter Card settings
  twitter: {
    enabled: true,
    cardType: 'summary_large_image',
    creator: '@yourhandle'
  },

  // Canonical URL settings
  canonical: {
    enabled: true,
    strategy: 'dynamic' // or 'static'
  },

  // Monitoring and alerts
  monitoring: {
    enableMonitoring: true,
    alertThreshold: {
      performanceScore: 80,
      pageSpeedScore: 80,
      searchabilityScore: 90
    },
    sendAlerts: true,
    alertEmail: 'admin@yourdomain.com'
  }
};

/**
 * Get SEO configuration value
 */
export function getSEOConfig(key: string): any {
  const keys = key.split('.');
  let value: any = SEO_CONFIG;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`SEO Config key not found: ${key}`);
      return null;
    }
  }

  return value;
}

/**
 * Update SEO configuration
 */
export function updateSEOConfig(key: string, value: any): void {
  const keys = key.split('.');
  let config: any = SEO_CONFIG;

  for (let i = 0; i < keys.length - 1; i++) {
    config = config[keys[i]];
  }

  config[keys[keys.length - 1]] = value;
  console.log(`SEO Config updated: ${key} = ${value}`);
}

/**
 * Get all SEO configuration
 */
export function getAllSEOConfig(): typeof SEO_CONFIG {
  return SEO_CONFIG;
}

export default SEO_CONFIG;
