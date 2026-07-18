-- Extend subjects with more categories
INSERT INTO subjects (name, slug, category, icon, is_active) VALUES
  ('Tarih', 'tarih', 'YKS', 'BookOpen', TRUE),
  ('Coğrafya', 'cografya', 'YKS', 'Globe', TRUE),
  ('Edebiyat', 'edebiyat', 'YKS', 'BookOpen', TRUE),
  ('İspanyolca', 'ispanyolca', 'DIL', 'Globe', TRUE),
  ('Rusça', 'rusca', 'DIL', 'Globe', TRUE),
  ('Arapça', 'arapca', 'DIL', 'Globe', TRUE),
  ('Java', 'java', 'YAZILIM', 'Code2', TRUE),
  ('React', 'react', 'YAZILIM', 'Code2', TRUE),
  ('SQL & Veritabanı', 'sql-veritabani', 'YAZILIM', 'Code2', TRUE),
  ('Keman', 'keman', 'MUZIK', 'Music', TRUE),
  ('Şan & Ses', 'san-ses', 'MUZIK', 'Music', TRUE),
  ('LGS İngilizce', 'lgs-ingilizce', 'LGS', 'Globe', TRUE),
  ('Fotoğrafçılık', 'fotografcilik', 'DIGER', 'Camera', TRUE),
  ('Resim & Çizim', 'resim-cizim', 'DIGER', 'Palette', TRUE),
  ('Tiyatro & Diksiyon', 'tiyatro-diksiyon', 'DIGER', 'Mic', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Add more tutor_subjects for Mehmet (Computer Engineer) - now also Java, React, SQL
INSERT INTO tutor_subjects (id, tutor_id, subject_id, description, hourly_rate)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000003'::uuid, id, 'Java Spring Boot, Backend geliştirme', NULL::numeric FROM subjects WHERE slug = 'java'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000003'::uuid, id, 'React, Next.js, Frontend geliştirme', NULL::numeric FROM subjects WHERE slug = 'react'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000003'::uuid, id, 'PostgreSQL, MySQL, Veri modelleme', NULL::numeric FROM subjects WHERE slug = 'sql-veritabani'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002'::uuid, id, 'TYT-AYT Geometri', NULL::numeric FROM subjects WHERE slug = 'lgs-matematik'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002'::uuid, id, 'TYT Fizik, AYT Fizik', NULL::numeric FROM subjects WHERE slug = 'fizik';

-- Add a new tutor: Can Özkan (Müzik)
INSERT INTO users (id, email, phone, password_hash, full_name, role, is_verified, is_profile_complete, rating_avg, rating_count, is_online, is_identity_verified, avatar_url, bio, education, experience_years, hourly_rate, created_at)
VALUES ('a0000000-0000-0000-0000-000000000007', 'can@ogret.io', '5550000007', '', 'Can Özkan', 'TUTOR', true, true, 4.9, 203, true, true, NULL,
        'İstanbul Üniversitesi Devlet Konservatuvarı mezunu. 10 yıldır piyano, gitar ve müzik teorisi dersleri veriyorum. Her seviyeye uygun.',
        'İstanbul Üniversitesi, Devlet Konservatuvarı', 10, 500, NOW())
ON CONFLICT (id) DO NOTHING;

-- Can's subjects
INSERT INTO tutor_subjects (id, tutor_id, subject_id, description, hourly_rate)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000007'::uuid, id, 'Klasik ve modern piyano', NULL::numeric FROM subjects WHERE slug = 'piyano'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000007'::uuid, id, 'Akustik ve elektro gitar', NULL::numeric FROM subjects WHERE slug = 'gitar'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000007'::uuid, id, 'Müzik teorisi, armoni, solfej', NULL::numeric FROM subjects WHERE slug = 'muzik-teorisi'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000007'::uuid, id, 'Keman eğitimi', NULL::numeric FROM subjects WHERE slug = 'keman'
  UNION ALL
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000007'::uuid, id, 'Şan ve ses eğitimi', NULL::numeric FROM subjects WHERE slug = 'san-ses';

-- Can's availability
INSERT INTO tutor_availability (id, tutor_id, day_of_week, start_time, end_time, is_active)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000007'::uuid, d, '12:00'::time, '21:00'::time, true
  FROM generate_series(1, 6) AS d;

-- Add more lessons between existing users
INSERT INTO lessons (id, student_id, tutor_id, subject_id, status, lesson_date, start_time, end_time, duration_minutes, price, notes, student_cancelled, created_at)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid, id, 'COMPLETED', NOW() - INTERVAL '3 days', '10:00'::time, '11:00'::time, 60, 260, 'Speaking practice - daily routines', false, NOW() - INTERVAL '3 days'
  FROM subjects WHERE slug = 'ingilizce';

INSERT INTO lessons (id, student_id, tutor_id, subject_id, status, lesson_date, start_time, end_time, duration_minutes, price, notes, student_cancelled, created_at)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid, id, 'CONFIRMED', NOW() + INTERVAL '1 day', '09:00'::time, '10:00'::time, 60, 260, 'IELTS hazırlık - Writing', false, NOW()
  FROM subjects WHERE slug = 'ingilizce';

INSERT INTO lessons (id, student_id, tutor_id, subject_id, status, lesson_date, start_time, end_time, duration_minutes, price, student_cancelled, created_at)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, id, 'PENDING', NOW() + INTERVAL '4 days', '16:00'::time, '17:30'::time, 90, 350, false, NOW()
  FROM subjects WHERE slug = 'matematik';

INSERT INTO lessons (id, student_id, tutor_id, subject_id, status, lesson_date, start_time, end_time, duration_minutes, price, student_cancelled, created_at)
  SELECT gen_random_uuid(), 'a0000000-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, id, 'COMPLETED', NOW() - INTERVAL '10 days', '15:00'::time, '16:00'::time, 60, 350, false, NOW() - INTERVAL '10 days'
  FROM subjects WHERE slug = 'matematik';

-- Add more reviews
INSERT INTO reviews (id, lesson_id, student_id, tutor_id, rating, comment, is_anonymous, created_at)
  SELECT gen_random_uuid(), l.id, l.student_id, l.tutor_id, 5, 'Ayşe Hoca ile İngilizce konuşma pratiği yapmak çok keyifli. Kesinlikle gelişim görüyorum.', false, NOW() - INTERVAL '2 days'
  FROM lessons l WHERE l.status = 'COMPLETED' AND l.tutor_id = 'a0000000-0000-0000-0000-000000000004'::uuid LIMIT 1;

INSERT INTO reviews (id, lesson_id, student_id, tutor_id, rating, comment, is_anonymous, created_at)
  SELECT gen_random_uuid(), l.id, l.student_id, l.tutor_id, 4, 'Zeynep Hoca çok iyi ama bazen hızlı anlatıyor. Yine de çok faydalı bir dersti.', false, NOW() - INTERVAL '9 days'
  FROM lessons l WHERE l.status = 'COMPLETED' AND l.lesson_date < NOW() - INTERVAL '8 days' LIMIT 1;
