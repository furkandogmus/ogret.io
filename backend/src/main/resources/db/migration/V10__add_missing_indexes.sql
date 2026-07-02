CREATE INDEX IF NOT EXISTS idx_subscriptions_tutor_active ON subscriptions(tutor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tutor_listings_status ON tutor_listings(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE tutor_listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('turkish',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.lesson_description, '') || ' ' ||
        COALESCE(NEW.about_tutor, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listing_search ON tutor_listings;
CREATE TRIGGER trg_listing_search
    BEFORE INSERT OR UPDATE ON tutor_listings
    FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

UPDATE tutor_listings SET search_vector = to_tsvector('turkish',
    COALESCE(title, '') || ' ' ||
    COALESCE(lesson_description, '') || ' ' ||
    COALESCE(about_tutor, '')
);

CREATE INDEX IF NOT EXISTS idx_tutor_listings_search ON tutor_listings USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_tutor_listings_trgm ON tutor_listings USING GIN (title gin_trgm_ops);

ALTER TABLE users ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_user_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('turkish',
        COALESCE(NEW.full_name, '') || ' ' ||
        COALESCE(NEW.bio, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_search ON users;
CREATE TRIGGER trg_user_search
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_user_search_vector();

UPDATE users SET search_vector = to_tsvector('turkish',
    COALESCE(full_name, '') || ' ' ||
    COALESCE(bio, '')
);

CREATE INDEX IF NOT EXISTS idx_users_search ON users USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_users_trgm ON users USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_tutor_listings_subject_id ON tutor_listings(subject_id);
CREATE INDEX IF NOT EXISTS idx_tutor_listings_hourly_rate ON tutor_listings(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_tutor_listings_status ON tutor_listings(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_rating_avg ON users(rating_avg);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor_id ON tutor_subjects(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_subject_id ON tutor_subjects(subject_id);
