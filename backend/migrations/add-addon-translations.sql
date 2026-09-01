-- Migration: Create package_addon_translations table
-- This table stores translations for package add-ons in 5 languages: AR, EN, ES, DE, RU

CREATE TABLE IF NOT EXISTS package_addon_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_id UUID NOT NULL REFERENCES package_addons(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(addon_id, language)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_addon_translations_addon_id ON package_addon_translations(addon_id);
CREATE INDEX IF NOT EXISTS idx_addon_translations_language ON package_addon_translations(language);
CREATE INDEX IF NOT EXISTS idx_addon_translations_addon_language ON package_addon_translations(addon_id, language);

-- Add translations relation to package_addons table
ALTER TABLE package_addons 
ADD COLUMN IF NOT EXISTS translations JSON DEFAULT '{}';

