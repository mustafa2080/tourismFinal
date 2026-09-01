/**
 * Translation Configuration File
 * Based on:
 * - i18next: https://www.i18next.com/overview/configuration-options
 * - LibreTranslate: https://docs.libretranslate.com
 */

export const TRANSLATION_CONFIG = {
  // Supported languages (must match frontend and backend)
  supportedLanguages: ['en', 'ar', 'es', 'de', 'ru'],
  
  // Default language
  defaultLanguage: 'en',
  
  // Fallback language on error
  fallbackLanguage: 'en',
  
  // Fields to automatically translate for new packages
  automaticTranslationFields: [
    'name',
    'description',
    'itinerary',
    'highlights',
    'includes',
    'excludes',
    'title',
    'location',
    'shortDescription'
  ],

  // LibreTranslate Configuration
  libreTranslate: {
    enabled: true,
    apiUrl: import.meta.env.VITE_LIBRE_TRANSLATE_API || 'http://localhost:5000/translate',
    detectUrl: import.meta.env.VITE_LIBRE_TRANSLATE_DETECT || 'http://localhost:5000/detect',
    languagesUrl: import.meta.env.VITE_LIBRE_TRANSLATE_LANGUAGES || 'http://localhost:5000/languages',
    apiKey: import.meta.env.VITE_LIBRE_TRANSLATE_API_KEY || '',
    timeout: 10000
  },

  // Backend API configuration
  backendApi: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    translationEndpoint: '/translations',
    timeout: 15000
  },

  // Batch translation settings
  maxBatchSize: 50, // Maximum texts per batch

  // Request timeout in milliseconds
  requestTimeout: 10000,

  // Batch processing settings
  batchDelay: 500, // Delay between batches (ms)
  maxConcurrentRequests: 3,

  // Performance settings
  performance: {
    enableCaching: true,
    enableCompression: true,
    lazyLoadTranslations: true,
    preloadLanguages: ['en']
  },

  // Analytics settings
  analytics: {
    enabled: false, // Disabled for privacy
    trackTranslations: false,
    trackErrors: false,
    logStats: false
  }
};

/**
 * Language Display Names
 */
export const LANGUAGE_DISPLAY_NAMES = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
};

/**
 * RTL Languages
 */
export const RTL_LANGUAGES = ['ar'];

export const isRTLLanguage = (lang) => RTL_LANGUAGES.includes(lang);

/**
 * Cache Keys for localStorage
 */
export const CACHE_KEYS = {
  PREFERRED_LANGUAGE: 'preferredLanguage',
  CURRENT_LANGUAGE: 'currentLanguage',
  DYNAMIC_TRANSLATIONS: 'dynamicTranslations_v3',
  TRANSLATION_CACHE: 'translationCache_v3'
};
