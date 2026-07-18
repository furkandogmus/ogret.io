# ogret.io — Online Özel Ders Pazaryeri

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![E2E](https://img.shields.io/badge/e2e-playwright-blueviolet)]()
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite%20%2B%20Tailwind%20v4-blue)]()
[![Backend](https://img.shields.io/badge/backend-Spring%20Boot%203-red)]()

Öğrenci ve öğretmenleri buluşturan, **sadece online derslere** odaklanan ve ücretsiz çalışan Türkiye pazarı özel ders platformu.

## E-posta Gönderimi (Varsayılan Olarak Devre Dışı)

Geliştirme ve yerel self-host kurulumlarında e-posta doğrulama akışı kapalıdır. Kayıt işlemleri herhangi bir aktivasyon kodu gerektirmeden anında tamamlanır. Şifre sıfırlama ve doğrulama gibi taleplerde arayüz kullanıcıyı doğrudan adminin geçici şifre belirleyebildiği yerel akışa yönlendirir.

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
- Docker Desktop veya Docker Engine + Compose v2
- Intel ve Apple Silicon (arm64) desteklenir; Compose yerel mimariye uygun imajları otomatik çeker.

### Tek komutla çalıştır

`.env`, API anahtarı veya harici servis hesabı oluşturmadan:

```bash
docker compose up --build
```

Servisler hazır olduğunda:

- Uygulama: http://localhost:3000
- Swagger: http://localhost:3000/api/v1/swagger-ui.html

PostgreSQL, Redis, MinIO ve backend yalnızca Compose ağı içinde kalır; dışarıya
sadece uygulamanın `3000` portu açılır. JWT anahtarı ile ilk hesap şifreleri ilk
çalıştırmada üretilir ve Docker volume içinde korunur.

Arka planda başlatmak için `docker compose up --build -d`, logları izlemek için `docker compose logs -f` ve durdurmak için `docker compose down` kullanın.

### Hazır geliştirme hesapları
| Rol | Email |
|-----|-------|
| ADMIN | admin@ogret.io |
| TUTOR | zeynep@ogret.io |
| STUDENT | ahmet@ogret.io |

İlk şifreleri terminalden görmek için:

```bash
docker compose exec backend show-bootstrap-credentials
```

Bu şifreler yalnızca hesaplar ilk kez oluşturulurken kullanılır; container yeniden
başladığında kullanıcı şifreleri sıfırlanmaz.

Bu hesaplar, örnek öğretmen ilanı ve hafta içi uygunluk takvimi yalnızca `dev` profilinde oluşturulur; production veritabanına yazılmaz.

---

## Dokümantasyon

| Belge | İçerik |
|-------|--------|
| [docs/overview.md](docs/overview.md) | Proje genel bakış, seed data, env değişkenleri |
| [docs/architecture.md](docs/architecture.md) | Mimari, veritabanı şeması, routing, auth akışı |
| [docs/api.md](docs/api.md) | Tüm REST API endpoint referansı |
| [docs/development.md](docs/development.md) | Geliştirme rehberi, test, konvansiyonlar |
| [SPEC.md](SPEC.md) | Detaylı sistem şartnamesi, DB şeması, tüm API'ler |
| [specs/14-production-readiness.md](specs/14-production-readiness.md) | Production çıkış kapıları, riskler, kabul kriterleri ve Go/No-Go planı |
| [ROADMAP.md](ROADMAP.md) | Geliştirme fazları ve gelecek planları |
| [LAUNCH_STRATEGY.md](LAUNCH_STRATEGY.md) | Pazara giriş, büyüme ve exit stratejisi |

---

## Test ve Simülasyon

### Otomatik Testler

```bash
# Backend Birim Testleri
cd backend && ./gradlew test

# E2E Testleri (Playwright)
npm run test:e2e
npm run test:e2e:ui      # Görsel arayüz ile çalıştırma
npx playwright show-report
```

### Yüksek Eş Zamanlılık (Simulation) Testi

Platformun gerçek zamanlı WebSocket mesajlaşma kararlılığını, profil onboarding ve avatar yükleme adımlarını test etmek için 60 eş zamanlı kullanıcıyla çalışan simülasyon testi:

```bash
# Eş zamanlı 50 öğrenci ve 10 öğretmeni simüle eder
node --experimental-strip-types tests/simulation.ts
```

## API Dokümanı

Swagger UI: http://localhost:3000/api/v1/swagger-ui.html

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
