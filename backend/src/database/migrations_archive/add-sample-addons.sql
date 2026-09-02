-- Sample data for package_addons table
-- This script adds sample add-ons to existing packages for testing

BEGIN;

-- Get the first package ID (adjust as needed)
WITH first_package AS (
  SELECT id FROM packages LIMIT 1
)
INSERT INTO package_addons (package_id, name, description, price, category, is_available, min_quantity, max_quantity, sort_order)
SELECT 
  id,
  'Private Transfer',
  'Airport pickup and drop-off with private vehicle',
  75.00,
  'transfer',
  true,
  1,
  5,
  1
FROM first_package
ON CONFLICT DO NOTHING;

-- Sample Room Upgrades
WITH pkg AS (SELECT id FROM packages LIMIT 1 OFFSET 1)
INSERT INTO package_addons (package_id, name, description, price, category, is_available, min_quantity, max_quantity, sort_order)
SELECT 
  id,
  'Deluxe Room Upgrade',
  'Upgrade to a deluxe suite with premium amenities',
  120.00,
  'room_upgrade',
  true,
  1,
  1,
  1
FROM pkg
ON CONFLICT DO NOTHING;

-- Sample Meal Plans
WITH pkg AS (SELECT id FROM packages LIMIT 1 OFFSET 2)
INSERT INTO package_addons (package_id, name, description, price, category, is_available, min_quantity, max_quantity, sort_order)
SELECT 
  id,
  'Full Meal Plan',
  'Includes all meals and beverages throughout your stay',
  150.00,
  'meal_plan',
  true,
  1,
  10,
  1
FROM pkg
ON CONFLICT DO NOTHING;

-- Sample Activities
WITH pkg AS (SELECT id FROM packages LIMIT 1 OFFSET 3)
INSERT INTO package_addons (package_id, name, description, price, category, is_available, min_quantity, max_quantity, sort_order)
SELECT 
  id,
  'Guided Desert Safari',
  '4-hour guided tour of desert attractions with professional guide',
  85.00,
  'activity',
  true,
  1,
  50,
  2
FROM pkg
ON CONFLICT DO NOTHING;

COMMIT;
