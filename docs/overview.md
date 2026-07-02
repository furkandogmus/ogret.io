# öğret.io — Online Özel Ders Platformu

Türkçe online tutoring marketplace. Öğrenciler öğretmen bulur, mesajlaşır ve ders talep eder.

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 + shadcn/ui |
| Backend | Spring Boot 3.4.4 + Java 17 + Gradle |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| WebSocket | STOMP over raw WebSocket (no SockJS) |
| Auth | JWT (access + refresh token) |
| Docs | OpenAPI/Swagger (http://localhost:8080/swagger-ui.html) |

## Ortam Gereksinimleri

- Java 17+
- Node.js 18+
- Docker & Docker Compose (PostgreSQL + Redis için)

## Hızlı Başlangıç

```bash
# 1. Altyapıyı başlat
docker compose up -d

# 2. Backend
cd backend
./gradlew bootRun

# 3. Frontend (ayrı terminal)
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/swagger-ui.html

## Seed Verisi

7 kullanıcı oluşturulur (tümünün şifresi: `123456`):

| Rol | Ad | Email | Branş |
|-----|-----|-------|-------|
| ADMIN | Admin | admin@ogret.io | - |
| TUTOR | Zeynep Kaya | zeynep@ogret.io | Matematik, Fizik |
| TUTOR | Mehmet Yılmaz | mehmet@ogret.io | Yazılım, Java, React |
| TUTOR | Ayşe Demir | ayse@ogret.io | İngilizce, Almanca |
| TUTOR | Can Özkan | can@ogret.io | Piyano, Gitar, Keman |
| STUDENT | Ahmet Öğrenci | ahmet@ogret.io | - |
| STUDENT | Elif Öğrenci | elif@ogret.io | - |

## Seed Verisi Detayı

Toplam: **33 ders konusu**, 4 öğretmen, 2 öğrenci, 7 ders kaydı, 3 yorum.
Ders kategorileri: YKS, LGS, DIL, YAZILIM, MUZIK, DIGER.

## Ortam Değişkenleri

`.env` dosyası backend kök dizininde:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/dersplatform
SPRING_DATASOURCE_USERNAME=dersplatform
SPRING_DATASOURCE_PASSWORD=dersplatform
SPRING_REDIS_HOST=localhost
JWT_SECRET=<256-bit-base64-secret>
```

Varsayılan değerler `application.properties` içinde tanımlıdır.
