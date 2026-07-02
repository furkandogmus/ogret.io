# Online Ders Platformu — Sistem Mimarisi ve API Şartnamesi

## 1. Proje Özeti

Superprof alternatifi, Türkiye odaklı online özel ders marketplace platformu.
Sadece online derslere odaklanır. Ödeme direkt öğrenciden öğretmene (IBAN/elden),
platform abonelik + reklam modeliyle gelir elde eder.

### Hedef Kitle
- LGS/YKS hazırlık öğrencileri (birincil)
- Yabancı dil, yazılım, müzik (genişleme)

---

## 2. Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Java 17, Spring Boot 3.4.4, Gradle 8.13 |
| Auth | Spring Security + JWT (access 15dk + refresh 7 gün) |
| DB | PostgreSQL 15 |
| Cache / Rate Limiting | Redis 7 |
| API Docs | Springdoc OpenAPI (Swagger UI) |
| Real-time | WebSocket (STOMP, raw, no SockJS) |
| File Storage | Mock (S3 entegrasyonu ertelendi) |
| SMS/Email | Mock (Twilio + Spring Mail ertelendi) |
| Frontend | React 18 + Vite 6 |
| UI Framework | Tailwind CSS v4 + shadcn/ui |
| State | React Context + react-router |
| Test (FE) | Playwright (E2E) |
| Test (BE) | JUnit 5 + Spring Boot Test |
| DevOps | Docker Compose, GitHub Actions (hazırlık) |

---

## 3. Dizin Yapısı

```
ders-platform/
├── backend/
│   ├── src/main/java/com/dersplatform/
│   │   ├── config/           # Security, WebSocket, CORS, Rate Limit, Redis, Swagger
│   │   ├── controller/       # REST controllers (11 adet)
│   │   ├── service/          # Business logic (7 adet)
│   │   ├── repository/       # JPA repositories (10 adet)
│   │   ├── model/
│   │   │   ├── entity/       # JPA entities
│   │   │   ├── dto/          # Request/Response DTOs
│   │   │   └── enums/        # Enum types
│   │   ├── exception/        # Global exception handler
│   │   ├── security/         # JWT filter, UserDetails, auth entry point
│   │   └── websocket/        # STOMP message handlers
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   └── db/migration/     # Flyway (V1-V5)
│   ├── build.gradle
│   └── Dockerfile
├── src/                       # React frontend
│   ├── app/
│   │   ├── api/               # Axios client + service functions
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, RootLayout
│   │   │   ├── shared/        # Avatar, StarRating, TutorCard, LessonRequestModal
│   │   │   └── ui/            # shadcn/ui primitives
│   │   ├── hooks/             # useWebSocket
│   │   ├── pages/             # Page components
│   │   ├── providers/         # AuthProvider, ModalProvider
│   │   └── lib/               # Utilities (cn)
│   ├── styles/
│   └── main.tsx
├── docker-compose.yml
└── docs/
```

---

## 4. Mevcut Durum (Temmuz 2026)

