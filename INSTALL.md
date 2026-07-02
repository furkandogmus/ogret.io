# Kurulum Rehberi

## Gereksinimler

| Araç | Versiyon | Kontrol |
|------|----------|---------|
| Java | 17+ | `java -version` |
| Node.js | 18+ | `node -v` |
| pnpm | 11+ | `pnpm -v` |
| Docker | 24+ | `docker -v` |
| Docker Compose | 2+ | `docker compose version` |

### pnpm Kurulumu

pnpm `packageManager` alanında tanımlıdır, corepack ile etkinleştirin:

```bash
corepack enable
corepack prepare pnpm@11 --activate
```

Alternatif: `npm install -g pnpm`

---

## 1. Hızlı Başlangıç (Geliştirme)

### 1.1. Altyapıyı Başlat

PostgreSQL ve Redis'i Docker ile ayağa kaldırın:

```bash
make db-start
# veya manuel:
docker compose up -d postgres redis
```

### 1.2. Ortam Değişkenleri

`.env.example` dosyasını kopyalayın:

```bash
cp .env.example .env
```

Varsayılan değerler development için yeterlidir. JWT_SECRET değiştirmek için:

```bash
# Rastgele secret oluştur
openssl rand -base64 32
```

### 1.3. Bağımlılıkları Yükle

```bash
make install
# veya sırayla:
pnpm install                          # frontend
cd backend && ./gradlew build -x test  # backend
```

### 1.4. Backend'i Çalıştır

```bash
make backend-run
# → http://localhost:8080
# → Swagger: http://localhost:8080/swagger-ui.html
```

### 1.5. Frontend'i Çalıştır (ayrı terminal)

```bash
make frontend-run
# → http://localhost:5173
```

### 1.6. Seed Hesaplar

Tüm hesapların şifresi: `123456`

| Rol | E-posta |
|-----|---------|
| Admin | admin@ogret.io |
| Öğretmen | zeynep@ogret.io, mehmet@ogret.io, ayse@ogret.io, can@ogret.io |
| Öğrenci | ahmet@ogret.io, elif@ogret.io |

---

## 2. Tek Komutla Başlatma

```bash
# Tümünü başlat (altyapı + backend + frontend)
make dev
```

Bu komut altyapıyı başlatmaz; önce `make db-start` çalıştırın.

---

## 3. Test

```bash
# Tüm testler
make test

# Sadece backend testleri
make test-backend

# Sadece frontend E2E testleri
make test-frontend

# Playwright UI ile görsel test arayüzü
make test-frontend-ui
```

---

## 4. Build

```bash
# Frontend + backend build
make build

# Sadece frontend
make build-frontend

# Sadece backend
make build-backend
```

---

## 5. Docker ile Çalıştırma

### Geliştirme

```bash
# Tüm servisleri build et ve başlat
make docker-up

# Logları takip et
make docker-logs

# Durdur
make docker-down

# Volume'leri temizle (veri kaybı olur)
make clean-docker
```

### Production

```bash
# Production image'larını build et
make docker-prod-build

# Production stack'ini başlat
make docker-prod-up

# Durdur
make docker-prod-down
```

Production için `.env` dosyasında aşağıdaki değişkenler tanımlı olmalıdır:

```bash
DB_PASSWORD=<güçlü-şifre>
JWT_SECRET=<openssl rand -base64 32>
CORS_ORIGINS=https://ogret.io
MINIO_ROOT_USER=<minio-kullanıcı>
MINIO_ROOT_PASSWORD=<minio-şifre>
```

---

## 6. Veritabanı İşlemleri

### Migration Oluşturma

```bash
make migrate NAME=add_user_preferences
# → backend/src/main/resources/db/migration/V20260315120000__add_user_preferences.sql
```

### Migration'ları Çalıştırma

```bash
make migrate-run
```

### Veritabanını Sıfırlama

```bash
make db-reset
```

---

## 7. Proje Yapısı

```
ogret.io/
├── backend/                     # Spring Boot API
│   ├── src/main/java/           # Java kaynakları
│   ├── src/main/resources/      # Konfigürasyon + migration SQL
│   └── build.gradle             # Gradle build
├── src/                         # React frontend
│   ├── app/                     # React Router sayfaları
│   ├── components/              # Paylaşılan bileşenler
│   ├── hooks/                   # Custom React hooks
│   └── api/                     # API servis katmanı
├── public/                      # Statik dosyalar (robots.txt, sitemap)
├── docker-compose.yml           # Development stack
├── docker-compose.prod.yml      # Production stack
├── Dockerfile                   # Frontend Docker image
├── nginx.conf                   # Nginx reverse proxy
├── Makefile                     # Yardımcı komutlar
└── INSTALL.md                   # Bu dosya
```

---

## 8. Sık Karşılaşılan Sorunlar

### `pnpm install` başarısız oluyor

```bash
# Corepack'i etkinleştir
corepack enable
# veya pnpm'i global yükle
npm install -g pnpm
```

### Backend çalışmıyor, PostgreSQL bağlantı hatası

```bash
# Docker servislerini kontrol et
docker compose ps
# PostgreSQL log
docker compose logs postgres
```

### Frontend build hatası

```bash
# node_modules'ü temizle
rm -rf node_modules
pnpm install
```

### "Unterminated regular expression" hatası

JSX içinde `</main>` kullanıldığında esbuild bazen regex olarak yorumlar. Çözüm: `<div role="main">` kullanın.

---

## 9. Yardımcı Komutlar

```bash
make           # Tüm komutları listele
make status    # Servis durumunu göster
make clean     # Build artifaktlarını temizle
make pr        # GitHub PR oluştur (gh CLI gerekli)
```
