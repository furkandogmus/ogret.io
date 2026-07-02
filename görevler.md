# Yapılacaklar (Güncel — Temmuz 2026)

## ✅ Tamamlanan — Frontend

- [x] Landing page (hero, kategoriler API'den, öne çıkanlar, nasıl çalışır, CTA, footer)
- [x] Öğretmen arama (filtreleme, sıralama, TutorCard)
- [x] Öğretmen profili (bio, eğitim, yorumlar, müsaitlik takvimi)
- [x] Ders talep modalı (4 adımlı wizard, API'ye bağlı)
- [x] Öğrenci paneli (dashboard, ders listeleri, iptal, değerlendirme)
- [x] Öğretmen paneli (dashboard, talepler, gelir grafiği, meeting linki)
- [x] Profil düzenleme (avatar, bio, eğitim, ders seçimi, müsaitlik)
- [x] Mesajlaşma (WebSocket gerçek zamanlı, okundu bildirimi)
- [x] Admin panel (dashboard, kullanıcı listesi, doğrulama yönetimi)
- [x] Abonelik sayfası (plan seçimi)
- [x] Kimlik doğrulama başvuru sayfası
- [x] Dark mode (next-themes)
- [x] React Router + responsive tasarım
- [x] Auth (JWT login/register, refresh interceptor, role-based routing)
- [x] Dosya yapısı düzenlendi (monolit App.tsx bölündü)

## ✅ Tamamlanan — Backend

### Altyapı
- [x] Spring Boot projesi (Gradle, Java 17, Spring Boot 3.4.4)
- [x] Security + JWT (access 15dk + refresh 7 gün)
- [x] 11 entity + 10 repository + 7 service + 11 controller
- [x] Flyway migration (V1 schema + V2 seed + V3 audit_logs + V4 seed data + V5 extend)
- [x] Global exception handler + validasyon
- [x] OpenAPI / Swagger UI
- [x] Docker Compose (PostgreSQL 15 + Redis 7)
- [x] Rate limiting (in-memory, IP başına 100 istek/dk)
- [x] Audit log (admin işlemleri)
- [x] 33 JUnit test (controller layer)

### API Endpoint'leri
**Auth:** register, login, refresh, verify-email, verify-phone, forgot-password, reset-password
**Users:** GET /me, PUT /me, PUT /me/avatar, GET /{id}, GET ?q=
**Tutors:** GET / (filtreleme+sayfalama), GET /{id}, GET /{id}/availability
**TutorProfile:** GET /tutors/me/subjects, PUT /tutors/me/subjects, GET /tutors/me/availability, PUT /tutors/me/availability
**Subjects:** GET /, GET /{id}/tutors
**Lessons:** POST, GET /, GET /{id}, PUT confirm/cancel/complete/meeting-link
**Reviews:** POST /lessons/{id}/review, GET /tutors/{id}/reviews, GET /reviews
**Messages:** GET /, POST /, GET /unread, PUT /{id}/read, WebSocket STOMP
**Favorites:** GET /, POST /{tutorId}, DELETE /{tutorId}
**Subscriptions:** GET /plans, POST /, GET /me, POST /cancel
**Verifications:** POST /verifications
**Admin:** GET /dashboard, GET /users, PUT /users/{id}/verify, GET /verifications, PUT /verifications/{id}, GET /lessons

### Seed Verisi
- [x] 7 kullanıcı (admin, 4 tutor, 2 öğrenci)
- [x] 33 ders konusu, 6 kategori (YKS, LGS, DIL, YAZILIM, MUZIK, DIGER)
- [x] 7 ders kaydı, 3 yorum
- [x] Müsaitlik kayıtları, abonelik, doğrulama başvurusu

## ✅ Tamamlanan — E2E Testler (Playwright)

- [x] Auth (login, register, role redirects)
- [x] Search (filter, sort, result cards)
- [x] Landing page (hero, categories, theme toggle)
- [x] Tutor profile (tabs, wizard modal)
- [x] Dashboards (student + tutor lists, accept/cancel actions)
- [x] Admin (dashboard, user list, approve/reject)
- [x] Chat (conversation list, message history, optimistic send)

## ⏸️ Sonraya Saklandı (Dış Servis / API Key Gerekli)

- [ ] SMS doğrulama (Twilio)
- [ ] Email servisi (Spring Mail + HTML template)
- [ ] Gerçek dosya yükleme (S3/Spaces)
- [ ] İyzico/PayTR ödeme entegrasyonu

## 🛠 DevOps

- [ ] CI/CD (GitHub Actions)
- [ ] Sunucu kurulumu (DigitalOcean / Hetzner)
- [ ] Domain + Cloudflare + SSL
- [ ] Monitoring (Sentry / Grafana)
