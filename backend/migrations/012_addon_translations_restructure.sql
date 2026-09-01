-- Migration to restructure package_addon_translations
-- Remove old columns and add new translation fields aligned with packages

BEGIN;

-- Step 1: Add new columns to package_addon_translations
ALTER TABLE package_addon_translations
ADD COLUMN IF NOT EXISTS package_name VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS short_description VARCHAR(500) DEFAULT '',
ADD COLUMN IF NOT EXISTS detailed_description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS whats_included TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS whats_excluded TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS daily_itinerary TEXT DEFAULT NULL;

-- Step 2: Remove old columns from package_addons (move translations to translations table)
ALTER TABLE package_addons
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS price,
DROP COLUMN IF EXISTS category;

-- Step 3: Ensure package_addon_translations has the correct constraints
ALTER TABLE package_addon_translations
ALTER COLUMN package_name SET NOT NULL,
ALTER COLUMN short_description SET NOT NULL,
ALTER COLUMN detailed_description SET NOT NULL;

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_package_addon_translations_addon_id 
ON package_addon_translations(addon_id);

CREATE INDEX IF NOT EXISTS idx_package_addon_translations_language 
ON package_addon_translations(language);

CREATE INDEX IF NOT EXISTS idx_package_addon_translations_addon_language 
ON package_addon_translations(addon_id, language);

COMMIT;
