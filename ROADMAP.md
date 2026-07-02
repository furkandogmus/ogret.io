# Uygulama Yol Haritası (Güncel — Temmuz 2026)

## ✅ Faz 0 — Frontend MVP (Tamamlandı)
- [x] React + Vite + TailwindCSS + shadcn/ui kurulumu
- [x] Landing page, arama, öğretmen profili
- [x] Öğrenci/Öğretmen panelleri, mesajlaşma
- [x] Dark mode, routing, dosya yapısı

## ✅ Faz 1 — Backend & Entegrasyon (Tamamlandı)
- [x] Spring Boot + Auth (Spring Security, JWT access/refresh)
- [x] PostgreSQL + Redis Docker altyapısı
- [x] Core API (tutor profiles, search, subjects, lessons, reviews)
- [x] WebSocket mesajlaşma (STOMP)
- [x] Tutor profil yönetimi (ders seçimi, müsaitlik, avatar)
- [x] Seed data (7 kullanıcı, 33 ders konusu, 7 ders, 3 yorum)

## ✅ Faz 2 — Admin, Testler & Çıkış Hazırlığı (Tamamlandı)
- [x] Admin Panel (istatistikler, doğrulama onay/ret, ders izleme)
- [x] Kimlik doğrulama başvurusu
- [x] Playwright E2E testleri (auth, search, booking, chat, admin)
- [x] Pazarlama & çıkış stratejisi (LAUNCH_STRATEGY.md)

## 🔜 Faz 3 — Ödeme & Dosya Yükleme (~2 hafta)
- [ ] İyzico/PayTR entegrasyonu (tutor abonelikleri)
- [ ] AWS S3 / DigitalOcean Spaces (profil fotoğrafı, kimlik belgesi)
- [ ] SMS (Twilio) / Email (Spring Mail) gönderim servisi

## 🔜 Faz 4 — Mobil Uygulama (~3-4 hafta)
- [ ] Expo (React Native) + Expo Router kurulumu
- [ ] Native mobil ekranlar (giriş, kayıt, arama, profil, mesajlaşma)
- [ ] Firebase Cloud Messaging (push bildirimleri)

## 🔜 Faz 5 — Büyüme & Exit (~3 ay)
- [ ] SEO optimizasyonu (long-tail keywords, programatik sayfalar)
- [ ] Kampanya: İlk 500 öğretmene 3 Ay Ücretsiz VIP
- [ ] Organik sosyal medya (TikTok / Instagram reels)
- [ ] Potansiyel alıcılarla görüşmeler (EdTech fonları, global rakipler)

---

## Prerequisites
- Java 17+ JDK
- Node.js 18+
- Docker Desktop (PostgreSQL + Redis)
- AWS / DigitalOcean hesabı (production için)
