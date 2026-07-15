# ders.online — Online Özel Ders Pazaryeri

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![E2E](https://img.shields.io/badge/e2e-playwright-blueviolet)]()
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite%20%2B%20Tailwind%20v4-blue)]()
[![Backend](https://img.shields.io/badge/backend-Spring%20Boot%203-red)]()

Superprof alternatifi, **sadece online derslere** odaklanan, sıfır komisyonlu (SaaS abonelik) Türkiye pazarı özel ders platformu.

## Transactional e-mail (Amazon SES)

The backend sends account-verification and password-reset messages through Amazon SES v2. Terraform creates the SES domain identity and adds the minimal `ses:SendEmail` permission to the backend's EKS IRSA role. After `terraform apply`, publish the CNAME records reported by `terraform output ses_dkim_tokens`, then set `serviceAccount.roleArn` in the production Helm values to `terraform output -raw backend_irsa_role_arn`. SES starts in sandbox mode, so request production access before sending to unverified recipients.

---

## Özellikler

- **Gerçek Zamanlı Sohbet** — WebSocket (STOMP) ile anlık mesajlaşma
- **JWT Auth** — Access (15dk) + Refresh (7 gün) token, rol tabanlı yetkilendirme
- **Ders Yönetimi** — Talep et, onayla, iptal et, tamamla, meeting linki paylaş
- **Profil Yönetimi** — Avatar, biyografi, ders seçimi, müsaitlik takvimi
- **Değerlendirme** — 5 yıldızlı puan + yorum sistemi
- **Admin Panel** — Dashboard, kullanıcı yönetimi, doğrulama onayı
- **Dark Mode** — next-themes ile koyu/açık tema
- **33 Ders Konusu** — YKS, LGS, Dil, Yazılım, Müzik kategorilerinde
- **E2E Testler** — Playwright ile tüm kullanıcı akışları testli

---

## Hızlı Başlangıç

### Gereksinimler
- Java 17+, Node.js 18+, Docker Desktop

### 1. Altyapı
```bash
docker compose up -d postgres redis
```

### 2. Backend
```bash
cd backend
./gradlew bootRun
# → http://localhost:8080
```

### 3. Frontend
```bash
npm install
npm run dev
# → http://localhost:5173
```

### Seed Hesaplar (tümü: `123456`)
| Rol | Email |
|-----|-------|
| ADMIN | admin@ogret.io |
| TUTOR | zeynep@ogret.io, mehmet@ogret.io, ayse@ogret.io, can@ogret.io |
| STUDENT | ahmet@ogret.io, elif@ogret.io |

---

## Dokümantasyon

| Belge | İçerik |
|-------|--------|
| [docs/overview.md](docs/overview.md) | Proje genel bakış, seed data, env değişkenleri |
| [docs/architecture.md](docs/architecture.md) | Mimari, veritabanı şeması, routing, auth akışı |
| [docs/api.md](docs/api.md) | Tüm REST API endpoint referansı |
| [docs/development.md](docs/development.md) | Geliştirme rehberi, test, konvansiyonlar |
| [SPEC.md](SPEC.md) | Detaylı sistem şartnamesi, DB şeması, tüm API'ler |
| [ROADMAP.md](ROADMAP.md) | Geliştirme fazları ve gelecek planları |
| [LAUNCH_STRATEGY.md](LAUNCH_STRATEGY.md) | Pazara giriş, büyüme ve exit stratejisi |

---

## Test

```bash
# Backend (33 test)
cd backend && ./gradlew test

# E2E (Playwright)
npm run test:e2e
npm run test:e2e:ui      # Görsel arayüz
npx playwright show-report
```

## API Dokümanı

Swagger UI: http://localhost:8080/swagger-ui.html

Tüm endpoint'ler `/api/v1` prefix'i altındadır.

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Java 17, Spring Boot 3.4.4, Gradle |
| Auth | Spring Security + JWT |
| DB | PostgreSQL 15 |
| Cache | Redis 7 |
| Real-time | WebSocket (STOMP) |
| Frontend | React 18 + Vite 6 |
| UI | Tailwind CSS v4 + shadcn/ui |
| Test (BE) | JUnit 5 |
| Test (FE) | Playwright |
| Docs | Springdoc OpenAPI |
