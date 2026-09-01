import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from './useLanguage';
import * as translationManager from '../services/translationManager';

/**
 * 🔥 Hook for auto-translating packages when language changes
 * 
 * Usage in any component that loads packages:
 * ```
 * const { translatedPackages, isTranslating } = useAutoTranslatePackages(
 *   fetchedPackages,
 *   ['title', 'short_desc', 'destination']
 * );
 * 
 * // Use translatedPackages instead of fetchedPackages
 * ```
 */
export const useAutoTranslatePackages = (
  packages = [],
  fieldsToTranslate = ['title', 'destination', 'short_desc', 'long_desc']
) => {
  const { language: currentLanguage } = useLanguage();
  const [translatedPackages, setTranslatedPackages] = useState(packages);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  /**
   * Main translation trigger
   */
  const translatePackages = useCallback(async (pkgs, targetLanguage) => {
    if (!pkgs || pkgs.length === 0) {
      setTranslatedPackages([]);
      return [];
    }

    // No translation needed for English
    if (targetLanguage === 'en') {
      setTranslatedPackages(pkgs);
      return pkgs;
    }

    try {
      setIsTranslating(true);
      setTranslationError(null);

      console.log(`\n📦 [useAutoTranslatePackages] Auto-translating ${pkgs.length} packages to ${targetLanguage}\n`);

      const translated = await translationManager.autoTranslatePackagesOnLanguageChange(
        pkgs,
        targetLanguage,
        fieldsToTranslate,
        'en'
      );

      setTranslatedPackages(translated);
      setTranslationError(null);

      return translated;
    } catch (error) {
      console.error('❌ [useAutoTranslatePackages] Translation error:', error);
      setTranslationError(error.message);
      setTranslatedPackages(pkgs); // Fallback to original
      return pkgs;
    } finally {
      setIsTranslating(false);
    }
  }, [fieldsToTranslate]);

  /**
   * Auto-translate when language changes
   */
  useEffect(() => {
    if (packages && packages.length > 0) {
      translatePackages(packages, currentLanguage);
    }
  }, [currentLanguage, packages, translatePackages]);

  return {
    translatedPackages,
    isTranslating,
    translationError,
    translatePackages: (pkgs) => translatePackages(pkgs, currentLanguage)
  };
};

/**
 * Alternative: Manual hook for components that need manual control
 */
export const useManualTranslatePackages = () => {
  const { language: currentLanguage } = useLanguage();

  const translate = useCallback(
    async (packages, fieldsToTranslate = ['title', 'destination', 'short_desc', 'long_desc']) => {
      return await translationManager.autoTranslatePackagesOnLanguageChange(
        packages,
        currentLanguage,
        fieldsToTranslate
      );
    },
    [currentLanguage]
  );

  return { translate };
};

export default useAutoTranslatePackages;
