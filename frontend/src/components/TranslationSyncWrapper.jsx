import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

/**
 * Translation Sync Wrapper Component
 * Ensures translations are properly synced and components re-render when language changes
 */
export const TranslationSyncWrapper = ({ children }) => {
  const { i18n } = useTranslation();
  const { currentLanguage, languageChangeCounter } = useLanguage();
  const [syncKey, setSyncKey] = useState(0);

  // Re-render when language changes
  useEffect(() => {
    console.log(`🔄 [TranslationSyncWrapper] Syncing language: ${currentLanguage}, counter: ${languageChangeCounter}`);
    setSyncKey(prev => prev + 1);
  }, [currentLanguage, languageChangeCounter]);

  return (
    <div key={syncKey} className="translation-sync-wrapper">
      {children}
    </div>
  );
};

export default TranslationSyncWrapper;
