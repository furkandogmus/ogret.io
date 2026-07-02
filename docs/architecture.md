# Mimari

## Proje Yapısı

```
ders-platform/
├── backend/                          # Spring Boot
│   └── src/main/java/com/dersplatform/
│       ├── config/                   # Security, WebSocket, CORS, Rate Limit
│       ├── controller/               # REST controllers
│       ├── model/
│       │   ├── dto/request/          # Request DTOs
│       │   ├── dto/response/         # Response DTOs
│       │   ├── entity/               # JPA entities
│       │   └── enums/                # Enum types
│       ├── repository/               # Spring Data JPA repos
│       ├── service/                  # Business logic
│       ├── websocket/                # STOMP message handlers
│       └── security/                 # JWT filter, auth entry point
├── src/                              # React frontend
│   └── app/
│       ├── api/                      # Axios client, service functions
│       ├── components/
│       │   ├── layout/               # Navbar, RootLayout
│       │   ├── shared/               # Avatar, StarRating, TutorCard, LessonRequestModal
│       │   └── ui/                   # shadcn/ui components
│       ├── hooks/                    # useWebSocket
│       ├── pages/                    # Page components (route pages)
│       ├── providers/                # AuthProvider, ModalProvider
│       └── lib/                      # Utilities (cn)
└── docs/                             # Dokümantasyon
```

## Veritabanı Şeması

```
users
├── id (UUID, PK)
├── email (unique)
├── phone
├── password_hash (BCrypt)
├── full_name
├── avatar_url
├── role (STUDENT|TUTOR|ADMIN)
├── bio, education
├── experience_years, hourly_rate
├── rating_avg, rating_count (calculated)
├── is_verified, is_online, is_profile_complete, is_identity_verified
└── created_at

subjects
├── id (UUID, PK)
├── name, slug
└── category

tutor_subjects
├── tutor_id (FK → users)
├── subject_id (FK → subjects)
└── PK: (tutor_id, subject_id)

tutor_availability
├── id (UUID, PK)
├── tutor_id (FK → users)
├── day_of_week (0=Mon..6=Sun)
├── start_time, end_time
└── is_recurring

lessons
├── id (UUID, PK)
├── student_id (FK → users)
├── tutor_id (FK → users)
├── subject_id (FK → subjects)
├── status (PENDING|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED)
├── lesson_date, start_time, end_time
├── duration_minutes, price
├── meeting_link, notes
├── student_cancelled, cancellation_reason
└── created_at

reviews
├── id (UUID, PK)
├── lesson_id (FK → lessons, unique)
├── student_id (FK → users)
├── tutor_id (FK → users)
├── rating (1-5), comment
├── is_anonymous
└── created_at

messages
├── id (UUID, PK)
├── sender_id (FK → users)
├── receiver_id (FK → users)
├── content
├── message_type (TEXT|IMAGE|FILE|SYSTEM)
├── file_url
├── lesson_id (nullable)
├── is_read
└── created_at

favorites
├── student_id (FK → users)
├── tutor_id (FK → users)
└── PK: (student_id, tutor_id)

subscriptions
├── id (UUID, PK)
├── tutor_id (FK → users)
├── plan_type (BASIC|PREMIUM|VIP)
├── price
├── start_date, end_date
├── is_active
└── payment_method

tutor_verifications
├── id (UUID, PK)
├── tutor_id (FK → users)
├── document_type, document_url
├── status (PENDING|APPROVED|REJECTED)
├── admin_note
└── created_at

audit_logs
├── id (UUID, PK)
├── user_id, action, entity_type, entity_id
├── old_value, new_value
└── created_at
```

## Frontend Routing

| Route | Page | Auth |
|-------|------|------|
| `/` | LandingPage | - |
| `/arama` | SearchPage | - |
| `/ogretmen/:id` | TutorProfilePage | - |
| `/giris` | LoginPage | - |
| `/kayit` | RegisterPage | - |
| `/ogrenci-panel` | StudentDashboard | STUDENT |
| `/ogretmen-panel` | TutorDashboard | TUTOR |
| `/mesajlar` | MessagesPage | Any |
| `/admin` | AdminDashboard | ADMIN |
| `/abonelik` | SubscriptionPage | TUTOR |
| `/dogrulama` | VerificationPage | TUTOR |
| `/profil/duzenle` | ProfileEditPage | Any |

## Auth Akışı

```
Login → JWT (accessToken + refreshToken) → localStorage
    ↓
Axios interceptor: 401 → refresh token → retry
    ↓
Refresh başarısız → localStorage temizle → redirect /
```

Backend: JwtAuthenticationFilter her isteği拦截 eder, /auth/** hariç.

## WebSocket Mesajlaşma

```
STOMP CONNECT → WebSocketAuthInterceptor (JWT validate)
    ↓
/app/chat.send/{receiverId} → Backend → /topic/messages/{receiverId}
    ↓
Frontend subscribes: /user/queue/messages
```

Her kullanıcı kendine özel kuyruğa abone olur. Mesaj gönderildiğinde backend hem göndereni hem alıcıyı bilgilendirir.

## Rate Limiting

In-memory filter: IP başına dakikada 20 istek. Aşımda 429 Too Many Requests.

## Flyway Migrations

| Migration | İçerik |
|-----------|--------|
| V1__initial_schema.sql | Tüm tablolar |
| V2__seed_subjects.sql | Ders konuları (10 adet) |
| V3__audit_logs.sql | audit_logs tablosu |
| V4__seed_data.sql | 6 kullanıcı + availability + ders + yorum |
| V5__extend_subjects.sql | 16 yeni ders konusu + Can Özkan (müzik) + ek ders/yorum |

V4, BCrypt hash kullanır (`AppSeeder` component'i ile güncellenir).
