-- Add translation items columns to package_translations table
-- This adds support for separate included and excluded items lists for each language

-- Add columns to package_translations if they don't exist
ALTER TABLE package_translations ADD COLUMN IF NOT EXISTS whats_included_items TEXT[] DEFAULT '{}';
ALTER TABLE package_translations ADD COLUMN IF NOT EXISTS whats_excluded_items TEXT[] DEFAULT '{}';
ALTER TABLE package_translations ADD COLUMN IF NOT EXISTS daily_itinerary_items TEXT[] DEFAULT '{}';

-- Add all translation columns to packages table for quick access
-- English
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_name VARCHAR(255);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_short_description VARCHAR(500);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_detailed_description TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_whats_included TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_whats_excluded TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_daily_itinerary TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_whats_included_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_whats_excluded_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_daily_itinerary_items TEXT[] DEFAULT '{}';

-- Arabic
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_name VARCHAR(255);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_short_description VARCHAR(500);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_detailed_description TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_whats_included TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_whats_excluded TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_daily_itinerary TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_whats_included_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_whats_excluded_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_daily_itinerary_items TEXT[] DEFAULT '{}';

-- Spanish
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_name VARCHAR(255);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_short_description VARCHAR(500);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_detailed_description TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_whats_included TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_whats_excluded TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_daily_itinerary TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_whats_included_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_whats_excluded_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_daily_itinerary_items TEXT[] DEFAULT '{}';

-- German
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_name VARCHAR(255);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_short_description VARCHAR(500);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_detailed_description TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_whats_included TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_whats_excluded TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_daily_itinerary TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_whats_included_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_whats_excluded_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_daily_itinerary_items TEXT[] DEFAULT '{}';

-- Russian
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_name VARCHAR(255);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_short_description VARCHAR(500);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_detailed_description TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_whats_included TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_whats_excluded TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_daily_itinerary TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_whats_included_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_whats_excluded_items TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_daily_itinerary_items TEXT[] DEFAULT '{}';
