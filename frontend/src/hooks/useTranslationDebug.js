/**
 * Translation Debug Hook
 * Logs all translation-related events for debugging
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export const useTranslationDebug = (componentName) => {
  const { t, i18n } = useTranslation();
  const { languageChangeCounter, currentLanguage } = useLanguage();
  const prevLanguageRef = useRef(i18n.language);
  const callCountRef = useRef(0);

  useEffect(() => {
    callCountRef.current++;
    const callCount = callCountRef.current;

    console.log(`
    🔍 [${componentName}] Translation Debug #${callCount}
    - i18n.language: ${i18n.language}
    - currentLanguage (context): ${currentLanguage}
    - languageChangeCounter: ${languageChangeCounter}
    - Previous language: ${prevLanguageRef.current}
    - Language changed: ${prevLanguageRef.current !== i18n.language}
    - t function available: ${typeof t === 'function'}
    `);

    prevLanguageRef.current = i18n.language;
  }, [i18n.language, currentLanguage, languageChangeCounter, t, componentName]);

  return { t, i18n };
};

export default useTranslationDebug;
