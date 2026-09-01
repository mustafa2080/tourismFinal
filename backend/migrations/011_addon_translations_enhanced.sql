-- Enhanced Package Addon Translations (5 Languages)

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'package_addon_translations' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE package_addon_translations ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'package_addon_translations' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE package_addon_translations ADD COLUMN description TEXT;
    END IF;
END $$;

-- Ensure language constraint
ALTER TABLE package_addon_translations 
DROP CONSTRAINT IF EXISTS check_addon_language;

ALTER TABLE package_addon_translations 
ADD CONSTRAINT check_addon_language CHECK (language IN ('ar', 'en', 'es', 'ru', 'de'));

-- Create unique index
DROP INDEX IF EXISTS idx_addon_translations_unique;
CREATE UNIQUE INDEX idx_addon_translations_unique 
ON package_addon_translations(addon_id, language);

-- Create language index
DROP INDEX IF EXISTS idx_addon_translations_language;
CREATE INDEX idx_addon_translations_language 
ON package_addon_translations(language);

-- Create addon_id index
DROP INDEX IF EXISTS idx_addon_translations_addon;
CREATE INDEX idx_addon_translations_addon 
ON package_addon_translations(addon_id);

-- Add audit columns if not exist
ALTER TABLE package_addon_translations
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
