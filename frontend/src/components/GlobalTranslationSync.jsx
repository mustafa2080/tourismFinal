import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Global Translation Sync Component
 * 
 * ✓ مراقبة تغييرات اللغة
 * ✓ تطبيق التحديثات على كل صفحة
 * ✓ إجبار re-render المكونات على تحديث الترجمات
 */
export const GlobalTranslationSync = ({ children }) => {
  const { i18n, ready } = useTranslation();

  // Apply initial language settings
  useEffect(() => {
    if (!ready) {
      console.log(`⏳ [GlobalTranslationSync] Waiting for i18n to be ready...`);
      return;
    }

    const applyLanguageSettings = (lng) => {
      const isRTL = lng === 'ar';
      const html = document.documentElement;
      const body = document.body;
      
      html.lang = lng;
      html.dir = isRTL ? 'rtl' : 'ltr';
      body.dir = isRTL ? 'rtl' : 'ltr';
      html.classList.toggle('rtl', isRTL);
      html.classList.toggle('ltr', !isRTL);
      
      console.log(`✅ [GlobalTranslationSync] Language settings applied: ${lng} (RTL: ${isRTL})`);
    };

    // Apply initial settings
    applyLanguageSettings(i18n.language);
  }, [ready]);

  // Monitor language changes
  useEffect(() => {
    if (!ready) return;

    const handleLanguageChange = (lng) => {
      console.log(`🌍 [GlobalTranslationSync] Language change detected: ${lng}`);
      
      const isRTL = lng === 'ar';
      const html = document.documentElement;
      const body = document.body;
      
      // Apply all DOM changes
      html.lang = lng;
      html.dir = isRTL ? 'rtl' : 'ltr';
      body.dir = isRTL ? 'rtl' : 'ltr';
      html.classList.toggle('rtl', isRTL);
      html.classList.toggle('ltr', !isRTL);
      
      // Store preference
      try {
        localStorage.setItem('preferredLanguage', lng);
      } catch (e) {
        console.warn('Unable to save language preference:', e);
      }
      
      // Dispatch custom event to notify all listeners
      window.dispatchEvent(new CustomEvent('globalLanguageChanged', { 
        detail: { language: lng, timestamp: Date.now() } 
      }));
      
      console.log(`✅ [GlobalTranslationSync] Language settings updated: ${lng}`);
    };

    // Listen to i18next language change
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, ready]);

  return children;
};

export default GlobalTranslationSync;
