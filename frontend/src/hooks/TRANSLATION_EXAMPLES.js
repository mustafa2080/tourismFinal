/**
 * مثال عملي: كيفية استخدام الترجمة الديناميكية في صفحة الرحلات
 * 
 * الاستخدام في PackageDetailPage.jsx أو أي صفحة أخرى تعرض بيانات ديناميكية
 */

import { usePackageDisplay } from '../hooks/usePackageDisplay';
import { useTranslation } from 'react-i18next';
import Spinner from '../components/common/Spinner';

/**
 * مثال 1: عرض تفاصيل رحلة واحدة مع ترجمة ديناميكية
 */
export const PackageDetailWithTranslation = ({ packageData }) => {
  const { t } = useTranslation();
  const {
    isTranslating,
    getDisplayField,
    getFormattedPrice,
    getFormattedDuration,
    getItinerary,
    getIncludes,
    getExcludes,
    getCompletePackageInfo
  } = usePackageDisplay(packageData);

  if (isTranslating) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span>{t('dynamic.translating')}</span>
      </div>
    );
  }

  const info = getCompletePackageInfo();

  return (
    <div className="package-detail-container">
      {/* العنوان مترجم */}
      <h1>{getDisplayField('name', packageData.name)}</h1>

      {/* الوصف مترجم */}
      <p className="description">
        {getDisplayField('description', packageData.description)}
      </p>

      {/* السعر مع التنسيق */}
      <div className="price-section">
        <span className="label">{t('packages.price')}:</span>
        <span className="price">{getFormattedPrice(packageData.price)}</span>
      </div>

      {/* المدة مع التنسيق */}
      <div className="duration-section">
        <span className="label">{t('packages.duration')}:</span>
        <span className="duration">{getFormattedDuration(packageData.days, packageData.nights)}</span>
      </div>

      {/* البرنامج اليومي مترجم */}
      <div className="itinerary-section">
        <h2>{t('packages.itinerary')}</h2>
        {getItinerary().map((day, index) => (
          <div key={index} className="day-item">
            <h3>{t('home.destination')} {day.day}</h3>
            <p>{day.description}</p>
          </div>
        ))}
      </div>

      {/* المشمولات مترجمة */}
      <div className="includes-section">
        <h3>{t('packages.includes')}</h3>
        <ul>
          {getIncludes().map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* المستثنيات مترجمة */}
      <div className="excludes-section">
        <h3>{t('packages.excludes')}</h3>
        <ul>
          {getExcludes().map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * مثال 2: عرض قائمة رحلات مع ترجمة ديناميكية
 */
import { usePackageListDisplay } from '../hooks/usePackageDisplay';

export const PackageListWithTranslation = ({ packages }) => {
  const { t } = useTranslation();
  const { getCompleteList, isAnyTranslating, count } = usePackageListDisplay(packages);

  if (isAnyTranslating) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span>{t('dynamic.translating')} {count} {t('packages.allPackages')}</span>
      </div>
    );
  }

  const completeList = getCompleteList();

  return (
    <div className="packages-grid">
      {completeList.map((pkg) => (
        <div key={pkg.id} className="package-card">
          <h3>{pkg.displayInfo.name}</h3>
          <p>{pkg.displayInfo.description}</p>
          <p className="price">{pkg.displayInfo.formattedPrice}</p>
          <p className="duration">{pkg.displayInfo.duration}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * مثال 3: استخدام في Hook مخصص
 */
import { useEffect, useState } from 'react';

export const usePackageWithAutoTranslation = (packageId, packagesService) => {
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndTranslate = async () => {
      try {
        // جلب البيانات من API
        const response = await packagesService.getPackageById(packageId);
        
        if (response.success) {
          // البيانات ستُترجم تلقائياً عند استخدام usePackageDisplay
          setPackageData(response.data);
        }
      } catch (error) {
        console.error('Error fetching package:', error);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchAndTranslate();
    }
  }, [packageId]);

  const display = usePackageDisplay(packageData);

  return {
    packageData,
    loading,
    ...display
  };
};

/**
 * مثال 4: دمج مع صفحة الحجز
 */
export const BookingPageExample = ({ packageId }) => {
  const { packageData, isTranslating, getDisplayField } = usePackageWithAutoTranslation(packageId);
  const { t } = useTranslation();

  if (!packageData) return <Spinner />;

  return (
    <div className="booking-page">
      {isTranslating && (
        <div className="translation-banner">
          {t('dynamic.translating')}...
        </div>
      )}

      <div className="booking-summary">
        <h2>{t('booking.title')}</h2>
        <p>{t('booking.selectParticipants')}</p>

        <div className="package-summary">
          <h3>{getDisplayField('name')}</h3>
          <p>{getDisplayField('description')}</p>
          
          <div className="package-highlights">
            {/* عرض المميزات المترجمة */}
            {getDisplayField('highlights')}
          </div>
        </div>
      </div>

      <form>
        {/* نموذج الحجز */}
      </form>
    </div>
  );
};

/**
 * مثال 5: استخدام مع البحث والفلترة
 */
export const SearchResultsWithTranslation = ({ searchResults }) => {
  const { t, i18n } = useTranslation();
  const { packagesHooks, isAnyTranslating } = usePackageListDisplay(searchResults);

  return (
    <div className="search-results">
      <h2>
        {t('search.resultsFor')} - {searchResults.length} {t('search.found')}
      </h2>

      {isAnyTranslating && (
        <div className="loading-indicator">
          <Spinner />
          <p>{t('dynamic.translating')}</p>
        </div>
      )}

      <div className="results-grid">
        {searchResults.map((pkg, idx) => {
          const hook = packagesHooks[idx];
          return (
            <div key={pkg.id} className="result-card">
              <h3>{hook?.getDisplayField('name') || pkg.name}</h3>
              <p>{hook?.getDisplayField('description') || pkg.description}</p>
              <p className="location">
                📍 {hook?.getDisplayField('location') || pkg.location}
              </p>
              <p className="price">
                {hook?.getFormattedPrice(pkg.price)}
              </p>
              <p className="duration">
                🕐 {hook?.getFormattedDuration(pkg.days, pkg.nights)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ملاحظات مهمة:
 * 
 * 1. البيانات تُترجم تلقائياً عند تحميل الرحلة الجديدة
 * 2. الترجمات تُخزّن في localStorage وتُستخدم مباشرة عند الحاجة
 * 3. عند تغيير اللغة، تُستخدم الترجمات المحفوظة مباشرة بدون API
 * 4. إذا لم تكن هناك ترجمة محفوظة، يتم طلبها من API
 * 5. جميع الحقول تدعم fallback للقيم الأصلية
 * 
 * الفوائد:
 * ✅ سرعة فائقة: استخدام الـ Cache بدلاً من API في كل مرة
 * ✅ أداء ممتاز: الترجمات تُحمل بشكل غير متزامن
 * ✅ تجربة سلسة: لا توجد تأخيرات أثناء التنقل بين اللغات
 * ✅ حل جذري: أي رحلة جديدة تُترجم تلقائياً
 */

export default PackageDetailWithTranslation;
