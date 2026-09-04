import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstantTranslation } from '../../hooks/useInstantTranslation';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../services/libreTranslateService';
import {
  FiChevronDown,
  FiMapPin,
  FiClock,
  FiCheck,
  FiActivity,
  FiImage,
} from 'react-icons/fi';
import { Card } from '../common';
import './ItineraryDetails.css';

/**
 * ItineraryDetails Component
 * Displays package itinerary with day-by-day breakdown
 * Features: Expandable days, images, activities, meals
 */
export const ItineraryDetails = ({ itineraries = [], loading = false }) => {
  const [expandedDay, setExpandedDay] = useState(null);
  const [translatedDays, setTranslatedDays] = useState({});
  const [translating, setTranslating] = useState(false);
  const { i18n, t } = useInstantTranslation();

  // Debug effect to log data
  useEffect(() => {
    console.log('📅 [ItineraryDetails] Received props:', {
      itineraries,
      loading,
      itinerariesLength: itineraries?.length || 0,
      itinerariesIsArray: Array.isArray(itineraries),
      sampleItem: itineraries?.[0]
    });
  }, [itineraries, loading]);

  // 🌐 Helper function to translate itinerary with fallback chain
  const getTranslatedItinerary = useCallback((day) => {
    if (!day) return day;
    
    const lang = i18n.language || 'en';
    
    // Map language codes - normalize if needed
    const langMap = {
      'ar': 'ar',
      'en': 'en',
      'es': 'es',
      'de': 'de',
      'ru': 'ru'
    };
    
    const normalizedLang = langMap[lang] || lang;
    
    console.log(`[getTranslatedItinerary] Processing Day ${day.day_number} for language: ${normalizedLang}`, {
      has_translation_fields: {
        [`${normalizedLang}_title`]: !!day[`${normalizedLang}_title`],
        [`${normalizedLang}_description`]: !!day[`${normalizedLang}_description`],
        [`${normalizedLang}_activities`]: !!day[`${normalizedLang}_activities`],
        [`${normalizedLang}_meals`]: !!day[`${normalizedLang}_meals`],
      }
    });
    
    // Helper to check if value is valid and not empty
    const isValidString = (val) => val && typeof val === 'string' && val.trim() !== '' && val !== 'undefined';
    
    // Get translation chain: lang specific -> English -> base value
    const getTranslated = (baseValue, langValue, enValue) => {
      // If language is English, use English translation or base
      if (normalizedLang === 'en') {
        return enValue || baseValue || '';
      }
      
      // For other languages: language-specific > English > base
      if (isValidString(langValue)) return langValue;
      if (isValidString(enValue)) return enValue;
      return baseValue || '';
    };
    
    // Build display values
    const display_title = getTranslated(
      day.title || `Day ${day.day_number || day.day}`,
      day[`${normalizedLang}_title`],
      day.en_title
    );
    
    const display_description = getTranslated(
      day.description || '',
      day[`${normalizedLang}_description`],
      day.en_description
    );
    
    const display_activities = getTranslated(
      day.activities || '',
      day[`${normalizedLang}_activities`],
      day.en_activities
    );
    
    const display_meals = getTranslated(
      day.meals || '',
      day[`${normalizedLang}_meals`],
      day.en_meals
    );
    
    console.log(`[getTranslatedItinerary] ✅ Day ${day.day_number} translated for ${normalizedLang}:`, {
      title_source: normalizedLang !== 'en' && day[`${normalizedLang}_title`] ? 'lang_specific' : day.en_title ? 'english' : 'base',
      display_title
    });
    
    return {
      ...day,
      display_title,
      display_description,
      display_activities,
      display_meals,
    };
  }, [i18n.language]);

  // Auto-translate itineraries when language changes
  useEffect(() => {
    const lang = i18n.language || 'en';
    
    if (!itineraries || itineraries.length === 0) {
      console.log(`[ItineraryDetails] No itineraries to translate`);
      return;
    }

    console.log(`📅 [ItineraryDetails] Language changed to: ${lang}`, {
      firstItinerary: {
        title: itineraries[0]?.title,
        [`${lang}_title`]: itineraries[0]?.[`${lang}_title`],
      }
    });

    // Don't auto-translate if we already have the translations in the DB
    const allHaveTranslations = itineraries.every(day => 
      day[`${lang}_title`] || day[`${lang}_description`]
    );

    if (allHaveTranslations && lang !== 'en') {
      console.log(`✅ [ItineraryDetails] All itineraries already have ${lang} translations from DB`);
      return;
    }
  }, [i18n.language, itineraries]);

  // Sort itineraries by day number
  const sortedItineraries = useMemo(() => {
    if (!itineraries || itineraries.length === 0) return [];
    return [...itineraries].sort((a, b) => (a.day_number || a.day) - (b.day_number || b.day));
  }, [itineraries]);

  // Translate itineraries when language changes (FIXED: Added getTranslatedItinerary to deps)
  const translatedItineraries = useMemo(() => {
    console.log(`[ItineraryDetails] Creating translated itineraries for language: ${i18n.language}`);
    const result = sortedItineraries.map(day => {
      const translated = getTranslatedItinerary(day);
      console.log(`[ItineraryDetails] Day ${day.day_number}:`, {
        original_title: day.title,
        lang: i18n.language,
        field_name: `${i18n.language}_title`,
        translated_title: translated.display_title,
        all_fields: {
          title: day.title,
          ar_title: day.ar_title,
          es_title: day.es_title,
          de_title: day.de_title,
          ru_title: day.ru_title,
        }
      });
      return translated;
    });
    return result;
  }, [sortedItineraries, getTranslatedItinerary]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          <span className="ml-3 text-slate-500">Loading itinerary...</span>
        </div>
      </Card>
    );
  }

  if (!sortedItineraries || sortedItineraries.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-slate-500 mb-2">📋 No itinerary details available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('itinerary.dailyItinerary', 'Daily Itinerary')}
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          {translatedItineraries.length} {t('itinerary.daysOfExperiences', 'days of unforgettable experiences')}
        </p>
      </div>

      <div className="space-y-3">
        {translatedItineraries.map((day, index) => (
          <ItineraryDayItem
            key={day.id || index}
            day={day}
            isExpanded={expandedDay === day.id}
            onToggle={() =>
              setExpandedDay(expandedDay === day.id ? null : day.id)
            }
          />
        ))}
      </div>

      {/* Timeline Visual */}
      {translatedItineraries.length > 1 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <ItineraryTimeline days={translatedItineraries} />
        </div>
      )}
    </Card>
  );
};

