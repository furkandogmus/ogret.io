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
| Docs | OpenAPI/Swagger (http://localhost:3000/api/v1/swagger-ui.html) |

## Ortam Gereksinimleri

- Docker Desktop veya Docker Engine + Compose v2

## Hızlı Başlangıç

```bash
docker compose up --build
```

- `.env`, API token'ı veya harici servis hesabı gerekmez.
- Frontend: http://localhost:3000
- API Docs: http://localhost:3000/api/v1/swagger-ui.html
- PostgreSQL, Redis, MinIO ve backend host ağına açılmaz.

## Seed Verisi

`dev` profilinde 3 başlangıç kullanıcısı oluşturulur:

| Rol | Ad | Email | Branş |
|-----|-----|-------|-------|
| ADMIN | Admin | admin@ogret.io | - |
| TUTOR | Zeynep Kaya | zeynep@ogret.io | Matematik, Fizik |
| STUDENT | Ahmet Öğrenci | ahmet@ogret.io | - |

İlk şifreler `docker compose exec backend show-bootstrap-credentials` komutuyla
görülebilir. JWT anahtarı ve başlangıç şifreleri ilk açılışta rastgele üretilip
kalıcı Docker volume'ünde saklanır.

## Seed Verisi Detayı

Toplam **33 ders konusu** korunur. Örnek öğretmen için aktif matematik ilanı ve
hafta içi uygunluk saatleri eklenir; admin, öğrenci ve öğretmen akışları hemen
denenebilir. Geliştirme kullanıcıları production profilinde oluşturulmaz.

## Ortam Değişkenleri

Docker dışından backend geliştirmek isterseniz aşağıdaki ayarları override
edebilirsiniz; varsayılan Docker akışında bunlara gerek yoktur:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/dersplatform
SPRING_DATASOURCE_USERNAME=dersplatform
SPRING_DATASOURCE_PASSWORD=dersplatform
REDIS_HOST=localhost
EMAIL_ENABLED=false
```

Yerel varsayılanlar `application.yml` ve `application-dev.yml` içinde tanımlıdır.
