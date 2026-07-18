# Geliştirme Rehberi

## Testler

**Backend (JUnit):**
```bash
cd backend
./gradlew test                         # Tüm testler (33 adet)
./gradlew test --tests "*TutorControllerTest*"   # Tek test class'ı
```

**Frontend (Playwright E2E):**
```bash
npm run test:e2e                       # Tüm E2E testleri
npm run test:e2e:ui                    # Görsel arayüz
npx playwright show-report             # Rapor görüntüle
```

## Backend Geliştirme

### Yeni Migration

```bash
# src/main/resources/db/migration/V{next}__{description}.sql
```

Migration'lar `flyway.locations=classpath:db/migration` altında otomatik çalışır.

### Yeni Entity

1. `model/entity/` içinde entity oluştur
2. `repository/` içinde repository oluştur
3. Gerekirse migration yaz
4. Service + Controller katmanlarını ekle

### Response DTO Kuralları

- Boolean field'lar `is` prefix'siz JSON'da görünür: `isVerified → verified`, `isOnline → online`
- BigDecimal JSON'da number olarak serialize edilir
- `fromEntity()` static factory method'u ile entity → DTO dönüşümü

### Security

- `SecurityConfig.java` endpoint bazında rol kontrolü yapar
- JWT token'lar 15dk access + 7 gün refresh
- Şifreler BCrypt ile hash'lenir
- Public endpoint'ler: `/auth/**`, `/tutors/**` (GET), `/subjects/**`, `/ws/**`

## Frontend Geliştirme

### Kod Konvansiyonları

- State yönetimi: Context (Auth, Modal) — Redux/ Zustand yok
- API çağrıları: `src/app/api/services.ts` içinde tanımlı fonksiyonlar
- HTTP client: `src/app/api/client.ts` (Axios, 401 interceptor)
- Routing: `react-router` v7+
- Styling: Tailwind CSS v4 utility class'ları
- UI kütüphanesi: shadcn/ui (`src/app/components/ui/`)
- Icon: lucide-react

### Yeni Sayfa Ekleme

1. `src/app/pages/` içinde component oluştur
2. `src/App.tsx` içinde route ekle
3. Gerekirse API fonksiyonunu `services.ts`'e ekle

### Önemli Tipler

```typescript
// Başlıca tipler services.ts içinde:
UserResponse        — kullanıcı profili (tutor detayı dahil)
TutorSummaryResponse — öğretmen kartı (liste görünümü)
LessonResponse      — ders kaydı
MessageResponse     — mesaj (REST + WebSocket ortak)
ReviewResponse      — yorum
SubjectResponse     — ders konusu
SubscriptionResponse — abonelik
AuthUser            — login state (AuthProvider)
```

### WebSocket

`useWebSocket` hook'u ile kullanılır. STOMP üzerinden Vite proxy'ye bağlanır.

```typescript
const { connected, incoming, sendMessage } = useWebSocket();

// Mesaj gönder
sendMessage(receiverId, "Merhaba!");

// Gelen mesajlar
useEffect(() => {
  incoming.forEach(msg => console.log(msg));
}, [incoming]);
```

## Docker

Tüm geliştirme ortamı için `.env` veya token gerekmez:

```bash
# Frontend + backend + PostgreSQL + Redis + MinIO
docker compose up --build

# Arka planda çalıştır ve durumunu kontrol et
docker compose up --build -d
docker compose ps

# Logları izle
docker compose logs -f backend frontend

# Container'ları durdur
docker compose down
```

- Uygulama: http://localhost:3000
- Swagger: http://localhost:3000/api/v1/swagger-ui.html

Veritabanı, Redis, MinIO ve backend host portlarına açılmaz; frontend aynı origin
üzerinden API, WebSocket ve dosya depolamaya proxy olur.

Yerel ortam `dev` profilini kullanır. E-posta gönderimi kapalıdır; kayıt ve
eşleşme e-posta doğrulaması olmadan çalışır. Şifremi unuttum çağrısı kullanılamayan
bir sıfırlama token'ı üretmez ve kullanıcıyı adminin geçici şifre akışına yönlendirir.
Production profilinde de e-posta opsiyoneldir; etkinleştirilirse doğrulanmış gönderici
zorunludur. Güçlü secret, HTTPS adresleri ve güvenli depolama ayarları production'da
zorunlu kalır.

Hazır hesaplar:

| Rol | E-posta |
|-----|---------|
| Admin | admin@ogret.io |
| Öğretmen | zeynep@ogret.io |
| Öğrenci | ahmet@ogret.io |

İlk çalıştırmada üretilen şifreleri `docker compose exec backend
show-bootstrap-credentials` komutu gösterir. Şifreler ve JWT anahtarı kalıcı Docker
volume'ünde tutulur; restart sırasında hesap şifreleri sıfırlanmaz.

Öğretmen hesabında örnek matematik ilanı ve hafta içi 09:00–18:00 uygunluk
takvimi bulunur. Seed yalnızca `dev` profilinde çalışır.

## Yapılandırma

### Vite Proxy (vite.config.ts)

```typescript
server: {
  proxy: {
    "/api": "http://localhost:8080",
    "/ws": { target: "ws://localhost:8080", ws: true }
  }
}
```

Tüm frontend API istekleri `/api` prefix'i ile proxylenir. WebSocket `/ws` üzerinden bağlanır.

## Debugging

### Backend log
```bash
tail -f /tmp/backend.log
```

### Frontend log
```bash
tail -f /tmp/frontend.log
```

### H2 Console (test profili)
http://localhost:8080/h2-console (sadece test profilinde aktif)

## Bilinen Sınırlamalar

- Frontend JS bundle ~762 kB (chunk warning, dynamic import ile iyileştirilebilir)
- Test coverage sadece controller seviyesinde (service/ repository testleri yok)
- SMS (Twilio) entegrasyonu yerel ortamda devre dışıdır
- E-posta yerel ortamda no-op çalışır; gerçek gönderim için production SES kurulumu gerekir
- Ödeme entegrasyonu yok
- Rate limiting in-memory (Redis tabanlı değil, restart'ta sıfırlanır)
- WebSocket, load balancer altında sticky session gerektirir
