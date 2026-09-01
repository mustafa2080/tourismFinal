import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext'; // Import language context

/**
 * Hook for instant translation
 * Follows react-i18next best practices and ensures reactive updates
 * https://react.i18next.com/latest/usetranslation-hook
 */
export const useInstantTranslation = () => {
  const { t, i18n, ready } = useTranslation();
  const { languageChangeCounter } = useLanguage(); // Listen to context changes
  
  // Initialize language state from i18n
  const [language, setLanguage] = useState(i18n.language);
  const mountedRef = useRef(true);
  const lastLanguageRef = useRef(i18n.language);
  const i18nLanguageRef = useRef(i18n.language);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Listen to context language changes
  useEffect(() => {
    if (!mountedRef.current) return;
    setLanguage(i18n.language);
    console.log(`✅ [useInstantTranslation] Language synced from context: ${i18n.language}`);
  }, [languageChangeCounter, i18n.language]);

  // Primary: Sync with i18n.language changes
  useEffect(() => {
    if (i18n.language !== i18nLanguageRef.current) {
      i18nLanguageRef.current = i18n.language;
      lastLanguageRef.current = i18n.language;
      setLanguage(i18n.language);
      console.log(`✅ [useInstantTranslation] Language synced from i18n: ${i18n.language}`);
    }
  }, [i18n.language]);

  // Listen for language changes from i18next events
  useEffect(() => {
    if (!ready) return;

    const handleLanguageChange = (lng) => {
      if (!mountedRef.current) return;

      // Update refs and state immediately
      i18nLanguageRef.current = lng;
      lastLanguageRef.current = lng;
      setLanguage(lng);
      console.log(`✅ [useInstantTranslation] Language changed (i18n event): ${lng}`);
    };

    // Listen to i18next language change event (primary listener)
    i18n.on('languageChanged', handleLanguageChange);

    // Fallback listener for completion event
    const handleLanguageChangeCompleted = (event) => {
      if (event.detail?.language && mountedRef.current) {
        const lng = event.detail.language;
        if (lng !== i18nLanguageRef.current) {
          i18nLanguageRef.current = lng;
          lastLanguageRef.current = lng;
          setLanguage(lng);
          console.log(`✅ [useInstantTranslation] Language synced (completion event): ${lng}`);
        }
      }
    };
    
    window.addEventListener('languageChangeCompleted', handleLanguageChangeCompleted);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      window.removeEventListener('languageChangeCompleted', handleLanguageChangeCompleted);
    };
  }, [i18n, ready]);

  /**
   * Get translation by key
   */
  const getTranslation = useCallback((key, defaultValue) => {
    const result = t(key, defaultValue || key);
    return result;
  }, [t]);

  /**
   * Change language directly via i18n
   */
  const changeLanguage = useCallback(async (lng) => {
    try {
      console.log(`🌍 [useInstantTranslation] Changing language to: ${lng}`);
      await i18n.changeLanguage(lng);
      
      // Update refs and state immediately
      i18nLanguageRef.current = lng;
      lastLanguageRef.current = lng;
      setLanguage(lng);
      
      console.log(`✅ [useInstantTranslation] Language changed to: ${lng}`);
      return true;
    } catch (error) {
      console.error(`❌ [useInstantTranslation] Error changing language to ${lng}:`, error);
      return false;
    }
  }, [i18n]);

  return {
    t,
    i18n,
    language,
    ready,
    getTranslation,
    changeLanguage,
    isRTL: language === 'ar'
  };
};

export default useInstantTranslation;
