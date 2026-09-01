/**
 * Translation Fix Utility
 * Ensures translations are properly synced across the app
 */

import i18n from '../i18n/i18n';

// Track if translation system is initialized
let isTranslationInitialized = false;

/**
 * Initialize translation system with proper event listeners
 */
export const initializeTranslationSystem = () => {
  if (isTranslationInitialized) {
    console.log('✅ Translation system already initialized');
    return;
  }

  try {
    // Ensure i18n is initialized
    if (!i18n.isInitialized) {
      console.warn('⚠️ i18n not initialized, waiting...');
      return;
    }

    // Listen for language changes
    const handleLanguageChange = (lng) => {
      console.log(`🔄 [TranslationFix] Language changed event fired: ${lng}`);
      
      // Ensure DOM is updated
      document.documentElement.lang = lng;
      const isRTL = lng === 'ar';
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      
      // Dispatch custom events
      window.dispatchEvent(new CustomEvent('translationSystemLanguageChanged', {
        detail: { language: lng, timestamp: Date.now() }
      }));
    };

    // Subscribe to i18n language change
    i18n.on('languageChanged', handleLanguageChange);

    // Store listener for cleanup
    isTranslationInitialized = true;
    console.log('✅ Translation system initialized');

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      isTranslationInitialized = false;
    };
  } catch (error) {
    console.error('❌ Error initializing translation system:', error);
  }
};

/**
 * Force reload translations for a specific language
 */
export const reloadTranslations = async (language) => {
  try {
    console.log(`🔄 [TranslationFix] Reloading translations for: ${language}`);
    
    // Get current language
    const currentLng = i18n.language;
    
    // If same language, reload resources
    if (language === currentLng) {
      // Reload namespace
      await i18n.loadNamespaces('translation');
      console.log(`✅ [TranslationFix] Translations reloaded`);
      
      // Fire reload event
      window.dispatchEvent(new CustomEvent('translationsReloaded', {
        detail: { language: language }
      }));
    }
  } catch (error) {
    console.error('❌ Error reloading translations:', error);
  }
};

/**
 * Check if translation system is ready
 */
export const isTranslationReady = () => {
  return i18n && i18n.isInitialized && !i18n.isLoading;
};

/**
 * Get current language from i18n
 */
export const getCurrentLanguage = () => {
  return i18n?.language || 'en';
};

/**
 * Verify translations are loaded
 */
export const verifyTranslationsLoaded = () => {
  try {
    const currentLng = i18n.language;
    const resources = i18n.getResourceBundle(currentLng, 'translation');
    
    if (!resources || Object.keys(resources).length === 0) {
      // Don't show warning - just silently handle it
      // Translations may still be loading asynchronously
      console.debug(`🔄 [TranslationFix] Checking translations for: ${currentLng} (may still be loading)`);
      return false;
    }
    
    console.log(`✅ Translations verified for: ${currentLng} (${Object.keys(resources).length} keys)`);
    return true;
  } catch (error) {
    console.debug('ℹ️ [TranslationFix] Translations still loading...', error.message);
    return false;
  }
};
