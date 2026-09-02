-- Migration: Add package_addons table
-- Description: Create table to store add-ons for tour packages
-- Date: 2025

BEGIN;

-- Create package_addons table
CREATE TABLE IF NOT EXISTS package_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) DEFAULT 'addon' CHECK (category IN ('addon', 'room_upgrade', 'meal_plan', 'activity', 'transfer')),
  is_available BOOLEAN DEFAULT true,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_package_addons_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  CONSTRAINT chk_price_positive CHECK (price >= 0),
  CONSTRAINT chk_quantities CHECK (min_quantity > 0 AND max_quantity >= min_quantity)
);

-- Create indexes
CREATE INDEX idx_package_addons_package_id ON package_addons(package_id);
CREATE INDEX idx_package_addons_category ON package_addons(category);
CREATE INDEX idx_package_addons_available ON package_addons(is_available);

-- Add comment
COMMENT ON TABLE package_addons IS 'Stores add-on options for tour packages (room upgrades, activities, meals, transfers, etc.)';
COMMENT ON COLUMN package_addons.category IS 'Type of add-on for grouping and filtering';
COMMENT ON COLUMN package_addons.min_quantity IS 'Minimum quantity required if selected';
COMMENT ON COLUMN package_addons.max_quantity IS 'Maximum quantity allowed (0 = unlimited)';
COMMENT ON COLUMN package_addons.sort_order IS 'Display order in UI';

COMMIT;
