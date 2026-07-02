# API Referansı

Tüm endpoint'ler `/api/v1` prefix'i altındadır.

Kimlik doğrulama gerektiren endpoint'ler `Authorization: Bearer <token>` header'ı ile çağrılır.

---

## Auth

### Kayıt
```
POST /auth/register
Body: { email, phone, password, fullName, role: "STUDENT"|"TUTOR" }
Response: { accessToken, refreshToken, user }
```

### Giriş
```
POST /auth/login
Body: { email, password }
Response: { accessToken, refreshToken, user }
```

### Token Yenileme
```
POST /auth/refresh
Body: { refreshToken }
Response: { accessToken, refreshToken, user }
```

### Email Doğrulama
```
POST /auth/verify-email?token=<token>
```

### Telefon Doğrulama
```
POST /auth/verify-phone?code=<code>
```

### Şifre Sıfırlama
```
POST /auth/forgot-password  Body: { email }
POST /auth/reset-password   Body: { token, newPassword }
```

---

## Kullanıcılar (Auth gerekli)

```
GET    /users/me                        — profilim
PUT    /users/me                        — profil güncelle
PUT    /users/me/avatar                 — avatar güncelle
GET    /users/{id}                      — kullanıcı detay
GET    /users?q=<search>                — kullanıcı ara (mesajlaşma için)
```

---

## Öğretmenler

```
GET  /tutors?subjectId=&minPrice=&maxPrice=&minRating=&sort=&page=&size=
GET  /tutors/{id}
GET  /tutors/{id}/availability
```

**Sort parametreleri:** `popular`, `rating`, `price_asc`, `price_desc`

**Yanıt (list):** Paginated `{ content: [...], totalElements, totalPages, ... }`
**Yanıt (detail):** `UserResponse`

---

## Dersler (Auth gerekli)

```
POST   /lessons                         — talep oluştur
GET    /lessons?as=student|tutor        — listele
GET    /lessons/{id}                    — detay
PUT    /lessons/{id}/confirm            — onayla (tutor)
PUT    /lessons/{id}/cancel             — iptal et
PUT    /lessons/{id}/complete           — tamamla (tutor)
PUT    /lessons/{id}/meeting-link       — meeting link ekle (tutor)
```

**Create body:** `{ tutorId, subjectId, lessonDate, startTime, endTime, notes? }`

---

## Yorumlar (Auth gerekli)

```
POST   /lessons/{id}/review             — yorum yap
GET    /tutors/{id}/reviews             — öğretmen yorumları
GET    /reviews                         — kendi yorumlarım
```

**Create body:** `{ rating: 1-5, comment?, anonymous? }`

---

## Mesajlar (Auth gerekli)

```
GET    /messages?with=<userId>          — konuşma geçmişi
POST   /messages                        — mesaj gönder
GET    /messages/unread                 — okunmamış mesajlar
PUT    /messages/{id}/read              — okundu işaretle
```

**Send body:** `{ receiverId, content, lessonId? }`

## WebSocket (STOMP)

Bağlantı: `/ws/chat` (raw WebSocket, SockJS yok)

**Subscribe:** `/user/queue/messages` — gelen mesajlar
**Send:** `/app/chat.send/{receiverId}` — mesaj gönder
**Send:** `/app/chat.typing/{receiverId}` — yazıyor bildirimi

Bağlantıda STOMP CONNECT header'ına JWT token eklenir:
```
Authorization: Bearer <token>
```

---

## Favoriler (Auth gerekli)

```
GET    /favorites                       — favori öğretmenlerim
POST   /favorites/{tutorId}             — ekle
DELETE /favorites/{tutorId}             — çıkar
```

---

## Abonelik (Auth gerekli, TUTOR)

```
GET    /subscriptions/plans             — plan listesi
POST   /subscriptions                   — abone ol
GET    /subscriptions/me                — aboneliğim
POST   /subscriptions/cancel            — iptal
```

---

## Admin (Auth gerekli, ADMIN)

```
GET    /admin/dashboard                 — istatistikler
GET    /admin/users                     — kullanıcı listesi
PUT    /admin/users/{id}/verify         — kullanıcı doğrula
GET    /admin/verifications             — doğrulama başvuruları
PUT    /admin/verifications/{id}        — doğrulama kararı
GET    /admin/lessons                   — tüm dersler
```

---

## Response Tipleri

**UserResponse:**
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
  "identityVerified": "boolean"
}
```

**TutorSummaryResponse:**
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

**LessonResponse:**
```json
{
  "id": "uuid",
  "status": "PENDING|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED",
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

**MessageResponse:**
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

**ReviewResponse:**
```json
{
  "id": "uuid",
  "studentName": "string",
  "studentAvatar": "string|null",
  "rating": 5,
  "comment": "string|null",
  "anonymous": false,
  "createdAt": "string"
}
```
