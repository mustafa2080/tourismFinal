import { useCallback, useState } from 'react';
import { useInstantTranslation } from './useInstantTranslation';
import { useNotificationContext } from './useNotificationContext';
import { translateBatch, translateObject } from '../services/libreTranslateService';
import { addDynamicTranslations } from '../services/translationManager';

/**
 * Hook for translating tour packages to multiple languages
 * Optimized to avoid duplicate requests and API calls
 */
export const useTranslatedPackages = () => {
  const { t } = useInstantTranslation();
  const { showNotification } = useNotificationContext();
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);

  /**
   * Translate entire package to all supported languages at once
   * Uses batch translation to minimize API calls
   * 
   * Usage:
   * const { autoTranslateToAll } = useTranslatedPackages();
   * await autoTranslateToAll(packageData, ['title', 'short_desc', 'long_desc']);
   */
  const autoTranslateToAll = useCallback(async (
    packageData,
    fieldsToTranslate = ['title', 'short_desc', 'long_desc', 'description']
  ) => {
    try {
      setIsLoadingTranslations(true);

      if (!packageData?.id) {
        throw new Error('Package ID is required');
      }

      // Get content to translate only once
      const fieldsContent = fieldsToTranslate
        .map(field => packageData[field])
        .filter(Boolean);

      if (fieldsContent.length === 0) {
        console.warn('⚠️ No content found to translate');
        return { en: packageData };
      }

      console.log(`📝 Starting auto-translate for package ${packageData.id}`);
      console.log(`📋 Fields to translate: ${fieldsToTranslate.join(', ')}`);

      const supportedLanguages = ['ar', 'es', 'de', 'ru', 'fr', 'it', 'pt', 'ja', 'zh'];
      const allTranslations = { en: packageData };

      // Translate sequentially to avoid overloading API
      for (const lang of supportedLanguages) {
        try {
          console.log(`🔄 Translating to ${lang}...`);
          
          // Batch translate all fields to this language
          const translations = await translateBatch(
            fieldsContent,
            lang,
            'en'
          );

          // Build translated package
          const translatedPkg = { ...packageData };
          fieldsToTranslate.forEach((field, idx) => {
            if (translations[idx]) {
              translatedPkg[field] = translations[idx];
            }
          });

          allTranslations[lang] = translatedPkg;
          console.log(`✅ Translated to ${lang} successfully`);

          // Small delay between languages to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
          console.warn(`⚠️ Failed to translate to ${lang}:`, error.message);
          allTranslations[lang] = packageData; // Fallback
        }
      }

      // Store all translations
      const pkgKey = `pkg_${packageData.id}`;
      addDynamicTranslations(pkgKey, allTranslations);

      showNotification({
        type: 'success',
        message: `✅ Translated to ${Object.keys(allTranslations).length} languages!`,
        duration: 3000
      });

      return allTranslations;

    } catch (error) {
      console.error('❌ Auto-translate error:', error);
      showNotification({
        type: 'error',
        message: '⚠️ Translation failed. Showing original content.',
        duration: 3000
      });
      throw error;
    } finally {
      setIsLoadingTranslations(false);
    }
  }, [showNotification]);

  /**
   * Translate package to single target language
   * 
   * Usage:
   * const translated = await translatePackage(packageData, 'ar', ['title', 'description']);
   */
  const translatePackage = useCallback(async (
    packageData,
    targetLanguage = 'en',
    fieldsToTranslate = ['title', 'short_desc', 'long_desc', 'description']
  ) => {
    try {
      setIsLoadingTranslations(true);

      if (!targetLanguage || targetLanguage === 'en') {
        return packageData;
      }

      console.log(`📝 Translating package to ${targetLanguage}`);

      const translated = await translateObject(
        packageData,
        targetLanguage,
        fieldsToTranslate,
        'en'
      );

      // Store single translation
      const pkgKey = `pkg_${packageData.id}`;
      addDynamicTranslations(pkgKey, { [targetLanguage]: translated });

      return translated;

    } catch (error) {
      console.error('Translation error:', error);
      showNotification({
        type: 'error',
        message: '⚠️ Translation failed',
        duration: 2000
      });
      return packageData;
    } finally {
      setIsLoadingTranslations(false);
    }
  }, [showNotification]);

  /**
   * Translate itinerary items
   * 
   * Usage:
   * const translated = await translateItinerary(itineraryArray, 'ar');
   */
  const translateItinerary = useCallback(async (
    itinerary,
    targetLanguage = 'en'
  ) => {
    if (!Array.isArray(itinerary) || targetLanguage === 'en') {
      return itinerary;
    }

    try {
      const dayTitles = itinerary.map(day => day.title).filter(Boolean);
      const dayDescriptions = itinerary.map(day => day.description).filter(Boolean);
      
      const allContent = [...dayTitles, ...dayDescriptions];

      if (allContent.length === 0) return itinerary;

      const translations = await translateBatch(allContent, targetLanguage, 'en');

      const translated = itinerary.map((day, idx) => ({
        ...day,
        title: translations[idx] || day.title,
        description: translations[itinerary.length + idx] || day.description
      }));

      return translated;

    } catch (error) {
      console.error('Itinerary translation error:', error);
      return itinerary;
    }
  }, []);

  /**
   * Translate highlights and inclusions/exclusions
   */
  const translateListItems = useCallback(async (
    items,
    targetLanguage = 'en'
  ) => {
    if (!Array.isArray(items) || items.length === 0 || targetLanguage === 'en') {
      return items;
    }

    try {
      const translations = await translateBatch(items, targetLanguage, 'en');
      return translations;
    } catch (error) {
      console.error('List translation error:', error);
      return items;
    }
  }, []);

  return {
    autoTranslateToAll,
    translatePackage,
    translateItinerary,
    translateListItems,
    isLoadingTranslations
  };
};

export default useTranslatedPackages;
