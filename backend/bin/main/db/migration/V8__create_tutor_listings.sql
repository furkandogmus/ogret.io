CREATE TABLE tutor_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    lesson_description TEXT NOT NULL,
    about_tutor TEXT NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    allows_tutor_home BOOLEAN NOT NULL DEFAULT FALSE,
    allows_student_home BOOLEAN NOT NULL DEFAULT FALSE,
    allows_online BOOLEAN NOT NULL DEFAULT TRUE,
    max_travel_distance_km INT,
    languages VARCHAR(100)[] DEFAULT ARRAY['Türkçe'],
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_tutor_listings_tutor_subject ON tutor_listings(tutor_id, subject_id);
