import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiGlobe, FiPlus, FiTrash } from 'react-icons/fi';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇪🇬' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export function TranslationFields({ formData, setFormData, disabled = false }) {
  const { t } = useTranslation();
  const [expandedLanguages, setExpandedLanguages] = useState({
    en: true,
    ar: false,
    es: false,
    de: false,
    ru: false,
  });

  const toggleLanguage = (langCode) => {
    setExpandedLanguages(prev => ({
      ...prev,
      [langCode]: !prev[langCode]
    }));
  };

  const handleTranslationChange = (langCode, field, value) => {
    setFormData(prev => ({
      ...prev,
      [`${langCode}_${field}`]: value
    }));
  };

  const handleAddTranslationItem = (langCode, field) => {
    const fieldName = `${langCode}_${field}_items`;
    setFormData(prev => {
      const currentItems = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: [...currentItems, '']
      };
    });
  };

  const handleUpdateTranslationItem = (langCode, field, index, value) => {
    const fieldName = `${langCode}_${field}_items`;
    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).map((item, i) => i === index ? value : item)
    }));
  };

  const handleRemoveTranslationItem = (langCode, field, index) => {
    const fieldName = `${langCode}_${field}_items`;
    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddItineraryDay = (langCode) => {
    const fieldName = `${langCode}_daily_itinerary_days`;
    setFormData(prev => {
      const currentDays = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: [...currentDays, {
          day_number: currentDays.length + 1,
          title: '',
          description: '',
          activities: '',
          meals: ''
        }]
      };
    });
  };

  const handleUpdateItineraryDay = (langCode, index, field, value) => {
    const fieldName = `${langCode}_daily_itinerary_days`;
    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleRemoveItineraryDay = (langCode, index) => {
    const fieldName = `${langCode}_daily_itinerary_days`;
    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index)
    }));
  };

  const getFieldValue = (langCode, field) => {
    return formData[`${langCode}_${field}`] || '';
  };

  const getTranslationItems = (langCode, field) => {
    return formData[`${langCode}_${field}_items`] || [];
  };

  const getItineraryDays = (langCode) => {
    return formData[`${langCode}_daily_itinerary_days`] || [];
  };

  const translationFields = [
    { key: 'name', label: 'Package Name', type: 'text', placeholder: 'e.g. Amazing Pyramids Tour' },
    { key: 'short_description', label: 'Short Description', type: 'textarea', placeholder: 'Brief description...', rows: 2, maxLength: 200 },
    { key: 'detailed_description', label: 'Detailed Description', type: 'textarea', placeholder: 'Full description...', rows: 4, maxLength: 1000 },
    { key: 'whats_included', label: "What's Included", type: 'list', placeholder: 'Add items...' },
    { key: 'whats_excluded', label: "What's Excluded", type: 'list', placeholder: 'Add items...' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <FiGlobe size={24} className="text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Translations & Multi-Language Content</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {languages.map((lang) => (
          <div key={lang.code} className="border-2 border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-all">
            
            {/* Language Tab Header */}
            <button
              onClick={() => toggleLanguage(lang.code)}
              disabled={disabled}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-white">{lang.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">({lang.code})</p>
                </div>
              </div>
              <FiChevronDown
                size={20}
                className={`text-slate-600 dark:text-slate-400 transition-transform ${expandedLanguages[lang.code] ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Language Fields */}
            {expandedLanguages[lang.code] && (
              <div className="border-t-2 border-slate-300 dark:border-slate-600 p-6 space-y-6 bg-slate-50/50 dark:bg-slate-700/30">
                
                {/* Standard Translation Fields */}
                {translationFields.map((field) => (
                  <div key={`${lang.code}_${field.key}`}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-900 dark:text-white">
                        {field.label}
                      </label>
                      {field.type === 'list' && !disabled && (
                        <button
                          onClick={() => handleAddTranslationItem(lang.code, field.key)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-semibold"
                        >
                          <FiPlus size={14} />
                          Add
                        </button>
                      )}
                    </div>
                    
                    {field.type === 'list' ? (
                      <div className="space-y-2">
                        {getTranslationItems(lang.code, field.key).length > 0 ? (
                          getTranslationItems(lang.code, field.key).map((item, itemIdx) => (
                            <div key={itemIdx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => handleUpdateTranslationItem(lang.code, field.key, itemIdx, e.target.value)}
                                disabled={disabled}
                                placeholder={`${field.label} ${itemIdx + 1}...`}
                                className="flex-1 px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-blue-500 transition-all text-sm"
                              />
                              {!disabled && (
                                <button
                                  onClick={() => handleRemoveTranslationItem(lang.code, field.key, itemIdx)}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                >
                                  <FiTrash size={14} />
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 dark:text-slate-400 p-3 text-center bg-slate-200 dark:bg-slate-900/20 rounded-lg">
                            {disabled ? 'No items added' : 'No items added yet. Click "Add" to start'}
                          </div>
                        )}
                      </div>
                    ) : field.type === 'textarea' ? (
                      <div>
                        <textarea
                          value={getFieldValue(lang.code, field.key)}
                          onChange={(e) => handleTranslationChange(lang.code, field.key, e.target.value)}
                          disabled={disabled}
                          placeholder={field.placeholder}
                          rows={field.rows || 3}
                          maxLength={field.maxLength}
                          className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                        />
                        {field.maxLength && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {getFieldValue(lang.code, field.key).length}/{field.maxLength}
                          </p>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={getFieldValue(lang.code, field.key)}
                        onChange={(e) => handleTranslationChange(lang.code, field.key, e.target.value)}
                        disabled={disabled}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    )}
                  </div>
                ))}

                {/* Daily Itinerary Section */}
                <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-bold text-slate-900 dark:text-white">
                      📅 {t('itinerary.dailyItinerary', 'Daily Itinerary')}
                    </label>
                    {!disabled && (
                      <button
                        onClick={() => handleAddItineraryDay(lang.code)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold"
                      >
                        <FiPlus size={16} />
                        Add Day
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {getItineraryDays(lang.code).length > 0 ? (
                      getItineraryDays(lang.code).map((day, dayIdx) => (
                        <div key={dayIdx} className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 dark:text-white">Day {day.day_number}</h4>
                            {!disabled && (
                              <button
                                onClick={() => handleRemoveItineraryDay(lang.code, dayIdx)}
                                className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              >
                                <FiTrash size={16} />
                              </button>
                            )}
                          </div>

                          {/* Day Title */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Day Title
                            </label>
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => handleUpdateItineraryDay(lang.code, dayIdx, 'title', e.target.value)}
                              disabled={disabled}
                              placeholder="e.g. Cairo Tour"
                              className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-green-500 transition-all text-sm"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Description
                            </label>
                            <textarea
                              value={day.description}
                              onChange={(e) => handleUpdateItineraryDay(lang.code, dayIdx, 'description', e.target.value)}
                              disabled={disabled}
                              placeholder="Day description..."
                              rows="2"
                              className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-green-500 transition-all resize-none text-sm"
                            />
                          </div>

                          {/* Activities */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Activities (comma separated)
                            </label>
                            <input
                              type="text"
                              value={day.activities}
                              onChange={(e) => handleUpdateItineraryDay(lang.code, dayIdx, 'activities', e.target.value)}
                              disabled={disabled}
                              placeholder="e.g. Visit pyramids, Museum tour, Boat ride"
                              className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-green-500 transition-all text-sm"
                            />
                          </div>

                          {/* Meals */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Meals (B, L, D)
                            </label>
                            <input
                              type="text"
                              value={day.meals}
                              onChange={(e) => handleUpdateItineraryDay(lang.code, dayIdx, 'meals', e.target.value)}
                              disabled={disabled}
                              placeholder="e.g. B, L, D"
                              className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-green-500 transition-all text-sm"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 dark:text-slate-400 p-4 text-center bg-slate-200 dark:bg-slate-900/20 rounded-lg">
                        {disabled ? 'No itinerary days added' : 'No days added yet. Click "Add Day" to start'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
        <p className="font-semibold mb-1">💡 Translation Tip:</p>
        <p>Expand each language tab and fill in the translation fields. All translations are automatically saved to the database and will be displayed based on the user's language preference.</p>
      </div>
    </div>
  );
}

export default TranslationFields;
