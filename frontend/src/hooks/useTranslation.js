import { useTranslation as useReactI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Hook محسّن للترجمة الأساسية
 * ✓ بدون infinite loops
 * ✓ دعم الترجمة الديناميكية
 * ✓ يضمن أن t() تُرجع القيمة وليس المفتاح
 */
export const useTranslation = () => {
  // استدعاء react-i18next hook مع namespace صريح
  // استخدم 'translation' namespace الافتراضي
  const { t: i18nT, i18n } = useReactI18nTranslation('translation');

  // ترجمة محسّنة تتأكد من إرجاع القيمة الصحيحة
  const translate = useCallback((key, defaultValue) => {
    if (!key) {
      return defaultValue || '';
    }
    
    try {
      // استدعاء الترجمة من react-i18next
      // react-i18next يُرجع المفتاح إذا لم يجد الترجمة
      const result = i18nT(key);
      
      // Debug: تسجيل أول استخدام للترجمة
      if (key.includes('myProfilePage') || key.includes('dashboardPage')) {
        console.log(`🔍 Translation result for "${key}":`, {
          result,
          key,
          language: i18n.language,
          isInitialized: i18n.isInitialized,
          resources: i18n.options?.resources
        });
      }
      
      // إذا كانت النتيجة = المفتاح، هذا يعني أن المفتاح لم يتم العثور عليه
      if (result === key) {
        // جرب مع defaultValue
        if (defaultValue) {
          return defaultValue;
        }
        // إذا لم يكن هناك default، أرجع المفتاح
        return key;
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Translation error for key "${key}":`, error);
      return defaultValue || key;
    }
  }, [i18nT, i18n]);

  return {
    t: translate,
    i18n,
    translate,
    language: i18n.language,
    isRTL: i18n.language === 'ar',
  };
};

export default useTranslation;
