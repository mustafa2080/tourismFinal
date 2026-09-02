-- Alter avatar column to store larger base64 strings
-- For PostgreSQL

ALTER TABLE IF EXISTS users 
ALTER COLUMN avatar TYPE TEXT;
