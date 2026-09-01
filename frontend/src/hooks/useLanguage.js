import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

/**
 * Hook to use language context
 * Provides language management with automatic translation support
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    console.warn('⚠️ useLanguage must be used within LanguageProvider');
    return {
      language: 'en',
      setLanguage: () => {},
      isChangingLanguage: false,
      getLanguageInfo: () => ({ current: 'en', direction: 'ltr', isChanging: false }),
      getAvailableLanguages: () => []
    };
  }

  return {
    language: context.currentLanguage,
    setLanguage: context.changeLanguage,
    isChangingLanguage: context.isChangingLanguage,
    getLanguageInfo: context.getLanguageInfo,
    getAvailableLanguages: context.getAvailableLanguages
  };
};

export default useLanguage;
