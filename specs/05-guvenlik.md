# Spec 05 — Güvenlik Açıkları Kapama

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 3 gün
**Bağımlılık:** Redis çalışıyor olmalı

---

## Amaç

Platformdaki güvenlik açıklarını kapatmak, kullanıcı verilerini korumak, brute force ve yetkisiz erişime karşı savunma mekanizmaları kurmak.

---

## Mevcut Durum

- Rate limiting: in-memory (dağıtıkta çalışmaz, Redis restart'ta sıfırlanır)
- CSRF koruması yok
- Brute force koruması yok
- JWT secret rotasyonu yok
- Hata mesajlarında stack trace sızması riski
- Input validasyonu yetersiz olabilir

---

## Yapılacaklar

### 1. Rate Limiting: In-Memory → Redis

- [ ] Mevcut `RateLimitingFilter.java`'ı Redis tabanlı yap
- [ ] Redis'a kayıt: `rate_limit:{ip}:{endpoint}` — TTL 1 dakika
- [ ] Limit: 100 istek/dakika/IP (genel), 10 istek/dakika (auth endpoint'leri)
- [ ] Redis Lua script ile atomik increment + TTL kontrolü

```java
// Örnek Redis Lua script
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])
local current = redis.call('INCR', key)
if current == 1 then
    redis.call('EXPIRE', key, ttl)
end
return current <= limit
```

- [ ] Rate limit aşıldığında `429 Too Many Requests` + `Retry-After` header
- [ ] Frontend'de 429 hatasını handle et (toast mesajı)

### 2. Brute Force Koruması

- [ ] Login başarısız deneme sayısı (Redis'te tut)
- [ ] 5 başarısız deneme → 15 dakika lockout
- [ ] 15 başarısız deneme → 1 saat lockout
- [ ] Lockout süresince `401` dön, `X-Retry-After` header ekle
- [ ] Başarılı login sonrası deneme sayısını sıfırla

```java
// Brute force kontrolü
String key = "bruteforce:" + email;
int attempts = redisTemplate.opsForValue().increment(key);
if (attempts == 1) redisTemplate.expire(key, 15, TimeUnit.MINUTES);
if (attempts > 5) throw new ApiException("Hesap geçici olarak kilitlendi", HttpStatus.TOO_MANY_REQUESTS);
```

### 3. JWT Blacklist & Refresh Token İptali

- [ ] Refresh token iptal edilebilir olmalı (logout ve şifre değiştirme)
- [ ] Blacklist Redis'te tut: `blacklist:jti:{tokenId}` — TTL = refresh token süresi
- [ ] Refresh token kullanımında blacklist kontrolü
- [ ] Access token kısa ömürlü (15dk), blacklist gerektirmez
- [ ] Şifre değiştirince tüm refresh token'ları iptal et

### 4. Hata Yönetimi Güçlendirme

- [ ] Production profile'da stack trace'leri gizle
- [ ] GlobalExceptionHandler'da prod/safemode kontrolü
- [ ] Hata mesajlarında kullanıcı bilgisi sızdırma (email var mı/yok mu gibi)
- [ ] Validasyon hatalarında hangi alanın hatalı olduğunu söyle, nedenini değil

```yaml
# application-prod.yml için
server:
  error:
    include-stacktrace: never
    include-message: never
```

### 5. Input Validasyonu Güçlendirme

- [ ] Tüm string input'larda XSS koruması (HTML tag filtreleme)
- [ ] SQL injection testi (JPA parameterized query kullanılıyor, teyit et)
- [ ] Dosya yükleme validasyonu:
  - [ ] İzin verilen MIME tipleri: JPEG, PNG, PDF (MAX 5MB)
  - [ ] Dosya adı temizleme (path traversal koruması)
  - [ ] İçerik tipi doğrulama (magic bytes)
- [ ] Email format validasyonu (regex)
- [ ] Telefon format validasyonu (+90 5XX XXX XX XX)

### 6. CORS Yapılandırması

- [ ] Production'da sadece izin verilen domainler (ogret.io, api.ogret.io)
- [ ] Geliştirmede `http://localhost:5173`
- [ ] Credentials: true (JWT header için)
- [ ] İzin verilen metodlar: GET, POST, PUT, DELETE, PATCH, OPTIONS
- [ ] İzin verilen headerlar: Authorization, Content-Type, X-Requested-With

### 7. WebSocket Güvenliği

- [ ] WebSocket bağlantısında JWT doğrulaması (mevcut)
- [ ] WebSocket mesajlarında yetkilendirme kontrolü
- [ ] Rate limiting: WebSocket'te mesaj gönderme limiti (10 mesaj/saniye/kullanıcı)

### 8. Oturum Yönetimi

- [ ] Password reset token: 1 saat geçerli, tek kullanımlık
- [ ] Email verification token: 24 saat geçerli
- [ ] Refresh token rotasyonu (her kullanımda yeni token)
- [ ] Concurrent session limit (isteğe bağlı)

---

## Kabul Kriterleri

- [ ] Redis rate limiting çalışıyor (100 istek/dk → 101. istekte 429)
- [ ] Brute force: 5 başarısız deneme sonrası hesap kilitleniyor
- [ ] Refresh token iptal edilebiliyor (logout sonrası kullanılamıyor)
- [ ] Hata mesajlarında stack trace görünmüyor (prod)
- [ ] XSS payload'ları kaydedilemiyor ve görüntülenemiyor
- [ ] Dosya yükleme: izin verilmeyen format reddediliyor
- [ ] CORS: izin verilmeyen domain'den istek gelmiyor

---

## Test

- [ ] Rate limiting test (30 saniyede 50+ istek)
- [ ] Brute force test (5 yanlış şifre → kilit, 1 doğru → açılma)
- [ ] Token blacklist test (logout sonrası refresh denemesi)
- [ ] XSS testi (`<script>alert(1)</script>` input'ta)
- [ ] SQL injection testi (`' OR 1=1 --`)
- [ ] Dosya yükleme testi (PHP shell, exe, vb. engellenmeli)
- [ ] CORS testi (farklı origin'den fetch)
