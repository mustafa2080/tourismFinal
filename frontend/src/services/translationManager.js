/**
 * ✅ UNIFIED TRANSLATION MANAGER - Dynamic Translation System
 * 
 * 🎯 Central hub for ALL translation operations:
 * - ✅ Static translations (i18n + JSON files)
 * - ✅ Dynamic translations (from backend API for new packages)
 * - ✅ Package-specific translations
 * - ✅ Auto-triggers when language changes
 * - ✅ Caches all translations for performance
 * 
 * This is the ONLY file to use for translations throughout the app!
 */

import i18n from '../i18n/i18n';
import { TRANSLATION_CONFIG } from '../config/translation.config';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DYNAMIC_TRANSLATIONS_KEY = 'dynamicTranslations_v3';

// Fix API URL if it doesn't end with /api
const getApiUrl = () => {
  let url = API_BASE_URL;
  if (!url.endsWith('/api')) {
    if (url.match(/:\d+$/)) {
      url = url + '/api';
    } else if (!url.includes('/api')) {
      url = url + '/api';
    }
  }
  return url;
};

// ============================================================================
// API TRANSLATIONS FROM BACKEND
// ============================================================================

/**
 * Get package translation from backend
 */
export const getPackageTranslation = async (packageId, language = 'en') => {
  if (!packageId) {
    console.warn('packageId is required');
    return null;
  }

  try {
    const response = await axios.get(
      `${getApiUrl()}/translations/package/${packageId}`,
      { params: { language }, timeout: 10000 }
    );

    if (response.data?.success && response.data?.data) {
      console.log(`✅ [TranslationManager] Package translation fetched: ${packageId} - ${language}`);
      return response.data.data;
    }

    console.warn(`⚠️ [TranslationManager] No translation found: ${packageId} - ${language}`);
    return null;
  } catch (error) {
    console.warn(`⚠️ [TranslationManager] Error fetching translation:`, error.message);
    return null;
  }
};

/**
 * Get all translations for a package
 */
