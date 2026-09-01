-- Add structured daily itinerary days columns to packages and package_translations tables
-- This allows storing day-by-day itinerary with title, description, activities, and meals

-- Add columns to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS en_daily_itinerary_days JSONB DEFAULT NULL;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ar_daily_itinerary_days JSONB DEFAULT NULL;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS es_daily_itinerary_days JSONB DEFAULT NULL;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS de_daily_itinerary_days JSONB DEFAULT NULL;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ru_daily_itinerary_days JSONB DEFAULT NULL;

-- Add columns to package_translations table
ALTER TABLE package_translations ADD COLUMN IF NOT EXISTS daily_itinerary_days JSONB DEFAULT NULL;

-- Create index for better query performance on translation queries
CREATE INDEX IF NOT EXISTS idx_package_translations_days ON package_translations USING GIN(daily_itinerary_days);
CREATE INDEX IF NOT EXISTS idx_packages_en_days ON packages USING GIN(en_daily_itinerary_days);
CREATE INDEX IF NOT EXISTS idx_packages_ar_days ON packages USING GIN(ar_daily_itinerary_days);
CREATE INDEX IF NOT EXISTS idx_packages_es_days ON packages USING GIN(es_daily_itinerary_days);
CREATE INDEX IF NOT EXISTS idx_packages_de_days ON packages USING GIN(de_daily_itinerary_days);
CREATE INDEX IF NOT EXISTS idx_packages_ru_days ON packages USING GIN(ru_daily_itinerary_days);
