-- Add display currency fields to bookings table
-- total_price remains the single source of truth, always stored in USD.
-- display_currency / display_total record what the customer actually saw
-- and chose at checkout time (e.g. EGP), for showing back to them later
-- (booking details, invoice) without touching any USD-based reporting.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='bookings' AND column_name='display_currency') THEN
        ALTER TABLE bookings ADD COLUMN display_currency VARCHAR(3) NOT NULL DEFAULT 'USD';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='bookings' AND column_name='display_total') THEN
        ALTER TABLE bookings ADD COLUMN display_total DECIMAL(12,2);
    END IF;
END $$;