export const getAllPackageTranslations = async (packageId) => {
  if (!packageId) {
    console.warn('packageId is required');
    return [];
  }

  try {
    const response = await axios.get(
      `${getApiUrl()}/translations/package/${packageId}/all`,
      { timeout: 10000 }
    );

    if (response.data?.success && Array.isArray(response.data?.data)) {
      console.log(`✅ [TranslationManager] Fetched ${response.data.count} translations`);
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.warn(`⚠️ [TranslationManager] Error fetching translations:`, error.message);
    return [];
  }
};

/**
 * Get supported languages
 */
export const getSupportedLanguages = async () => {
  try {
    const response = await axios.get(
      `${getApiUrl()}/translations/languages`,
      { timeout: 5000 }
    );

    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.warn(`⚠️ [TranslationManager] Error fetching languages:`, error.message);
    return [];
  }
};

// ============================================================================
// STATIC TRANSLATIONS (i18n - from JSON files)
// ============================================================================

/**
 * Get static translation from i18n
 */
export const getStaticTranslation = (key, language = i18n.language) => {
  try {
    const translation = i18n.t(key, { lng: language });
    return translation !== key ? translation : null;
  } catch (error) {
    console.warn(`Static translation not found for key: ${key}`, error);
    return null;
  }
};

/**
 * Get all static translations for a language
 */
export const getStaticTranslationsByLanguage = (language = i18n.language) => {
  try {
    return i18n.getResourceBundle(language, 'translation') || {};
  } catch (error) {
    console.warn(`Error getting static translations for ${language}:`, error);
    return {};
  }
};

// ============================================================================
// DYNAMIC TRANSLATIONS STORAGE
// ============================================================================

const getDynamicTranslations = () => {
  try {
    const stored = localStorage.getItem(DYNAMIC_TRANSLATIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('Error reading dynamic translations:', e);
    return {};
  }
};

const saveDynamicTranslations = (translations) => {
  try {
    localStorage.setItem(DYNAMIC_TRANSLATIONS_KEY, JSON.stringify(translations));
  } catch (e) {
    console.error('Error saving dynamic translations:', e);
  }
};

// ============================================================================
// DYNAMIC TEXT TRANSLATION
// ============================================================================

/**
 * Translate text through backend API
 */
export const translateDynamicText = async (
  text,
  targetLanguage,
  sourceLanguage = 'en'
) => {
  if (!text || sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    const response = await axios.post(
      `${getApiUrl()}/translations/translate`,
      { text, targetLanguage, sourceLanguage },
      { timeout: 10000 }
    );

    if (response.data?.success && response.data?.data?.translated) {
      return response.data.data.translated;
    }

    return text;
  } catch (error) {
    console.warn(`⚠️ [TranslationManager] Translation error:`, error.message);
    return text;
  }
};

/**
 * Translate multiple texts in batch
 */
export const translateDynamicBatch = async (
  texts,
  targetLanguage,
  sourceLanguage = 'en'
) => {
  if (!texts || texts.length === 0 || sourceLanguage === targetLanguage) {
    return texts;
  }

  try {
    const response = await axios.post(
      `${getApiUrl()}/translations/batch-translate`,
      { texts, targetLanguage, sourceLanguage },
      { timeout: 15000 }
    );

    if (response.data?.success && response.data?.data?.translations) {
      return response.data.data.translations.map(t => t.translated);
    }

    return texts;
  } catch (error) {
    console.warn(`⚠️ [TranslationManager] Batch translation error:`, error.message);
    return texts;
  }
};

/**
 * Translate object data - uses backend endpoint
 */
export const translateDynamicObject = async (
  obj,
  targetLanguage,
  fieldsToTranslate = [],
  sourceLanguage = 'en'
) => {
  if (!obj || !fieldsToTranslate || fieldsToTranslate.length === 0 || targetLanguage === 'en') {
    return obj;
  }

  try {
    // Build request payload with only fields to translate
    const fields = {};
    fieldsToTranslate.forEach(field => {
      if (obj[field]) {
        fields[field] = obj[field];
      }
    });

    if (Object.keys(fields).length === 0) {
      return obj;
    }

    const response = await axios.post(
      `${getApiUrl()}/translations/translate-object`,
      { 
        object: { id: obj.id, ...fields }, 
        targetLanguage, 
        fieldsToTranslate, 
        sourceLanguage 
      },
      { timeout: 15000 }
    );

    if (response.data?.success && response.data?.data?.translated) {
      return {
        ...obj,
        ...response.data.data.translated
      };
    }

    return obj;
  } catch (error) {
    console.warn(`⚠️ [TranslationManager] Object translation error:`, error.message);
    return obj;
  }
};

/**
 * ⭐ Translate array of objects - MAIN FUNCTION FOR NEW PACKAGES
 * This is called when new packages are fetched and language needs to change
 * 
 * 🔥 THIS FUNCTION HANDLES WHEN USER CHANGES LANGUAGE AND ALL PACKAGES NEED TRANSLATION
 */
export const translateDynamicArray = async (
  array,
  targetLanguage,
  fieldsToTranslate = [],
  sourceLanguage = 'en'
) => {
  if (!array || !Array.isArray(array) || array.length === 0 || targetLanguage === sourceLanguage) {
    return array;
  }

  if (fieldsToTranslate.length === 0) {
    return array;
  }

  // If target language is English and source is also English, return as-is
  if (targetLanguage === 'en' && sourceLanguage === 'en') {
    return array;
  }

  try {
    console.log(`🌍 [TranslationManager] ⭐ MAIN TRANSLATION: Translating array of ${array.length} items to ${targetLanguage}`);
    console.log(`📋 Fields to translate: ${fieldsToTranslate.join(', ')}`);

    // Try to get from backend DB first (dynamic translations already created)
    // If available, use those, otherwise fallback to on-the-fly translation
    const translatedArray = await Promise.allSettled(
      array.map(item =>
        translateDynamicObject(item, targetLanguage, fieldsToTranslate, sourceLanguage)
          .catch(err => {
            console.warn(`⚠️ [TranslationManager] Item translation failed, keeping original:`, err.message);
            return item;
          })
      )
    );

    // Extract results and handle failures
    const results = translatedArray.map(promise => {
      if (promise.status === 'fulfilled') {
        return promise.value;
      } else {
        console.warn(`⚠️ [TranslationManager] Promise rejected, using original:`, promise.reason);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ [TranslationManager] Successfully translated ${results.length}/${array.length} items to ${targetLanguage}`);
    return results.length > 0 ? results : array;

  } catch (error) {
    console.warn(`⚠️ [TranslationManager] Array translation error:`, error.message);
    return array;
  }
};

// ============================================================================
// DYNAMIC TRANSLATIONS MANAGEMENT
// ============================================================================

/**
 * Store dynamic translations
 */
export const addDynamicTranslations = (key, translations) => {
  const currentTranslations = getDynamicTranslations();

  if (!currentTranslations[key]) {
    currentTranslations[key] = {};
  }

  Object.assign(currentTranslations[key], translations);
  saveDynamicTranslations(currentTranslations);

  console.log(`✅ Translations added for: ${key}`);
};

/**
 * Get all dynamic translations
 */
export const getAllDynamicTranslations = () => {
  return getDynamicTranslations();
};

/**
 * Initialize dynamic translations
 */
export const initializeDynamicTranslations = () => {
  const dynamicTranslations = getDynamicTranslations();

  Object.keys(dynamicTranslations).forEach((key) => {
    try {
      addDynamicTranslations(key, dynamicTranslations[key]);
    } catch (error) {
      console.error(`Error initializing translation for ${key}:`, error);
    }
  });

  console.log(`✅ Dynamic translations initialized (${Object.keys(dynamicTranslations).length} keys)`);
};

/**
 * Clear dynamic translations
 */
export const clearDynamicTranslations = () => {
  localStorage.removeItem(DYNAMIC_TRANSLATIONS_KEY);
  console.log('✅ Dynamic translations cleared');
};

// ============================================================================
// STATISTICS & STATUS
// ============================================================================

/**
 * Get translation service stats
 */
export const getTranslationStats = () => {
  return {
    dynamicTranslationsCount: Object.keys(getDynamicTranslations()).length,
    currentLanguage: i18n.language,
    supportedLanguages: TRANSLATION_CONFIG.supportedLanguages || ['en', 'ar', 'es', 'de', 'ru']
  };
};

// ============================================================================
// 🚀 AUTO-TRIGGER TRANSLATION ON LANGUAGE CHANGE
// ============================================================================

/**
 * 🔥 CRITICAL FUNCTION: Auto-translate newly loaded packages when language changes
 * 
 * Usage in usePackages or anywhere packages are loaded:
 * ```
 * const packages = await fetchPackages();
 * const translatedPackages = await translationManager.autoTranslatePackagesOnLanguageChange(
 *   packages,
 *   currentLanguage,
 *   ['title', 'short_desc', 'destination']
 * );
 * ```
 */
export const autoTranslatePackagesOnLanguageChange = async (
  packages,
  targetLanguage,
  fieldsToTranslate = ['title', 'destination', 'short_desc', 'long_desc', 'trip_type'],
  sourceLanguage = 'en'
) => {
  // If English to English, no translation needed
  if (targetLanguage === 'en' || targetLanguage === sourceLanguage) {
    console.log(`✅ [TranslationManager] No translation needed for ${targetLanguage}`);
    return packages;
  }

  // If no packages, return
  if (!packages || packages.length === 0) {
    console.warn(`⚠️ [TranslationManager] No packages to translate`);
    return packages;
  }

  try {
    console.log(`\n🌐🔄 [TranslationManager] AUTO-TRANSLATING ${packages.length} PACKAGES TO ${targetLanguage.toUpperCase()}...\n`);

    // Translate each package using the backend API translations first
    const translatedPackages = [];

    for (const pkg of packages) {
      try {
        // Try to get pre-translated package from backend first
        const translation = await getPackageTranslation(pkg.id, targetLanguage);
        
        if (translation) {
          // Use backend translation
          const translatedPkg = {
            ...pkg,
            title: translation.title || pkg.title,
            destination: translation.destination || pkg.destination,
            short_desc: translation.short_desc || pkg.short_desc,
            long_desc: translation.long_desc || pkg.long_desc,
            trip_type: translation.trip_type || pkg.trip_type,
            inclusions: translation.inclusions && translation.inclusions.length > 0 ? translation.inclusions : pkg.inclusions,
            exclusions: translation.exclusions && translation.exclusions.length > 0 ? translation.exclusions : pkg.exclusions
          };
          translatedPackages.push(translatedPkg);
          console.log(`  ✅ Package ${pkg.id}: Used DB translation for ${targetLanguage}`);
        } else {
          // Fallback to on-the-fly translation
          const translatedPkg = await translateDynamicObject(
            pkg,
            targetLanguage,
            fieldsToTranslate,
            sourceLanguage
          );
          translatedPackages.push(translatedPkg);
          console.log(`  ✅ Package ${pkg.id}: On-the-fly translation for ${targetLanguage}`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Failed to translate package ${pkg.id}, using original`, error.message);
        translatedPackages.push(pkg);
      }
    }

    console.log(`\n✅ [TranslationManager] Successfully translated ${translatedPackages.length} packages to ${targetLanguage}\n`);
    return translatedPackages;

  } catch (error) {
    console.error(`❌ [TranslationManager] Auto-translate error:`, error.message);
    return packages;
  }
};

// ============================================================================

export default {
  // API
  getPackageTranslation,
  getAllPackageTranslations,
  getSupportedLanguages,
  
  // Static
  getStaticTranslation,
  getStaticTranslationsByLanguage,
  
  // Dynamic
  translateDynamicText,
  translateDynamicBatch,
  translateDynamicObject,
  translateDynamicArray,
  autoTranslatePackagesOnLanguageChange,  // 🔥 NEW: Auto-translate on language change
  
  // Management
  addDynamicTranslations,
  getAllDynamicTranslations,
  initializeDynamicTranslations,
  clearDynamicTranslations,
  
  // Stats
  getTranslationStats
};

export const translationManager = {
  // API
  getPackageTranslation,
  getAllPackageTranslations,
  getSupportedLanguages,
  
  // Static
  getStaticTranslation,
  getStaticTranslationsByLanguage,
  
  // Dynamic
  translateDynamicText,
  translateDynamicBatch,
  translateDynamicObject,
  translateDynamicArray,
  autoTranslatePackagesOnLanguageChange,  // 🔥 NEW: Auto-translate on language change
  
  // Management
  addDynamicTranslations,
  getAllDynamicTranslations,
  initializeDynamicTranslations,
  clearDynamicTranslations,
  
  // Stats
  getStats: getTranslationStats
};
