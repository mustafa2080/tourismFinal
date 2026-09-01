-- Add image storage columns to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS images_data BYTEA;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS trip_type TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;

-- Add image data storage to package_images table
ALTER TABLE package_images ADD COLUMN IF NOT EXISTS image_data BYTEA;

-- Create indices for new columns
CREATE INDEX IF NOT EXISTS idx_packages_trip_type ON packages(trip_type);
CREATE INDEX IF NOT EXISTS idx_packages_booking_count ON packages(booking_count);
