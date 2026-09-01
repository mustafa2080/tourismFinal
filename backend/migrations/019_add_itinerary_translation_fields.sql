-- Add translation columns for itineraries table
-- This allows storing multi-language translations for each itinerary day

-- Check if columns exist before adding (PostgreSQL compatible)
DO $$
BEGIN
    -- Spanish translations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='itineraries' AND column_name='es_title') THEN
        ALTER TABLE itineraries ADD COLUMN es_title VARCHAR(255);
        ALTER TABLE itineraries ADD COLUMN es_description TEXT;
        ALTER TABLE itineraries ADD COLUMN es_activities TEXT;
        ALTER TABLE itineraries ADD COLUMN es_meals TEXT;
    END IF;

    -- German translations  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='itineraries' AND column_name='de_title') THEN
        ALTER TABLE itineraries ADD COLUMN de_title VARCHAR(255);
        ALTER TABLE itineraries ADD COLUMN de_description TEXT;
        ALTER TABLE itineraries ADD COLUMN de_activities TEXT;
        ALTER TABLE itineraries ADD COLUMN de_meals TEXT;
    END IF;

    -- Russian translations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='itineraries' AND column_name='ru_title') THEN
        ALTER TABLE itineraries ADD COLUMN ru_title VARCHAR(255);
        ALTER TABLE itineraries ADD COLUMN ru_description TEXT;
        ALTER TABLE itineraries ADD COLUMN ru_activities TEXT;
        ALTER TABLE itineraries ADD COLUMN ru_meals TEXT;
    END IF;

END $$;

-- Create indexes for better query performance on translation queries
CREATE INDEX IF NOT EXISTS idx_itineraries_es_title ON itineraries(es_title);
CREATE INDEX IF NOT EXISTS idx_itineraries_de_title ON itineraries(de_title);
CREATE INDEX IF NOT EXISTS idx_itineraries_ru_title ON itineraries(ru_title);
CREATE INDEX IF NOT EXISTS idx_itineraries_ar_title ON itineraries(ar_title);
CREATE INDEX IF NOT EXISTS idx_itineraries_en_title ON itineraries(en_title);
