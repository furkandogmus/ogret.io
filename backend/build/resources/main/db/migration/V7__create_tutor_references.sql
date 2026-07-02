CREATE TABLE tutor_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommender_name VARCHAR(100) NOT NULL,
    recommender_email VARCHAR(255) NOT NULL,
    recommender_title VARCHAR(100) NOT NULL,
    comment TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tutor_references_tutor ON tutor_references(tutor_id);
