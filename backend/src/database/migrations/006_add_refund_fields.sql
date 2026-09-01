-- Add refund fields to bookings table
-- Migration: Add Refund Management Fields

-- Add refund columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_processed_by UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_notes TEXT;

-- Create index for refund queries
CREATE INDEX IF NOT EXISTS idx_bookings_refund_status ON bookings(refund_status);
CREATE INDEX IF NOT EXISTS idx_bookings_refund_amount ON bookings(refund_amount) WHERE refund_amount > 0;
CREATE INDEX IF NOT EXISTS idx_bookings_refund_processed_at ON bookings(refund_processed_at);
