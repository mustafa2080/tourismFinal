-- Fix: Link packages with categories in package_categories junction table
-- This script links existing packages with their appropriate categories

-- First, let's see what we have
SELECT COUNT(*) as total_packages FROM packages;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as package_category_links FROM package_categories;

-- View all categories
SELECT id, name FROM categories;

-- View packages that have no categories
SELECT p.id, p.title, p.destination, p.trip_type 
FROM packages p
LEFT JOIN package_categories pc ON p.id = pc.package_id
WHERE pc.category_id IS NULL;

-- Link packages based on keywords
-- Get category IDs first (these will vary based on your DB)
-- Example:
-- Cultures: 40157238-1a57-4f84-9f9f-ae6cd02d22b2
-- Mountain: cda4bcb5-4347-4531-bb55-92f192b9c796
-- Beach: 7e0e6d44-a91b-4d2a-921b-bb6ab6a5e791
-- Honeymoon: a333cc09-a6a8-4b6d-869a-cd6768b83839
-- Family: acbe766b-0aab-4292-bc27-958aec360aff
-- Adventure: f89425cd-3c7a-420e-aca6-3c793ab7d5ef

-- Link Adventure/Balloon packages to Adventure category
INSERT INTO package_categories (package_id, category_id)
SELECT DISTINCT p.id, c.id
FROM packages p, categories c
WHERE c.name = 'Adventure'
  AND (p.title ILIKE '%Balloon%' OR p.title ILIKE '%Adventure%')
  AND p.id NOT IN (SELECT package_id FROM package_categories WHERE category_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Beach packages to Beach category
INSERT INTO package_categories (package_id, category_id)
SELECT DISTINCT p.id, c.id
FROM packages p, categories c
WHERE c.name = 'Beach'
  AND (p.title ILIKE '%Beach%' OR p.destination ILIKE '%Beach%' OR p.destination ILIKE '%Dubai%' OR p.destination ILIKE '%Maldives%')
  AND p.id NOT IN (SELECT package_id FROM package_categories WHERE category_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Cultural packages
INSERT INTO package_categories (package_id, category_id)
SELECT DISTINCT p.id, c.id
FROM packages p, categories c
WHERE c.name = 'Cultures'
  AND (p.destination ILIKE '%Tokyo%' OR p.destination ILIKE '%Paris%' OR p.destination ILIKE '%Egypt%' OR p.title ILIKE '%Cultural%')
  AND p.id NOT IN (SELECT package_id FROM package_categories WHERE category_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Honeymoon packages
INSERT INTO package_categories (package_id, category_id)
SELECT DISTINCT p.id, c.id
FROM packages p, categories c
WHERE c.name = 'Honeymoon'
  AND (p.title ILIKE '%Romance%' OR p.title ILIKE '%Honeymoon%' OR p.trip_type ILIKE '%honeymoon%')
  AND p.id NOT IN (SELECT package_id FROM package_categories WHERE category_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Family packages
INSERT INTO package_categories (package_id, category_id)
SELECT DISTINCT p.id, c.id
FROM packages p, categories c
WHERE c.name = 'Family'
  AND (p.title ILIKE '%Family%' OR p.trip_type ILIKE '%family%')
  AND p.id NOT IN (SELECT package_id FROM package_categories WHERE category_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Mountain packages
INSERT INTO package_categories (package_id, category_id)
SELECT DISTINCT p.id, c.id
FROM packages p, categories c
WHERE c.name = 'Mountain'
  AND (p.title ILIKE '%Mountain%' OR p.destination ILIKE '%Mountain%' OR p.trip_type ILIKE '%mountain%')
  AND p.id NOT IN (SELECT package_id FROM package_categories WHERE category_id = c.id)
ON CONFLICT DO NOTHING;

-- Default: Link any remaining packages without categories to Adventure
INSERT INTO package_categories (package_id, category_id)
SELECT DISTINCT p.id, c.id
FROM packages p, categories c
WHERE c.name = 'Adventure'
  AND p.id NOT IN (SELECT DISTINCT package_id FROM package_categories)
ON CONFLICT DO NOTHING;

-- Verify the linking
SELECT 
  c.name,
  COUNT(DISTINCT pc.package_id) as packages_count
FROM categories c
LEFT JOIN package_categories pc ON c.id = pc.category_id
GROUP BY c.name
ORDER BY packages_count DESC;

-- View all linked packages by category
SELECT 
  c.name as category,
  p.title,
  p.destination
FROM categories c
JOIN package_categories pc ON c.id = pc.category_id
JOIN packages p ON pc.package_id = p.id
ORDER BY c.name, p.title;
