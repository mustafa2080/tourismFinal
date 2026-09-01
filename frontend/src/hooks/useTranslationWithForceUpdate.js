import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useRef } from 'react';

/**
 * Hook that forces component re-render when language changes
 * Combines react-i18next with LanguageContext for guaranteed updates
 */
export const useTranslationWithForceUpdate = () => {
  const { t, i18n, ready } = useTranslation();
  const { languageChangeCounter } = useLanguage();
  const prevCounterRef = useRef(languageChangeCounter);

  // Re-run translation function when language changes
  useEffect(() => {
    if (languageChangeCounter !== prevCounterRef.current) {
      prevCounterRef.current = languageChangeCounter;
      console.log(`🔄 [useTranslationWithForceUpdate] Force updating translations due to counter change`);
    }
  }, [languageChangeCounter]);

  return {
    t,
    i18n,
    ready,
    // Force include language in deps
    language: i18n.language,
    counter: languageChangeCounter
  };
};

export default useTranslationWithForceUpdate;
