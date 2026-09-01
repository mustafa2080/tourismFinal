-- Enhanced Package Translations (5 Languages)
-- This migration ensures the package_translations table has proper structure for 5 languages

-- Check if column exists and add if not
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'package_translations' 
        AND column_name = 'package_name'
    ) THEN
        ALTER TABLE package_translations ADD COLUMN package_name VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'package_translations' 
        AND column_name = 'short_description'
    ) THEN
        ALTER TABLE package_translations ADD COLUMN short_description VARCHAR(500) NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'package_translations' 
        AND column_name = 'detailed_description'
    ) THEN
        ALTER TABLE package_translations ADD COLUMN detailed_description TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'package_translations' 
        AND column_name = 'whats_included'
    ) THEN
        ALTER TABLE package_translations ADD COLUMN whats_included TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'package_translations' 
        AND column_name = 'whats_excluded'
    ) THEN
        ALTER TABLE package_translations ADD COLUMN whats_excluded TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'package_translations' 
        AND column_name = 'daily_itinerary'
    ) THEN
        ALTER TABLE package_translations ADD COLUMN daily_itinerary TEXT;
    END IF;
END $$;

-- Ensure language constraint
ALTER TABLE package_translations 
DROP CONSTRAINT IF EXISTS check_language;

ALTER TABLE package_translations 
ADD CONSTRAINT check_language CHECK (language IN ('ar', 'en', 'es', 'ru', 'de'));

-- Create unique index
DROP INDEX IF EXISTS idx_package_translations_unique;
CREATE UNIQUE INDEX idx_package_translations_unique 
ON package_translations(package_id, language);

-- Create language index
DROP INDEX IF EXISTS idx_package_translations_language;
CREATE INDEX idx_package_translations_language 
ON package_translations(language);

-- Create package_id index
DROP INDEX IF EXISTS idx_package_translations_package;
CREATE INDEX idx_package_translations_package 
ON package_translations(package_id);

-- Add audit columns if not exist
ALTER TABLE package_translations
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
