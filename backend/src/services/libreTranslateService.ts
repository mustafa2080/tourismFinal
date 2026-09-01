import axios from 'axios';
import NodeCache from 'node-cache';

/**
 * LibreTranslate Service - Backend (Self-hosted, no API key needed)
 * Reference: https://docs.libretranslate.com/guides/api_usage/
 */

const LIBRE_TRANSLATE_API = process.env.LIBRE_TRANSLATE_API || 'http://localhost:5000/translate';
const LIBRE_TRANSLATE_DETECT = process.env.LIBRE_TRANSLATE_DETECT || 'http://localhost:5000/detect';
const CACHE_TTL = 30 * 24 * 60 * 60; // 30 يوم

// Cache
const translationCache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 600 });

/**
 * إنش715 مفتاح الـ Cache
 */
const generateCacheKey = (text, sourceLang, targetLang) => {
  return `${sourceLang}_${targetLang}_${text.substring(0, 50)}`;
};

/**
 * ترجمة نص واحد
 */
export const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    const cacheKey = generateCacheKey(text, sourceLanguage, targetLanguage);
    const cached = translationCache.get(cacheKey);

    if (cached) {
      console.log(`✅ Translation from cache: ${targetLanguage}`);
      return cached;
    }

    const payload = {
      q: text,
      source: sourceLanguage,
      target: targetLanguage
    };

    const response = await axios.post(LIBRE_TRANSLATE_API, payload, {
      timeout: 10000
    });

    if (response.data?.translatedText) {
      const translation = response.data.translatedText;
      translationCache.set(cacheKey, translation);
      console.log(`✅ Translation completed for: ${targetLanguage}`);
      return translation;
    }

    console.warn(`⚠️ No translation received for ${targetLanguage}, returning original`);
    return text;
  } catch (error) {
    console.warn(`⚠️ Translation error for ${targetLanguage}:`, error.message);
    // Return original text on error instead of throwing
    return text;
  }
};

/**
 * ترجمة دفعية
 */
export const translateBatch = async (texts, targetLanguage, sourceLanguage = 'auto', maxBatchSize = 100) => {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    const batches = [];
    for (let i = 0; i < texts.length; i += maxBatchSize) {
      batches.push(texts.slice(i, i + maxBatchSize));
    }

    const translations = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        const payload = {
          q: batch,
          source: sourceLanguage,
          target: targetLanguage
        };

        const response = await axios.post(LIBRE_TRANSLATE_API, payload, {
          timeout: 10000
        });

        if (Array.isArray(response.data?.translatedText)) {
          batch.forEach((text, idx) => {
            const cacheKey = generateCacheKey(text, sourceLanguage, targetLanguage);
            const translation = response.data.translatedText[idx];
            translationCache.set(cacheKey, translation);
            translations.push(translation);
          });
        } else {
          // If response is not array, return original batch
          translations.push(...batch);
        }
      } catch (batchError) {
        console.warn(`⚠️ Batch ${i + 1} failed, returning original texts:`, batchError.message);
        // Return original texts for this batch instead of failing
        translations.push(...batch);
      }
    }

    console.log(`✅ Batch translation completed: ${translations.length} items for ${targetLanguage}`);
    return translations;
  } catch (error) {
    console.warn(`⚠️ Batch translation error:`, error.message);
    // Return original texts on error
    return texts;
  }
};

/**
 * ترجمة كائن بيانات
 */
export const translateObject = async (obj, targetLanguage, fieldsToTranslate, sourceLanguage = 'auto') => {
  if (!obj || !fieldsToTranslate || fieldsToTranslate.length === 0) {
    return obj;
  }

  try {
    const translatedObj = { ...obj };
    const textsToTranslate = fieldsToTranslate
      .map(field => obj[field])
      .filter(text => text && typeof text === 'string');

    if (textsToTranslate.length === 0) {
      return translatedObj;
    }

    const translations = await translateBatch(textsToTranslate, targetLanguage, sourceLanguage);

    let translationIdx = 0;
    fieldsToTranslate.forEach(field => {
      if (obj[field] && typeof obj[field] === 'string') {
        translatedObj[field] = translations[translationIdx++];
      }
    });

    console.log(`✅ Object translated for ${targetLanguage}`);
    return translatedObj;
  } catch (error) {
    console.warn(`⚠️ Object translation error:`, error.message);
    // Return original object instead of throwing
    return obj;
  }
};

/**
 * اكتشاف اللغة
 */
export const detectLanguage = async (text) => {
  if (!text || text.trim().length === 0) {
    return 'en';
  }

  try {
    const payload = { q: text };

    const response = await axios.post(LIBRE_TRANSLATE_DETECT, payload, {
      timeout: 10000
    });

    const detectedLanguage = response.data?.result?.language || 'en';
    console.log(`✅ Language detected: ${detectedLanguage}`);
    return detectedLanguage;
  } catch (error) {
    console.warn(`⚠️ Language detection error:`, error.message);
    return 'en';
  }
};

/**
 * الحصول على إحصائيات الـ Cache
 */
export const getCacheStats = () => {
  const keys = translationCache.keys();
  return {
    totalCachedItems: keys.length,
    cacheKeys: keys,
    cacheStats: translationCache.getStats()
  };
};

/**
 * مسح الـ Cache
 */
export const clearCache = () => {
  translationCache.flushAll();
  console.log('✅ Translation cache cleared');
  return { success: true, message: 'Cache cleared' };
};

/**
 * مسح مفتاح معين من الـ Cache
 */
export const clearCacheKey = (text, sourceLang, targetLang) => {
  const cacheKey = generateCacheKey(text, sourceLang, targetLang);
  translationCache.del(cacheKey);
  return { success: true, message: `Cache key cleared: ${cacheKey}` };
};

export default {
  translateText,
  translateBatch,
  translateObject,
  detectLanguage,
  getCacheStats,
  clearCache,
  clearCacheKey
};
