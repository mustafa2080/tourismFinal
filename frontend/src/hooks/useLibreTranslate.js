import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  translateText,
  translateBatch,
  translateObject,
  detectLanguage
} from '../services/libreTranslateService';
import { 
  addDynamicTranslations, 
  getStaticTranslation 
} from '../services/translationManager';

/**
 * Hook for instant translation with LibreTranslate
 * Combines static translations with dynamic API translations
 */
export const useInstantTranslateWithLibre = () => {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const processingRef = useRef(false);

  /**
   * Translate single text instantly
   */
  const instantTranslate = useCallback(async (
    text,
    targetLanguage,
    sourceLanguage = 'auto'
  ) => {
    if (!text || text.trim().length === 0) {
      return text;
    }

    try {
      setIsTranslating(true);
      const translation = await translateText(text, targetLanguage, sourceLanguage);
      return translation;
    } catch (error) {
      console.error('Instant translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  /**
   * Batch translate multiple texts
   */
  const batchTranslate = useCallback(async (
    texts,
    targetLanguage,
    sourceLanguage = 'auto'
  ) => {
    if (!texts || texts.length === 0) {
      return [];
    }

    try {
      setIsTranslating(true);
      const translations = await translateBatch(texts, targetLanguage, sourceLanguage);
      return translations;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  /**
   * Translate object (like Package)
   */
  const translateObjectData = useCallback(async (
    obj,
    targetLanguage,
    fieldsToTranslate,
    sourceLanguage = 'auto'
  ) => {
    if (!obj) {
      return obj;
    }

    try {
      setIsTranslating(true);
      const translated = await translateObject(
        obj,
        targetLanguage,
        fieldsToTranslate,
        sourceLanguage
      );
      return translated;
    } catch (error) {
      console.error('Object translation error:', error);
      return obj;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  /**
   * Detect language of text
   */
  const detect = useCallback(async (text) => {
    try {
      return await detectLanguage(text);
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }, []);

  return {
    instantTranslate,
    batchTranslate,
    translateObjectData,
    detect,
    isTranslating,
    currentLanguage: i18n.language
  };
};

/**
 * Hook for combining static and dynamic translations
 */
export const useCombinedTranslation = () => {
  const { t, i18n } = useTranslation();
  const { instantTranslate } = useInstantTranslateWithLibre();

  /**
   * Get translation - try static first, then dynamic
   */
  const getTranslation = useCallback(async (key, fallback = '') => {
    // Try static translation first (from JSON)
    const staticTrans = getStaticTranslation(key, i18n.language);
    if (staticTrans) {
      return staticTrans;
    }

    // If not found, try dynamic (this is for custom keys)
    return fallback;
  }, [i18n.language]);

  return {
    t,
    i18n,
    instantTranslate,
    getTranslation,
    currentLanguage: i18n.language
  };
};

export default useInstantTranslateWithLibre;
