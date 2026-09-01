import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useInstantTranslation } from './useInstantTranslation';

/**
 * Hook to ensure language synchronization across all components
 * This ensures that when language is changed, all components re-render with new translations
 */
export const useLanguageSync = () => {
  const { currentLanguage, languageChangeCounter } = useLanguage();
  const { language: translationLanguage, i18n } = useInstantTranslation();
  const lastLanguageRef = useRef(currentLanguage);
  const syncInProgressRef = useRef(false);

  useEffect(() => {
    // Sync i18next language with context language if they differ
    if (currentLanguage !== translationLanguage && !syncInProgressRef.current) {
      syncInProgressRef.current = true;
      console.log(`🔄 [useLanguageSync] Syncing language: ${translationLanguage} → ${currentLanguage}`);
      
      i18n.changeLanguage(currentLanguage)
        .then(() => {
          console.log(`✅ [useLanguageSync] Language synced to: ${currentLanguage}`);
          lastLanguageRef.current = currentLanguage;
        })
        .catch(err => console.error('Error syncing language:', err))
        .finally(() => {
          syncInProgressRef.current = false;
        });
    }
  }, [currentLanguage, translationLanguage, i18n]);

  // Trigger re-render when language change counter increments
  useEffect(() => {
    if (languageChangeCounter > 0) {
      console.log(`🔄 [useLanguageSync] Language change detected, counter: ${languageChangeCounter}`);
      lastLanguageRef.current = currentLanguage;
    }
  }, [languageChangeCounter, currentLanguage]);

  return {
    currentLanguage,
    isReady: i18n.isInitialized,
    changeCounter: languageChangeCounter
  };
};

export default useLanguageSync;
