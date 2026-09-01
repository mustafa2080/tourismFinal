-- Migration 022: Populate package_categories junction table
-- This script ensures all packages are properly linked to their categories

-- First, check how many packages don't have categories
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT p.id) INTO orphaned_count
  FROM packages p
  WHERE NOT EXISTS (SELECT 1 FROM package_categories WHERE package_id = p.id);
  
  RAISE NOTICE 'Found % packages without category links', orphaned_count;
END $$;

-- If a package has category_id set, ensure it's linked in the junction table
INSERT INTO package_categories (package_id, category_id)
SELECT DISTINCT p.id, p.category_id
FROM packages p
WHERE p.category_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM package_categories pc 
  WHERE pc.package_id = p.id AND pc.category_id = p.category_id
)
ON CONFLICT DO NOTHING;

-- Verify the linking
SELECT 
  c.id,
  c.name,
  COUNT(DISTINCT pc.package_id) as linked_packages
FROM categories c
LEFT JOIN package_categories pc ON c.id = pc.category_id
GROUP BY c.id, c.name
ORDER BY linked_packages DESC;

-- Show any packages still without categories
SELECT p.id, p.title, p.destination, p.category_id
FROM packages p
WHERE NOT EXISTS (SELECT 1 FROM package_categories WHERE package_id = p.id)
LIMIT 10;
