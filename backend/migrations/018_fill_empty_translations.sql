-- Fill empty translation fields with English values
-- This ensures that old packages have translations

UPDATE packages 
SET 
  -- English translations (fill from base fields if empty)
  en_name = CASE WHEN en_name IS NULL OR en_name = '' THEN title ELSE en_name END,
  en_short_description = CASE WHEN en_short_description IS NULL OR en_short_description = '' THEN short_desc ELSE en_short_description END,
  en_detailed_description = CASE WHEN en_detailed_description IS NULL OR en_detailed_description = '' THEN long_desc ELSE en_detailed_description END,
  
  -- Arabic translations (use English as fallback if empty)
  ar_name = CASE WHEN ar_name IS NULL OR ar_name = '' THEN COALESCE(en_name, title) ELSE ar_name END,
  ar_short_description = CASE WHEN ar_short_description IS NULL OR ar_short_description = '' THEN COALESCE(en_short_description, short_desc) ELSE ar_short_description END,
  ar_detailed_description = CASE WHEN ar_detailed_description IS NULL OR ar_detailed_description = '' THEN COALESCE(en_detailed_description, long_desc) ELSE ar_detailed_description END,
  
  -- Spanish translations (use English as fallback if empty)
  es_name = CASE WHEN es_name IS NULL OR es_name = '' THEN COALESCE(en_name, title) ELSE es_name END,
  es_short_description = CASE WHEN es_short_description IS NULL OR es_short_description = '' THEN COALESCE(en_short_description, short_desc) ELSE es_short_description END,
  es_detailed_description = CASE WHEN es_detailed_description IS NULL OR es_detailed_description = '' THEN COALESCE(en_detailed_description, long_desc) ELSE es_detailed_description END,
  
  -- German translations (use English as fallback if empty)
  de_name = CASE WHEN de_name IS NULL OR de_name = '' THEN COALESCE(en_name, title) ELSE de_name END,
  de_short_description = CASE WHEN de_short_description IS NULL OR de_short_description = '' THEN COALESCE(en_short_description, short_desc) ELSE de_short_description END,
  de_detailed_description = CASE WHEN de_detailed_description IS NULL OR de_detailed_description = '' THEN COALESCE(en_detailed_description, long_desc) ELSE de_detailed_description END,
  
  -- Russian translations (use English as fallback if empty)
  ru_name = CASE WHEN ru_name IS NULL OR ru_name = '' THEN COALESCE(en_name, title) ELSE ru_name END,
  ru_short_description = CASE WHEN ru_short_description IS NULL OR ru_short_description = '' THEN COALESCE(en_short_description, short_desc) ELSE ru_short_description END,
  ru_detailed_description = CASE WHEN ru_detailed_description IS NULL OR ru_detailed_description = '' THEN COALESCE(en_detailed_description, long_desc) ELSE ru_detailed_description END;

-- Also fill what's_included and what's_excluded fields with English values as fallback
UPDATE packages 
SET 
  -- English whats_included/excluded (fallback)
  en_whats_included = CASE WHEN en_whats_included IS NULL OR en_whats_included = '' THEN '' ELSE en_whats_included END,
  en_whats_excluded = CASE WHEN en_whats_excluded IS NULL OR en_whats_excluded = '' THEN '' ELSE en_whats_excluded END,
  
  -- Other languages use English as fallback
  ar_whats_included = CASE WHEN ar_whats_included IS NULL OR ar_whats_included = '' THEN COALESCE(en_whats_included, '') ELSE ar_whats_included END,
  ar_whats_excluded = CASE WHEN ar_whats_excluded IS NULL OR ar_whats_excluded = '' THEN COALESCE(en_whats_excluded, '') ELSE ar_whats_excluded END,
  
  es_whats_included = CASE WHEN es_whats_included IS NULL OR es_whats_included = '' THEN COALESCE(en_whats_included, '') ELSE es_whats_included END,
  es_whats_excluded = CASE WHEN es_whats_excluded IS NULL OR es_whats_excluded = '' THEN COALESCE(en_whats_excluded, '') ELSE es_whats_excluded END,
  
  de_whats_included = CASE WHEN de_whats_included IS NULL OR de_whats_included = '' THEN COALESCE(en_whats_included, '') ELSE de_whats_included END,
  de_whats_excluded = CASE WHEN de_whats_excluded IS NULL OR de_whats_excluded = '' THEN COALESCE(en_whats_excluded, '') ELSE de_whats_excluded END,
  
  ru_whats_included = CASE WHEN ru_whats_included IS NULL OR ru_whats_included = '' THEN COALESCE(en_whats_included, '') ELSE ru_whats_included END,
  ru_whats_excluded = CASE WHEN ru_whats_excluded IS NULL OR ru_whats_excluded = '' THEN COALESCE(en_whats_excluded, '') ELSE ru_whats_excluded END
