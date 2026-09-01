import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en/common.json';
import ar from '../locales/ar/common.json';
import es from '../locales/es/common.json';
import de from '../locales/de/common.json';
import ru from '../locales/ru/common.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  es: { translation: es },
  de: { translation: de },
  ru: { translation: ru }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'translation',
    
    // Language detection with proper order
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage'
    },

    interpolation: {
      escapeValue: false, // React handles XSS protection
      formatSeparator: ','
    },

    react: {
      useSuspense: false, // Set to false to avoid suspense issues
      bindI18n: 'languageChanged loaded', // Make sure react-i18next listens to language changes
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
      autoUnbind: false // Don't auto unbind listeners
    },

    // Only load the language, not country specific variants
    load: 'languageOnly',
    
    // Disable automatic missing key saving
    saveMissing: false,
    
    // Add ns (namespace) configuration
    ns: ['translation'],
    defaultNS: 'translation'
  });

/**
 * Handle language changes efficiently
 * Follows i18next best practices by using events
 */
i18n.on('languageChanged', (lng) => {
  // Update HTML lang attribute
  document.documentElement.lang = lng;
  
  // Handle RTL/LTR based on language
  const isRTL = lng === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.body.dir = isRTL ? 'rtl' : 'ltr';
  
  // Update classes
  if (isRTL) {
    document.documentElement.classList.add('rtl');
    document.documentElement.classList.remove('ltr');
  } else {
    document.documentElement.classList.add('ltr');
    document.documentElement.classList.remove('rtl');
  }

  // Dispatch multiple events to ensure all listeners are notified
  window.dispatchEvent(new CustomEvent('i18nLanguageChanged', { detail: { language: lng } }));
  window.dispatchEvent(new Event('language-update'));

  console.log(`✅ Language changed to: ${lng} (RTL: ${isRTL})`);
});

/**
 * Get current language info
 */
export const getCurrentLanguage = () => {
  return {
    code: i18n.language,
    direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
  };
};

/**
 * Change language safely
 */
export const changeLanguage = async (lng) => {
  try {
    await i18n.changeLanguage(lng);
    return true;
  } catch (error) {
    console.error(`Error changing language to ${lng}:`, error);
    return false;
  }
};

export default i18n;
