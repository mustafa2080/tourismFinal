import axios from 'axios';
import { TRANSLATION_CONFIG } from '../config/translation.config';

/**
 * LibreTranslate Service via Backend Proxy
 * Frontend calls Backend API which then calls LibreTranslate or uses cached translations
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_TRANSLATE_API = `${API_URL}/translate/auto-translate`;
const BACKEND_BATCH_TRANSLATE_API = `${API_URL}/translate/batch-translate`;
const BACKEND_OBJECT_TRANSLATE_API = `${API_URL}/translate/translate-object`;
const BACKEND_DETECT_API = `${API_URL}/translate/detect-language`;
const BACKEND_LANGUAGES_API = `${API_URL}/translate/languages`;

// ============================================================================
// CACHE SYSTEM - In-memory cache with TTL
// ============================================================================

class TranslationCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 24 * 60 * 60 * 1000; // 24 hours
  }

  generateKey(text, sourceLang, targetLang) {
    // Create a hash-like key but deterministic
    const normalized = `${sourceLang}:${targetLang}:${text.substring(0, 100)}`;
    return normalized.replace(/\s+/g, '_');
  }

  get(text, sourceLang, targetLang) {
    const key = this.generateKey(text, sourceLang, targetLang);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if cache expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(text, sourceLang, targetLang, translation) {
    const key = this.generateKey(text, sourceLang, targetLang);
    this.cache.set(key, {
      value: translation,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
    console.log('✅ Translation cache cleared');
  }

  getStats() {
    return {
      size: this.cache.size
    };
  }
}

const cache = new TranslationCache();

// ============================================================================
// TRANSLATION FUNCTIONS
// ============================================================================

/**
 * Translate a single text
 * Follows LibreTranslate API structure exactly
 */
export const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    // Check cache first
    const cached = cache.get(text, sourceLanguage, targetLanguage);
    if (cached) {
      console.log(`✅ Translation from cache: ${targetLanguage}`);
      return cached;
    }

    const payload = {
      text,
      targetLanguage,
      sourceLanguage
    };

    const response = await axios.post(BACKEND_TRANSLATE_API, payload, {
      timeout: TRANSLATION_CONFIG.requestTimeout || 10000
    });

    // Validate response structure from Backend
    if (response.data?.success && response.data?.data?.translated) {
      const translation = response.data.data.translated;
      cache.set(text, sourceLanguage, targetLanguage, translation);
      return translation;
    }

    throw new Error('Invalid response structure from Backend');
  } catch (error) {
    console.error(`❌ Translation error for ${targetLanguage}:`, error.message);
    // Return original text on error - do not throw
    return text;
  }
};

/**
 * Batch translate multiple texts
 * Use with caution - respects API rate limits
 */
export const translateBatch = async (texts, targetLanguage, sourceLanguage = 'auto') => {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    const payload = {
      texts,
      targetLanguage,
      sourceLanguage
    };

    const response = await axios.post(BACKEND_BATCH_TRANSLATE_API, payload, {
      timeout: TRANSLATION_CONFIG.requestTimeout || 10000
    });

    // Handle response from Backend
    if (response.data?.success && Array.isArray(response.data?.data?.translations)) {
      const translations = response.data.data.translations.map(item => item.translated);
      
      // Cache all translations
      texts.forEach((text, idx) => {
        cache.set(text, sourceLanguage, targetLanguage, translations[idx]);
      });
      
      console.log(`✅ Batch translation completed: ${translations.length} items`);
      return translations;
    }

    throw new Error('Invalid response structure from Backend');
  } catch (error) {
    console.error(`❌ Batch translation error:`, error.message);
    // Return original texts on error
    return texts;
  }
};

/**
 * Translate an object (like a Package)
 */
export const translateObject = async (obj, targetLanguage, fieldsToTranslate, sourceLanguage = 'auto') => {
  if (!obj || !fieldsToTranslate || fieldsToTranslate.length === 0) {
    return obj;
  }

  try {
    const translatedObj = { ...obj };
    
    // Extract texts to translate
    const textsToTranslate = fieldsToTranslate
      .map(field => obj[field])
      .filter(text => text && typeof text === 'string');

    if (textsToTranslate.length === 0) {
      return translatedObj;
    }

    // Translate all texts at once
    const translations = await translateBatch(textsToTranslate, targetLanguage, sourceLanguage);

    // Map translations back to object
    let translationIdx = 0;
    fieldsToTranslate.forEach(field => {
      if (obj[field] && typeof obj[field] === 'string') {
        translatedObj[field] = translations[translationIdx++];
      }
    });

    return translatedObj;
  } catch (error) {
    console.error(`❌ Object translation error:`, error.message);
    return obj;
  }
};

/**
 * Detect language of text
 */
export const detectLanguage = async (text) => {
  if (!text || text.trim().length === 0) {
    return 'en';
  }

  try {
    const payload = { text };

    const response = await axios.post(BACKEND_DETECT_API, payload, {
      timeout: TRANSLATION_CONFIG.requestTimeout || 10000
    });

    // Validate response from Backend
    const detectedLanguage = response.data?.data?.detectedLanguage || 'en';
    console.log(`✅ Language detected: ${detectedLanguage}`);
    return detectedLanguage;
  } catch (error) {
    console.error(`❌ Language detection error:`, error.message);
    return 'en'; // Default to English on error
  }
};

/**
 * Get supported languages from LibreTranslate
 */
export const getSupportedLanguages = async () => {
  try {
    const response = await axios.get(BACKEND_LANGUAGES_API, {
      timeout: TRANSLATION_CONFIG.requestTimeout || 10000
    });

    const languages = response.data?.data || [];
    console.log(`✅ Supported languages loaded: ${languages.length}`);
    return languages;
  } catch (error) {
    console.error(`❌ Error loading supported languages:`, error.message);
    // Return fallback languages
    return TRANSLATION_CONFIG.supportedLanguages || [
      { code: 'en', name: 'English' },
      { code: 'ar', name: 'Arabic' },
      { code: 'es', name: 'Spanish' },
      { code: 'de', name: 'German' },
      { code: 'ru', name: 'Russian' }
    ];
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    cacheSize: cache.getStats().size,
    apiUrl: BACKEND_BATCH_TRANSLATE_API
  };
};

/**
 * Clear cache
 */
export const clearCache = () => {
  cache.clear();
};

export default {
  translateText,
  translateBatch,
  translateObject,
  detectLanguage,
  getSupportedLanguages,
  getCacheStats,
  clearCache
};
