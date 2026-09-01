-- Package and Add-on Translation Fields Structure
-- This migration ensures the correct fields exist for translations

-- Verify package_translations table has all required fields
ALTER TABLE package_translations 
ADD COLUMN IF NOT EXISTS package_name VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS short_description VARCHAR(500) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS detailed_description TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS whats_included TEXT,
ADD COLUMN IF NOT EXISTS whats_excluded TEXT,
ADD COLUMN IF NOT EXISTS daily_itinerary TEXT;

-- Verify package_addon_translations table has all required fields
ALTER TABLE package_addon_translations 
ADD COLUMN IF NOT EXISTS package_name VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS short_description VARCHAR(500) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS detailed_description TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS whats_included TEXT,
ADD COLUMN IF NOT EXISTS whats_excluded TEXT,
ADD COLUMN IF NOT EXISTS daily_itinerary TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_package_translations_lang ON package_translations(language);
CREATE INDEX IF NOT EXISTS idx_package_addon_translations_lang ON package_addon_translations(language);
