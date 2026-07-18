-- V4/V5 historically inserted development fixtures through Flyway, which also
-- runs in production. Remove only the reserved fixture UUID range while keeping
-- the real subject taxonomy intact. Historical migrations must remain unchanged
-- so already-migrated databases do not fail checksum validation.

UPDATE blog_posts
SET author_id = NULL
WHERE author_id IN (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'a0000000-0000-0000-0000-000000000004'::uuid,
    'a0000000-0000-0000-0000-000000000005'::uuid,
    'a0000000-0000-0000-0000-000000000006'::uuid,
    'a0000000-0000-0000-0000-000000000007'::uuid
);

UPDATE disputes
SET admin_id = NULL
WHERE admin_id IN (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'a0000000-0000-0000-0000-000000000004'::uuid,
    'a0000000-0000-0000-0000-000000000005'::uuid,
    'a0000000-0000-0000-0000-000000000006'::uuid,
    'a0000000-0000-0000-0000-000000000007'::uuid
);

DELETE FROM audit_logs
WHERE admin_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   OR target_id::text LIKE 'a0000000-0000-0000-0000-00000000000%';

DELETE FROM messages
WHERE sender_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   OR receiver_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   OR lesson_id IN (
       SELECT id FROM lessons
       WHERE student_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
          OR tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   );

DELETE FROM reviews
WHERE student_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   OR tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   OR lesson_id IN (
       SELECT id FROM lessons
       WHERE student_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
          OR tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   );

DELETE FROM lessons
WHERE student_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   OR tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%';

DELETE FROM favorite_tutors
WHERE student_id::text LIKE 'a0000000-0000-0000-0000-00000000000%'
   OR tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%';

DELETE FROM subscriptions
WHERE tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%';

DELETE FROM tutor_verifications
WHERE tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%';

DELETE FROM tutor_availability
WHERE tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%';

DELETE FROM tutor_subjects
WHERE tutor_id::text LIKE 'a0000000-0000-0000-0000-00000000000%';

DELETE FROM users
WHERE id::text LIKE 'a0000000-0000-0000-0000-00000000000%';
