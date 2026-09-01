-- Create package_translations table for dynamic auto-translations
-- Migration: Create dynamic translation storage

CREATE TABLE IF NOT EXISTS package_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL,
  language VARCHAR(10) NOT NULL,
  
  -- Translated fields
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  short_desc VARCHAR(500) NOT NULL,
  long_desc TEXT NOT NULL,
  trip_type TEXT,
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT fk_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  CONSTRAINT unique_package_language UNIQUE(package_id, language)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_package_translations_package_id ON package_translations(package_id);
CREATE INDEX IF NOT EXISTS idx_package_translations_language ON package_translations(language);
CREATE INDEX IF NOT EXISTS idx_package_translations_created_at ON package_translations(created_at);

-- Add comment to table
COMMENT ON TABLE package_translations IS 'Stores automatically translated package data in multiple languages';
COMMENT ON COLUMN package_translations.package_id IS 'Reference to the original package';
COMMENT ON COLUMN package_translations.language IS 'Language code (e.g., ar, es, de, fr)';
COMMENT ON COLUMN package_translations.title IS 'Translated package title';
COMMENT ON COLUMN package_translations.destination IS 'Translated destination name';
COMMENT ON COLUMN package_translations.short_desc IS 'Translated short description';
COMMENT ON COLUMN package_translations.long_desc IS 'Translated detailed description';
COMMENT ON COLUMN package_translations.inclusions IS 'Array of translated inclusions';
COMMENT ON COLUMN package_translations.exclusions IS 'Array of translated exclusions';