WHERE en_name IS NULL OR en_name = '' OR en_short_description IS NULL OR en_short_description = '';

-- Fill itineraries translation fields
UPDATE itineraries 
SET 
  -- English translations (fill from base fields if empty)
  en_title = CASE WHEN en_title IS NULL OR en_title = '' THEN title ELSE en_title END,
  en_description = CASE WHEN en_description IS NULL OR en_description = '' THEN description ELSE en_description END,
  en_activities = CASE WHEN en_activities IS NULL OR en_activities = '' THEN activities ELSE en_activities END,
  en_meals = CASE WHEN en_meals IS NULL OR en_meals = '' THEN meals ELSE en_meals END,
  
  -- Arabic translations (use English as fallback if empty)
  ar_title = CASE WHEN ar_title IS NULL OR ar_title = '' THEN COALESCE(en_title, title) ELSE ar_title END,
  ar_description = CASE WHEN ar_description IS NULL OR ar_description = '' THEN COALESCE(en_description, description) ELSE ar_description END,
  ar_activities = CASE WHEN ar_activities IS NULL OR ar_activities = '' THEN COALESCE(en_activities, activities) ELSE ar_activities END,
  ar_meals = CASE WHEN ar_meals IS NULL OR ar_meals = '' THEN COALESCE(en_meals, meals) ELSE ar_meals END,
  
  -- Spanish translations (use English as fallback if empty)
  es_title = CASE WHEN es_title IS NULL OR es_title = '' THEN COALESCE(en_title, title) ELSE es_title END,
  es_description = CASE WHEN es_description IS NULL OR es_description = '' THEN COALESCE(en_description, description) ELSE es_description END,
  es_activities = CASE WHEN es_activities IS NULL OR es_activities = '' THEN COALESCE(en_activities, activities) ELSE es_activities END,
  es_meals = CASE WHEN es_meals IS NULL OR es_meals = '' THEN COALESCE(en_meals, meals) ELSE es_meals END,
  
  -- German translations (use English as fallback if empty)
  de_title = CASE WHEN de_title IS NULL OR de_title = '' THEN COALESCE(en_title, title) ELSE de_title END,
  de_description = CASE WHEN de_description IS NULL OR de_description = '' THEN COALESCE(en_description, description) ELSE de_description END,
  de_activities = CASE WHEN de_activities IS NULL OR de_activities = '' THEN COALESCE(en_activities, activities) ELSE de_activities END,
  de_meals = CASE WHEN de_meals IS NULL OR de_meals = '' THEN COALESCE(en_meals, meals) ELSE de_meals END,
  
  -- Russian translations (use English as fallback if empty)
  ru_title = CASE WHEN ru_title IS NULL OR ru_title = '' THEN COALESCE(en_title, title) ELSE ru_title END,
  ru_description = CASE WHEN ru_description IS NULL OR ru_description = '' THEN COALESCE(en_description, description) ELSE ru_description END,
  ru_activities = CASE WHEN ru_activities IS NULL OR ru_activities = '' THEN COALESCE(en_activities, activities) ELSE ru_activities END,
  ru_meals = CASE WHEN ru_meals IS NULL OR ru_meals = '' THEN COALESCE(en_meals, meals) ELSE ru_meals END
WHERE en_title IS NULL OR en_title = '' OR en_description IS NULL OR en_description = '';
