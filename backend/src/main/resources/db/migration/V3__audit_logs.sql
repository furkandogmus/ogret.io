CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    admin_id UUID,
    target_id UUID,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
