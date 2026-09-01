-- Migration: Add "Trips in Cultures" category
-- Created: 2024

INSERT INTO categories (id, name, slug, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Trips in Cultures',
  'trips-in-cultures',
  'Explore cultural trips around the world',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Add more cultural trip categories if needed
INSERT INTO categories (id, name, slug, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Historical Tours', 'historical-tours', 'Visit historical landmarks and museums', NOW(), NOW()),
  (gen_random_uuid(), 'Local Experiences', 'local-experiences', 'Immerse yourself in local culture', NOW(), NOW()),
  (gen_random_uuid(), 'Food Tours', 'food-tours', 'Culinary adventures around the world', NOW(), NOW()),
  (gen_random_uuid(), 'Art & Museums', 'art-museums', 'Explore world-class art galleries', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
