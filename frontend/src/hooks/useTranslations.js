import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook متقدم للترجمة
 * - يراقب تغييرات اللغة تلقائياً
 * - يحدث النصوص المترجمة فوراً
 * - يدعم مفاتيح متعددة
 */
export const useTranslations = (keys = []) => {
  const { t, i18n, ready } = useTranslation();
  const [translations, setTranslations] = useState({});
  const [language, setLanguage] = useState(i18n.language);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Update translations when language or keys change
  useEffect(() => {
    if (!ready || !mountedRef.current) return;

    const updateTranslations = () => {
      if (!Array.isArray(keys) || keys.length === 0) return;

      const newTranslations = {};
      keys.forEach(key => {
        newTranslations[key] = t(key);
      });
      
      setTranslations(newTranslations);
    };

    updateTranslations();
  }, [i18n.language, ready, keys, t]);

  // Listen for language changes
  useEffect(() => {
    if (!ready) return;

    const handleLanguageChange = (lng) => {
      if (!mountedRef.current) return;
      setLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, ready]);

  const getTrans = useCallback((key) => {
    if (translations[key]) return translations[key];
    return t(key);
  }, [translations, t]);

  return {
    translations,
    language,
    t: getTrans,
    i18n,
    ready
  };
};

export default useTranslations;
