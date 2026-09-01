-- Migration: Remove all pending bookings and convert to confirmed
-- Run this BEFORE deploying the code changes
-- Purpose: Ensure all bookings have valid status (confirmed, completed, or cancelled)

-- Step 1: Show current status distribution (for verification)
SELECT 'BEFORE UPDATE:' as info;
SELECT status, COUNT(*) as count FROM bookings GROUP BY status;

-- Step 2: Convert any 'pending' status to 'confirmed'
UPDATE bookings 
SET status = 'confirmed', updated_at = NOW()
WHERE status = 'pending' OR status IS NULL;

-- Step 3: Show updated status distribution (verification)
SELECT 'AFTER UPDATE:' as info;
SELECT status, COUNT(*) as count FROM bookings GROUP BY status;

-- Step 4: Verify no 'pending' or NULL statuses remain
SELECT COUNT(*) as pending_or_null_count 
FROM bookings 
WHERE status = 'pending' OR status IS NULL;

-- If pending_or_null_count = 0, migration was successful!
