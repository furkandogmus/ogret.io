CREATE INDEX IF NOT EXISTS idx_subscriptions_tutor_active ON subscriptions(tutor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tutor_listings_status ON tutor_listings(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
