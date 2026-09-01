import { createContext, useContext, useCallback, useEffect, useState, useRef, memo, useMemo } from 'react';
import i18n from '../i18n/i18n';
import { translationManager } from '../services/translationManager';

const LanguageContext = createContext();

export { LanguageContext };

/**
 * LanguageProvider - Optimized following i18next best practices
 * https://www.i18next.com/principles/best-practices
 */
export const LanguageProvider = ({ children }) => {
  const updateInProgressRef = useRef(false);
  
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('preferredLanguage');
      return saved || i18n.language || 'en';
    } catch (e) {
      return 'en';
    }
  });
  
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [languageChangeCounter, setLanguageChangeCounter] = useState(0); // Force re-render trigger

  // Initialize on mount - only once
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        if (i18n.language !== currentLanguage) {
          await i18n.changeLanguage(currentLanguage);
        }
        applyLanguageSettings(currentLanguage);
      } catch (error) {
        console.error('Error initializing language:', error);
      }
    };

    initializeLanguage();
  }, [currentLanguage]);

  /**
   * Apply language-specific DOM settings
   */
  const applyLanguageSettings = useCallback((languageCode) => {
    try {
      const html = document.documentElement;
      const body = document.body;
      
      // Set language attribute for accessibility
      html.lang = languageCode;
      
      // Handle RTL/LTR
      const isRTL = languageCode === 'ar';
      html.dir = isRTL ? 'rtl' : 'ltr';
      body.dir = isRTL ? 'rtl' : 'ltr';
      
      // Update classes (no complex CSS transitions needed)
      html.classList.toggle('rtl', isRTL);
      html.classList.toggle('ltr', !isRTL);
      
      // Persist preference
      try {
        localStorage.setItem('preferredLanguage', languageCode);
      } catch (e) {
        console.warn('Unable to save language preference:', e);
      }

      console.log(`✅ Language settings applied: ${languageCode} (RTL: ${isRTL})`);
    } catch (error) {
      console.warn('Error applying language settings:', error);
    }
  }, []);

/**
 * Change language - follow i18next patterns
 */
const changeLanguage = useCallback(async (languageCode) => {
  // Prevent concurrent updates
  if (updateInProgressRef.current || languageCode === currentLanguage) {
    console.log(`ℹ️ [LanguageContext] Language change skipped: already changing or same language`);
    return;
  }

  updateInProgressRef.current = true;
  setIsChangingLanguage(true);

  try {
    console.log(`🌍 [LanguageContext] Starting language change to: ${languageCode}`);
    
    // 1. Change i18next language FIRST and wait for it
    await new Promise((resolve, reject) => {
      i18n.changeLanguage(languageCode, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`✅ [LanguageContext] i18next language changed to: ${languageCode}`);
    
    // Small delay to ensure i18next cache is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 2. Update state immediately - THIS WILL TRIGGER RE-RENDER
    setCurrentLanguage(languageCode);
    
    // 3. Force re-render across all subscribers with counter increment
    setLanguageChangeCounter(prev => prev + 1);
    
    // 4. Apply DOM changes
    applyLanguageSettings(languageCode);
    
    // Dispatch multiple events to ensure all listeners are notified
    window.dispatchEvent(
      new CustomEvent('languageChanged', {
        detail: { language: languageCode, timestamp: Date.now() }
      })
    );

    // Additional events for extra safety
    window.dispatchEvent(new CustomEvent('language-update', { 
      detail: { language: languageCode } 
    }));
    window.dispatchEvent(new CustomEvent('languageChangeCompleted', {
      detail: { language: languageCode, timestamp: Date.now() }
    }));

    console.log(`✅ [LanguageContext] Language changed successfully to: ${languageCode}`);
  } catch (error) {
    console.error(`❌ [LanguageContext] Error changing language to ${languageCode}:`, error);
    // Reset state on error
    updateInProgressRef.current = false;
    setIsChangingLanguage(false);
  } finally {
    if (updateInProgressRef.current) {
      updateInProgressRef.current = false;
      setIsChangingLanguage(false);
    }
  }
}, [currentLanguage, applyLanguageSettings]);

  /**
   * Get current language info
   */
  const getLanguageInfo = useCallback(() => {
    return {
      current: currentLanguage,
      direction: currentLanguage === 'ar' ? 'rtl' : 'ltr',
      isChanging: isChangingLanguage
    };
  }, [currentLanguage, isChangingLanguage]);

  /**
   * Get available languages list
   */
  const getAvailableLanguages = useCallback(() => {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
    ];
  }, []);

  const value = useMemo(() => ({
    currentLanguage,
    isChangingLanguage,
    changeLanguage,
    getLanguageInfo,
    getAvailableLanguages,
    languageChangeCounter // Include this so components re-render when it changes
  }), [currentLanguage, isChangingLanguage, changeLanguage, getLanguageInfo, getAvailableLanguages, languageChangeCounter]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.displayName = 'LanguageProvider';

/**
 * Hook to use language context
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;
