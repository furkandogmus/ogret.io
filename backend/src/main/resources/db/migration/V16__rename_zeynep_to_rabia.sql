UPDATE users SET
  email = 'rabia@ogret.io',
  full_name = 'Rabia Çetingül',
  bio = 'Boğaziçi Üniversitesi Matematik mezunuyum. 8 yıldır lise ve üniversiteye hazırlık öğrencilerine özel ders veriyorum. Matematiği sevdiren öğretmen.'
WHERE id = 'a0000000-0000-0000-0000-000000000002'::uuid;

UPDATE reviews SET
  comment = REPLACE(comment, 'Zeynep Hoca', 'Rabia Hoca')
WHERE comment LIKE '%Zeynep%';