### Frontend (React) — Tamam
- [x] Landing page (hero, kategoriler API'den, öne çıkan öğretmenler, nasıl çalışır, CTA, footer)
- [x] Öğretmen arama sayfası (filtreleme: konu/fiyat/puan, sıralama: popüler/puan/fiyat)
- [x] Öğretmen profil sayfası (bio, eğitim, yorumlar, müsaitlik takvimi)
- [x] Ders talep modalı (4 adım: konu/süre → tarih/saat → mesaj → onay)
- [x] Öğrenci paneli (dashboard, yaklaşan/geçmiş dersler, favoriler, değerlendirme)
- [x] Öğretmen paneli (dashboard, bekleyen/onaylanan/geçmiş dersler, gelir grafiği)
- [x] Profil düzenleme (avatar, biyografi, eğitim, ders seçimi, müsaitlik takvimi)
- [x] Mesajlaşma sayfası (sol liste + chat penceresi, WebSocket gerçek zamanlı)
- [x] Admin panel (dashboard, kullanıcı listesi, doğrulama yönetimi)
- [x] Abonelik sayfası (plan seçimi)
- [x] Kimlik doğrulama başvuru sayfası
- [x] Dark mode (next-themes)
- [x] React Router ile sayfa yönlendirme
- [x] Responsive tasarım (mobile/tablet/desktop)
- [x] Auth (JWT login/register, refresh interceptor, role-based routing)

### Backend (Spring Boot) — Tamam
- [x] Proje kurulumu (Gradle, Java 17, Spring Boot 3.4.4)
- [x] Security + JWT (access + refresh token)
- [x] 11 entity, 10 repository, 7 service, 11 controller
- [x] Flyway migration (V1 schema + V2 seed + V3 audit_logs + V4 seed data + V5 extend)
- [x] Rate limiting (in-memory, IP başına 100 istek/dk)
- [x] Audit log (admin işlemleri)
- [x] Global exception handler + validasyon
- [x] OpenAPI / Swagger UI
- [x] WebSocket (STOMP) gerçek zamanlı mesajlaşma
- [x] Seed data: 7 kullanıcı, 33 ders konusu, 6 kategori, 7 ders, 3 yorum
- [x] 33 JUnit test (controller layer)

### E2E Testler (Playwright) — Tamam
- [x] Auth (login, register, role redirects)
- [x] Search (filter, sort, result cards)
- [x] Landing page (hero, categories, theme toggle)
- [x] Tutor profile (tabs, wizard modal)
- [x] Dashboards (student + tutor lists, accept/cancel actions)
- [x] Admin (dashboard, user list, approve/reject)
- [x] Chat (conversation list, message history, optimistic send)

---

## 5. Database Şeması

### users
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | BCrypt |
| full_name | VARCHAR(100) | |
| avatar_url | TEXT | base64 veya S3 URL |
| role | ENUM('STUDENT','TUTOR','ADMIN') | |
| is_verified | BOOLEAN | Email+telefon doğrulama |
| is_profile_complete | BOOLEAN | |
| bio | TEXT | Sadece tutor |
| education | TEXT | Tutor eğitim geçmişi (JSON) |
| experience_years | INT | |
| hourly_rate | DECIMAL(10,2) | Tutor saatlik ücret |
| rating_avg | DECIMAL(2,1) | Ortalama puan (hesaplanan) |
| rating_count | INT | |
| is_online | BOOLEAN | Müsaitlik durumu |
| is_identity_verified | BOOLEAN | Kimlik doğrulama |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### subjects
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| name | VARCHAR(100) | "Matematik", "Fizik" vb. |
| slug | VARCHAR(100) | UNIQUE |
| category | ENUM('LGS','YKS','DIL','YAZILIM','MUZIK','DIGER') | |
| icon | VARCHAR(255) | |
| is_active | BOOLEAN | |

### tutor_subjects
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| tutor_id | UUID | FK → users |
| subject_id | UUID | FK → subjects |
| PK: (tutor_id, subject_id) | | |

### tutor_availability
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| tutor_id | UUID | FK → users |
| day_of_week | INT | 0=Pazartesi … 6=Pazar |
| start_time | TIME | |
| end_time | TIME | |
| is_active | BOOLEAN | |

### lessons
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| student_id | UUID | FK → users |
| tutor_id | UUID | FK → users |
| subject_id | UUID | FK → subjects |
| status | ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED') | |
| lesson_date | DATE | |
| start_time | TIME | |
| end_time | TIME | |
| duration_minutes | INT | |
| price | DECIMAL(10,2) | |
| meeting_link | VARCHAR(500) | Zoom/Google Meet linki |
| notes | TEXT | |
| student_cancelled | BOOLEAN | |
| cancellation_reason | TEXT | |
| created_at | TIMESTAMP | |

### reviews
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| lesson_id | UUID | FK → lessons, UNIQUE |
| student_id | UUID | FK → users |
| tutor_id | UUID | FK → users |
| rating | INT | 1-5 |
| comment | TEXT | |
| is_anonymous | BOOLEAN | |
| created_at | TIMESTAMP | |

### messages
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| sender_id | UUID | FK → users |
| receiver_id | UUID | FK → users |
| lesson_id | UUID | FK → lessons (nullable) |
| content | TEXT | |
| message_type | ENUM('TEXT','IMAGE','FILE','SYSTEM') | |
| file_url | TEXT | |
| is_read | BOOLEAN | |
| created_at | TIMESTAMP | |

### favorite_tutors
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| student_id | UUID | FK → users |
| tutor_id | UUID | FK → users |
| created_at | TIMESTAMP | |
| PK: (student_id, tutor_id) | | |

### subscriptions
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| tutor_id | UUID | FK → users |
| plan_type | ENUM('BASIC','PREMIUM','VIP') | |
| price | DECIMAL(10,2) | |
| start_date | TIMESTAMP | |
| end_date | TIMESTAMP | |
| is_active | BOOLEAN | |
| payment_method | VARCHAR(50) | |
| created_at | TIMESTAMP | |

### tutor_verifications
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| tutor_id | UUID | FK → users |
| document_type | ENUM('IDENTITY','DIPLOMA','CERTIFICATE') | |
| document_url | TEXT | |
| status | ENUM('PENDING','APPROVED','REJECTED') | |
| admin_note | TEXT | |
| created_at | TIMESTAMP | |
| reviewed_at | TIMESTAMP | |

### audit_logs
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| user_id | UUID | |
| action | VARCHAR(100) | |
| entity_type | VARCHAR(50) | |
| entity_id | UUID | |
| old_value | TEXT | |
| new_value | TEXT | |
| created_at | TIMESTAMP | |

---

## 6. API Endpoints (RESTful)

Tüm endpoint'ler `/api/v1` prefix'i altındadır.
Kimlik doğrulama gerektirenler `Authorization: Bearer <token>` header'ı ile çağrılır.

### Auth (public)
```
POST   /api/v1/auth/register          # Öğrenci & öğretmen kaydı
POST   /api/v1/auth/login             # Giriş → { accessToken, refreshToken, user }
POST   /api/v1/auth/refresh           # Refresh token → yeni token çifti
POST   /api/v1/auth/verify-email      # Email doğrulama (mock)
POST   /api/v1/auth/verify-phone      # SMS doğrulama (mock)
POST   /api/v1/auth/forgot-password   # Şifre sıfırlama email'i (mock)
POST   /api/v1/auth/reset-password    # Yeni şifre belirleme
```

### Users (auth gerekli)
```
GET    /api/v1/users/me               # Kendi profili
PUT    /api/v1/users/me               # Profil güncelle
PUT    /api/v1/users/me/avatar        # Avatar yükle (base64)
GET    /api/v1/users/{id}             # Kullanıcı profili (public)
GET    /api/v1/users?q={search}       # Kullanıcı ara (mesajlaşma için)
```

### Tutors (listeleme public, yönetim auth+TUTOR)
```
# Public
GET    /api/v1/tutors                          # Öğretmen listesi (filtreleme+sayfalama)
       ?subjectId=&minPrice=&maxPrice=&minRating=&sort=popular|rating|price_asc|price_desc&page=&size=
GET    /api/v1/tutors/{id}                     # Öğretmen detay profili
GET    /api/v1/tutors/{id}/availability        # Müsaitlik takvimi (public)
GET    /api/v1/tutors/{id}/reviews             # Yorumları

# Auth gerekli (TUTOR)
GET    /api/v1/tutors/me/subjects              # Derslerim
PUT    /api/v1/tutors/me/subjects              # Derslerimi güncelle → { subjectIds: [...] }
GET    /api/v1/tutors/me/availability          # Müsaitlik takvimim
PUT    /api/v1/tutors/me/availability          # Müsaitlik güncelle → { slots: [{ dayOfWeek, startTime, endTime }] }
```

### Subjects (public)
```
GET    /api/v1/subjects               # Tüm dersler (kategoriye göre gruplanabilir)
GET    /api/v1/subjects/{id}/tutors   # Bir dersi veren öğretmenler
```

### Lessons (auth gerekli)
```
POST   /api/v1/lessons                # Ders talebi oluştur (öğrenci)
GET    /api/v1/lessons                # Derslerim (rol bazlı: ?as=student|tutor)
GET    /api/v1/lessons/{id}           # Ders detayı
PUT    /api/v1/lessons/{id}/confirm   # Dersi onayla (öğretmen)
PUT    /api/v1/lessons/{id}/cancel    # Dersi iptal et (her iki taraf)
PUT    /api/v1/lessons/{id}/complete  # Dersi tamamla (öğretmen)
PUT    /api/v1/lessons/{id}/meeting-link # Meeting linki ekle/güncelle
```

### Reviews (auth gerekli)
```
POST   /api/v1/lessons/{id}/review    # Yorum yap (öğrenci, sadece COMPLETED derslere)
GET    /api/v1/reviews                # Kendi yorumlarım
```

### Messages (auth gerekli, REST + WebSocket)
```
# REST fallback
GET    /api/v1/messages               # Tüm konuşmalar (son mesaj özeti)
POST   /api/v1/messages               # Mesaj gönder → { receiverId, content, lessonId? }
GET    /api/v1/messages/unread        # Okunmamış mesaj sayısı
PUT    /api/v1/messages/{id}/read     # Okundu işaretle

# WebSocket (STOMP)
WS     /ws/chat                       # Raw WebSocket bağlantısı
       → SUB /user/queue/messages     # Gelen mesajları dinle
       → SEND /app/chat.send/{receiverId}   # Mesaj gönder
       → SEND /app/chat.typing/{receiverId} # Yazıyor bildirimi
```

### Favorites (auth gerekli)
```
GET    /api/v1/favorites              # Favori öğretmenlerim
POST   /api/v1/favorites/{tutorId}    # Favoriye ekle
DELETE /api/v1/favorites/{tutorId}    # Favoriden çıkar
```

### Subscriptions (auth gerekli, TUTOR)
```
GET    /api/v1/subscriptions/plans    # Abonelik planları (BASIC/PREMIUM/VIP)
POST   /api/v1/subscriptions          # Abonelik başlat
GET    /api/v1/subscriptions/me       # Aboneliğim
POST   /api/v1/subscriptions/cancel   # Aboneliği iptal et
```

### Verifications (auth gerekli, TUTOR)
```
POST   /api/v1/verifications          # Doğrulama belgesi yükle → { documentType, documentUrl }
```

### Admin (auth gerekli, ADMIN)
```
GET    /api/v1/admin/dashboard        # Dashboard istatistikleri
GET    /api/v1/admin/users            # Tüm kullanıcılar (sayfalı)
PUT    /api/v1/admin/users/{id}/verify# Kullanıcı doğrulama durumu güncelle
GET    /api/v1/admin/verifications    # Bekleyen doğrulama başvuruları
PUT    /api/v1/admin/verifications/{id} # Doğrulama onay/ret
GET    /api/v1/admin/lessons          # Tüm dersler
```

---

## 7. Response Tipleri

### UserResponse
```json
{
  "id": "uuid",
  "email": "string",
  "fullName": "string",
  "role": "STUDENT|TUTOR|ADMIN",
  "avatarUrl": "string|null",
  "phone": "string",
  "bio": "string|null",
  "education": "string|null",
  "experienceYears": "int|null",
  "hourlyRate": "number|null",
  "ratingAvg": "number|null",
  "ratingCount": "int|null",
  "online": "boolean",
  "verified": "boolean",
  "profileComplete": "boolean",
  "identityVerified": "boolean",
  "subjects": ["SubjectResponse"],
  "createdAt": "string"
}
```

### TutorSummaryResponse
```json
{
  "id": "uuid",
  "fullName": "string",
  "avatarUrl": "string|null",
  "title": "string|null",
  "bio": "string|null",
  "ratingAvg": "number",
  "ratingCount": "int",
  "hourlyRate": "number",
  "experienceYears": "int",
  "online": "boolean",
  "identityVerified": "boolean",
  "subjects": ["string"],
  "tags": ["string"]
}
```

### LessonResponse
```json
{
  "id": "uuid",
  "status": "PENDING|CONFIRMED|COMPLETED|CANCELLED",
  "lessonDate": "2026-07-02",
  "startTime": "14:00:00",
  "endTime": "15:00:00",
  "durationMinutes": 60,
  "price": 350.0,
  "meetingLink": "string|null",
  "notes": "string|null",
  "studentCancelled": false,
  "cancellationReason": "string|null",
  "student": UserResponse,
  "tutor": UserResponse,
  "subject": { "id": "uuid", "name": "string" },
  "createdAt": "2026-07-02T12:00:00"
}
```

### MessageResponse
```json
{
  "id": "uuid",
  "senderId": "uuid",
  "senderName": "string",
  "senderAvatar": "string|null",
  "receiverId": "uuid",
  "receiverName": "string",
  "receiverAvatar": "string|null",
  "content": "string",
  "messageType": "TEXT|IMAGE|FILE|SYSTEM",
  "fileUrl": "string|null",
  "read": false,
  "createdAt": "2026-07-02T12:00:00"
}
```

### ReviewResponse
```json
{
  "id": "uuid",
  "studentName": "string",
  "studentAvatar": "string|null",
  "rating": 5,
  "comment": "string|null",
  "anonymous": false,
  "createdAt": "2026-07-02T12:00:00"
}
```

---

## 8. İş Modeli

### Gelir Akışları
1. **Öğretmen Aboneliği (ana gelir)**
   - BASIC: ₺49/ay (standart profil, 10 ders talebi/ay)
   - PREMIUM: ₺99/ay (öne çıkan profil, limitsiz talep, istatistikler)
   - VIP: ₺199/ay (en üstte listeleme, öncelikli destek, doğrulama rozeti)

2. **Profil Öne Çıkarma (tek seferlik)**
   - ₺29/hafta (arama sonuçlarında üst sıra)

3. **Reklam (ileriki aşama)**
   - Banner reklamlar, kitap/kurs yönlendirmeleri

### Maliyet Yapısı
- Sunucu: ~₺500-1000/ay (DigitalOcean/Cloudflare)
- SMS: ~₺0.20/mesaj (sadece doğrulama)
- Storage: ~₺100/ay (profil fotoğrafları, kimlik belgeleri)

---

## 9. Kullanıcı Akışları

### Öğrenci Akışı
```
1. Kayıt → giriş
2. Ders ara (kategori/fiyat/puan filtresi)
3. Öğretmen profili incele (yorumlar, eğitim, puan, müsaitlik)
4. Ders talep et (konu, süre, tarih, mesaj)
5. Öğretmen onaylayınca meeting linki al
6. Ders saati gelince Zoom/Meet ile ders
7. Ders sonu yorum/puan bırak
```

### Öğretmen Akışı
```
1. Kayıt (rol=TUTOR) → profil oluştur
2. Ders konularını seç, müsaitlik takvimi ayarla
3. Kimlik doğrulama belgesi yükle
4. Gelen ders taleplerini gör → onayla/reddet
5. Meeting linki paylaş
6. Ders tamamlanınca puan/yorum al
7. Abonelik başlat (profil öne çıksın)
```

---

## 10. Superprof'tan Farkımız

| Özellik | Superprof TR | ders.online |
|---------|------------|-------------|
| Tasarım | Eski, karmaşık | Modern, temiz, dark mode |
| Mobil | Webview, kötü UX | Responsive web (Expo planlandı) |
| Fiyat | Öğretmene yıllık ~₺1200 | Aylık ₺49'dan başlayan |
| Online ders | Karma (yüz yüze+online) | Sadece online, optimize |
| Kimlik doğrulama | Zayıf | Belge yükleme + admin onayı |
| Mesajlaşma | E-posta tabanlı | Real-time WebSocket chat |
| Komisyon | Yıllık üyelik | Sıfır komisyon, SaaS abonelik |

---

## 11. Deployment

```
DigitalOcean / Hetzner
├── Docker Compose
│   ├── backend.jar       # Spring Boot
│   ├── postgres:15       # PostgreSQL
│   ├── redis:7           # Redis
│   └── nginx             # Reverse proxy
├── Cloudflare DNS + CDN
└── GitHub Actions CI/CD
```

### CI/CD Pipeline
```
git push → GitHub Actions → test → build → Docker push → deploy
```

---

## 12. Güvenlik & Yasal

### KVKK / Veri Güvenliği
- Şifreler: BCrypt ile hash
- JWT: 15dk access + 7 gün refresh token
- API trafiği HTTPS (production)
- Veritabanı bağlantılarında SSL (production)
- Audit log ile admin işlemleri kaydı

### Yasal Gereklilikler
- Aydınlatma metni (KVKK)
- Çerez politikası
- Kullanıcı sözleşmesi
- Mesafeli hizmet sözleşmesi (tutor için)
- BTK / 5651 sayılı kanun (log tutma)

### Platform Sorumluluğu
- Platform ders ücretine aracılık etmez (direkt IBAN/elden)
- "Aracı hizmet sağlayıcı" statüsü
- Kullanıcılar arası uyuşmazlıklarda doğrudan sorumlu değil
- Şikayet yönetimi ve kötüye kullanım engelleme mekanizması mevcut

---

## 13. Seed Verisi

7 kullanıcı (tümünün şifresi: `123456`)

| Rol | Ad | Email | Branş |
|-----|-----|-------|-------|
| ADMIN | Admin | admin@ogret.io | - |
| TUTOR | Zeynep Kaya | zeynep@ogret.io | Matematik, Fizik |
| TUTOR | Mehmet Yılmaz | mehmet@ogret.io | Yazılım, Java, React |
| TUTOR | Ayşe Demir | ayse@ogret.io | İngilizce, Almanca |
| TUTOR | Can Özkan | can@ogret.io | Piyano, Gitar, Keman |
| STUDENT | Ahmet Öğrenci | ahmet@ogret.io | - |
| STUDENT | Elif Öğrenci | elif@ogret.io | - |

Toplam: **33 ders konusu**, 6 kategori (YKS, LGS, DIL, YAZILIM, MUZIK, DIGER), 7 ders, 3 yorum.

---

## 14. Öncelikli Özellikler — Durum

| Feature | Durum |
|---------|-------|
| Kullanıcı kaydı/girişi (JWT) | ✅ |
| Öğretmen profili oluşturma | ✅ |
| Ders kategorileri ve arama | ✅ |
| Öğretmen listesi + filtreleme + sıralama | ✅ |
| Öğretmen detay sayfası | ✅ |
| Ders talep etme akışı | ✅ |
| Öğretmen onay/red/iptal/tamamlama | ✅ |
| Meeting linki yönetimi | ✅ |
| Yorum/puanlama sistemi | ✅ |
| Real-time mesajlaşma (WebSocket) | ✅ |
| Müsaitlik takvimi (CRUD) | ✅ |
| Ders konusu seçimi (CRUD) | ✅ |
| Favori öğretmenler | ✅ |
| Kimlik doğrulama belgesi yükleme | ✅ |
| Admin panel (kullanıcı + doğrulama yönetimi) | ✅ |
| Dashboard istatistikleri (öğretmen) | ✅ |
| Abonelik sistemi (plan CRUD) | ✅ |
| Avatar yükleme | ✅ |
| Dark mode | ✅ |
| Responsive tasarım | ✅ |
| E2E testler (Playwright) | ✅ |
| Ders İlanları (Ad) Sistemi (Superprof tarzı çoklu ilan, ücrete göre ayrım) | 🗓️ (Planlandı - [Şartname](file:///Users/furkan/.gemini/antigravity-ide/brain/f6e4d77b-493d-4871-a2ec-d2340c64e9e3/superprof_listings_spec.md) hazır) |
| SMS doğrulama (Twilio) | ⏸️ (API key gerekli) |
| Email servisi (Spring Mail) | ⏸️ (API key gerekli) |
| Dosya yükleme (S3/Spaces) | ⏸️ (API key gerekli) |
| Ödeme entegrasyonu (İyzico/PayTR) | ⏸️ (API key gerekli) |
| Mobil uygulama (Expo) | ⏸️ |
| CI/CD (GitHub Actions) | ⏸️ |
