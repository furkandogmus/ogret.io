-- Seed data for development
-- Passwords will be set by AppSeeder component at startup.
-- UUIDs are fixed for referential integrity in seed data.

-- Users are inserted without password_hash (AppSeeder will update them)
INSERT INTO users (id, email, phone, password_hash, full_name, role, is_verified, is_profile_complete, rating_avg, rating_count, is_online, is_identity_verified, avatar_url, bio, education, experience_years, hourly_rate, created_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@ogret.io', '5550000001', '', 'Admin Kullanıcı', 'ADMIN', true, true, 0, 0, false, true, NULL, 'Platform yöneticisi', NULL, NULL, NULL, NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'zeynep@ogret.io', '5550000002', '', 'Zeynep Kaya', 'TUTOR', true, true, 4.9, 127, true, true, NULL, 'Boğaziçi Üniversitesi Matematik mezunuyum. 8 yıldır lise ve üniversiteye hazırlık öğrencilerine özel ders veriyorum.', 'Boğaziçi Üniversitesi, Matematik Bölümü', 8, 350, NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'mehmet@ogret.io', '5550000003', '', 'Mehmet Yılmaz', 'TUTOR', true, true, 4.8, 89, false, true, NULL, 'ODTÜ Bilgisayar Mühendisliği mezunu, 6 yıldır yazılım dersleri veriyorum. Python, JavaScript, Web geliştirme.', 'ODTÜ, Bilgisayar Mühendisliği', 6, 400, NOW()),
  ('a0000000-0000-0000-0000-000000000004', 'ayse@ogret.io', '5550000004', '', 'Ayşe Demir', 'TUTOR', true, true, 4.7, 38, true, false, NULL, 'İngiliz Dili ve Edebiyatı mezunu, 4 yıldır İngilizce özel ders veriyorum. Konuşma ağırlıklı yaklaşım.', 'Hacettepe Üniversitesi, İngiliz Dili ve Edebiyatı', 4, 260, NOW()),
  ('a0000000-0000-0000-0000-000000000005', 'ahmet@ogret.io', '5550000005', '', 'Ahmet Öğrenci', 'STUDENT', true, true, 0, 0, false, false, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('a0000000-0000-0000-0000-000000000006', 'elif@ogret.io', '5550000006', '', 'Elif Öğrenci', 'STUDENT', true, true, 0, 0, false, false, NULL, NULL, NULL, NULL, NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- Tutor subjects (which tutors teach which subjects)
-- Subjects: Matematik (V2 seed id: use slug to find id dynamically)
INSERT INTO tutor_subjects (id, tutor_id, subject_id, description, hourly_rate)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002'::uuid, id, 'TYT-AYT Matematik, Türev-İntegral', NULL::numeric FROM subjects WHERE slug = 'matematik'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002'::uuid, id, 'Fizik dersleri', NULL::numeric FROM subjects WHERE slug = 'fizik'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000003'::uuid, id, 'Python, JavaScript, Web Tasarım', NULL::numeric FROM subjects WHERE slug = 'yazilim'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000004'::uuid, id, 'Konuşma, IELTS, TOEFL', NULL::numeric FROM subjects WHERE slug = 'ingilizce'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000004'::uuid, id, 'Almanca A1-B2', NULL::numeric FROM subjects WHERE slug = 'almanca';

-- Tutor availability
INSERT INTO tutor_availability (id, tutor_id, day_of_week, start_time, end_time, is_active)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002'::uuid, d, '09:00'::time, '18:00'::time, true
  FROM generate_series(0, 4) AS d
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000003'::uuid, d, '10:00'::time, '17:00'::time, true
  FROM generate_series(1, 5) AS d
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000004'::uuid, d, '09:00'::time, '15:00'::time, true
  FROM generate_series(0, 6) AS d;

-- Sample lessons
INSERT INTO lessons (id, student_id, tutor_id, subject_id, status, lesson_date, start_time, end_time, duration_minutes, price, notes, student_cancelled, created_at)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, id, 'COMPLETED', NOW() - INTERVAL '5 days', '14:00'::time, '15:00'::time, 60, 350, 'Türev konusu işlendi', false, NOW() - INTERVAL '5 days'
  FROM subjects WHERE slug = 'matematik';

INSERT INTO lessons (id, student_id, tutor_id, subject_id, status, lesson_date, start_time, end_time, duration_minutes, price, notes, student_cancelled, created_at)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, id, 'CONFIRMED', NOW() + INTERVAL '2 days', '14:00'::time, '15:00'::time, 60, 350, 'İntegrale devam', false, NOW()
  FROM subjects WHERE slug = 'matematik';

INSERT INTO lessons (id, student_id, tutor_id, subject_id, status, lesson_date, start_time, end_time, duration_minutes, price, student_cancelled, created_at)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid, id, 'PENDING', NOW() + INTERVAL '3 days', '11:00'::time, '12:30'::time, 90, 400, false, NOW()
  FROM subjects WHERE slug = 'yazilim';

-- Sample reviews
INSERT INTO reviews (id, lesson_id, student_id, tutor_id, rating, comment, is_anonymous, created_at)
  SELECT gen_random_uuid(), l.id, l.student_id, l.tutor_id, 5, 'Zeynep Hoca gerçekten çok iyi anlatıyor. Türev konusunu çok net kavradım. Kesinlikle tavsiye ederim.', false, NOW() - INTERVAL '4 days'
  FROM lessons l WHERE l.status = 'COMPLETED' LIMIT 1;
