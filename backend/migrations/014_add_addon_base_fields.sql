-- Add missing fields to package_addons table
-- This adds price, name, description, and category fields to the base addon entity

ALTER TABLE `package_addons` 
ADD COLUMN `price` DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER `package_id`,
ADD COLUMN `name` VARCHAR(100) AFTER `price`,
ADD COLUMN `description` TEXT AFTER `name`,
ADD COLUMN `category` VARCHAR(50) NOT NULL DEFAULT 'addon' AFTER `description`;

-- Create indexes for common queries
CREATE INDEX `idx_addon_price` ON `package_addons`(`price`);
CREATE INDEX `idx_addon_category` ON `package_addons`(`category`);
CREATE INDEX `idx_addon_name` ON `package_addons`(`name`);

-- Log the changes
SELECT 'Migration 014: Added base fields (price, name, description, category) to package_addons table' as Status;
