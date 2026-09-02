-- Comprehensive fix for linking packages to categories
-- This script ensures all packages are properly linked to their respective categories

-- Step 1: Verify current state
SELECT '=== BEFORE FIXES ===' as status;
SELECT COUNT(*) as total_packages FROM packages;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as existing_links FROM package_categories;

-- Step 2: Display all categories
SELECT id, name, slug FROM categories ORDER BY name;

-- Step 3: Check which packages have no categories yet
SELECT COUNT(*) as packages_without_categories
FROM packages p
WHERE NOT EXISTS (
  SELECT 1 FROM package_categories pc WHERE pc.package_id = p.id
);

-- Step 4: Clear any orphaned entries (packages referencing deleted categories)
DELETE FROM package_categories
WHERE category_id NOT IN (SELECT id FROM categories);

-- Step 5: Link all packages to categories based on keywords and patterns
-- This is the main logic that creates category-package associations

-- Define a temporary mapping based on package properties
-- We'll use CASE statements to intelligently match packages to categories

WITH package_mapping AS (
  SELECT 
    p.id as package_id,
    CASE 
      -- Adventure category - packages with balloon, adventure, trekking keywords
      WHEN p.title ILIKE ANY(ARRAY['%Balloon%', '%Adventure%', '%Trekking%', '%Safari%', '%Expedition%', '%Extreme%', '%Thrilling%', '%Daring%'])
           OR p.destination ILIKE ANY(ARRAY['%Safari%', '%Mountains%', '%Peaks%', '%Wilderness%']) THEN 
        (SELECT id FROM categories WHERE name = 'Adventure' LIMIT 1)
      
      -- Beach category - beach/coast related packages
      WHEN p.title ILIKE ANY(ARRAY['%Beach%', '%Coastal%', '%Seaside%', '%Island%', '%Tropical%'])
           OR p.destination ILIKE ANY(ARRAY['%Beach%', '%Dubai%', '%Maldives%', '%Caribbean%', '%Bali%', '%Phuket%', '%Zanzibar%', '%Seychelles%', '%Tahiti%']) THEN 
        (SELECT id FROM categories WHERE name = 'Beach' LIMIT 1)
      
      -- Cultures category - cultural, historical packages
      WHEN p.title ILIKE ANY(ARRAY['%Cultural%', '%Historical%', '%Heritage%', '%Museum%', '%Ancient%', '%Traditional%', '%Historic%'])
           OR p.destination ILIKE ANY(ARRAY['%Tokyo%', '%Paris%', '%Egypt%', '%Rome%', '%Bangkok%', '%Istanbul%', '%Delhi%', '%Athens%', '%Jerusalem%', '%Athens%', '%Kyoto%']) THEN 
        (SELECT id FROM categories WHERE name = 'Cultures' LIMIT 1)
      
      -- Honeymoon category - romantic packages
      WHEN p.title ILIKE ANY(ARRAY['%Honeymoon%', '%Romance%', '%Romantic%', '%Couples%', '%Love%'])
           OR p.trip_type ILIKE '%honeymoon%' THEN 
        (SELECT id FROM categories WHERE name = 'Honeymoon' LIMIT 1)
      
      -- Family category - family-oriented packages
      WHEN p.title ILIKE ANY(ARRAY['%Family%', '%Kids%', '%Children%', '%Families%'])
           OR p.trip_type ILIKE '%family%' THEN 
        (SELECT id FROM categories WHERE name = 'Family' LIMIT 1)
      
      -- Mountain category - mountain related packages
      WHEN p.title ILIKE ANY(ARRAY['%Mountain%', '%Hiking%', '%Trekking%', '%Alpine%', '%Summit%', '%Peak%', '%Ski%'])
           OR p.destination ILIKE ANY(ARRAY['%Mountain%', '%Alps%', '%Rockies%', '%Himalayas%', '%Andes%', '%Nepal%', '%Switzerland%', '%Colorado%']) THEN 
        (SELECT id FROM categories WHERE name = 'Mountain' LIMIT 1)
      
      -- Default: Assign to Adventure if no match found
      ELSE (SELECT id FROM categories WHERE name = 'Adventure' LIMIT 1)
    END as category_id
  FROM packages p
)
INSERT INTO package_categories (package_id, category_id)
SELECT pm.package_id, pm.category_id
FROM package_mapping pm
WHERE pm.category_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM package_categories pc 
    WHERE pc.package_id = pm.package_id AND pc.category_id = pm.category_id
  )
ON CONFLICT (package_id, category_id) DO NOTHING;

-- Step 6: Verify results
SELECT '=== AFTER FIXES ===' as status;
SELECT COUNT(*) as total_packages FROM packages;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as package_category_links FROM package_categories;

-- Step 7: Show breakdown by category
SELECT 
  c.id,
  c.name,
  COUNT(DISTINCT pc.package_id) as package_count
FROM categories c
LEFT JOIN package_categories pc ON c.id = pc.category_id
GROUP BY c.id, c.name
ORDER BY package_count DESC, c.name;

-- Step 8: List all packages with their categories
SELECT 
  c.name as category,
  COUNT(p.id) as count,
  STRING_AGG(DISTINCT p.title, ', ' ORDER BY p.title) as packages
FROM categories c
LEFT JOIN package_categories pc ON c.id = pc.category_id
LEFT JOIN packages p ON pc.package_id = p.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Step 9: Check for any packages still without categories (shouldn't be any)
SELECT 'Packages without categories:' as check;
SELECT p.id, p.title, p.destination
FROM packages p
WHERE NOT EXISTS (
  SELECT 1 FROM package_categories pc WHERE pc.package_id = p.id
);