/**
 * Single Day Item Component
 */
const ItineraryDayItem = ({ day, isExpanded, onToggle }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <button
        onClick={onToggle}
        className="w-full"
      >
        <div
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            isExpanded
              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 bg-white dark:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  {day.day_number || day.day}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-left">
                    {day.display_title || day.title || `Day ${day.day_number || day.day}`}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
                    {(day.display_description || day.description)?.substring(0, 60) || 'No description'}
                    {(day.display_description || day.description) && (day.display_description || day.description).length > 60 ? '...' : ''}
                  </p>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiChevronDown
                size={20}
                className={`${
                  isExpanded
                    ? 'text-teal-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
            </motion.div>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4 border-l-4 border-teal-500">
              {/* Full Description */}
              {(day.display_description || day.description) && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiMapPin size={16} className="text-teal-500" />
                    {t('itinerary.description', 'Description')}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    {day.display_description || day.description}
                  </p>
                </div>
              )}

              {/* Activities */}
              {(day.display_activities || day.activities) && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiActivity size={16} className="text-green-500" />
                    {t('itinerary.activities', 'Activities')}
                  </h4>
                  <div className="space-y-2">
                    {typeof (day.display_activities || day.activities) === 'string'
                      ? (day.display_activities || day.activities).split(',').map((activity, idx) => (
                          <ActivityItem key={idx} activity={activity.trim()} />
                        ))
                      : Array.isArray(day.display_activities || day.activities)
                      ? (day.display_activities || day.activities).map((activity, idx) => (
                          <ActivityItem key={idx} activity={activity} />
                        ))
                      : null}
                  </div>
                </div>
              )}

              {/* Meals */}
              {(day.display_meals || day.meals) && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiCheck size={16} className="text-orange-500" />
                    {t('itinerary.meals', 'Meals')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {typeof (day.display_meals || day.meals) === 'string'
                      ? (day.display_meals || day.meals).split(',').map((meal, idx) => (
                          <MealBadge key={idx} meal={meal.trim()} />
                        ))
                      : Array.isArray(day.display_meals || day.meals)
                      ? (day.display_meals || day.meals).map((meal, idx) => (
                          <MealBadge key={idx} meal={meal} />
                        ))
                      : null}
                  </div>
                </div>
              )}

              {/* Image */}
              {day.image_url && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiImage size={16} className="text-orange-500" />
                    {t('itinerary.image', 'Image')}
                  </h4>
                  <div className="rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={day.image_url}
                      alt={`Day ${day.day_number || day.day}`}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Time/Duration if available */}
              {day.time && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiClock size={16} className="text-red-500" />
                    {t('itinerary.duration', 'Duration')}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{day.time}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Activity Item Component
 */
const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-2">
    <div className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-green-500"></div>
    <span className="text-sm text-slate-600 dark:text-slate-300">{activity}</span>
  </div>
);

/**
 * Meal Badge Component
 */
const MealBadge = ({ meal }) => {
  const getMealColor = (mealType) => {
    const lower = mealType.toLowerCase();
    if (lower.includes('breakfast')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    if (lower.includes('lunch')) return 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200';
    if (lower.includes('dinner')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
    return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMealColor(meal)}`}>
      {meal}
    </span>
  );
};

/**
 * Timeline Visual Component
 */
const ItineraryTimeline = ({ days }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">
        {t('itinerary.tripTimeline', 'Trip Timeline')}
      </h3>
      <div className="flex items-center justify-between px-2">
        {days.map((day, index) => (
          <div key={day.id || index} className="flex flex-col items-center">
            {/* Day Marker */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold mb-2">
              {day.day_number || day.day}
            </div>

            {/* Label */}
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t('itinerary.day', 'Day')} {day.day_number || day.day}
            </p>

            {/* Line */}
            {index < days.length - 1 && (
              <div className="h-2 w-0.5 bg-slate-200 dark:bg-slate-700 my-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryDetails;
