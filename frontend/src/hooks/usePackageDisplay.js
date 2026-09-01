import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Hook متخصص لعرض بيانات الحزم/الرحلات مع ترجمة ديناميكية
 * يتعامل مع جميع الحالات والأخطاء تلقائياً
 */
export const usePackageDisplay = (packageData) => {
  const { t } = useTranslation();

  // دالة آمنة للحصول على حقل مع fallback
  const getDisplayField = useCallback((fieldName, fallbackText = '') => {
    try {
      // Fallback للبيانات الأصلية
      if (packageData?.[fieldName]) {
        return packageData[fieldName];
      }

      // Fallback للترجمات الثابتة
      return fallbackText || t(`packages.${fieldName}`, '');
    } catch (error) {
      console.warn(`Error getting field: ${fieldName}`, error);
      return fallbackText || '';
    }
  }, [packageData, t]);

  // دالة للحصول على السعر بصيغة مقروءة
  const getFormattedPrice = useCallback((price, currency = 'USD') => {
    if (!price && price !== 0) return 'Contact for price';
    return `${currency} ${parseFloat(price).toFixed(2)}`;
  }, []);

  // دالة للحصول على المدة بصيغة مقروءة
  const getFormattedDuration = useCallback((days, nights) => {
    const dayLabel = days ? `${days} ${t('packages.days', 'Days')}` : '';
    const nightLabel = nights ? `${nights} ${t('packages.nights', 'Nights')}` : '';
    return [dayLabel, nightLabel].filter(Boolean).join(' / ');
  }, [t]);

  // دالة للحصول على البرنامج (Itinerary) مترجم
  const getItinerary = useCallback(() => {
    const itinerary = packageData?.itinerary;
    
    if (typeof itinerary === 'string') {
      // إذا كان نص واحد
      return [{
        day: 1,
        title: t('packages.itinerary', 'Itinerary'),
        description: itinerary
      }];
    }

    if (Array.isArray(itinerary)) {
      // إذا كان مصفوفة
      return itinerary;
    }

    return [];
  }, [packageData?.itinerary, t]);

  // دالة للحصول على قائمة المشمولات (Includes)
  const getIncludes = useCallback(() => {
    const includes = packageData?.includes;
    
    if (Array.isArray(includes)) return includes;
    if (typeof includes === 'string') return includes.split(',').map(s => s.trim());
    return [];
  }, [packageData?.includes]);

  // دالة للحصول على قائمة المستثنيات (Excludes)
  const getExcludes = useCallback(() => {
    const excludes = packageData?.excludes;
    
    if (Array.isArray(excludes)) return excludes;
    if (typeof excludes === 'string') return excludes.split(',').map(s => s.trim());
    return [];
  }, [packageData?.excludes]);

  // دالة للحصول على جميع التفاصيل مع ترجمة
  const getCompletePackageInfo = useCallback(() => {
    return {
      id: packageData?.id,
      name: getDisplayField('name', packageData?.name),
      description: getDisplayField('description', packageData?.description),
      price: packageData?.price,
      formattedPrice: getFormattedPrice(packageData?.price),
      duration: getFormattedDuration(packageData?.days, packageData?.nights),
      days: packageData?.days,
      nights: packageData?.nights,
      groupSize: packageData?.groupSize,
      difficulty: packageData?.difficulty,
      location: getDisplayField('location', packageData?.location),
      images: packageData?.images || [],
      rating: packageData?.rating,
      reviews: packageData?.reviews,
      itinerary: getItinerary(),
      includes: getIncludes(),
      excludes: getExcludes(),
      highlights: packageData?.highlights,
      availableFrom: packageData?.availableFrom,
      availableTo: packageData?.availableTo,
      category: packageData?.category
    };
  }, [
    packageData, 
    getDisplayField, 
    getFormattedPrice, 
    getFormattedDuration,
    getItinerary,
    getIncludes,
    getExcludes
  ]);

  return {
    getDisplayField,
    getFormattedPrice,
    getFormattedDuration,
    getItinerary,
    getIncludes,
    getExcludes,
    getCompletePackageInfo
  };
};

/**
 * Hook للعمل مع قوائم الحزم (متعددة)
 */
export const usePackageListDisplay = (packagesArray) => {
  const packagesHooks = packagesArray?.map(pkg => usePackageDisplay(pkg)) || [];

  const getCompleteList = useCallback(() => {
    return packagesArray?.map((pkg, index) => ({
      ...pkg,
      displayInfo: packagesHooks[index]?.getCompletePackageInfo()
    })) || [];
  }, [packagesArray, packagesHooks]);

  const isAnyTranslating = false;

  return {
    packagesHooks,
    getCompleteList,
    isAnyTranslating,
    count: packagesArray?.length || 0
  };
};

export default usePackageDisplay;
