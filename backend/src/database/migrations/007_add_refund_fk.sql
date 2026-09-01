-- Add foreign key for refund_processed_by
ALTER TABLE bookings ADD CONSTRAINT fk_refund_processed_by 
  FOREIGN KEY (refund_processed_by) REFERENCES users(id) ON DELETE SET NULL;
