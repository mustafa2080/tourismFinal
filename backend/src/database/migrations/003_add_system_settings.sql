-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(255) PRIMARY KEY NOT NULL,
  value TEXT,
  type VARCHAR(50) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_system_settings_type ON system_settings(type);
CREATE INDEX idx_system_settings_created_at ON system_settings(created_at);

-- Insert default settings
INSERT INTO system_settings (key, value, type, description) VALUES
-- General Settings
('site.name', 'Tour Booking System', 'string', 'Website name'),
('site.email', 'admin@tour-booking.com', 'string', 'Admin email address'),
('site.phone', '+20 100 000 0000', 'string', 'Support phone number'),
('site.description', 'Book your next adventure with us', 'string', 'Website description'),
('site.logo', '', 'string', 'Logo URL'),
('site.favicon', '', 'string', 'Favicon URL'),

-- Email Settings
('email.smtp_host', 'smtp.gmail.com', 'string', 'SMTP server host'),
('email.smtp_port', '587', 'string', 'SMTP server port'),
('email.smtp_user', '', 'string', 'SMTP username'),
('email.smtp_password', '', 'string', 'SMTP password'),
('email.from_name', 'Tour Booking', 'string', 'Email sender name'),
('email.from_address', 'noreply@tour-booking.com', 'string', 'Email sender address'),
('email.enabled', 'true', 'string', 'Enable email sending'),

-- Booking Settings
('booking.confirmation_email', 'true', 'string', 'Send booking confirmation email'),
('booking.reminder_days', '3', 'string', 'Send reminder X days before booking'),
('booking.max_refund_days', '14', 'string', 'Maximum days for refund'),
('booking.min_notice_hours', '24', 'string', 'Minimum notice hours before booking'),

-- System Settings
('system.maintenance_mode', 'false', 'string', 'Enable maintenance mode'),
('system.debug_mode', 'false', 'string', 'Enable debug mode'),
('system.logging_enabled', 'true', 'string', 'Enable system logging'),
('system.backup_enabled', 'true', 'string', 'Enable automated backup'),
('system.backup_frequency', 'daily', 'string', 'Backup frequency (hourly, daily, weekly, monthly)'),
('system.max_upload_size', '10485760', 'string', 'Maximum upload size in bytes (10MB)')
ON CONFLICT (key) DO NOTHING;
