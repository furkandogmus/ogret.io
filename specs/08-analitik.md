# Spec 08 — Analitik & Kullanıcı Takibi

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 2 gün
**Bağımlılık:** Docker Compose (PostgreSQL + Redis)

---

## Amaç

Kullanıcı davranışlarını takip etmek, dönüşüm hunilerini analiz etmek, veri odaklı kararlar almak. PostHog self-hosted kullanılacak.

---

## Seçim: PostHog (Self-Hosted)

| Kriter | PostHog | Google Analytics | Matomo |
|--------|---------|-----------------|--------|
| KVKK uyumlu (self-hosted) | ✅ | ❌ (ABD sunucu) | ✅ |
| Event tracking | ✅ | ✅ | ✅ |
| Funnel analysis | ✅ | ✅ | ✅ |
| Session recording | ✅ | ❌ | ✅ |
| Feature flags | ✅ | ❌ | ❌ |
| A/B testing | ✅ | ✅ | ❌ |
| Fiyat (self-hosted) | Ücretsiz (1M event/ay) | Ücretsiz | Ücretsiz |
| Kurulum kolaylığı | Docker Compose | Embed script | Docker |

**Karar:** PostHog self-hosted (KVKK uyumu, feature flag, session recording)

---

## Yapılacaklar

### 1. PostHog Kurulumu (Docker)

- [ ] `docker-compose.yml`'a PostHog servisi ekle

```yaml
posthog:
  image: posthog/posthog:latest
  depends_on:
    - postgres
    - redis
  environment:
    - DATABASE_URL=postgres://...
    - REDIS_URL=redis://...
  ports:
    - "8000:8000"
  volumes:
    - posthog_data:/var/lib/postgresql/data
```

- [ ] Environment variable: `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_HOST`
- [ ] Frontend'de PostHog init

```tsx
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    person_profiles: 'identified_only',
  });
}
```

### 2. Backend Event Tracking

- [ ] Backend'de de PostHog client (analitik endpoint'i)

```java
// EventService.java
@Service
public class AnalyticsService {
    public void track(UUID userId, String event, Map<String, Object> properties) {
        PostHog posthog = new PostHog(System.getenv("POSTHOG_API_KEY"));
        posthog.capture(userId.toString(), event, properties);
    }
}
```

### 3. Frontend Event Tracking

#### Kullanıcı Events

| Event | Tetikleyici | Properties |
|-------|-------------|------------|
| `page_view` | Sayfa değişimi | path, title, referrer |
| `user_registered` | Kayıt tamamlandı | role (student/tutor) |
| `user_logged_in` | Giriş yapıldı | - |
| `search_performed` | Arama yapıldı | query, filters, result_count |
| `tutor_profile_viewed` | Profil görüntülendi | tutor_id, subject |
| `lesson_requested` | Ders talebi gönderildi | tutor_id, subject, duration |
| `lesson_confirmed` | Ders onaylandı | lesson_id |
| `lesson_cancelled` | Ders iptal edildi | reason |
| `lesson_completed` | Ders tamamlandı | lesson_id |
| `review_submitted` | Yorum yapıldı | rating |
| `favorite_added` | Favori eklendi | tutor_id |
| `favorite_removed` | Favori çıkarıldı | tutor_id |
| `message_sent` | Mesaj gönderildi | receiver_id |
| `subscription_started` | Abonelik başlatıldı | plan |
| `subscription_cancelled` | Abonelik iptal | plan |
| `profile_completed` | Profil tamamlandı | completion_percentage |

### 4. Dönüşüm Hunileri (Funnels)

#### Öğrenci Hunisi
```
Kayıt → Aramas Yap → Profil Görüntüle → Ders Talep Et → Ders Onaylansın → Ders Tamamlansın → Yorum Bırak
```

#### Öğretmen Hunisi
```
Kayıt → Profil Oluştur → Kimlik Doğrula → İlan Oluştur → İlk Ders Talebini Al → Talebi Onayla → Dersi Tamamla
```

### 5. Dashboard & Raporlar

- [ ] PostHog dashboard'da:
  - [ ] Günlük aktif kullanıcı (DAU)
  - [ ] Kayıt/dönüşüm grafiği
  - [ ] En çok aranan konular
  - [ ] En çok görüntülenen tutor'lar
  - [ ] Ders tamamlama oranı
  - [ ] İptal sebepleri dağılımı
- [ ] Haftalık email raporu (opsiyonel)

### 6. Feature Flags

- [ ] PostHog feature flag'leri ile:

```tsx
if (posthog.isFeatureEnabled('new-tutor-onboarding')) {
  return <NewOnboardingWizard />;
} else {
  return <OldDashboard />;
}
```

- [ ] Planlanan feature flag'ler:
  - `new-tutor-onboarding`: Yeni onboarding akışı
  - `blog-enabled`: Blog sayfası gösterimi
  - `new-search`: Gelişmiş arama UI'ı
  - `dark-mode-default`: Varsayılan dark mode

### 7. Session Recording

- [ ] PostHog session recording (opsiyonel, KVKK onayı ile)
- [ ] Kullanıcı onayı al (cookie banner ile)
- [ ] Hassas alanları maskele (şifre, kart bilgisi)

### 8. KVKK Uyumlu Tracking

- [ ] Kullanıcı onayı olmadan tracking yapma
- [ ] Anonimleştirilmiş IP (last octet mask)
- [ ] Cookie banner ile tracking onayı al
- [ ] Kullanıcı veri silme talebi desteği (PostHog'da user deletion)

---

## Kabul Kriterleri

- [ ] PostHog Docker'da çalışıyor, event'ler görünüyor
- [ ] Tüm critical events (page_view, search, lesson_request, vs.) kaydediliyor
- [ ] Öğrenci dönüşüm hunisi görselleştirilebiliyor
- [ ] Feature flag'ler çalışıyor (kodda toggle açılıp kapanabiliyor)
- [ ] KVKK onay mekanizması çalışıyor (onay vermeyen kullanıcı takip edilmiyor)
- [ ] Session recording çalışıyor (hassas alanlar maskeleniyor)

---

## Test

- [ ] Event tracking testi (her event doğru property'lerle geliyor)
- [ ] Funnel testi (belirlenen adımlar takip edilebiliyor)
- [ ] Feature flag testi (flag açık/kapalı çalışıyor)
- [ ] KVKK onay testi (onay yok → event yok)
- [ ] Session recording testi (maskeleme çalışıyor)
- [ ] Performans testi (PostHog'un yüksek event hacminde etkisi)
