-- Ensure ALL translation columns exist for itineraries table
-- This migration creates all missing translation columns with proper types

-- Add English translations if missing
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS en_title VARCHAR(255);
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS en_description TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS en_activities TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS en_meals TEXT;

-- Add Arabic translations if missing
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS ar_title VARCHAR(255);
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS ar_description TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS ar_activities TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS ar_meals TEXT;

-- Add Spanish translations if missing
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS es_title VARCHAR(255);
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS es_description TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS es_activities TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS es_meals TEXT;

-- Add German translations if missing
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS de_title VARCHAR(255);
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS de_description TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS de_activities TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS de_meals TEXT;

-- Add Russian translations if missing
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS ru_title VARCHAR(255);
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS ru_description TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS ru_activities TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS ru_meals TEXT;

-- Create indexes for all translation columns for better query performance
CREATE INDEX IF NOT EXISTS idx_itineraries_en_title ON itineraries(en_title) WHERE en_title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_itineraries_ar_title ON itineraries(ar_title) WHERE ar_title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_itineraries_es_title ON itineraries(es_title) WHERE es_title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_itineraries_de_title ON itineraries(de_title) WHERE de_title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_itineraries_ru_title ON itineraries(ru_title) WHERE ru_title IS NOT NULL;

-- Log
RAISE NOTICE 'All translation columns for itineraries table are now ensured to exist';
