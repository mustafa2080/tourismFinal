import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Component يجبر re-render فوري للصفحة عند تغيير اللغة
 * ضعه في أي مكان تريد ترجمة فوريةفيه
 */
export const TranslationSyncProvider = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // إجبار re-render الصفحة بالكاملعند تغيير اللغة
    const handleLanguageChange = () => {
      // إرسال تنبيه للنوافذ الأخرى
      window.dispatchEvent(new CustomEvent('translation-sync', { 
        detail: { language: i18n.language } 
      }));
    };

    i18n.on('languageChanged', handleLanguageChange);
    window.addEventListener('translation-sync', () => {});

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return children;
};

export default TranslationSyncProvider;
