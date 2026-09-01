/**
 * Backend Translation Service
 * Best practices from i18next documentation
 * https://www.i18next.com/overview/configuration-options
 */

// Supported languages list (must match frontend)
const SUPPORTED_LANGUAGES = ['en', 'ar', 'es', 'de', 'ru'];

// Cache configuration - in-memory only
const translationCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Create cache key based on text and language pair
 */
const getCacheKey = (text, sourceLang, targetLang) => {
  // Deterministic key generation
  return `${sourceLang}:${targetLang}:${text.substring(0, 100)}`.replace(/\s+/g, '_');
};

/**
 * Clean expired cache entries
 */
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, entry] of translationCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      translationCache.delete(key);
    }
  }
};

/**
 * Validate language code
 */
const isValidLanguage = (lng) => {
  return SUPPORTED_LANGUAGES.includes(lng);
};

/**
 * Validate and normalize translation text
 */
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim();
};

/**
 * Translate single text
 * Note: Backend doesn't do automatic translation - it uses static translations
 * Automatic translation should be done on frontend with LibreTranslate
 */
export const translateText = async (
  text,
  targetLanguage,
  sourceLanguage = 'en'
) => {
  try {
    // Validate inputs
    if (!sanitizeText(text)) {
      throw new Error('Text is required');
    }

    if (!isValidLanguage(targetLanguage)) {
      throw new Error(`Unsupported language: ${targetLanguage}`);
    }

    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // Check cache
    const cacheKey = getCacheKey(text, sourceLanguage, targetLanguage);
    const cached = translationCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ Cache hit: ${cacheKey.substring(0, 50)}`);
      return cached.value;
    }

    // Static translations only - no automatic translation on backend
    console.warn('⚠️ Backend translation disabled. Use frontend for dynamic translations.');
    return text;
  } catch (error) {
    console.error('❌ Translation error:', error.message);
    return text;
  }
};

/**
 * Translate multiple texts in batch
 */
export const translateBatch = async (
  texts,
  targetLanguage,
  sourceLanguage = 'en'
) => {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    if (!isValidLanguage(targetLanguage)) {
      throw new Error(`Unsupported language: ${targetLanguage}`);
    }

    // Return texts with cache checking for each
    return texts.map(text => {
      const cacheKey = getCacheKey(text, sourceLanguage, targetLanguage);
      const cached = translationCache.get(cacheKey);
      return cached && Date.now() - cached.timestamp < CACHE_TTL
        ? cached.value
        : text;
    });
  } catch (error) {
    console.error('❌ Batch translation error:', error.message);
    return texts;
  }
};

/**
 * Translate package data
 */
export const translatePackageData = async (
  packageData,
  targetLanguage,
  fieldsToTranslate = ['name', 'description', 'itinerary', 'highlights']
) => {
  try {
    if (!packageData) {
      throw new Error('Package data is required');
    }

    if (!isValidLanguage(targetLanguage)) {
      throw new Error(`Unsupported language: ${targetLanguage}`);
    }

    const translatedData = { ...packageData };

    // Try to translate each field
    for (const field of fieldsToTranslate) {
      if (packageData[field] && typeof packageData[field] === 'string') {
        translatedData[field] = await translateText(
          packageData[field],
          targetLanguage,
          'en'
        );
      }
    }

    return translatedData;
  } catch (error) {
    console.error('❌ Package translation error:', error.message);
    return packageData;
  }
};

/**
 * Translate package to all supported languages
 */
export const translatePackageMultiLang = async (
  packageData,
  fieldsToTranslate = ['name', 'description', 'itinerary', 'highlights', 'includes', 'excludes']
) => {
  try {
    if (!packageData) {
      throw new Error('Package data is required');
    }

    const translations = {};

    // Create translations object with keys for each language
    for (const lang of SUPPORTED_LANGUAGES) {
      translations[lang] = {};
      for (const field of fieldsToTranslate) {
        if (packageData[field]) {
          translations[lang][field] = packageData[field];
        }
      }
    }

    return translations;
  } catch (error) {
    console.error('❌ Multi-language translation error:', error.message);
    return { en: packageData };
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  cleanExpiredCache();
  return {
    totalCached: translationCache.size,
    cacheEntries: Array.from(translationCache.keys()).slice(0, 10)
  };
};

/**
 * Clear translation cache
 */
export const clearCache = () => {
  translationCache.clear();
  console.log('✅ Translation cache cleared');
};

/**
 * Get supported languages
 */
export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
  ];
};

/**
 * Validate language pair
 */
export const isLanguagePairSupported = (sourceLang, targetLang) => {
  return isValidLanguage(sourceLang) && isValidLanguage(targetLang);
};

export default {
  translateText,
  translateBatch,
  translatePackageData,
  translatePackageMultiLang,
  getCacheStats,
  clearCache,
  getSupportedLanguages,
  isLanguagePairSupported
};
